<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\SingleStringValueDto as SingleStringValue;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ContributorDto as Contributor;

class ByLineInfoDto {
    private SingleStringValue $brand;
    private array $contributors;
    private SingleStringValue $manufacturer;

    public function __construct( SingleStringValue $brand, array $contributors, SingleStringValue $manufacturer ) {
        $this->brand        = $brand;
        $this->contributors = $contributors;
        $this->manufacturer = $manufacturer;
    }

    public function get_brand(): SingleStringValue {
        return $this->brand;
    }

    public function set_brand( SingleStringValue $brand ): void {
        $this->brand = $brand;
    }

    public function get_contributors(): array {
        return $this->contributors;
    }

    public function set_contributors( array $contributors ): void {
        $this->contributors = $contributors;
    }

    public function get_manufacturer(): SingleStringValue {
        return $this->manufacturer;
    }

    public function set_manufacturer( SingleStringValue $manufacturer ): void {
        $this->manufacturer = $manufacturer;
    }

    public static function from_array( array $data ): self {
        $contributors = array_map(
            fn( $contributor ) => Contributor::from_array( $contributor ),
            $data['Contributors'] ?? array()
        );

        return new self(
            SingleStringValue::from_array( $data['Brand'] ?? array() ),
            $contributors,
            SingleStringValue::from_array( $data['Manufacturer'] ?? array() ),
        );
    }
}
