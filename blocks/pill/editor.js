/**
 * Ullmer Pill-Reihe – Editor-Skript für die einzelne Pill.
 *
 * Titel und Beschreibung werden direkt im Canvas bearbeitet (RichText),
 * Link und eigene Farben liegen in der Seitenleiste.
 */
( function ( blocks, blockEditor, components, element, i18n ) {
	'use strict';

	var el = element.createElement;
	var Fragment = element.Fragment;
	var __ = i18n.__;

	var useBlockProps = blockEditor.useBlockProps;
	var RichText = blockEditor.RichText;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelColorSettings = blockEditor.PanelColorSettings;

	var PanelBody = components.PanelBody;
	var TextControl = components.TextControl;
	var ToggleControl = components.ToggleControl;
	var Button = components.Button;

	/*
	 * Attribut dieser Pill -> Custom Property.
	 *
	 * Es sind dieselben Namen, die der Container setzt. Auf dem Element selbst
	 * gesetzt überschreiben sie den geerbten Wert – ohne eine einzige zusätzliche
	 * CSS-Regel. Leer gelassen erbt die Pill weiter von der Reihe.
	 * Muss synchron zu $ullmer_color_map in render.php bleiben.
	 */
	var COLOR_MAP = [
		[ 'borderColor', '--ullmer-pill-border-color' ],
		[ 'backgroundColor', '--ullmer-pill-bg' ],
		[ 'titleColor', '--ullmer-pill-title-color' ],
		[ 'descColor', '--ullmer-pill-desc-color' ],
		[ 'hoverBorderColor', '--ullmer-pill-hover-border-color' ],
		[ 'hoverBackgroundColor', '--ullmer-pill-hover-bg' ],
		[ 'hoverTitleColor', '--ullmer-pill-hover-title-color' ],
		[ 'hoverDescColor', '--ullmer-pill-hover-desc-color' ]
	];

	blocks.registerBlockType( 'ullmer/pill', {

		edit: function ( props ) {
			var a = props.attributes;
			var set = props.setAttributes;

			/* Nur gesetzte Farben ausgeben, damit der Rest weiter erbt. */
			var style = {};
			COLOR_MAP.forEach( function ( pair ) {
				var value = a[ pair[ 0 ] ];
				if ( value ) {
					style[ pair[ 1 ] ] = value;
				}
			} );

			var hasOwnColors = Object.keys( style ).length > 0;

			var blockProps = useBlockProps( {
				className: hasOwnColors ? 'has-own-colors' : undefined,
				style: style
			} );

			var linkPanel = el( PanelBody, {
				title: __( 'Link', 'ullmer-pill-row' ),
				initialOpen: true
			},
				el( TextControl, {
					label: __( 'Linkziel (URL)', 'ullmer-pill-row' ),
					help: __( 'Leer lassen, wenn die Pill nicht anklickbar sein soll.', 'ullmer-pill-row' ),
					type: 'url',
					value: a.url,
					onChange: function ( value ) { set( { url: value } ); }
				} ),
				!! a.url && el( ToggleControl, {
					label: __( 'In neuem Tab öffnen', 'ullmer-pill-row' ),
					checked: a.linkTarget === '_blank',
					onChange: function ( value ) {
						set( {
							linkTarget: value ? '_blank' : '',
							rel: value ? 'noreferrer noopener' : ''
						} );
					}
				} ),
				!! a.url && el( TextControl, {
					label: __( 'rel-Attribut', 'ullmer-pill-row' ),
					value: a.rel,
					onChange: function ( value ) { set( { rel: value } ); }
				} )
			);

			function colorSetting( label, key ) {
				return {
					label: label,
					value: a[ key ] || undefined,
					onChange: function ( value ) {
						var patch = {};
						patch[ key ] = value || '';
						set( patch );
					}
				};
			}

			var colorPanel = el( PanelColorSettings, {
				title: __( 'Farben dieser Pill', 'ullmer-pill-row' ),
				initialOpen: false,
				colorSettings: [
					colorSetting( __( 'Rahmen', 'ullmer-pill-row' ), 'borderColor' ),
					colorSetting( __( 'Hintergrund', 'ullmer-pill-row' ), 'backgroundColor' ),
					colorSetting( __( 'Titel', 'ullmer-pill-row' ), 'titleColor' ),
					colorSetting( __( 'Beschreibung', 'ullmer-pill-row' ), 'descColor' ),
					colorSetting( __( 'Hover – Rahmen', 'ullmer-pill-row' ), 'hoverBorderColor' ),
					colorSetting( __( 'Hover – Hintergrund', 'ullmer-pill-row' ), 'hoverBackgroundColor' ),
					colorSetting( __( 'Hover – Titel', 'ullmer-pill-row' ), 'hoverTitleColor' ),
					colorSetting( __( 'Hover – Beschreibung', 'ullmer-pill-row' ), 'hoverDescColor' )
				]
			},
				el( 'p', { style: { margin: '0 0 12px', fontSize: '12px', color: '#757575' } },
					__( 'Leer gelassene Farben übernimmt die Pill von der Reihe.', 'ullmer-pill-row' )
				),
				hasOwnColors && el( Button, {
					variant: 'secondary',
					size: 'small',
					onClick: function () {
						var patch = {};
						COLOR_MAP.forEach( function ( pair ) { patch[ pair[ 0 ] ] = ''; } );
						set( patch );
					}
				}, __( 'Eigene Farben zurücksetzen', 'ullmer-pill-row' ) )
			);

			return el( Fragment, null,
				el( InspectorControls, null, linkPanel, colorPanel ),
				el( 'div', blockProps,
					el( RichText, {
						tagName: 'span',
						className: 'ullmer-pill__title',
						value: a.title,
						allowedFormats: [ 'core/bold', 'core/italic' ],
						placeholder: __( 'Titel …', 'ullmer-pill-row' ),
						onChange: function ( value ) { set( { title: value } ); }
					} ),
					el( RichText, {
						tagName: 'span',
						className: 'ullmer-pill__description',
						value: a.description,
						allowedFormats: [ 'core/bold', 'core/italic' ],
						placeholder: __( 'Beschreibung (optional) …', 'ullmer-pill-row' ),
						onChange: function ( value ) { set( { description: value } ); }
					} )
				)
			);
		},

		/* Serverseitig gerendert – siehe render.php. */
		save: function () {
			return null;
		}
	} );

} )(
	window.wp.blocks,
	window.wp.blockEditor,
	window.wp.components,
	window.wp.element,
	window.wp.i18n
);
