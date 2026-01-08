<?php
namespace Hostinger\AffiliatePlugin\Api\Amazon\ProxyApi;

use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApiInterface;
use Hostinger\AffiliatePlugin\Api\Amazon\ProxyApi\Api\ProductApi;
use Hostinger\AffiliatePlugin\Api\Amazon\ProxyApi\Api\SearchApi;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ProxyApi implements AmazonApiInterface {
    private Client $client;
    private ProductRepository $product_repository;
    public function __construct( Client $client, ProductRepository $product_repository ) {
        $this->client             = $client;
        $this->product_repository = $product_repository;
    }

    public function search_api(): SearchApi {
        return new SearchApi( $this->client );
    }

    public function product_api(): ProductApi {
        return new ProductApi( $this->client, $this->product_repository );
    }
}
