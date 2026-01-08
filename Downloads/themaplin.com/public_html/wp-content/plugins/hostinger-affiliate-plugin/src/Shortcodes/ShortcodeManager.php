<?php

namespace Hostinger\AffiliatePlugin\Shortcodes;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Repositories\ListRepository;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;
use Hostinger\AffiliatePlugin\Amplitude\Actions as AmplitudeActions;
use Hostinger\AffiliatePlugin\Localization\Messages;
use Hostinger\AffiliatePlugin\Models\Product;
use Hostinger\AffiliatePlugin\Amplitude\Events as AmplitudeEvents;
use Hostinger\AffiliatePlugin\Repositories\TableRepository;
use Hostinger\AffiliatePlugin\Services\ProductFetchService;
use Hostinger\AffiliatePlugin\Helpers\UrlHelper;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ShortcodeManager {
    private array $atts = array();

    private PluginSettings $plugin_settings;
    private AmplitudeEvents $amplitude_events;
    private ProductRepository $product_repository;
    private ListRepository $list_repository;
    private TableRepository $table_repository;
    private ProductFetchService $product_fetch_service;

    private UrlHelper $url_helper;

    public function __construct(
        PluginSettings $plugin_settings,
        AmplitudeEvents $amplitude_events,
        ProductRepository $product_repository,
        ListRepository $list_repository,
        TableRepository $table_repository,
        ProductFetchService $product_fetch_service,
        UrlHelper $url_helper
    ) {
        $this->plugin_settings       = $plugin_settings;
        $this->amplitude_events      = $amplitude_events;
        $this->product_repository    = $product_repository;
        $this->list_repository       = $list_repository;
        $this->table_repository      = $table_repository;
        $this->product_fetch_service = $product_fetch_service;
        $this->url_helper            = $url_helper;
    }

    public function get_atts(): array {
        return $this->atts;
    }

    public function set_atts( array $atts ): void {
        $this->atts = $atts;
    }

    public function render_shortcode(): string {
        $display_type = ! empty( $this->atts['display_type'] ) ? sanitize_text_field( $this->atts['display_type'] ) : '';

        if ( empty( $display_type ) ) {
            return __( 'Please choose display type!', 'hostinger-affiliate-plugin' );
        }

        if ( ! in_array( $display_type, AmplitudeActions::AFFILIATE_ALLOWED_LAYOUTS, true ) ) {
            return Messages::get_unknown_layout_message();
        }

        $shortcode = null;

        switch ( $display_type ) {
            case AmplitudeActions::AFFILIATE_SINGLE_LAYOUT:
                $shortcode = new ProductCardShortcode( $this, $this->product_repository, $this->product_fetch_service );
                break;
            case AmplitudeActions::AFFILIATE_LIST_LAYOUT:
                $shortcode = new ProductListShortcode( $this, $this->product_repository, $this->list_repository, $this->product_fetch_service );
                break;
            case AmplitudeActions::AFFILIATE_TABLE_LAYOUT:
                $shortcode = new ProductTableShortcode( $this, $this->product_repository, $this->table_repository, $this->product_fetch_service );
                break;
        }

        return ! empty( $shortcode ) ? $shortcode->render() : '';
    }

    public function limit_string( string $text_string, int $default_limit, int $limit = 0 ): string {
        if ( empty( $limit ) ) {
            $limit = $default_limit;
        }

        return ( mb_strlen( $text_string ) > $limit ) ? mb_substr( $text_string, 0, $limit ) . '...' : $text_string;
    }

    public function render_product_description( array $item_data, int $description_items ): string {
        ob_start();

        ?>
        <ul>
            <?php

            if ( ! empty( $item_data['features'] ) ) {
                foreach ( array_slice( $item_data['features'], 0, $description_items ) as $feature ) {
                    ?>
                    <li><?php echo $this->limit_string( $feature, 120, $this->atts['description_length'] ); ?></li>
                    <?php
                }
            } else {
                if ( ! empty( $item_data['by_line_info']['contributors'] ) ) {
                    foreach ( array_slice( $item_data['by_line_info']['contributors'], 0, $description_items ) as $contributor ) {

                        ?>
                        <li><?php echo $this->limit_string( ! empty( $contributor['name'] ) ? $contributor['name'] : '', 120, $this->atts['description_length'] ); ?></li>
                        <?php
                    }
                }
            }

            ?>
        </ul>
        <?php

        $content = ob_get_contents();

        ob_end_clean();

        return $content;
    }

    public function render_price( Product $product ): string {
        if ( ! empty( $product->get_pricing() ) ) {
            return $product->get_pricing();
        }

        $default_format = number_format( $product->get_price(), 2, '.', '' ) . ' ' . $product->get_currency();
        if ( $product->get_source() === 'mercado' ) {
            $format = $this->plugin_settings->get_plugin_settings()->get_mercado_options()->get_formats();
        } else {
            $format = $this->plugin_settings->get_plugin_settings()->get_amazon_options()->get_formats();
        }

        if ( empty( $format ) ) {
            return $default_format;
        }

        $formatted_price = number_format( $product->get_price(), $format['number_format']['decimals'], $format['number_format']['decimal_separator'], $format['number_format']['thousands_separator'] );

        $currency_position = ! empty( $format['currency_position'] ) ? $format['currency_position'] : 'right';
        $currency          = ! empty( $format['currency'] ) ? $format['currency'] : ' ' . $product->get_currency();

        switch ( $currency_position ) {
            case 'left':
                return $currency . $formatted_price;
            case 'right':
                return $formatted_price . $currency;
            default:
                return $formatted_price . ' ' . $product->get_currency();
        }
    }

    public function render_buy_now_button_label( Product $product ): string {
        $amazon_button_label = $product->buy_button_title();

        if ( ! empty( $this->atts['buy_button_overwrite_enabled'] ) ) {
            $amazon_button_label = sanitize_text_field( $this->atts['buy_button_overwrite'] );
        }

        return $amazon_button_label;
    }

    public function render_product_url( Product $product, $type = 'single' ): string {
        $product_url = $product->get_url();
        if ( $product->get_source() === 'amazon' ) {
            $tag         = $this->plugin_settings->get_plugin_settings()->amazon->get_tracking_id();
            $product_url = $this->url_helper->build_amazon_url_with_tag( $product_url, $tag );
        } else {
            $product_url = $this->url_helper->sanitize( $product_url, array() );
        }

        $atts = $this->get_atts();
        switch ( $type ) {
            default:
            case 'single':
                if ( ! empty( $atts['affiliate_url'] ) ) {
                    $product_url = $this->url_helper->sanitize( $atts['affiliate_url'] );
                }
                break;
            case 'multiple':
                $items = $atts['items'] ?? array();
                if ( ! empty( $items[ $product->get_asin() ]['affiliate_url'] ) ) {
                    $product_url = $this->url_helper->sanitize( $items[ $product->get_asin() ]['affiliate_url'] );
                }
                break;
        }

        return esc_url( $product_url );
    }
}
