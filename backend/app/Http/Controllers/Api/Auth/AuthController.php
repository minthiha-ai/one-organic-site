<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $customer = Customer::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'phone' => $request->input('phone'),
            'password' => $request->string('password'), // hashed via model cast
        ]);

        $token = $customer->createToken('storefront')->plainTextToken;

        return response()->json([
            'customer' => new CustomerResource($customer),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $customer = Customer::where('email', $request->string('email'))->first();

        if (! $customer || ! $customer->password || ! Hash::check($request->string('password'), $customer->password)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $token = $customer->createToken('storefront')->plainTextToken;

        return response()->json([
            'customer' => new CustomerResource($customer),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        return new CustomerResource($request->user());
    }
}
