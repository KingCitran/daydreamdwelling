# Handoff: DaydreamDwelling brand revamp — type, buttons, logo mark, cloud underline, icons

Target repo: `KingCitran/daydreamdwelling` (React 19 + Vite monorepo). Live sources this work builds on:
`apps/customer/src/pages/LandingPage.jsx`, `packages/shared/themes.js`, `packages/shared/Logo.jsx`,
`packages/shared/ui/Icon.jsx`, `packages/shared/RaindropIcon.jsx`, `apps/customer/src/ui/BottomTabCluster.jsx`.

## Overview
A brand pass that replaces the three fonts, introduces a D-shaped button family in the Dream State palette, a
redrawn isometric room logo, a generated "cloud sea" text underline made from the existing cloud photos,
mood-aware button highlights, and additions to the existing icon library. The sky + drifting-cloud background,
frosted-glass cards, and the builder's dark-glass tab buttons are **unchanged**.

## About the design files
`Parhelia Board.dc.html` is a **design reference built in HTML**, not production code. Recreate the decisions
below in the app's existing React components and CSS patterns. `parhelia/icons.js` and `parhelia/tokens.css`
are data you can port directly (SVG paths, hex values).

## Fidelity
**High-fidelity.** Colors, radii, sizes and type are final. Match them exactly.

## Decisions (what to ship vs. what was explored)
SHIP:
1. Type system (Young Serif / Commissioner / Cedarville Cursive)
2. D-shaped buttons, plain, Dream State palette — board section **6a**
3. Logo mark redraw — board section **5a**
4. Cloud-sea underline component — board section **4a** ("browse the shop" / "about")
5. Mood-aware highlight for pill buttons (only if pills remain anywhere) — board section **2e**
6. Icon additions — board section **2d**, source `parhelia/icons.js`
7. Founder signature text → "— Parhelia"

DO NOT SHIP (explored, rejected): cloud-photo wisps inside buttons (3b), aura/lump buttons (3a/3c), sparkle/halo-ring
button treatments (2b), any builder tab-button changes (2c — keep `BottomTabCluster` exactly as live).

---

## 1. Typography
Replace EB Garamond / Outfit / Caveat everywhere (except the builder tabs, which stay Outfit 700 for now).

- **Display / wordmark / prices:** `Young Serif` 400 (single weight, no italic). Emphasis = accent color, not italic.
  Hero: 60px / 1.02 / -1px. Section: 44px / 1.05 / -0.8px. Card title: 34px / 1.05 / -0.5px.
- **Body / UI / buttons:** `Commissioner` 400 / 500 / 600. Body 15–18px / 1.65. Buttons 500. Eyebrows 11px,
  uppercase, letter-spacing 2.5px.
- **Hand (signatures only):** `Cedarville Cursive`, 28–30px.
- Google Fonts CSS2: `Young+Serif`, `Commissioner:wght@300;400;500;600`, `Cedarville+Cursive`. Self-host woff2 for prod.

## 2. Buttons — the D family (section 6a)
Shape: a pill with the **stem side squared** — `border-radius: 6px 999px 999px 6px` (large, 50px tall),
`5px 999px 999px 5px` (44px), `4px 999px 999px 4px` (32px chips). Mirrored (`999px 6px 6px 999px`) for
back / close / cancel actions. Bowl-right = forward, bowl-left = back.

Palette (Dream State):
- Primary fill `#7a48cc`, text `#fff`, hover fill `#6a3bb8`, shadow `0 8px 20px rgba(122,72,204,.22)`
- Secondary fill `#ddd4f5`, text `#2a1848`, hover `#d1c6f0`, no border, no shadow
- Tertiary: transparent, `1px solid #b7a7e6`, text `#2a1848`, hover border `#7a48cc`
- Disabled: fill `#ede9ff`, text `#9a8cc2`, `cursor:not-allowed`
- On pale page ground `#ede9ff`: secondary becomes `#fff` with `1px solid #d1c6f0`
- Chips: same three fills at 32px, 13px Commissioner 500, padding `0 14px 0 10px`
- Icon buttons: 46×46, same radii, icon 20px stroke 1.9
- Input + button pair: input `border-radius 6px 0 0 6px`, `1px solid #b7a7e6`, no right border, bg `#fff`;
  button `0 999px 999px 0`
- Text links: Young Serif 16px, `text-decoration: underline; text-decoration-color:#b7a7e6; text-underline-offset:5px; text-decoration-thickness:1.5px`
- All: Commissioner 500, 15px (50px) / 14px (44px), padding `0 30px 0 22px` / `0 26px 0 18px`, no trailing `→`,
  hover `translateY(-1px)`, `transition: transform .18s, background .18s`. No highlights, rings, sparkles.
- Ink for all text on light surfaces: `#2a1848`, never black.

## 3. Logo mark (section 5a) — replaces flat `Logo.jsx` mark
Isometric room, 22° pitch. viewBox `0 0 120 130`. Source SVG: copy the first `<svg width="260" height="282">`
in `Parhelia Board.dc.html` (search `id="5a"`). Structure, in draw order:
1. Floor slab edges (3 units thick): `#c9bca8` left, `#b0a28e` right — extend under the walls
   (`M20.1 79.9L60 96V99L20.1 82.9Z`, `M60 96L99.9 79.9V82.9L60 99Z`)
2. Floor top, transform `matrix(-0.927 0.375 0.927 0.375 60 66)`: rect `M-3 -3H40V40H-3Z` fill `#e9dfcf`;
   rug D `M9 9H31V17A11 11 0 0 1 9 17Z` fill `#6d5cb8`
3. Left wall, transform `matrix(-0.927 0.375 0 -1 60 66)`: wall rect with D hole (evenodd)
   `M0 0H40V46H0Z M30 12V34H22A11 11 0 0 1 22 12Z` fill `#c9bbea`; reveal (clip to hole) same D offset
   `(+3, +2.25)` fill `#a695d6`; frame stroke `#3b2a6e` 2px on the D
4. Right wall, transform `matrix(0.927 0.375 0 -1 60 66)`: same with D `M10 12V34H18A11 11 0 0 0 18 12Z`
   fill `#a08fd8`, reveal `#7d69c0`
5. Wall thickness (3 units): top faces `#e4dcf6`, corner cap, end faces `#b3a3de` (left) / `#8b78c9` (right)
- Both windows and the rug are the **same D**: stem 22, flat 8, bowl radius 11.
- Windows are **real holes** (evenodd) — background shows through.
- Mono version (dark / accent grounds): all fills `currentColor` at .25 floor / .6 left wall / .85 right wall,
  rug solid, no frame stroke.
- Sizes: 96 / 48 / 24 / 16. Drop the frame stroke below 48px. No coral anywhere in the mark.
- Lockups: horizontal — mark 64px + "DaydreamDwelling" Young Serif 40px / -1px + eyebrow "rooms in the sky";
  stacked — mark 88px over Young Serif 22px.

## 4. Cloud-sea underline — `<CloudLink>` (section 4a)
A text link that sits on a run of whole cloud photos. Port `cloudRun()` from the board's logic class verbatim.
Behaviour:
- Measure the link's rendered width `W` (after fonts load; re-measure on resize).
- Seeded PRNG from the link text (mulberry32 in the board) so the same word always gets the same clouds.
- Generate clouds until total ≥ W+12: width `40 + rnd*10` px, overlap `-(14 + rnd*3)` px, photo from all 8
  `assets/clouds/cloud-00N.webp` (never the same photo twice in a row), 50% horizontal flip, bob `rnd*2-1` px,
  tilt `rnd*6-3` deg.
- Scale all widths by `k = (W - Σoverlaps) / Σwidths` so the run ends **exactly** at the word's right edge —
  no clipped clouds.
- Each cloud: absolutely positioned `<span>`, `background: <accent>`, `opacity .8`, height `= width*.6`,
  `bottom = bob - 14px`, `mask: url(photo) center/contain no-repeat`, `z-index 0`; text `z-index 1`.
- Container: `position:relative; isolation:isolate; display:inline-block; padding:0 4px`, Young Serif 17px,
  ink text, hover text `#b8541a` (or mood accent-dark).
- Accent = current mood accent (`themes.js`). Use for hero moments only; regular links use the plain lavender underline.

## 5. Mood-aware highlight on pills (section 2e) — optional, only where pills remain
Highlight = the mood's light source, layered over the accent:
`background: radial-gradient(circle at X% Y%, rgba(L,S) 0, rgba(L,0) P%), <accent>`. Table `[X, Y, L, S, P]`:
Golden Hour `[88,78,'255,214,150',.75,40]` · Bright Day `[50,-10,'255,255,255',.6,45]` ·
Vivid Sunset `[12,96,'255,120,180',.7,44]` · Ember's Sunrise `[8,92,'255,150,80',.65,42]` ·
Moonlight `[80,10,'255,255,255',.9,40]` · Northern Lights `[40,-20,'160,255,230',.55,60]` ·
Dark Academia `[92,60,'255,200,120',.55,36]` · Blush Hour `[20,90,'255,190,190',.6,44]` ·
Coastal Morning `[90,84,'255,225,170',.6,40]` · Dream State `[30,0,'255,230,255',.55,48]` ·
Neon Nights `[100,50,'255,80,200',.6,36]` · Candlelit `[50,110,'255,180,90',.7,40]` ·
Greenhouse `[55,-15,'240,255,200',.55,50]` · Studio `[20,20,'255,255,255',.35,30]` ·
Studio Dark `[20,20,'255,255,255',.5,30]` · Sunlight `[16,22,'255,255,255',.6,32]`.
**Token change requested:** Moonlight accent `#5070c8` → `#d6e0f5` with text-on-accent `#141a30`.

## 6. Icons (section 2d) — add to `packages/shared/ui/Icon.jsx`
Rules match the live library: 24 grid, `currentColor`, stroke 1.9, round caps/joins, duotone fills at .22.
New paths are in `parhelia/icons.js`: `heartFilled`, `raindropFilled`, `roomWindow`, `roomDoor`, `roomRug`,
`roomPlan`, `wispy`, `parhelion` (light/mood), `sparkle`. Each entry is an array of `{d, fill?, op?, stroke?}`.
Builder tab icons stay Lucide as live (decision 2c).

## 7. Copy
Founder signature: "— Parhelia" (Cedarville Cursive). All other copy unchanged.

## Design tokens (new)
- Dream State ink `#2a1848` · primary `#7a48cc` · primary-hover `#6a3bb8` · light purple `#ddd4f5` ·
  light-purple-hover `#d1c6f0` · outline `#b7a7e6` · page ground `#ede9ff` · disabled text `#9a8cc2` ·
  soft label `#7a6aa8`
- Logo: `#e9dfcf #c9bca8 #b0a28e #6d5cb8 #c9bbea #a695d6 #a08fd8 #7d69c0 #3b2a6e #e4dcf6 #b3a3de #8b78c9`
- Radii: D large `6px 999px 999px 6px`, medium `5px…`, chip `4px…`; cards stay 32px
- Shadow (primary): `0 8px 20px rgba(122,72,204,.22)`
- Motion: hover lift 1px, .18s; respect `prefers-reduced-motion`

## Assets
- `assets/clouds/cloud-001…008.webp` — existing brand clouds, used by CloudLink (already in repo)
- `parhelia/icons.js` — icon path data · `parhelia/tokens.css` — 16 mood triples + fonts

## Files
- `Parhelia Board.dc.html` — the board; sections by id: `6a` buttons, `5a` logo, `4a` CloudLink, `2d` icons, `2e` moods
- `parhelia/icons.js`, `parhelia/tokens.css`
