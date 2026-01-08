<?php
/**
 * Product table class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Shortcodes;

use Hostinger\AffiliatePlugin\Amplitude\Actions;
use Hostinger\AffiliatePlugin\Models\Product;
use Hostinger\AffiliatePlugin\Models\Table\AsinRow;
use Hostinger\AffiliatePlugin\Models\Table\FeatureRow;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;
use Hostinger\AffiliatePlugin\Repositories\TableRepository;
use Hostinger\AffiliatePlugin\Services\ProductFetchService;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Product table class
 */
class ProductTableShortcode extends Shortcode {
    /**
     * @var TableRepository
     */
    private TableRepository $table_repository;

    /**
     * @var array
     */
    private array $products;

    public function __construct( ShortcodeManager $shortcode_manager, ProductRepository $product_repository, TableRepository $table_repository, ProductFetchService $product_fetch_service ) {
        parent::__construct( $shortcode_manager, $product_repository, $product_fetch_service );

        $this->table_repository = $table_repository;
    }

    public function get_product_url( Product $product ) {
        $atts = $this->shortcode_manager->get_atts();

        $items = $atts['items'] ?? array();

        $product_url = $product->get_url();

        if ( ! empty( $items[ $product->get_asin() ]['affiliate_url'] ) ) {
            $product_url = $items[ $product->get_asin() ]['affiliate_url'];
        }

        return $product_url;
    }

    /**
     * @return string
     */
    public function render(): string {
        $atts = $this->shortcode_manager->get_atts();

        if ( empty( $atts['table_id'] ) ) {
            return __( 'Table not found.', 'hostinger-affiliate-plugin' );
        }

        $table = $this->table_repository->get( (int) $atts['table_id'] );

        if ( empty( $table ) ) {
            if ( current_user_can( 'administrator' ) ) {
                return __( 'Table not found or it is not published.', 'hostinger-affiliate-plugin' );
            } else {
                return '';
            }
        }

        $asin_rows = $table->convert_array_items_to_array( $table->get_asin_rows() );

        $asin_rows = array_filter(
            $asin_rows,
            function ( $item ) {
                return (int) $item['is_enabled'] === 1;
            }
        );

        $asin = wp_list_pluck( $asin_rows, 'asin' );

        if ( empty( $atts['marketplace'] ) ) {
            $marketplace = get_post_meta( (int) $atts['table_id'], '_marketplace', true );

            if ( empty( $marketplace ) ) {
                $marketplace = 'amazon';
            }
        } else {
            $marketplace = sanitize_text_field( $atts['marketplace'] );
        }

        $this->product_repository->set_marketplace( $marketplace );

        try {
            $this->products = $this->product_fetch_service->pull_products( $asin, Actions::AFFILIATE_TABLE_LAYOUT, $marketplace );
        } catch ( \Exception $e ) {
            return $e->getMessage();
        }

        ob_start();

        require __DIR__ . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'product-table.php';

        $content = ob_get_contents();

        ob_end_clean();

        return $content;
    }

    /**
     * @param FeatureRow $feature_row
     * @param AsinRow    $asin_row
     *
     * @return string
     */
    public function render_table_row( FeatureRow $feature_row, AsinRow $asin_row ): string {
        $value = '';

        $asin = $asin_row->get_asin();

        $product = array_filter(
            $this->products,
            function ( $product ) use ( $asin ) {
                return ! empty( $product ) && $product->get_asin() === $asin;
            }
        );

        if ( empty( $product ) ) {
            return '';
        }

        $product = reset( $product );

        $product_url = $this->shortcode_manager->render_product_url( $product, 'multiple' );

        switch ( $feature_row->get_selected_value() ) {
            case 'title':
                $value = '<a href="' . $product_url . '" target="_blank" rel="nofollow noopener noreferrer">' . $this->render_product_title( $product ) . '</a>';
                break;
            case 'thumbnail':
                $value = '<a href="' . $product_url . '" target="_blank" rel="nofollow noopener noreferrer"><img src="' . $product->get_image_url() . '" alt="' . esc_attr( $product->get_title() ) . '"></a>';
                break;
            case 'price':
                $price = $product->price_available();

                if ( ! empty( $price ) ) {
                    $value = $this->shortcode_manager->render_price( $product );
                }
                break;
            case 'prime_status':
                if ( ! empty( $product->get_is_prime() ) ) {
                    $value = '<img src="' . HOSTINGER_AFFILIATE_PLUGIN_URL . 'assets/img/prime.png' . '" alt="' . __( 'Is prime', 'hostinger-affiliate-plugin' ) . '">';
                } else {
                    $value = ' ';
                }
                break;
            case 'amazon_button':
                ob_start();

                switch ( $product->get_source() ) {
                    case 'mercado':
                        include __DIR__ . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'buttons' . DIRECTORY_SEPARATOR . 'mercado.php';
                        break;
                    case 'amazon':
                    default:
                        include __DIR__ . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'buttons' . DIRECTORY_SEPARATOR . 'amazon.php';
                        break;
                }

                $value = ob_get_contents();

                ob_end_clean();

                break;
        }

        return $value;
    }

    /**
     * @param AsinRow $asin_row
     *
     * @return string
     */
    public function prepare_row_colors( AsinRow $asin_row ): string {

        $color = $asin_row->get_color();

        if ( ! empty( $color ) ) {
            return 'style="background: ' . $color . '; color: ' . $this->inverse_color( $color ) . ' !important"';
        }

        return '';
    }

    /**
     * @param $value
     *
     * @return string
     */
    public function format_selected_value( $value ): string {
        return str_replace( '_', '-', $value );
    }

    /**
     * @param Product $product product object.
     *
     * @return string
     */
    public function render_product_title( Product $product ): string {
        $atts = $this->shortcode_manager->get_atts();

        $length = ! empty( $atts['title_length'] ) ? abs( (int) $atts['title_length'] ) : 0;

        return $this->shortcode_manager->limit_string( $product->get_title(), 65, $length );
    }

    /**
     * @param $hex_color
     *
     * @return string
     */
    private function inverse_color( $hex_color ): string {
        $hex_color = str_replace( '#', '', $hex_color );

        $r = hexdec( substr( $hex_color, 0, 2 ) );
        $g = hexdec( substr( $hex_color, 2, 2 ) );
        $b = hexdec( substr( $hex_color, 4, 2 ) );

        $inverse_r = 255 - $r;
        $inverse_g = 255 - $g;
        $inverse_b = 255 - $b;

        return sprintf( '#%02x%02x%02x', $inverse_r, $inverse_g, $inverse_b );
    }
}
