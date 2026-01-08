<?php
namespace Hostinger\AffiliatePlugin\Api\Amazon\ProxyApi\Api;

use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Request\SearchRequest;
use Hostinger\AffiliatePlugin\Api\Amazon\ProxyApi\Client;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class SearchApi {
    private const SEARCH_ITEMS_ENDPOINT = '/v3/wordpress/plugin/amazon/search';

    private Client $client;

    public function __construct( Client $client ) {
        $this->client = $client;
    }

    public function search( SearchRequest $request ): array|WP_Error {
        $params = array(
            'search_query' => $request->get_keywords(),
        );

        $request = $this->client->get( self::SEARCH_ITEMS_ENDPOINT, $params );

        if ( is_array( $request ) && isset( $request['data']['results'] ) ) {
            $results = $request['data']['results'];

            $unique_asins = array();
            $results      = array_filter(
                $results,
                function ( $item ) use ( &$unique_asins ) {
                    if ( empty( $item['asin'] ) ) {
                        return false;
                    }

                    if ( in_array( $item['asin'], $unique_asins, true ) ) {
                        return false;
                    }

                    $unique_asins[] = $item['asin'];
                    return true;
                }
            );

            usort(
                $results,
                function ( $a, $b ) {
                    return ( $b['stars'] ?? 0 ) <=> ( $a['stars'] ?? 0 );
                }
            );

            return $results;
        }

        return $request;
    }
}
