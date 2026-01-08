<?php
/**
 * Blocks class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Setup;

use Hostinger\AffiliatePlugin\Admin\Options\PluginOptions;
use Hostinger\AffiliatePlugin\Amplitude\Actions as AmplitudeActions;
use Hostinger\AffiliatePlugin\Api\AmazonFetch;
use Hostinger\AffiliatePlugin\Amplitude\Events as AmplitudeEvents;
use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Repositories\ListRepository;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;
use Hostinger\AffiliatePlugin\Repositories\TableRepository;
use Hostinger\AffiliatePlugin\Shortcodes\ShortcodeManager;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Blocks class
 */
class Blocks {
    private PluginSettings $plugin_settings;

    private ShortcodeManager $shortcode_manager;

    public function __construct( PluginSettings $plugin_settings, ShortcodeManager $shortcode_manager ) {
        $this->plugin_settings   = $plugin_settings;
        $this->shortcode_manager = $shortcode_manager;
    }

    /**
     * Run actions or/and hooks
     */
    public function init(): void {
        if ( ! function_exists( 'register_block_type' ) ) {
            return;
        }

        add_action( 'init', array( $this, 'register_amazon_block' ) );
        add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_blocks' ) );

        add_action( 'admin_footer', array( $this, 'render_search_modal' ) );

        add_shortcode( 'hostinger-affiliate-table', array( $this, 'render_affiliate_table_shortcode' ) );
    }

    /**
     * @return void
     */
    public function register_amazon_block(): void {
        wp_register_style(
            'hostinger-affiliate-plugin-block-frontend',
            HOSTINGER_AFFILIATE_PLUGIN_URL . 'assets/dist/frontend.css',
            array(),
            filemtime( HOSTINGER_AFFILIATE_PLUGIN_DIR . 'assets/dist/frontend.css' )
        );

        $attributes                  = $this->get_block_attributes();
        $attributes['marketplace']   = array(
            'type'    => 'string',
            'default' => 'amazon',
        );
        $attributes['affiliate_url'] = array(
            'type'    => 'string',
            'default' => '',
        );

        register_block_type(
            'hostinger-affiliate-plugin/block',
            array(
                'attributes'      => $attributes,
                'render_callback' => array(
                    $this,
                    'render_block',
                ),
                'style'           => 'hostinger-affiliate-plugin-block-frontend',
                'editor_style'    => 'hostinger-affiliate-plugin-block-editor',
                'editor_script'   => 'hostinger-affiliate-plugin-block',
            )
        );

        if ( $this->plugin_settings->get_plugin_settings()->get_mercado_connection_status() !== PluginOptions::STATUS_CONNECTED ) {
            return;
        }

        $attributes['marketplace']['default'] = 'mercado';

        register_block_type(
            'hostinger-affiliate-plugin/mercado-block',
            array(
                'attributes'      => $attributes,
                'render_callback' => array(
                    $this,
                    'render_block',
                ),
                'style'           => 'hostinger-affiliate-plugin-block-frontend',
                'editor_style'    => 'hostinger-affiliate-plugin-block-mercado-editor',
                'editor_script'   => 'hostinger-affiliate-plugin-block-mercado',
            )
        );
    }

    /**
     * @return void
     */
    public function enqueue_blocks(): void {
        // Amazon block.
        wp_enqueue_script(
            'hostinger-affiliate-plugin-block',
            HOSTINGER_AFFILIATE_PLUGIN_URL . 'amazon-gutenberg-block/dist/index.js',
            array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor' ),
            filemtime( HOSTINGER_AFFILIATE_PLUGIN_DIR . 'amazon-gutenberg-block/dist/index.js' )
        );

        wp_set_script_translations( 'hostinger-affiliate-plugin-block', 'hostinger-affiliate-plugin', HOSTINGER_AFFILIATE_PLUGIN_DIR . 'languages' );

        wp_enqueue_style(
            'hostinger-affiliate-plugin-block-editor',
            HOSTINGER_AFFILIATE_PLUGIN_URL . 'amazon-gutenberg-block/dist/index.css',
            array( 'wp-edit-blocks' ),
            filemtime( HOSTINGER_AFFILIATE_PLUGIN_DIR . 'amazon-gutenberg-block/dist/index.css' )
        );

        if ( $this->plugin_settings->get_plugin_settings()->get_mercado_connection_status() !== PluginOptions::STATUS_CONNECTED ) {
            return;
        }

        // Mercado Livre block.
        wp_enqueue_script(
            'hostinger-affiliate-plugin-block-mercado',
            HOSTINGER_AFFILIATE_PLUGIN_URL . 'mercado-gutenberg-block/dist/index.js',
            array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor' ),
            filemtime( HOSTINGER_AFFILIATE_PLUGIN_DIR . 'mercado-gutenberg-block/dist/index.js' )
        );

        wp_set_script_translations( 'hostinger-affiliate-plugin-block-mercado', 'hostinger-affiliate-plugin', HOSTINGER_AFFILIATE_PLUGIN_DIR . 'languages' );

        wp_enqueue_style(
            'hostinger-affiliate-plugin-block-mercado-editor',
            HOSTINGER_AFFILIATE_PLUGIN_URL . 'mercado-gutenberg-block/dist/index.css',
            array( 'wp-edit-blocks' ),
            filemtime( HOSTINGER_AFFILIATE_PLUGIN_DIR . 'mercado-gutenberg-block/dist/index.css' )
        );
    }

    /**
     * @param array $atts block attributes.
     *
     * @return string
     */
    public function render_block( array $atts ): string {
        $this->shortcode_manager->set_atts( $atts );

        return $this->shortcode_manager->render_shortcode();
    }

    /**
     * @return void
     */
    public function render_search_modal(): void {
        $plugin_settings = $this->plugin_settings->get_plugin_settings();

        ?>
        <div class="hostinger-affiliate-search-modal" id="hostinger-affiliate-search-modal" style="display: none;" data-type="single" data-operation="add">
            <div class="product-search-modal product-search-modal--found">
                <div class="product-search-modal__container-box">
                    <div class="product-search-modal__search-items-input">
                        <input type="text" name="hostinger-affiliate-product-keyword-search" value="" placeholder="<?php echo __( 'Search product name ...', 'hostinger-affiliate-plugin' ); ?>">
                        <div class="product-search-modal__search-items-button">
                            <button class="hostinger-search-button"><?php echo __( 'Search', 'hostinger-affiliate-plugin' ); ?></button>
                        </div>
                    </div>
                    <div class="product-search-modal__search-notifications" style="display: none;">
                        <div class="product-search-modal__snackbar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="#727586"/>
                            </svg>
                            <?php /* translators: %s: Amazon store region */ ?>
                            <?php echo sprintf( __( 'Products that shown in here is from your store region (%1$s). You can change store region in <a href="%2$s">Settings page</a>.', 'hostinger-affiliate-plugin' ), $plugin_settings->amazon->get_domain(), admin_url( 'admin.php?page=hostinger-amazon-affiliate' ) ); ?>
                        </div>
                    </div>
                    <div class="product-search-modal__content">
                        <div class="product-search-modal__item-results" style="display: none;">

                        </div>
                        <div class="product-search-modal__item-selected" style="display: none">

                        </div>
                        <div class="product-search-modal__search-placeholder product-search-modal__search-placeholder--no-results" style="display: none;">
                            <div class="product-search-modal__search-placeholder-image">
                                <img src="<?php echo HOSTINGER_AFFILIATE_PLUGIN_URL . 'assets/img/products-not-found.svg'; ?>" alt="<?php echo __( 'Search icon', 'hostinger-affiliate-plugin' ); ?>">
                            </div>
                            <div class="product-search-modal__search-placeholder-title">
                                <?php echo __( 'No products found', 'hostinger-affiliate-plugin' ); ?>
                            </div>
                            <div class="product-search-modal__search-placeholder-description">
                                <?php echo __( 'Check your search term and try again', 'hostinger-affiliate-plugin' ); ?><br>
                            </div>
                        </div>
                        <div class="product-search-modal__search-placeholder product-search-modal__search-placeholder--default">
                            <div class="product-search-modal__search-placeholder-image">
                                <img src="<?php echo HOSTINGER_AFFILIATE_PLUGIN_URL . 'assets/img/search-placeholder-icon.svg'; ?>" title="<?php echo __( 'Search icon', 'hostinger-affiliate-plugin' ); ?>">
                            </div>
                            <div class="product-search-modal__search-placeholder-title">
                                <?php echo __( 'Searched products will appear here', 'hostinger-affiliate-plugin' ); ?>
                            </div>
                            <div class="product-search-modal__search-placeholder-description">
                                <?php echo __( 'Search for product name that you want to add to your blog post.', 'hostinger-affiliate-plugin' ); ?><br>
                                <?php

                                if ( ! empty( $plugin_settings->amazon->get_domain() ) ) {
                                    /* translators: %s: Amazon store region */
                                    echo sprintf( __( 'Here you will see products from your store region on <b>%s</b>.', 'hostinger-affiliate-plugin' ), $plugin_settings->amazon->get_domain() );
                                } else {
                                    echo __( 'Here you will see products from your store region.', 'hostinger-affiliate-plugin' );
                                }

                                ?>
                            </div>
                        </div>
                    </div>
                    <div class="product-search-modal__search-actions">
                        <div class="product-search-modal__search-selected-products" style="display: none;">
                            <span class="product-search-modal__search-selected-products-validation-message">
                                <?php echo __( 'Select at least 2 products to continue', 'hostinger-affiliate-plugin' ); ?>
                            </span>
                            <span
                                class="product-search-modal__search-selected-products-count"
                                data-singular="<?php echo __( 'product', 'hostinger-affiliate-plugin' ); ?>"
                                data-plural="<?php echo __( 'products', 'hostinger-affiliate-plugin' ); ?>"
                                data-selected="<?php echo __( 'selected', 'hostinger-affiliate-plugin' ); ?>"
                            >

                            </span>
                        </div>
                        <button
                            class="hostinger-block-button hostinger-block-button--is-normal hostinger-block-button--is-primary-transparent product-search-modal__cancel-button"
                            type="button">
                            <?php echo __( 'Cancel', 'hostinger-affiliate-plugin' ); ?>
                        </button>
                        <button
                            class="hostinger-block-button hostinger-block-button--is-normal hostinger-block-button--is-primary product-search-modal__confirm-button"
                            disabled
                            type="button" style="display: none;">
                            <?php echo __( 'Confirm selection', 'hostinger-affiliate-plugin' ); ?>
                        </button>
                    </div>
                </div>
                <input name="hostinger-affiliate-product-keyword-search-selected-asins" type="hidden" value="">
                <input name="hostinger-affiliate-product-marketplace" type="hidden" value="amazon">
            </div>
        </div>
        <?php
    }

    /**
     * @param array $atts
     *
     * @return string
     */
    public function render_affiliate_table_shortcode( array $atts ): string {
        $atts['display_type'] = AmplitudeActions::AFFILIATE_TABLE_LAYOUT;
        $atts['table_id']     = $atts['id'];

        return $this->render_block( $atts );
    }

    private function get_block_attributes(): array {
        return array(
            'display_type'                  => array(
                'type' => 'string',
            ),
            'product_selector'              => array(
                'type' => 'string',
            ),
            'product_list_type'             => array(
                'type' => 'string',
            ),
            'list_navigation'               => array(
                'type' => 'string',
            ),
            'list_layout_selected'          => array(
                'type' => 'boolean',
            ),
            'list_items_count'              => array(
                'type'    => 'integer',
                'default' => 3,
            ),
            'list_layout'                   => array(
                'type' => 'string',
            ),
            'asin'                          => array(
                'type' => 'string',
            ),
            'asin_manual'                   => array(
                'type' => 'string',
            ),
            'items'                         => array(
                'type' => 'object',
            ),
            'keywords'                      => array(
                'type' => 'string',
            ),
            'title_overwrite_enabled'       => array(
                'type' => 'boolean',
            ),
            'title_overwrite'               => array(
                'type' => 'string',
            ),
            'title_length'                  => array(
                'type'    => 'integer',
                'default' => 65,
            ),
            'description_overwrite'         => array(
                'type' => 'string',
            ),
            'description_enabled'           => array(
                'type' => 'boolean',
            ),
            'description_overwrite_enabled' => array(
                'type' => 'boolean',
            ),
            'description_forced'            => array(
                'type' => 'boolean',
            ),
            'description_items'             => array(
                'type'    => 'integer',
                'default' => 3,
            ),
            'description_length'            => array(
                'type'    => 'integer',
                'default' => 120,
            ),
            'ready'                         => array(
                'type' => 'boolean',
            ),
            'table_id'                      => array(
                'type'    => 'integer',
                'default' => 0,
            ),
            'products_selected_open'        => array(
                'type'    => 'boolean',
                'default' => true,
            ),
            'bestseller_label_enabled'      => array(
                'type'    => 'boolean',
                'default' => true,
            ),
            'buy_button_overwrite_enabled'  => array(
                'type'    => 'boolean',
                'default' => false,
            ),
            'buy_button_overwrite'          => array(
                'type'    => 'string',
                'default' => '',
            ),
        );
    }
}
