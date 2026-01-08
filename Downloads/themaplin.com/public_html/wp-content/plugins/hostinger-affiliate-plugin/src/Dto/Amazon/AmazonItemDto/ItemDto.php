<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ItemInfoDto as ItemInfo;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ImagesDto as Images;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\OffersDto as Offers;
use Hostinger\AffiliatePlugin\Helpers\UrlHelper;

class ItemDto {
    private string $asin;
    private string $detail_page_url;
    private ItemInfo $item_info;
    private Images $images;
    private Offers $offers;
    private UrlHelper $url_helper;

    public function __construct( string $asin, string $detail_page_url, ItemInfoDto $item_info, ImagesDto $images, OffersDto $offers, UrlHelper $url_helper ) {
        $this->asin            = $asin;
        $this->url_helper      = $url_helper;
        $this->detail_page_url = $url_helper->sanitize( $detail_page_url, array( 'tag' ) );
        $this->item_info       = $item_info;
        $this->images          = $images;
        $this->offers          = $offers;
    }

    public function get_asin(): string {
        return $this->asin;
    }

    public function set_asin( string $asin ): void {
        $this->asin = $asin;
    }

    public function get_detail_page_url(): string {
        return $this->detail_page_url;
    }

    public function set_detail_page_url( string $detail_page_url ): void {
        $this->detail_page_url = esc_url_raw( $detail_page_url );
    }

    public function get_item_info(): ItemInfo {
        return $this->item_info;
    }

    public function set_item_info( ItemInfo $item_info ): void {
        $this->item_info = $item_info;
    }

    public function get_images(): Images {
        return $this->images;
    }

    public function set_images( Images $images ): void {
        $this->images = $images;
    }

    public function get_offers(): Offers {
        return $this->offers;
    }

    public function set_offers( Offers $offers ): void {
        $this->offers = $offers;
    }

    public static function from_array( array $data ): self {
        return new self(
            $data['ASIN'] ?? '',
            $data['DetailPageURL'] ?? '',
            ItemInfo::from_array( $data['ItemInfo'] ?? array() ),
            Images::from_array( $data['Images'] ?? array() ),
            Offers::from_array( $data['Offers'] ?? array() ),
            new UrlHelper()
        );
    }
}
