<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use App\Models\ProviderProfile;
use App\Models\User;
use Google\Client as GoogleClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** Pièces de candidature : images et PDF uniquement (jamais de HTML ni de SVG). */
    private const ALLOWED_DOC_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    public function register(Request $request): JsonResponse
    {
        $isProvider = ($request->input('role') ?? 'client') === 'prestataire';
        $req = $isProvider ? 'required' : 'nullable';

        $data = $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:72'],
            'fullName' => ['required', 'string', 'max:255'],
            'phone' => [$isProvider ? 'required' : 'nullable', 'string', 'max:50'],
            'commune' => [$isProvider ? 'required' : 'nullable', 'string', 'max:120'],
            'address' => [$req, 'string', 'max:500'],
            'role' => ['sometimes', Rule::in(['client', 'prestataire'])],
            'domain' => [$req, 'string', 'max:120'],
            'metier' => [$req, 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'lastName' => [$req, 'string', 'max:120'],
            'middleName' => [$req, 'string', 'max:120'],
            'firstName' => [$req, 'string', 'max:120'],
            'maritalStatus' => [$req, 'string', 'max:32'],
            'birthPlace' => [$req, 'string', 'max:255'],
            'birthDate' => [$req, 'date', 'before:today'],
            'religion' => [$req, 'string', 'max:64'],
            'idType' => [$req, 'string', 'max:32'],
            'idIssuedAt' => [$req, 'date'],
            'idExpiresAt' => [$req, 'date', 'after_or_equal:idIssuedAt'],
            'emergencyName' => [$req, 'string', 'max:255'],
            'emergencyPhone' => [$req, 'string', 'max:50'],
            'emergencyRelation' => [$req, 'string', 'max:32'],
            'documents' => [$req, 'array'],
            'documents.photo' => [$req, 'array'],
            'documents.photo.name' => [$req, 'string', 'max:255'],
            'documents.photo.mime' => [$req, 'string', Rule::in(self::ALLOWED_DOC_MIMES)],
            'documents.photo.dataUrl' => [$req, 'string', 'max:6000000', 'regex:/^data:(image\/(jpeg|png|webp)|application\/pdf);base64,[A-Za-z0-9+\/=\s]+$/'],
            'documents.identity' => [$req, 'array'],
            'documents.identity.name' => [$req, 'string', 'max:255'],
            'documents.identity.mime' => [$req, 'string', Rule::in(self::ALLOWED_DOC_MIMES)],
            'documents.identity.dataUrl' => [$req, 'string', 'max:6000000', 'regex:/^data:(image\/(jpeg|png|webp)|application\/pdf);base64,[A-Za-z0-9+\/=\s]+$/'],
            'documents.cv' => [$req, 'array'],
            'documents.cv.name' => [$req, 'string', 'max:255'],
            'documents.cv.mime' => [$req, 'string', Rule::in(self::ALLOWED_DOC_MIMES)],
            'documents.cv.dataUrl' => [$req, 'string', 'max:6000000', 'regex:/^data:(image\/(jpeg|png|webp)|application\/pdf);base64,[A-Za-z0-9+\/=\s]+$/'],
            'documents.motivationLetter' => [$req, 'array'],
            'documents.motivationLetter.name' => [$req, 'string', 'max:255'],
            'documents.motivationLetter.mime' => [$req, 'string', Rule::in(self::ALLOWED_DOC_MIMES)],
            'documents.motivationLetter.dataUrl' => [$req, 'string', 'max:6000000', 'regex:/^data:(image\/(jpeg|png|webp)|application\/pdf);base64,[A-Za-z0-9+\/=\s]+$/'],
        ], [
            'email.unique' => 'Un compte existe déjà avec cet e-mail. Connectez-vous ou utilisez une autre adresse.',
            'email.email' => 'Indiquez une adresse e-mail valide.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'fullName.required' => 'Le nom complet est obligatoire.',
            'role.in' => 'Le type de compte est invalide.',
            'birthDate.before' => 'La date de naissance doit être dans le passé.',
            'idExpiresAt.after_or_equal' => 'La date d’expiration doit être après la délivrance.',
            'documents.required' => 'Tous les documents sont obligatoires.',
            'documents.photo.required' => 'La photo est obligatoire.',
            'documents.identity.required' => 'La pièce d’identité est obligatoire.',
            'documents.cv.required' => 'Le CV est obligatoire.',
            'documents.motivationLetter.required' => 'La lettre de motivation est obligatoire.',
            'documents.*.mime.in' => 'Format de fichier non accepté : JPG, PNG, WebP ou PDF uniquement.',
            'documents.*.dataUrl.regex' => 'Fichier invalide : JPG, PNG, WebP ou PDF uniquement.',
            'password.max' => 'Le mot de passe ne peut pas dépasser 72 caractères.',
        ]);

        $role = $data['role'] ?? 'client';

        $user = User::create([
            'email' => strtolower($data['email']),
            'password' => $data['password'],
            'full_name' => $data['fullName'],
            'phone' => $data['phone'] ?? '',
            'commune' => $data['commune'] ?? '',
            'address' => $data['address'] ?? '',
            'role' => $role,
        ]);

        if ($role === 'prestataire') {
            $last = trim((string) ($data['lastName'] ?? ''));
            $middle = trim((string) ($data['middleName'] ?? ''));
            $first = trim((string) ($data['firstName'] ?? ''));
            $initials = mb_strtoupper(
                mb_substr($first !== '' ? $first : $data['fullName'], 0, 1).
                mb_substr($last !== '' ? $last : $data['fullName'], 0, 1)
            );

            ProviderProfile::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'domain' => $data['domain'] ?? '',
                'metier' => $data['metier'] ?? '',
                'last_name' => $last,
                'middle_name' => $middle,
                'first_name' => $first,
                'initials' => $initials,
                'marital_status' => $data['maritalStatus'] ?? '',
                'birth_place' => $data['birthPlace'] ?? '',
                'birth_date' => $data['birthDate'] ?? null,
                'religion' => $data['religion'] ?? '',
                'id_type' => $data['idType'] ?? '',
                'id_issued_at' => $data['idIssuedAt'] ?? null,
                'id_expires_at' => $data['idExpiresAt'] ?? null,
                'emergency_name' => $data['emergencyName'] ?? '',
                'emergency_phone' => $data['emergencyPhone'] ?? '',
                'emergency_relation' => $data['emergencyRelation'] ?? '',
                'bio' => $data['bio'] ?? null,
                'application_documents' => $data['documents'] ?? null,
                'zones' => filled($data['commune'] ?? null) ? [$data['commune']] : [],
            ]);
        }

        $user->load('providerProfile');
        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->toPublicArray(),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower($data['email']))->first();

        if (! $user || ! $user->password || ! Hash::check($data['password'], $user->password)) {
            LoginLog::create([
                'user_id' => $user?->id,
                'email' => strtolower($data['email']),
                'role' => $user?->role,
                'success' => false,
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 1000),
                'method' => 'password',
            ]);

            throw ValidationException::withMessages([
                'email' => ['E-mail ou mot de passe incorrect.'],
            ]);
        }

        $user->load('providerProfile');
        $token = $user->createToken('spa')->plainTextToken;

        LoginLog::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'success' => true,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
            'method' => 'password',
        ]);

        return response()->json([
            'token' => $token,
            'user' => $user->toPublicArray(),
        ]);
    }

    public function google(Request $request): JsonResponse
    {
        $clientId = config('services.google.client_id');
        if (! $clientId) {
            return response()->json(['error' => "La connexion Google n'est pas configurée."], 503);
        }

        $data = $request->validate([
            'credential' => ['required', 'string'],
        ]);

        $client = new GoogleClient(['client_id' => $clientId]);
        $payload = $client->verifyIdToken($data['credential']);

        if (! $payload || empty($payload['sub']) || empty($payload['email'])) {
            return response()->json(['error' => 'Jeton Google invalide.'], 401);
        }

        // Sans adresse vérifiée par Google, rattacher un compte existant par
        // e-mail permettrait d'en prendre le contrôle.
        if (($payload['email_verified'] ?? false) !== true && ($payload['email_verified'] ?? '') !== 'true') {
            return response()->json(['error' => 'Adresse e-mail Google non vérifiée.'], 401);
        }

        $googleId = $payload['sub'];
        $email = strtolower($payload['email']);
        $fullName = trim($payload['name'] ?? explode('@', $email)[0] ?: 'Utilisateur');

        $user = User::where('google_id', $googleId)->orWhere('email', $email)->first();

        if ($user && $user->google_id && $user->google_id !== $googleId) {
            return response()->json(['error' => 'Ce compte est lié à un autre profil Google.'], 409);
        }

        if ($user) {
            if (! $user->google_id) {
                $user->google_id = $googleId;
                $user->save();
            }
        } else {
            $user = User::create([
                'email' => $email,
                'google_id' => $googleId,
                'full_name' => $fullName,
                'role' => 'client',
            ]);
        }

        $user->load('providerProfile');
        $token = $user->createToken('spa')->plainTextToken;

        LoginLog::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'success' => true,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
            'method' => 'google',
        ]);

        return response()->json([
            'token' => $token,
            'user' => $user->toPublicArray(),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('providerProfile');

        return response()->json(['user' => $user->toPublicArray()]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['ok' => true]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'fullName' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'commune' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $user->update([
            'full_name' => $data['fullName'],
            'phone' => $data['phone'] ?? '',
            'commune' => $data['commune'] ?? '',
            'address' => $data['address'] ?? '',
        ]);
        $user->load('providerProfile');

        return response()->json(['user' => $user->toPublicArray()]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->password) {
            return response()->json([
                'error' => 'Ce compte utilise Google. Aucun mot de passe à modifier.',
            ], 400);
        }

        $data = $request->validate([
            'currentPassword' => ['required', 'string'],
            'newPassword' => ['required', 'string', 'min:8', 'max:72', 'different:currentPassword'],
            'confirmPassword' => ['required', 'same:newPassword'],
        ]);

        if (! Hash::check($data['currentPassword'], $user->password)) {
            return response()->json(['error' => 'Mot de passe actuel incorrect.'], 400);
        }

        $user->password = $data['newPassword'];
        $user->save();

        // Un mot de passe changé ferme toutes les autres sessions ouvertes.
        $currentId = $user->currentAccessToken()?->id;
        $user->tokens()->when($currentId, fn ($q) => $q->where('id', '!=', $currentId))->delete();

        return response()->json(['ok' => true]);
    }
}
