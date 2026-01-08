<?php

namespace Hostinger\AffiliatePlugin\Helpers;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UrlHelper {
    private array $allowed_schemes = array( 'http', 'https' );

    public function sanitize( string $url, array $drop_params = array() ): string {
        $url = trim( $url );
        if ( $url === '' ) {
            return '';
        }

        $clean = remove_query_arg( $drop_params, $url );

        return esc_url_raw( $clean, $this->allowed_schemes );
    }

    public function build_amazon_url_with_tag( string $url, ?string $tag ): string {
        $base = $this->sanitize( $url, array( 'tag' ) );
        if ( $base === '' || empty( $tag ) ) {
            return $base;
        }

        $with = add_query_arg( array( 'tag' => $tag ), $base );

        return esc_url_raw( $with, $this->allowed_schemes );
    }
}
