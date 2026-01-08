<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class SingleStringValueDto {
    private string $display_value;
    private string $label;
    private string $locale;

    public function __construct( string $display_value, string $label, string $locale ) {
        $this->display_value = $display_value;
        $this->label         = $label;
        $this->locale        = $locale;
    }

    public function get_display_value(): string {
        return $this->display_value;
    }

    public function set_display_value( string $display_value ): void {
        $this->display_value = $display_value;
    }

    public function get_label(): string {
        return $this->label;
    }

    public function set_label( string $label ): void {
        $this->label = $label;
    }

    public function get_locale(): string {
        return $this->locale;
    }

    public function set_locale( string $locale ): void {
        $this->locale = $locale;
    }

    public static function from_array( array $data ): self {
        return new self(
            $data['DisplayValue'] ?? '',
            $data['Label'] ?? '',
            $data['Locale'] ?? '',
        );
    }
}
