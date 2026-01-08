<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class LanguageTypeDto {
    private string $display_value;
    private string $type;

    public function __construct( string $display_value, string $type ) {
        $this->display_value = $display_value;
        $this->type          = $type;
    }

    public function get_display_value(): string {
        return $this->display_value;
    }

    public function set_display_value( string $display_value ): void {
        $this->display_value = $display_value;
    }

    public function get_type(): string {
        return $this->type;
    }

    public function set_type( string $type ): void {
        $this->type = $type;
    }

    public static function from_array( array $data ): self {
        return new self(
            $data['DisplayValue'] ?? '',
            $data['Type'] ?? '',
        );
    }
}
