<?php
/**
 * List repository class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Repositories;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Amplitude\Events as AmplitudeEvents;
use wpdb;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * List repository
 */
class ListRepository implements RepositoryInterface {
    /**
     * @var mixed
     */
    private wpdb $db;

    /**
     * @var AmplitudeEvents
     */
    private AmplitudeEvents $amplitude_events;

    /**
     * @var ProductRepository
     */
    private ProductRepository $product_repository;

    /**
     * @var string
     */
    private string $table_name;

    private PluginSettings $plugin_settings;

    public function __construct( wpdb $wpdb, AmplitudeEvents $amplitude_events, ProductRepository $product_repository, PluginSettings $plugin_settings ) {
        $this->db                 = $wpdb;
        $this->amplitude_events   = $amplitude_events;
        $this->product_repository = $product_repository;
        $this->table_name         = $this->db->prefix . 'hostinger_affiliate_lists';
        $this->plugin_settings    = $plugin_settings;
    }

    /**
     * @param array $fields fields to insert.
     *
     * @return bool
     */
    public function insert( array $fields ): bool {
        return ! empty( $this->db->insert( $this->table_name, $fields ) );
    }

    /**
     * @param string $keywords keywords to search for.
     *
     * @return array
     */
    public function get_by_keywords( string $keywords ): array {
        $sql = 'SELECT * FROM `' . $this->table_name . '` WHERE `keywords` = "%s"';

        $query = $this->db->prepare( $sql, $keywords );

        $results = $this->db->get_results( $query, ARRAY_A );

        if ( empty( $results ) ) {
            return array();
        }

        return $results;
    }
}
