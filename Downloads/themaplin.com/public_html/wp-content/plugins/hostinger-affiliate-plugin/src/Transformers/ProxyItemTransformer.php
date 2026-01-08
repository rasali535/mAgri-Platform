<?php

namespace Hostinger\AffiliatePlugin\Transformers;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Dto\Proxy\ProxyItemDto as ProxyItem;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ProxyItemTransformer extends ProductTransformer {
    private PluginSettings $plugin_settings;

    public function __construct( PluginSettings $plugin_settings ) {
        $this->plugin_settings = $plugin_settings;
    }

    public function transform( array $data ): array {
        $item_data = array();
        $item      = ProxyItem::from_array( $data );

        $plugin_settings = $this->plugin_settings->get_plugin_settings();
        $url             = 'https://www.' . $plugin_settings->amazon->get_domain() . '/dp/' . $item->get_asin();

        $image = $item->get_image();
        if ( empty( $image ) && ! empty( $item->get_images() ) ) {
            $images = $item->get_images();
            $image  = reset( $images );
        }

        if ( ! empty( $image ) ) {
            $thumbnail = str_replace( '.jpg', '._SL75_.jpg', $image ) ?? '';
        }

        if ( ! empty( $item->get_feature_bullets() ) ) {
            $item_data['features'] = $item->get_feature_bullets();
        }

        return array(
            'asin'             => $item->get_asin(),
            'source'           => 'amazon',
            'title'            => $item->get_name(),
            'url'              => $url,
            'image_url'        => $image,
            'thumbnail'        => $thumbnail ?? '',
            'currency'         => $item->get_price_currency(),
            'price'            => $item->get_price(),
            'pricing'          => $item->get_pricing(),
            'is_prime'         => $item->get_is_prime(),
            'rating'           => $item->get_rating(),
            'reviews'          => $item->get_reviews(),
            'is_free_shipping' => false,
            'item_data'        => $item_data,
        );
    }
}
