<?php
namespace Hostinger\AffiliatePlugin\Api\Amazon\AmazonApi;

use Hostinger\AffiliatePlugin\Admin\PluginSettings;
use Hostinger\AffiliatePlugin\Api\RequestsClient;
use Hostinger\AffiliatePlugin\Errors\AmazonApiError;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class Client {
    private string $host              = '';
    private string $access_key        = '';
    private string $secret_key        = '';
    private string $region_name       = '';
    private string $partner_tag       = '';
    private string $service_name      = 'ProductAdvertisingAPI';
    private string $request_method    = '';
    private array $headers            = array(
        'content-encoding' => 'amz-1.0',
        'content-type'     => 'application/json; charset=utf-8',
    );
    private array $payload            = array();
    private array $resources          = array(
        'Images.Primary.Small',
        'Images.Primary.Large',
        'ItemInfo.ByLineInfo',
        'ItemInfo.ContentInfo',
        'ItemInfo.ContentRating',
        'ItemInfo.Classifications',
        'ItemInfo.Features',
        'ItemInfo.ManufactureInfo',
        'ItemInfo.ProductInfo',
        'ItemInfo.TechnicalInfo',
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsFreeShippingEligible',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
    );
    private array $item_ids           = array();
    private string $keywords          = '';
    private string $operation         = '';
    private string $hmac_algorithm    = 'AWS4-HMAC-SHA256';
    private string $aws_request       = 'aws4_request';
    private string $str_signed_header = '';
    private RequestsClient $requests_client;
    private PluginSettings $plugin_settings;

    public function __construct( RequestsClient $requests_client, PluginSettings $plugin_settings ) {
        $this->requests_client = $requests_client;
        $this->plugin_settings = $plugin_settings;

        $this->set_keys();
    }

    public function get_service_name(): string {
        return $this->service_name;
    }

    public function set_service_name( string $service_name ): void {
        $this->service_name = $service_name;
    }

    /**
     * @throws Exception
     */
    public function request( string $operation, string $request_method, string $keywords, array $item_ids = array() ): mixed {
        $this->set_operation( $operation );
        $this->set_request_method( $request_method );
        $this->set_keywords( $keywords );
        $this->set_item_ids( $item_ids );

        $this->requests_client->set_api_url( 'https://' . $this->get_host() );

        $response = $this->requests_client->post( $this->get_path(), json_encode( $this->get_payload() ), $this->get_headers() );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        if ( empty( $response['body'] ) ) {
            return array();
        }

        $body = json_decode( $response['body'], true );

        if ( empty( $body ) ) {
            return array();
        }

        if ( ! empty( $body['Errors'] ) ) {
            return new AmazonApiError( $body['Errors'] );
        }

        return $body;
    }

    public function get_path(): string {
        return '/paapi5/' . strtolower( $this->get_operation() );
    }

    public function get_request_method(): string {
        return $this->request_method;
    }

    public function set_request_method( string $request_method ): void {
        $this->request_method = $request_method;
    }

    public function get_headers(): array {
        $this->set_headers( 'host', $this->host );
        $this->set_headers( 'x-amz-target', 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.' . $this->get_operation() );
        $this->set_headers( 'x-amz-date', $this->get_time_stamp() );

        ksort( $this->headers );

        $canonical_url  = $this->prepare_canonical_request();
        $string_to_sign = $this->prepare_string_to_sign( $canonical_url );
        $signature      = $this->calculate_signature( $string_to_sign );
        if ( ! empty( $signature ) ) {
            $this->headers['Authorization'] = $this->build_authorization_string( $signature );
        }

        return $this->headers;
    }

    public function set_headers( string $header_name, string $header_value ): void {
        $this->headers[ $header_name ] = $header_value;
    }

    public function set_payload( array $payload ): void {
        $this->payload = $payload;
    }

    public function get_resources(): array {
        return $this->resources;
    }

    public function set_resources( array $resources ): void {
        $this->resources = array_merge( $this->resources, $resources );
    }

    public function get_item_ids(): array {
        return $this->item_ids;
    }

    public function set_item_ids( array $item_ids ): void {
        $this->item_ids = $item_ids;
    }

    public function get_keywords(): string {
        return $this->keywords;
    }

    public function set_keywords( string $keywords ): void {
        $this->keywords = $keywords;
    }

    public function get_operation(): string {
        return $this->operation;
    }

    public function set_operation( string $operation ): void {
        $this->operation = $operation;
    }

    public function get_hmac_algorithm(): string {
        return $this->hmac_algorithm;
    }

    public function set_hmac_algorithm( string $hmac_algorithm ): void {
        $this->hmac_algorithm = $hmac_algorithm;
    }

    public function get_aws_request(): string {
        return $this->aws_request;
    }

    public function set_aws_request( string $aws_request ): void {
        $this->aws_request = $aws_request;
    }

    public function get_str_signed_header(): string {
        return $this->str_signed_header;
    }

    public function set_str_signed_header( string $str_signed_header ): void {
        $this->str_signed_header = $str_signed_header;
    }

    public function set_plugin_settings( PluginSettings $plugin_settings ): void {
        $this->plugin_settings = $plugin_settings;

        $this->set_keys();
    }

    public function get_payload(): array {
        if ( ! empty( $this->item_ids ) ) {
            $this->payload['ItemIds'] = $this->item_ids;
        }

        if ( ! empty( $this->keywords ) ) {
            $this->payload['Keywords'] = $this->keywords;
        }

        $this->payload['Resources'] = $this->resources;

        $this->payload['PartnerTag'] = $this->partner_tag;

        $this->payload['PartnerType'] = 'Associates';

        $this->payload['Operation'] = $this->operation;

        $preffered_language = $this->plugin_settings->get_plugin_settings()->amazon->get_preferred_language();

        if ( ! empty( $preffered_language ) ) {
            $this->payload['LanguagesOfPreference'] = array( $preffered_language );
        }

        return $this->payload;
    }

    private function set_keys(): void {
        $amazon_options    = $this->plugin_settings->get_plugin_settings()->amazon;
        $this->access_key  = $amazon_options->get_api_key();
        $this->secret_key  = $amazon_options->get_api_secret();
        $this->region_name = $amazon_options->get_region_name();
        $this->host        = $amazon_options->get_host();
        $this->partner_tag = $amazon_options->get_tracking_id();
    }

    private function prepare_canonical_request(): string {
        $canonical_url = '';

        $canonical_url .= $this->request_method . "\n";

        $canonical_url .= $this->get_path() . "\n" . "\n";

        $signed_headers = '';

        foreach ( $this->headers as $key => $value ) {
            $signed_headers .= $key . ';';

            $canonical_url .= $key . ':' . $value . "\n";
        }

        $canonical_url .= "\n";

        $this->str_signed_header = substr( $signed_headers, 0, - 1 );

        $canonical_url .= $this->str_signed_header . "\n";

        $canonical_url .= $this->generate_hex( json_encode( $this->get_payload() ) );

        return $canonical_url;
    }

    private function prepare_string_to_sign( string $canonical_url ): string {
        $string_to_sign = '';

        $string_to_sign .= $this->hmac_algorithm . "\n";
        $string_to_sign .= $this->get_time_stamp() . "\n";
        $string_to_sign .= $this->get_date() . '/' . $this->region_name . '/' . $this->service_name . '/' . $this->aws_request . "\n";
        $string_to_sign .= $this->generate_hex( $canonical_url );

        return $string_to_sign;
    }

    private function calculate_signature( string $string_to_sign ): string {
        $signature_key = $this->get_signature_key( $this->secret_key, $this->get_date(), $this->region_name, $this->service_name );

        $signature = hash_hmac( 'sha256', $string_to_sign, $signature_key, true );

        return strtolower( bin2hex( $signature ) );
    }

    private function build_authorization_string( string $str_signature ): string {
        return $this->hmac_algorithm . ' ' . 'Credential=' . $this->access_key . '/' . $this->get_date() . '/' . $this->region_name . '/' . $this->service_name . '/' . $this->aws_request . ',' . 'SignedHeaders=' . $this->str_signed_header . ',' . 'Signature=' . $str_signature;
    }

    private function generate_hex( string $data ): string {
        return strtolower( bin2hex( hash( 'sha256', $data, true ) ) );
    }

    private function get_signature_key( string $key, string $date, string $region_name, string $service_name ): string {
        $k_secret = 'AWS4' . $key;

        $k_date = hash_hmac( 'sha256', $date, $k_secret, true );

        $k_region = hash_hmac( 'sha256', $region_name, $k_date, true );

        $k_service = hash_hmac( 'sha256', $service_name, $k_region, true );

        return hash_hmac( 'sha256', $this->aws_request, $k_service, true );
    }

    private function get_time_stamp(): string {
        return gmdate( 'Ymd\THis\Z' );
    }

    private function get_date(): string {
        return gmdate( 'Ymd' );
    }

    public function get_host(): string {
        return $this->host;
    }

    public function set_host( string $host ): void {
        $this->host = $host;
    }

    public function get_access_key(): string {
        return $this->access_key;
    }

    public function set_access_key( string $access_key ): void {
        $this->access_key = $access_key;
    }

    public function get_secret_key(): string {
        return $this->secret_key;
    }

    public function set_secret_key( string $secret_key ): void {
        $this->secret_key = $secret_key;
    }

    public function get_region_name(): string {
        return $this->region_name;
    }

    public function set_region_name( string $region_name ): void {
        $this->region_name = $region_name;
    }

    public function get_partner_tag(): string {
        return $this->partner_tag;
    }

    public function set_partner_tag( string $partner_tag ): void {
        $this->partner_tag = $partner_tag;
    }
}
