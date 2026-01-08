<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ImageTypeDto as ImageType;

class ImagesDto {
    private ImageType $primary;

    public function __construct( ImageType $primary ) {
        $this->primary = $primary;
    }

    public function get_primary(): ImageType {
        return $this->primary;
    }

    public function set_primary( ImageType $primary ): void {
        $this->primary = $primary;
    }

    public static function from_array( array $data ): self {
        return new self(
            ImageType::from_array( $data['Primary'] ?? array() )
        );
    }
}
