<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\OfferListingDto as OfferListing;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class OffersDto {
    private array $listings;

    public function __construct( array $listings ) {
        $this->listings = $listings;
    }

    public function get_listings(): array {
        return $this->listings;
    }

    public function set_listings( array $listings ): void {
        $this->listings = $listings;
    }

    public static function from_array( array $data ): self {
        $listings = array_map(
            fn( $listing ) => OfferListing::from_array( $listing ),
            $data['Listings'] ?? array()
        );

        return new self(
            $listings
        );
    }
}
