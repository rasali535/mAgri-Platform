<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\SingleStringValueDto as SingleStringValue;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ContentRatingDto {
    private SingleStringValue $audience_rating;

    public function __construct( SingleStringValue $audience_rating ) {
        $this->audience_rating = $audience_rating;
    }

    public function get_audience_rating(): SingleStringValue {
        return $this->audience_rating;
    }

    public function set_audience_rating( SingleStringValue $audience_rating ): void {
        $this->audience_rating = $audience_rating;
    }

    public static function from_array( array $data ): self {
        return new self(
            SingleStringValue::from_array( $data['AudienceRating'] ?? array() ),
        );
    }
}
