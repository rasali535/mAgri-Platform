<?php
namespace Hostinger\AffiliatePlugin\Api\Amazon;

use Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\AmazonApi;
use Hostinger\AffiliatePlugin\Api\Amazon\ProxyApi\ProxyApi;
use Hostinger\AffiliatePlugin\Containers\Container;

class AmazonApiFactory {
    protected Container $container;

    public function __construct( Container $container ) {
        $this->container = $container;
    }

    public function get_api_factory( bool $use_amazon_api ): AmazonApiInterface {
        if ( $use_amazon_api ) {
            return $this->container->get( AmazonApi::class );
        }

        return $this->container->get( ProxyApi::class );
    }
}
