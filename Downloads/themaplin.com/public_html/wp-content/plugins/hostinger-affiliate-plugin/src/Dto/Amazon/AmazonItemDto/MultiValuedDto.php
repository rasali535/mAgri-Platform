<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class MultiValuedDto {
    private array $display_values;
    private string $label;
    private string $locale;

    public function __construct( array $display_values, string $label, string $locale ) {
        $this->display_values = $display_values;
        $this->label          = $label;
        $this->locale         = $locale;
    }

    public function get_display_values(): array {
        return $this->display_values;
    }

    public function set_display_values( array $display_values ): void {
        $this->display_values = $display_values;
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
            $data['DisplayValues'] ?? array(),
            $data['Label'] ?? '',
            $data['Locale'] ?? '',
        );
    }
}
