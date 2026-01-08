<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Admin\Hooks;
use Hostinger\AffiliatePlugin\Containers\Container;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class AdminHooksProvider implements ProviderInterface {
    public function register( Container $container ): void {
        $container->set(
            Hooks::class,
            function () use ( $container ) {
                return new Hooks();
            }
        );

        $admin_hooks = $container->get( Hooks::class );
        $admin_hooks->init();
    }
}
