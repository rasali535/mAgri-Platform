<?php
namespace Hostinger\AffiliatePlugin\Api\Mercado;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Api\RequestsClient;
use Hostinger\WpHelper\Utils;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ClientFactory {
    private PluginSettings $plugin_settings;
    private RequestsClient $requests_client;
    private Utils $utils;

    public function __construct( PluginSettings $plugin_settings, RequestsClient $requests_client, Utils $utils ) {
        $this->plugin_settings = $plugin_settings;
        $this->requests_client = $requests_client;
        $this->utils           = $utils;
    }

    public function create_client(): Client {
        return new Client( $this->plugin_settings, $this->requests_client, $this->utils );
    }
}
