<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\MultiValuedDto as MultiValued;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class TechnicalInfoDto {
    private MultiValued $formats;

    public function __construct( MultiValued $formats ) {
        $this->formats = $formats;
    }

    public function get_formats(): MultiValued {
        return $this->formats;
    }

    public function set_formats( MultiValued $formats ): void {
        $this->formats = $formats;
    }

    public static function from_array( array $data ): self {
        return new self(
            MultiValued::from_array( $data['Formats'] ?? array() )
        );
    }
}
