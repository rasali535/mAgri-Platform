<?php
namespace Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi\Request;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class GetProductDataRequest {
    private array $item_ids = array();

    public function __construct( array $item_ids ) {
        $this->item_ids = $item_ids;
    }

    public function get_item_ids(): array {
        return $this->item_ids;
    }
}
