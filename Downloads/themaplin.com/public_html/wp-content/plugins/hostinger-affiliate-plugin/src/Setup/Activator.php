<?php
/**
 * Activator class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Setup;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Activator class
 */
class Activator {

    private PluginSettings $plugin_settings;
    private CronjobSchedule $cronjob_schedule;

    /**
     * @param string $plugin_file_name filename.
     */
    public function __construct( string $plugin_file_name, PluginSettings $plugin_settings, CronjobSchedule $cronjob_schedule ) {
        register_activation_hook( $plugin_file_name, array( $this, 'activate_plugin' ) );
        register_deactivation_hook( $plugin_file_name, array( $this, 'deactivate_plugin' ) );
        add_action( 'plugins_loaded', array( $this, 'check_database_tables' ) );

        $this->plugin_settings  = $plugin_settings;
        $this->cronjob_schedule = $cronjob_schedule;
    }

    /**
     * @return void
     */
    public function activate_plugin(): void {
        // Purge LiteSpeed cache.
        if ( has_action( 'litespeed_purge_all' ) ) {
            do_action( 'litespeed_purge_all' );
        }

        $this->check_database_tables();

        $this->schedule();
    }

    /**
     * @return void
     */
    public function deactivate_plugin(): void {
        $this->unschedule();
    }

    /**
     * @return void
     */
    public function check_database_tables(): void {
        $database_version = get_option(
            HOSTINGER_AFFILIATE_PLUGIN_SLUG . '-db-version',
            ''
        );

        if ( HOSTINGER_AFFILIATE_PLUGIN_DB_VERSION !== $database_version ) {
            $this->create_products_table();

            $this->create_lists_table();

            $this->cronjob_schedule->reschedule();

            if ( HOSTINGER_AFFILIATE_PLUGIN_DB_VERSION === '1.9' ) {
                $this->migrate_old_first_time_setting();
            }

            update_option( HOSTINGER_AFFILIATE_PLUGIN_SLUG . '-db-version', HOSTINGER_AFFILIATE_PLUGIN_DB_VERSION, false );
        }
    }

    /**
     * @return void
     */
    public function create_products_table(): void {
        global $wpdb;

        $table_name = $wpdb->prefix . 'hostinger_affiliate_products';

        $sql = "CREATE TABLE $table_name (
              id int NOT NULL AUTO_INCREMENT,
              source varchar(100) NOT NULL DEFAULT 'amazon',
              status varchar(100) NOT NULL DEFAULT 'active',
              asin varchar(25) DEFAULT NULL,
              title varchar(255) DEFAULT NULL,
              url varchar(255) NOT NULL DEFAULT '',
              image_url text,
              item_data text,
              currency varchar(10) DEFAULT NULL,
              price decimal(10,2) DEFAULT NULL,
              pricing varchar(255) DEFAULT NULL,
              is_prime tinyint NOT NULL DEFAULT '0',
              is_free_shipping tinyint NOT NULL DEFAULT '0',
              rating decimal(2,1) NOT NULL DEFAULT '0.0',
              reviews int NOT NULL DEFAULT '0',
              created_at datetime DEFAULT NULL,
              updated_at datetime DEFAULT NULL,
            PRIMARY KEY  (id)
        );";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );
    }

    /**
     * @return void
     */
    public function create_lists_table(): void {
        global $wpdb;

        $table_name = $wpdb->prefix . 'hostinger_affiliate_lists';

        $sql = "CREATE TABLE $table_name (
              id int NOT NULL AUTO_INCREMENT,
              keywords varchar(255) DEFAULT NULL,
              asins text,
              created_at datetime DEFAULT NULL,
              updated_at datetime DEFAULT NULL,
            PRIMARY KEY  (id)
        );";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );
    }

    /**
     * @return void
     */
    public function schedule(): void {
        $this->cronjob_schedule->schedule();
    }

    /**
     * @return void
     */
    public function unschedule(): void {
        $this->cronjob_schedule->unschedule();
    }

    private function migrate_old_first_time_setting(): void {
        $settings     = $this->plugin_settings->get_plugin_settings();
        $old_settings = get_option( HOSTINGER_AFFILIATE_PLUGIN_SLUG, array() );

        if ( isset( $old_settings['is_first_time'] ) ) {
            $settings->set_is_amazon_configured( ! $old_settings['is_first_time'] );
            $this->plugin_settings->save_plugin_settings( $settings );
        }
    }
}
