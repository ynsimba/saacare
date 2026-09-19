<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuoteRequest;
use App\Models\ServiceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminLeadController extends Controller
{
    public function serviceRequests(): JsonResponse
    {
        $items = ServiceRequest::query()
            ->latest()
            ->get()
            ->map(fn (ServiceRequest $r) => $this->serializeServiceRequest($r));

        return response()->json(['items' => $items]);
    }

    public function updateServiceRequest(Request $request, int $id): JsonResponse
    {
        $item = ServiceRequest::query()->findOrFail($id);
        $data = $request->validate([
            'status' => ['required', Rule::in(['nouvelle', 'en_cours', 'traitee', 'annulee'])],
        ]);
        $item->status = $data['status'];
        $item->save();

        return response()->json(['item' => $this->serializeServiceRequest($item)]);
    }

    public function quoteRequests(): JsonResponse
    {
        $items = QuoteRequest::query()
            ->latest()
            ->get()
            ->map(fn (QuoteRequest $r) => $this->serializeQuoteRequest($r));

        return response()->json(['items' => $items]);
    }

    public function updateQuoteRequest(Request $request, int $id): JsonResponse
    {
        $item = QuoteRequest::query()->findOrFail($id);
        $data = $request->validate([
            'status' => ['required', Rule::in(['nouvelle', 'en_cours', 'traitee', 'annulee'])],
        ]);
        $item->status = $data['status'];
        $item->save();

        return response()->json(['item' => $this->serializeQuoteRequest($item)]);
    }

    private function serializeServiceRequest(ServiceRequest $r): array
    {
        return [
            'id' => $r->id,
            'reference' => $r->reference,
            'service' => $r->service,
            'commune' => $r->commune,
            'frequency' => $r->frequency,
            'desiredDate' => $r->desired_date?->toDateString(),
            'dueDate' => $r->due_date?->toDateString(),
            'firstName' => $r->first_name,
            'phone' => $r->phone,
            'email' => $r->email,
            'address' => $r->address ?? '',
            'need' => $r->need,
            'providerReference' => $r->provider_reference,
            'status' => $r->status,
            'source' => $r->source,
            'createdAt' => $r->created_at?->toIso8601String(),
        ];
    }

    private function serializeQuoteRequest(QuoteRequest $r): array
    {
        return [
            'id' => $r->id,
            'reference' => $r->reference,
            'company' => $r->company,
            'contactName' => $r->contact_name,
            'email' => $r->email,
            'phone' => $r->phone,
            'needType' => $r->need_type,
            'duration' => $r->duration,
            'location' => $r->location,
            'startDate' => $r->start_date?->toDateString(),
            'message' => $r->message ?? '',
            'positions' => $r->positions ?? [],
            'status' => $r->status,
            'createdAt' => $r->created_at?->toIso8601String(),
        ];
    }
}
