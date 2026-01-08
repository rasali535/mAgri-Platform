<?php

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

foreach ( array_slice( $products, 0, 1 ) as $product ) {
    ?>
    <div class="hostinger-affiliate-block-single-type">
        <?php

        $product_title = $this->render_product_title( $product );

        if ( ! empty( $product->get_image_url() ) ) {
            ?>
            <div class="hostinger-affiliate-block-single-type__image">
                <a href="<?php echo $this->shortcode_manager->render_product_url( $product ); ?>" target="_blank" rel="nofollow noopener noreferrer">
                    <img src="<?php echo $product->get_image_url(); ?>" alt="<?php echo esc_attr( $product_title ); ?>">
                </a>
            </div>
            <?php
        }

        ?>
        <div class="hostinger-affiliate-block-single-type__product-data">
            <div class="hostinger-affiliate-block-single-type__product-title">
                <a href="<?php echo $this->shortcode_manager->render_product_url( $product ); ?>" target="_blank" rel="nofollow noopener noreferrer">
                    <h3>
                        <?php echo $product_title; ?>
                    </h3>
                </a>
            </div>
            <?php

            if ( ! empty( $atts['description_enabled'] ) ) {
                ?>
                <div class="hostinger-affiliate-block-single-type__product-description">
                    <?php echo $this->render_product_description( $product ); ?>
                </div>
                <?php
            }

            ?>
            <div class="hostinger-affiliate-block-single-type__product-actions">
                <?php

                $price = $product->price_available();

                if ( ! empty( $price ) ) {
                    ?>
                    <div class="hostinger-affiliate-block-single-type__product-price">
                        <?php echo $this->shortcode_manager->render_price( $product ); ?>
                    </div>
                    <?php
                }

                if ( ! empty( $product->get_is_prime() ) ) {
                    ?>
                    <div class="hostinger-affiliate-block-single-type__product-prime">
                        <img src="<?php echo HOSTINGER_AFFILIATE_PLUGIN_URL . 'assets/img/prime.png'; ?>" alt="<?php echo __( 'Is prime', 'hostinger-affiliate-plugin' ); ?>">
                    </div>
                    <?php
                }

                ?>
                <div class="hostinger-affiliate-block-single-type__product-button-wrap">
                    <?php

                    switch ( $product->get_source() ) {
                        case 'mercado':
                            $button_class = 'hostinger-affiliate-block-single-type__product-buy-button';

                            include __DIR__ . DIRECTORY_SEPARATOR . 'buttons' . DIRECTORY_SEPARATOR . 'mercado.php';
                            break;
                        case 'amazon':
                        default:
                            $button_class = 'hostinger-affiliate-block-single-type__product-amazon-button';

                            include __DIR__ . DIRECTORY_SEPARATOR . 'buttons' . DIRECTORY_SEPARATOR . 'amazon.php';
                            break;
                    }

                    ?>
                </div>

            </div>
        </div>
    </div>
    <?php
}

?>
