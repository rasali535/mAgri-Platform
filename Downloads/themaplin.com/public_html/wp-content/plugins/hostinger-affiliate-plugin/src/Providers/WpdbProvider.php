<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Containers\Container;
use wpdb;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class WpdbProvider implements ProviderInterface {
    public function register( Container $container ): void {
        global $wpdb;

        $container->set( wpdb::class, fn() => $wpdb );
    }
}
