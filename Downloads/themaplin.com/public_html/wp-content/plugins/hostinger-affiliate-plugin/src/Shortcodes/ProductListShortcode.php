<?php
/**
 * Product list class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Shortcodes;

use Hostinger\AffiliatePlugin\Models\Product;
use Hostinger\AffiliatePlugin\Repositories\ListRepository;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;
use Hostinger\AffiliatePlugin\Amplitude\Actions as AmplitudeActions;
use Hostinger\AffiliatePlugin\Services\ProductFetchService;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Product list class
 */
class ProductListShortcode extends Shortcode {
    /**
     * @var ListRepository
     */
    private ListRepository $list_repository;

    public function __construct( ShortcodeManager $shortcode_manager, ProductRepository $product_repository, ListRepository $list_repository, ProductFetchService $product_fetch_service ) {
        parent::__construct( $shortcode_manager, $product_repository, $product_fetch_service );

        $this->list_repository = $list_repository;
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
     * @return null
     */
    public function return_item_count(): int {
        $atts = $this->shortcode_manager->get_atts();

        $asins = ! empty( $atts['asin'] ) ? explode( ',', $atts['asin'] ) : array();

        $items = count( $asins );

        $product_list_type = ! empty( $atts['product_list_type'] ) ? $atts['product_list_type'] : '';

        if ( $product_list_type === 'bestsellers' ) {
            $items = ! empty( $atts['list_items_count'] ) ? (int) $atts['list_items_count'] : 3;
        }

        return $items;
    }

    /**
     * @param Product $product product.
     *
     * @return string
     */
    public function render_product_description( Product $product ): string {
        $atts = $this->shortcode_manager->get_atts();

        $description_items = ! empty( $atts['description_items'] ) ? absint( (int) $atts['description_items'] ) : '';

        return $this->shortcode_manager->render_product_description( $product->get_item_data(), $description_items );
    }

    /**
     * @return string
     */
    public function render(): string {
        $atts = $this->shortcode_manager->get_atts();

        $products = array();

        $product_list_type = ! empty( $atts['product_list_type'] ) ? $atts['product_list_type'] : AmplitudeActions::AFFILIATE_LIST_MANUAL_PRODUCT_TYPE;
        $marketplace       = ! empty( $atts['marketplace'] ) ? sanitize_text_field( $atts['marketplace'] ) : 'amazon';
        $this->product_repository->set_marketplace( $marketplace );

        if ( $product_list_type === AmplitudeActions::AFFILIATE_LIST_BESTSELLERS_PRODUCT_TYPE ) {
            $keywords = ! empty( $atts['keywords'] ) ? $atts['keywords'] : '';

            if ( empty( $keywords ) ) {
                return __( 'Please enter keyword(-s)!', 'hostinger-affiliate-plugin' );
            }

            try {
                $products = $this->product_fetch_service->pull_bestsellers( $keywords, $atts['display_type'] );
            } catch ( \Exception $e ) {
                return $e->getMessage();
            }
        } elseif ( $product_list_type === AmplitudeActions::AFFILIATE_LIST_MANUAL_PRODUCT_TYPE ) {
            $asin = ! empty( $atts['asin'] ) ? $this->product_repository->clean_asin( $atts['asin'] ) : '';
            $asin = ! empty( $asin ) ? $this->product_repository->limit_asin( $asin ) : array();

            if ( empty( $asin ) ) {
                return __( 'Please enter product(-s) ASIN(-s)!', 'hostinger-affiliate-plugin' );
            }

            try {
                $products = $this->product_fetch_service->pull_products( $asin, $atts['display_type'], $marketplace );
            } catch ( \Exception $e ) {
                return $e->getMessage();
            }
        }

        if ( empty( $products ) || is_wp_error( $products ) ) {
            return __( 'Products not fetched from DB and/or API. Please check debug logs.', 'hostinger-affiliate-plugin' );
        }

        ob_start();

        require __DIR__ . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'product-list.php';

        $content = ob_get_contents();

        ob_end_clean();

        return $content;
    }
}
