<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Containers\Container;
use Hostinger\AffiliatePlugin\Setup\Cpts;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class CptsProvider implements ProviderInterface {
    public function register( Container $container ): void {
        $container->set(
            Cpts::class,
            function () use ( $container ) {
                return new Cpts();
            }
        );

        $cpts = $container->get( Cpts::class );
        $cpts->init();
    }
}
