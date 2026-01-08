<?php
// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
namespace Hostinger\AffiliatePlugin\Api\Mercado;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Api\RequestsClient;
use Hostinger\WpHelper\Config;
use Hostinger\WpHelper\Utils;
use WP_Error;
use WP_Http;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class Client {
    private const PROXY_API_ENDPOINT = 'https://wh-wordpress-proxy-api.hostinger.io/api/v1/pages/analyze';

    private PluginSettings $plugin_settings;
    private RequestsClient $requests_client;
    private Utils $utils;
    private array $proxy_headers = array();

    public function __construct( PluginSettings $plugin_settings, RequestsClient $requests_client, Utils $utils ) {
        $this->plugin_settings = $plugin_settings;
        $this->requests_client = $requests_client;
        $this->utils           = $utils;

        $this->setup_proxy_headers();
    }

    public function get( string $endpoint, array $params ): array|WP_Error {
        return $this->get_via_proxy( $endpoint, $params );
    }

    private function get_via_proxy( string $endpoint, array $params ): array|WP_Error {
        if ( ! empty( $params ) ) {
            $endpoint = add_query_arg( $params, $endpoint );
        }

        $payload = array(
            'domain' => $this->utils->getHostInfo(),
            'url'    => $endpoint,
        );

        $response = $this->requests_client->post(
            self::PROXY_API_ENDPOINT,
            wp_json_encode( $payload ),
            $this->proxy_headers
        );

        $validation = $this->validate_proxy_response( $response );
        if ( is_wp_error( $validation ) ) {
            return $validation;
        }

        $html_content = $this->extract_html_from_proxy_response( $response );

        if ( is_wp_error( $html_content ) ) {
            return $html_content;
        }

        return $this->extract_schema( $html_content );
    }



    public function extract_schema( string $content ) {
        $pattern = '/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is';
        preg_match_all( $pattern, $content, $matches );

        if ( empty( $matches[1] ) ) {
            return array();
        }

        foreach ( $matches[1] as $json_string ) {
            $decoded = json_decode( trim( $json_string ), true );

            if ( JSON_ERROR_NONE === json_last_error() ) {
                if ( isset( $decoded['@type'] ) && 'Product' === $decoded['@type'] ) {
                    return $decoded;
                } elseif ( isset( $decoded['@graph'] ) && is_array( $decoded['@graph'] ) ) {
                    $product_data = array();

                    foreach ( $decoded['@graph'] as $item ) {
                        if ( isset( $item['@type'] ) && 'Product' === $item['@type'] ) {
                            $product_data[] = $item;
                        }
                    }

                    return $product_data;
                }
            }
        }

        return array();
    }

    private function setup_proxy_headers(): void {
        $api_token = $this->utils->getApiToken();

        $this->proxy_headers = array(
            Config::TOKEN_HEADER => $api_token,
            'X-CORRELATION-ID'   => wp_generate_uuid4(),
            'Content-Type'       => 'application/json',
            'User-Agent'         => 'Hostinger-Affiliate-Plugin/1.0',
        );
    }

    private function extract_html_from_proxy_response( array $response ): string|WP_Error {
        $body = wp_remote_retrieve_body( $response );

        if ( empty( $body ) ) {
            return new WP_Error(
                'api_empty_response',
                __( 'Empty response from proxy API.', 'hostinger-affiliate-plugin' )
            );
        }

        $decoded = json_decode( $body, true );

        if ( json_last_error() !== JSON_ERROR_NONE ) {
            return new WP_Error(
                'api_json_decode_error',
                __( 'Failed to decode proxy API response.', 'hostinger-affiliate-plugin' )
            );
        }

        if ( isset( $decoded['content'] ) ) {
            return $decoded['content'];
        } elseif ( isset( $decoded['html'] ) ) {
            return $decoded['html'];
        } elseif ( isset( $decoded['data']['content'] ) ) {
            return $decoded['data']['content'];
        } elseif ( isset( $decoded['data']['html'] ) ) {
            return $decoded['data']['html'];
        }

        return new WP_Error(
            'api_no_content',
            __( 'No HTML content found in proxy API response.', 'hostinger-affiliate-plugin' ),
            array( 'response' => $decoded )
        );
    }

    private function validate_proxy_response( array $response ): WP_Error|bool {
        $response_code = wp_remote_retrieve_response_code( $response );

        if ( empty( $response_code ) || 200 !== $response_code ) {
            $error_message = __( 'Proxy API request failed.', 'hostinger-affiliate-plugin' );

            $body = wp_remote_retrieve_body( $response );
            if ( ! empty( $body ) ) {
                $decoded = json_decode( $body, true );
                if ( isset( $decoded['error'] ) ) {
                    $error_message .= ' Error: ' . $decoded['error'];
                } elseif ( isset( $decoded['message'] ) ) {
                    $error_message .= ' Message: ' . $decoded['message'];
                }
            }

            return new WP_Error(
                'api_request_failed',
                $error_message,
                array(
                    'status'   => $response_code,
                    'response' => $body,
                )
            );
        }

        return true;
    }
}
