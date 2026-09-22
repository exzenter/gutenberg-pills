<?php
/**
 * Plugin Name:       Ullmer Pill-Reihe
 * Plugin URI:        https://github.com/exzenter/gutenberg-pills
 * Description:       Gutenberg-Block für eine Reihe abgerundeter Pills – statisch oder als endlos laufendes Laufband. Pro Pill Titel, Beschreibung und Link, dazu zweifarbige Überschrift, zehn Farben und rund 25 Regler im Editor. Standardwerte aus dem Ullmer-Redesign. Ohne npm, ohne Build-Step, serverseitig gerendert.
 * Version:           1.1.0
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Author:            exzent
 * Author URI:        https://exzent.de/
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

define( 'ULLMER_PILL_ROW_VERSION', '1.1.0' );
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
 * Normalisiert einen Maßwert zu einer CSS-Länge.
 *
 * Akzeptiert Zahlen (werden als Pixel interpretiert, so lagen die Werte in
 * Version 1.0 vor) und fertige Strings mit Einheit ("2rem", "4vw", "50%").
 *
 * @param mixed $value    Wert aus den Blockattributen.
 * @param mixed $fallback Standardwert, falls nichts gesetzt ist.
 * @return string CSS-Länge inklusive Einheit.
 */
function ullmer_pill_row_length( $value, $fallback ) {
	if ( null === $value || '' === $value ) {
		$value = $fallback;
	}
	if ( is_numeric( $value ) ) {
		return $value . 'px';
	}
	return trim( (string) $value );
}

/**
 * Baut aus den Blockattributen die CSS-Custom-Properties für den Wrapper.
 *
 * Die Namen sind identisch mit denen in editor.js und style.css – wer hier
 * etwas ändert, muss es dort ebenfalls ändern.
 *
 * @param array $a Blockattribute.
 * @return string Inline-Style-Deklarationen.
 */
function ullmer_pill_row_css_vars( $a ) {

	$len = 'ullmer_pill_row_length';

	$vars = array(
		'--ullmer-gap'                     => $len( $a['pillGap'] ?? null, '10px' ),
		'--ullmer-justify'                 => $a['justify'] ?? 'center',
		'--ullmer-heading-font'            => $a['headingFontFamily'] ?? '',
		'--ullmer-heading-size'            => $len( $a['headingFontSize'] ?? null, '40px' ),
		'--ullmer-heading-line-height'     => $len( $a['headingLineHeight'] ?? null, '53px' ),
		'--ullmer-heading-letter-spacing'  => $len( $a['headingLetterSpacing'] ?? null, '0.8px' ),
		'--ullmer-heading-accent-color'    => $a['headingAccentColor'] ?? '',
		'--ullmer-heading-base-color'      => $a['headingBaseColor'] ?? '',
		'--ullmer-heading-gap'             => $len( $a['headingGap'] ?? null, '72px' ),
		'--ullmer-pill-font'               => $a['pillFontFamily'] ?? '',
		'--ullmer-pill-border-width'       => $len( $a['pillBorderWidth'] ?? null, '2px' ),
		'--ullmer-pill-border-radius'      => $len( $a['pillBorderRadius'] ?? null, '100px' ),
		'--ullmer-pill-padding-x'          => $len( $a['pillPaddingX'] ?? null, '72px' ),
		'--ullmer-pill-padding-y'          => $len( $a['pillPaddingY'] ?? null, '52px' ),
		'--ullmer-pill-title-size'         => $len( $a['pillTitleFontSize'] ?? null, '33px' ),
		'--ullmer-pill-title-weight'       => (string) ( $a['pillTitleWeight'] ?? 500 ),
		'--ullmer-pill-title-transform'    => ! empty( $a['pillTitleUppercase'] ) ? 'uppercase' : 'none',
		'--ullmer-pill-desc-size'          => $len( $a['pillDescFontSize'] ?? null, '18px' ),
		'--ullmer-pill-desc-line-height'   => $len( $a['pillDescLineHeight'] ?? null, '35px' ),
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
