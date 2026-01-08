<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\SingleStringValueDto as SingleStringValue;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ItemDimensionsDto {
    private SingleStringValue $height;
    private SingleStringValue $length;
    private SingleStringValue $weight;
    private SingleStringValue $width;

    public function __construct( SingleStringValue $height, SingleStringValue $length, SingleStringValue $weight, SingleStringValue $width ) {
        $this->height = $height;
        $this->length = $length;
        $this->weight = $weight;
        $this->width  = $width;
    }

    public function get_height(): SingleStringValue {
        return $this->height;
    }

    public function set_height( SingleStringValue $height ): void {
        $this->height = $height;
    }

    public function get_length(): SingleStringValue {
        return $this->length;
    }

    public function set_length( SingleStringValue $length ): void {
        $this->length = $length;
    }

    public function get_weight(): SingleStringValue {
        return $this->weight;
    }

    public function set_weight( SingleStringValue $weight ): void {
        $this->weight = $weight;
    }

    public function get_width(): SingleStringValue {
        return $this->width;
    }

    public function set_width( SingleStringValue $width ): void {
        $this->width = $width;
    }

    public static function from_array( array $data ): self {
        return new self(
            SingleStringValue::from_array( $data['Height'] ?? array() ),
            SingleStringValue::from_array( $data['Length'] ?? array() ),
            SingleStringValue::from_array( $data['Weight'] ?? array() ),
            SingleStringValue::from_array( $data['Width'] ?? array() ),
        );
    }
}
