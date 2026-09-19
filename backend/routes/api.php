<?php

use App\Http\Controllers\Api\AdminLeadController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientModuleController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\PlatformSettingsController;
use App\Http\Controllers\Api\PrestataireModuleController;
use App\Http\Controllers\Api\ProviderController;
use App\Http\Controllers\Api\PublicLeadController;
use App\Http\Controllers\Api\SpaceController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\TariffController;
use App\Http\Controllers\Api\TrackingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['ok' => true, 'service' => 'saacare-api']));

Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:8,1');
Route::post('/requests', [PublicLeadController::class, 'storeRequest'])->middleware('throttle:10,1');
Route::post('/quotes/request', [PublicLeadController::class, 'storeQuote'])->middleware('throttle:10,1');

Route::get('/providers', [ProviderController::class, 'index']);
Route::get('/providers/verify', [ProviderController::class, 'verify']);
Route::get('/providers/{reference}', [ProviderController::class, 'show']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'google']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/me', [AuthController::class, 'updateProfile']);
    Route::patch('/me/password', [AuthController::class, 'changePassword']);

    Route::middleware('role:client')->prefix('client')->group(function () {
        Route::get('/dashboard', [SpaceController::class, 'clientDashboard']);
        Route::get('/services', [ClientModuleController::class, 'servicesCatalog']);
        Route::post('/orders', [ClientModuleController::class, 'createOrder']);
        Route::get('/orders', [ClientModuleController::class, 'orders']);
        Route::patch('/orders/{id}/cancel', [ClientModuleController::class, 'cancelOrder']);
        Route::post('/orders/{id}/review', [ClientModuleController::class, 'storeReview']);
        // Suivi GPS de la mission — réservé au client propriétaire (§13)
        Route::get('/orders/{id}/tracking', [TrackingController::class, 'tracking']);
        Route::patch('/orders/{id}/address', [TrackingController::class, 'updateAddress']);
        Route::get('/providers', [ClientModuleController::class, 'providers']);
        Route::get('/payments', [ClientModuleController::class, 'payments']);
        Route::post('/payments', [ClientModuleController::class, 'createPayment']);
        Route::get('/messages', [ClientModuleController::class, 'messages']);
        Route::post('/messages', [ClientModuleController::class, 'sendMessage']);
        Route::get('/notifications', [ClientModuleController::class, 'notifications']);
        Route::patch('/notifications/{id}/read', [ClientModuleController::class, 'markNotificationRead']);
        Route::post('/notifications/read-all', [ClientModuleController::class, 'markAllNotificationsRead']);
        Route::get('/favorites', [ClientModuleController::class, 'favorites']);
        Route::post('/favorites/toggle', [ClientModuleController::class, 'toggleFavorite']);
    });

    Route::middleware('role:prestataire')->prefix('prestataire')->group(function () {
        Route::get('/dashboard', [SpaceController::class, 'prestataireDashboard']);
        Route::get('/profil', [SpaceController::class, 'prestataireProfil']);
        Route::patch('/profil', [SpaceController::class, 'updatePrestataireProfil']);

        Route::get('/disponibilite', [PrestataireModuleController::class, 'availability']);
        Route::put('/disponibilite', [PrestataireModuleController::class, 'updateAvailability']);
        Route::get('/planning', [PrestataireModuleController::class, 'planning']);
        Route::get('/gains', [PrestataireModuleController::class, 'gains']);
        Route::get('/avis', [PrestataireModuleController::class, 'reviews']);

        // Missions affectées et suivi de trajet (§4.4)
        Route::get('/missions', [TrackingController::class, 'missions']);
        Route::get('/missions/pending-offers', [TrackingController::class, 'pendingOffers']);
        Route::get('/missions/{id}', [TrackingController::class, 'mission']);
        Route::post('/missions/{id}/accept', [TrackingController::class, 'acceptMission']);
        Route::post('/missions/{id}/refuse', [TrackingController::class, 'refuseMission']);
        Route::post('/missions/{id}/trip', [TrackingController::class, 'startTrip']);
        Route::post('/missions/{id}/trip/arrived', [TrackingController::class, 'arrive']);
        Route::post('/missions/{id}/trip/cancel', [TrackingController::class, 'cancelTrip']);
        // Position : limitée pour protéger MySQL même si un client est mal réglé
        Route::post('/missions/{id}/location', [TrackingController::class, 'pushLocation'])
            ->middleware('throttle:40,1');

        Route::get('/notifications', [TrackingController::class, 'notifications']);
        Route::patch('/notifications/{id}/read', [TrackingController::class, 'markNotificationRead']);
        Route::post('/notifications/read-all', [TrackingController::class, 'markAllNotificationsRead']);
    });

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [SpaceController::class, 'adminDashboard']);
        Route::get('/prestataires', [SpaceController::class, 'adminPrestataires']);
        Route::get('/prestataires/pending', [SpaceController::class, 'adminPrestatairesPending']);
        Route::get('/prestataires/{id}', [SpaceController::class, 'adminPrestataire']);
        Route::patch('/prestataires/{id}/status', [SpaceController::class, 'updateProviderStatus']);
        Route::get('/clients', [SpaceController::class, 'adminClients']);
        Route::get('/clients/{id}', [SpaceController::class, 'adminClient']);
        Route::get('/commandes', [SpaceController::class, 'adminOrders']);
        Route::get('/commandes/{id}', [SpaceController::class, 'adminOrder']);
        Route::post('/commandes/{id}/assign', [SpaceController::class, 'assignAdminOrder']);
        Route::get('/paiements', [SpaceController::class, 'adminPayments']);
        Route::post('/paiements', [SpaceController::class, 'createAdminPayment']);
        Route::get('/rapports', [SpaceController::class, 'adminReports']);
        Route::get('/missions/actives', [TrackingController::class, 'activeMissions']);
        Route::get('/missions/{id}', [TrackingController::class, 'adminMission']);
        Route::post('/missions/{id}/notes', [TrackingController::class, 'storeMissionNote']);
        Route::get('/rendez-vous', [AppointmentController::class, 'index']);
        Route::post('/rendez-vous', [AppointmentController::class, 'store']);
        Route::delete('/rendez-vous/{id}', [AppointmentController::class, 'destroy']);

        Route::get('/leads/demandes', [AdminLeadController::class, 'serviceRequests']);
        Route::patch('/leads/demandes/{id}', [AdminLeadController::class, 'updateServiceRequest']);
        Route::get('/leads/devis', [AdminLeadController::class, 'quoteRequests']);
        Route::patch('/leads/devis/{id}', [AdminLeadController::class, 'updateQuoteRequest']);
        Route::get('/parametres-plateforme', [PlatformSettingsController::class, 'index']);
        Route::put('/parametres-plateforme', [PlatformSettingsController::class, 'update']);

        Route::get('/tarifs', [TariffController::class, 'index']);
        Route::post('/tarifs', [TariffController::class, 'store']);
        Route::post('/tarifs/seed-catalog', [TariffController::class, 'seedCatalog']);
        Route::patch('/tarifs/{id}', [TariffController::class, 'update']);
        Route::delete('/tarifs/{id}', [TariffController::class, 'destroy']);

        Route::middleware('superadmin')->group(function () {
            Route::get('/utilisateurs', [SuperAdminController::class, 'users']);
            Route::patch('/utilisateurs/{id}', [SuperAdminController::class, 'updateUser']);
            Route::get('/journal-connexions', [SuperAdminController::class, 'loginJournal']);
            Route::get('/comptabilite', [SuperAdminController::class, 'accounting']);
            Route::get('/statistiques', [SuperAdminController::class, 'statistics']);
            Route::get('/donnees', [SuperAdminController::class, 'dataOverview']);
            Route::get('/donnees/backup', [SuperAdminController::class, 'exportBackup']);
            Route::post('/donnees/purge', [SuperAdminController::class, 'purgeAll']);
        });
    });
});

/**
 * Autorisation des canaux privés de diffusion.
 *
 * Volontairement servie ici plutôt que par la route web par défaut : le front
 * SaaCare s'authentifie avec un jeton Sanctum (Bearer), pas avec une session.
 * Reste inerte tant qu'aucun service WebSocket n'est configuré.
 */
Route::middleware('auth:sanctum')->post('/broadcasting/auth', fn (Request $request) => Broadcast::auth($request));
