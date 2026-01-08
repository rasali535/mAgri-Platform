<?php

namespace Hostinger\AffiliatePlugin\Transformers;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

abstract class ProductTransformer {
    abstract public function transform( array $data ): array;
}
