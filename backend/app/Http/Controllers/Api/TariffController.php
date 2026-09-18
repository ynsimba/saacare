<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceTariff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TariffController extends Controller
{
    /** Unités de facturation utilisées dans la grille. */
    public const UNITS = [
        'heure',
        'journee',
        'nuit',
        'semaine',
        'mois',
        'seance',
        'forfait',
        'trimestre',
        'autre',
    ];

    public const DOMAINS = [
        'kids-care',
        'wale',
        'home',
        'driver',
        'tutora',
        'assist',
        'academy',
    ];

    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'domain' => ['nullable', 'string', Rule::in(self::DOMAINS)],
            'active' => ['nullable', 'boolean'],
        ]);

        $query = ServiceTariff::query()
            ->orderBy('domain')
            ->orderBy('sort_order')
            ->orderBy('service_name');

        if (! empty($data['domain'])) {
            $query->where('domain', $data['domain']);
        }
        if (array_key_exists('active', $data) && $data['active'] !== null) {
            $query->where('is_active', (bool) $data['active']);
        }

        $items = $query->limit(1000)->get()->map(fn (ServiceTariff $t) => $t->toAdminArray());

        return response()->json([
            'items' => $items,
            'meta' => [
                'domains' => self::DOMAINS,
                'units' => self::UNITS,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $tariff = ServiceTariff::create($this->toAttributes($data));

        return response()->json(['item' => $tariff->toAdminArray()], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tariff = ServiceTariff::findOrFail($id);
        $data = $this->validated($request, partial: true);
        $tariff->fill($this->toAttributes($data, partial: true));
        $tariff->save();

        return response()->json(['item' => $tariff->fresh()->toAdminArray()]);
    }

    public function destroy(int $id): JsonResponse
    {
        ServiceTariff::findOrFail($id)->delete();

        return response()->json(['ok' => true]);
    }

    /** Préremplit la grille à partir du catalogue des pôles (sans écraser les montants déjà saisis). */
    public function seedCatalog(): JsonResponse
    {
        $catalog = $this->defaultCatalog();
        $created = 0;
        $skipped = 0;

        foreach ($catalog as $row) {
            $exists = ServiceTariff::where('domain', $row['domain'])
                ->where('service_name', $row['service_name'])
                ->where('unit', $row['unit'])
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            ServiceTariff::create($row);
            $created++;
        }

        $items = ServiceTariff::query()
            ->orderBy('domain')
            ->orderBy('sort_order')
            ->orderBy('service_name')
            ->get()
            ->map(fn (ServiceTariff $t) => $t->toAdminArray());

        return response()->json([
            'created' => $created,
            'skipped' => $skipped,
            'items' => $items,
            'message' => $created
                ? "{$created} tarif(s) ajouté(s) depuis le catalogue."
                : 'Tous les services du catalogue sont déjà présents.',
        ]);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'domain' => [$required, 'string', Rule::in(self::DOMAINS)],
            'serviceName' => [$required, 'string', 'max:255'],
            'unit' => [$required, 'string', Rule::in(self::UNITS)],
            'unitLabel' => ['nullable', 'string', 'max:255'],
            'durationLabel' => ['nullable', 'string', 'max:255'],
            'amountMin' => [$partial ? 'sometimes' : 'required', 'integer', 'min:0', 'max:999999999'],
            'amountMax' => ['nullable', 'integer', 'min:0', 'max:999999999', 'gte:amountMin'],
            'currency' => ['nullable', 'string', 'max:8'],
            'description' => ['nullable', 'string', 'max:5000'],
            'isActive' => ['sometimes', 'boolean'],
            'sortOrder' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ]);
    }

    private function toAttributes(array $data, bool $partial = false): array
    {
        $map = [
            'domain' => 'domain',
            'serviceName' => 'service_name',
            'unit' => 'unit',
            'unitLabel' => 'unit_label',
            'durationLabel' => 'duration_label',
            'amountMin' => 'amount_min',
            'amountMax' => 'amount_max',
            'currency' => 'currency',
            'description' => 'description',
            'isActive' => 'is_active',
            'sortOrder' => 'sort_order',
        ];

        $attrs = [];
        foreach ($map as $camel => $snake) {
            if (! array_key_exists($camel, $data)) {
                continue;
            }
            $attrs[$snake] = $data[$camel];
        }

        if (array_key_exists('unit_label', $attrs) && $attrs['unit_label'] === null) {
            $attrs['unit_label'] = '';
        }
        if (array_key_exists('duration_label', $attrs) && $attrs['duration_label'] === null) {
            $attrs['duration_label'] = '';
        }
        if (array_key_exists('currency', $attrs) && ! $attrs['currency']) {
            $attrs['currency'] = 'CDF';
        }
        if (! $partial && ! array_key_exists('currency', $attrs)) {
            $attrs['currency'] = 'CDF';
        }

        return $attrs;
    }

    /** Catalogue de démarrage aligné sur les offres des 7 pôles. */
    private function defaultCatalog(): array
    {
        $rows = [];
        $sort = 0;

        $add = function (string $domain, string $name, string $unit, string $unitLabel, string $duration = '', string $description = '') use (&$rows, &$sort) {
            $rows[] = [
                'domain' => $domain,
                'service_name' => $name,
                'unit' => $unit,
                'unit_label' => $unitLabel,
                'duration_label' => $duration,
                'amount_min' => 0,
                'amount_max' => null,
                'currency' => 'CDF',
                'description' => $description ?: null,
                'is_active' => true,
                'sort_order' => $sort++,
            ];
        };

        // Saa Kids Care
        $add('kids-care', 'Garde d\'enfants à la journée', 'journee', 'la journée (8 h)', '8 heures', 'Une nounou vérifiée à votre domicile.');
        $add('kids-care', 'Garde de nuit', 'nuit', 'la nuit', 'Une nuit', 'Surveillance du sommeil et réveils de nuit.');
        $add('kids-care', 'Placement d\'une nounou permanente', 'mois', 'au mois / permanent', 'Poste permanent', 'Recrutement, vérification, présentation et suivi.');
        $add('kids-care', 'SaaPaie', 'mois', 'par mois', 'Par mois', 'Contrat, bulletin de paie, CNSS et IPR.');
        $add('kids-care', 'Garde à l\'heure', 'heure', 'l\'heure', 'Ponctuel', 'Garde ponctuelle ou d\'urgence.');

        // Saa Walé
        $add('wale', 'Walé à domicile', 'forfait', 'selon durée', 'Selon le nombre de jours', 'Accompagnante au domicile de la maman.');
        $add('wale', 'Walé séjour', 'forfait', 'selon formule', 'Séjour selon la formule', 'Repos dans un espace aménagé.');
        $add('wale', 'Walé bien-être', 'seance', 'la séance / forfait', 'Séances ou forfait', 'Massages, soins corporels, alimentation et repos.');
        $add('wale', 'Option diaspora', 'forfait', 'supplément', 'Selon la formule', 'Compte rendu quotidien écrit et vocal.');

        // Saa Home
        $add('home', 'Ménage à l\'heure', 'heure', 'l\'heure', '3 heures minimum', 'Entretien courant du domicile.');
        $add('home', 'Nettoyage complet de domicile', 'journee', 'la demi-journée', 'Demi-journée', 'Grand nettoyage pièce par pièce.');
        $add('home', 'Intervention plomberie ou électricité', 'forfait', 'diagnostic + 2 h', 'Diagnostic + 2 heures', 'Technicien vérifié.');
        $add('home', 'Placement d\'un domestique permanent', 'mois', 'au mois / permanent', 'Poste permanent', 'Aide-ménagère, cuisinier ou jardinier.');
        $add('home', 'Entretien de bureaux et d\'immeubles', 'mois', 'contrat mensuel', '12 à 24 mois', 'Contrat B2B.');

        // Saa Driver
        $add('driver', 'Chauffeur à la journée', 'journee', 'la journée (10 h)', '10 heures', 'Votre véhicule, un chauffeur vérifié.');
        $add('driver', 'Chauffeur à l\'heure', 'heure', 'l\'heure', 'Course ponctuelle', 'Course ou rendez-vous.');
        $add('driver', 'Placement d\'un chauffeur privé', 'mois', 'au mois / permanent', 'Poste permanent', 'Vous êtes l\'employeur.');
        $add('driver', 'Chauffeur au mois — mise à disposition', 'mois', 'par mois', '12 à 24 mois', 'SaaCare emploie et déclare le chauffeur.');

        // Saa Tutora
        $add('tutora', 'Cours à domicile', 'seance', 'la séance (1 h 30)', '1 h 30', 'Un répétiteur vérifié chez vous.');
        $add('tutora', 'Préparation à l\'examen d\'État', 'trimestre', 'au trimestre', 'Au trimestre', 'Programme régulier pour classes d\'examen.');
        $add('tutora', 'Cours à la semaine', 'semaine', 'la semaine', 'Plusieurs séances', 'Même répétiteur.');

        // Saa Assist
        $add('assist', 'Accompagnement à domicile', 'mois', 'abonnement mensuel', 'Abonnement mensuel', 'Présence, aide au quotidien, courses et rendez-vous.');
        $add('assist', 'Offre diaspora', 'mois', 'abonnement mensuel', 'Abonnement mensuel', 'Rapport de visite avec photos et appel de contrôle.');
        $add('assist', 'Visites ponctuelles', 'forfait', 'la visite', 'Ponctuel', 'Accompagnement à un rendez-vous.');

        // Saa Academy
        $add('academy', 'Socle SaaCare', 'forfait', 'la journée', '1 journée', 'Savoir-être, hygiène, sécurité, premiers secours.');
        $add('academy', 'Spécialisations métier', 'forfait', 'le module', '2 à 5 jours', 'Modules métier (Walé, cuisine, conduite…).');
        $add('academy', 'Cycles certifiants', 'forfait', 'le cycle', '1 à 6 mois', 'Auto-école, esthétique, informatique…');

        return $rows;
    }
}
