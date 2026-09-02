<x-mail::message>
# New contact form message

**From:** {{ $senderName }} ({{ $senderEmail }})

{{ $body }}

<x-mail::button :url="'mailto:'.$senderEmail">
Reply to {{ $senderName }}
</x-mail::button>

Sent from the Contact form at one-organic.com.
</x-mail::message>
