<?php

namespace Hostinger\AffiliatePlugin\Localization;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class Messages {
    public static function get_missing_field_message( string $field_name ): string {
        /* translators: %s: missing field key name */
        return sprintf( __( 'Field %s is empty.', 'hostinger-affiliate-plugin' ), $field_name );
    }

    public static function get_general_amazon_api_error_message(): string {
        return __( 'Amazon API returned an error.', 'hostinger-affiliate-plugin' );
    }

    public static function get_failed_asin_validation_message(): string {
        return __( 'ASIN validation failed. Please check entered product ASIN!', 'hostinger-affiliate-plugin' );
    }

    public static function get_unknown_layout_message(): string {
        return __( 'Unknown display type. Please re-select display type.', 'hostinger-affiliate-plugin' );
    }
}
