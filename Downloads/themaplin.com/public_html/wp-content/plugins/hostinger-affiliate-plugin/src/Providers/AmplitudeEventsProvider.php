<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Amplitude\Events;
use Hostinger\AffiliatePlugin\Containers\Container;
use Hostinger\Amplitude\AmplitudeManager;
use Hostinger\WpHelper\Config;
use Hostinger\WpHelper\Constants;
use Hostinger\WpHelper\Requests\Client;
use Hostinger\WpHelper\Utils as Helper;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class AmplitudeEventsProvider implements ProviderInterface {
    public function register( Container $container ): void {
        $container->set(
            Client::class,
            function () use ( $container ) {
                return new Client(
                    $container->get( Config::class )->getConfigValue(
                        'base_rest_uri',
                        Constants::HOSTINGER_REST_URI
                    ),
                    array(
                        Config::TOKEN_HEADER  => $container->get( Helper::class )->getApiToken(),
                        Config::DOMAIN_HEADER => $container->get( Helper::class )->getHostInfo(),
                    )
                );
            }
        );

        $container->set(
            Events::class,
            function () use ( $container ) {
                return new Events( $container->get( PluginSettings::class ), $container->get( AmplitudeManager::class ) );
            }
        );

        $amplitude_events = $container->get( Events::class );
        $amplitude_events->init();
    }
}
