<?php
namespace Hostinger\AffiliatePlugin\Api\Mercado\Api;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Request\SearchRequest;
use Hostinger\AffiliatePlugin\Api\Mercado\Client;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class SearchApi {
    private Client $client;
    private PluginSettings $plugin_settings;

    public function __construct( Client $client, PluginSettings $plugin_settings ) {
        $this->client          = $client;
        $this->plugin_settings = $plugin_settings;
    }

    public function search( SearchRequest $request ): array|WP_Error {
        $domain   = $this->plugin_settings->get_plugin_settings()->mercado->get_locale_search_domain();
        $endpoint = 'https://' . $domain . '/';

        $request = $this->client->get( $endpoint . sanitize_title( $request->get_keywords() ), array() );

        if ( is_array( $request ) ) {
            foreach ( $request as $key => $item ) {
                if ( empty( $item['offers']['url'] ) ) {
                    continue;
                }

                $product_prefix           = $this->plugin_settings->get_plugin_settings()->mercado->get_locale_product_prefix();
                $match                    = array();
                $legacy_product_url_match = preg_match( '/\/p\/(' . $product_prefix . '[0-9]+)/', $item['offers']['url'], $match );
                $new_product_url_match    = preg_match( '/\/(' . $product_prefix . '-[0-9]+)/', $item['offers']['url'], $match );
                if ( ! $legacy_product_url_match && ! $new_product_url_match ) {
                    unset( $request[ $key ] );
                }
            }

            usort(
                $request,
                function ( $a, $b ) {
                    return ( $b['aggregateRating']['ratingValue'] ?? 0 ) <=> ( $a['aggregateRating']['ratingValue'] ?? 0 );
                }
            );
        }

        return $request;
    }
}
