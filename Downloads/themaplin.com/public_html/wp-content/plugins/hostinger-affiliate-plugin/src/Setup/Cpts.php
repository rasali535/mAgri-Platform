<?php
/**
 * Cpts class
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
 * Cpts class
 */
class Cpts {
    /**
     * Run actions or/and hooks
     */
    public function init(): void {
        add_action( 'init', array( $this, 'register_cpts' ), 0 );
    }

    /**
     * @return void
     */
    public function register_cpts(): void {
        $this->register_tables_cpt();
    }

    /**
     * @return void
     */
    public function register_tables_cpt(): void {
        $args = array(
            'label'               => __( 'Table', 'hostinger-affiliate-plugin' ),
            'description'         => __( 'Affiliate tables', 'hostinger-affiliate-plugin' ),
            'supports'            => array( 'title' ),
            'hierarchical'        => false,
            'public'              => false,
            'show_ui'             => false,
            'show_in_menu'        => false,
            'menu_position'       => 5,
            'show_in_admin_bar'   => false,
            'show_in_nav_menus'   => false,
            'can_export'          => false,
            'has_archive'         => false,
            'exclude_from_search' => true,
            'publicly_queryable'  => false,
            'rewrite'             => false,
            'capability_type'     => 'page',
            'show_in_rest'        => false,
        );

        register_post_type( 'hst_affiliate_table', $args );
    }
}
