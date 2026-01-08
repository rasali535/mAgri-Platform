<?php

namespace Hostinger\AffiliatePlugin\Services;

use Hostinger\AffiliatePlugin\Admin\Options\PluginOptions;
use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ProductUpdateService {
    private ProductRepository $product_repository;
    private ProductFetchService $product_fetch_service;
    private PluginSettings $plugin_settings;

    public function __construct( ProductRepository $product_repository, ProductFetchService $product_fetch_service, PluginSettings $plugin_settings ) {
        $this->product_repository    = $product_repository;
        $this->product_fetch_service = $product_fetch_service;
        $this->plugin_settings       = $plugin_settings;
    }

    public function init(): void {
        add_action( 'hostinger_affiliate_product_update', array( $this, 'handle_product_update' ) );
    }

    public function handle_product_update(): bool {
        $lock_key      = 'hostinger_affiliate_product_update_lock';
        $lock_duration = 50 * MINUTE_IN_SECONDS;

        if ( get_transient( $lock_key ) ) {
            return false;
        }

        set_transient( $lock_key, true, $lock_duration );

        $this->handle_amazon_product_update();
        $this->handle_mercado_product_update();

        return true;
    }

    public function handle_amazon_product_update(): bool {
        if ( ! $this->is_marketplace_active( 'amazon' ) ) {
            return false;
        }

        $products = $this->get_outdated_products( 'amazon' );
        if ( empty( $products ) ) {
            return false;
        }

        $asins = $this->prepare_asins( $products );

        add_filter( 'hostinger_proxy_api_params', array( $this, 'set_request_source' ) );

        // Pull outdated products from Amazon API.
        try {
            $products = $this->product_fetch_service->fetch_products_from_api( $asins );
        } catch ( \Exception $e ) {
            error_log( 'Hostinger Amazon Affiliate: Error syncing products from Amazon API - ' . $e->getMessage() );
        }

        if ( empty( $products ) ) {
            return false;
        }

        $this->update_products( $products );

        return true;
    }

    public function set_request_source( array $params ): array {
        $params['request_source'] = 'cron';

        return $params;
    }

    public function handle_mercado_product_update(): bool {
        if ( ! $this->is_marketplace_active( 'mercado' ) ) {
            return false;
        }

        $products = $this->get_outdated_products( 'mercado' );
        if ( empty( $products ) ) {
            return false;
        }

        $asins = $this->prepare_asins( $products );

        try {
            $products = $this->product_fetch_service->fetch_products_from_api( $asins, '', 'mercado' );
        } catch ( \Exception $e ) {
            error_log( 'Hostinger Amazon Affiliate: Error syncing products from Mercado - ' . $e->getMessage() );
        }

        if ( empty( $products ) ) {
            return false;
        }

        $this->update_products( $products );

        return true;
    }

    private function is_marketplace_active( string $marketplace = 'amazon' ): bool {
        $settings = $this->plugin_settings->get_plugin_settings();
        $status   = PluginOptions::STATUS_DISCONNECTED;

        switch ( $marketplace ) {
            case 'amazon':
                $status = $settings->get_amazon_connection_status();
                break;
            case 'mercado':
                $locale            = $settings->get_mercado_options()->get_locale();
                $connection_status = $settings->get_mercado_connection_status();

                $status = ! empty( $locale ) && $connection_status === PluginOptions::STATUS_CONNECTED ? PluginOptions::STATUS_CONNECTED : PluginOptions::STATUS_DISCONNECTED;
                break;
            default:
                $status = PluginOptions::STATUS_DISCONNECTED;
                break;
        }

        return $status === PluginOptions::STATUS_CONNECTED;
    }

    private function get_outdated_products( string $source ): array {
        $past_seven_days = wp_date( 'Y-m-d H:i:s', strtotime( '-7 days' ) );
        return $this->product_repository->get_by_updated_at( $past_seven_days, $source, 10 );
    }

    private function disable_orphaned_product( int $id ): bool {
        $data  = array(
            'status' => 'inactive',
        );
        $where = array(
            'id' => $id,
        );

        return $this->product_repository->update( $data, $where );
    }

    private function prepare_asins( array $products ): array {
        $asins = array();
        foreach ( $products as $product ) {
            $asin = $product->get_asin();

            if ( empty( $asin ) || empty( $product->get_title() ) ) {
                $this->disable_orphaned_product( $product->get_id() );
                continue;
            }

            $asins[] = $asin;
        }

        return $asins;
    }

    private function update_products( array $products ): void {
        if ( empty( $products ) ) {
            return;
        }

        foreach ( $products as $product ) {
            $product_data = $product->to_array();
            $where        = array(
                'asin' => $product_data['asin'],
            );
            $this->product_repository->update( $product_data, $where );
        }
    }
}
