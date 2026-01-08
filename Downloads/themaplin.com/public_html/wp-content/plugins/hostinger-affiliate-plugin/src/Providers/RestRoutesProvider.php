<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Containers\Container;
use Hostinger\AffiliatePlugin\Rest\ItemsRoutes;
use Hostinger\AffiliatePlugin\Rest\Routes;
use Hostinger\AffiliatePlugin\Rest\SettingsRoutes;
use Hostinger\AffiliatePlugin\Rest\TableRoutes;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class RestRoutesProvider implements ProviderInterface {
    public function register( Container $container ): void {
        $container->set(
            Routes::class,
            function () use ( $container ) {
                return new Routes(
                    $container->get( SettingsRoutes::class ),
                    $container->get( ItemsRoutes::class ),
                    $container->get( TableRoutes::class )
                );
            }
        );

        $rest_routes = $container->get( Routes::class );
        $rest_routes->init();
    }
}
