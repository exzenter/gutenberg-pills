<?php
/**
 * Plugin Name:       Ullmer Pill-Reihe
 * Plugin URI:        https://github.com/ullmer/ullmer-pill-row
 * Description:       Gutenberg-Block für eine Reihe abgerundeter Pills – statisch oder als endlos laufendes Laufband. Pro Pill Titel, Beschreibung und Link, dazu zweifarbige Überschrift, zehn Farben und rund 25 Regler im Editor. Standardwerte aus dem Ullmer-Redesign. Ohne npm, ohne Build-Step, serverseitig gerendert.
 * Version:           1.0.0
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Author:            Ullmer
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ullmer-pill-row
 * Domain Path:       /languages
 *
 * Dieses Plugin kommt ohne Build-Step aus: kein npm, kein Webpack, kein JSX.
 * Das Editor-JavaScript läuft direkt gegen die wp.*-Globals.
 *
 * @package UllmerPillRow
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ULLMER_PILL_ROW_VERSION', '1.0.0' );
define( 'ULLMER_PILL_ROW_DIR', plugin_dir_path( __FILE__ ) );
define( 'ULLMER_PILL_ROW_URL', plugin_dir_url( __FILE__ ) );

/**
 * Registriert Skripte, Styles und beide Blöcke.
 *
 * Weil ohne Build-Step keine *.asset.php erzeugt wird, dürfen in der block.json
 * keine "file:"-Pfade für Skripte stehen – WordPress kennt die Abhängigkeiten
 * sonst nicht. Stattdessen registrieren wir hier von Hand mit explizitem
 * Dependency-Array und referenzieren in der block.json nur die Handles.
 *
 * @return void
 */
function ullmer_pill_row_register() {

	$editor_deps = array(
		'wp-blocks',
		'wp-block-editor',
		'wp-components',
		'wp-element',
		'wp-i18n',
	);

	wp_register_style(
		'ullmer-pill-row-style',
		ULLMER_PILL_ROW_URL . 'assets/style.css',
		array(),
		ULLMER_PILL_ROW_VERSION
	);

	wp_register_style(
		'ullmer-pill-row-editor-style',
		ULLMER_PILL_ROW_URL . 'assets/editor.css',
		array( 'ullmer-pill-row-style' ),
		ULLMER_PILL_ROW_VERSION
	);

	wp_register_script(
		'ullmer-pill-row-editor',
		ULLMER_PILL_ROW_URL . 'blocks/pill-row/editor.js',
		$editor_deps,
		ULLMER_PILL_ROW_VERSION,
		true
	);

	wp_register_script(
		'ullmer-pill-editor',
		ULLMER_PILL_ROW_URL . 'blocks/pill/editor.js',
		$editor_deps,
		ULLMER_PILL_ROW_VERSION,
		true
	);

	wp_register_script(
		'ullmer-pill-row-view',
		ULLMER_PILL_ROW_URL . 'blocks/pill-row/view.js',
		array(),
		ULLMER_PILL_ROW_VERSION,
		true
	);

	wp_set_script_translations(
		'ullmer-pill-row-editor',
		'ullmer-pill-row',
		ULLMER_PILL_ROW_DIR . 'languages'
	);

	wp_set_script_translations(
		'ullmer-pill-editor',
		'ullmer-pill-row',
		ULLMER_PILL_ROW_DIR . 'languages'
	);

	register_block_type( ULLMER_PILL_ROW_DIR . 'blocks/pill-row' );
	register_block_type( ULLMER_PILL_ROW_DIR . 'blocks/pill' );
}
add_action( 'init', 'ullmer_pill_row_register' );

/**
 * Lädt die Übersetzungen für die PHP-Seite.
 *
 * @return void
 */
function ullmer_pill_row_load_textdomain() {
	load_plugin_textdomain(
		'ullmer-pill-row',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);
}
add_action( 'init', 'ullmer_pill_row_load_textdomain' );

/**
 * Baut aus den Blockattributen die CSS-Custom-Properties für den Wrapper.
 *
 * Die Namen sind identisch mit denen in editor.js und style.css – wer hier
 * etwas ändert, muss es dort ebenfalls ändern.
 *
 * @param array $a Blockattribute.
 * @return string Inline-Style-Deklarationen, bereits escaped-fähig.
 */
function ullmer_pill_row_css_vars( $a ) {

	$px = static function ( $value, $fallback ) {
		$value = ( '' === $value || null === $value ) ? $fallback : $value;
		return ( (float) $value ) . 'px';
	};

	$vars = array(
		'--ullmer-gap'                     => $px( $a['pillGap'] ?? null, 10 ),
		'--ullmer-justify'                 => $a['justify'] ?? 'center',
		'--ullmer-heading-font'            => $a['headingFontFamily'] ?? '',
		'--ullmer-heading-size'            => $px( $a['headingFontSize'] ?? null, 40 ),
		'--ullmer-heading-line-height'     => $px( $a['headingLineHeight'] ?? null, 53 ),
		'--ullmer-heading-letter-spacing'  => $px( $a['headingLetterSpacing'] ?? null, 0.8 ),
		'--ullmer-heading-accent-color'    => $a['headingAccentColor'] ?? '',
		'--ullmer-heading-base-color'      => $a['headingBaseColor'] ?? '',
		'--ullmer-heading-gap'             => $px( $a['headingGap'] ?? null, 72 ),
		'--ullmer-pill-font'               => $a['pillFontFamily'] ?? '',
		'--ullmer-pill-border-width'       => $px( $a['pillBorderWidth'] ?? null, 2 ),
		'--ullmer-pill-border-radius'      => $px( $a['pillBorderRadius'] ?? null, 100 ),
		'--ullmer-pill-padding-x'          => $px( $a['pillPaddingX'] ?? null, 72 ),
		'--ullmer-pill-padding-y'          => $px( $a['pillPaddingY'] ?? null, 52 ),
		'--ullmer-pill-title-size'         => $px( $a['pillTitleFontSize'] ?? null, 33 ),
		'--ullmer-pill-title-weight'       => (string) ( $a['pillTitleWeight'] ?? 500 ),
		'--ullmer-pill-title-transform'    => ! empty( $a['pillTitleUppercase'] ) ? 'uppercase' : 'none',
		'--ullmer-pill-desc-size'          => $px( $a['pillDescFontSize'] ?? null, 18 ),
		'--ullmer-pill-desc-line-height'   => $px( $a['pillDescLineHeight'] ?? null, 35 ),
		'--ullmer-pill-border-color'       => $a['pillBorderColor'] ?? '',
		'--ullmer-pill-bg'                 => $a['pillBackgroundColor'] ?? '',
		'--ullmer-pill-title-color'        => $a['pillTitleColor'] ?? '',
		'--ullmer-pill-desc-color'         => $a['pillDescColor'] ?? '',
		'--ullmer-pill-hover-border-color' => $a['pillHoverBorderColor'] ?? '',
		'--ullmer-pill-hover-bg'           => $a['pillHoverBackgroundColor'] ?? '',
		'--ullmer-pill-hover-title-color'  => $a['pillHoverTitleColor'] ?? '',
		'--ullmer-pill-hover-desc-color'   => $a['pillHoverDescColor'] ?? '',
	);

	$style = '';
	foreach ( $vars as $property => $value ) {
		if ( '' === $value || null === $value ) {
			continue;
		}
		$style .= $property . ':' . $value . ';';
	}

	return $style;
}
