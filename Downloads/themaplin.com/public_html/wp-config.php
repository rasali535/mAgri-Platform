<?php
define( 'WP_CACHE', true );

/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'u723774100_AHLlG' );

/** Database username */
define( 'DB_USER', 'u723774100_VGHxC' );

/** Database password */
define( 'DB_PASSWORD', 'WpMPIFh39m' );

/** Database hostname */
define( 'DB_HOST', '127.0.0.1' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          ';v`B&o/d7aXI)V@q<aP6yOvJN(gvNV(x=2ffszv&W|9TP|GG/6>kN2Y!{0{n5$GI' );
define( 'SECURE_AUTH_KEY',   ']RQeC,@~@Q&2:/:,V#5V*b5859eL]anc1GDg/vS_o}(=Q8:yUjh?w(b/~2E+w)oS' );
define( 'LOGGED_IN_KEY',     'PE&{Km~ysO9,2ceGWTVyxY@VA9~EMV!;vW8ECe/wa[MNWM>ugjpl?r4Ydsb_O0Pe' );
define( 'NONCE_KEY',         '8Ml@@+$$h4`2.EhnQ/8,AQ>r5Y!J]&4{ }gugbjPs2md?i~A6gw%KA%<tE{t?(;V' );
define( 'AUTH_SALT',         '+WC3 91Z{$WXgCztso53/112S_GZdF?0|>haynoC!{@2;J?T0.ZDa7rY;I(>?E:~' );
define( 'SECURE_AUTH_SALT',  '-ShID&@8OC/:@?G-~ua^Wqg=&(<d*x@f>9f9B{*_lb$$0-+Y2oy.d9n7p(&l$iw.' );
define( 'LOGGED_IN_SALT',    '~6P3zhclQ/u%bH>_P}$L<,;0l%1{ezI,ZozJV=fYo8^{oYxo2@KF:SRnthHT@V.0' );
define( 'NONCE_SALT',        '3JbfM~r9}6TdZ0vTA<QHgwjX n%}ee4EzyCpzZOs.{voZKcT&8)vE4R^0%LHK)tr' );
define( 'WP_CACHE_KEY_SALT', 'it^H/.UB:Ib+*=jt3Jh`BRq:*q+[Yf~Q/2(=.W@~>E>v)(pQ5SLpVFGVi_{wl{O+' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'FS_METHOD', 'direct' );
define( 'COOKIEHASH', 'eeae6d56e83b9bb490ed7bbb62cba42e' );
define( 'WP_AUTO_UPDATE_CORE', 'minor' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
