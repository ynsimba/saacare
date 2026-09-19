<?php

namespace Tests\Feature;

use App\Models\ProviderProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminCreateUserTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::create([
            'full_name' => 'Super Admin',
            'email' => 'super@saacare.cd',
            'password' => 'demo1234',
            'role' => 'admin',
            'is_super_admin' => true,
        ]);

        $this->admin = User::create([
            'full_name' => 'Admin Simple',
            'email' => 'admin@saacare.cd',
            'password' => 'demo1234',
            'role' => 'admin',
            'is_super_admin' => false,
        ]);
    }

    public function test_super_admin_can_create_client(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/admin/utilisateurs', [
                'fullName' => 'Nouveau Client',
                'email' => 'client.nouveau@saacare.cd',
                'password' => 'secret123',
                'role' => 'client',
                'phone' => '+243810000001',
                'commune' => 'Gombe',
            ]);

        $response->assertCreated()
            ->assertJsonPath('item.fullName', 'Nouveau Client')
            ->assertJsonPath('item.email', 'client.nouveau@saacare.cd')
            ->assertJsonPath('item.role', 'client')
            ->assertJsonPath('item.isSuperAdmin', false);

        $this->assertDatabaseHas('users', [
            'email' => 'client.nouveau@saacare.cd',
            'role' => 'client',
            'commune' => 'Gombe',
        ]);
    }

    public function test_super_admin_creating_prestataire_gets_provider_stub(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/admin/utilisateurs', [
                'fullName' => 'Ada Prestataire',
                'email' => 'ada.pro@saacare.cd',
                'password' => 'secret123',
                'role' => 'prestataire',
                'commune' => 'Ngaliema',
            ]);

        $response->assertCreated()->assertJsonPath('item.role', 'prestataire');

        $user = User::where('email', 'ada.pro@saacare.cd')->first();
        $this->assertNotNull($user);

        $profile = ProviderProfile::where('user_id', $user->id)->first();
        $this->assertNotNull($profile);
        $this->assertSame('pending', $profile->status);
        $this->assertSame(['Ngaliema'], $profile->zones);
    }

    public function test_super_admin_can_create_admin_with_super_flag(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/admin/utilisateurs', [
                'fullName' => 'Autre Super',
                'email' => 'autre.super@saacare.cd',
                'password' => 'secret123',
                'role' => 'admin',
                'isSuperAdmin' => true,
            ]);

        $response->assertCreated()
            ->assertJsonPath('item.role', 'admin')
            ->assertJsonPath('item.isSuperAdmin', true);
    }

    public function test_is_super_admin_ignored_for_non_admin_roles(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/admin/utilisateurs', [
                'fullName' => 'Client Flag',
                'email' => 'client.flag@saacare.cd',
                'password' => 'secret123',
                'role' => 'client',
                'isSuperAdmin' => true,
            ]);

        $response->assertCreated()->assertJsonPath('item.isSuperAdmin', false);
    }

    public function test_regular_admin_cannot_create_users(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/utilisateurs', [
                'fullName' => 'Bloqué',
                'email' => 'bloque@saacare.cd',
                'password' => 'secret123',
                'role' => 'client',
            ])
            ->assertForbidden();
    }

    public function test_validation_rejects_duplicate_email(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/admin/utilisateurs', [
                'fullName' => 'Doublon',
                'email' => 'admin@saacare.cd',
                'password' => 'secret123',
                'role' => 'client',
            ])
            ->assertStatus(422)
            ->assertJsonStructure(['error', 'details']);
    }
}
