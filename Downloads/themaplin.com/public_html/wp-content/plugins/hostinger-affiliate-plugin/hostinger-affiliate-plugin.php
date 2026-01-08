<?php
/**
 * Plugin Name:       Hostinger Affiliate Marketing Tools
 * Plugin URI:        https://hostinger.com
 * Description:       Create and promote products using affiliate links from different marketplaces. Easily manage and display affiliate products on your site.
 * Version:           3.0.21
 * Author:            Hostinger
 * Requires PHP:      8.0
 * Requires at least: 5.9
 * Tested up to:      6.5
 * Author URI:        https://hostinger.com
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       hostinger-affiliate-plugin
 * Domain Path:       /languages
 *
 * @package AmazonAffiliateConnector
 */

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Boot;
use Hostinger\AffiliatePlugin\Setup\Activator;
use Hostinger\AffiliatePlugin\Setup\CronjobSchedule;
use Hostinger\Surveys\Loader;
use Hostinger\WpMenuManager\Manager;
use Hostinger\Amplitude\AmplitudeLoader;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Path to plugin file
 */
define( 'HOSTINGER_AFFILIATE_PLUGIN_FILE', __FILE__ );

/**
 * Plugin slug
 */
define( 'HOSTINGER_AFFILIATE_PLUGIN_SLUG', basename( __FILE__, '.php' ) );

/**
 * Plugin version
 */
define( 'HOSTINGER_AFFILIATE_PLUGIN_VERSION', '3.0.21' );

/**
 * Plugin DB version
 */
define( 'HOSTINGER_AFFILIATE_PLUGIN_DB_VERSION', '1.9' );

/**
 * Plugin URL
 */
define( 'HOSTINGER_AFFILIATE_PLUGIN_URL', plugin_dir_url( HOSTINGER_AFFILIATE_PLUGIN_FILE ) );

/**
 * Plugin directory
 */
define( 'HOSTINGER_AFFILIATE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

/**
 * Plugin Rest API base url
 */
define( 'HOSTINGER_AFFILIATE_PLUGIN_REST_API_BASE', 'hostinger-affiliate-plugin/v1' );

/**
 * Hostinger WP Json config file path
 */
define( 'HOSTINGER_AFFILIATE_PLUGIN_WP_JSON_CONFIG_PATH', ABSPATH . DIRECTORY_SEPARATOR . '.private' . DIRECTORY_SEPARATOR . 'config.json' );

/**
 * Hostinger default rest API url
 */
if ( ! defined( 'HOSTINGER_AFFILIATE_REST_URI' ) ) {
    define( 'HOSTINGER_AFFILIATE_REST_URI', 'https://rest-hosting.hostinger.com' );
}

/**
 * Hostinger Token
 */
if ( ! defined( 'HOSTINGER_WP_TOKEN' ) ) {
    $hostinger_dir_parts        = explode( '/', __DIR__ );
    $hostinger_server_root_path = '/' . $hostinger_dir_parts[1] . '/' . $hostinger_dir_parts[2];
    define( 'HOSTINGER_WP_TOKEN', $hostinger_server_root_path . '/.api_token' );
}

/**
 * Hostinger minimum PHP version
 */
if ( ! defined( 'HOSTINGER_AFFILIATE_MINIMUM_PHP_VERSION' ) ) {
    define( 'HOSTINGER_AFFILIATE_MINIMUM_PHP_VERSION', '8.0' );
}

if ( ! version_compare( phpversion(), HOSTINGER_AFFILIATE_MINIMUM_PHP_VERSION, '>=' ) ) {
    add_action(
        'admin_notices',
        function () {
            ?>
            <div class="notice notice-error is-dismissible hts-theme-settings">
                <p>
                    <?php /* translators: %s: PHP version */ ?>
                    <strong><?php echo __( 'Attention:', 'hostinger-affiliate-plugin' ); ?></strong> <?php echo sprintf( __( 'The Hostinger Affiliate plugin requires minimum PHP version of <b>%s</b>. ', 'hostinger-affiliate-plugin' ), HOSTINGER_AFFILIATE_MINIMUM_PHP_VERSION ); ?>
                </p>
                <p>
                    <?php /* translators: %s: PHP version */ ?>
                    <?php echo sprintf( __( 'You are running <b>%s</b> PHP version.', 'hostinger-affiliate-plugin' ), phpversion() ); ?>
                </p>
            </div>
            <?php
        }
    );

    return;
}

$vendor_file = __DIR__ . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload_packages.php';

if ( file_exists( $vendor_file ) ) {
    require_once $vendor_file;
}

/**
 * Check if autoloader is working and have our boot class, then boot up our plugin
 */

if ( class_exists( 'Hostinger\AffiliatePlugin\Boot' ) ) {
    add_action(
        'plugins_loaded',
        function () {
            $boot = Boot::get_instance();
            $boot->plugins_loaded();
        }
    );

    $plugin_settings  = new PluginSettings();
    $cronjob_schedule = new CronjobSchedule( $plugin_settings );

    // Trigger plugin activation functions.
    $activator = new Activator( __FILE__, $plugin_settings, $cronjob_schedule );

    if ( ! function_exists( 'hostinger_load_menus' ) ) {
        function hostinger_load_menus(): void {
            $manager = Manager::getInstance();
            $manager->boot();
        }
    }

    if ( ! has_action( 'plugins_loaded', 'hostinger_load_menus' ) ) {
        add_action( 'plugins_loaded', 'hostinger_load_menus' );
    }

    if ( ! function_exists( 'hostinger_load_amplitude' ) ) {
        function hostinger_load_amplitude(): void {
            $amplitude = AmplitudeLoader::getInstance();
            $amplitude->boot();
        }
    }

    if ( ! has_action( 'plugins_loaded', 'hostinger_load_amplitude' ) ) {
        add_action( 'plugins_loaded', 'hostinger_load_amplitude' );
    }

    if ( ! function_exists( 'hostinger_add_surveys' ) ) {
        function hostinger_add_surveys(): void {
            $surveys = Loader::getInstance();
            $surveys->boot();
        }
    }

    if ( ! has_action( 'plugins_loaded', 'hostinger_add_surveys' ) ) {
        add_action( 'plugins_loaded', 'hostinger_add_surveys' );
    }
}
