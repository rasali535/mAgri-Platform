<?php

namespace Hostinger\AffiliatePlugin\Providers;

use Hostinger\AffiliatePlugin\Admin\Surveys\AmazonSurvey;
use Hostinger\AffiliatePlugin\Admin\Surveys\MercadoSurvey;
use Hostinger\AffiliatePlugin\Admin\Surveys\Survey;
use Hostinger\AffiliatePlugin\Containers\Container;
use Hostinger\Surveys\SurveyManager;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class SurveysProvider implements ProviderInterface {

    public const SURVEY_CLASSES = array(
        AmazonSurvey::class,
        MercadoSurvey::class,
    );

    public function register( Container $container ): void {

        foreach ( self::SURVEY_CLASSES as $survey_class ) {
            $container->set(
                $survey_class,
                function () use ( $container, $survey_class ) {
                    return new $survey_class( $container->get( SurveyManager::class ) );
                }
            );

            /** @var Survey $survey */
            $survey = $container->get( $survey_class );
            $survey->init();
        }
    }
}
