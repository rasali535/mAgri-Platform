<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Containers\Container;
use Hostinger\AffiliatePlugin\Setup\Config;
use Hostinger\AffiliatePlugin\Setup\Updates;

class UpdatesProvider implements ProviderInterface {
    public function register( Container $container ): void {
        $container->set(
            Updates::class,
            function () use ( $container ) {
                return new Updates( $container->get( Config::class ) );
            }
        );

        $updates = $container->get( Updates::class );

        $updates->updates();
    }
}
