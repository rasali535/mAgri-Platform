<?php
namespace Hostinger\AffiliatePlugin\Api;

use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class RequestsClient {
    private string $api_url        = '';
    private array $default_headers = array();

    public function set_api_url( string $api_url ): void {
        $this->api_url = $api_url;
    }

    public function set_default_headers( array $default_headers ): void {
        $this->default_headers = $default_headers;
    }

    public function get( string $endpoint, $params = array(), $headers = array(), $timeout = 120 ): WP_Error|array {
        $url          = $this->api_url . $endpoint;
        $request_args = array(
            'method'  => 'GET',
            'headers' => array_merge( $this->default_headers, $headers ),
            'timeout' => $timeout,
        );

        if ( ! empty( $params ) ) {
            $url = add_query_arg( $params, $url );
        }

        $response = wp_remote_get( $url, $request_args );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        return $response;
    }

    public function post( string $endpoint, $params = array(), $headers = array(), $timeout = 120 ): mixed {
        $url          = $this->api_url . $endpoint;
        $request_args = array(
            'method'  => 'POST',
            'timeout' => $timeout,
            'headers' => array_merge( $this->default_headers, $headers ),
            'body'    => $params,
        );

        $response = wp_remote_post( $url, $request_args );

        if ( is_wp_error( $response ) ) {
            error_log( print_r( $response->get_error_messages(), true ) );
        }

        return $response;
    }
}
