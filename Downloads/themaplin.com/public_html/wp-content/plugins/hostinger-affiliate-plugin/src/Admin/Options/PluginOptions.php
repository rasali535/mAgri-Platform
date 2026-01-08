<?php
/**
 * PluginSettings
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Admin\Options;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Class for handling Settings
 */
class PluginOptions {
    const STATUS_CONNECTED    = 'connected';
    const STATUS_DISCONNECTED = 'disconnected';

    private bool $is_amazon_configured = false;

    private bool $is_mercado_configured = false;

    // Refactor connection status to correct marketplaces.
    private string $connection_status = '';

    private string $amazon_connection_status = '';

    private string $mercado_connection_status = '';

    /**
     * @var AmazonOptions
     */
    public AmazonOptions $amazon;

    public MercadoOptions $mercado;

    /**
     * @param array $settings plugin settings array.
     */
    public function __construct( array $settings = array() ) {
        $this->is_amazon_configured      = ! isset( $settings['is_amazon_configured'] ) ? false : $settings['is_amazon_configured'];
        $this->is_mercado_configured     = ! isset( $settings['is_mercado_configured'] ) ? false : $settings['is_mercado_configured'];
        $this->connection_status         = empty( $settings['connection_status'] ) ? self::STATUS_DISCONNECTED : $settings['connection_status'];
        $this->amazon_connection_status  = empty( $settings['amazon_connection_status'] ) ? self::STATUS_DISCONNECTED : $settings['amazon_connection_status'];
        $this->mercado_connection_status = empty( $settings['mercado_connection_status'] ) ? self::STATUS_DISCONNECTED : $settings['mercado_connection_status'];

        $this->amazon  = new AmazonOptions( ! empty( $settings['amazon'] ) ? $settings['amazon'] : array() );
        $this->mercado = new MercadoOptions( ! empty( $settings['mercado'] ) ? $settings['mercado'] : array() );
    }

    public function get_is_amazon_configured(): bool {
        return $this->is_amazon_configured;
    }

    public function set_is_amazon_configured( bool $is_amazon_configured ): void {
        $this->is_amazon_configured = $is_amazon_configured;
    }

    public function get_is_mercado_configured(): bool {
        return $this->is_mercado_configured;
    }

    public function set_is_mercado_configured( bool $is_mercado_configured ): void {
        $this->is_mercado_configured = $is_mercado_configured;
    }

    /**
     * @return string
     */
    public function get_connection_status(): string {
        return $this->connection_status;
    }

    /**
     * @param string $connection_status connection status.
     */
    public function set_connection_status( string $connection_status ): void {
        $this->connection_status = $connection_status;
    }

    public function get_amazon_connection_status(): string {
        return $this->amazon_connection_status;
    }

    public function set_amazon_connection_status( string $amazon_connection_status ): void {
        $this->amazon_connection_status = $amazon_connection_status;
    }

    public function get_mercado_connection_status(): string {
        return $this->mercado_connection_status;
    }

    public function set_mercado_connection_status( string $mercado_connection_status ): void {
        $this->mercado_connection_status = $mercado_connection_status;
    }

    public function get_amazon_options(): AmazonOptions {
        return $this->amazon;
    }

    public function get_mercado_options(): MercadoOptions {
        return $this->mercado;
    }

    public function set_mercado_options( MercadoOptions $mercado ): void {
        $this->mercado = $mercado;
    }

    public function set_amazon_options( AmazonOptions $amazon ): void {
        $this->amazon = $amazon;
    }

    /**
     * @return array
     */
    public function to_array(): array {
        return array(
            'is_amazon_configured'      => $this->get_is_amazon_configured(),
            'is_mercado_configured'     => $this->get_is_mercado_configured(),
            'connection_status'         => $this->get_connection_status(),
            'amazon_connection_status'  => $this->get_amazon_connection_status(),
            'mercado_connection_status' => $this->get_mercado_connection_status(),
            'amazon'                    => $this->amazon->to_array(),
            'mercado'                   => $this->mercado->to_array(),
        );
    }
}
