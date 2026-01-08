<?php
/**
 * Repository class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Repositories;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

interface RepositoryInterface {
    /**
     * @param array $fields fields to insert.
     *
     * @return bool
     */
    public function insert( array $fields ): bool;
}
