<?php

namespace Hostinger\AffiliatePlugin\Transformers;

use Hostinger\AffiliatePlugin\Dto\Mercado\MercadoItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class MercadoItemTransformer extends ProductTransformer {

    public function transform( array $data ): array {
        $item_data = array();
        $item      = MercadoItemDto::from_array( $data );

        if ( ! empty( $item->get_description() ) ) {
            $item_data['features'] = array( $item->get_description() );
        }

        return array(
            'asin'             => $item->get_id(),
            'source'           => 'mercado',
            'title'            => $item->get_name(),
            'url'              => $item->get_url(),
            'image_url'        => $item->get_image(),
            'thumbnail'        => $item->get_image(),
            'currency'         => $item->get_price_currency(),
            'price'            => $item->get_price(),
            'pricing'          => '',
            'is_prime'         => false,
            'rating'           => $item->get_rating_value(),
            'reviews'          => $item->get_rating_count(),
            'is_free_shipping' => false,
            'item_data'        => $item_data,
        );
    }
}
