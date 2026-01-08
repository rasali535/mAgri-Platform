<?php
namespace Hostinger\AffiliatePlugin\Api\Amazon;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

interface AmazonApiInterface {
    public function search_api();

    public function product_api();
}
