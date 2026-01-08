<?php
namespace Hostinger\AffiliatePlugin\Api\Mercado;

use Hostinger\AffiliatePlugin\Api\Mercado\Api\ProductApi;
use Hostinger\AffiliatePlugin\Api\Mercado\Api\SearchApi;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;
use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Api\RequestsClient;
use Hostinger\WpHelper\Utils;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class MercadoApi {
    private Client $client;
    private ProductRepository $product_repository;
    private PluginSettings $plugin_settings;

    public function __construct( ProductRepository $product_repository, PluginSettings $plugin_settings, RequestsClient $requests_client, Utils $utils ) {
        $this->product_repository = $product_repository;
        $this->plugin_settings    = $plugin_settings;
        $client_factory           = new ClientFactory( $plugin_settings, $requests_client, $utils );
        $this->client             = $client_factory->create_client();
    }

    public function search_api(): SearchApi {
        return new SearchApi( $this->client, $this->plugin_settings );
    }

    public function product_api(): ProductApi {
        return new ProductApi( $this->client, $this->product_repository, $this->plugin_settings );
    }
}
