<?php

namespace Hostinger\AffiliatePlugin\Dto\Proxy;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ProxyItemDto {
    private string $url;
    private string $name;
    private string $asin;
    private string $image;
    private array $images;
    private array $feature_bullets;
    private string $price;
    private string $pricing;
    private string $price_currency;
    private string $rating;
    private int $reviews;
    private bool $is_prime;

    public function __construct( string $url, string $name, string $asin, string $image, array $images, array $feature_bullets, string $price, string $pricing, string $price_currency, string $rating, int $reviews, bool $is_prime ) {
        $this->url             = $url;
        $this->name            = $name;
        $this->asin            = $asin;
        $this->image           = $image;
        $this->images          = $images;
        $this->feature_bullets = $feature_bullets;
        $this->price           = $price;
        $this->price_currency  = $price_currency;
        $this->pricing         = $pricing;
        $this->rating          = $rating;
        $this->reviews         = $reviews;
        $this->is_prime        = $is_prime;
    }

    public function get_name(): string {
        return $this->name;
    }

    public function set_name( string $name ): void {
        $this->name = $name;
    }

    public function get_url(): string {
        return $this->url;
    }

    public function set_url( string $url ): void {
        $this->url = $url;
    }

    public function get_asin(): string {
        return $this->asin;
    }

    public function set_asin( string $asin ): void {
        $this->asin = $asin;
    }

    public function get_image(): string {
        return $this->image;
    }

    public function set_image( string $image ): void {
        $this->image = $image;
    }

    public function get_images(): array {
        return $this->images;
    }

    public function set_images( array $images ): void {
        $this->images = $images;
    }

    public function get_feature_bullets(): array {
        return $this->feature_bullets;
    }

    public function set_feature_bullets( array $feature_bullets ): void {
        $this->feature_bullets = $feature_bullets;
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

    public function get_pricing(): string {
        return $this->pricing;
    }

    public function set_pricing( string $pricing ): void {
        $this->pricing = $pricing;
    }

    public function get_rating(): string {
        return $this->rating;
    }

    public function set_rating( string $rating ): void {
        $this->rating = $rating;
    }

    public function get_reviews(): int {
        return $this->reviews;
    }

    public function set_reviews( int $reviews ): void {
        $this->reviews = $reviews;
    }

    public function get_is_prime(): bool {
        return $this->is_prime;
    }

    public function set_is_prime( bool $is_prime ): void {
        $this->is_prime = $is_prime;
    }

    public static function from_array( array $data ): self {
        $asin = ! empty( $data['asin'] ) ? $data['asin'] : '';

        if ( empty( $asin ) ) {
            $asin = ! empty( $data['product_information']['asin'] ) ? $data['product_information']['asin'] : '';
        }

        $price    = $data['price'] ?? '';
        $currency = $data['price_symbol'] ?? '';
        $pricing  = $data['pricing'] ?? '';

        $rating = $data['stars'] ?? 0;

        if ( empty( $price ) && ! empty( $data['average_rating'] ) ) {
            $rating = $data['average_rating'];
        }

        return new self(
            $data['url'] ?? '',
            $data['name'] ?? '',
            $asin ?? '',
            $data['image'] ?? '',
            $data['images'] ?? array(),
            $data['feature_bullets'] ?? array(),
            $price ?? '',
            $pricing ?? '',
            $currency ?? '',
            $rating ?? 0,
            $data['total_reviews'] ?? 0,
            $data['has_prime'] ?? false,
        );
    }
}
