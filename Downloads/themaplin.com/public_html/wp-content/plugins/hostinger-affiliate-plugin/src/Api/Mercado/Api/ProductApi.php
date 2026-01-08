<?php
namespace Hostinger\AffiliatePlugin\Api\Mercado\Api;

use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Request\GetProductDataRequest;
use Hostinger\AffiliatePlugin\Api\Mercado\Client;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;
use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ProductApi {
    private const GET_ITEM_BASE_PATH = '/-/p/';
    private Client $client;
    private ProductRepository $product_repository;
    private PluginSettings $plugin_settings;

    public function __construct( Client $client, ProductRepository $product_repository, PluginSettings $plugin_settings ) {
        $this->client             = $client;
        $this->product_repository = $product_repository;
        $this->plugin_settings    = $plugin_settings;
    }

    public function product_data( GetProductDataRequest $request ): array|WP_Error {
        $products = array();

        foreach ( $request->get_item_ids() as $item_id ) {
            $product = $this->get_product( $item_id );

            if ( ! is_wp_error( $product ) ) {
                $products[] = $product;
            }
        }

        return $products;
    }

    public function get_product( string $item_id ): array|WP_Error {
        $domain         = $this->plugin_settings->get_plugin_settings()->mercado->get_locale_domain();
        $product_domain = $this->plugin_settings->get_plugin_settings()->mercado->get_product_domain();

        if ( str_contains( $item_id, '-' ) ) {
            $endpoint = 'https://' . $product_domain . '/';
        } else {
            $endpoint = 'https://' . $domain . self::GET_ITEM_BASE_PATH;
        }

        $request = $this->client->get( $endpoint . $item_id, array() );

        if ( is_wp_error( $request ) ) {
            $error_data = $request->get_error_data();

            if ( is_array( $error_data ) && ! empty( $error_data['status'] ) && $error_data['status'] === 404 ) {
                $this->disable_orphaned_product( $item_id );
            }

            return $request;
        }

        if ( is_array( $request ) && ! empty( $request ) ) {
            if ( empty( $request['@id'] ) && empty( $request['identifier'] ) ) {
                $request['item_id'] = $item_id;
            }

            return $request;
        }

        return $request;
    }

    private function disable_orphaned_product( string $item_id ): void {
        $product = $this->product_repository->get_by_asin( $item_id );

        if ( empty( $product ) ) {
            $data = array(
                'status'     => 'inactive',
                'source'     => 'mercado',
                'asin'       => $item_id,
                /* translators: %s: Product ID */
                'title'      => sprintf( __( '%s Product does not exist anymore.', 'hostinger-affiliate-plugin' ), $item_id ),
                'item_data'  => json_encode( array() ),
                'created_at' => gmdate( 'Y-m-d H:i:s' ),
                'updated_at' => gmdate( 'Y-m-d H:i:s' ),
            );
            $this->product_repository->insert( $data );

            return;
        }

        if ( $product->get_status() === 'inactive' ) {
            return;
        }

        $data  = array(
            'status' => 'inactive',
        );
        $where = array(
            'asin' => $item_id,
        );

        $this->product_repository->update( $data, $where );
    }
}
