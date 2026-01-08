<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\SingleStringValueDto as SingleStringValue;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ItemDimensionsDto as ItemDimensions;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ProductInfoDto {
    private SingleStringValue $color;
    private SingleStringValue $is_adult_product;
    private ItemDimensions $item_dimensions;
    private SingleStringValue $release_date;
    private SingleStringValue $size;
    private SingleStringValue $unit_count;

    public function __construct( SingleStringValue $color, SingleStringValue $is_adult_product, ItemDimensions $item_dimensions, SingleStringValue $release_date, SingleStringValue $size, SingleStringValue $unit_count ) {
        $this->color            = $color;
        $this->is_adult_product = $is_adult_product;
        $this->item_dimensions  = $item_dimensions;
        $this->release_date     = $release_date;
        $this->size             = $size;
        $this->unit_count       = $unit_count;
    }

    public function get_color(): SingleStringValue {
        return $this->color;
    }

    public function set_color( SingleStringValue $color ): void {
        $this->color = $color;
    }

    public function get_is_adult_product(): SingleStringValue {
        return $this->is_adult_product;
    }

    public function set_is_adult_product( SingleStringValue $is_adult_product ): void {
        $this->is_adult_product = $is_adult_product;
    }

    public function get_item_dimensions(): ItemDimensions {
        return $this->item_dimensions;
    }

    public function set_item_dimensions( ItemDimensions $item_dimensions ): void {
        $this->item_dimensions = $item_dimensions;
    }

    public function get_release_date(): SingleStringValue {
        return $this->release_date;
    }

    public function set_release_date( SingleStringValue $release_date ): void {
        $this->release_date = $release_date;
    }

    public function get_size(): SingleStringValue {
        return $this->size;
    }

    public function set_size( SingleStringValue $size ): void {
        $this->size = $size;
    }

    public function get_unit_count(): SingleStringValue {
        return $this->unit_count;
    }

    public function set_unit_count( SingleStringValue $unit_count ): void {
        $this->unit_count = $unit_count;
    }

    public static function from_array( array $data ): self {
        return new self(
            SingleStringValue::from_array( $data['Color'] ?? array() ),
            SingleStringValue::from_array( $data['IsAdultProduct'] ?? array() ),
            ItemDimensions::from_array( $data['ItemDimensions'] ?? array() ),
            SingleStringValue::from_array( $data['ReleaseDate'] ?? array() ),
            SingleStringValue::from_array( $data['Size'] ?? array() ),
            SingleStringValue::from_array( $data['UnitCount'] ?? array() ),
        );
    }
}
