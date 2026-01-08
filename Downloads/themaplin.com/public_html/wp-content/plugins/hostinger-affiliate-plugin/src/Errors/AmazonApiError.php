<?php

namespace Hostinger\AffiliatePlugin\Errors;

use Hostinger\AffiliatePlugin\Localization\Messages;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class AmazonApiError extends WP_Error {
    private array $error_messages = array();
    public function __construct( array $errors ) {
        foreach ( $errors as $error ) {
            $message = $this->get_amazon_error_message( $error['Code'], $error );

            $this->error_messages[] = $message;
            $this->add( $error['Code'], $message );
        }

        parent::__construct(
            'amazon_api_error',
            Messages::get_general_amazon_api_error_message(),
            array(
                'status' => \WP_Http::BAD_REQUEST,
                'errors' => $this->error_messages,
            )
        );
    }

    public function get_amazon_error_message( string $error_code, array $data = array() ): string {

        switch ( $error_code ) {
            default:
                $message  = __(
                    'There seems to be a technical problem with your request.',
                    'hostinger-affiliate-plugin'
                );
                $message .= '<br>';
                $message .= __( 'Contact Hostinger support for further assistance.', 'hostinger-affiliate-plugin' );
                break;
            case 'AccessDenied':
            case 'AccessDeniedAwsUsers':
                $message = sprintf(
                    // translators: %s: URL.
                    __(
                        'The Access Key is not enabled for accessing Product Advertising API. For information on registering for Product Advertising API, see <a href="%s" target="_blank">Register for Product Advertising API</a>',
                        'hostinger-affiliate-plugin'
                    ),
                    'https://webservices.amazon.com/paapi5/documentation/register-for-pa-api.html'
                );
                $message .= ' <strong>' . __( 'OR', 'hostinger-affiliate-plugin' ) . '</strong><br>';
                $message .= sprintf(
                    // translators: %s: URL.
                    __(
                        'The Access Key is not enabled for accessing this version of Product Advertising API. Please migrate your credentials as referred here <a href="%s" target="_blank">Managing your Existing AWS Security Credentials for the Product Advertising API</a>.',
                        'hostinger-affiliate-plugin'
                    ),
                    'https://webservices.amazon.com/paapi5/documentation/migrating-your-product-advertising-api-account-from-your-aws-account.html'
                );
                break;
            case 'InvalidAssociate':
                $message  = __( 'Looks like there\'s a configuration issue with your Amazon Associates account. The access key you provided is not linked to a primary store in your approved Amazon Associates account. To fix this, head over to Associate Central and check your account settings. Make sure the access key you\'re using is associated with a primary store that\'s been approved by Amazon Associates.', 'hostinger-affiliate-plugin' );
                $message .= '<br>';
                $message .= __( 'If you\'re still having trouble after checking your settings, contact Amazon Associates support for further assistance.', 'hostinger-affiliate-plugin' );
                break;
            case 'InvalidPartnerTag':
                $message  = __( 'Looks like there\'s a configuration issue with your Amazon Associates account. The partner tag you provided is not linked to the access key you’re using. To fix this, head over to Associate Central and check your account settings. Make sure the partner tag you\'re using is associated with a valid store in your Amazon Associates account for the requested marketplace.', 'hostinger-affiliate-plugin' );
                $message .= '<br>';
                $message .= __( 'If you\'re still having trouble after checking your settings, contact Amazon Associates support for further assistance.', 'hostinger-affiliate-plugin' );
                break;
            case 'TooManyRequests':
                $message  = __( 'There was a problem with your request. Amazon limits the number of requests you can make to their Product Advertising API. Note that your account will lose access to Product Advertising API 5.0 if it has not generated referring sales for a consecutive 30-day period.', 'hostinger-affiliate-plugin' );
                $message .= '<br>';
                $message .= __( 'If the problems persists, contact Amazon Associates support for further assistance.', 'hostinger-affiliate-plugin' );
                break;
            case 'InvalidParameterValue':
            case 'MissingParameter':
                $message = __( 'Input parameter relating to request is invalid or is missing.', 'hostinger-affiliate-plugin' );
                if ( ! empty( $data['Message'] ) ) {
                    $message .= $data['Message'];
                }
                break;
            case 'IncompleteSignature':
            case 'InvalidSignature':
            case 'RequestExpired':
            case 'UnknownOperation':
                $message  = __( 'There seems to be a technical problem with your request.', 'hostinger-affiliate-plugin' );
                $message .= '<br>';
                $message .= __( 'Contact Hostinger support for further assistance.', 'hostinger-affiliate-plugin' );
                break;
            case 'UnrecognizedClient':
                $message  = __( 'Looks like there\'s a configuration issue with your Amazon Associates account. The access key you provided is not valid. To fix this, head over to Associate Central and check your account settings.', 'hostinger-affiliate-plugin' );
                $message .= '<br>';
                $message .= __( 'Make sure the access key you\'re using is correct. If you\'re still having trouble after checking your settings, contact Amazon Associates support for further assistance.', 'hostinger-affiliate-plugin' );
                break;
            case 'NoResults':
                $message = __( 'No results found.', 'hostinger-affiliate-plugin' );
                break;
            case 'RequestFail':
                $message = __( 'Request to Amazon API failed.', 'hostinger-affiliate-plugin' );
                break;
        }

        return $message;
    }

    public function get_api_error_messages(): array {
        return $this->error_messages;
    }
}
