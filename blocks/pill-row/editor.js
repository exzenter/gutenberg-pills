/**
 * Ullmer Pill-Reihe – Editor-Skript für den Parent-Block.
 *
 * Bewusst ohne JSX und ohne Build-Step: alles läuft über
 * wp.element.createElement gegen die wp.*-Globals.
 */
( function ( blocks, blockEditor, components, element, i18n ) {
	'use strict';

	var el = element.createElement;
	var Fragment = element.Fragment;
	var __ = i18n.__;

	var useBlockProps = blockEditor.useBlockProps;
	var useInnerBlocksProps = blockEditor.useInnerBlocksProps;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelColorSettings = blockEditor.PanelColorSettings;

	var PanelBody = components.PanelBody;
	var TextControl = components.TextControl;
	var TextareaControl = components.TextareaControl;
	var ToggleControl = components.ToggleControl;
	var RangeControl = components.RangeControl;
	var SelectControl = components.SelectControl;

	var ALLOWED_BLOCKS = [ 'ullmer/pill' ];

	/* Vorbelegung eines frisch eingefügten Blocks – die Leistungen aus dem Redesign. */
	var TEMPLATE = [
		[ 'ullmer/pill', { title: 'Mietwäsche-Sortiment' } ],
		[ 'ullmer/pill', { title: 'Mietberufsbekleidung' } ],
		[ 'ullmer/pill', { title: 'Stationswäsche' } ],
		[ 'ullmer/pill', { title: 'Logistik' } ],
		[ 'ullmer/pill', { title: 'Pro Persona' } ]
	];

	/**
	 * Übersetzt die Attribute in CSS-Custom-Properties.
	 * Muss synchron zu ullmer_pill_row_css_vars() in der PHP-Datei bleiben.
	 *
	 * @param {Object} a Blockattribute.
	 * @return {Object} Style-Objekt für den Wrapper.
	 */
	function cssVars( a ) {
		var px = function ( value ) {
			return ( value === '' || value === null || value === undefined )
				? null
				: parseFloat( value ) + 'px';
		};

		var vars = {
			'--ullmer-gap': px( a.pillGap ),
			'--ullmer-justify': a.justify,
			'--ullmer-heading-font': a.headingFontFamily,
			'--ullmer-heading-size': px( a.headingFontSize ),
			'--ullmer-heading-line-height': px( a.headingLineHeight ),
			'--ullmer-heading-letter-spacing': px( a.headingLetterSpacing ),
			'--ullmer-heading-accent-color': a.headingAccentColor,
			'--ullmer-heading-base-color': a.headingBaseColor,
			'--ullmer-heading-gap': px( a.headingGap ),
			'--ullmer-pill-font': a.pillFontFamily,
			'--ullmer-pill-border-width': px( a.pillBorderWidth ),
			'--ullmer-pill-border-radius': px( a.pillBorderRadius ),
			'--ullmer-pill-padding-x': px( a.pillPaddingX ),
			'--ullmer-pill-padding-y': px( a.pillPaddingY ),
			'--ullmer-pill-title-size': px( a.pillTitleFontSize ),
			'--ullmer-pill-title-weight': a.pillTitleWeight,
			'--ullmer-pill-title-transform': a.pillTitleUppercase ? 'uppercase' : 'none',
			'--ullmer-pill-desc-size': px( a.pillDescFontSize ),
			'--ullmer-pill-desc-line-height': px( a.pillDescLineHeight ),
			'--ullmer-pill-border-color': a.pillBorderColor,
			'--ullmer-pill-bg': a.pillBackgroundColor,
			'--ullmer-pill-title-color': a.pillTitleColor,
			'--ullmer-pill-desc-color': a.pillDescColor,
			'--ullmer-pill-hover-border-color': a.pillHoverBorderColor,
			'--ullmer-pill-hover-bg': a.pillHoverBackgroundColor,
			'--ullmer-pill-hover-title-color': a.pillHoverTitleColor,
			'--ullmer-pill-hover-desc-color': a.pillHoverDescColor
		};

		var style = {};
		Object.keys( vars ).forEach( function ( key ) {
			if ( vars[ key ] !== null && vars[ key ] !== undefined && vars[ key ] !== '' ) {
				style[ key ] = vars[ key ];
			}
		} );

		return style;
	}

	blocks.registerBlockType( 'ullmer/pill-row', {

		edit: function ( props ) {
			var a = props.attributes;
			var set = props.setAttributes;
			var isMarquee = a.layout === 'marquee';

			var blockProps = useBlockProps( {
				className: 'ullmer-pill-row--' + a.layout,
				style: cssVars( a )
			} );

			var innerBlocksProps = useInnerBlocksProps(
				{ className: 'ullmer-pill-row__track' },
				{
					allowedBlocks: ALLOWED_BLOCKS,
					template: TEMPLATE,
					orientation: 'horizontal',
					templateLock: false
				}
			);

			/* --- Sidebar: Überschrift --------------------------------------- */

			var headingPanel = el( PanelBody, {
				title: __( 'Überschrift', 'ullmer-pill-row' ),
				initialOpen: true
			},
				el( ToggleControl, {
					label: __( 'Überschrift anzeigen', 'ullmer-pill-row' ),
					checked: !! a.showHeading,
					onChange: function ( value ) { set( { showHeading: value } ); }
				} ),
				a.showHeading && el( Fragment, null,
					el( TextControl, {
						label: __( 'Teil 1', 'ullmer-pill-row' ),
						value: a.headingPart1,
						onChange: function ( value ) { set( { headingPart1: value } ); }
					} ),
					el( TextControl, {
						label: __( 'Teil 2', 'ullmer-pill-row' ),
						value: a.headingPart2,
						onChange: function ( value ) { set( { headingPart2: value } ); }
					} ),
					el( ToggleControl, {
						label: __( 'Teil 1 kursiv hervorheben', 'ullmer-pill-row' ),
						help: a.headingFirstEmphasized
							? __( 'Teil 1 kursiv in Akzentfarbe, Teil 2 in Grundfarbe.', 'ullmer-pill-row' )
							: __( 'Teil 1 in Grundfarbe, Teil 2 kursiv in Akzentfarbe.', 'ullmer-pill-row' ),
						checked: !! a.headingFirstEmphasized,
						onChange: function ( value ) { set( { headingFirstEmphasized: value } ); }
					} ),
					el( TextareaControl, {
						label: __( 'Schriftfamilie', 'ullmer-pill-row' ),
						help: __( 'Das Plugin lädt keine Schriften – die kommen aus dem Theme.', 'ullmer-pill-row' ),
						value: a.headingFontFamily,
						rows: 2,
						onChange: function ( value ) { set( { headingFontFamily: value } ); }
					} ),
					el( RangeControl, {
						label: __( 'Schriftgröße (px)', 'ullmer-pill-row' ),
						value: a.headingFontSize, min: 14, max: 96,
						onChange: function ( value ) { set( { headingFontSize: value } ); }
					} ),
					el( RangeControl, {
						label: __( 'Zeilenhöhe (px)', 'ullmer-pill-row' ),
						value: a.headingLineHeight, min: 16, max: 120,
						onChange: function ( value ) { set( { headingLineHeight: value } ); }
					} ),
					el( RangeControl, {
						label: __( 'Laufweite (px)', 'ullmer-pill-row' ),
						value: a.headingLetterSpacing, min: -2, max: 8, step: 0.1,
						onChange: function ( value ) { set( { headingLetterSpacing: value } ); }
					} ),
					el( RangeControl, {
						label: __( 'Abstand zu den Pills (px)', 'ullmer-pill-row' ),
						value: a.headingGap, min: 0, max: 160,
						onChange: function ( value ) { set( { headingGap: value } ); }
					} )
				)
			);

			/* --- Sidebar: Darstellung --------------------------------------- */

			var layoutPanel = el( PanelBody, {
				title: __( 'Darstellung', 'ullmer-pill-row' ),
				initialOpen: false
			},
				el( SelectControl, {
					label: __( 'Modus', 'ullmer-pill-row' ),
					value: a.layout,
					options: [
						{ label: __( 'Statisch (bricht um)', 'ullmer-pill-row' ), value: 'static' },
						{ label: __( 'Laufband', 'ullmer-pill-row' ), value: 'marquee' }
					],
					onChange: function ( value ) { set( { layout: value } ); }
				} ),
				a.layout === 'static' && el( SelectControl, {
					label: __( 'Ausrichtung', 'ullmer-pill-row' ),
					value: a.justify,
					options: [
						{ label: __( 'Zentriert', 'ullmer-pill-row' ), value: 'center' },
						{ label: __( 'Links', 'ullmer-pill-row' ), value: 'flex-start' },
						{ label: __( 'Rechts', 'ullmer-pill-row' ), value: 'flex-end' },
						{ label: __( 'Gleichmäßig verteilt', 'ullmer-pill-row' ), value: 'space-between' }
					],
					onChange: function ( value ) { set( { justify: value } ); }
				} ),
				isMarquee && el( Fragment, null,
					el( ToggleControl, {
						label: __( 'Automatisch laufen lassen', 'ullmer-pill-row' ),
						help: a.autoplay
							? __( 'Läuft endlos. Wer reduzierte Bewegung eingestellt hat, sieht stattdessen ein scrollbares Laufband.', 'ullmer-pill-row' )
							: __( 'Steht still und lässt sich per Maus, Finger oder Tastatur scrollen.', 'ullmer-pill-row' ),
						checked: !! a.autoplay,
						onChange: function ( value ) { set( { autoplay: value } ); }
					} ),
					a.autoplay && el( RangeControl, {
						label: __( 'Geschwindigkeit (px/s)', 'ullmer-pill-row' ),
						value: a.marqueeSpeed, min: 5, max: 200,
						onChange: function ( value ) { set( { marqueeSpeed: value } ); }
					} ),
					a.autoplay && el( SelectControl, {
						label: __( 'Laufrichtung', 'ullmer-pill-row' ),
						value: a.marqueeDirection,
						options: [
							{ label: __( 'Nach links', 'ullmer-pill-row' ), value: 'left' },
							{ label: __( 'Nach rechts', 'ullmer-pill-row' ), value: 'right' }
						],
						onChange: function ( value ) { set( { marqueeDirection: value } ); }
					} ),
					a.autoplay && el( ToggleControl, {
						label: __( 'Bei Mauszeiger pausieren', 'ullmer-pill-row' ),
						checked: !! a.pauseOnHover,
						onChange: function ( value ) { set( { pauseOnHover: value } ); }
					} )
				)
			);

			/* --- Sidebar: Pills --------------------------------------------- */

			var pillPanel = el( PanelBody, {
				title: __( 'Pills', 'ullmer-pill-row' ),
				initialOpen: false
			},
				el( TextareaControl, {
					label: __( 'Schriftfamilie', 'ullmer-pill-row' ),
					value: a.pillFontFamily,
					rows: 2,
					onChange: function ( value ) { set( { pillFontFamily: value } ); }
				} ),
				el( RangeControl, {
					label: __( 'Abstand zwischen Pills (px)', 'ullmer-pill-row' ),
					value: a.pillGap, min: 0, max: 80,
					onChange: function ( value ) { set( { pillGap: value } ); }
				} ),
				el( RangeControl, {
					label: __( 'Rahmenstärke (px)', 'ullmer-pill-row' ),
					value: a.pillBorderWidth, min: 0, max: 12,
					onChange: function ( value ) { set( { pillBorderWidth: value } ); }
				} ),
				el( RangeControl, {
					label: __( 'Eckenradius (px)', 'ullmer-pill-row' ),
					value: a.pillBorderRadius, min: 0, max: 200,
					onChange: function ( value ) { set( { pillBorderRadius: value } ); }
				} ),
				el( RangeControl, {
					label: __( 'Innenabstand horizontal (px)', 'ullmer-pill-row' ),
					value: a.pillPaddingX, min: 0, max: 200,
					onChange: function ( value ) { set( { pillPaddingX: value } ); }
				} ),
				el( RangeControl, {
					label: __( 'Innenabstand vertikal (px)', 'ullmer-pill-row' ),
					value: a.pillPaddingY, min: 0, max: 160,
					onChange: function ( value ) { set( { pillPaddingY: value } ); }
				} ),
				el( RangeControl, {
					label: __( 'Titel – Schriftgröße (px)', 'ullmer-pill-row' ),
					value: a.pillTitleFontSize, min: 10, max: 72,
					onChange: function ( value ) { set( { pillTitleFontSize: value } ); }
				} ),
				el( RangeControl, {
					label: __( 'Titel – Schriftstärke', 'ullmer-pill-row' ),
					value: a.pillTitleWeight, min: 100, max: 900, step: 100,
					onChange: function ( value ) { set( { pillTitleWeight: value } ); }
				} ),
				el( ToggleControl, {
					label: __( 'Titel in Großbuchstaben', 'ullmer-pill-row' ),
					checked: !! a.pillTitleUppercase,
					onChange: function ( value ) { set( { pillTitleUppercase: value } ); }
				} ),
				el( RangeControl, {
					label: __( 'Beschreibung – Schriftgröße (px)', 'ullmer-pill-row' ),
					value: a.pillDescFontSize, min: 8, max: 48,
					onChange: function ( value ) { set( { pillDescFontSize: value } ); }
				} ),
				el( RangeControl, {
					label: __( 'Beschreibung – Zeilenhöhe (px)', 'ullmer-pill-row' ),
					value: a.pillDescLineHeight, min: 10, max: 80,
					onChange: function ( value ) { set( { pillDescLineHeight: value } ); }
				} )
			);

			/* --- Sidebar: Farben -------------------------------------------- */

			var colorPanel = el( PanelColorSettings, {
				title: __( 'Farben', 'ullmer-pill-row' ),
				initialOpen: false,
				colorSettings: [
					{
						label: __( 'Überschrift – Akzent', 'ullmer-pill-row' ),
						value: a.headingAccentColor,
						onChange: function ( value ) { set( { headingAccentColor: value } ); }
					},
					{
						label: __( 'Überschrift – Grundfarbe', 'ullmer-pill-row' ),
						value: a.headingBaseColor,
						onChange: function ( value ) { set( { headingBaseColor: value } ); }
					},
					{
						label: __( 'Pill – Rahmen', 'ullmer-pill-row' ),
						value: a.pillBorderColor,
						onChange: function ( value ) { set( { pillBorderColor: value } ); }
					},
					{
						label: __( 'Pill – Hintergrund', 'ullmer-pill-row' ),
						value: a.pillBackgroundColor,
						onChange: function ( value ) { set( { pillBackgroundColor: value } ); }
					},
					{
						label: __( 'Pill – Titel', 'ullmer-pill-row' ),
						value: a.pillTitleColor,
						onChange: function ( value ) { set( { pillTitleColor: value } ); }
					},
					{
						label: __( 'Pill – Beschreibung', 'ullmer-pill-row' ),
						value: a.pillDescColor,
						onChange: function ( value ) { set( { pillDescColor: value } ); }
					},
					{
						label: __( 'Hover – Rahmen', 'ullmer-pill-row' ),
						value: a.pillHoverBorderColor,
						onChange: function ( value ) { set( { pillHoverBorderColor: value } ); }
					},
					{
						label: __( 'Hover – Hintergrund', 'ullmer-pill-row' ),
						value: a.pillHoverBackgroundColor,
						onChange: function ( value ) { set( { pillHoverBackgroundColor: value } ); }
					},
					{
						label: __( 'Hover – Titel', 'ullmer-pill-row' ),
						value: a.pillHoverTitleColor,
						onChange: function ( value ) { set( { pillHoverTitleColor: value } ); }
					},
					{
						label: __( 'Hover – Beschreibung', 'ullmer-pill-row' ),
						value: a.pillHoverDescColor,
						onChange: function ( value ) { set( { pillHoverDescColor: value } ); }
					}
				]
			} );

			/* --- Überschrift im Canvas -------------------------------------- */

			var heading = null;
			if ( a.showHeading && ( a.headingPart1 || a.headingPart2 ) ) {
				var class1 = a.headingFirstEmphasized
					? 'ullmer-pill-row__heading-em'
					: 'ullmer-pill-row__heading-base';
				var class2 = a.headingFirstEmphasized
					? 'ullmer-pill-row__heading-base'
					: 'ullmer-pill-row__heading-em';

				heading = el( 'p', { className: 'ullmer-pill-row__heading' },
					a.headingPart1 && el( 'span', { className: class1 }, a.headingPart1 ),
					( a.headingPart1 && a.headingPart2 ) ? ' ' : null,
					a.headingPart2 && el( 'span', { className: class2 }, a.headingPart2 )
				);
			}

			var note = isMarquee
				? el( 'p', { className: 'ullmer-pill-row__editor-note' },
					a.autoplay
						? __( 'Laufband – die Bewegung ist nur im Frontend sichtbar.', 'ullmer-pill-row' )
						: __( 'Laufband ohne Autoplay – im Frontend manuell scrollbar.', 'ullmer-pill-row' )
				)
				: null;

			return el( Fragment, null,
				el( InspectorControls, null, headingPanel, layoutPanel, pillPanel, colorPanel ),
				el( 'div', blockProps,
					heading,
					el( 'div', { className: 'ullmer-pill-row__viewport' },
						el( 'div', innerBlocksProps )
					),
					note
				)
			);
		},

		/*
		 * Gerendert wird serverseitig (render.php) – gespeichert werden muss
		 * hier aber trotzdem InnerBlocks.Content, sonst serialisiert Gutenberg
		 * die Pills gar nicht erst und sie sind nach dem Speichern weg.
		 * Der Wrapper kommt aus render.php, deshalb hier kein useInnerBlocksProps.save().
		 */
		save: function () {
			return el( blockEditor.InnerBlocks.Content );
		}
	} );

} )(
	window.wp.blocks,
	window.wp.blockEditor,
	window.wp.components,
	window.wp.element,
	window.wp.i18n
);
