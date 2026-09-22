<?php
/**
 * Serverseitiges Rendering der Pill-Reihe.
 *
 * Verfügbar: $attributes, $content, $block
 *
 * @package UllmerPillRow
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* Ohne Pills gibt es nichts auszugeben. */
if ( '' === trim( (string) $content ) ) {
	return;
}

$ullmer_layout = isset( $attributes['layout'] ) ? (string) $attributes['layout'] : 'marquee';
if ( ! in_array( $ullmer_layout, array( 'static', 'marquee', 'stacked' ), true ) ) {
	$ullmer_layout = 'marquee';
}

$ullmer_autoplay  = ! empty( $attributes['autoplay'] );
$ullmer_pause     = ! empty( $attributes['pauseOnHover'] );
$ullmer_speed     = isset( $attributes['marqueeSpeed'] ) ? (float) $attributes['marqueeSpeed'] : 40;
$ullmer_direction = ( isset( $attributes['marqueeDirection'] ) && 'right' === $attributes['marqueeDirection'] ) ? 'right' : 'left';

$ullmer_classes = array( 'ullmer-pill-row--' . $ullmer_layout );

if ( 'marquee' === $ullmer_layout && $ullmer_autoplay ) {
	$ullmer_classes[] = 'is-autoplay';
}

/* Ohne diese Klasse greifen die Breakpoint-Regeln nicht. */
if ( ! isset( $attributes['responsiveScaling'] ) || ! empty( $attributes['responsiveScaling'] ) ) {
	$ullmer_classes[] = 'is-responsive';
}

$ullmer_wrapper = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $ullmer_classes ),
		'style' => ullmer_pill_row_css_vars( $attributes ),
	)
);

/* --- Überschrift ------------------------------------------------------- */

$ullmer_heading = '';
$ullmer_part1   = isset( $attributes['headingPart1'] ) ? trim( (string) $attributes['headingPart1'] ) : '';
$ullmer_part2   = isset( $attributes['headingPart2'] ) ? trim( (string) $attributes['headingPart2'] ) : '';

if ( ! empty( $attributes['showHeading'] ) && ( '' !== $ullmer_part1 || '' !== $ullmer_part2 ) ) {

	$ullmer_emphasize_first = ! empty( $attributes['headingFirstEmphasized'] );
	$ullmer_class1 = $ullmer_emphasize_first ? 'ullmer-pill-row__heading-em' : 'ullmer-pill-row__heading-base';
	$ullmer_class2 = $ullmer_emphasize_first ? 'ullmer-pill-row__heading-base' : 'ullmer-pill-row__heading-em';

	$ullmer_spans = array();
	if ( '' !== $ullmer_part1 ) {
		$ullmer_spans[] = '<span class="' . esc_attr( $ullmer_class1 ) . '">' . esc_html( $ullmer_part1 ) . '</span>';
	}
	if ( '' !== $ullmer_part2 ) {
		$ullmer_spans[] = '<span class="' . esc_attr( $ullmer_class2 ) . '">' . esc_html( $ullmer_part2 ) . '</span>';
	}

	$ullmer_heading = '<p class="ullmer-pill-row__heading">' . implode( ' ', $ullmer_spans ) . '</p>';
}
?>
<div <?php echo $ullmer_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- bereits escaped. ?>>
	<?php echo $ullmer_heading; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- oben escaped. ?>
	<div
		class="ullmer-pill-row__viewport"
		data-layout="<?php echo esc_attr( $ullmer_layout ); ?>"
		data-autoplay="<?php echo $ullmer_autoplay ? '1' : '0'; ?>"
		data-speed="<?php echo esc_attr( (string) $ullmer_speed ); ?>"
		data-direction="<?php echo esc_attr( $ullmer_direction ); ?>"
		data-pause-on-hover="<?php echo $ullmer_pause ? '1' : '0'; ?>"
	>
		<div class="ullmer-pill-row__track">
			<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- gerenderte InnerBlocks. ?>
		</div>
	</div>
</div>
