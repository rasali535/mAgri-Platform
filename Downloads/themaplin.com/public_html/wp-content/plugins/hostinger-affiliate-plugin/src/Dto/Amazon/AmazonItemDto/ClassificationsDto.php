<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\SingleStringValueDto as SingleStringValue;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ClassificationsDto {
    private SingleStringValue $binding;
    private SingleStringValue $product_group;

    public function __construct( SingleStringValue $binding, SingleStringValue $product_group ) {
        $this->binding       = $binding;
        $this->product_group = $product_group;
    }

    public function get_binding(): SingleStringValue {
        return $this->binding;
    }

    public function set_binding( SingleStringValue $binding ): void {
        $this->binding = $binding;
    }

    public function get_product_group(): SingleStringValue {
        return $this->product_group;
    }

    public function set_product_group( SingleStringValue $product_group ): void {
        $this->product_group = $product_group;
    }

    public static function from_array( array $data ): self {
        return new self(
            SingleStringValue::from_array( $data['Binding'] ?? array() ),
            SingleStringValue::from_array( $data['ProductGroup'] ?? array() ),
        );
    }
}
