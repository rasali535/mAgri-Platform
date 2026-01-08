<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Containers\Container;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ContainerProvider implements ProviderInterface {
    public function register( Container $container ): void {
        $container->set( Container::class, fn() => $container );
    }
}
