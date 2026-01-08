<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\SingleStringValueDto as SingleStringValue;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\LanguagesDto as Languages;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ContentInfoDto {
    private SingleStringValue $edition;
    private Languages $languages;
    private SingleStringValue $pages_count;
    private SingleStringValue $publication_date;

    public function __construct( SingleStringValue $edition, Languages $languages, SingleStringValue $pages_count, SingleStringValue $publication_date ) {
        $this->edition          = $edition;
        $this->languages        = $languages;
        $this->pages_count      = $pages_count;
        $this->publication_date = $publication_date;
    }

    public function get_edition(): SingleStringValue {
        return $this->edition;
    }

    public function set_edition( SingleStringValue $edition ): void {
        $this->edition = $edition;
    }

    public function get_languages(): Languages {
        return $this->languages;
    }

    public function set_languages( Languages $languages ): void {
        $this->languages = $languages;
    }

    public function get_pages_count(): SingleStringValue {
        return $this->pages_count;
    }

    public function set_pages_count( SingleStringValue $pages_count ): void {
        $this->pages_count = $pages_count;
    }

    public function get_publication_date(): SingleStringValue {
        return $this->publication_date;
    }

    public function set_publication_date( SingleStringValue $publication_date ): void {
        $this->publication_date = $publication_date;
    }

    public static function from_array( array $data ): self {
        return new self(
            SingleStringValue::from_array( $data['Edition'] ?? array() ),
            Languages::from_array( $data['Languages'] ?? array() ),
            SingleStringValue::from_array( $data['PagesCount'] ?? array() ),
            SingleStringValue::from_array( $data['PublicationDate'] ?? array() ),
        );
    }
}
