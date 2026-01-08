<?php

namespace Hostinger\AffiliatePlugin\Dto\Mercado;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class MercadoItemDto {
    private string $name;
    private string $description;
    private string $image;
    private string $brand;
    private string $rating_value;
    private int $rating_count;
    private string $availability;
    private string $price;
    private string $price_currency;
    private string $url;
    private string $id;

    public function __construct(
        string $name,
        string $description,
        string $image,
        string $brand,
        string $rating_value,
        int $rating_count,
        string $availability,
        string $price,
        string $price_currency,
        string $url,
        string $id
    ) {
        $this->name           = $name;
        $this->description    = $description;
        $this->image          = $image;
        $this->brand          = $brand;
        $this->rating_value   = $rating_value;
        $this->rating_count   = $rating_count;
        $this->availability   = $availability;
        $this->price          = $price;
        $this->price_currency = $price_currency;
        $this->url            = $url;
        $this->id             = $id;
    }

    public function get_name(): string {
        return $this->name;
    }

    public function set_name( string $name ): void {
        $this->name = $name;
    }

    public function get_description(): string {
        return $this->description;
    }

    public function set_description( string $description ): void {
        $this->description = $description;
    }

    public function get_image(): string {
        return $this->image;
    }

    public function set_image( string $image ): void {
        $this->image = $image;
    }

    public function get_brand(): string {
        return $this->brand;
    }

    public function set_brand( string $brand ): void {
        $this->brand = $brand;
    }

    public function get_rating_value(): string {
        return $this->rating_value;
    }

    public function set_rating_value( string $rating_value ): void {
        $this->rating_value = $rating_value;
    }

    public function get_rating_count(): int {
        return $this->rating_count;
    }

    public function set_rating_count( int $rating_count ): void {
        $this->rating_count = $rating_count;
    }

    public function get_availability(): string {
        return $this->availability;
    }

    public function set_availability( string $availability ): void {
        $this->availability = $availability;
    }

    public function get_price(): string {
        return $this->price;
    }

    public function set_price( string $price ): void {
        $this->price = $price;
    }

    public function get_price_currency(): string {
        return $this->price_currency;
    }

    public function set_price_currency( string $price_currency ): void {
        $this->price_currency = $price_currency;
    }

    public function get_url(): string {
        return $this->url;
    }

    public function set_url( string $url ): void {
        $this->url = $url;
    }

    public function get_id(): string {
        return $this->id;
    }

    public function set_id( string $id ): void {
        $this->id = $id;
    }

    public static function from_array( array $data ): self {
        $name        = $data['name'] ?? '';
        $description = $data['description'] ?? '';
        $image       = $data['image'] ?? '';

        $brand = '';
        if ( isset( $data['brand'] ) && is_array( $data['brand'] ) && isset( $data['brand']['name'] ) ) {
            $brand = $data['brand']['name'];
        }

        $rating_value = '0';
        $rating_count = 0;
        if ( isset( $data['aggregateRating'] ) && is_array( $data['aggregateRating'] ) ) {
            $rating_value = (string) ( $data['aggregateRating']['ratingValue'] ?? '0' );
            $rating_count = (int) ( $data['aggregateRating']['ratingCount'] ?? 0 );
        }

        $availability   = '';
        $price          = '';
        $price_currency = '';
        $url            = '';
        $id             = '';
        if ( isset( $data['offers'] ) && is_array( $data['offers'] ) ) {
            $availability   = $data['offers']['availability'] ?? '';
            $price          = (string) ( $data['offers']['price'] ?? '' );
            $price_currency = $data['offers']['priceCurrency'] ?? '';
            $url            = $data['offers']['url'] ?? '';

            if ( ! empty( $url ) ) {
                $mlb_match       = array();
                $plugin_settings = new PluginSettings();
                $product_prefix  = $plugin_settings->get_plugin_settings()->mercado->get_locale_product_prefix();

                $patterns = array(
                    '/\/p\/(' . $product_prefix . '[0-9]+)/',
                    '/\/(' . $product_prefix . '-[0-9]+)-/',
                    '/\/(' . $product_prefix . '[0-9]+)-/',
                    '/mercadolivre\.com[^\/]*\/(' . $product_prefix . '-[0-9]+)-/',
                    '/\/(' . $product_prefix . '-[0-9]+)(?:-|_|$)/',
                );

                foreach ( $patterns as $pattern ) {
                    if ( preg_match( $pattern, $url, $mlb_match ) ) {
                        $id = $mlb_match[1];
                        break;
                    }
                }
            }
        }

        if ( ! empty( $data['productID'] ) ) {
            $id = $data['productID'];
        }

        if ( empty( $id ) && ! empty( $url ) ) {
            if ( preg_match( '/[0-9]{8,}/', $url, $matches ) ) {
                $id = $matches[0];
            } else {
                $id = 'ML' . substr( md5( $url ), 0, 10 );
            }
        }

        return new self(
            $name,
            $description,
            $image,
            $brand,
            $rating_value,
            $rating_count,
            $availability,
            $price,
            $price_currency,
            $url,
            $id
        );
    }
}
