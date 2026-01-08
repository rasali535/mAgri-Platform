<?php

namespace Hostinger\AffiliatePlugin\Admin\Surveys;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class AmazonSurvey extends Survey {

    protected function should_load_survey(): bool {
        if ( ! parent::should_load_survey() ) {
            return false;
        }

        return $this->is_within_last_week( get_option( 'hostinger_affiliate_amazon_links_created', 0 ) );
    }

    protected function get_score_question(): string {
        return __( 'How would you rate your experience publishing Amazon Affiliate links?', 'hostinger-affiliate-plugin' );
    }

    protected function get_comment_question(): string {
        return __( 'How could we improve the Hostinger Affiliate plugin for Amazon?', 'hostinger-affiliate-plugin' );
    }

    protected function get_id(): string {
        return 'affiliate_plugin_survey_amazon';
    }

    protected function get_location(): string {
        return 'wordpress_amazon_affiliate';
    }
}
