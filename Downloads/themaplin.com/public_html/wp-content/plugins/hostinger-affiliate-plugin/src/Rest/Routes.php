<?php

namespace Hostinger\AffiliatePlugin\Rest;

use Hostinger\AffiliatePlugin\Rest\Settings as RestSettings;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class Routes {
    private SettingsRoutes $settings_routes;
    private ItemsRoutes $items_routes;
    private TableRoutes $table_routes;

    public function __construct( SettingsRoutes $settings_routes, ItemsRoutes $items_routes, TableRoutes $table_routes ) {
        $this->settings_routes = $settings_routes;
        $this->items_routes    = $items_routes;
        $this->table_routes    = $table_routes;
    }

    public function init(): void {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes(): void {
        // Register Settings Rest API Routes.
        $this->register_settings_routes();

        // Register Item Rest API Routes.
        $this->register_item_routes();

        // Register Table Rest API Routes.
        $this->register_table_routes();
    }

    public function permission_check(): bool {
        // Workaround if Rest Api endpoint cache is enabled.
        // We don't want to cache these requests.
        if ( has_action( 'litespeed_control_set_nocache' ) ) {
            do_action(
                'litespeed_control_set_nocache',
                'Custom Rest API endpoint, not cacheable.'
            );
        }

        if ( empty( is_user_logged_in() ) ) {
            return false;
        }

        // Implement custom capabilities when needed.
        return current_user_can( 'manage_options' );
    }

    private function register_settings_routes(): void {
        // Return settings.
        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'get-settings',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this->settings_routes, 'get_settings' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );

        // Update settings.
        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'update-settings',
            array(
                'methods'             => 'POST',
                'callback'            => array( $this->settings_routes, 'update_settings' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );

        // Delete settings.
        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'delete-settings',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this->settings_routes, 'delete_settings' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );

        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'toggle-marketplace',
            array(
                'methods'             => 'POST',
                'callback'            => array( $this->settings_routes, 'toggle_marketplace' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );

        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'update-mercado-settings',
            array(
                'methods'             => 'POST',
                'callback'            => array( $this->settings_routes, 'update_mercado_settings' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );
    }

    private function register_item_routes(): void {
        // Return items.
        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'search-items',
            array(
                'methods'             => 'POST',
                'callback'            => array( $this->items_routes, 'search_items' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );

        // Validate items.
        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'validate-items',
            array(
                'methods'             => 'POST',
                'callback'            => array( $this->items_routes, 'validate_items' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );
    }

    private function register_table_routes(): void {
        // Get table.
        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'get-table/(?P<id>\d+)',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this->table_routes, 'get_table' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );

        // Get tables.
        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'get-tables',
            array(
                'methods'             => 'GET',
                'callback'            => array( $this->table_routes, 'get_tables' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );

        // Create table.
        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'create-table',
            array(
                'methods'             => 'POST',
                'callback'            => array( $this->table_routes, 'create_table' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );

        // Update table.
        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'update-table/(?P<id>\d+)',
            array(
                'methods'             => 'PUT',
                'callback'            => array( $this->table_routes, 'update_table' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );

        // Delete table.
        register_rest_route(
            HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE,
            'delete-table/(?P<id>\d+)',
            array(
                'methods'             => 'DELETE',
                'callback'            => array( $this->table_routes, 'delete_table' ),
                'permission_callback' => array( $this, 'permission_check' ),
            )
        );
    }
}
