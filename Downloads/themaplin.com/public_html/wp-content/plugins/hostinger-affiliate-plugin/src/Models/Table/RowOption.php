<?php
/**
 * Row Option class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Models\Table;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Row Option class
 */
class RowOption {
    /**
     * @var string
     */
    private string $label = '';

    /**
     * @var string
     */
    private string $value = '';

    /**
     * @param string $label
     * @param string $value
     */
    public function __construct( string $label, string $value ) {
        $this->label = $label;
        $this->value = $value;
    }

    /**
     * @return string
     */
    public function get_label(): string {
        return $this->label;
    }

    /**
     * @param string $label
     *
     * @return void
     */
    public function set_label( string $label ): void {
        $this->label = $label;
    }

    /**
     * @return string
     */
    public function get_value(): string {
        return $this->value;
    }

    /**
     * @param string $value
     *
     * @return void
     */
    public function set_value( string $value ): void {
        $this->value = $value;
    }

    /**
     * @return array
     */
    public function to_array(): array {
        return array(
            'label' => $this->get_label(),
            'value' => $this->get_value(),
        );
    }
}
