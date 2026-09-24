<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Appointment;
use App\Models\ClientFavorite;
use App\Models\LoginLog;
use App\Models\Message;
use App\Models\Order;
use App\Models\OrderTrip;
use App\Models\OrderTripPoint;
use App\Models\Payment;
use App\Models\ProviderProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SuperAdminController extends Controller
{
    private const PURGE_CONFIRMATION = 'SUPPRIMER TOUT';

    /** Tables métier exportées / purgées (ordre de purge : enfants → parents). */
    private const DATA_TABLES = [
        'order_trip_points',
        'order_trips',
        'payments',
        'messages',
        'notifications',
        'client_favorites',
        'orders',
        'provider_profiles',
        'appointments',
        'mission_notes',
        'login_logs',
        'service_tariffs',
        'users',
    ];

    public function users(): JsonResponse
    {
        $items = User::query()
            ->latest()
            ->get()
            ->map(fn (User $u) => $this->serializeUser($u));

        return response()->json(['items' => $items]);
    }

    public function createUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fullName' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['client', 'prestataire', 'admin'])],
            'isSuperAdmin' => ['sometimes', 'boolean'],
            'phone' => ['nullable', 'string', 'max:50'],
            'commune' => ['nullable', 'string', 'max:120'],
        ], [
            'email.unique' => 'Un compte existe déjà avec cet e-mail.',
            'email.email' => 'Indiquez une adresse e-mail valide.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'fullName.required' => 'Le nom complet est obligatoire.',
            'role.required' => 'Le rôle est obligatoire.',
            'role.in' => 'Le rôle est invalide.',
        ]);

        $role = $data['role'];
        $isSuperAdmin = $role === 'admin' && (bool) ($data['isSuperAdmin'] ?? false);

        $user = User::create([
            'full_name' => $data['fullName'],
            'email' => strtolower($data['email']),
            'password' => $data['password'],
            'role' => $role,
            'is_super_admin' => $isSuperAdmin,
            'phone' => $data['phone'] ?? '',
            'commune' => $data['commune'] ?? '',
        ]);

        if ($role === 'prestataire') {
            $parts = preg_split('/\s+/', trim($data['fullName']), 2) ?: [];
            $first = $parts[0] ?? $data['fullName'];
            $last = $parts[1] ?? '';
            $initials = mb_strtoupper(
                mb_substr($first, 0, 1).mb_substr($last !== '' ? $last : $first, 0, 1)
            );

            ProviderProfile::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'first_name' => $first,
                'last_name' => $last,
                'initials' => $initials,
                'zones' => filled($data['commune'] ?? null) ? [$data['commune']] : [],
            ]);
        }

        return response()->json(['item' => $this->serializeUser($user->fresh())], 201);
    }

    public function updateUser(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'role' => ['sometimes', Rule::in(['client', 'prestataire', 'admin'])],
            'isSuperAdmin' => ['sometimes', 'boolean'],
            'fullName' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
        ]);

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id && array_key_exists('isSuperAdmin', $data) && ! $data['isSuperAdmin']) {
            return response()->json(['error' => 'Vous ne pouvez pas retirer votre propre statut super-admin.'], 422);
        }

        if (isset($data['role'])) {
            $user->role = $data['role'];
            if ($data['role'] !== 'admin') {
                $user->is_super_admin = false;
            }
        }
        if (array_key_exists('isSuperAdmin', $data) && ($user->role === 'admin' || ($data['role'] ?? null) === 'admin')) {
            $user->is_super_admin = (bool) $data['isSuperAdmin'];
        }
        if (isset($data['fullName'])) {
            $user->full_name = $data['fullName'];
        }
        if (array_key_exists('phone', $data)) {
            $user->phone = $data['phone'] ?? '';
        }
        $user->save();

        return response()->json(['item' => $this->serializeUser($user->fresh())]);
    }

    public function deleteUser(Request $request, int $id): JsonResponse
    {
        $actor = $request->user();
        $user = User::findOrFail($id);

        if ($user->id === $actor->id) {
            return response()->json(['error' => 'Vous ne pouvez pas supprimer votre propre compte.'], 422);
        }

        if ($user->is_super_admin) {
            $otherSuperAdmins = User::query()
                ->where('is_super_admin', true)
                ->where('id', '!=', $user->id)
                ->count();

            if ($otherSuperAdmins < 1) {
                return response()->json(['error' => 'Impossible de supprimer le dernier super-admin.'], 422);
            }
        }

        $snapshot = $this->serializeUser($user);

        DB::transaction(function () use ($user) {
            if (Schema::hasTable('personal_access_tokens')) {
                DB::table('personal_access_tokens')
                    ->where('tokenable_type', User::class)
                    ->where('tokenable_id', $user->id)
                    ->delete();
            }

            $user->delete();
        });

        return response()->json(['ok' => true, 'item' => $snapshot]);
    }

    public function loginJournal(): JsonResponse
    {
        $items = LoginLog::with('user')
            ->latest()
            ->limit(200)
            ->get()
            ->map(fn (LoginLog $log) => [
                'id' => $log->id,
                'email' => $log->email,
                'role' => $log->role,
                'success' => $log->success,
                'ipAddress' => $log->ip_address,
                'userAgent' => $log->user_agent,
                'method' => $log->method,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'fullName' => $log->user->full_name,
                ] : null,
                'createdAt' => $log->created_at?->toIso8601String(),
            ]);

        return response()->json(['items' => $items]);
    }

    public function accounting(): JsonResponse
    {
        $byMethod = Payment::query()
            ->where('status', 'paye')
            ->selectRaw('method, count(*) as total, coalesce(sum(amount),0) as amount')
            ->groupBy('method')
            ->get()
            ->map(fn ($row) => [
                'method' => $row->method ?: 'autre',
                'count' => (int) $row->total,
                'amount' => (int) $row->amount,
            ]);

        $byMonth = Payment::where('status', 'paye')
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->get()
            ->groupBy(fn (Payment $p) => $p->created_at?->format('Y-m') ?: '—')
            ->map(fn ($group, $month) => [
                'month' => $month,
                'count' => $group->count(),
                'amount' => (int) $group->sum('amount'),
            ])
            ->sortKeys()
            ->values();

        $recent = Payment::with(['client', 'order'])
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn (Payment $p) => [
                'id' => $p->id,
                'reference' => $p->reference,
                'amount' => (int) $p->amount,
                'method' => $p->method,
                'status' => $p->status,
                'orderReference' => $p->order?->reference,
                'client' => $p->client?->full_name,
                'createdAt' => $p->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'summary' => [
                'revenue' => (int) Payment::where('status', 'paye')->sum('amount'),
                'paidCount' => (int) Payment::where('status', 'paye')->count(),
                'pendingAmount' => (int) Payment::where('status', 'en_attente')->sum('amount'),
                'pendingCount' => (int) Payment::where('status', 'en_attente')->count(),
                'ordersTotal' => Order::count(),
                'avgTicket' => (int) round(Payment::where('status', 'paye')->avg('amount') ?? 0),
            ],
            'byMethod' => $byMethod,
            'byMonth' => $byMonth,
            'recent' => $recent,
        ]);
    }

    public function statistics(): JsonResponse
    {
        $usersByRole = User::query()
            ->selectRaw('role, count(*) as total')
            ->groupBy('role')
            ->pluck('total', 'role');

        $providersByStatus = ProviderProfile::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $ordersByStatus = Order::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $logins7d = LoginLog::where('success', true)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $failedLogins7d = LoginLog::where('success', false)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $newUsers7d = User::where('created_at', '>=', now()->subDays(7))->count();
        $newOrders7d = Order::where('created_at', '>=', now()->subDays(7))->count();

        return response()->json([
            'kpis' => [
                ['label' => 'Utilisateurs', 'value' => User::count()],
                ['label' => 'Nouveaux (7 j)', 'value' => $newUsers7d],
                ['label' => 'Commandes (7 j)', 'value' => $newOrders7d],
                ['label' => 'Connexions OK (7 j)', 'value' => $logins7d],
                ['label' => 'Échecs login (7 j)', 'value' => $failedLogins7d],
                ['label' => 'CA encaissé', 'value' => (int) Payment::where('status', 'paye')->sum('amount')],
            ],
            'usersByRole' => $usersByRole,
            'providersByStatus' => $providersByStatus,
            'ordersByStatus' => $ordersByStatus,
        ]);
    }

    public function dataOverview(): JsonResponse
    {
        $counts = [];
        foreach (self::DATA_TABLES as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            $counts[$table] = (int) DB::table($table)->count();
        }

        return response()->json([
            'counts' => $counts,
            'totalRows' => array_sum($counts),
            'purgeConfirmation' => self::PURGE_CONFIRMATION,
        ]);
    }

    public function exportBackup(Request $request): StreamedResponse
    {
        $actor = $request->user();
        $exportedAt = now()->toIso8601String();
        $filename = 'saacare-backup-'.now()->format('Ymd-His').'.json';

        $tables = [];
        foreach (self::DATA_TABLES as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            $tables[$table] = DB::table($table)->orderBy('id')->get()->map(fn ($row) => (array) $row)->all();
        }

        $payload = [
            'meta' => [
                'app' => 'SaaCare',
                'version' => 1,
                'exportedAt' => $exportedAt,
                'exportedBy' => [
                    'id' => $actor->id,
                    'email' => $actor->email,
                    'fullName' => $actor->full_name,
                ],
                'tables' => array_map(fn ($rows) => count($rows), $tables),
            ],
            'tables' => $tables,
        ];

        $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

        return response()->streamDownload(function () use ($json) {
            echo $json;
        }, $filename, [
            'Content-Type' => 'application/json; charset=UTF-8',
        ]);
    }

    public function purgeAll(Request $request): JsonResponse
    {
        $data = $request->validate([
            'confirmation' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (trim($data['confirmation']) !== self::PURGE_CONFIRMATION) {
            return response()->json([
                'error' => 'Confirmation incorrecte. Saisissez exactement : '.self::PURGE_CONFIRMATION,
            ], 422);
        }

        $actor = $request->user();
        if (! Hash::check($data['password'], $actor->password)) {
            return response()->json(['error' => 'Mot de passe incorrect.'], 422);
        }

        $deleted = [];

        DB::transaction(function () use ($actor, &$deleted) {
            // Ordre enfant → parent pour respecter les FK.
            $deleted['order_trip_points'] = OrderTripPoint::query()->delete();
            $deleted['order_trips'] = OrderTrip::query()->delete();
            if (Schema::hasTable('mission_notes')) {
                $deleted['mission_notes'] = DB::table('mission_notes')->delete();
            }
            $deleted['payments'] = Payment::query()->delete();
            $deleted['messages'] = Message::query()->delete();
            $deleted['notifications'] = AppNotification::query()->delete();
            $deleted['client_favorites'] = ClientFavorite::query()->delete();
            $deleted['orders'] = Order::query()->delete();
            $deleted['provider_profiles'] = ProviderProfile::query()->delete();
            $deleted['appointments'] = Appointment::query()->delete();
            $deleted['login_logs'] = LoginLog::query()->delete();

            if (Schema::hasTable('personal_access_tokens')) {
                $deleted['personal_access_tokens'] = DB::table('personal_access_tokens')
                    ->where(function ($q) use ($actor) {
                        $q->where('tokenable_type', '!=', User::class)
                            ->orWhere('tokenable_id', '!=', $actor->id);
                    })
                    ->delete();
            }

            if (Schema::hasTable('sessions')) {
                $deleted['sessions'] = DB::table('sessions')->delete();
            }
            if (Schema::hasTable('password_reset_tokens')) {
                $deleted['password_reset_tokens'] = DB::table('password_reset_tokens')->delete();
            }

            // Conserve le super-admin connecté pour qu'il reste opérationnel.
            $deleted['users'] = User::query()->where('id', '!=', $actor->id)->delete();
        });

        return response()->json([
            'ok' => true,
            'message' => 'Toutes les données ont été supprimées. Votre compte super-admin a été conservé.',
            'deleted' => $deleted,
            'retainedUser' => $this->serializeUser($actor->fresh()),
        ]);
    }

    private function serializeUser(User $u): array
    {
        return [
            'id' => $u->id,
            'fullName' => $u->full_name,
            'email' => $u->email,
            'phone' => $u->phone ?? '',
            'commune' => $u->commune ?? '',
            'role' => $u->role,
            'isSuperAdmin' => (bool) $u->is_super_admin,
            'createdAt' => $u->created_at?->toIso8601String(),
        ];
    }
}
