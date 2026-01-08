<?php
/**
 * Amplitude Actions
 *
 * @package HostingerAffiliatePlugin
 */

namespace Hostinger\AffiliatePlugin\Amplitude;

/**
 * Avoid possibility to get file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Amplitude Actions
 */
class Actions {
    public const AFFILIATE_CREATE = 'wordpress.amazon_affiliate.create';

    public const AFFILIATE_PUBLISHED = 'wordpress.amazon_affiliate.published';

    public const AFFILIATE_ENTER = 'wordpress.amazon_affiliate.enter';

    public const MERCADO_CREATE = 'wordpress.mercado_livre.create';

    public const MERCADO_PUBLISHED = 'wordpress.mercado_livre.published';

    public const MERCADO_ENTER = 'wordpress.mercado_livre.enter';

    public const AFFILIATE_SINGLE_LAYOUT = 'single_product_card';

    public const AFFILIATE_LIST_LAYOUT = 'multiple_product_list';

    public const AFFILIATE_LIST_WITH_DESCRIPTION_SUB_LAYOUT = 'list_with_description';

    public const AFFILIATE_LIST_SIMPLIFIED_SUB_LAYOUT = 'simplified_list';

    public const AFFILIATE_LIST_HORIZONTAL_CARDS_SUB_LAYOUT = 'horizontal_cards';

    public const AFFILIATE_LIST_BESTSELLERS_PRODUCT_TYPE = 'bestsellers';

    public const AFFILIATE_LIST_MANUAL_PRODUCT_TYPE = 'manual';

    public const AFFILIATE_LIST_ALLOWED_PRODUCT_TYPES = array(
        self::AFFILIATE_LIST_MANUAL_PRODUCT_TYPE,
        self::AFFILIATE_LIST_BESTSELLERS_PRODUCT_TYPE,
    );

    public const AFFILIATE_TABLE_LAYOUT = 'comparison_table';

    public const AFFILIATE_ALLOWED_LAYOUTS = array(
        self::AFFILIATE_SINGLE_LAYOUT,
        self::AFFILIATE_LIST_LAYOUT,
        self::AFFILIATE_TABLE_LAYOUT,
    );
}
