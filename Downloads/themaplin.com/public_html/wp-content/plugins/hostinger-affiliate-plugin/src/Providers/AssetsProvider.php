<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Containers\Container;
use Hostinger\AffiliatePlugin\Functions;
use Hostinger\AffiliatePlugin\Setup\Assets;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class AssetsProvider implements ProviderInterface {
    public function register( Container $container ): void {
        $container->set(
            Assets::class,
            function () use ( $container ) {
                return new Assets( $container->get( Functions::class ), $container->get( PluginSettings::class ) );
            }
        );

        $assets = $container->get( Assets::class );
        $assets->init();
    }
}
