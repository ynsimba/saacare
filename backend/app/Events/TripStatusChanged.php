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
 * Départ, arrivée ou annulation d'un trajet — même canal privé que les positions.
 */
class TripStatusChanged implements ShouldBroadcast
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
        return 'trip.status.changed';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'orderId' => $this->order->id,
            'orderStatus' => $this->order->status,
            'trip' => TripPayload::trip($this->trip),
            'serverTime' => now()->toIso8601String(),
        ];
    }
}
