/**
 * Ullmer Pill-Reihe – Frontend-Laufband.
 *
 * Vanilla JS, keine Abhängigkeiten. Der Track wird per translate3d bewegt,
 * nicht über scrollLeft – das läuft auf dem Compositor und ruckelt nicht.
 */
( function () {
	'use strict';

	var SELECTOR = '.wp-block-ullmer-pill-row';
	var MAX_CLONE_PASSES = 10;

	var motionQuery = window.matchMedia
		? window.matchMedia( '(prefers-reduced-motion: reduce)' )
		: null;

	function prefersReducedMotion() {
		return !! ( motionQuery && motionQuery.matches );
	}

	/**
	 * Macht den Track manuell scrollbar statt ihn zu animieren.
	 *
	 * @param {HTMLElement} viewport Viewport-Element.
	 * @param {HTMLElement} track    Track-Element.
	 */
	function enableManualScrolling( viewport, track ) {
		viewport.classList.add( 'is-scrollable' );
		track.style.transform = '';
	}

	/**
	 * Startet das Laufband.
	 *
	 * @param {HTMLElement} viewport Viewport-Element.
	 * @param {HTMLElement} track    Track-Element.
	 */
	function startMarquee( viewport, track ) {

		var speed = parseFloat( viewport.getAttribute( 'data-speed' ) );
		if ( ! isFinite( speed ) || speed <= 0 ) {
			speed = 40;
		}

		var direction = viewport.getAttribute( 'data-direction' ) === 'right' ? 1 : -1;
		var pauseOnHover = viewport.getAttribute( 'data-pause-on-hover' ) === '1';

		var originals = Array.prototype.slice.call( track.children );
		if ( ! originals.length ) {
			return;
		}

		/*
		 * Mindestens einmal klonen – der Klon liefert den Zyklus, ohne ihn gibt
		 * es keine Endlosschleife. Danach weiter klonen, bis der Track doppelt
		 * so breit ist wie der Viewport, sonst entsteht beim Umschlag eine Lücke.
		 */
		var passes = 0;
		do {
			var fragment = document.createDocumentFragment();

			originals.forEach( function ( node ) {
				var clone = node.cloneNode( true );
				clone.setAttribute( 'aria-hidden', 'true' );

				/* Klone dürfen nicht in den Tab-Fokus geraten. */
				if ( 'A' === clone.tagName ) {
					clone.setAttribute( 'tabindex', '-1' );
				}
				Array.prototype.forEach.call(
					clone.querySelectorAll( 'a, button, input, select, textarea, [tabindex]' ),
					function ( focusable ) {
						focusable.setAttribute( 'tabindex', '-1' );
					}
				);

				fragment.appendChild( clone );
			} );

			track.appendChild( fragment );
			passes++;
		} while ( track.scrollWidth < viewport.clientWidth * 2 && passes < MAX_CLONE_PASSES );

		/* Ein Zyklus ist der Abstand vom ersten Original zum ersten Klon. */
		function measureCycle() {
			var firstClone = track.children[ originals.length ];
			if ( ! firstClone ) {
				return 0;
			}
			return firstClone.offsetLeft - track.children[ 0 ].offsetLeft;
		}

		var cycle = measureCycle();
		if ( cycle <= 0 ) {
			return;
		}

		var offset = 0;
		var lastTimestamp = null;
		var hovered = false;
		var focused = false;
		var visible = true;
		var rafId = null;

		function isPaused() {
			return ( pauseOnHover && hovered ) || focused || ! visible || document.hidden;
		}

		function step( timestamp ) {
			if ( null === lastTimestamp ) {
				lastTimestamp = timestamp;
			}

			var delta = ( timestamp - lastTimestamp ) / 1000;
			lastTimestamp = timestamp;

			/* Nach einem Tabwechsel keinen Riesensprung machen. */
			if ( delta > 0.25 ) {
				delta = 0.25;
			}

			if ( ! isPaused() ) {
				offset += direction * speed * delta;
				offset = offset % cycle;
				if ( offset > 0 ) {
					offset -= cycle;
				}
				track.style.transform = 'translate3d(' + offset + 'px, 0, 0)';
			}

			rafId = window.requestAnimationFrame( step );
		}

		rafId = window.requestAnimationFrame( step );

		/* --- Pausieren ---------------------------------------------------- */

		viewport.addEventListener( 'mouseenter', function () { hovered = true; } );
		viewport.addEventListener( 'mouseleave', function () { hovered = false; } );

		/* Tastaturfokus pausiert immer – unabhängig von der Hover-Einstellung. */
		viewport.addEventListener( 'focusin', function () { focused = true; } );
		viewport.addEventListener( 'focusout', function () { focused = false; } );

		if ( window.IntersectionObserver ) {
			new window.IntersectionObserver( function ( entries ) {
				visible = entries[ 0 ].isIntersecting;
			} ).observe( viewport );
		}

		/* --- Neu vermessen bei Größenänderung ----------------------------- */

		if ( window.ResizeObserver ) {
			var resizeTimer = null;
			new window.ResizeObserver( function () {
				window.clearTimeout( resizeTimer );
				resizeTimer = window.setTimeout( function () {
					var next = measureCycle();
					if ( next > 0 ) {
						cycle = next;
					}
				}, 150 );
			} ).observe( track );
		}

		/* --- Reduzierte Bewegung nachträglich aktiviert -------------------- */

		if ( motionQuery ) {
			var onMotionChange = function () {
				if ( prefersReducedMotion() && null !== rafId ) {
					window.cancelAnimationFrame( rafId );
					rafId = null;
					enableManualScrolling( viewport, track );
				}
			};

			if ( motionQuery.addEventListener ) {
				motionQuery.addEventListener( 'change', onMotionChange );
			} else if ( motionQuery.addListener ) {
				motionQuery.addListener( onMotionChange );
			}
		}
	}

	/**
	 * Initialisiert eine einzelne Pill-Reihe.
	 *
	 * @param {HTMLElement} row Block-Wrapper.
	 */
	function init( row ) {
		if ( row.dataset.ullmerPillRowReady ) {
			return;
		}
		row.dataset.ullmerPillRowReady = '1';

		var viewport = row.querySelector( '.ullmer-pill-row__viewport' );
		var track = row.querySelector( '.ullmer-pill-row__track' );

		if ( ! viewport || ! track ) {
			return;
		}

		if ( 'marquee' !== viewport.getAttribute( 'data-layout' ) ) {
			return;
		}

		/*
		 * Reduzierte Bewegung schlägt die Blockeinstellung – das ist bewusst
		 * nicht über die Sidebar abschaltbar.
		 */
		if ( '1' !== viewport.getAttribute( 'data-autoplay' ) || prefersReducedMotion() ) {
			enableManualScrolling( viewport, track );
			return;
		}

		startMarquee( viewport, track );
	}

	function initAll() {
		Array.prototype.forEach.call( document.querySelectorAll( SELECTOR ), init );
	}

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}
} )();
