---
name: Keepers — The Admiralty Chart
description: "$KEEP on Robinhood Chain as an Admiralty chart of one coast: ten magenta light flares are the ten biggest holders who never sold, No. 1 is the lamp on the headland, and night falls for the log."
colors:
  sea: "#fbfbf8"
  shoal: "#cfe3ec"
  shoal-pale: "#e7f1f5"
  land: "#f2dfa7"
  land-pale: "#f7ebc8"
  ink: "#14181c"
  soft: "#4a5560"
  depth: "#2f6e8f"
  contour: "#8db4c6"
  magenta: "#c2187a"
  magenta-deep: "#9c1262"
  magenta-night: "#f067ad"
  red: "#b3301c"
  night: "#0c1824"
  night-ink: "#eef3f6"
  night-soft: "#a3b6c4"
  night-rule: "#3c5468"
  night-tower: "#1f2f3e"
  night-rock: "#18283a"
  placeholder: "#6b7681"
  white: "#ffffff"
  x-blue: "#1d9bf0"
  x-gold: "#c99a2e"
  x-grey: "#829aab"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(46px, 6.4vw, 96px)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "0.005em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(68px, 7.6vw, 116px)"
    fontWeight: 700
    lineHeight: 0.84
    letterSpacing: "0.03em"
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.1em"
  numeral:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "21px"
    fontWeight: 500
    lineHeight: 1.1
  said:
    fontFamily: "Old Standard TT, Iowan Old Style, Georgia, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  name:
    fontFamily: "Old Standard TT, Iowan Old Style, Georgia, serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.1
  caption:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.1
  lead:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1
  figure:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1
rounded:
  none: "0px"
spacing:
  gutter: "clamp(20px, 4.4vw, 64px)"
  section: "clamp(88px, 12vw, 160px)"
  head: "64px"
components:
  button-primary:
    backgroundColor: "{colors.magenta}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "50px"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.magenta-deep}"
    textColor: "{colors.white}"
  button-line:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "50px"
    padding: "0 24px"
  cartouche:
    backgroundColor: "{colors.sea}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "32px 34px"
  light-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "30px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.numeral}"
    rounded: "{rounded.none}"
    height: "50px"
---

# Keepers — The Admiralty Chart

## Overview

The page is one Admiralty chart, read top to bottom. The opening is the chart itself: a coast in buff
behind a hard ink coastline, pale shoal bands and depth contours in the sea, soundings, a compass rose,
and ten magenta light flares that are the live top ten. No. 1 is the lamp on the headland, with its
light sector sweeping the sea. The dev wallet is the daymark: a beacon that stands on the coast and is
never lit. Below the chart the page becomes the publications that go with it: the List of Lights (the
leaderboard), a tidal curve (the fee loop), standing orders (the rules) on land-coloured ground, the
light card (wallet check), and then night falls for the log and the close.

Lore vocabulary: the watch (top 10), the lamp (No. 1), top watch / lower watch (the two reward tiers),
on the approach (11-50), signing on (holding but too new), left the post (sold), the daymark (dev
wallet), your light / light card (wallet check), painting your light (name, portrait, X), the tide and
high water (escrow and step threshold), the log (rounds).

## Colors

- **Sea, shoal, land, ink** are the chart's own ground. Sea is the default page; shoal-pale grounds the
  List of Lights; land grounds the standing orders; night grounds the log and the close.
- **Magenta** is the one accent and always means light: light flares, the lamp, the Buy button, reward
  amounts, the tide's current mark, the active step. On night ground it lifts to magenta-night.
- **Red** is only for leaving the post: a sold wallet, its stamp, the fourth standing order, the demo label.
- **Depth** blue is for soundings, the approach list and the "on the coast" stamp.
- X badge colours (x-blue, x-gold, x-grey) are X's own and appear only on its verified seal.

## Typography

One fixed ramp for set sizes: 14, 16, 18, 21, 26, 32px. Headlines and big figures are fluid clamps above it.

Two voices. **Old Standard TT** is everything said, in the manner of a chart's hydrographic lettering:
reading text in roman, names of keepers and places in italic, the motto in magenta italic.
**Barlow Condensed** is everything measured or labelled: headlines in heavy uppercase, every number
with tabular lining figures, nav, buttons, column heads and light characteristics (Iso W 4s, Fl W 5s,
Fl W 10s). Emphasis inside a sentence uses the same family's bold, never a family switch.

## Layout

One master column (max 1240px, fluid gutter). The opening is full-bleed: the cartouche sits top left
over open sea, the chart box (1000 by 800 units) fills the right side, and lights are placed in percent
of that box so HTML labels track the SVG coast. Below 860px the cartouche comes first and the chart
is shown wider than the screen, cropped to the coast. Section rhythm: generous top and bottom padding,
more space above a heading than below it.

## Elevation & Depth

No shadows. Depth is the chart's: double rules (a 2px border plus a 1px outline offset 5px) frame the
cartouche, the lamp entry and the light card. Solid rules separate list entries; dashed rules mean
"not yet": unlit lights, the approach list.

## Shapes

Square corners everywhere (radius 0). Drawn shapes are crisp geometry: coast paths, contour offsets,
the compass rose, flares, the tower portrait, the tidal curve.

## Components

- **Light flare**: magenta teardrop rising from a black position dot. Flashes to its characteristic
  (lamp isophase 4s, top watch every 5s, lower watch every 10s). Grey and still when unlit or going out.
- **Cartouche**: the hero's title block with name, motto, rule line, tide gauge (20 graduated marks,
  wet marks in magenta) and the two actions.
- **List of Lights entry**: No. | keeper | light | holding | next reward. The lamp gets its own framed
  entry with a sweeping light band.
- **Keeper portrait**: a lighthouse on its rock. Four traits with the engine's counts 5, 5, 6, 6:
  daymark paint, lantern, extra, weather. Lamp goes grey for a wallet that sold.
- **Tidal curve**: one rising limb per step, high water lines labelled with the step and threshold,
  water filled to the escrow's current level.
- **Light card**: framed record with portrait, name, address, a rotated stamp in the status colour,
  four facts and the line that explains the status.

Motion: the chart draws itself on load and the lights come on from No. 10 to the lamp. Scrolling pins
the chart, closes in on the lamp, and the lamp's sector opens (a clip-path circle from the lamp) into
the List of Lights, which rises over the last stretch. Entries are printed in from the left; the
tidal curve is plotted with scroll and the water comes in; each standing order is crossed by the beam;
the light card is printed and stamped; night falls as a scrubbed change of the night ground's colours;
the log's track is drawn down the entries; the close's tower rises while its beam sways. Rank changes
move lights along the coast and rows to their new lines (FLIP, offsets only). All of it is off under
prefers-reduced-motion.

## Do's and Don'ts

- Do keep magenta for light and red for leaving the post; nothing else gets a colour.
- Do set every number in Barlow Condensed with tabular figures.
- Don't add shadows, rounded corners, emoji, eyebrow labels or em or en dashes in visible text.
- Don't use yield, APY or promise-of-value language.
- Don't position anything GSAP moves with the CSS `translate` property; GSAP owns the transform.
- Don't measure rank moves on screen; use offsetLeft / offsetTop.
