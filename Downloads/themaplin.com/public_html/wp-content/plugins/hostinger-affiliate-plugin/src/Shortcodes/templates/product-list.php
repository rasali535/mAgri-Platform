<?php

use Hostinger\AffiliatePlugin\Amplitude\Actions as AmplitudeActions;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

$product_index = 1;

$list_items_count = $this->return_item_count();

$products = array_slice( $products, 0, $list_items_count );

$layout = ! empty( $atts['list_layout'] ) ? $atts['list_layout'] : 'default';

switch ( $layout ) {
    case AmplitudeActions::AFFILIATE_LIST_WITH_DESCRIPTION_SUB_LAYOUT:
        require __DIR__ . DIRECTORY_SEPARATOR . 'lists' . DIRECTORY_SEPARATOR . 'list-with-description.php';
        break;
    case AmplitudeActions::AFFILIATE_LIST_SIMPLIFIED_SUB_LAYOUT:
        require __DIR__ . DIRECTORY_SEPARATOR . 'lists' . DIRECTORY_SEPARATOR . 'simplified-list.php';
        break;
    case AmplitudeActions::AFFILIATE_LIST_HORIZONTAL_CARDS_SUB_LAYOUT:
        require __DIR__ . DIRECTORY_SEPARATOR . 'lists' . DIRECTORY_SEPARATOR . 'horizontal-cards.php';
        break;
    case 'default':
        echo __( 'No layout selected.', 'hostinger-affiliate-plugin' );
        break;
}
