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
	var BlockControls = blockEditor.BlockControls;
	var PanelColorSettings = blockEditor.PanelColorSettings;
	var AlignmentControl = blockEditor.AlignmentControl || blockEditor.AlignmentToolbar;

	var PanelBody = components.PanelBody;
	var TextControl = components.TextControl;
	var TextareaControl = components.TextareaControl;
	var ToggleControl = components.ToggleControl;
	var RangeControl = components.RangeControl;
	var SelectControl = components.SelectControl;
	var FontSizePicker = components.FontSizePicker;

	/* Je nach WordPress-Version stabil oder noch als __experimental exportiert. */
	var UnitControl = components.__experimentalUnitControl || components.UnitControl;
	var ToggleGroup = components.__experimentalToggleGroupControl || components.ToggleGroupControl;
	var ToggleGroupOption = components.__experimentalToggleGroupControlOption || components.ToggleGroupControlOption;

	var ALLOWED_BLOCKS = [ 'ullmer/pill' ];

	/* Einheiten, die in jedem Maß-Feld zur Auswahl stehen. */
	var UNITS = [
		{ value: 'px', label: 'px', default: 0 },
		{ value: 'rem', label: 'rem', default: 0 },
		{ value: 'em', label: 'em', default: 0 },
		{ value: 'vw', label: 'vw', default: 0 },
		{ value: 'vh', label: 'vh', default: 0 },
		{ value: '%', label: '%', default: 0 }
	];

	var TEMPLATE = [
		[ 'ullmer/pill', { title: 'Mietwäsche-Sortiment' } ],
		[ 'ullmer/pill', { title: 'Mietberufsbekleidung' } ],
		[ 'ullmer/pill', { title: 'Stationswäsche' } ],
		[ 'ullmer/pill', { title: 'Logistik' } ],
		[ 'ullmer/pill', { title: 'Pro Persona' } ]
	];

	/**
	 * Macht aus einem Attributwert eine CSS-Länge.
	 * Version 1.0 speicherte blanke Zahlen – die gelten weiterhin als Pixel.
	 *
	 * @param {*} value Attributwert.
	 * @return {string} Länge mit Einheit.
	 */
	function toLength( value ) {
		if ( value === null || value === undefined || value === '' ) {
			return '';
		}
		if ( typeof value === 'number' ) {
			return value + 'px';
		}
		return String( value );
	}

	/**
	 * Liefert die Schriftgrößen-Presets des Themes (Small, Medium, Large …).
	 *
	 * @return {Array} Preset-Liste, notfalls leer.
	 */
	function useThemeFontSizes() {
		var raw = null;

		if ( typeof blockEditor.useSettings === 'function' ) {
			var result = blockEditor.useSettings( 'typography.fontSizes' );
			raw = result && result[ 0 ];
		} else if ( typeof blockEditor.useSetting === 'function' ) {
			raw = blockEditor.useSetting( 'typography.fontSizes' );
		}

		if ( ! raw ) {
			return [];
		}
		if ( Array.isArray( raw ) ) {
			return raw;
		}

		/* Manche Themes liefern nach Herkunft gruppiert: theme, default, custom. */
		return [].concat( raw.theme || [], raw[ 'default' ] || [], raw.custom || [] );
	}

	/**
	 * Übersetzt die Attribute in CSS-Custom-Properties.
	 * Muss synchron zu ullmer_pill_row_css_vars() in der PHP-Datei bleiben.
	 *
	 * @param {Object} a Blockattribute.
	 * @return {Object} Style-Objekt für den Wrapper.
	 */
	function cssVars( a ) {
		var vars = {
			'--ullmer-gap': toLength( a.pillGap ),
			'--ullmer-justify': a.justify,
			'--ullmer-heading-font': a.headingFontFamily,
			'--ullmer-heading-size': toLength( a.headingFontSize ),
			'--ullmer-heading-line-height': toLength( a.headingLineHeight ),
			'--ullmer-heading-letter-spacing': toLength( a.headingLetterSpacing ),
			'--ullmer-heading-accent-color': a.headingAccentColor,
			'--ullmer-heading-base-color': a.headingBaseColor,
			'--ullmer-heading-gap': toLength( a.headingGap ),
			'--ullmer-pill-font': a.pillFontFamily,
			'--ullmer-pill-border-width': toLength( a.pillBorderWidth ),
			'--ullmer-pill-border-radius': toLength( a.pillBorderRadius ),
			'--ullmer-pill-padding-x': toLength( a.pillPaddingX ),
			'--ullmer-pill-padding-y': toLength( a.pillPaddingY ),
			'--ullmer-pill-title-size': toLength( a.pillTitleFontSize ),
			'--ullmer-pill-title-weight': a.pillTitleWeight,
			'--ullmer-pill-title-transform': a.pillTitleUppercase ? 'uppercase' : 'none',
			'--ullmer-pill-desc-size': toLength( a.pillDescFontSize ),
			'--ullmer-pill-desc-line-height': toLength( a.pillDescLineHeight ),
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
			var isStacked = a.layout === 'stacked';
			var themeFontSizes = useThemeFontSizes();

			/**
			 * Maß-Feld: Zahleneingabe plus Einheiten-Auswahl, wie in den Core-Blöcken.
			 *
			 * @param {string} label Beschriftung.
			 * @param {string} key   Attributname.
			 * @return {Object} Element.
			 */
			function dimension( label, key ) {
				return el( UnitControl, {
					key: key,
					label: label,
					value: toLength( a[ key ] ),
					units: UNITS,
					min: 0,
					size: '__unstable-large',
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					onChange: function ( value ) {
						var patch = {};
						patch[ key ] = ( value === undefined || value === null ) ? '' : String( value );
						set( patch );
					}
				} );
			}

			/**
			 * Schriftgrößen-Feld mit den Theme-Presets (S/M/L/XL) plus freier Eingabe
			 * samt Einheiten-Auswahl.
			 *
			 * @param {string} label Beschriftung.
			 * @param {string} key   Attributname.
			 * @return {Object} Element.
			 */
			function fontSize( label, key ) {
				if ( ! FontSizePicker ) {
					return dimension( label, key );
				}
				return el( 'div', { key: key, className: 'ullmer-font-size-field' },
					el( FontSizePicker, {
						label: label,
						fontSizes: themeFontSizes,
						value: toLength( a[ key ] ),
						units: [ 'px', 'rem', 'em', 'vw', 'vh', '%' ],
						withSlider: false,
						withReset: true,
						size: '__unstable-large',
						__nextHasNoMarginBottom: true,
						onChange: function ( value ) {
							var patch = {};
							patch[ key ] = ( value === undefined || value === null ) ? '' : String( value );
							set( patch );
						}
					} )
				);
			}

			var blockProps = useBlockProps( {
				className: 'ullmer-pill-row--' + a.layout + ( a.responsiveScaling ? ' is-responsive' : '' ),
				style: cssVars( a )
			} );

			var innerBlocksProps = useInnerBlocksProps(
				{ className: 'ullmer-pill-row__track' },
				{
					allowedBlocks: ALLOWED_BLOCKS,
					template: TEMPLATE,
					orientation: isStacked ? 'vertical' : 'horizontal',
					templateLock: false
				}
			);

			/* --- Werkzeugleiste: Ausrichtung -------------------------------- */

			var alignToJustify = { left: 'flex-start', center: 'center', right: 'flex-end' };
			var justifyToAlign = { 'flex-start': 'left', center: 'center', 'flex-end': 'right' };

			var toolbar = AlignmentControl ? el( BlockControls, { group: 'block' },
				el( AlignmentControl, {
					value: justifyToAlign[ a.justify ] || 'center',
					onChange: function ( value ) {
						set( { justify: alignToJustify[ value ] || 'center' } );
					}
				} )
			) : null;

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
					fontSize( __( 'Schriftgröße', 'ullmer-pill-row' ), 'headingFontSize' ),
					dimension( __( 'Zeilenhöhe', 'ullmer-pill-row' ), 'headingLineHeight' ),
					dimension( __( 'Laufweite', 'ullmer-pill-row' ), 'headingLetterSpacing' ),
					dimension( __( 'Abstand zu den Pills', 'ullmer-pill-row' ), 'headingGap' )
				)
			);

			/* --- Sidebar: Darstellung --------------------------------------- */

			var layoutOptions = [
				{ label: __( 'Untereinander', 'ullmer-pill-row' ), value: 'stacked' },
				{ label: __( 'Nebeneinander', 'ullmer-pill-row' ), value: 'static' },
				{ label: __( 'Laufband', 'ullmer-pill-row' ), value: 'marquee' }
			];

			var layoutControl;
			if ( ToggleGroup && ToggleGroupOption ) {
				layoutControl = el( ToggleGroup, {
					label: __( 'Modus', 'ullmer-pill-row' ),
					value: a.layout,
					isBlock: true,
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					onChange: function ( value ) { set( { layout: value } ); }
				}, layoutOptions.map( function ( o ) {
					return el( ToggleGroupOption, { key: o.value, value: o.value, label: o.label } );
				} ) );
			} else {
				layoutControl = el( SelectControl, {
					label: __( 'Modus', 'ullmer-pill-row' ),
					value: a.layout,
					options: layoutOptions,
					onChange: function ( value ) { set( { layout: value } ); }
				} );
			}

			var alignOptions = [
				{ label: __( 'Links', 'ullmer-pill-row' ), value: 'flex-start' },
				{ label: __( 'Zentriert', 'ullmer-pill-row' ), value: 'center' },
				{ label: __( 'Rechts', 'ullmer-pill-row' ), value: 'flex-end' }
			];
			if ( ! isStacked ) {
				alignOptions.push( { label: __( 'Gleichmäßig verteilt', 'ullmer-pill-row' ), value: 'space-between' } );
			}

			var layoutPanel = el( PanelBody, {
				title: __( 'Darstellung', 'ullmer-pill-row' ),
				initialOpen: false
			},
				layoutControl,
				! isMarquee && el( SelectControl, {
					label: __( 'Ausrichtung', 'ullmer-pill-row' ),
					value: a.justify,
					options: alignOptions,
					onChange: function ( value ) { set( { justify: value } ); }
				} ),
				el( ToggleControl, {
					label: __( 'Auf kleinen Bildschirmen verkleinern', 'ullmer-pill-row' ),
					help: __( 'Skaliert Schrift, Innenabstände, Abstand und Radius stufenweise herunter.', 'ullmer-pill-row' ),
					checked: !! a.responsiveScaling,
					onChange: function ( value ) { set( { responsiveScaling: value } ); }
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
						__next40pxDefaultSize: true,
						__nextHasNoMarginBottom: true,
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
				dimension( __( 'Abstand zwischen Pills', 'ullmer-pill-row' ), 'pillGap' ),
				dimension( __( 'Rahmenstärke', 'ullmer-pill-row' ), 'pillBorderWidth' ),
				dimension( __( 'Eckenradius', 'ullmer-pill-row' ), 'pillBorderRadius' ),
				dimension( __( 'Innenabstand horizontal', 'ullmer-pill-row' ), 'pillPaddingX' ),
				dimension( __( 'Innenabstand vertikal', 'ullmer-pill-row' ), 'pillPaddingY' ),
				fontSize( __( 'Titel – Schriftgröße', 'ullmer-pill-row' ), 'pillTitleFontSize' ),
				el( RangeControl, {
					label: __( 'Titel – Schriftstärke', 'ullmer-pill-row' ),
					value: a.pillTitleWeight, min: 100, max: 900, step: 100,
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
					onChange: function ( value ) { set( { pillTitleWeight: value } ); }
				} ),
				el( ToggleControl, {
					label: __( 'Titel in Großbuchstaben', 'ullmer-pill-row' ),
					checked: !! a.pillTitleUppercase,
					onChange: function ( value ) { set( { pillTitleUppercase: value } ); }
				} ),
				fontSize( __( 'Beschreibung – Schriftgröße', 'ullmer-pill-row' ), 'pillDescFontSize' ),
				dimension( __( 'Beschreibung – Zeilenhöhe', 'ullmer-pill-row' ), 'pillDescLineHeight' )
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
				toolbar,
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
