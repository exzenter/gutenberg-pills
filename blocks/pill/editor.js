/**
 * Ullmer Pill-Reihe – Editor-Skript für die einzelne Pill.
 *
 * Titel und Beschreibung werden direkt im Canvas bearbeitet (RichText),
 * der Link liegt in der Seitenleiste.
 */
( function ( blocks, blockEditor, components, element, i18n ) {
	'use strict';

	var el = element.createElement;
	var Fragment = element.Fragment;
	var __ = i18n.__;

	var useBlockProps = blockEditor.useBlockProps;
	var RichText = blockEditor.RichText;
	var InspectorControls = blockEditor.InspectorControls;

	var PanelBody = components.PanelBody;
	var TextControl = components.TextControl;
	var ToggleControl = components.ToggleControl;

	blocks.registerBlockType( 'ullmer/pill', {

		edit: function ( props ) {
			var a = props.attributes;
			var set = props.setAttributes;

			var blockProps = useBlockProps();

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

			return el( Fragment, null,
				el( InspectorControls, null, linkPanel ),
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
