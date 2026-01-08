<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\SingleStringValueDto as SingleStringValue;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ByLineInfoDto as ByLineInfo;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ContentRatingDto as ContentRating;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ClassificationsDto as Classifications;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\MultiValuedDto as MultiValued;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ContentInfoDto as ContentInfo;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ManufactureInfoDto as ManufactureInfo;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\ProductInfoDto as ProductInfo;
use Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto\TechnicalInfoDto as TechnicalInfo;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ItemInfoDto {
    private SingleStringValue $title;
    private ByLineInfo $by_line_info;
    private ContentRating $content_rating;
    private Classifications $classifications;
    private MultiValued $features;
    private ContentInfo $content_info;
    private ManufactureInfo $manufacture_info;
    private ProductInfo $product_info;
    private TechnicalInfo $technical_info;

    /**
     * @param SingleStringValueDto $title
     * @param ByLineInfoDto        $by_line_info
     * @param ContentRatingDto     $content_rating
     * @param ClassificationsDto   $classifications
     * @param MultiValuedDto       $features
     * @param ContentInfoDto       $content_info
     * @param ManufactureInfoDto   $manufacture_info
     * @param ProductInfoDto       $product_info
     * @param TechnicalInfoDto     $technical_info
     */
    public function __construct( SingleStringValueDto $title, ByLineInfoDto $by_line_info, ContentRatingDto $content_rating, ClassificationsDto $classifications, MultiValuedDto $features, ContentInfoDto $content_info, ManufactureInfoDto $manufacture_info, ProductInfoDto $product_info, TechnicalInfoDto $technical_info ) {
        $this->title            = $title;
        $this->by_line_info     = $by_line_info;
        $this->content_rating   = $content_rating;
        $this->classifications  = $classifications;
        $this->features         = $features;
        $this->content_info     = $content_info;
        $this->manufacture_info = $manufacture_info;
        $this->product_info     = $product_info;
        $this->technical_info   = $technical_info;
    }


    public function get_title(): SingleStringValue {
        return $this->title;
    }

    public function set_title( SingleStringValue $title ): void {
        $this->title = $title;
    }

    public function get_by_line_info(): ByLineInfo {
        return $this->by_line_info;
    }

    public function set_by_line_info( ByLineInfo $by_line_info ): void {
        $this->by_line_info = $by_line_info;
    }

    public function get_content_rating(): ContentRating {
        return $this->content_rating;
    }

    public function set_content_rating( ContentRating $content_rating ): void {
        $this->content_rating = $content_rating;
    }

    public function get_classifications(): Classifications {
        return $this->classifications;
    }

    public function set_classifications( Classifications $classifications ): void {
        $this->classifications = $classifications;
    }

    public function get_features(): MultiValued {
        return $this->features;
    }

    public function set_features( MultiValued $features ): void {
        $this->features = $features;
    }

    public function get_content_info(): ContentInfo {
        return $this->content_info;
    }

    public function set_content_info( ContentInfo $content_info ): void {
        $this->content_info = $content_info;
    }

    public function get_manufacture_info(): ManufactureInfo {
        return $this->manufacture_info;
    }

    public function set_manufacture_info( ManufactureInfo $manufacture_info ): void {
        $this->manufacture_info = $manufacture_info;
    }

    public function get_product_info(): ProductInfo {
        return $this->product_info;
    }

    public function set_product_info( ProductInfo $product_info ): void {
        $this->product_info = $product_info;
    }

    public function get_technical_info(): TechnicalInfo {
        return $this->technical_info;
    }

    public function set_technical_info( TechnicalInfo $technical_info ): void {
        $this->technical_info = $technical_info;
    }

    public static function from_array( array $data ): self {
        return new self(
            SingleStringValue::from_array( $data['Title'] ?? array() ),
            ByLineInfo::from_array( $data['ByLineInfo'] ?? array() ),
            ContentRating::from_array( $data['ContentRating'] ?? array() ),
            Classifications::from_array( $data['Classifications'] ?? array() ),
            MultiValued::from_array( $data['Features'] ?? array() ),
            ContentInfo::from_array( $data['ContentInfo'] ?? array() ),
            ManufactureInfo::from_array( $data['ManufactureInfo'] ?? array() ),
            ProductInfo::from_array( $data['ProductInfo'] ?? array() ),
            TechnicalInfo::from_array( $data['TechnicalInfo'] ?? array() ),
        );
    }
}
