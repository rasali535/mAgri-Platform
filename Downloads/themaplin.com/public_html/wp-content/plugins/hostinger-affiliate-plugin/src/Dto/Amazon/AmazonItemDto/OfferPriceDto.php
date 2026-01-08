<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class OfferPriceDto {
    private string $currency;
    private string $amount;

    public function __construct( string $currency, string $amount ) {
        $this->currency = $currency;
        $this->amount   = $amount;
    }

    public function get_currency(): string {
        return $this->currency;
    }

    public function set_currency( string $currency ): void {
        $this->currency = $currency;
    }

    public function get_amount(): string {
        return $this->amount;
    }

    public function set_amount( string $amount ): void {
        $this->amount = $amount;
    }

    public static function from_array( array $data ): self {
        return new self(
            $data['Currency'] ?? '',
            $data['Amount'] ?? '',
        );
    }
}
