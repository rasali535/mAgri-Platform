<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ImageSizeDto as ImageSize;

class ImageTypeDto {
    private ImageSize $small;
    private ImageSize $medium;
    private ImageSize $large;

    public function __construct( ImageSize $small, ImageSize $medium, ImageSize $large ) {
        $this->small  = $small;
        $this->medium = $medium;
        $this->large  = $large;
    }

    public function get_small(): ImageSize {
        return $this->small;
    }

    public function set_small( ImageSize $small ): void {
        $this->small = $small;
    }

    public function get_medium(): ImageSize {
        return $this->medium;
    }

    public function set_medium( ImageSize $medium ): void {
        $this->medium = $medium;
    }

    public function get_large(): ImageSize {
        return $this->large;
    }

    public function set_large( ImageSize $large ): void {
        $this->large = $large;
    }

    public static function from_array( array $data ): self {
        return new self(
            ImageSize::from_array( $data['Small'] ?? array() ),
            ImageSize::from_array( $data['Medium'] ?? array() ),
            ImageSize::from_array( $data['Large'] ?? array() )
        );
    }
}
