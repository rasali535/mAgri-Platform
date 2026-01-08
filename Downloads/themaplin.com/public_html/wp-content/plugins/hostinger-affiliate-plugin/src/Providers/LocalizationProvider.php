<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Containers\Container;
use Hostinger\AffiliatePlugin\Setup\Localization;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class LocalizationProvider implements ProviderInterface {
    public function register( Container $container ): void {
        $container->set(
            Localization::class,
            function () use ( $container ) {
                return new Localization();
            }
        );

        $localization = $container->get( Localization::class );
        $localization->init();
    }
}
