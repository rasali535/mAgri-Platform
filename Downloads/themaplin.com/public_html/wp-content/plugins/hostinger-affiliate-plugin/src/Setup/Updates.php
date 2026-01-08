<?php
/**
 * Updates class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Setup;

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Updates class
 */
class Updates {
    private const DEFAULT_PLUGIN_UPDATE_URI = 'https://wp-update.hostinger.io/?action=get_metadata&slug=hostinger-affiliate-plugin';
    private const CANARY_PLUGIN_UPDATE_URI  = 'https://wp-update-canary.hostinger.io/?action=get_metadata&slug=hostinger-affiliate-plugin';
    private const STAGING_PLUGIN_UPDATE_URI = 'https://wp-update-stage.hostinger.io/?action=get_metadata&slug=hostinger-affiliate-plugin';

    /**
     * @return string
     */
    private function get_plugin_update_uri(): string {
        if ( isset( $_SERVER['H_STAGING'] ) && filter_var( $_SERVER['H_STAGING'], FILTER_VALIDATE_BOOLEAN ) === true ) {
            return self::STAGING_PLUGIN_UPDATE_URI;
        }

        if ( isset( $_SERVER['H_CANARY'] ) && filter_var( $_SERVER['H_CANARY'], FILTER_VALIDATE_BOOLEAN ) === true ) {
            return self::CANARY_PLUGIN_UPDATE_URI;
        }

        return self::DEFAULT_PLUGIN_UPDATE_URI;
    }

    /**
     * @return void
     */
    public function updates(): void {
        $plugin_updater_uri = $this->get_plugin_update_uri();

        if ( class_exists( PucFactory::class ) ) {
            $hts_update_checker = PucFactory::buildUpdateChecker( $plugin_updater_uri, HOSTINGER_AFFILIATE_PLUGIN_DIR . 'hostinger-affiliate-plugin.php', 'hostinger-affiliate-plugin' );
        }
    }
}
