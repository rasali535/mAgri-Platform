<?php
namespace Hostinger\AffiliatePlugin\Rest;

use Hostinger\AffiliatePlugin\Admin\Options\PluginOptions;
use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\AmazonApi;
use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Request\SearchRequest;
use Hostinger\AffiliatePlugin\Api\AmazonFetch;
use Hostinger\AffiliatePlugin\Localization\Messages;
use Hostinger\AffiliatePlugin\Repositories\TransientRepository;
use Hostinger\AffiliatePlugin\Setup\CronjobSchedule;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;
use WP_Http;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class SettingsRoutes {
    private AmazonApi $amazon_api;
    private PluginSettings $plugin_settings;
    private PluginOptions $settings;
    private PluginOptions $new_settings;
    private TransientRepository $transient_repository;
    private CronjobSchedule $cronjob_schedule;

    public function __construct( AmazonApi $amazon_api, PluginSettings $plugin_settings, PluginOptions $plugin_options, TransientRepository $transient_repository, CronjobSchedule $cronjob_schedule ) {
        $this->amazon_api           = $amazon_api;
        $this->plugin_settings      = $plugin_settings;
        $this->settings             = $this->plugin_settings->get_plugin_settings();
        $this->new_settings         = $plugin_options;
        $this->transient_repository = $transient_repository;
        $this->cronjob_schedule     = $cronjob_schedule;
    }

    public function get_settings(): WP_REST_Response {
        $response = new WP_REST_Response( $this->plugin_settings->get_plugin_settings()->to_array() );
        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
        $response->set_status( WP_Http::OK );

        return $response;
    }

    public function update_settings( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $parameters = $request->get_params();

        $errors = $this->validate_settings_request( $parameters );
        if ( is_wp_error( $errors ) ) {
            return $errors;
        }

        $this->new_settings->set_amazon_connection_status( PluginOptions::STATUS_CONNECTED );
        $this->new_settings->set_mercado_connection_status( $this->plugin_settings->get_plugin_settings()->get_mercado_connection_status() );
        $this->new_settings->set_is_amazon_configured( true );
        $this->new_settings->set_is_mercado_configured( $this->plugin_settings->get_plugin_settings()->get_is_mercado_configured() );
        $this->new_settings->set_mercado_options( $this->settings->get_mercado_options() );

        $connection = $this->check_connection();
        if ( is_wp_error( $connection ) ) {
            $data = array(
                'status'  => 'error',
                'message' => $connection->get_error_message(),
            );

            $response = new WP_REST_Response( $data );
            $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
            $response->set_status( WP_Http::BAD_REQUEST );

            return $response;
        }

        $data = array(
            'data' => $this->plugin_settings->save_plugin_settings( $this->new_settings )
            ->to_array(),
        );

        $this->cronjob_schedule->reschedule();

        $response = new WP_REST_Response( $data );
        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
        $response->set_status( WP_Http::OK );

        return $response;
    }

    public function delete_settings(): WP_REST_Response {
        $this->settings->amazon->delete_credentials();
        $this->transient_repository->delete_amazon_transients();
        $this->settings->set_connection_status( PluginOptions::STATUS_DISCONNECTED );

        $data     = array(
            'data' => $this->plugin_settings->save_plugin_settings( $this->plugin_settings->get_plugin_settings() )
                                            ->to_array(),
        );
        $response = new WP_REST_Response( $data );
        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
        $response->set_status( WP_Http::OK );

        return $response;
    }

    public function toggle_marketplace( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $parameters = $request->get_params();

        $marketplace      = isset( $parameters['marketplace'] ) ? sanitize_text_field( $parameters['marketplace'] ) : '';
        $state            = ! empty( $parameters['state'] ) && $parameters['state'] === PluginOptions::STATUS_CONNECTED;
        $current_settings = $this->plugin_settings->get_plugin_settings();

        $amazon_status  = $current_settings->get_amazon_connection_status();
        $mercado_status = $current_settings->get_mercado_connection_status();

        if ( $marketplace === 'amazon' ) {
            $amazon_status = $state ? PluginOptions::STATUS_CONNECTED : PluginOptions::STATUS_DISCONNECTED;
            $current_settings->set_is_amazon_configured( true );
        } elseif ( $marketplace === 'mercado' ) {
            $mercado_status = $state ? PluginOptions::STATUS_CONNECTED : PluginOptions::STATUS_DISCONNECTED;
            $current_settings->set_is_mercado_configured( true );
        }

        $current_settings->set_amazon_connection_status( $amazon_status );
        $current_settings->set_mercado_connection_status( $mercado_status );

        $data = array(
            'data' => $this->plugin_settings->save_plugin_settings( $current_settings )
                                            ->to_array(),
        );

        $response = new WP_REST_Response( $data );
        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
        $response->set_status( WP_Http::OK );

        return $response;
    }

    public function update_mercado_settings( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $parameters = $request->get_params();

        $errors = $this->validate_mercado_settings_request( $parameters );
        if ( is_wp_error( $errors ) ) {
            return $errors;
        }

        $this->new_settings->set_amazon_options( $this->settings->get_amazon_options() );
        $this->new_settings->set_mercado_connection_status( PluginOptions::STATUS_CONNECTED );
        $this->new_settings->set_amazon_connection_status( $this->plugin_settings->get_plugin_settings()->get_amazon_connection_status() );
        $this->new_settings->set_is_amazon_configured( $this->plugin_settings->get_plugin_settings()->get_is_amazon_configured() );
        $this->new_settings->set_is_mercado_configured( true );

        $data = array(
            'data' => $this->plugin_settings->save_plugin_settings( $this->new_settings )
            ->to_array(),
        );

        $this->cronjob_schedule->reschedule();

        $response = new WP_REST_Response( $data );
        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
        $response->set_status( WP_Http::OK );

        return $response;
    }

    private function check_connection(): WP_Error|bool {
        if ( ! $this->new_settings->amazon->use_amazon_api() ) {
            return true;
        }

        $this->plugin_settings->set_plugin_options( $this->new_settings );
        $this->transient_repository->delete_amazon_transients();

        $search_request = new SearchRequest( 'test' );

        $this->amazon_api->get_client()->set_plugin_settings( $this->plugin_settings );
        $search = $this->amazon_api->search_api()->search( $search_request );

        if ( is_wp_error( $search ) ) {
            return $search;
        }

        return true;
    }

    private function validate_settings_request( array $parameters ): WP_Error|bool {
        $errors = array();
        foreach ( $this->settings->amazon->mandatory_fields() as $field_key => $is_required_field ) {
            if ( empty( $parameters[ $field_key ] ) && $is_required_field ) {
                $errors[ $field_key ] = Messages::get_missing_field_message( str_replace( '_', ' ', $field_key ) );
                continue;
            }

            $method = "set_{$field_key}";
            $this->new_settings->amazon->$method( sanitize_text_field( $parameters[ $field_key ] ) );
        }

        if ( ! empty( $errors ) ) {
            return new WP_Error(
                'data_invalid',
                __( 'Sorry, you are not allowed to do that.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                    'errors' => $errors,
                )
            );
        }

        return true;
    }

    private function validate_mercado_settings_request( array $parameters ): WP_Error|bool {
        $errors = array();
        foreach ( $this->settings->mercado->mandatory_fields() as $field_key => $is_required_field ) {
            if ( empty( $parameters[ $field_key ] ) && $is_required_field ) {
                $errors[ $field_key ] = Messages::get_missing_field_message( str_replace( '_', ' ', $field_key ) );
                continue;
            }

            if ( $field_key === 'locale' && ! empty( $parameters[ $field_key ] ) ) {
                $available_locales = $this->settings->mercado->get_locales();
                if ( ! array_key_exists( $parameters[ $field_key ], $available_locales ) ) {
                    $errors[ $field_key ] = __( 'Invalid locale selected. Please choose a valid locale.', 'hostinger-affiliate-plugin' );
                    continue;
                }
            }

            $method = "set_{$field_key}";
            $this->new_settings->mercado->$method( sanitize_text_field( $parameters[ $field_key ] ) );
        }

        if ( ! empty( $errors ) ) {
            return new WP_Error(
                'data_invalid',
                __( 'Sorry, you are not allowed to do that.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                    'errors' => $errors,
                )
            );
        }

        return true;
    }
}
