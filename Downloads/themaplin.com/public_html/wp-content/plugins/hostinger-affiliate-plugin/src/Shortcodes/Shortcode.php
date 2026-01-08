<?php
/**
 * Shortcode class
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Shortcodes;

use Hostinger\AffiliatePlugin\Repositories\ProductRepository;
use Hostinger\AffiliatePlugin\Services\ProductFetchService;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Shortcode class
 */
abstract class Shortcode {

    /**
     * @var ShortcodeManager
     */
    protected ShortcodeManager $shortcode_manager;

    /**
     * @var ProductRepository
     */
    protected ProductRepository $product_repository;

    protected ProductFetchService $product_fetch_service;

    /**
     * @param ShortcodeManager  $shortcode_manager shortcode manager instance.
     */
    public function __construct( ShortcodeManager $shortcode_manager, ProductRepository $product_repository, ProductFetchService $product_fetch_service ) {
        $this->product_repository    = $product_repository;
        $this->shortcode_manager     = $shortcode_manager;
        $this->product_fetch_service = $product_fetch_service;
    }

    /**
     * @return void
     */
    abstract public function render(): string;
}
