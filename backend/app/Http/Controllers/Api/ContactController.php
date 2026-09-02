<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Mail\ContactMessageMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(ContactRequest $request): JsonResponse
    {
        Mail::to(config('mail.contact_recipient', 'hello@one-organic.com'))
            ->send(new ContactMessageMail(
                senderName: $request->string('name'),
                senderEmail: $request->string('email'),
                body: $request->string('message'),
            ));

        return response()->json(['message' => 'Sent.']);
    }
}
