<?php
/**
 * Menus class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Admin;

use Hostinger\WpMenuManager\Menus as WpMenu;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Class for registering menus
 */
class Menus {
    /**
     * Settings instance
     *
     * @var PluginSettings
     */
    public PluginSettings $plugin_settings;

    /**
     * Construct class with dependencies
     *
     * @param PluginSettings $plugin_settings instance.
     */
    public function __construct( PluginSettings $plugin_settings ) {
        $this->plugin_settings = $plugin_settings;
    }

    /**
     * Init menus
     */
    public function init(): void {
        add_filter( 'hostinger_menu_subpages', array( $this, 'add_sub_menu_page' ), 30 );
        add_filter( 'hostinger_admin_menu_bar_items', array( $this, 'add_admin_bar_items' ), 110 );
    }

    /**
     * @param array $submenus
     *
     * @return array
     */
    public function add_sub_menu_page( array $submenus ): array {
        $submenus[] = array(
            'page_title' => __( 'Affiliate Marketing', 'hostinger-affiliate-plugin' ),
            'menu_title' => __( 'Affiliate Marketing', 'hostinger-affiliate-plugin' ),
            'capability' => 'manage_options',
            'menu_slug'  => 'hostinger-amazon-affiliate',
            'callback'   => array( $this, 'render_plugin_content' ),
            'menu_order' => 10,
        );

        return $submenus;
    }

    /**
     * @param array $menu_items
     *
     * @return array
     */
    public function add_admin_bar_items( array $menu_items ): array {
        $menu_items[] = array(
            'id'    => 'hostinger-affiliate-plugin-amazon-affiliate',
            'title' => esc_html__( 'Affiliate Marketing', 'hostinger-affiliate-plugin' ),
            'href'  => admin_url( 'admin.php?page=hostinger-amazon-affiliate' ),
        );

        return $menu_items;
    }

    /**
     * Render Vue.js wrapper, pass initial plugin settings as a prop
     *
     * @return void
     */
    public function render_plugin_content(): void {
        echo WpMenu::renderMenuNavigation();

        ?>
        <div id="affiliate-plugin-app" class="affiliate-plugin-app">
            <App
                    :initial-settings="<?php echo htmlspecialchars( json_encode( $this->plugin_settings->get_plugin_settings()->to_array() ) ); ?>">
            </App>
        </div>
        <?php
    }
}
