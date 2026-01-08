<?php
/**
 * Table repository class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Repositories;

use Hostinger\AffiliatePlugin\Models\Table;
use Hostinger\AffiliatePlugin\Models\Table\AsinRow;
use Hostinger\AffiliatePlugin\Models\Table\FeatureRow;
use Hostinger\AffiliatePlugin\Models\Table\RowOption;
use Hostinger\AffiliatePlugin\Models\Table\Settings as TableSettings;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Table repository
 */
class TableRepository implements RepositoryInterface {

    /**
     * @param array $fields
     *
     * @return bool
     */
    public function insert( array $fields ): bool {
        return true;
    }

    /**
     * @param int $id
     *
     * @return bool|\WP_Error
     */
    public function delete( int $id ): bool|\WP_Error {
        $post = get_post( $id );

        if ( empty( $post ) ) {
            return new \WP_Error(
                'data_invalid',
                __( 'Table does not exist.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => \WP_Http::BAD_REQUEST,
                )
            );
        }

        if ( $post->post_type !== 'hst_affiliate_table' ) {
            return new \WP_Error(
                'data_invalid',
                __( 'Table does not exist.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => \WP_Http::BAD_REQUEST,
                )
            );
        }

        return ! empty( wp_delete_post( $id, true ) ) ? true : false;
    }

    /**
     * @param Table $table
     *
     * @return bool
     */
    public function create( array $table_data ): Table|\WP_Error {
        $post_args = array(
            'post_title'  => $table_data['name'],
            'post_status' => $table_data['settings']['status'],
            'post_type'   => 'hst_affiliate_table',
        );

        $post_id = wp_insert_post( $post_args );

        if ( is_wp_error( $post_id ) ) {
            return $post_id;
        }

        $post = get_post( $post_id );

        $asin_rows = $this->map_asin_rows( $table_data['asin_rows'] );

        $feature_rows = $this->map_feature_rows( $table_data['feature_rows'] );

        $marketplace = get_post_meta( $post->ID, '_marketplace', true );

        $settings = new TableSettings( $post->post_status, $post->post_date );

        $table = new Table( $post->ID, $post->post_title, $this->get_row_options(), $asin_rows, $feature_rows, $marketplace, $settings );

        $this->update_meta_fields( $post_id, $table_data );

        $table->set_id( $post->ID );

        return $table;
    }

    /**
     * @param Table $table
     *
     * @return bool
     */
    public function update( array $table_data ): Table|\WP_Error|bool {
        $post = get_post( $table_data['id'] );

        if ( empty( $post ) ) {
            return new \WP_Error(
                'data_invalid',
                __( 'Table does not exist.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => \WP_Http::BAD_REQUEST,
                )
            );
        }

        if ( $post->post_type !== 'hst_affiliate_table' ) {
            return new \WP_Error(
                'data_invalid',
                __( 'Table does not exist.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => \WP_Http::BAD_REQUEST,
                )
            );
        }

        $post_args = array(
            'ID'          => $post->ID,
            'post_title'  => $table_data['name'],
            'post_status' => $table_data['settings']['status'],
        );

        $post_id = wp_update_post( $post_args );

        if ( is_wp_error( $post_id ) ) {
            return $post_id;
        }

        $this->update_meta_fields( $post_id, $table_data );

        return $this->get( $post_id );
    }

    /**
     * @param int $id post id.
     *
     * @return Table
     */
    public function get( int $id ): Table|bool {
        $post = get_post( $id );

        if ( empty( $post ) ) {
            return false;
        }

        if ( $post->post_type !== 'hst_affiliate_table' ) {
            return false;
        }

        $asin_rows_meta = get_post_meta( $post->ID, '_asin_rows', true );

        $asin_rows = $this->map_asin_rows( $asin_rows_meta );

        $feature_rows_meta = get_post_meta( $post->ID, '_feature_rows', true );

        $feature_rows = $this->map_feature_rows( $feature_rows_meta );

        $settings = new TableSettings( $post->post_status, $post->post_date );

        $marketplace = get_post_meta( $post->ID, '_marketplace', true );

        return new Table( $post->ID, $post->post_title, $this->get_row_options(), $asin_rows, $feature_rows, $marketplace, $settings );
    }

    /**
     * @param array $asin_rows
     *
     * @return array
     */
    private function map_asin_rows( array $asin_rows ): array {
        return array_map(
            function ( $item ) {
                static $index = 0;
                $index++;
                return new AsinRow(
                    $index,
                    ! empty( $item['asin'] ) ? $item['asin'] : '',
                    ! empty( $item['title'] ) ? $item['title'] : '',
                    ! empty( $item['thumbnail'] ) ? $item['thumbnail'] : '',
                    ! empty( $item['affiliate_url'] ) ? $item['affiliate_url'] : '',
                    ! empty( $item['product_url'] ) ? $item['product_url'] : '',
                    ! empty( $item['text_label'] ) ? $item['text_label'] : '',
                    ! empty( $item['color'] ) ? $item['color'] : '',
                    ! empty( $item['is_enabled'] ) ? $item['is_enabled'] : ''
                );
            },
            $asin_rows
        );
    }

    /**
     * @param array $feature_rows
     *
     * @return array
     */
    private function map_feature_rows( array $feature_rows ): array {
        return array_map(
            function ( $item ) {
                static $index = 0;
                $index++;
                return new FeatureRow( $index, ! empty( $item['name'] ) ? $item['name'] : '', ! empty( $item['selected_value'] ) ? $item['selected_value'] : '' );
            },
            $feature_rows
        );
    }

    /**
     * @param int   $post_id
     * @param Table $table
     *
     * @return bool
     */
    private function update_meta_fields( int $post_id, array $table_data ): bool {
        update_post_meta( $post_id, '_asin_rows', $table_data['asin_rows'] );

        update_post_meta( $post_id, '_feature_rows', $table_data['feature_rows'] );

        update_post_meta( $post_id, '_marketplace', $table_data['marketplace'] );

        return true;
    }

    /**
     * @param $table_data
     *
     * @return array
     */
    public function validate_table_data( $data ): array {
        $errors = array();

        if ( empty( $data['name'] ) ) {
            $errors['name'] = __( 'Table name is missing.', 'hostinger-affiliate-plugin' );
        }

        if ( empty( $data['asin_rows'] ) ) {
            $errors['asin_rows'] = __( 'Table should have at least one product added.', 'hostinger-affiliate-plugin' );
        }

        if ( ! empty( $data['asin_rows'] ) ) {
            foreach ( $data['asin_rows'] as $index => $asin_row ) {
                if ( empty( $asin_row['asin'] ) ) {

                    if ( empty( $errors['asin_rows']['asin'] ) ) {
                        $errors['asin_rows']['asin'] = array();
                    }

                    $errors['asin_rows']['asin'][ $index ] = __( 'Table added product is missing asin.', 'hostinger-affiliate-plugin' );
                }
            }
        }

        if ( empty( $data['feature_rows'] ) ) {
            $errors['feature_rows'] = __( 'Table should have at least one feature added.', 'hostinger-affiliate-plugin' );
        }

        if ( ! empty( $data['feature_rows'] ) ) {
            foreach ( $data['feature_rows'] as $index => $asin_row ) {
                if ( empty( $asin_row['name'] ) ) {
                    if ( empty( $errors['asin_rows']['name'] ) ) {
                        $errors['asin_rows']['name'] = array();
                    }

                    $errors['feature_rows']['name'][ $index ] = __( 'Table added feature is missing title.', 'hostinger-affiliate-plugin' );
                }
            }
        }

        if ( empty( $data['settings']['status'] ) ) {
            $errors['settings']['status'] = __( 'Table status is missing.', 'hostinger-affiliate-plugin' );
        }

        return $errors;
    }

    /**
     * @return RowOption[]
     */
    public function get_row_options(): array {
        return array(
            new RowOption( __( 'Title', 'hostinger-affiliate-plugin' ), 'title' ),
            new RowOption( __( 'Thumbnail', 'hostinger-affiliate-plugin' ), 'thumbnail' ),
            new RowOption( __( 'Price', 'hostinger-affiliate-plugin' ), 'price' ),
            new RowOption( __( 'Prime Status', 'hostinger-affiliate-plugin' ), 'prime_status' ),
            new RowOption( __( 'Amazon Button', 'hostinger-affiliate-plugin' ), 'amazon_button' ),
        );
    }
}
