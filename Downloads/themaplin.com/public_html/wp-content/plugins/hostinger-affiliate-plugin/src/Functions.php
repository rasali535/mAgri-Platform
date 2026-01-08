<?php
/**
 * Functions class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Plugin functions
 */
class Functions {

    public const ASSET_PAGES = array(
        'admin.php?page=hostinger',
    );

    public const DATA_PAGES = array(
        'admin.php?page=hostinger',
        'post-new.php',
        'post.php',
        'site-editor.php',
    );

    public const AMAZON_AFFILIATE_DASHBOARD_PAGE_SLUG = '/assoc_credentials/home';
    public const AMAZON_AFFILIATE_API_KEYS_PAGE_SLUG  = '/home/account/tag/manage';

    public const AMAZON_AFFILIATE_DOMAIN_LOCALES = array(
        'en_US' => 'https://affiliate-program.amazon.com',
        'en_GB' => 'https://affiliate-program.amazon.co.uk',
        'fr_FR' => 'https://partenaires.amazon.fr',
        'ja'    => 'https://affiliate.amazon.co.jp',
        'en_CA' => 'https://associates.amazon.ca',
        'zh_CN' => 'https://associates.amazon.cn',
        'it_IT' => 'https://programma-affiliazione.amazon.it',
        'es_ES' => 'https://afiliados.amazon.es',
        'bn_BD' => 'https://affiliate-program.amazon.in',
        'pt_BR' => 'https://associados.amazon.com.br',
        'es_MX' => 'https://afiliados.amazon.com.mx',
        'en_AU' => 'https://affiliate-program.amazon.com.au',
        'ar'    => 'https://affiliate-program.amazon.ae',
        'nl_NL' => 'https://partnernet.amazon.nl',
        'ary'   => 'https://affiliate-program.amazon.sa',
        'sv_SE' => 'https://affiliate-program.amazon.se',
        'pl_PL' => 'https://affiliate-program.amazon.pl',
        'nl_BE' => 'https://affiliate-program.amazon.com.be',
        'de_DE' => 'https://partnernet.amazon.de',
        'ar_AE' => 'https://affiliate-program.amazon.eg',
        'sg'    => 'https://affiliate-program.amazon.sg',
        'tr_TR' => 'https://gelirortakligi.amazon.com.tr',
    );

    /**
     * Check if plugin is active
     *
     * @param string $plugin_slug plugin name.
     *
     * @return bool
     */
    public function is_plugin_active( $plugin_slug ): bool {
        if ( empty( $plugin_slug ) ) {
            return false;
        }

        $active_plugins = (array) get_option( 'active_plugins', array() );
        foreach ( $active_plugins as $active_plugin ) {
            if ( strpos( $active_plugin, $plugin_slug . '.php' ) !== false ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return string
     */
    public function get_api_token(): string {
        $api_token  = '';
        $token_file = HOSTINGER_WP_TOKEN;

        if ( file_exists( $token_file ) && ! empty( file_get_contents( $token_file ) ) ) {
            $api_token = file_get_contents( $token_file );
        }

        return $api_token;
    }

    /**
     * Get the host info (domain, subdomain, subdirectory)
     *
     * @return string
     */
    public function get_host_info(): string {
        $host     = $_SERVER['HTTP_HOST'] ?? '';
        $site_url = get_site_url();
        $site_url = preg_replace( '#^https?://#', '', $site_url );

        if ( ! empty( $site_url ) && ! empty( $host ) && strpos( $site_url, $host ) === 0 ) {
            if ( $site_url === $host ) {
                return $host;
            } else {
                return substr( $site_url, strlen( $host ) + 1 );
            }
        }

        return $host;
    }

    public function need_to_load_affiliate_data(): bool {
        if ( $this->need_to_load_affiliate_assets() ) {
            return true;
        }

        $admin_path  = parse_url( admin_url(), PHP_URL_PATH );
        $current_uri = sanitize_text_field( $_SERVER['REQUEST_URI'] );

        foreach ( self::DATA_PAGES as $page ) {
            if ( stripos( $current_uri, $admin_path . $page ) !== false ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return bool
     */
    public function need_to_load_affiliate_assets(): bool {
        if ( ! isset( $_SERVER['REQUEST_URI'] ) ) {
            return false;
        }

        $current_uri = sanitize_text_field( $_SERVER['REQUEST_URI'] );

        if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
            return false;
        }

        if ( isset( $current_uri ) && strpos( $current_uri, '/wp-json/' ) !== false ) {
            return false;
        }

        $admin_path = parse_url( admin_url(), PHP_URL_PATH );

        foreach ( self::ASSET_PAGES as $page ) {
            if ( stripos( $current_uri, $admin_path . $page ) !== false ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return string
     */
    public function get_amazon_affiliate_dashboard_url(): string {
        $locale = get_user_locale();

        $base_url = ! empty( self::AMAZON_AFFILIATE_DOMAIN_LOCALES[ $locale ] ) ? self::AMAZON_AFFILIATE_DOMAIN_LOCALES[ $locale ] : self::AMAZON_AFFILIATE_DOMAIN_LOCALES['en_US'];

        return $base_url . self::AMAZON_AFFILIATE_DASHBOARD_PAGE_SLUG;
    }
}
