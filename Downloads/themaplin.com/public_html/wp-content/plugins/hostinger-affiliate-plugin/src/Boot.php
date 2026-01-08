<?php

namespace Hostinger\AffiliatePlugin;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

use Hostinger\AffiliatePlugin\Containers\Container;
use Hostinger\AffiliatePlugin\Providers\AdminHooksProvider;
use Hostinger\AffiliatePlugin\Providers\AmplitudeEventsProvider;
use Hostinger\AffiliatePlugin\Providers\AssetsProvider;
use Hostinger\AffiliatePlugin\Providers\BlocksProvider;
use Hostinger\AffiliatePlugin\Providers\ContainerProvider;
use Hostinger\AffiliatePlugin\Providers\CptsProvider;
use Hostinger\AffiliatePlugin\Providers\LocalizationProvider;
use Hostinger\AffiliatePlugin\Providers\MenusProvider;
use Hostinger\AffiliatePlugin\Providers\ProductUpdateServiceProvider;
use Hostinger\AffiliatePlugin\Providers\ProviderInterface;
use Hostinger\AffiliatePlugin\Providers\RestRoutesProvider;
use Hostinger\AffiliatePlugin\Providers\SurveysProvider;
use Hostinger\AffiliatePlugin\Providers\UpdatesProvider;
use Hostinger\AffiliatePlugin\Providers\WpdbProvider;

class Boot {
    private Container $container;
    private static ?Boot $instance = null;
    private array $providers       = array(
        WpdbProvider::class,
        ContainerProvider::class,
        MenusProvider::class,
        CptsProvider::class,
        UpdatesProvider::class,
        AssetsProvider::class,
        LocalizationProvider::class,
        AmplitudeEventsProvider::class,
        RestRoutesProvider::class,
        BlocksProvider::class,
        ProductUpdateServiceProvider::class,
        AdminHooksProvider::class,
        SurveysProvider::class,
    );

    private function __construct() {
        $this->container = new Container();
    }

    public static function get_instance(): self {
        if ( self::$instance === null ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function plugins_loaded(): void {
        $this->register_providers();
    }

    private function register_providers(): void {
        foreach ( $this->providers as $provider_class ) {
            $provider = new $provider_class();
            if ( $provider instanceof ProviderInterface ) {
                $provider->register( $this->container );
            }
        }
    }
}
