<?php
/**
 * Table class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Models;

use Hostinger\AffiliatePlugin\Models\Table\Settings;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Table class
 */
class Table {
    /**
     * @var int
     */
    private int $id = 0;

    /**
     * @var string
     */
    private string $name = '';

    /**
     * @var array
     */
    private array $row_options = array();

    /**
     * @var array
     */
    private array $asin_rows = array();

    /**
     * @var array
     */
    private array $feature_rows = array();

    /**
     * @var array
     */
    private ?Settings $settings = null;

    private string $marketplace = 'amazon';

    /**
     * @param int           $id
     * @param string        $name
     * @param array         $row_options
     * @param array         $asin_rows
     * @param array         $feature_rows
     * @param Settings|null $settings
     */
    public function __construct( int $id = 0, string $name, array $row_options, array $asin_rows, array $feature_rows, string $marketplace, Settings $settings = null ) {
        $this->id           = $id;
        $this->name         = $name;
        $this->row_options  = $row_options;
        $this->asin_rows    = $asin_rows;
        $this->feature_rows = $feature_rows;
        $this->marketplace  = $marketplace;
        $this->settings     = $settings;
    }

    /**
     * @return int
     */
    public function get_id(): int {
        return $this->id;
    }

    /**
     * @param int $id
     *
     * @return void
     */
    public function set_id( int $id ): void {
        $this->id = $id;
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
     * @return array
     */
    public function get_row_options(): array {
        return $this->row_options;
    }

    /**
     * @param array $row_options
     *
     * @return void
     */
    public function set_row_options( array $row_options ): void {
        $this->row_options = $row_options;
    }

    /**
     * @return array
     */
    public function get_asin_rows(): array {
        return $this->asin_rows;
    }

    /**
     * @param array $asin_rows
     *
     * @return void
     */
    public function set_asin_rows( array $asin_rows ): void {
        $this->asin_rows = $asin_rows;
    }

    /**
     * @return array
     */
    public function get_feature_rows(): array {
        return $this->feature_rows;
    }

    /**
     * @param array $feature_rows
     *
     * @return void
     */
    public function set_feature_rows( array $feature_rows ): void {
        $this->feature_rows = $feature_rows;
    }

    /**
     * @return Settings|null
     */
    public function get_settings(): ?Settings {
        return $this->settings;
    }

    /**
     * @param Settings|null $settings
     *
     * @return void
     */
    public function set_settings( ?Settings $settings ): void {
        $this->settings = $settings;
    }

    public function get_marketplace(): string {
        return $this->marketplace;
    }

    public function set_marketplace( string $marketplace ): void {
        $this->marketplace = $marketplace;
    }

    /**
     * @return array
     */
    public function to_array(): array {
        return array(
            'id'           => $this->get_id(),
            'name'         => $this->get_name(),
            'row_options'  => $this->convert_array_items_to_array( $this->get_row_options() ),
            'asin_rows'    => $this->convert_array_items_to_array( $this->get_asin_rows() ),
            'feature_rows' => $this->convert_array_items_to_array( $this->get_feature_rows() ),
            'settings'     => $this->get_settings()->to_array(),
            'marketplace'  => $this->get_marketplace(),
        );
    }

    /**
     * @param $values
     *
     * @return array
     */
    public function convert_array_items_to_array( $values ): array {
        return array_map(
            function ( $item ) {
                return $item->to_array();
            },
            $values
        );
    }
}
