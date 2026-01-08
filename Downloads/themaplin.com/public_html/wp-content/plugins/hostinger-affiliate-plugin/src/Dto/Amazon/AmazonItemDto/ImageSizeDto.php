<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ImageSizeDto {
    private string $url;
    private int $width;
    private int $height;

    public function __construct( string $url, int $width, int $height ) {
        $this->url    = $url;
        $this->width  = $width;
        $this->height = $height;
    }

    public function get_url(): string {
        return $this->url;
    }

    public function set_url( string $url ): void {
        $this->url = $url;
    }

    public function get_width(): int {
        return $this->width;
    }

    public function set_width( int $width ): void {
        $this->width = $width;
    }

    public function get_height(): int {
        return $this->height;
    }

    public function set_height( int $height ): void {
        $this->height = $height;
    }

    public static function from_array( array $data ): self {
        return new self(
            $data['URL'] ?? '',
            $data['Width'] ?? 0,
            $data['Height'] ?? 0
        );
    }
}
