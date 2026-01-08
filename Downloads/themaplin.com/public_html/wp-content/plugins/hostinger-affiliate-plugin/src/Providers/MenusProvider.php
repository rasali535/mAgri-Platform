<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Admin\Menus;
use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Containers\Container;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class MenusProvider implements ProviderInterface {
    public function register( Container $container ): void {
        $container->set(
            Menus::class,
            function () use ( $container ) {
                return new Menus( $container->get( PluginSettings::class ) );
            }
        );

        $menus = $container->get( Menus::class );
        $menus->init();
    }
}
