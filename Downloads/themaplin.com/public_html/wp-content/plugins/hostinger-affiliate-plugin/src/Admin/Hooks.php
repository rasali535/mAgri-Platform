<?php

namespace Hostinger\AffiliatePlugin\Admin;

use Hostinger\AffiliatePlugin\Amplitude\Actions;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class Hooks {
    public function init() {
        add_filter( 'hostinger_once_per_day_events', array( $this, 'limit_triggered_amplitude_events' ) );
    }

    public function limit_triggered_amplitude_events( array $events ): array {
        $new_events = array(
            Actions::AFFILIATE_ENTER,
            Actions::MERCADO_ENTER,
        );

        return array_merge( $events, $new_events );
    }
}
