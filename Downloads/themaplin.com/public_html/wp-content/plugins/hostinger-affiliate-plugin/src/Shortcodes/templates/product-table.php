<?php

$fields = $table->get_feature_rows();

if ( ! empty( $fields ) ) {

    $asin_rows = array_slice( $table->get_asin_rows(), 0, 6 );

    $label_available = false;

    foreach ( $asin_rows as $asin_row ) {
        if ( ! empty( $asin_row->get_text_label() ) ) {
            $label_available = true;
            break;
        }
    }

    ?>

    <div class="hostinger-affiliate-table-wrap">
        <div class="hostinger-affiliate-table hostinger-affiliate-table--is-desktop hostinger-affiliate-table--have-<?php echo count( $asin_rows ); ?>-columns">

        <?php

        if ( ! empty( $label_available ) ) {
            ?>
            <div class="hostinger-affiliate-table__cell">

            </div>

            <?php

            foreach ( $asin_rows as $index => $asin_row ) {
                $row_style = $this->prepare_row_colors( $asin_row );

                ?>

                <div class="hostinger-affiliate-table__cell hostinger-affiliate-table__cell--is-product-label hostinger-affiliate-table__cell--is-product-index-<?php echo $index; ?>" <?php echo $row_style; ?>>
                    <div class="hostinger-affiliate-table__value hostinger-affiliate-table__value--is-product-label">
                        <?php echo $asin_row->get_text_label(); ?>
                    </div>
                </div>

                <?php
            }
        }

        for ( $column = 0; $column < count( $fields ); $column++ ) {

            $feature_row = $fields[ $column ];

            ?>
            <div class="hostinger-affiliate-table__cell">
                <div class="hostinger-affiliate-table__value hostinger-affiliate-table__value--is-feature-label">
                    <?php echo $feature_row->get_name(); ?>
                </div>
            </div>
            <?php

            if ( ! empty( $asin_rows ) ) {
                foreach ( $asin_rows as $index => $asin_row ) {

                    $row_style = $this->prepare_row_colors( $asin_row );

                    $row_value = $this->render_table_row( $feature_row, $asin_row );

                    $selected_value = $this->format_selected_value( $feature_row->get_selected_value() );

                    ?>
                    <div class="hostinger-affiliate-table__cell hostinger-affiliate-table__cell--is-product-index-<?php echo $index; ?>" <?php echo $row_style; ?>>
                        <div class="hostinger-affiliate-table__value hostinger-affiliate-table__value--is-<?php echo $selected_value; ?> hostinger-affiliate-table__value--is-<?php echo ! empty( $marketplace ) ? $marketplace : ''; ?>" <?php echo $row_style; ?>>
                            <?php echo ! empty( $row_value ) ? $row_value : ''; ?>
                        </div>
                    </div>
                    <?php

                }
            }
        }

        ?>
        </div>
    </div>

    <?php

}

?>

<?php

$fields = $table->get_feature_rows();

if ( ! empty( $fields ) ) {

    $label_available = false;

    foreach ( $asin_rows as $asin_row ) {
        if ( ! empty( $asin_row->get_text_label() ) ) {
            $label_available = true;
            break;
        }
    }

    foreach ( $asin_rows as $index => $asin_row ) {

        $row_style = $this->prepare_row_colors( $asin_row );

        ?>
        <div class="hostinger-affiliate-table hostinger-affiliate-table--is-mobile">
            <?php

            $text_label = $asin_row->get_text_label();

            if ( ! empty( $text_label ) ) {

                ?>
                <div class="hostinger-affiliate-table__cell">
                </div>
                <div class="hostinger-affiliate-table__cell" <?php echo $row_style; ?>>
                    <div class="hostinger-affiliate-table__value hostinger-affiliate-table__value--is-product-label">
                        <?php echo $text_label; ?>
                    </div>
                </div>
                <?php
            }

            for ( $column = 0; $column < count( $fields ); $column++ ) {

                $feature_row = $fields[ $column ];

                $row_value = $this->render_table_row( $feature_row, $asin_row );

                $selected_value = $this->format_selected_value( $feature_row->get_selected_value() );

                if ( ! empty( $row_value ) ) {
                    ?>
                    <div class="hostinger-affiliate-table__cell">
                        <div class="hostinger-affiliate-table__value hostinger-affiliate-table__value--is-feature-label">
                            <?php echo $feature_row->get_name(); ?>
                        </div>
                    </div>
                    <div class="hostinger-affiliate-table__cell hostinger-affiliate-table__cell--is-product-index-<?php echo $index; ?>" <?php echo $row_style; ?>>
                        <div class="hostinger-affiliate-table__value hostinger-affiliate-table__value--is-<?php echo $selected_value; ?> hostinger-affiliate-table__value--is-<?php echo ! empty( $marketplace ) ? $marketplace : ''; ?>" <?php echo $row_style; ?>>
                            <?php echo $row_value; ?>
                        </div>
                    </div>
                    <?php
                }
            }

            ?>
        </div>
        <?php
    }
}

?>
