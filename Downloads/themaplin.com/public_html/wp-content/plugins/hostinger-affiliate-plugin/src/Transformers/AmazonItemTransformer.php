<?php

namespace Hostinger\AffiliatePlugin\Transformers;

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ItemDto as AmazonItem;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class AmazonItemTransformer extends ProductTransformer {

    public function transform( array $data ): array {
        $item_data = array();
        $item      = AmazonItem::from_array( $data );

        $by_line_info = array();

        if ( ! empty( $item->get_item_info()->get_by_line_info()->get_brand()->get_display_value() ) ) {
            $by_line_info['brand'] = $item->get_item_info()->get_by_line_info()->get_brand()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_by_line_info()->get_manufacturer()->get_display_value() ) ) {
            $by_line_info['manufacturer'] = $item->get_item_info()->get_by_line_info()->get_manufacturer()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_by_line_info()->get_contributors() ) ) {
            $contributors = array();

            foreach ( $item->get_item_info()->get_by_line_info()->get_contributors() as $contributor ) {
                $contributors[] = array(
                    'name'     => $contributor->get_name(),
                    'role'     => $contributor->get_role(),
                    'roleType' => $contributor->get_role_type(),
                );
            }

            $by_line_info['contributors'] = $contributors;
        }

        if ( ! empty( $by_line_info ) ) {
            $item_data['by_line_info'] = $by_line_info;
        }

        if ( ! empty( $item->get_item_info()->get_content_rating()->get_audience_rating()->get_display_value() ) ) {
            $item_data['audience_rating'] = $item->get_item_info()->get_content_rating()->get_audience_rating()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_classifications()->get_binding()->get_display_value() ) ) {
            $item_data['binding'] = $item->get_item_info()->get_classifications()->get_binding()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_classifications()->get_product_group()->get_display_value() ) ) {
            $item_data['product_group'] = $item->get_item_info()->get_classifications()->get_product_group()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_features()->get_display_values() ) ) {
            $features = array();

            foreach ( $item->get_item_info()->get_features()->get_display_values() as $feature ) {
                $features[] = $feature;
            }

            $item_data['features'] = $features;
        }

        if ( ! empty( $item->get_item_info()->get_content_info()->get_edition()->get_display_value() ) ) {
            $item_data['edition'] = $item->get_item_info()->get_content_info()->get_edition()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_content_info()->get_languages()->get_display_values() ) ) {
            $languages = array();

            foreach ( $item->get_item_info()->get_content_info()->get_languages()->get_display_values() as $language ) {
                $languages[] = array(
                    'value' => $language->get_display_value(),
                    'type'  => $language->get_type(),
                );
            }

            $item_data['languages'] = $languages;
        }

        if ( ! empty( $item->get_item_info()->get_content_info()->get_pages_count()->get_display_value() ) ) {
            $item_data['pages_count'] = $item->get_item_info()->get_content_info()->get_pages_count()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_content_info()->get_publication_date()->get_display_value() ) ) {
            $item_data['publication_date'] = $item->get_item_info()->get_content_info()->get_publication_date()->get_display_value();
        }

        $manufacture_info = array();

        if ( ! empty( $item->get_item_info()->get_manufacture_info()->get_item_part_number()->get_display_value() ) ) {
            $manufacture_info['item_part_number'] = $item->get_item_info()->get_manufacture_info()->get_item_part_number()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_manufacture_info()->get_model()->get_display_value() ) ) {
            $manufacture_info['model'] = $item->get_item_info()->get_manufacture_info()->get_model()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_manufacture_info()->get_warranty()->get_display_value() ) ) {
            $manufacture_info['warranty'] = $item->get_item_info()->get_manufacture_info()->get_warranty()->get_display_value();
        }

        if ( ! empty( $manufacture_info ) ) {
            $item_data['manufacture_info'] = $manufacture_info;
        }

        $product_info = array();

        if ( ! empty( $item->get_item_info()->get_product_info()->get_color()->get_display_value() ) ) {
            $product_info['color'] = $item->get_item_info()->get_product_info()->get_color()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_product_info()->get_is_adult_product()->get_display_value() ) ) {
            $product_info['is_adult_product'] = $item->get_item_info()->get_product_info()->get_is_adult_product()->get_display_value();
        }

        $item_dimensions = array();

        $possible_item_dimension_keys = array(
            'height',
            'length',
            'weight',
            'width',
        );

        foreach ( $possible_item_dimension_keys as $key ) {
            $method = 'get_' . $key;
            if ( ! empty( $item->get_item_info()->get_product_info()->get_item_dimensions()->$method()->get_display_value() ) ) {
                $item_dimensions[ strtolower( $key ) ] = $item->get_item_info()->get_product_info()->get_item_dimensions()->$method()->get_display_value();
            }
        }

        if ( ! empty( $item_dimensions ) ) {
            $product_info['item_dimensions'] = $item_dimensions;
        }

        if ( ! empty( $item->get_item_info()->get_product_info()->get_release_date()->get_display_value() ) ) {
            $product_info['release_date'] = $item->get_item_info()->get_product_info()->get_release_date()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_product_info()->get_size()->get_display_value() ) ) {
            $product_info['size'] = $item->get_item_info()->get_product_info()->get_size()->get_display_value();
        }

        if ( ! empty( $item->get_item_info()->get_product_info()->get_unit_count()->get_display_value() ) ) {
            $product_info['unit_count'] = $item->get_item_info()->get_product_info()->get_unit_count()->get_display_value();
        }

        if ( ! empty( $product_info ) ) {
            $item_data['product_info'] = $product_info;
        }

        $technical_info = array();

        if ( ! empty( $item->get_item_info()->get_technical_info()->get_formats()->get_display_values() ) ) {
            $formats = array();

            foreach ( $item->get_item_info()->get_technical_info()->get_formats()->get_display_values() as $format ) {
                $formats[] = $format;
            }

            $technical_info['formats'] = $formats;
        }

        if ( ! empty( $technical_info ) ) {
            $item_data['technical_info'] = $technical_info;
        }

        $listings = $item->get_offers()->get_listings();
        $listing  = reset( $listings );

        return array(
            'asin'             => $item->get_asin(),
            'source'           => 'amazon',
            'title'            => $item->get_item_info()->get_title()->get_display_value(),
            'url'              => $item->get_detail_page_url(),
            'image_url'        => $item->get_images()->get_primary()->get_large()->get_url(),
            'thumbnail'        => $item->get_images()->get_primary()->get_small()->get_url(),
            'currency'         => ! empty( $listing ) ? $listing->get_price()->get_currency() : '',
            'price'            => ! empty( $listing ) ? $listing->get_price()->get_amount() : '',
            'is_prime'         => ! empty( $listing ) ? $listing->get_delivery_info()->get_is_prime_eligible() : false,
            'is_free_shipping' => ! empty( $listing ) ? $listing->get_delivery_info()->get_is_free_shipping_eligible() : false,
            'item_data'        => $item_data,
        );
    }
}
