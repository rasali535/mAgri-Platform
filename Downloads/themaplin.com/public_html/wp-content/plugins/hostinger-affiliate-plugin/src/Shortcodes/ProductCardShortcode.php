<?php
/**
 * Shortcode class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Shortcodes;

use Hostinger\AffiliatePlugin\Models\Product;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;
use Hostinger\AffiliatePlugin\Services\ProductFetchService;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Shortcode class
 */
class ProductCardShortcode extends Shortcode {
    public function __construct( ShortcodeManager $shortcode_manager, ProductRepository $product_repository, ProductFetchService $product_fetch_service ) {
        parent::__construct( $shortcode_manager, $product_repository, $product_fetch_service );
    }

    /**
     * @param Product $product product object.
     *
     * @return string
     */
    public function render_product_title( Product $product ): string {
        $atts = $this->shortcode_manager->get_atts();

        if ( ! empty( $atts['title_overwrite_enabled'] ) ) {
            return $atts['title_overwrite'] ?? '';
        }

        $length = ! empty( $atts['title_length'] ) ? abs( (int) $atts['title_length'] ) : 0;

        return $this->shortcode_manager->limit_string( $product->get_title(), 65, $length );
    }

    /**
     * @param Product $product product.
     *
     * @return string
     */
    public function render_product_description( Product $product ): string {
        $atts = $this->shortcode_manager->get_atts();

        if ( ! empty( $atts['description_overwrite_enabled'] ) ) {
            return '<p>' . nl2br( $atts['description_overwrite'] ) . '</p>';
        }

        $description_items = ! empty( $atts['description_items'] ) ? (int) $atts['description_items'] : '';

        return $this->shortcode_manager->render_product_description( $product->get_item_data(), $description_items );
    }

    /**
     * @return string
     */
    public function render(): string {
        $atts = $this->shortcode_manager->get_atts();

        $asin         = ! empty( $atts['asin'] ) ? $this->product_repository->clean_asin( $atts['asin'] ) : '';
        $asin         = ! empty( $asin ) ? $this->product_repository->limit_asin( $asin ) : array();
        $display_type = ! empty( $atts['display_type'] ) ? sanitize_text_field( $atts['display_type'] ) : '';
        $marketplace  = ! empty( $atts['marketplace'] ) ? sanitize_text_field( $atts['marketplace'] ) : 'amazon';

        $this->product_repository->set_marketplace( $marketplace );

        if ( empty( $asin ) ) {
            return __( 'Please enter product(-s) ASIN(-s)!', 'hostinger-affiliate-plugin' );
        }

        try {
            $products = $this->product_fetch_service->pull_products( $asin, $display_type, $marketplace );
        } catch ( \Exception $e ) {
            return $e->getMessage();
        }

        if ( empty( $products ) ) {
            return __( 'Products not fetched from DB and/or API. Please check debug logs.', 'hostinger-affiliate-plugin' );
        }

        ob_start();

        require __DIR__ . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'product-card.php';

        $content = ob_get_contents();

        ob_end_clean();

        return $content;
    }
}
