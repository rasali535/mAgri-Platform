<?php

namespace Hostinger\AffiliatePlugin\Repositories;

use wpdb;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class TransientRepository implements RepositoryInterface {
    private wpdb $db;

    public function __construct( wpdb $wpdb ) {
        $this->db = $wpdb;
    }

    public function insert( array $fields ): bool {
        return true;
    }

    public function delete( string $transient_slug ): void {
        if ( empty( $transient_slug ) ) {
            return;
        }

        $this->db->query( 'DELETE FROM `' . $this->db->options . '` WHERE `option_name` LIKE ("_transient_timeout_' . $transient_slug . '_%")' );
        $this->db->query( 'DELETE FROM `' . $this->db->options . '` WHERE `option_name` LIKE ("_transient_' . $transient_slug . '_%")' );
    }

    public function delete_amazon_transients(): void {
        $this->delete( 'amazon_api' );
    }
}
