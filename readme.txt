=== Ullmer Pill-Reihe ===
Contributors: ullmer
Tags: block, gutenberg, pills, marquee, slider
Requires at least: 6.1
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Gutenberg-Block für eine Reihe abgerundeter Pills – statisch oder als endlos laufendes Laufband.

== Description ==

Zwei Blöcke: "Pill-Reihe" als Container und "Pill" als einzelnes Element. Die Pills sind
InnerBlocks und lassen sich wie gewohnt sortieren, kopieren und einfügen.

Die Standardwerte entsprechen dem Ullmer-Website-Redesign. Im Editor sind Überschrift, Layout,
Typografie, Abstände und zehn Farben frei einstellbar.

Das Plugin kommt ohne Build-Step aus: kein npm, kein Webpack, kein JSX.

Funktionen:

* Statischer Modus (bricht um) oder Laufband
* Autoplay pro Block abschaltbar, mit Geschwindigkeit und Laufrichtung
* Pause bei Mauszeiger und immer bei Tastaturfokus
* Respektiert prefers-reduced-motion
* Optionale zweifarbige Überschrift, Hervorhebung umdrehbar
* Optionaler Link pro Pill
* Alle Werte als CSS-Custom-Properties überschreibbar

== Installation ==

1. Ordner nach wp-content/plugins/ kopieren
2. Plugin aktivieren
3. Im Editor nach "Pill-Reihe" suchen

== Frequently Asked Questions ==

= Lädt das Plugin Schriften? =

Nein. Inter und Merriweather müssen aus dem Theme kommen. In den Einstellungen stehen nur die
font-family-Stacks.

= Kann ich die Farben global ändern? =

Ja, über CSS-Custom-Properties auf .wp-block-ullmer-pill-row. Siehe README.md.

== Changelog ==

= 1.0.0 =
* Erste Version.
