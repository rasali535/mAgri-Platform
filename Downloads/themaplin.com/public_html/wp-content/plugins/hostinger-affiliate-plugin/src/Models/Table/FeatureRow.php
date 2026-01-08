<?php
/**
 * Feature Row class
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
 * Feature Row class
 */
class FeatureRow {
    /**
     * @var int
     */
    private int $index = 0;

    /**
     * @var string
     */
    private string $name = '';

    /**
     * @var string
     */
    private string $selected_value = '';

    /**
     * @param int    $index
     * @param string $name
     * @param string $selected_value
     */
    public function __construct( int $index, string $name, string $selected_value ) {
        $this->index          = $index;
        $this->name           = $name;
        $this->selected_value = $selected_value;
    }

    /**
     * @return int
     */
    public function get_index(): int {
        return $this->index;
    }

    /**
     * @param int $index
     *
     * @return void
     */
    public function set_index( int $index ): void {
        $this->index = $index;
    }

    /**
     * @return string
     */
    public function get_name(): string {
        return $this->name;
    }

    /**
     * @param string $name
     *
     * @return void
     */
    public function set_name( string $name ): void {
        $this->name = $name;
    }

    /**
     * @return string
     */
    public function get_selected_value(): string {
        return $this->selected_value;
    }

    /**
     * @param string $selected_value
     *
     * @return void
     */
    public function set_selected_value( string $selected_value ): void {
        $this->selected_value = $selected_value;
    }

    /**
     * @return array
     */
    public function to_array(): array {
        return array(
            'index'          => $this->get_index(),
            'name'           => $this->get_name(),
            'selected_value' => $this->get_selected_value(),
        );
    }
}
