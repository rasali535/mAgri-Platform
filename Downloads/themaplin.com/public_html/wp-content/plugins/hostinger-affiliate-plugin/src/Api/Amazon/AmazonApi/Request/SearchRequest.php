<?php
namespace Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Request;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class SearchRequest {
    public string $keywords;

    public function __construct( string $keywords ) {
        $this->keywords = $keywords;
    }

    public function get_keywords(): string {
        return $this->keywords;
    }
}
