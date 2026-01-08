<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\OfferPriceDto as OfferPrice;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\OfferDeliveryInfoDto as OfferDeliveryInfo;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class OfferListingDto {
    private OfferPrice $price;
    private OfferDeliveryInfo $delivery_info;

    public function __construct( OfferPrice $price, OfferDeliveryInfo $delivery_info ) {
        $this->price         = $price;
        $this->delivery_info = $delivery_info;
    }

    public function get_price(): OfferPrice {
        return $this->price;
    }

    public function set_price( OfferPrice $price ): void {
        $this->price = $price;
    }

    public function get_delivery_info(): OfferDeliveryInfo {
        return $this->delivery_info;
    }

    public function set_delivery_info( OfferDeliveryInfo $delivery_info ): void {
        $this->delivery_info = $delivery_info;
    }

    public static function from_array( array $data ): self {
        return new self(
            OfferPrice::from_array( $data['Price'] ?? array() ),
            OfferDeliveryInfo::from_array( $data['DeliveryInfo'] ?? array() ),
        );
    }
}
