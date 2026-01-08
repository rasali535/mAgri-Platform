<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Containers\Container;
use Hostinger\AffiliatePlugin\Repositories\ProductRepository;
use Hostinger\AffiliatePlugin\Services\ProductFetchService;
use Hostinger\AffiliatePlugin\Services\ProductUpdateService;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ProductUpdateServiceProvider implements ProviderInterface {
    public function register( Container $container ): void {
        $container->set(
            ProductUpdateService::class,
            function () use ( $container ) {
                return new ProductUpdateService( $container->get( ProductRepository::class ), $container->get( ProductFetchService::class ), $container->get( PluginSettings::class ) );
            }
        );

        $product_update_service = $container->get( ProductUpdateService::class );
        $product_update_service->init();
    }
}
