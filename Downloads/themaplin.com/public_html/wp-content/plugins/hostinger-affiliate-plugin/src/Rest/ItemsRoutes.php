<?php

namespace Hostinger\AffiliatePlugin\Rest;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Api\AmazonFetch;
use Hostinger\AffiliatePlugin\Errors\AmazonApiError;
use Hostinger\AffiliatePlugin\Localization\Messages;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;
use Hostinger\AffiliatePlugin\Amplitude\Actions as AmplitudeActions;
use Hostinger\AffiliatePlugin\Services\ProductFetchService;
use Hostinger\AffiliatePlugin\Shortcodes\ShortcodeManager;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use WP_Http;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ItemsRoutes {
    private PluginSettings $plugin_settings;
    private ProductRepository $product_repository;
    private ProductFetchService $product_fetch_service;
    private ShortcodeManager $shortcode_manager;

    public function __construct( PluginSettings $plugin_settings, ProductRepository $product_repository, ProductFetchService $product_fetch_service, ShortcodeManager $shortcode_manager ) {
        $this->plugin_settings       = $plugin_settings;
        $this->product_repository    = $product_repository;
        $this->product_fetch_service = $product_fetch_service;
        $this->shortcode_manager     = $shortcode_manager;
    }

    public function search_items( WP_REST_Request $request ): WP_REST_Response|AmazonApiError|WP_Error {
        $parameters = $request->get_params();

        $errors = array();

        if ( empty( $parameters['keyword'] ) ) {
            $errors['keyword'] = Messages::get_missing_field_message( str_replace( '_', ' ', 'keyword' ) );
        }

        if ( ! empty( $errors ) ) {
            return new WP_Error(
                'data_invalid',
                __( 'Sorry, there are validation errors.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                    'errors' => $errors,
                )
            );
        }

        $search_keyword = sanitize_text_field( $parameters['keyword'] );
        $marketplace    = isset( $parameters['marketplace'] ) ? sanitize_text_field( $parameters['marketplace'] ) : 'amazon';

        $response = $this->product_fetch_service->search_items( $search_keyword, $marketplace );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        if ( count( $response ) === 0 ) {
            return new WP_Error(
                'no_results',
                __( 'No results found.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                )
            );
        }

        $data = array(
            'data' => array(
                'items' => count( $response ),
                'html'  => $this->render_item_results( $response ),
            ),
        );

        $response = new WP_REST_Response( $data );

        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );

        $response->set_status( WP_Http::OK );

        return $response;
    }

    public function validate_items( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $parameters = $request->get_params();

        $errors = array();

        if ( empty( $parameters['items'] ) ) {
            $errors[] = Messages::get_missing_field_message( str_replace( '_', ' ', 'items' ) );
        }

        $marketplace          = isset( $parameters['marketplace'] ) ? sanitize_text_field( $parameters['marketplace'] ) : 'amazon';
        $allowed_marketplaces = array( 'amazon', 'mercado' );

        if ( ! in_array( $marketplace, $allowed_marketplaces, true ) ) {
            $errors[] = Messages::get_missing_field_message( 'marketplace' );
        } else {
            $this->product_repository->set_marketplace( $marketplace );
        }

        $items = $this->product_repository->clean_asin( $parameters['items'] );

        if ( empty( $this->product_repository->validate_asins( $items ) ) ) {
            $errors[] = Messages::get_failed_asin_validation_message();
        }

        $layout = $parameters['layout'];

        if ( ! in_array( $layout, AmplitudeActions::AFFILIATE_ALLOWED_LAYOUTS, true ) ) {
            $errors[] = Messages::get_unknown_layout_message();
        }

        if ( ! empty( $errors ) ) {
            return new WP_Error(
                'data_invalid',
                __( 'Sorry, there are validation errors.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => \WP_Http::BAD_REQUEST,
                    'errors' => $errors,
                )
            );
        }

        try {
            $products = $this->product_fetch_service->pull_products( $items, $layout, $marketplace );
        } catch ( \Exception $e ) {
            $errors = array(
                'data' => array( 'errors' => array( $e->getMessage() ) ),
            );

            $response = new WP_REST_Response( $errors );
            $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
            $response->set_status( WP_Http::BAD_REQUEST );

            return $response;
        }

        $response_data = array(
            'data'  => 'OK',
            'items' => $this->product_repository->format_asins( $products ),
        );

        $response = new WP_REST_Response( $response_data );
        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
        $response->set_status( WP_Http::OK );

        return $response;
    }

    private function render_item_results( array $response ): string {
        if ( empty( $response ) ) {
            return '';
        }

        $content = '';

        ob_start();

        require_once __DIR__ . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'search-results.php';

        $content = ob_get_contents();

        ob_end_clean();

        return $content;
    }
}
