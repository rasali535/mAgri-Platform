<?php
/**
 * Settings class
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
 * Settings class
 */
class Settings {
    /**
     * @var string
     */
    private string $status = '';

    /**
     * @var string
     */
    private string $publish_date = '';

    /**
     * @param string $status
     * @param string $publish_date
     */
    public function __construct( string $status, string $publish_date ) {
        $this->status       = $status;
        $this->publish_date = $publish_date;
    }

    /**
     * @return string
     */
    public function get_status(): string {
        return $this->status;
    }

    /**
     * @param string $status
     *
     * @return void
     */
    public function set_status( string $status ): void {
        $this->status = $status;
    }

    /**
     * @return string
     */
    public function get_publish_date(): string {
        return $this->publish_date;
    }

    /**
     * @param string $publish_date
     *
     * @return void
     */
    public function set_publish_date( string $publish_date ): void {
        $this->publish_date = $publish_date;
    }

    /**
     * @return array
     */
    public function to_array(): array {
        return array(
            'status'       => $this->get_status(),
            'publish_date' => $this->get_publish_date(),
        );
    }
}
