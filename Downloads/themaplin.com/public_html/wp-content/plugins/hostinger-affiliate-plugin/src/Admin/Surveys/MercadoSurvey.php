<?php

namespace Hostinger\AffiliatePlugin\Admin\Surveys;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class MercadoSurvey extends Survey {

    protected function should_load_survey(): bool {
        if ( ! parent::should_load_survey() ) {
            return false;
        }

        return $this->is_within_last_week( get_option( 'hostinger_affiliate_mercado_links_created', 0 ) );
    }

    protected function get_score_question(): string {
        return __( 'How would you rate your experience publishing Mercado Libre Affiliate links?', 'hostinger-affiliate-plugin' );
    }

    protected function get_comment_question(): string {
        return __( 'How could we improve the Hostinger Affiliate plugin for Mercado Libre?', 'hostinger-affiliate-plugin' );
    }

    protected function get_id(): string {
        return 'affiliate_plugin_survey_mercado';
    }

    protected function get_location(): string {
        return 'wordpress_mercado_livre_affiliate';
    }

    protected function get_priority(): int {
        return 101;
    }
}
