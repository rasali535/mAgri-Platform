<?php
namespace Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi;

use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Api\ProductApi;
use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Api\SearchApi;
use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApiInterface;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class AmazonApi implements AmazonApiInterface {
    private Client $client;

    public function __construct( Client $client ) {
        $this->client = $client;
    }

    public function get_client(): Client {
        return $this->client;
    }

    public function search_api(): SearchApi {
        return new SearchApi( $this->client );
    }

    public function product_api(): ProductApi {
        return new ProductApi( $this->client );
    }
}
