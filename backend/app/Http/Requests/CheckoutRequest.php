<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $authenticated = $this->user('sanctum') !== null;

        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],

            'guest_name' => [$authenticated ? 'nullable' : 'required', 'string', 'max:255'],
            'guest_email' => [$authenticated ? 'nullable' : 'required', 'email', 'max:255'],
            'guest_phone' => ['nullable', 'string', 'max:32'],

            // Either a saved address (authenticated customers only) or a full
            // set of shipping fields — never both required at once.
            'address_id' => ['nullable', 'integer', 'exists:addresses,id'],
            'shipping' => ['required_without:address_id', 'array'],
            'shipping.recipient_name' => ['required_without:address_id', 'string', 'max:255'],
            'shipping.phone' => ['required_without:address_id', 'string', 'max:32'],
            'shipping.line1' => ['required_without:address_id', 'string', 'max:255'],
            'shipping.line2' => ['nullable', 'string', 'max:255'],
            'shipping.city' => ['required_without:address_id', 'string', 'max:255'],
            'shipping.state' => ['nullable', 'string', 'max:255'],
            'shipping.postal_code' => ['required_without:address_id', 'string', 'max:32'],
            'shipping.country' => ['nullable', 'string', 'size:2'],

            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
