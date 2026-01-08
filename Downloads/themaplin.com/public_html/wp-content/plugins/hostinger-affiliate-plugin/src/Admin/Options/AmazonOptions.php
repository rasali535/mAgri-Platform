<?php

namespace Hostinger\AffiliatePlugin\Admin\Options;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class AmazonOptions {
    private string $api_key                = '';
    private string $api_secret             = '';
    private string $country                = '';
    private string $tracking_id            = '';
    private string $language_of_preference = '';

    private array $locales = array(
        'au' => array(
            'domain'                 => 'amazon.com.au',
            'host'                   => 'webservices.amazon.com.au',
            'region'                 => 'us-west-2',
            'tld'                    => 'com.au',
            'proxy_country'          => 'au',
            'language_of_preference' => array(
                'default' => 'en_AU',
                'options' => array(
                    'en_AU' => array(
                        'name'              => 'English',
                        'currency'          => '$',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                ),
            ),
        ),
        'be' => array(
            'domain'                 => 'amazon.com.be',
            'host'                   => 'webservices.amazon.com.be',
            'region'                 => 'eu-west-1',
            'tld'                    => 'com.be',
            'proxy_country'          => 'be',
            'language_of_preference' => array(
                'default' => 'fr_BE',
                'options' => array(
                    'fr_BE' => array(
                        'name'              => 'French',
                        'currency'          => ' €',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => ' ',
                        ),
                    ),
                    'nl_BE' => array(
                        'name'              => 'Dutch',
                        'currency'          => '€',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => ' ',
                        ),
                    ),
                    'en_GB' => array(
                        'name'              => 'English',
                        'currency'          => '€',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                ),
            ),
        ),
        'br' => array(
            'domain'                 => 'amazon.com.br',
            'host'                   => 'webservices.amazon.com.br',
            'region'                 => 'us-east-1',
            'tld'                    => 'com.br',
            'proxy_country'          => 'br',
            'language_of_preference' => array(
                'default' => 'pt_BR',
                'options' => array(
                    'pt_BR' => array(
                        'name'              => 'Portuguese',
                        'currency'          => 'R$ ',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => '',
                        ),
                    ),
                ),
            ),
        ),
        'ca' => array(
            'domain'                 => 'amazon.ca',
            'host'                   => 'webservices.amazon.ca',
            'region'                 => 'us-east-1',
            'tld'                    => 'ca',
            'proxy_country'          => 'ca',
            'language_of_preference' => array(
                'default' => 'en_CA',
                'options' => array(
                    'en_CA' => array(
                        'name'              => 'English',
                        'currency'          => '$',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'fr_CA' => array(
                        'name'              => 'French',
                        'currency'          => '$',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => ' ',
                        ),
                    ),
                ),
            ),
        ),
        'eg' => array(
            'domain'                 => 'amazon.eg',
            'host'                   => 'webservices.amazon.eg',
            'region'                 => 'eu-west-1',
            'tld'                    => 'eg',
            'proxy_country'          => '',
            'language_of_preference' => array(
                'default' => 'en_AE',
                'options' => array(
                    'en_AE' => array(
                        'name'              => 'English',
                        'currency'          => 'EGP',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'ar_AE' => array(
                        'name'              => 'Arabic',
                        'currency'          => 'نيه',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => '',
                        ),
                    ),
                ),
            ),
        ),
        'fr' => array(
            'domain'                 => 'amazon.fr',
            'host'                   => 'webservices.amazon.fr',
            'region'                 => 'eu-west-1',
            'tld'                    => 'fr',
            'proxy_country'          => 'fr',
            'language_of_preference' => array(
                'default' => 'fr_FR',
                'options' => array(
                    'fr_FR' => array(
                        'name'              => 'French',
                        'currency'          => '€',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => '',
                        ),
                    ),
                ),
            ),
        ),
        'de' => array(
            'domain'                 => 'amazon.de',
            'host'                   => 'webservices.amazon.de',
            'region'                 => 'eu-west-1',
            'tld'                    => 'de',
            'proxy_country'          => 'de',
            'language_of_preference' => array(
                'default' => 'de_DE',
                'options' => array(
                    'cs_CZ' => array(
                        'name'              => 'Czech',
                        'currency'          => '€',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ' ',
                        ),
                    ),
                    'de_DE' => array(
                        'name'              => 'German',
                        'currency'          => '€',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => '.',
                        ),
                    ),
                    'en_GB' => array(
                        'name'              => 'English UK',
                        'currency'          => '€',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'nl_NL' => array(
                        'name'              => 'Dutch',
                        'currency'          => '€',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => '.',
                        ),
                    ),
                    'pl_PL' => array(
                        'name'              => 'Polish',
                        'currency'          => '€',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => ' ',
                        ),
                    ),
                    'tr_TR' => array(
                        'name'              => 'Turkish',
                        'currency'          => '€',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => '.',
                        ),
                    ),
                ),
            ),
        ),
        'in' => array(
            'domain'                 => 'amazon.in',
            'host'                   => 'webservices.amazon.in',
            'region'                 => 'eu-west-1',
            'tld'                    => 'in',
            'proxy_country'          => 'in',
            'language_of_preference' => array(
                'default' => 'en_IN',
                'options' => array(
                    'en_IN' => array(
                        'name'              => 'English',
                        'currency'          => '₹',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 0,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'hi_IN' => array(
                        'name'              => 'Hindi',
                        'currency'          => '₹',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 0,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'kn_IN' => array(
                        'name'              => 'Kannada',
                        'currency'          => '₹',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 0,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'ml_IN' => array(
                        'name'              => 'Malayalam',
                        'currency'          => '₹',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 0,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'ta_IN' => array(
                        'name'              => 'Tamil',
                        'currency'          => '₹',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 0,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'te_IN' => array(
                        'name'              => 'Telugu',
                        'currency'          => '₹',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 0,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                ),
            ),
        ),
        'it' => array(
            'domain'                 => 'amazon.it',
            'host'                   => 'webservices.amazon.it',
            'region'                 => 'eu-west-1',
            'tld'                    => 'it',
            'proxy_country'          => 'it',
            'language_of_preference' => array(
                'default' => 'it_IT',
                'options' => array(
                    'it_IT' => array(
                        'name'              => 'Italian',
                        'currency'          => '€',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => '.',
                        ),
                    ),
                ),
            ),
        ),
        'jp' => array(
            'domain'                 => 'amazon.co.jp',
            'host'                   => 'webservices.amazon.co.jp',
            'region'                 => 'us-west-2',
            'tld'                    => 'co.jp',
            'proxy_country'          => 'jp',
            'language_of_preference' => array(
                'default' => 'ja_JP',
                'options' => array(
                    'en_US' => array(
                        'name'              => 'English',
                        'currency'          => '¥',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 0,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'ja_JP' => array(
                        'name'              => 'Japanese',
                        'currency'          => '¥',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 0,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'zh_CN' => array(
                        'name'              => 'Chinese',
                        'currency'          => 'JP¥',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 0,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                ),
            ),
        ),
        'mx' => array(
            'domain'                 => 'amazon.com.mx',
            'host'                   => 'webservices.amazon.com.mx',
            'region'                 => 'us-east-1',
            'tld'                    => 'com.mx',
            'proxy_country'          => 'mx',
            'language_of_preference' => array(
                'default' => 'es_MX',
                'options' => array(
                    'es_MX' => array(
                        'name'              => 'Spanish',
                        'currency'          => '$',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                ),
            ),
        ),
        'nl' => array(
            'domain'                 => 'amazon.nl',
            'host'                   => 'webservices.amazon.nl',
            'region'                 => 'eu-west-1',
            'tld'                    => 'nl',
            'proxy_country'          => 'nl',
            'language_of_preference' => array(
                'default' => 'nl_NL',
                'options' => array(
                    'nl_NL' => array(
                        'name'              => 'Dutch',
                        'currency'          => '€',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => '.',
                        ),
                    ),
                ),
            ),
        ),
        'pl' => array(
            'domain'                 => 'amazon.pl',
            'host'                   => 'webservices.amazon.pl',
            'region'                 => 'eu-west-1',
            'tld'                    => 'pl',
            'proxy_country'          => 'pl',
            'language_of_preference' => array(
                'default' => 'pl_PL',
                'options' => array(
                    'pl_PL' => array(
                        'name'              => 'Polish',
                        'currency'          => 'zł',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => ' ',
                        ),
                    ),
                ),
            ),
        ),
        'sg' => array(
            'domain'                 => 'amazon.sg',
            'host'                   => 'webservices.amazon.sg',
            'region'                 => 'us-west-2',
            'tld'                    => 'com.sg',
            'proxy_country'          => '',
            'language_of_preference' => array(
                'default' => 'en_SG',
                'options' => array(
                    'en_SG' => array(
                        'name'              => 'English',
                        'currency'          => 'S$',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                ),
            ),
        ),
        'sa' => array(
            'domain'                 => 'amazon.sa',
            'host'                   => 'webservices.amazon.sa',
            'region'                 => 'eu-west-1',
            'tld'                    => 'sa',
            'proxy_country'          => 'sa',
            'language_of_preference' => array(
                'default' => 'en_AE',
                'options' => array(
                    'en_AE' => array(
                        'name'              => 'English',
                        'currency'          => 'SAR',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'ar_AE' => array(
                        'name'              => 'Arabic',
                        'currency'          => 'ريال',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                ),
            ),
        ),
        'es' => array(
            'domain'                 => 'amazon.es',
            'host'                   => 'webservices.amazon.es',
            'region'                 => 'eu-west-1',
            'tld'                    => 'es',
            'proxy_country'          => 'es',
            'language_of_preference' => array(
                'default' => 'es_ES',
                'options' => array(
                    'es_ES' => array(
                        'name'              => 'Spanish',
                        'currency'          => '€',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => '.',
                        ),
                    ),
                ),
            ),
        ),
        'se' => array(
            'domain'                 => 'amazon.se',
            'host'                   => 'webservices.amazon.se',
            'region'                 => 'eu-west-1',
            'tld'                    => 'se',
            'proxy_country'          => 'se',
            'language_of_preference' => array(
                'default' => 'sv_SE',
                'options' => array(
                    'sv_SE' => array(
                        'name'              => 'Swedish',
                        'currency'          => 'kr',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => ' ',
                        ),
                    ),
                ),
            ),
        ),
        'tr' => array(
            'domain'                 => 'amazon.com.tr',
            'host'                   => 'webservices.amazon.com.tr',
            'region'                 => 'eu-west-1',
            'tld'                    => 'com.tr',
            'proxy_country'          => 'tr',
            'language_of_preference' => array(
                'default' => 'tr_TR',
                'options' => array(
                    'tr_TR' => array(
                        'name'              => 'Turkish',
                        'currency'          => 'TL',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => '.',
                        ),
                    ),
                ),
            ),
        ),
        'ae' => array(
            'domain'                 => 'amazon.ae',
            'host'                   => 'webservices.amazon.ae',
            'region'                 => 'eu-west-1',
            'tld'                    => 'ae',
            'proxy_country'          => 'ae',
            'language_of_preference' => array(
                'default' => 'en_AE',
                'options' => array(
                    'en_AE' => array(
                        'name'              => 'English',
                        'currency'          => 'AED',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'ar_AE' => array(
                        'name'              => 'Arabic',
                        'currency'          => 'درهم',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                ),
            ),
        ),
        'uk' => array(
            'domain'                 => 'amazon.co.uk',
            'host'                   => 'webservices.amazon.co.uk',
            'region'                 => 'eu-west-1',
            'tld'                    => 'co.uk',
            'proxy_country'          => 'uk',
            'language_of_preference' => array(
                'default' => 'en_GB',
                'options' => array(
                    'en_GB' => array(
                        'name'              => 'English',
                        'currency'          => '£',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                ),
            ),
        ),
        'us' => array(
            'domain'                 => 'amazon.com',
            'host'                   => 'webservices.amazon.com',
            'region'                 => 'us-east-1',
            'tld'                    => 'com',
            'proxy_country'          => 'us',
            'language_of_preference' => array(
                'default' => 'en_US',
                'options' => array(
                    'de_DE' => array(
                        'name'              => 'German',
                        'currency'          => '$',
                        'currency_position' => 'right',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => ',',
                            'thousands_separator' => '.',
                        ),
                    ),
                    'en_US' => array(
                        'name'              => 'English',
                        'currency'          => '$',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'es_US' => array(
                        'name'              => 'Spanish',
                        'currency'          => 'US$',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'ko_KR' => array(
                        'name'              => 'Korean',
                        'currency'          => 'US$',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'pt_BR' => array(
                        'name'              => 'Portuguese',
                        'currency'          => 'US$',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'zh_CN' => array(
                        'name'              => 'Chinese (China)',
                        'currency'          => 'US$',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                    'zh_TW' => array(
                        'name'              => 'Chinese (Taiwan)',
                        'currency'          => 'US$',
                        'currency_position' => 'left',
                        'number_format'     => array(
                            'decimals'            => 2,
                            'decimal_separator'   => '.',
                            'thousands_separator' => ',',
                        ),
                    ),
                ),
            ),
        ),
    );

    public function __construct( array $amazon = array() ) {
        if ( ! empty( $amazon['api_key'] ) ) {
            $this->api_key = $amazon['api_key'];
        }

        if ( ! empty( $amazon['api_secret'] ) ) {
            $this->api_secret = $amazon['api_secret'];
        }

        if ( ! empty( $amazon['country'] ) ) {
            $this->country = $amazon['country'];
        }

        if ( ! empty( $amazon['tracking_id'] ) ) {
            $this->tracking_id = $amazon['tracking_id'];
        }

        if ( ! empty( $amazon['language_of_preference'] ) ) {
            $this->language_of_preference = $amazon['language_of_preference'];
        }
    }

    public function get_api_key(): string {
        return $this->api_key;
    }

    public function set_api_key( string $api_key ): void {
        $this->api_key = $api_key;
    }

    public function get_api_secret(): string {
        return $this->api_secret;
    }

    public function set_api_secret( string $api_secret ): void {
        $this->api_secret = $api_secret;
    }

    public function get_country(): string {
        return $this->country;
    }

    public function set_country( string $country ): void {
        $this->country = $country;
    }

    public function get_tracking_id(): string {
        return $this->tracking_id;
    }

    public function set_tracking_id( string $tracking_id ): void {
        $this->tracking_id = $tracking_id;
    }

    public function get_region_name(): string {
        return ! empty( $this->get_country() ) ? $this->locales[ $this->get_country() ]['region'] : '';
    }

    public function get_host(): string {
        return ! empty( $this->get_country() ) ? $this->locales[ $this->get_country() ]['host'] : '';
    }

    public function get_language_of_preference(): string {
        return $this->language_of_preference;
    }

    public function set_language_of_preference( string $language_of_preference ): void {
        $this->language_of_preference = $language_of_preference;
    }

    public function to_array(): array {
        return array(
            'api_key'                => $this->get_api_key(),
            'api_secret'             => $this->get_api_secret(),
            'country'                => $this->get_country(),
            'tracking_id'            => $this->get_tracking_id(),
            'language_of_preference' => $this->get_language_of_preference(),
        );
    }

    public function delete_credentials(): void {
        $this->set_api_key( '' );
        $this->set_api_secret( '' );
        $this->set_country( '' );
        $this->set_tracking_id( '' );
    }

    public function get_domain(): string {
        return ! empty( $this->locales[ $this->get_country() ]['domain'] ) ? $this->locales[ $this->get_country() ]['domain'] : '';
    }

    public function get_formats(): array {
        return ! empty( $this->locales[ $this->get_country() ]['language_of_preference']['options'][ $this->get_preferred_language() ] ) ? $this->locales[ $this->get_country() ]['language_of_preference']['options'][ $this->get_preferred_language() ] : array();
    }

    public function get_tld(): string {
        return ! empty( $this->locales[ $this->get_country() ]['tld'] ) ? $this->locales[ $this->get_country() ]['tld'] : 'com';
    }

    public function get_proxy_country(): string {
        return ! empty( $this->locales[ $this->get_country() ]['proxy_country'] ) ? $this->locales[ $this->get_country() ]['proxy_country'] : '';
    }

    public function get_preferred_language(): string {
        if ( ! empty( $this->get_language_of_preference() ) ) {
            return $this->get_language_of_preference();
        }

        return ! empty( $this->locales[ $this->get_country() ]['language_of_preference']['default'] ) ? $this->locales[ $this->get_country() ]['language_of_preference']['default'] : '';
    }

    public function mandatory_fields(): array {
        return array(
            'api_key'                => false,
            'api_secret'             => false,
            'country'                => true,
            'language_of_preference' => false,
            'tracking_id'            => true,
        );
    }

    public function use_amazon_api(): bool {
        return ! empty( $this->get_api_key() ) || ! empty( $this->get_api_secret() );
    }
}
