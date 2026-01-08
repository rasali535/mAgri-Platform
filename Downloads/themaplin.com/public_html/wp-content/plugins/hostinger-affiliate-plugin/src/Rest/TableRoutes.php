<?php

namespace Hostinger\AffiliatePlugin\Rest;

use Hostinger\AffiliatePlugin\Repositories\TableRepository;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use WP_Http;
use WP_Query;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class TableRoutes {
    private TableRepository $table_repository;

    public function __construct( TableRepository $table_repository ) {
        $this->table_repository = $table_repository;
    }

    public function get_table( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $table_id = (int) $request['id'];

        if ( empty( $table_id ) ) {
            return new WP_Error(
                'data_invalid',
                __( 'Sorry, table id missing', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                )
            );
        }

        $table = $this->table_repository->get( $table_id );

        if ( ! empty( $table ) ) {
            $table = $table->to_array();
        }

        $response_data = array(
            'table_data' => $table,
        );

        $response = new WP_REST_Response( $response_data );
        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
        $response->set_status( WP_Http::OK );

        return $response;
    }

    public function get_tables( WP_REST_Request $request ): WP_REST_Response {
        $allowed_parameters = array(
            's'              => '',
            'paged'          => '',
            'posts_per_page' => '',
            'marketplace'    => '',
        );

        // Allow only specified parameters.
        $parameters = array_intersect_key( $request->get_params(), $allowed_parameters );

        $default_parameters = array(
            'post_type'      => 'hst_affiliate_table',
            'post_status'    => 'any',
            'paged'          => 1,
            'posts_per_page' => 5,
            'fields'         => 'ids',
        );

        $args = array_merge( $default_parameters, $parameters );

        if ( isset( $parameters['marketplace'] ) ) {
            $marketplace = sanitize_text_field( $parameters['marketplace'] );

            if ( $marketplace === 'amazon' ) {
                $args['meta_query'] = array(
                    'relation' => 'OR',
                    array(
                        'key'     => '_marketplace',
                        'value'   => 'amazon',
                        'compare' => '=',
                    ),
                    array(
                        'key'     => '_marketplace',
                        'compare' => 'NOT EXISTS',
                    ),
                    array(
                        'key'     => '_marketplace',
                        'value'   => 'mercado',
                        'compare' => '!=',
                    ),
                );
            } elseif ( $marketplace === 'mercado' ) {
                $args['meta_query'] = array(
                    array(
                        'key'     => '_marketplace',
                        'value'   => 'mercado',
                        'compare' => '=',
                    ),
                );
            }

            unset( $args['marketplace'] );
        }

        $tables = array();

        $table_query = new WP_Query( $args );

        if ( $table_query->have_posts() ) {
            while ( $table_query->have_posts() ) {
                $table_query->the_post();

                $table = $this->table_repository->get( get_the_ID() );

                if ( ! empty( $table ) ) {
                    $tables[] = array_intersect_key(
                        $table->to_array(),
                        array(
                            'id'        => '',
                            'name'      => '',
                            'asin_rows' => '',
                            'settings'  => '',
                        )
                    );
                }
            }
        }

        $response_data = array(
            'table_data'    => $tables,
            'found_tables'  => $table_query->found_posts,
            'page'          => (int) $args['paged'],
            'max_num_pages' => $table_query->max_num_pages,
        );
        $response      = new WP_REST_Response( $response_data );
        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
        $response->set_status( WP_Http::OK );

        return $response;
    }

    public function create_table( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $body = json_decode( $request->get_body(), true );

        $errors = $this->table_repository->validate_table_data( $body );

        if ( ! empty( $errors ) ) {
            return new WP_Error(
                'data_invalid',
                __( 'Sorry, there are validation errors.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                    'errors' => $errors,
                )
            );
        }

        $created_table = $this->table_repository->create( $body );

        if ( is_wp_error( $created_table ) ) {
            return $created_table;
        }

        $response = new \WP_REST_Response( $created_table->to_array() );
        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
        $response->set_status( WP_Http::OK );

        return $response;
    }

    public function update_table( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $table_id = (int) $request['id'];

        if ( empty( $table_id ) ) {
            return new WP_Error(
                'data_invalid',
                __( 'Sorry, table id missing', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                )
            );
        }

        $body = json_decode( $request->get_body(), true );

        $errors = $this->table_repository->validate_table_data( $body );

        if ( ! empty( $errors ) ) {
            return new WP_Error(
                'data_invalid',
                __( 'Sorry, there are validation errors.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                    'errors' => $errors,
                )
            );
        }

        $table = $this->table_repository->get( $table_id );

        if ( empty( $table ) ) {
            return new WP_Error(
                'data_invalid',
                __( 'Sorry, table does not exists.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                )
            );
        }

        $body['id'] = $table_id;

        $updated_table = $this->table_repository->update( $body );

        if ( is_wp_error( $updated_table ) ) {
            return $updated_table;
        }

        $response_data = array();

        if ( ! empty( $updated_table ) ) {
            $response_data = $updated_table->to_array();
        }

        $response = new WP_REST_Response( $response_data );
        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
        $response->set_status( \WP_Http::OK );

        return $response;
    }

    public function delete_table( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $table_id = (int) $request['id'];

        if ( empty( $table_id ) ) {
            return new WP_Error(
                'data_invalid',
                __( 'Sorry, table id missing', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                )
            );
        }

        $post = get_post( $table_id );

        if ( empty( $post ) ) {
            return new WP_Error(
                'data_invalid',
                __( 'Table does not exist.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                )
            );
        }

        if ( $post->post_type !== 'hst_affiliate_table' ) {
            return new WP_Error(
                'data_invalid',
                __( 'Table does not exist.', 'hostinger-affiliate-plugin' ),
                array(
                    'status' => WP_Http::BAD_REQUEST,
                )
            );
        }

        $response_data = array(
            'status' => $this->table_repository->delete( $table_id ),
        );

        $response = new WP_REST_Response( $response_data );
        $response->set_headers( array( 'Cache-Control' => 'no-cache' ) );
        $response->set_status( WP_Http::OK );

        return $response;
    }
}
