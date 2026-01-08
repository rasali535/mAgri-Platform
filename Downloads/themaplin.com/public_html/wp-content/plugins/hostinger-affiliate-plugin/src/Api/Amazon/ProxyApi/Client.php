<?php
namespace Hostinger\AffiliatePlugin\Api\Amazon\ProxyApi;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Api\RequestsClient;
use Hostinger\WpHelper\Config;
use Hostinger\WpHelper\Utils;
use Hostinger\WpHelper\Constants;
use WP_Error;
use WP_Http;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class Client {
    private PluginSettings $plugin_settings;
    private RequestsClient $requests_client;
    private Utils $utils;
    private Config $config;
    private array $headers;

    public function __construct( PluginSettings $plugin_settings, RequestsClient $requests_client, Utils $utils, Config $config ) {
        $this->plugin_settings = $plugin_settings;
        $this->requests_client = $requests_client;
        $this->utils           = $utils;
        $this->config          = $config;

        $this->set_base_url();
    }

    public function get( string $endpoint, array $params ): array|WP_Error {
        $response = $this->requests_client->get( $endpoint, $this->combine_params( $params ), $this->headers );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $validation = $this->validate_response( $response );

        if ( is_wp_error( $validation ) ) {
            return $validation;
        }

        return $this->decode_response( $response );
    }

    private function decode_response( array $response ): array {
        $response_body = wp_remote_retrieve_body( $response );

        if ( empty( $response_body ) ) {
            return array();
        }

        return json_decode( $response_body, true );
    }

    private function validate_response( array $response ): WP_Error|bool {
        $response_code = wp_remote_retrieve_response_code( $response );

        $data = $this->decode_response( $response );

        if ( empty( $response_code ) || $response_code !== 200 ) {
            return new WP_Error(
                'data_invalid',
                __( 'Sorry, there was a problem with request.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => $response_code,
                    'errors' => $this->decode_error_message( $data ),
                )
            );
        }

        return true;
    }

    private function get_locale_data(): array {
        $tld           = $this->plugin_settings->get_plugin_settings()->amazon->get_tld();
        $proxy_country = $this->plugin_settings->get_plugin_settings()->amazon->get_proxy_country();

        if ( $tld === 'com.sg' ) {
            $tld = 'sg';
        }

        $locale = array(
            'domain' => $this->utils->getHostInfo(),
            'tld'    => $tld,
        );

        if ( ! empty( $proxy_country ) ) {
            $locale['country'] = $proxy_country;
        }

        $locale['request_source'] = 'user';

        return $locale;
    }

    private function combine_params( array $params ): array {
        return apply_filters( 'hostinger_proxy_api_params', array_merge( $params, $this->get_locale_data() ) );
    }

    private function set_base_url(): void {
        $this->headers = array(
            Config::TOKEN_HEADER  => $this->utils->getApiToken(),
            Config::DOMAIN_HEADER => $this->utils->getHostInfo(),
        );
        $this->requests_client->set_api_url( $this->config->getConfigValue( 'base_rest_uri', Constants::HOSTINGER_REST_URI ) );
    }

    private function decode_error_message( array $data ): string {
        if ( ! isset( $data['error']['message'] ) ) {
            return '';
        }

        $error_message = $data['error']['message'];
        $input_errors  = array();

        $inputs = ! empty( $data['error']['inputs'] ) ? $data['error']['inputs'] : '';
        if ( ! empty( $inputs ) ) {
            foreach ( $inputs as $field => $errors ) {
                $input_errors[] = "$field: " . implode( ', ', $errors );
            }
        }

        return 'Error: ' . $error_message . '.' . ( ! empty( $input_errors ) ? ( 'Invalid Inputs: ' . implode( ', ', $input_errors ) ) : '' );
    }
}
