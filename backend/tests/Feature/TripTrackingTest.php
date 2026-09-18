<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderTrip;
use App\Models\ProviderProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Le suivi GPS n'est sûr que si le serveur refuse tout ce que le front pourrait
 * mal faire : ces tests verrouillent les règles d'accès du cahier des charges §13.
 */
class TripTrackingTest extends TestCase
{
    use RefreshDatabase;

    private User $client;

    private User $provider;

    private ProviderProfile $profile;

    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = User::create([
            'full_name' => 'Cliente Test',
            'email' => 'client.test@saacare.cd',
            'password' => 'demo1234',
            'role' => 'client',
            'commune' => 'Ngaliema',
        ]);

        $this->provider = $this->makeProvider('provider.test@saacare.cd');
        $this->profile = $this->provider->providerProfile;

        $this->order = Order::create([
            'reference' => 'CMD-TEST0001',
            'client_id' => $this->client->id,
            'provider_profile_id' => $this->profile->id,
            'domain' => 'home',
            'metier' => 'Aide-ménagère',
            'commune' => 'Ngaliema',
            'address' => 'Avenue des Cliniques',
            'latitude' => -4.3369,
            'longitude' => 15.2663,
            'need' => 'Test',
            'status' => 'confirmee',
        ]);
    }

    private function makeProvider(string $email): User
    {
        $user = User::create([
            'full_name' => 'Prestataire '.$email,
            'email' => $email,
            'password' => 'demo1234',
            'role' => 'prestataire',
            'commune' => 'Gombe',
        ]);

        ProviderProfile::create([
            'user_id' => $user->id,
            'status' => 'approved',
            'domain' => 'home',
            'metier' => 'Aide-ménagère',
        ]);

        return $user->fresh('providerProfile');
    }

    public function test_provider_can_run_a_full_trip_and_client_follows_it(): void
    {
        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/trip")
            ->assertOk()
            ->assertJsonPath('item.trip.status', 'en_route');

        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/location", [
                'latitude' => -4.3300,
                'longitude' => 15.2700,
                'accuracy' => 12,
                'speed' => 8.5,
            ])
            ->assertOk()
            ->assertJsonPath('recorded', true);

        // Le client retrouve immédiatement la dernière position et l'estimation.
        $response = $this->actingAs($this->client, 'sanctum')
            ->getJson("/api/client/orders/{$this->order->id}/tracking")
            ->assertOk()
            ->assertJsonPath('item.trip.isActive', true)
            ->assertJsonPath('item.trip.position.latitude', -4.33);

        $this->assertNotNull($response->json('item.route') ?? $response->json('item.trip.route'));

        // Arrivée : le partage s'arrête et la mission avance.
        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/trip/arrived")
            ->assertOk()
            ->assertJsonPath('item.trip.status', 'arrive');

        $this->assertSame('en_cours', $this->order->fresh()->status);

        // Plus aucune position n'est acceptée après l'arrivée.
        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/location", [
                'latitude' => -4.3350,
                'longitude' => 15.2680,
            ])
            ->assertStatus(409);
    }

    public function test_another_provider_cannot_publish_a_position_for_this_mission(): void
    {
        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/trip")
            ->assertOk();

        $intruder = $this->makeProvider('intrus@saacare.cd');

        $this->actingAs($intruder, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/location", [
                'latitude' => -4.3000,
                'longitude' => 15.3000,
            ])
            ->assertNotFound();

        $trip = OrderTrip::where('order_id', $this->order->id)->first();
        $this->assertNull($trip->last_latitude);
    }

    public function test_another_client_cannot_follow_a_mission_that_is_not_his(): void
    {
        $other = User::create([
            'full_name' => 'Autre Client',
            'email' => 'autre.client@saacare.cd',
            'password' => 'demo1234',
            'role' => 'client',
        ]);

        $this->actingAs($other, 'sanctum')
            ->getJson("/api/client/orders/{$this->order->id}/tracking")
            ->assertNotFound();
    }

    public function test_a_client_cannot_publish_a_position(): void
    {
        $this->actingAs($this->client, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/location", [
                'latitude' => -4.33,
                'longitude' => 15.27,
            ])
            ->assertForbidden();
    }

    public function test_tracking_requires_authentication(): void
    {
        $this->getJson("/api/client/orders/{$this->order->id}/tracking")->assertUnauthorized();
        $this->postJson("/api/prestataire/missions/{$this->order->id}/trip")->assertUnauthorized();
    }

    public function test_invalid_coordinates_are_rejected(): void
    {
        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/trip")
            ->assertOk();

        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/location", [
                'latitude' => 120,
                'longitude' => 15.27,
            ])
            ->assertStatus(422);

        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/location", [
                'latitude' => -4.33,
            ])
            ->assertStatus(422);
    }

    public function test_an_imprecise_position_is_not_stored(): void
    {
        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/trip")
            ->assertOk();

        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/location", [
                'latitude' => -4.33,
                'longitude' => 15.27,
                'accuracy' => 5000,
            ])
            ->assertStatus(202)
            ->assertJsonPath('ignored', true);

        $this->assertNull(OrderTrip::where('order_id', $this->order->id)->first()->last_latitude);
    }

    public function test_a_mission_that_is_not_confirmed_cannot_be_tracked(): void
    {
        $this->order->update(['status' => 'nouvelle']);

        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/trip")
            ->assertStatus(422);
    }

    public function test_cancelling_the_mission_stops_the_trip(): void
    {
        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/trip")
            ->assertOk();

        $this->actingAs($this->client, 'sanctum')
            ->patchJson("/api/client/orders/{$this->order->id}/cancel")
            ->assertOk();

        $this->assertSame('annule', OrderTrip::where('order_id', $this->order->id)->first()->status);
    }

    public function test_provider_resumes_an_interrupted_trip_without_creating_a_second_one(): void
    {
        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/trip")
            ->assertOk();

        // La PWA a été fermée puis rouverte : le même trajet est repris.
        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/trip")
            ->assertOk();

        $this->assertSame(1, OrderTrip::where('order_id', $this->order->id)->count());
    }

    public function test_admin_sees_active_missions_but_no_permanent_surveillance(): void
    {
        $admin = User::create([
            'full_name' => 'Admin',
            'email' => 'admin.test@saacare.cd',
            'password' => 'demo1234',
            'role' => 'admin',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/missions/actives')
            ->assertOk()
            ->assertJsonCount(0, 'items');

        $this->actingAs($this->provider, 'sanctum')
            ->postJson("/api/prestataire/missions/{$this->order->id}/trip")
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/missions/actives')
            ->assertOk()
            ->assertJsonCount(1, 'items')
            ->assertJsonPath('items.0.reference', 'CMD-TEST0001');

        // Un client n'accède jamais à la vue d'administration.
        $this->actingAs($this->client, 'sanctum')
            ->getJson('/api/admin/missions/actives')
            ->assertForbidden();
    }
}
