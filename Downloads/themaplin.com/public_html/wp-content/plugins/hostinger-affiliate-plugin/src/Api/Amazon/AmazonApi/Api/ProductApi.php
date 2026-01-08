<?php
namespace Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Api;

use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Client;
use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Request\GetProductDataRequest;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ProductApi {
    private Client $client;

    public function __construct( Client $client ) {
        $this->client = $client;
    }

    public function product_data( GetProductDataRequest $request ): array|WP_Error {
        $request = $this->client->request( 'GetItems', 'POST', '', $request->get_item_ids() );

        if ( is_array( $request ) && isset( $request['ItemsResult']['Items'] ) ) {
            return $request['ItemsResult']['Items'];
        }

        return $request;
    }
}
