<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\ClientFavorite;
use App\Models\Message;
use App\Models\Order;
use App\Models\OrderTrip;
use App\Models\OrderTripPoint;
use App\Models\Payment;
use App\Models\ProviderProfile;
use App\Models\ServiceTariff;
use App\Models\User;
use App\Http\Controllers\Api\TariffController;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@saacare.cd'],
            [
                'full_name' => 'Admin SaaCare',
                'password' => 'demo1234',
                'role' => 'admin',
                'phone' => '+243900000001',
                'commune' => 'Gombe',
            ]
        );

        foreach ([
            ['email' => 'bellezajohncy@saacare.com', 'full_name' => 'Belleza Johncy', 'is_super_admin' => false],
            ['email' => 'sephorasoki@saacare.com', 'full_name' => 'Sephora Soki', 'is_super_admin' => false],
            ['email' => 'yvesnsimba@saacare.com', 'full_name' => 'Yves Nsimba', 'is_super_admin' => true],
        ] as $adminAccount) {
            User::updateOrCreate(
                ['email' => $adminAccount['email']],
                [
                    'full_name' => $adminAccount['full_name'],
                    'password' => 'Saacare@2026',
                    'role' => 'admin',
                    'is_super_admin' => $adminAccount['is_super_admin'],
                    'phone' => '',
                    'commune' => '',
                ]
            );
        }

        $client = User::updateOrCreate(
            ['email' => 'client@saacare.cd'],
            [
                'full_name' => 'Aline Mbuyi',
                'password' => 'demo1234',
                'role' => 'client',
                'phone' => '+243900000002',
                'commune' => 'Ngaliema',
            ]
        );

        $pendingUser = User::updateOrCreate(
            ['email' => 'prestataire.pending@saacare.cd'],
            [
                'full_name' => 'Prestataire En attente',
                'password' => 'demo1234',
                'role' => 'prestataire',
                'phone' => '+243900000003',
                'commune' => 'Limete',
            ]
        );

        ProviderProfile::updateOrCreate(
            ['user_id' => $pendingUser->id],
            [
                'reference' => 'SAA-PENDING-001',
                'seal' => null,
                'status' => 'pending',
                'domain' => 'kids-care',
                'metier' => 'Nounou',
                'initials' => 'P',
                'gender' => 'F',
                'level' => 'Vérifié',
                'bio' => 'Dossier en cours de validation.',
                'zones' => ['Limete', 'Lemba'],
                'availability' => 'week',
            ]
        );

        foreach ($this->catalog() as $row) {
            $email = 'provider.'.Str::lower($row['reference']).'@saacare.cd';
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'full_name' => 'Agent '.$row['initials'],
                    'password' => 'demo1234',
                    'role' => 'prestataire',
                    'phone' => '',
                    'commune' => $row['commune'],
                ]
            );

            ProviderProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'reference' => $row['reference'],
                    'seal' => $row['seal'],
                    'status' => 'approved',
                    'domain' => $row['domainSlug'],
                    'metier' => $row['metier'],
                    'initials' => $row['initials'],
                    'gender' => $row['gender'],
                    'level' => $row['level'],
                    'rating' => $row['rating'],
                    'reviews' => $row['reviews'],
                    'experience' => $row['experience'],
                    'languages' => $row['languages'],
                    'price' => $row['price'],
                    'availability' => $row['availability'],
                    'slots' => $row['slots'],
                    'licence' => $row['licence'] ?? [],
                    'skills' => $row['skills'],
                    'trainings' => $row['trainings'],
                    'missions' => $row['missions'],
                    'hours' => $row['hours'],
                    'since' => $row['since'],
                    'verified_at' => $row['verifiedAt'],
                    'next_check' => $row['nextCheck'],
                    'reviews_list' => $row['reviewsList'],
                    'bio' => $row['metier'].' vérifié·e SaaCare — '.$row['experience']." ans d'expérience.",
                    'zones' => $row['zones'],
                ]
            );
        }

        $approvedDemo = User::updateOrCreate(
            ['email' => 'prestataire@saacare.cd'],
            [
                'full_name' => 'Prestataire Validé',
                'password' => 'demo1234',
                'role' => 'prestataire',
                'phone' => '+243900000004',
                'commune' => 'Gombe',
            ]
        );

        ProviderProfile::updateOrCreate(
            ['user_id' => $approvedDemo->id],
            [
                'reference' => 'SAA-HM-DEMO',
                'seal' => 'ST-26-DEMO',
                'status' => 'approved',
                'domain' => 'home',
                'metier' => 'Aide-ménagère',
                'initials' => 'V',
                'gender' => 'F',
                'level' => 'Certifié',
                'rating' => 4.8,
                'reviews' => 12,
                'experience' => 5,
                'languages' => ['Français', 'Lingala'],
                'availability' => 'immediate',
                'slots' => ['Jour'],
                'skills' => ['Entretien courant', 'Repassage'],
                'trainings' => ['Socle SaaCare'],
                'missions' => 18,
                'hours' => 96,
                'since' => '2026',
                'verified_at' => '08/2026',
                'next_check' => '08/2027',
                'reviews_list' => [],
                'bio' => 'Prestataire vérifié SaaCare.',
                'zones' => ['Gombe', 'Ngaliema'],
            ]
        );

        $this->seedClientActivity($client);

        unset($admin);
    }

    private function seedClientActivity(User $client): void
    {
        $provider = ProviderProfile::where('reference', 'SAA-HM-0231')->first()
            ?? ProviderProfile::where('status', 'approved')->first();

        $order = Order::updateOrCreate(
            ['reference' => 'CMD-DEMO0001'],
            [
                'client_id' => $client->id,
                'provider_profile_id' => $provider?->id,
                'domain' => 'home',
                'metier' => 'Aide-ménagère',
                'commune' => 'Ngaliema',
                // Point d'intervention : nécessaire au suivi de trajet (§4.4).
                'address' => 'Avenue des Cliniques, réf. école Saint-Joseph',
                'latitude' => -4.3369,
                'longitude' => 15.2663,
                'frequency' => 'Hebdomadaire',
                'desired_date' => now()->addDays(5)->toDateString(),
                'need' => 'Aide ménagère 3 matins par semaine pour un appartement 3 pièces.',
                'status' => 'programmee',
                'amount' => 150000,
            ]
        );

        Order::updateOrCreate(
            ['reference' => 'CMD-DEMO0002'],
            [
                'client_id' => $client->id,
                'provider_profile_id' => null,
                'domain' => 'kids-care',
                'metier' => 'Nounou',
                'commune' => 'Gombe',
                'frequency' => 'Ponctuel',
                'desired_date' => now()->addDays(12)->toDateString(),
                'need' => 'Garde d’enfants un samedi soir (18 h – 23 h).',
                'status' => 'nouvelle',
                'amount' => 0,
            ]
        );

        Order::updateOrCreate(
            ['reference' => 'CMD-DEMO0003'],
            [
                'client_id' => $client->id,
                'provider_profile_id' => $provider?->id,
                'domain' => 'driver',
                'metier' => 'Chauffeur',
                'commune' => 'Gombe',
                'frequency' => 'Ponctuel',
                'desired_date' => null,
                'need' => 'Transfert aéroport demain matin.',
                'status' => 'confirmee',
                'amount' => 45000,
            ]
        );

        $trackingOrder = Order::updateOrCreate(
            ['reference' => 'CMD-DEMO0004'],
            [
                'client_id' => $client->id,
                'provider_profile_id' => $provider?->id,
                'domain' => 'home',
                'metier' => 'Plombier',
                'commune' => 'Kalamu',
                'address' => 'Avenue Victoire, n°12',
                'latitude' => -4.3412,
                'longitude' => 15.3051,
                'frequency' => 'Urgence',
                'desired_date' => now()->toDateString(),
                'need' => 'Fuite sous évier — prestataire en route, suivez son arrivée.',
                'status' => 'en_cours',
                'amount' => 80000,
            ]
        );

        if ($provider) {
            OrderTrip::where('order_id', $trackingOrder->id)->delete();
            $trip = OrderTrip::create([
                'order_id' => $trackingOrder->id,
                'provider_profile_id' => $provider->id,
                'status' => OrderTrip::STATUS_EN_ROUTE,
                'started_at' => now()->subMinutes(12),
                'last_latitude' => -4.3485,
                'last_longitude' => 15.2980,
                'last_accuracy' => 18,
                'last_heading' => 45,
                'last_speed' => 4.2,
                'last_position_at' => now()->subSeconds(8),
                'points_count' => 3,
                'distance_meters' => 980,
                'eta_seconds' => 420,
                'route_source' => 'estimation',
                'route_from_latitude' => -4.3485,
                'route_from_longitude' => 15.2980,
                'route_computed_at' => now()->subSeconds(8),
            ]);

            $path = [
                [-4.3520, 15.2910, 11],
                [-4.3500, 15.2945, 7],
                [-4.3485, 15.2980, 0.2],
            ];
            foreach ($path as [$lat, $lng, $minutesAgo]) {
                OrderTripPoint::create([
                    'order_trip_id' => $trip->id,
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'accuracy' => 20,
                    'recorded_at' => now()->subMinutes($minutesAgo),
                ]);
            }
        }

        Order::updateOrCreate(
            ['reference' => 'CMD-DEMO0005'],
            [
                'client_id' => $client->id,
                'provider_profile_id' => $provider?->id,
                'domain' => 'tutora',
                'metier' => 'Répétiteur',
                'commune' => 'Lemba',
                'frequency' => 'Hebdomadaire',
                'desired_date' => now()->subDays(20)->toDateString(),
                'need' => 'Cours de maths terminés pour le trimestre.',
                'status' => 'terminee',
                'amount' => 60000,
            ]
        );

        Order::updateOrCreate(
            ['reference' => 'CMD-DEMO0006'],
            [
                'client_id' => $client->id,
                'provider_profile_id' => null,
                'domain' => 'assist',
                'metier' => 'Accompagnant',
                'commune' => 'Ngaliema',
                'frequency' => 'Ponctuel',
                'desired_date' => now()->subDays(3)->toDateString(),
                'need' => 'Demande annulée — besoin reporté.',
                'status' => 'annulee',
                'amount' => 0,
            ]
        );

        if ($provider?->reference) {
            ClientFavorite::updateOrCreate(
                [
                    'user_id' => $client->id,
                    'type' => ClientFavorite::TYPE_PROVIDER,
                    'target' => $provider->reference,
                ],
                []
            );
        }
        ClientFavorite::updateOrCreate(
            [
                'user_id' => $client->id,
                'type' => ClientFavorite::TYPE_SERVICE,
                'target' => 'kids-care',
            ],
            []
        );
        ClientFavorite::updateOrCreate(
            [
                'user_id' => $client->id,
                'type' => ClientFavorite::TYPE_SERVICE,
                'target' => 'home',
            ],
            []
        );

        Payment::updateOrCreate(
            ['reference' => 'PAY-DEMO0001'],
            [
                'client_id' => $client->id,
                'order_id' => $order->id,
                'amount' => 75000,
                'method' => 'mobile_money',
                'status' => 'paye',
                'note' => 'Acompte Mobile Money',
            ]
        );

        Payment::updateOrCreate(
            ['reference' => 'PAY-DEMO0002'],
            [
                'client_id' => $client->id,
                'order_id' => $order->id,
                'amount' => 75000,
                'method' => 'mobile_money',
                'status' => 'en_attente',
                'note' => 'Solde à confirmer',
            ]
        );

        Message::query()->where('user_id', $client->id)->where('thread', 'support')->delete();
        Message::create([
            'user_id' => $client->id,
            'thread' => 'support',
            'body' => 'Bonjour, je voudrais confirmer les horaires de la demande CMD-DEMO0001.',
            'from_staff' => false,
        ]);
        Message::create([
            'user_id' => $client->id,
            'thread' => 'support',
            'body' => 'Bonjour Aline. Votre demande est confirmée pour 3 matins/semaine à Ngaliema. Un conseiller vous rappelle demain.',
            'from_staff' => true,
        ]);

        AppNotification::query()->where('user_id', $client->id)->delete();
        AppNotification::create([
            'user_id' => $client->id,
            'title' => 'Commande confirmée',
            'body' => 'Votre demande CMD-DEMO0001 a été confirmée par l’équipe SaaCare.',
            'type' => 'order',
            'link' => '/client/commandes',
            'read_at' => null,
        ]);
        AppNotification::create([
            'user_id' => $client->id,
            'title' => 'Paiement reçu',
            'body' => 'L’acompte PAY-DEMO0001 a été enregistré.',
            'type' => 'payment',
            'link' => '/client/paiements',
            'read_at' => now(),
        ]);
        AppNotification::create([
            'user_id' => $client->id,
            'title' => 'Nouveau message',
            'body' => 'Le support SaaCare vous a répondu.',
            'type' => 'message',
            'link' => '/client/messages',
            'read_at' => null,
        ]);

        // Grille tarifaire : catalogue des 7 pôles (montants à 0 = à saisir).
        if (ServiceTariff::query()->count() === 0) {
            app(TariffController::class)->seedCatalog();
        }
    }

    /** @return list<array<string, mixed>> */
    private function catalog(): array
    {
        return [
            [
                'reference' => 'SAA-KC-0412', 'domainSlug' => 'kids-care', 'metier' => 'Nounou', 'initials' => 'G', 'gender' => 'F',
                'commune' => 'Gombe', 'zones' => ['Gombe', 'Lingwala', 'Kintambo'], 'level' => 'Élite', 'rating' => 4.9, 'reviews' => 48,
                'experience' => 8, 'languages' => ['Français', 'Lingala'], 'price' => ['amount' => 12, 'unit' => 'la journée (8 h)'],
                'availability' => 'immediate', 'slots' => ['Jour'], 'skills' => ['Garde de nourrisson', 'Préparation des repas de l\'enfant', 'Éveil et jeux', 'Aide aux devoirs'],
                'trainings' => ['Socle SaaCare', 'Garde de nourrisson'], 'missions' => 64, 'hours' => 412, 'since' => '2026',
                'seal' => 'ST-26-0412', 'verifiedAt' => '08/2026', 'nextCheck' => '08/2027',
                'reviewsList' => [
                    ['firstName' => 'Aline', 'commune' => 'Gombe', 'date' => '08/2026', 'text' => 'Ponctuelle, douce avec les enfants, et toujours un mot sur la journée. Nous sommes sereins.'],
                    ['firstName' => 'Patrick', 'commune' => 'Lingwala', 'date' => '07/2026', 'text' => 'Très organisée. Les repas et les siestes sont respectés à la minute.'],
                ],
            ],
            [
                'reference' => 'SAA-KC-0457', 'domainSlug' => 'kids-care', 'metier' => 'Nounou — garde de nuit', 'initials' => 'J', 'gender' => 'F',
                'commune' => 'Ngaliema', 'zones' => ['Ngaliema', 'Mont-Ngafula'], 'level' => 'Certifié', 'rating' => 4.8, 'reviews' => 21,
                'experience' => 5, 'languages' => ['Français', 'Anglais'], 'price' => ['amount' => 18, 'unit' => 'la nuit'],
                'availability' => 'week', 'slots' => ['Nuit'], 'skills' => ['Garde de nuit', 'Garde de nourrisson', 'Routine du coucher'],
                'trainings' => ['Socle SaaCare', 'Garde de nourrisson'], 'missions' => 31, 'hours' => 248, 'since' => '2026',
                'seal' => 'ST-26-0457', 'verifiedAt' => '07/2026', 'nextCheck' => '07/2027',
                'reviewsList' => [['firstName' => 'Sarah', 'commune' => 'Ngaliema', 'date' => '08/2026', 'text' => 'Enfin des nuits complètes. Discrète et rassurante.']],
            ],
            [
                'reference' => 'SAA-KC-0503', 'domainSlug' => 'kids-care', 'metier' => 'Nounou — sortie d\'école', 'initials' => 'B', 'gender' => 'F',
                'commune' => 'Lemba', 'zones' => ['Lemba', 'Limete', 'Matete'], 'level' => 'Vérifié', 'rating' => 4.6, 'reviews' => 7,
                'experience' => 3, 'languages' => ['Français', 'Lingala', 'Tshiluba'], 'price' => ['amount' => 12, 'unit' => 'la journée (8 h)'],
                'availability' => 'immediate', 'slots' => ['Jour'], 'skills' => ['Sortie d\'école', 'Aide aux devoirs', 'Éveil et jeux'],
                'trainings' => ['Socle SaaCare'], 'missions' => 9, 'hours' => 72, 'since' => '2026',
                'seal' => 'ST-26-0503', 'verifiedAt' => '08/2026', 'nextCheck' => '08/2027',
                'reviewsList' => [['firstName' => 'Merveille', 'commune' => 'Lemba', 'date' => '08/2026', 'text' => 'Mes enfants l\'attendent à la sortie de l\'école avec le sourire.']],
            ],
            [
                'reference' => 'SAA-WL-0108', 'domainSlug' => 'wale', 'metier' => 'Accompagnante Walé', 'initials' => 'C', 'gender' => 'F',
                'commune' => 'Limete', 'zones' => ['Limete', 'Kalamu', 'Lemba', 'Ngaba'], 'level' => 'Certifié', 'rating' => 4.9, 'reviews' => 14,
                'experience' => 9, 'languages' => ['Français', 'Lingala', 'Kikongo'], 'price' => ['amount' => 24, 'unit' => 'la nuit (20 h – 6 h)'],
                'availability' => 'planning', 'slots' => ['Nuit'], 'skills' => ['Relais de nuit', 'Soutien à l\'allaitement', 'Préparation des repas adaptés', 'Carnet de suivi'],
                'trainings' => ['Socle SaaCare', 'Accompagnement Walé (5 jours)'], 'missions' => 12, 'hours' => 196, 'since' => '2026',
                'seal' => 'ST-26-0108', 'verifiedAt' => '06/2026', 'nextCheck' => '06/2027',
                'reviewsList' => [['firstName' => 'Nadège', 'commune' => 'Limete', 'date' => '08/2026', 'text' => 'Elle a veillé la nuit pendant deux semaines. J\'ai pu dormir et récupérer.']],
            ],
            [
                'reference' => 'SAA-WL-0121', 'domainSlug' => 'wale', 'metier' => 'Accompagnante Walé', 'initials' => 'E', 'gender' => 'F',
                'commune' => 'Gombe', 'zones' => ['Gombe', 'Ngaliema', 'Barumbu'], 'level' => 'Élite', 'rating' => 5.0, 'reviews' => 26,
                'experience' => 12, 'languages' => ['Français', 'Lingala', 'Anglais'], 'price' => ['amount' => 18, 'unit' => 'la journée (8 h)'],
                'availability' => 'week', 'slots' => ['Jour', 'Jour et nuit en relais'], 'skills' => ['Soutien à la mère', 'Aide pratique au nouveau-né', 'Soutien de l\'aîné', 'Carnet de suivi'],
                'trainings' => ['Socle SaaCare', 'Accompagnement Walé (5 jours)', 'Soutien de l\'humeur maternelle'], 'missions' => 23, 'hours' => 540, 'since' => '2026',
                'seal' => 'ST-26-0121', 'verifiedAt' => '06/2026', 'nextCheck' => '06/2027',
                'reviewsList' => [
                    ['firstName' => 'Grâce', 'commune' => 'Gombe', 'date' => '07/2026', 'text' => 'Présente, douce et très claire sur ce qu\'elle fait et ne fait pas. Rassurant pour un premier bébé.'],
                    ['firstName' => 'Cédric', 'commune' => 'Ngaliema', 'date' => '06/2026', 'text' => 'Réservée depuis Bruxelles pour ma sœur : le compte rendu quotidien nous a beaucoup aidés.'],
                ],
            ],
            [
                'reference' => 'SAA-HM-0231', 'domainSlug' => 'home', 'metier' => 'Aide-ménagère', 'initials' => 'R', 'gender' => 'F',
                'commune' => 'Bandalungwa', 'zones' => ['Bandalungwa', 'Kintambo', 'Kasa-Vubu'], 'level' => 'Vérifié', 'rating' => 4.7, 'reviews' => 33,
                'experience' => 6, 'languages' => ['Français', 'Lingala'], 'price' => ['amount' => 4, 'unit' => 'l\'heure (3 h minimum)'],
                'availability' => 'immediate', 'slots' => ['Jour'], 'skills' => ['Entretien courant', 'Repassage', 'Nettoyage complet', 'Courses du quotidien'],
                'trainings' => ['Socle SaaCare'], 'missions' => 58, 'hours' => 196, 'since' => '2026',
                'seal' => 'ST-26-0231', 'verifiedAt' => '07/2026', 'nextCheck' => '07/2027',
                'reviewsList' => [['firstName' => 'Olivier', 'commune' => 'Bandalungwa', 'date' => '08/2026', 'text' => 'Travail soigné, et elle prévient toujours en cas de retard.']],
            ],
            [
                'reference' => 'SAA-HM-0264', 'domainSlug' => 'home', 'metier' => 'Cuisinier', 'initials' => 'D', 'gender' => 'M',
                'commune' => 'Ngaliema', 'zones' => ['Ngaliema', 'Gombe'], 'level' => 'Certifié', 'rating' => 4.8, 'reviews' => 19,
                'experience' => 10, 'languages' => ['Français', 'Lingala', 'Anglais'], 'price' => null,
                'availability' => 'week', 'slots' => ['Jour'], 'skills' => ['Cuisine congolaise', 'Cuisine internationale', 'Réceptions', 'Gestion des courses'],
                'trainings' => ['Socle SaaCare', 'Cuisine'], 'missions' => 14, 'hours' => 310, 'since' => '2026',
                'seal' => 'ST-26-0264', 'verifiedAt' => '07/2026', 'nextCheck' => '07/2027',
                'reviewsList' => [['firstName' => 'Hélène', 'commune' => 'Ngaliema', 'date' => '07/2026', 'text' => 'Un vrai professionnel, très propre en cuisine.']],
            ],
            [
                'reference' => 'SAA-HM-0288', 'domainSlug' => 'home', 'metier' => 'Plombier', 'initials' => 'F', 'gender' => 'M',
                'commune' => 'Kalamu', 'zones' => ['Kalamu', 'Limete', 'Kasa-Vubu', 'Lemba'], 'level' => 'Élite', 'rating' => 4.9, 'reviews' => 61,
                'experience' => 11, 'languages' => ['Français', 'Lingala'], 'price' => ['amount' => 25, 'unit' => 'diagnostic + 2 h'],
                'availability' => 'immediate', 'slots' => ['Jour'], 'skills' => ['Recherche de fuite', 'Installation sanitaire', 'Débouchage', 'Pompe et réservoir'],
                'trainings' => ['Socle SaaCare'], 'missions' => 97, 'hours' => 286, 'since' => '2026',
                'seal' => 'ST-26-0288', 'verifiedAt' => '06/2026', 'nextCheck' => '06/2027',
                'reviewsList' => [['firstName' => 'Joël', 'commune' => 'Kalamu', 'date' => '08/2026', 'text' => 'Diagnostic clair, devis respecté, fuite réglée en une heure.']],
            ],
            [
                'reference' => 'SAA-HM-0302', 'domainSlug' => 'home', 'metier' => 'Électricien', 'initials' => 'A', 'gender' => 'M',
                'commune' => 'Limete', 'zones' => ['Limete', 'Matete', 'Ngaba'], 'level' => 'Certifié', 'rating' => 4.8, 'reviews' => 40,
                'experience' => 7, 'languages' => ['Français', 'Swahili'], 'price' => ['amount' => 25, 'unit' => 'diagnostic + 2 h'],
                'availability' => 'week', 'slots' => ['Jour'], 'skills' => ['Tableau électrique', 'Groupe électrogène', 'Éclairage', 'Mise en sécurité'],
                'trainings' => ['Socle SaaCare', 'Sécurité électrique'], 'missions' => 52, 'hours' => 164, 'since' => '2026',
                'seal' => 'ST-26-0302', 'verifiedAt' => '07/2026', 'nextCheck' => '07/2027',
                'reviewsList' => [['firstName' => 'Christian', 'commune' => 'Limete', 'date' => '08/2026', 'text' => 'Il a expliqué chaque étape avant d\'intervenir. Rien à redire.']],
            ],
            [
                'reference' => 'SAA-HM-0319', 'domainSlug' => 'home', 'metier' => 'Carreleur', 'initials' => 'M', 'gender' => 'M',
                'commune' => 'Masina', 'zones' => ['Masina', 'Ndjili', 'Kimbanseke'], 'level' => 'Vérifié', 'rating' => 4.5, 'reviews' => 2,
                'experience' => 4, 'languages' => ['Français', 'Lingala'], 'price' => null,
                'availability' => 'planning', 'slots' => ['Jour'], 'skills' => ['Pose de carrelage', 'Faïence', 'Ragréage'],
                'trainings' => ['Socle SaaCare'], 'missions' => 3, 'hours' => 38, 'since' => '2026',
                'seal' => 'ST-26-0319', 'verifiedAt' => '08/2026', 'nextCheck' => '08/2027', 'reviewsList' => [],
            ],
            [
                'reference' => 'SAA-DR-0150', 'domainSlug' => 'driver', 'metier' => 'Chauffeur', 'initials' => 'P', 'gender' => 'M',
                'commune' => 'Limete', 'zones' => ['Limete', 'Gombe', 'Ndjili'], 'level' => 'Élite', 'rating' => 4.9, 'reviews' => 72,
                'experience' => 12, 'languages' => ['Français', 'Lingala', 'Anglais'], 'price' => ['amount' => 22, 'unit' => 'la journée (10 h)'],
                'availability' => 'immediate', 'slots' => ['Jour'], 'licence' => ['Permis de conduire'], 'skills' => ['Conduite défensive', 'Trajets aéroport', 'Conduite de direction'],
                'trainings' => ['Socle SaaCare', 'Conduite défensive'], 'missions' => 88, 'hours' => 820, 'since' => '2026',
                'seal' => 'ST-26-0150', 'verifiedAt' => '06/2026', 'nextCheck' => '06/2027',
                'reviewsList' => [['firstName' => 'Didier', 'commune' => 'Gombe', 'date' => '08/2026', 'text' => 'Toujours en avance, conduite calme. Idéal pour nos invités.']],
            ],
            [
                'reference' => 'SAA-DR-0177', 'domainSlug' => 'driver', 'metier' => 'Chauffeur de direction', 'initials' => 'S', 'gender' => 'M',
                'commune' => 'Gombe', 'zones' => ['Gombe', 'Ngaliema', 'Lingwala'], 'level' => 'Certifié', 'rating' => 4.8, 'reviews' => 28,
                'experience' => 9, 'languages' => ['Français', 'Anglais'], 'price' => ['amount' => 22, 'unit' => 'la journée (10 h)'],
                'availability' => 'week', 'slots' => ['Jour'], 'licence' => ['Permis de conduire'], 'skills' => ['Conduite de direction', 'Discrétion', 'Protocole'],
                'trainings' => ['Socle SaaCare', 'Conduite défensive'], 'missions' => 20, 'hours' => 360, 'since' => '2026',
                'seal' => 'ST-26-0177', 'verifiedAt' => '07/2026', 'nextCheck' => '07/2027',
                'reviewsList' => [['firstName' => 'Marie', 'commune' => 'Gombe', 'date' => '07/2026', 'text' => 'Discret et ponctuel, exactement ce que notre ONG attendait.']],
            ],
            [
                'reference' => 'SAA-DR-0192', 'domainSlug' => 'driver', 'metier' => 'Chauffeur', 'initials' => 'T', 'gender' => 'M',
                'commune' => 'Kintambo', 'zones' => ['Kintambo', 'Bandalungwa', 'Ngaliema'], 'level' => 'Vérifié', 'rating' => 4.7, 'reviews' => 1,
                'experience' => 4, 'languages' => ['Français', 'Lingala'], 'price' => ['amount' => 22, 'unit' => 'la journée (10 h)'],
                'availability' => 'immediate', 'slots' => ['Jour'], 'licence' => ['Permis de conduire', 'Moto'], 'skills' => ['Courses en ville', 'Conduite moto'],
                'trainings' => ['Socle SaaCare'], 'missions' => 2, 'hours' => 20, 'since' => '2026',
                'seal' => 'ST-26-0192', 'verifiedAt' => '08/2026', 'nextCheck' => '08/2027', 'reviewsList' => [],
            ],
        ];
    }
}
