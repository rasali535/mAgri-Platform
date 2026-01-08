<?php

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

?>
<div class="product-search-modal__item-results-grid">
    <?php
    foreach ( $response as $product ) {
        $title = $product->get_title();
        if ( mb_strlen( $title ) > 30 ) {
            $title = mb_substr( $title, 0, 30 ) . '...';
        }

        $product_thumbnail_url = $product->get_thumbnail_url();
        // phpcs:disable Universal.WhiteSpace.PrecisionAlignment
        ?>
        <div class="product-search-modal__item-result"
             title="<?php echo esc_attr( $product->get_title() ); ?>"
             data-asin="<?php echo esc_attr( $product->get_asin() ); ?>"
             data-image-url="<?php echo esc_attr( $product_thumbnail_url ); ?>"
             data-title-shortened="<?php echo esc_attr( $title ); ?>"
             data-url="<?php echo esc_attr( $product->get_url() ); ?>"
        >
        <?php
        // phpcs:enable
        ?>
            <div class="product-search-modal__item-result-thumbnail">

                <?php

                if ( ! empty( $product->get_image_url() ) ) {
                    ?>
                    <div class="product-search-modal__item-result-thumbnail-with-image">
                        <img src="<?php echo $product_thumbnail_url; ?>" alt="<?php echo esc_attr( $product->get_title() ); ?>">
                    </div>
                    <?php
                } else {
                    ?>
                    <div class="product-search-modal__item-result-thumbnail-no-image">
                        <img src="<?php echo HOSTINGER_AFFILIATE_PLUGIN_URL . 'assets/img/product-no-image.svg'; ?>" alt="<?php echo esc_attr( $product->get_title() ); ?>">
                    </div>
                    <?php
                }

                ?>
            </div>
            <div class="product-search-modal__item-result-data">
                <div class="product-search-modal__item-result-title">
                    <?php

                    echo $title;

                    ?>
                </div>
                <?php
                if ( $product->get_rating() > 0 ) {
                    ?>
                    <div class="product-search-modal__item-result-rating">
                        <div class="product-search-modal__item-result-rating-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9.99985 15.2292L6.54152 17.3125C6.38874 17.4097 6.22902 17.4514 6.06235 17.4375C5.89568 17.4236 5.74985 17.3681 5.62485 17.2708C5.49985 17.1736 5.40263 17.0521 5.33318 16.9062C5.26374 16.7604 5.24985 16.5972 5.29152 16.4167L6.20818 12.4792L3.14568 9.83333C3.00679 9.70833 2.91999 9.56597 2.88527 9.40625C2.85054 9.24653 2.86096 9.09028 2.91652 8.9375C2.97207 8.78472 3.05541 8.65972 3.16652 8.5625C3.27763 8.46528 3.43041 8.40278 3.62485 8.375L7.66652 8.02083L9.22902 4.3125C9.29846 4.14583 9.4061 4.02083 9.55193 3.9375C9.69777 3.85417 9.84707 3.8125 9.99985 3.8125C10.1526 3.8125 10.3019 3.85417 10.4478 3.9375C10.5936 4.02083 10.7012 4.14583 10.7707 4.3125L12.3332 8.02083L16.3748 8.375C16.5693 8.40278 16.7221 8.46528 16.8332 8.5625C16.9443 8.65972 17.0276 8.78472 17.0832 8.9375C17.1387 9.09028 17.1492 9.24653 17.1144 9.40625C17.0797 9.56597 16.9929 9.70833 16.854 9.83333L13.7915 12.4792L14.7082 16.4167C14.7498 16.5972 14.736 16.7604 14.6665 16.9062C14.5971 17.0521 14.4998 17.1736 14.3748 17.2708C14.2498 17.3681 14.104 17.4236 13.9373 17.4375C13.7707 17.4514 13.611 17.4097 13.4582 17.3125L9.99985 15.2292Z" fill="#FEA419"/>
                            </svg>
                        </div>
                        <div class="product-search-modal__item-result-rating-label">
                            <?php

                            echo $product->get_rating();

                            if ( $product->get_reviews() > 0 ) {
                                ?>
                                <span>
                                    <?php
                                        // translators: %d: Rating, e.g. 4.8.
                                        echo sprintf( __( '(%d reviews)', 'hostinger-affiliate-theme' ), $product->get_reviews() );
                                    ?>
                                </span>
                                <?php
                            }

                            ?>
                        </div>
                    </div>
                    <?php
                }
                ?>
                <div class="product-search-modal__item-result-bottom">
                    <?php

                    $price = $product->get_price();

                    if ( ! empty( $price ) ) {
                        ?>
                        <div class="product-search-modal__item-result-price">
                            <?php echo $this->shortcode_manager->render_price( $product ); ?>
                        </div>
                        <?php
                    }

                    if ( ! empty( $product->get_is_prime() ) ) {
                        ?>
                        <div class="product-search-modal__item-result-prime">
                            <img src="<?php echo HOSTINGER_AFFILIATE_PLUGIN_URL . 'assets/img/prime.png'; ?>" alt="<?php echo __( 'Is prime', 'hostinger-affiliate-plugin' ); ?>">
                        </div>
                        <?php
                    }
                    ?>
                </div>
            </div>
        </div>
        <?php
    }
    ?>
</div>
