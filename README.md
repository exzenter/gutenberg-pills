# Ullmer Pill-Reihe

Gutenberg-Block für eine Reihe abgerundeter Pills — statisch oder als endlos laufendes Laufband.
Die Standardwerte entsprechen 1:1 dem Ullmer-Website-Redesign; im Editor lässt sich alles
überschreiben.

**Kein npm. Kein Build-Step. Kein JSX.** Das Plugin läuft so, wie es im Ordner liegt.

---

## Installation

1. Ordner `ullmer-pill-row/` nach `wp-content/plugins/` kopieren
   (oder als ZIP über *Plugins › Installieren › Plugin hochladen*)
2. Plugin aktivieren
3. Im Editor nach **Pill-Reihe** suchen

Voraussetzungen: WordPress **6.1+**, PHP **7.4+**.

---

## Aufbau

Zwei Blöcke, die zusammengehören:

| Block | Rolle |
|---|---|
| `ullmer/pill-row` | Container: Überschrift, Layout, Farben, Typografie |
| `ullmer/pill` | Einzelne Pill: Titel, Beschreibung, Link |

Die Pills sind **InnerBlocks** — sie lassen sich wie alles andere in Gutenberg per Drag & Drop
sortieren, kopieren, einfügen und einzeln anklicken.

**Warum liegt die Gestaltung im Container und nicht in der einzelnen Pill?** Weil alle Pills einer
Reihe im Design identisch aussehen. Die Werte werden als CSS-Custom-Properties auf den Container
geschrieben und von den Pills geerbt. Eine Einstellung ändern heißt: die ganze Reihe ändert sich,
nicht fünf Pills einzeln.

---

## Einstellungen

### Überschrift
Zweifarbig, wie im Design: ein Teil kursiv in Akzentfarbe, der andere in Grundfarbe.
Per Schalter lässt sich umdrehen, welcher Teil hervorgehoben ist — das Design nutzt beide
Reihenfolgen („*unsere leistungen* im überblick:" vs. „weitere *leistungen*").
Komplett abschaltbar für Reihen ohne Überschrift.

Einstellbar: beide Textteile, Hervorhebung, Schriftfamilie, Schriftgröße, Zeilenhöhe,
Laufweite, Abstand zu den Pills.

### Darstellung

**Statisch** — die Reihe bricht um und bleibt in der Contentbreite.
Ausrichtung wählbar (zentriert, links, rechts, verteilt).

**Laufband** — eine Zeile, die über die Viewportbreite hinausläuft.

- **Automatisch laufen lassen** (an/aus): aus = das Laufband steht still und ist per Maus,
  Finger oder Tastatur scrollbar
- **Geschwindigkeit** in px/s
- **Laufrichtung** links oder rechts
- **Bei Mauszeiger pausieren**

### Pills
Schriftfamilie, Abstand, Rahmenstärke, Eckenradius, Innenabstände, Titelgröße, Schriftstärke,
Großbuchstaben an/aus, Beschreibungsgröße und -zeilenhöhe.

### Farben
Zehn Farben über die normale WordPress-Farbauswahl (inkl. Theme-Palette): Überschrift Akzent und
Grundfarbe, Pill Rahmen / Hintergrund / Titel / Beschreibung, dazu vier Hover-Farben.

### Pro Pill
Titel und Beschreibung werden direkt im Canvas getippt. Der Link ist optional — mit URL wird ein
`<a>` gerendert, ohne URL ein `<div>`. Kein klickbares `<div>`.

---

## Standardwerte

Aus dem Figma-File `Ullmer-Website-Redesign`, Component-Set `111:273`:

| | |
|---|---|
| Rahmen | `2px solid #23BAE2` |
| Eckenradius | `100px` |
| Abstand zwischen Pills | `10px` |
| Titel | Inter Medium (500), `33px`, uppercase, `#23BAE2` |
| Beschreibung | Inter Regular, `18px` / `35px`, `#000000` |
| Hover | Fläche `#23BAE2`, Text `#FFFFFF` |
| Überschrift | Merriweather Bold, `40px` / `53px`, Laufweite `0.8px` |

Das Plugin **lädt keine Schriften**. Inter und Merriweather müssen aus dem Theme kommen; in den
Einstellungen stehen nur die `font-family`-Stacks.

### Eine Abweichung vom Figma
Im Figma sitzt der Textblock jeder Pill absolut auf 33,52 % der Höhe, was bei unterschiedlich
hohen Pills unterschiedliche effektive Innenabstände ergibt. Das ist ein Artefakt der
Zeichenfläche, keine Gestaltungsregel. Hier ist der Innenabstand stattdessen fest
(`52px` vertikal, `72px` horizontal) und die Höhe folgt dem Inhalt. Pills einer Reihe bleiben über
`align-items: stretch` gleich hoch. Wer die Figma-Höhen exakt nachbauen will, stellt den
vertikalen Innenabstand pro Reihe nach.

---

## Barrierefreiheit

- Verlinkte Pills sind `<a>`, unverlinkte `<div>`
- Fokus-Ring sichtbar, Hover- und Fokus-Zustand identisch
- Laufband pausiert **immer** bei Tastaturfokus, unabhängig von der Hover-Einstellung
- Die Klone im Laufband sind `aria-hidden` und aus der Tab-Reihenfolge genommen
- `prefers-reduced-motion: reduce` schaltet die Animation ab und macht das Laufband scrollbar.
  Das **überschreibt die Blockeinstellung** und ist absichtlich nicht abschaltbar

### Hinweis zum Kontrast
Cyan `#23BAE2` auf Weiß liegt bei etwa **2,4:1**. WCAG AA fordert 3:1 für Text dieser Größe und
für Rahmen — das wird knapp verfehlt, im Hover-State (Weiß auf Cyan) ebenfalls.

Die Standardwerte bilden das Design ab, wie es ist. Weil alle Farben als CSS-Custom-Property
ausgegeben werden, ist eine Korrektur eine einzige Theme-Zeile und braucht kein Plugin-Update:

```css
.wp-block-ullmer-pill-row {
	--ullmer-pill-border-color: #1b94b4;
	--ullmer-pill-title-color: #1b94b4;
}
```

`#1B94B4` liegt bei ≈ 3,1:1 und ist optisch kaum zu unterscheiden.

---

## Anpassung per CSS

Alle Werte hängen an Custom Properties auf `.wp-block-ullmer-pill-row`:

```
--ullmer-gap                       --ullmer-pill-title-size
--ullmer-justify                   --ullmer-pill-title-weight
--ullmer-heading-font              --ullmer-pill-title-transform
--ullmer-heading-size              --ullmer-pill-desc-size
--ullmer-heading-line-height       --ullmer-pill-desc-line-height
--ullmer-heading-letter-spacing    --ullmer-pill-border-color
--ullmer-heading-accent-color      --ullmer-pill-bg
--ullmer-heading-base-color        --ullmer-pill-title-color
--ullmer-heading-gap               --ullmer-pill-desc-color
--ullmer-pill-font                 --ullmer-pill-hover-border-color
--ullmer-pill-border-width         --ullmer-pill-hover-bg
--ullmer-pill-border-radius        --ullmer-pill-hover-title-color
--ullmer-pill-padding-x            --ullmer-pill-hover-desc-color
--ullmer-pill-padding-y
```

---

## Warum ohne Build-Step

Ohne `@wordpress/scripts` entsteht keine `*.asset.php`, und ohne die kennt WordPress die
Abhängigkeiten eines Skripts nicht. Deshalb stehen in der `block.json` **keine `file:`-Pfade für
Skripte**. Stattdessen registriert `ullmer-pill-row.php` die Skripte von Hand mit explizitem
Dependency-Array, und die `block.json` referenziert nur die Handles.

Das Editor-JavaScript nutzt `wp.element.createElement` statt JSX. Etwas mehr Tipparbeit, dafür
läuft die Datei ohne Transpilierung im Browser.

Gerendert wird serverseitig (`render.php`, `save()` gibt `null` zurück). Damit lässt sich das
Markup später ändern, ohne dass bestehende Beiträge Block-Validierungsfehler werfen.

---

## Dateien

```
ullmer-pill-row/
├── ullmer-pill-row.php     Registrierung, CSS-Custom-Property-Helfer
├── README.md
├── readme.txt
├── assets/
│   ├── style.css           Frontend + Editor, Defaults als CSS-Variablen
│   └── editor.css          nur Editor
├── blocks/
│   ├── pill-row/
│   │   ├── block.json
│   │   ├── editor.js       Sidebar-Panels, InnerBlocks
│   │   ├── render.php
│   │   └── view.js         Laufband, Vanilla, ohne Abhängigkeiten
│   └── pill/
│       ├── block.json
│       ├── editor.js       RichText für Titel und Beschreibung
│       └── render.php
└── languages/
```

---

## Lizenz

GPL-2.0-or-later
