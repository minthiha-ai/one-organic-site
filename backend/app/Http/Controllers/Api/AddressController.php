<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return AddressResource::collection($request->user()->addresses()->get());
    }

    public function store(AddressRequest $request)
    {
        $customer = $request->user();

        if ($request->boolean('is_default')) {
            $customer->addresses()->update(['is_default' => false]);
        }

        $address = $customer->addresses()->create($request->validated());

        return new AddressResource($address);
    }

    public function update(AddressRequest $request, Address $address)
    {
        $this->authorizeOwnership($request, $address);

        if ($request->boolean('is_default')) {
            $address->customer->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($request->validated());

        return new AddressResource($address);
    }

    public function destroy(Request $request, Address $address)
    {
        $this->authorizeOwnership($request, $address);

        $address->delete();

        return response()->json(null, 204);
    }

    protected function authorizeOwnership(Request $request, Address $address): void
    {
        if ($address->customer_id !== $request->user()->id) {
            abort(403);
        }
    }
}
