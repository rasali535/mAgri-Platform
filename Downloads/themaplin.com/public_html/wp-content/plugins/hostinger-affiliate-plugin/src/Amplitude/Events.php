<?php

namespace Hostinger\AffiliatePlugin\Amplitude;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\Amplitude\AmplitudeManager;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class Events {
    private const AMPLITUDE_ENDPOINT = '/v3/wordpress/plugin/trigger-event';
    private PluginSettings $plugin_settings;
    private AmplitudeManager $amplitude_manager;

    public function __construct( PluginSettings $plugin_settings, AmplitudeManager $amplitude_manager ) {
        $this->plugin_settings   = $plugin_settings;
        $this->amplitude_manager = $amplitude_manager;
    }

    public function init() {
        add_action( 'transition_post_status', array( $this, 'track_published_post' ), 10, 3 );
    }

    public function affiliate_created( string $layout = '', string $marketplace = 'amazon' ) {
        if ( empty( $layout ) ) {
            return;
        }

        $endpoint = self::AMPLITUDE_ENDPOINT;

        switch ( $marketplace ) {
            case 'mercado':
                $action = Actions::MERCADO_CREATE;
                break;
            case 'amazon':
            default:
                $action = Actions::AFFILIATE_CREATE;
                break;
        }

        $params = array(
            'action'      => $action,
            'layout_type' => $layout,
        );

        $this->send_request( $endpoint, $params, $marketplace );
    }

    public function affiliate_content_published( string $post_type, int $post_id, string $marketplace = 'amazon' ): void {
        $endpoint = self::AMPLITUDE_ENDPOINT;

        switch ( $marketplace ) {
            case 'mercado':
                $action = Actions::MERCADO_PUBLISHED;
                break;
            case 'amazon':
            default:
                $action = Actions::AFFILIATE_PUBLISHED;
                break;
        }

        $params = array(
            'action' => $action,
        );

        $this->send_request( $endpoint, $params, $marketplace );
    }

    public function track_published_post( string $new_status, string $old_status, \WP_Post $post ): void {
        $post_id = $post->ID;

        static $is_action_executed = array();
        if ( isset( $is_action_executed[ $post_id ] ) ) {
            return;
        }

        if ( ( 'draft' === $old_status || 'auto-draft' === $old_status ) && $new_status === 'publish' ) {
            $post_type             = get_post_type( $post_id );
            $marketplaces_detected = array();

            if ( has_block( 'hostinger-affiliate-plugin/block', $post ) ) {
                $marketplaces_detected['amazon'] = true;
            }

            if ( has_block( 'hostinger-affiliate-plugin/mercado-block', $post ) ) {
                $marketplaces_detected['mercado'] = true;
            }

            if ( has_shortcode( $post->post_content, 'hostinger-affiliate-table' ) ) {
                preg_match_all( '/\[hostinger-affiliate-table[^\]]*id=["|\']?(\d+)["|\']?[^\]]*\]/', $post->post_content, $matches );

                if ( ! empty( $matches[1] ) ) {
                    foreach ( $matches[1] as $table_id ) {
                        $marketplace = get_post_meta( $table_id, '_marketplace', true );
                        if ( ! empty( $marketplace ) ) {
                            $marketplaces_detected[ $marketplace ] = true;
                        } else {
                            $marketplaces_detected['amazon'] = true;
                        }
                    }
                } else {
                    $marketplaces_detected['amazon'] = true;
                }
            }

            if ( ! empty( $marketplaces_detected ) && ! wp_is_post_revision( $post_id ) ) {
                foreach ( array_keys( $marketplaces_detected ) as $marketplace ) {
                    add_option( "hostinger_affiliate_{$marketplace}_links_created", strtotime( 'now' ) );
                    $this->affiliate_content_published( $post_type, $post_id, $marketplace );
                }

                add_option( 'hostinger_affiliate_links_created', true, false );

                $is_action_executed[ $post_id ] = true;
            }
        }
    }

    private function send_request( string $endpoint, array $params = array(), string $marketplace = 'amazon' ): array {
        $combined_params = $params;

        if ( $marketplace === 'amazon' ) {
            $scraper_param = array(
                'scraping' => empty( $this->plugin_settings->get_plugin_settings()->amazon->use_amazon_api() ),
            );

            $combined_params = array_merge( $params, $scraper_param );
        }

        return $this->amplitude_manager->sendRequest( $endpoint, $combined_params );
    }
}
