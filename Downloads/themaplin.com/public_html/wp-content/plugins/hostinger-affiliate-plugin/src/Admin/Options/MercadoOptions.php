<?php

namespace Hostinger\AffiliatePlugin\Admin\Options;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class MercadoOptions {
    private string $locale = '';
    private array $locales = array(
        'pt_BR' => array(
            'domain'         => 'www.mercadolivre.com.br',
            'product_domain' => 'produto.mercadolivre.com.br',
            'locale_name'    => 'Brazil',
            'search_domain'  => 'lista.mercadolivre.com.br',
            'product_prefix' => 'MLB',
            'currency'       => array(
                'currency'          => 'R$ ',
                'currency_position' => 'left',
                'number_format'     => array(
                    'decimals'            => 2,
                    'decimal_separator'   => ',',
                    'thousands_separator' => '.',
                ),
            ),
        ),
        'es_MX' => array(
            'domain'         => 'www.mercadolibre.com.mx',
            'product_domain' => 'www.mercadolibre.com.mx',
            'locale_name'    => 'Mexico',
            'search_domain'  => 'listado.mercadolibre.com.mx',
            'product_prefix' => 'MLM',
            'currency'       => array(
                'currency'          => '$ ',
                'currency_position' => 'left',
                'number_format'     => array(
                    'decimals'            => 2,
                    'decimal_separator'   => '.',
                    'thousands_separator' => ',',
                ),
            ),
        ),
    );

    public function __construct( array $options = array() ) {
        if ( ! empty( $options['locale'] ) ) {
            $this->locale = $options['locale'];
        }
    }

    public function get_locale(): string {
        return ! empty( $this->locale ) ? $this->locale : '';
    }

    public function set_locale( string $locale ): void {
        $this->locale = $locale;
    }

    public function get_locales(): array {
        return $this->locales;
    }

    public function get_locale_domain(): string {
        return ! empty( $this->get_locale() ) ? $this->locales[ $this->get_locale() ]['domain'] : '';
    }

    public function get_locale_search_domain(): string {
        return ! empty( $this->get_locale() ) ? $this->locales[ $this->get_locale() ]['search_domain'] : '';
    }

    public function get_product_domain(): string {
        return ! empty( $this->get_locale() ) ? $this->locales[ $this->get_locale() ]['product_domain'] : '';
    }

    public function get_locale_product_prefix(): string {
        return ! empty( $this->get_locale() ) ? $this->locales[ $this->get_locale() ]['product_prefix'] : 'MLB';
    }

    public function get_formats(): array {
        return ! empty( $this->get_locale() ) ? $this->locales[ $this->get_locale() ]['currency'] : array();
    }

    public function to_array(): array {
        return array(
            'locale' => $this->get_locale(),
        );
    }

    public function mandatory_fields(): array {
        return array(
            'locale' => true,
        );
    }
}
