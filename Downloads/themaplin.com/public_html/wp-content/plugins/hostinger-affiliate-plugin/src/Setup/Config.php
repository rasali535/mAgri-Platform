<?php
/**
 * Config class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Setup;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Config class
 */
class Config {
    /**
     * @var array
     */
    private array $config = array();

    public const TOKEN_HEADER  = 'X-Hpanel-Order-Token';
    public const DOMAIN_HEADER = 'X-Hpanel-Domain';

    /**
     *
     */
    public function __construct() {
        $this->decode_config( HOSTINGER_AFFILIATE_PLUGIN_WP_JSON_CONFIG_PATH );
    }

    /**
     * @param string $path config path.
     *
     * @return void
     */
    private function decode_config( string $path ): void {
        if ( file_exists( $path ) ) {
            $config_content = file_get_contents( $path );
            $this->config   = json_decode( $config_content, true );
        }
    }

    /**
     * @param string $key config key.
     * @param mixed  $default_value config default value.
     *
     * @return string
     */
    public function get_config_value( string $key, mixed $default_value ): string {
        if ( $this->config && isset( $this->config[ $key ] ) && ! empty( $this->config[ $key ] ) ) {
            return $this->config[ $key ];
        }

        return $default_value;
    }
}
