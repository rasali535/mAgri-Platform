<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Containers\Container;

interface ProviderInterface {
    public function register( Container $container ): void;
}
