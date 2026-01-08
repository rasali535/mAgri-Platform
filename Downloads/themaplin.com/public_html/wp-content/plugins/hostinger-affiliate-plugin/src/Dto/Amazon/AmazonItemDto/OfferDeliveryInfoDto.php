<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class OfferDeliveryInfoDto {
    private bool $is_prime_eligible;
    private bool $is_free_shipping_eligible;

    public function __construct( bool $is_prime_eligible, bool $is_free_shipping_eligible ) {
        $this->is_prime_eligible         = $is_prime_eligible;
        $this->is_free_shipping_eligible = $is_free_shipping_eligible;
    }

    public function get_is_prime_eligible(): bool {
        return $this->is_prime_eligible;
    }

    public function set_is_prime_eligible( bool $is_prime_eligible ): void {
        $this->is_prime_eligible = $is_prime_eligible;
    }

    public function get_is_free_shipping_eligible(): bool {
        return $this->is_free_shipping_eligible;
    }

    public function set_is_free_shipping_eligible( bool $is_free_shipping_eligible ): void {
        $this->is_free_shipping_eligible = $is_free_shipping_eligible;
    }

    public static function from_array( array $data ): self {
        return new self(
            $data['IsPrimeEligible'] ?? '',
            $data['IsFreeShippingEligible'] ?? '',
        );
    }
}
