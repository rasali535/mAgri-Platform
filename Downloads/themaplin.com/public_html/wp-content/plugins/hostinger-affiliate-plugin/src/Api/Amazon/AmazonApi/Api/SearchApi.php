<?php
namespace Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Api;

use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Client;
use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Request\SearchRequest;
use Exception;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class SearchApi {
    private Client $client;

    public function __construct( Client $client ) {
        $this->client = $client;
    }

    public function search( SearchRequest $request ): array|WP_Error {
        $request = $this->client->request( 'SearchItems', 'POST', $request->get_keywords() );

        if ( is_array( $request ) && isset( $request['SearchResult']['Items'] ) ) {
            return $request['SearchResult']['Items'];
        }

        return $request;
    }
}
