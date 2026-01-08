<?php

namespace Hostinger\AffiliatePlugin\Models\Table;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class AsinRow {
    private int $index            = 0;
    private string $asin          = '';
    private string $title         = '';
    private string $thumbnail_url = '';
    private string $affiliate_url = '';
    private string $product_url   = '';
    private string $text_label    = '';
    private string $color         = '';
    private bool $is_enabled      = false;

    public function __construct( int $index, string $asin, string $title, string $thumbnail_url, string $affiliate_url, string $product_url, string $text_label, string $color, bool $is_enabled ) {
        $this->index         = $index;
        $this->asin          = $asin;
        $this->title         = $title;
        $this->thumbnail_url = $thumbnail_url;
        $this->affiliate_url = $affiliate_url;
        $this->product_url   = $product_url;
        $this->text_label    = $text_label;
        $this->color         = $color;
        $this->is_enabled    = $is_enabled;
    }

    public function get_index(): int {
        return $this->index;
    }

    public function set_index( int $index ): void {
        $this->index = $index;
    }

    public function get_asin(): string {
        return $this->asin;
    }

    public function get_title(): string {
        return $this->title;
    }

    public function set_title( string $title ): void {
        $this->title = $title;
    }

    public function get_thumbnail_url(): string {
        return $this->thumbnail_url;
    }

    public function set_thumbnail_url( string $thumbnail_url ): void {
        $this->thumbnail_url = $thumbnail_url;
    }

    public function get_affiliate_url(): string {
        return $this->affiliate_url;
    }

    public function set_affiliate_url( string $affiliate_url ): void {
        $this->affiliate_url = $affiliate_url;
    }

    public function get_product_url(): string {
        return $this->product_url;
    }

    public function set_product_url( string $product_url ): void {
        $this->product_url = $product_url;
    }

    public function set_asin( string $asin ): void {
        $this->asin = $asin;
    }

    public function get_text_label(): string {
        return $this->text_label;
    }

    public function set_text_label( string $text_label ): void {
        $this->text_label = $text_label;
    }

    public function get_color(): string {
        return $this->color;
    }

    public function set_color( string $color ): void {
        $this->color = $color;
    }

    public function get_is_enabled(): bool {
        return $this->is_enabled;
    }

    public function set_is_enabled( bool $is_enabled ): void {
        $this->is_enabled = $is_enabled;
    }

    public function to_array(): array {
        return array(
            'index'         => $this->get_index(),
            'asin'          => $this->get_asin(),
            'title'         => $this->get_title(),
            'thumbnail'     => $this->get_thumbnail_url(),
            'affiliate_url' => $this->get_affiliate_url(),
            'product_url'   => $this->get_product_url(),
            'text_label'    => $this->get_text_label(),
            'color'         => $this->get_color(),
            'is_enabled'    => $this->get_is_enabled(),
        );
    }
}
