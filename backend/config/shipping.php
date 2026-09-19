<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Ship-from address (Phase 1.1)
    |--------------------------------------------------------------------------
    |
    | Used as the "from" side of every SHIPPOP rate/booking request. Taken
    | directly from a real 2026.09.01 SPX Express shipping label (an actual
    | past order), not guessed — the phone number wasn't printed on that
    | label though, so it's the one piece here that's genuinely missing;
    | set SHIPPING_ORIGIN_PHONE in .env once known rather than leaving a
    | placeholder that looks like a real number.
    |
    */

    'origin' => [
        'name' => 'OneOrganicTH',
        'address' => '1/26 ลาซาลพาร์ค ตึกเอ ซอยลาซาล 10 ถนนสุขุมวิท 105',
        'district' => 'บางนาใต้',
        'state' => 'บางนา',
        'province' => 'กรุงเทพมหานคร',
        'postcode' => '10260',
        'tel' => env('SHIPPING_ORIGIN_PHONE', ''),
    ],

];
