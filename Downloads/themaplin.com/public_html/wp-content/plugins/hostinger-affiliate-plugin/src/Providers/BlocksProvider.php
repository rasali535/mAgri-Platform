<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Containers\Container;
use Hostinger\AffiliatePlugin\Setup\Blocks;
use Hostinger\AffiliatePlugin\Shortcodes\ShortcodeManager;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class BlocksProvider implements ProviderInterface {
    public function register( Container $container ): void {
        $container->set(
            Blocks::class,
            function () use ( $container ) {
                return new Blocks( $container->get( PluginSettings::class ), $container->get( ShortcodeManager::class ) );
            }
        );

        $blocks = $container->get( Blocks::class );
        $blocks->init();
    }
}
