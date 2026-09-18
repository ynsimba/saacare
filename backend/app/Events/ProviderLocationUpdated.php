<?php

namespace App\Events;

use App\Models\Order;
use App\Models\OrderTrip;
use App\Support\TripPayload;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Nouvelle position du prestataire pendant un trajet.
 *
 * Diffusé sur le canal PRIVÉ `mission.{orderId}` (voir routes/channels.php) :
 * seuls le client propriétaire, le prestataire affecté et un admin y accèdent.
 *
 * Avec BROADCAST_CONNECTION=log (valeur par défaut, hébergement mutualisé),
 * l'événement est simplement journalisé : le front bascule alors sur son
 * transport de secours (interrogation espacée). Aucune configuration
 * supplémentaire n'est nécessaire pour que la fonctionnalité marche.
 */
class ProviderLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Order $order,
        public OrderTrip $trip,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('mission.'.$this->order->id)];
    }

    public function broadcastAs(): string
    {
        return 'provider.location.updated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'orderId' => $this->order->id,
            'trip' => TripPayload::trip($this->trip),
            'serverTime' => now()->toIso8601String(),
        ];
    }
}
