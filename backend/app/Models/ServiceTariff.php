<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'domain',
    'service_name',
    'unit',
    'unit_label',
    'duration_label',
    'amount_min',
    'amount_max',
    'currency',
    'description',
    'is_active',
    'sort_order',
])]
class ServiceTariff extends Model
{
    protected function casts(): array
    {
        return [
            'amount_min' => 'integer',
            'amount_max' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'domain' => $this->domain,
            'serviceName' => $this->service_name,
            'unit' => $this->unit,
            'unitLabel' => $this->unit_label ?? '',
            'durationLabel' => $this->duration_label ?? '',
            'amountMin' => (int) $this->amount_min,
            'amountMax' => $this->amount_max !== null ? (int) $this->amount_max : null,
            'currency' => $this->currency ?: 'CDF',
            'description' => $this->description ?? '',
            'isActive' => (bool) $this->is_active,
            'sortOrder' => (int) $this->sort_order,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
