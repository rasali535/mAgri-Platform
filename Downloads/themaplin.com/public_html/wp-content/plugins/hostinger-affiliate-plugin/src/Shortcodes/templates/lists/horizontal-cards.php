<?php

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

?>
<div class="hostinger-affiliate-block-list-cards">
    <?php

    foreach ( array_slice( $products, 0, $list_items_count ) as $product ) {
        ?>
        <div class="hostinger-affiliate-block-list-cards__item">
            <?php

            if ( ! empty( $atts['bestseller_label_enabled'] ) ) {
                ?>
                <div class="hostinger-affiliate-block-list-cards__bestseller-label">
                    <?php /* translators: %d: bestseller place */ ?>
                    <?php echo sprintf( __( 'Bestseller #%d', 'hostinger-affiliate-plugin' ), $product_index ); ?>
                </div>
                <?php
            }

            ?>
            <div class="hostinger-affiliate-block-list-cards__product_data">
                <?php

                $product_title = $this->render_product_title( $product );

                if ( ! empty( $product->get_image_url() ) ) {
                    ?>
                    <div class="hostinger-affiliate-block-list-cards__image">
                        <a href="<?php echo $this->shortcode_manager->render_product_url( $product, 'multiple' ); ?>" target="_blank" rel="nofollow noopener noreferrer">
                            <div>
                                <img src="<?php echo $product->get_image_url(); ?>" alt="<?php echo esc_attr( $product_title ); ?>">
                            </div>
                        </a>
                    </div>
                    <?php
                }

                ?>
                <div class="hostinger-affiliate-block-list-cards__product-title">
                    <a href="<?php echo $this->shortcode_manager->render_product_url( $product, 'multiple' ); ?>" target="_blank" rel="nofollow noopener noreferrer">
                        <h3>
                            <?php echo $product_title; ?>
                        </h3>
                    </a>
                </div>

                <?php

                $price = $product->price_available();

                $prime = $product->get_is_prime();

                if ( ! empty( $price ) || ! empty( $prime ) ) {
                    ?>
                    <div class="hostinger-affiliate-block-list-cards__product-pricing">
                        <?php

                        if ( ! empty( $price ) ) {
                            ?>
                            <div class="hostinger-affiliate-block-list-cards__product-price">
                                <?php echo $this->shortcode_manager->render_price( $product ); ?>
                            </div>
                            <?php
                        }

                        if ( ! empty( $prime ) ) {
                            ?>
                            <div class="hostinger-affiliate-block-list-cards__product-prime">
                                <img src="<?php echo HOSTINGER_AFFILIATE_PLUGIN_URL . 'assets/img/prime.png'; ?>" alt="<?php echo __( 'Is prime', 'hostinger-affiliate-plugin' ); ?>">
                            </div>
                            <?php
                        }

                        ?>
                    </div>
                    <?php
                }
                ?>
                <div class="hostinger-affiliate-block-list-cards__product-button-wrap">
                    <?php

                    switch ( $product->get_source() ) {
                        case 'mercado':
                            $button_class = 'hostinger-affiliate-block-list-cards__product-buy-button';

                            include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'buttons' . DIRECTORY_SEPARATOR . 'mercado.php';
                            break;
                        case 'amazon':
                        default:
                            $button_class = 'hostinger-affiliate-block-list-cards__product-amazon-button';

                            include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'buttons' . DIRECTORY_SEPARATOR . 'amazon.php';
                            break;
                    }

                    ?>
                </div>
            </div>
        </div>
        <?php
        ++$product_index;
    }
    ?>
</div>
