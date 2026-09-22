<?php
/**
 * Serverseitiges Rendering einer einzelnen Pill.
 *
 * Verfügbar: $attributes, $content, $block
 *
 * @package UllmerPillRow
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$ullmer_title = isset( $attributes['title'] ) ? (string) $attributes['title'] : '';
$ullmer_desc  = isset( $attributes['description'] ) ? (string) $attributes['description'] : '';
$ullmer_url   = isset( $attributes['url'] ) ? trim( (string) $attributes['url'] ) : '';

/* Leere Pills nicht ausgeben. */
if ( '' === trim( wp_strip_all_tags( $ullmer_title ) ) && '' === trim( wp_strip_all_tags( $ullmer_desc ) ) ) {
	return;
}

/* Verlinkt wird ein <a>, sonst ein <div> – niemals ein klickbares <div>. */
$ullmer_tag        = '' !== $ullmer_url ? 'a' : 'div';
$ullmer_link_attrs = '';

if ( '' !== $ullmer_url ) {
	$ullmer_link_attrs .= ' href="' . esc_url( $ullmer_url ) . '"';

	$ullmer_target = isset( $attributes['linkTarget'] ) ? trim( (string) $attributes['linkTarget'] ) : '';
	$ullmer_rel    = isset( $attributes['rel'] ) ? trim( (string) $attributes['rel'] ) : '';

	if ( '' !== $ullmer_target ) {
		$ullmer_link_attrs .= ' target="' . esc_attr( $ullmer_target ) . '"';
		if ( '' === $ullmer_rel ) {
			$ullmer_rel = 'noreferrer noopener';
		}
	}

	if ( '' !== $ullmer_rel ) {
		$ullmer_link_attrs .= ' rel="' . esc_attr( $ullmer_rel ) . '"';
	}
}

$ullmer_wrapper = get_block_wrapper_attributes();

/* Bewusst kein printf: Attributwerte dürfen ein Prozentzeichen enthalten. */
echo '<' . esc_attr( $ullmer_tag ) . ' '
	. $ullmer_wrapper // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- bereits escaped.
	. $ullmer_link_attrs // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- oben escaped.
	. '>';

if ( '' !== trim( wp_strip_all_tags( $ullmer_title ) ) ) {
	echo '<span class="ullmer-pill__title">' . wp_kses_post( $ullmer_title ) . '</span>';
}

if ( '' !== trim( wp_strip_all_tags( $ullmer_desc ) ) ) {
	echo '<span class="ullmer-pill__description">' . wp_kses_post( $ullmer_desc ) . '</span>';
}

echo '</' . esc_attr( $ullmer_tag ) . '>';
