<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\SingleStringValueDto as SingleStringValue;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ManufactureInfoDto {
    private SingleStringValue $item_part_number;
    private SingleStringValue $model;
    private SingleStringValue $warranty;

    public function __construct( SingleStringValue $item_part_number, SingleStringValue $model, SingleStringValue $warranty ) {
        $this->item_part_number = $item_part_number;
        $this->model            = $model;
        $this->warranty         = $warranty;
    }

    public function get_item_part_number(): SingleStringValue {
        return $this->item_part_number;
    }

    public function set_item_part_number( SingleStringValue $item_part_number ): void {
        $this->item_part_number = $item_part_number;
    }

    public function get_model(): SingleStringValue {
        return $this->model;
    }

    public function set_model( SingleStringValue $model ): void {
        $this->model = $model;
    }

    public function get_warranty(): SingleStringValue {
        return $this->warranty;
    }

    public function set_warranty( SingleStringValue $warranty ): void {
        $this->warranty = $warranty;
    }

    public static function from_array( array $data ): self {
        return new self(
            SingleStringValue::from_array( $data['ItemPartNumber'] ?? array() ),
            SingleStringValue::from_array( $data['Model'] ?? array() ),
            SingleStringValue::from_array( $data['Warranty'] ?? array() ),
        );
    }
}
