<?php

namespace Tests\Unit;

use App\Services\ShippopClient;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ShippopClientTest extends TestCase
{
    #[DataProvider('bangkokMetroPostcodes')]
    public function test_bangkok_metro_postcodes_route_to_kerry_express(string $postcode): void
    {
        $this->assertSame('KRYX', (new ShippopClient)->courierCodeForPostcode($postcode));
    }

    public static function bangkokMetroPostcodes(): array
    {
        return [
            'Bangkok' => ['10110'],
            'Samut Prakan' => ['10270'],
            'Nonthaburi' => ['11000'],
            'Pathum Thani' => ['12000'],
        ];
    }

    #[DataProvider('upcountryPostcodes')]
    public function test_upcountry_postcodes_route_to_shopee_xpress(string $postcode): void
    {
        $this->assertSame('SPX', (new ShippopClient)->courierCodeForPostcode($postcode));
    }

    public static function upcountryPostcodes(): array
    {
        return [
            'Chiang Mai' => ['50200'],
            'Khon Kaen' => ['40000'],
            'Phuket' => ['83000'],
            'Songkhla' => ['90110'],
        ];
    }
}
