<?php

namespace Hostinger\AffiliatePlugin\Setup;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class CronjobSchedule {
    private PluginSettings $plugin_settings;

    public function __construct( PluginSettings $plugin_settings ) {
        $this->plugin_settings = $plugin_settings;
    }

    public function schedule(): void {
        $scrapping  = empty( $this->plugin_settings->get_plugin_settings()->amazon->use_amazon_api() );
        $recurrence = $scrapping ? 'weekly' : 'hourly';

        if ( ! wp_next_scheduled( 'hostinger_affiliate_product_update' ) ) {
            if ( $recurrence === 'hourly' ) {
                $time_interval = 60 * 60;
            } else {
                $time_interval = 60 * 60 * 24 * 7;
            }

            wp_schedule_event( time() + $time_interval, $recurrence, 'hostinger_affiliate_product_update' );
        }
    }

    public function unschedule(): void {
        $next_scheduled = wp_next_scheduled( 'hostinger_affiliate_product_update' );

        if ( $next_scheduled ) {
            wp_unschedule_event( $next_scheduled, 'hostinger_affiliate_product_update' );
        }
    }

    public function reschedule(): void {
        $this->unschedule();
        $this->schedule();
    }
}
