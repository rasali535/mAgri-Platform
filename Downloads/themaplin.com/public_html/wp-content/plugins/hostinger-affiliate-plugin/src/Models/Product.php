<?php
namespace Hostinger\AffiliatePlugin\Models;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class Product {
    private int $id = 0;
    private string $asin;
    private string $source         = '';
    private string $title          = '';
    private string $url            = '';
    private string $image_url      = '';
    private string $thumbnail      = '';
    private array $item_data       = array();
    private string $currency       = '';
    private float $price           = 0;
    private string $pricing        = '';
    private bool $is_prime         = false;
    private bool $is_free_shipping = false;
    private float $rating          = 0;
    private int $reviews           = 0;
    private string $status         = 'active';
    private string $created_at;
    private string $updated_at = '';

    public function __construct( array $db_array = array() ) {
        if ( isset( $db_array['id'] ) ) {
            $this->set_id( $db_array['id'] );
        }

        if ( isset( $db_array['asin'] ) ) {
            $this->set_asin( $db_array['asin'] );
        }

        if ( isset( $db_array['source'] ) ) {
            $this->set_source( $db_array['source'] );
        }

        if ( isset( $db_array['title'] ) ) {
            $this->set_title( $db_array['title'] );
        }

        if ( isset( $db_array['url'] ) ) {
            $this->set_url( $db_array['url'] );
        }

        if ( isset( $db_array['image_url'] ) ) {
            $this->set_image_url( $db_array['image_url'] );
        }

        if ( isset( $db_array['thumbnail'] ) ) {
            $this->set_thumbnail_url( $db_array['thumbnail'] );
        }

        $item_data = ! empty( $db_array['item_data'] ) ? $db_array['item_data'] : '';

        if ( ! empty( $item_data ) ) {

            if ( ! is_array( $item_data ) ) {
                $item_data = json_decode( $item_data, true );
            }

            $this->set_item_data( $item_data );
        }

        if ( isset( $db_array['currency'] ) ) {
            $this->set_currency( $db_array['currency'] );
        }

        if ( isset( $db_array['price'] ) ) {
            $this->set_price( (float) $db_array['price'] );
        }

        if ( isset( $db_array['pricing'] ) ) {
            $this->set_pricing( $db_array['pricing'] );
        }

        if ( isset( $db_array['is_prime'] ) ) {
            $this->set_is_prime( $db_array['is_prime'] );
        }

        if ( isset( $db_array['is_free_shipping'] ) ) {
            $this->set_is_free_shipping( $db_array['is_free_shipping'] );
        }

        if ( isset( $db_array['rating'] ) ) {
            $this->set_rating( $db_array['rating'] );
        }

        if ( isset( $db_array['reviews'] ) ) {
            $this->set_reviews( $db_array['reviews'] );
        }

        if ( isset( $db_array['status'] ) ) {
            $this->set_status( $db_array['status'] );
        }

        if ( isset( $db_array['created_at'] ) ) {
            $this->set_created_at( $db_array['created_at'] );
        }

        if ( isset( $db_array['updated_at'] ) ) {
            $this->set_updated_at( $db_array['updated_at'] );
        }
    }

    public static function create_from_api( array $data ): Product {
        $product = new self( $data );

        if ( ! empty( $data['item_data'] ) ) {
            $product->set_item_data( $data['item_data'] );
        }

        $product->created_at = gmdate( 'Y-m-d H:i:s' );
        $product->updated_at = gmdate( 'Y-m-d H:i:s' );

        return $product;
    }

    public function get_id(): int {
        return $this->id;
    }

    public function set_id( int $id ): void {
        $this->id = $id;
    }

    public function get_asin(): string {
        return $this->asin;
    }

    public function set_asin( string $asin ): void {
        $this->asin = $asin;
    }

    public function get_source(): string {
        return $this->source;
    }

    public function set_source( string $source ): void {
        $this->source = $source;
    }

    public function get_title(): string {
        return $this->title;
    }

    public function set_title( string $title ): void {
        $this->title = $title;
    }

    public function get_url(): string {
        return $this->url;
    }

    public function set_url( string $url ): void {
        $this->url = $url;
    }

    public function get_item_data(): array {
        return $this->item_data;
    }

    public function set_item_data( array $item_data ): void {
        $this->item_data = $item_data;
    }

    public function get_image_url(): string {
        return $this->image_url;
    }

    public function set_image_url( string $image_url ): void {
        $this->image_url = $image_url;
    }

    public function get_thumbnail_url(): string {
        return $this->thumbnail;
    }

    public function set_thumbnail_url( string $thumbnail ): void {
        $this->thumbnail = $thumbnail;
    }

    public function get_currency(): string {
        return $this->currency;
    }

    public function set_currency( string $currency ): void {
        $this->currency = $currency;
    }

    public function get_price(): float {
        return $this->price;
    }

    public function set_price( float $price ): void {
        $this->price = $price;
    }

    public function get_pricing(): string {
        return $this->pricing;
    }

    public function set_pricing( string $pricing ): void {
        $this->pricing = $pricing;
    }

    public function price_available(): bool {
        return ! empty( $this->get_price() ) || ! empty( $this->get_pricing() );
    }

    public function get_is_prime(): bool {
        return $this->is_prime;
    }

    public function set_is_prime( bool $is_prime ): void {
        $this->is_prime = $is_prime;
    }

    public function get_is_free_shipping(): bool {
        return $this->is_free_shipping;
    }

    public function set_is_free_shipping( bool $is_free_shipping ): void {
        $this->is_free_shipping = $is_free_shipping;
    }

    public function get_rating(): float {
        return $this->rating;
    }

    public function set_rating( float $rating ): void {
        $this->rating = $rating;
    }

    public function get_reviews(): int {
        return $this->reviews;
    }

    public function get_status(): string {
        return $this->status;
    }

    public function set_status( string $status ): void {
        $this->status = $status;
    }

    public function set_reviews( int $reviews ): void {
        $this->reviews = $reviews;
    }

    public function get_created_at(): string {
        return $this->created_at;
    }

    public function set_created_at( string $created_at ): void {
        $this->created_at = $created_at;
    }

    public function get_updated_at(): string {
        return $this->updated_at;
    }

    public function set_updated_at( string $updated_at ): void {
        $this->updated_at = $updated_at;
    }

    public function buy_button_title(): string {
        $item_data = $this->get_item_data();

        switch ( $this->get_source() ) {
            case 'mercado':
                $amazon_button_label = __( 'Buy now', 'hostinger-affiliate-plugin' );
                break;
            case 'amazon':
            default:
                $amazon_button_label = __( 'Buy on Amazon', 'hostinger-affiliate-plugin' );
                break;
        }

        if ( ! empty( $item_data['binding'] ) && 'Prime Video' === $item_data['binding'] ) {
            $amazon_button_label = __( 'Watch on Amazon Prime', 'hostinger-affiliate-plugin' );
        }

        return $amazon_button_label;
    }

    public function to_array(): array {
        return array(
            'id'               => $this->get_id(),
            'asin'             => $this->get_asin(),
            'source'           => $this->get_source(),
            'title'            => $this->get_title(),
            'url'              => $this->get_url(),
            'image_url'        => $this->get_image_url(),
            'item_data'        => json_encode( $this->get_item_data() ),
            'currency'         => $this->get_currency(),
            'price'            => $this->get_price(),
            'pricing'          => $this->get_pricing(),
            'is_prime'         => $this->get_is_prime(),
            'is_free_shipping' => $this->get_is_free_shipping(),
            'rating'           => $this->get_rating(),
            'reviews'          => $this->get_reviews(),
            'status'           => $this->get_status(),
            'created_at'       => $this->get_created_at(),
            'updated_at'       => $this->get_updated_at(),
        );
    }
}
