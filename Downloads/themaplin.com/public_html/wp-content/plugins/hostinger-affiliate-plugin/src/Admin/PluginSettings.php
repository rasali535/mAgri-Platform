<?php

namespace Hostinger\AffiliatePlugin\Admin;

use Hostinger\AffiliatePlugin\Admin\Options\PluginOptions;
use wpdb;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class PluginSettings {
    private PluginOptions $plugin_options;
    private wpdb $db;

    public function __construct( wpdb $db = null ) {
        global $wpdb;

        if ( empty( $db ) ) {
            $db = $wpdb;
        }

        $this->db = $db;
    }

    public function get_plugin_settings(): PluginOptions {
        if ( ! empty( $this->plugin_options ) ) {
            $settings = $this->plugin_options;
        } else {
            $settings = get_option(
                HOSTINGER_AFFILIATE_PLUGIN_SLUG,
                array()
            );

            $settings = new PluginOptions( $settings );
        }

        return $settings;
    }

    public function save_plugin_settings( PluginOptions $plugin_options ): PluginOptions {
        $existing_settings = $this->get_plugin_settings();

        $update = update_option( HOSTINGER_AFFILIATE_PLUGIN_SLUG, $plugin_options->to_array(), false );

        return ! empty( $update ) ? $plugin_options : $existing_settings;
    }

    public function set_plugin_options( PluginOptions $plugin_options ): void {
        $this->plugin_options = $plugin_options;
    }
}
