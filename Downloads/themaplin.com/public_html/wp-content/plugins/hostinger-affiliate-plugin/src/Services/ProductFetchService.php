<?php

namespace Hostinger\AffiliatePlugin\Services;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Request\GetProductDataRequest;
use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Request\SearchRequest;
use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApiFactory;
use Hostinger\AffiliatePlugin\Api\Mercado\MercadoApi;
use Hostinger\AffiliatePlugin\Models\Product;
use Hostinger\AffiliatePlugin\Repositories\ListRepository;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;
use Hostinger\AffiliatePlugin\Amplitude\Events as AmplitudeEvents;
use Exception;
use Hostinger\AffiliatePlugin\Transformers\ProductTransformerFactory;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ProductFetchService {
    private PluginSettings $plugin_settings;
    private ProductRepository $product_repository;
    private ListRepository $list_repository;
    private AmazonApiFactory $amazon_api_factory;
    private AmplitudeEvents $amplitude_events;
    private ProductTransformerFactory $product_transformer_factory;
    private MercadoApi $mercado_api;

    public function __construct( PluginSettings $plugin_settings, ProductRepository $product_repository, ListRepository $list_repository, AmazonApiFactory $amazon_api_factory, AmplitudeEvents $amplitude_events, ProductTransformerFactory $product_transformer_factory, MercadoApi $mercado_api ) {
        $this->plugin_settings             = $plugin_settings;
        $this->product_repository          = $product_repository;
        $this->list_repository             = $list_repository;
        $this->amazon_api_factory          = $amazon_api_factory;
        $this->amplitude_events            = $amplitude_events;
        $this->product_transformer_factory = $product_transformer_factory;
        $this->mercado_api                 = $mercado_api;
    }

    public function find_missing_products( array $products, array $asins ): array {
        if ( empty( $products ) ) {
            return $asins;
        }

        $product_map = array();
        foreach ( $products as $product ) {
            $product_map[ $product->get_asin() ] = true;
        }

        $missing_products = array();
        foreach ( $asins as $asin ) {
            if ( ! isset( $product_map[ $asin ] ) ) {
                $missing_products[] = $asin;
            }
        }

        return $missing_products;
    }

    /**
     * @throws Exception
     */
    public function pull_products( array $asins, string $layout, string $marketplace = 'amazon' ): array {
        $products = array();

        $this->product_repository->set_marketplace( $marketplace );
        $products_in_db   = $this->product_repository->get_by_asins( $asins );
        $missing_products = $this->find_missing_products( $products_in_db, $asins );

        if ( ! empty( $products_in_db ) ) {
            $products = $products_in_db;
        }

        if ( ! empty( $missing_products ) ) {
            $fetched_products = $this->fetch_products_from_api( $missing_products, $layout, $marketplace );
            if ( ! empty( $fetched_products ) ) {
                foreach ( $fetched_products as $product ) {
                    $products[] = $product;

                    if ( $product instanceof Product ) {
                        $this->product_repository->insert( $product->to_array() );
                    }
                }
            }
        }

        return $products;
    }

    public function pull_bestsellers( string $keywords, string $layout ): mixed {
        $products = array();
        $list     = $this->list_repository->get_by_keywords( $keywords );

        if ( empty( $list ) ) {
            $response = $this->search_items( $keywords );
            if ( is_wp_error( $response ) ) {
                return $response;
            }

            $length = ! $this->plugin_settings->get_plugin_settings()->amazon->use_amazon_api() ? 3 : 10;
            $asins  = array();
            $items  = array_slice( $response, 0, $length );
            foreach ( $items as $item ) {
                $asins[] = $item->get_asin();
            }

            if ( ! $this->plugin_settings->get_plugin_settings()->amazon->use_amazon_api() ) {
                try {
                    $asins = $this->pull_products( $asins, $layout );
                    $asins = array_map(
                        function ( $product ) {
                            if ( empty( $product ) ) {
                                return '';
                            }

                            return $product->get_asin();
                        },
                        $asins
                    );

                    $asins = array_filter(
                        $asins,
                        function ( $asin ) {
                            return ! empty( $asin );
                        }
                    );
                } catch ( \Exception $e ) {
                    error_log( 'Hostinger Amazon Affiliate: Error pulling products for bestsellers - ' . $e->getMessage() );
                }
            }

            $products_in_db   = $this->product_repository->get_by_asins( $asins );
            $missing_products = $this->find_missing_products( $products_in_db, $asins );
            if ( ! empty( $products_in_db ) ) {
                $products = $products_in_db;
            }

            if ( ! empty( $missing_products ) ) {
                foreach ( $items as $item ) {
                    if ( in_array( $item->get_asin(), $missing_products, true ) ) {
                        $products[] = $this->product_repository->create_from_api( $item );
                    }
                }
            }

            $list_already_created = $this->list_repository->get_by_keywords( $keywords );

            if ( ! empty( $list_already_created ) ) {
                return $this->product_repository->get_by_asins( explode( ',', $list_already_created[0]['asins'] ) );
            }

            $list = array(
                'keywords'   => $keywords,
                'asins'      => implode( ',', $asins ),
                'created_at' => gmdate( 'Y-m-d H:i:s' ),
                'updated_at' => gmdate( 'Y-m-d H:i:s' ),
            );
            $this->list_repository->insert( $list );
        } else {
            $products = $this->product_repository->get_by_asins( explode( ',', $list[0]['asins'] ) );
        }

        return $products;
    }

    /**
     * @throws Exception
     */
    public function fetch_products_from_api( array $asins, string $layout = '', string $marketplace = 'amazon' ): array|Exception {
        $products = $this->get_items( $asins, $marketplace );
        if ( is_wp_error( $products ) ) {
            $this->handle_amazon_errors( $products );
        }

        $this->amplitude_events->affiliate_created( $layout, $marketplace );

        return $products;
    }

    /**
     * @throws Exception
     */
    private function handle_amazon_errors( WP_Error $error ): Exception {
        $reversed_error_messages = implode( ', ', array_reverse( $error->get_error_messages() ) );

        if ( current_user_can( 'administrator' ) ) {
            $formatted_errors = $reversed_error_messages;
        } else {
            $formatted_errors = __(
                'There is an issue displaying Amazon products. Please contact the administrator to check that.',
                'hostinger-affiliate-plugin'
            );
        }

        throw new Exception( $formatted_errors );
    }

    public function get_items( array $item_ids, string $marketplace = 'amazon' ): array|WP_Error {
        $product_data_request = new GetProductDataRequest( $item_ids );

        switch ( $marketplace ) {
            case 'mercado':
                $response = $this->mercado_api->product_api()->product_data( $product_data_request );
                break;
            case 'amazon':
            default:
                $api_factory = $this->amazon_api_factory->get_api_factory( $this->plugin_settings->get_plugin_settings()->amazon->use_amazon_api() );

                $response = $api_factory->product_api()->product_data( $product_data_request );
                break;
        }

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        return $this->parse_items( $response, $marketplace );
    }

    public function search_items( string $keywords, string $marketplace = 'amazon' ): array|WP_Error {
        $search_request = new SearchRequest( $keywords );

        switch ( $marketplace ) {
            case 'mercado':
                $response = $this->mercado_api->search_api()->search( $search_request );
                break;
            case 'amazon':
            default:
                $api_factory = $this->amazon_api_factory->get_api_factory( $this->plugin_settings->get_plugin_settings()->amazon->use_amazon_api() );
                $response    = $api_factory->search_api()->search( $search_request );
                break;
        }

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        return $this->parse_items( $response, $marketplace );
    }

    private function parse_items( array $items, string $marketplace = 'amazon' ): array {
        $products            = array();
        $product_transformer = $this->product_transformer_factory->get_transformer(
            $this->plugin_settings->get_plugin_settings()->amazon->use_amazon_api(),
            $marketplace
        );

        foreach ( $items as $item ) {
            $transformed_item = $product_transformer->transform( $item );
            $products[]       = Product::create_from_api( $transformed_item );
        }

        return $products;
    }
}
