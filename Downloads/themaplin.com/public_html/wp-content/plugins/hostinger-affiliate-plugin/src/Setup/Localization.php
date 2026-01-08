<?php
/**
 * Localization class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Setup;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Localization class
 */
class Localization {

    /**
     * Run actions or/and hooks
     */
    public function init(): void {
        // Load plugin text domain.
        $this->plugin_text_domain();
    }

    /**
     * Load plugin text domain
     *
     * @return void
     */
    public function plugin_text_domain(): void {
        load_plugin_textdomain(
            'hostinger-affiliate-plugin',
            false,
            basename( dirname( HOSTINGER_AFFILIATE_PLUGIN_FILE ) ) . DIRECTORY_SEPARATOR . 'languages'
        );
    }
}
