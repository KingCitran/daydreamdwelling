# DaydreamDwelling — Design System

> *rooms in the sky*

DaydreamDwelling is a free **3D room builder + marketplace**: you build a room in
3D, fill it with **real, handmade furniture from independent makers**, set the
light to one of fourteen moods, and bring the whole thing home in one cart. The
brand lives **above the clouds** — every surface floats on a blue sky gradient
with soft photographic clouds drifting behind frosted glass. It is **whimsical
but professional and comforting**: a light, airy serif; lowercase, letter-like
copy; a cloud mascot named **Wispy**; and one warm coral accent that reads like
sunlight catching a cloud's edge.

A sister brand, **Daydream Blossoms**, covers outdoor & garden with the same
dreamy vibe.

This folder is a self-contained design system: tokens, fonts, brand assets,
reusable React components, foundation specimen cards, and full-screen UI kits.
Consumers link one file — `styles.css`.

---

## Sources

This system was reverse-engineered from the product's own code and brand assets.
You don't need access to these, but they're recorded so future work can go deeper:

- **GitHub (source of truth):** [`KingCitran/daydreamdwelling`](https://github.com/KingCitran/daydreamdwelling)
  — the live React 19 + Vite + React-Three-Fiber monorepo. The brand surfaces
  modeled here come from `apps/customer/src/pages/LandingPage.jsx`,
  `pages/landing/CloudField.jsx`, `pages/MarketplacePage.jsx`,
  `packages/shared/themes.js` (the mood system), `packages/shared/Logo.jsx`, and
  `packages/shared/wispy/` (the mascot). **Explore this repo to build
  higher-fidelity work** — especially the builder (`scene/`, `ui/`) which this
  system does not yet recreate.
- **Local export:** `daydreamdwelling-design/` — a Relume export (DESIGN.md,
  sitemap.md, the `react/` components, `globals.css`, and the bundled
  Outfit/Fraunces fonts). This represents an **earlier visual direction**
  (Fraunces + a fuchsia-blue palette). Where it conflicts with the live app, the
  **live app wins** — but its neutral ramp and type scale are folded in here.

> **Font note:** **Outfit** is bundled locally (`assets/fonts/`). **EB Garamond**
> (display) and **Caveat** (founder signatures) are loaded from the **Google
> Fonts CDN** — no local binaries were provided. Swap in self-hosted woff2 for
> production. *(Flagging this substitution — see "Caveats" at the bottom.)*

---

## Content fundamentals — how DaydreamDwelling writes

The voice is a **letter, not a newsletter**: warm, plain, quietly whimsical,
literary. It trusts the reader and never shouts.

- **Casing:** UI is **lowercase** — nav (`community`, `about`), buttons
  (`start building — it's free →`, `browse the shop`, `open the builder →`),
  labels, and reassurances (`no spam, ever`). Headlines are sentence case, set in
  the serif. Eyebrows are UPPERCASE and letter-spaced.
- **Person:** Second person, always. *"Design the room you've been dreaming of."*
  *"First you make a box. Then you fill it with light."* The reader owns the room.
- **Rhythm:** Short declaratives and em-dashes. Lists of three. Sentences that
  turn: *"Add a window if you want one. Add three. We don't care."*
- **Honesty over hype:** *"We're still small. Wispy is still learning. The shop is
  still filling up."* The waitlist count is hidden until it's a number worth
  showing. Empty states say *"the shop is opening soon,"* not *"Coming soon!!!"*
- **Emphasis is *italic*, never bold.** Color (coral) and serif italics carry
  weight; the type itself stays light.
- **No emoji.** Decoration is **typographic** — Unicode sparkles `✦ ✧ ◈` and the
  occasional `⚡` / `★`, set in coral. Never 🎉.
- **Signed by a human:** the founder note ends in a Caveat-hand *"— KingCitran."*

**Words the brand uses:** dreamy, light, weather, maker, handmade, real, room,
nook, bring it home, roommate (Wispy), through the door.

---

## Visual foundations

**Overall feeling:** above the clouds. Calm, soft, sunlit, dimensional. Nothing
is hard-edged or heavy.

- **Backgrounds:** a full-bleed **sky gradient** (`--sky-gradient`: deep blue
  zenith → pale blue → warm horizon haze) is the default canvas. Over it,
  **soft photographic clouds drift** slowly left-to-right (`CloudField`) as
  living texture — never decorative SVG blobs. Inside the builder, the sky
  re-tints per mood.
- **Surfaces / cards:** **frosted glass** — translucent white (`--glass` 45–78%)
  with `backdrop-filter: blur(20px)`, a bright 1px top-light border
  (`--glass-border`), and a **generous 32px radius**. They blur the clouds behind
  them. No opaque white cards; no hard borders.
- **Color:** a cool blue/sky base + **one warm coral accent** (`#ff9b5c`) for all
  primary actions, links, and marks. Text is deep twilight navy ink
  (`--ink #1a2a48`) and a softer blue-grey (`--ink-soft`). The in-app **mood
  system** swaps the accent across fourteen "weathers" (Dream State violet,
  Golden Hour amber, Moonlight blue, Greenhouse green…).
- **Type:** display is **EB Garamond**, set **light (300)**, large, tight
  (`-2.5px` tracking), with **italic** for emphasis. Body is **Outfit** at a
  generous 1.65 line-height. Hand is **Caveat** for signatures. Headlines are
  quiet and big; the contrast is size + italic, not weight.
- **Buttons & inputs:** full **pills** (`999px`). Primary = coral fill with a
  soft coral glow (`--shadow-accent`); secondary = frosted glass; ghost =
  hairline outline. Labels lowercase, often `→`.
- **Corner radii:** pills `999px`; feature cards `32–36px`; tiles & images
  `16px`; squared inputs `12px`. Everything is soft.
- **Shadows:** **cool and diffuse**, blue-grey, never black — light scattering
  through cloud (`0 24px 60px rgba(120,150,200,.2)`). The only warm shadow is the
  coral CTA halo.
- **Borders:** mostly the bright translucent-white glass edge; hairlines are
  low-opacity ink (`rgba(26,42,72,.12)`).
- **Transparency & blur** are core, not garnish: nav bars, cards, chips, and
  pills are all semi-transparent and blurred so the sky always shows through.
- **Imagery vibe:** clouds are **warm, soft, slightly pink-lit** at the edges —
  dreamy, high-key, low-contrast. Product imagery sits in softly-tinted wells.
- **Motion:** gentle and unhurried. Hovers **lift 1px** and brighten; nothing
  bounces or shrinks aggressively. Sky/mood cross-fades are a long, dreamy
  **1.6s** ease. Wispy does a slow 4s idle bob. All motion respects
  `prefers-reduced-motion`.
- **Layout:** centered, max-width ~1240px, lots of air — sections breathe at
  **80–120px** apart. Sticky frosted nav. Single warm focal accent per view.

---

## Iconography

DaydreamDwelling is **light on icons by design** — its decoration is
typographic.

- **Brand glyphs:** Unicode sparkles **`✦` `✧` `◈`**, plus `⚡` (features) and
  `★` (ratings), always set in **coral**. These prefix eyebrows and section
  marks. They are the closest thing the brand has to a custom icon set.
- **The logo mark:** a soft 4-ellipse **cloud** (recreated in `Logo`), or the
  product's alternate isometric "three-D room" mark
  (`packages/shared/Logo.jsx`). The cloud is the marketing mark.
- **No emoji**, ever, in product copy.
- **Functional UI icons** (search, close, cart, chevrons) use a **light line
  set** — substitute **Lucide** or **Heroicons** at a **1.5px stroke** to match
  the airy feel. *(Substitution flagged: the source app mostly hand-rolls tiny
  inline SVGs and Unicode arrows rather than shipping an icon font; no icon font
  was exported, so a CDN line set is the recommended stand-in.)*
- **Bundled imagery** lives in `assets/`: `clouds/` (8 soft cloud webps for
  drifting backdrops), `wispy/` (the mascot's body + face), `logo/` (the Relume
  wordmark SVGs), `fonts/` (Outfit woff2).

---

## Index — what's in this folder

**Foundations**
- `styles.css` — the single entry point (▶ link this). `@import`s only.
- `tokens/colors.css` · `typography.css` · `spacing.css` · `fonts.css` · `base.css`
- `guidelines/*.html` — foundation specimen cards (Colors, Type, Spacing, Brand)

**Components** (`window.DesignSystem_6aea8d.<Name>`)
- `components/core/` — `Button`, `GlassCard`, `Eyebrow`, `Pill`, `Input`
- `components/brand/` — `Logo`, `Wispy`, `MoodSwatch`
- `components/marketplace/` — `ProductCard`
- each has `<Name>.jsx` + `.d.ts` + `.prompt.md`, and a `*.card.html` demo

**UI kits** (full screens, compose the components)
- `ui_kits/landing/index.html` — the marketing home (sky, clouds, hero, waitlist,
  how-it-works, founder note, Wispy, moods, Blossoms, footer)
- `ui_kits/marketplace/index.html` — the shop grid (search, categories, tiles)

**Assets** — `assets/clouds/`, `assets/wispy/`, `assets/logo/`, `assets/fonts/`

**Other** — `SKILL.md` (Agent-Skill manifest), `readme.md` (this file)

---

## Caveats

- **EB Garamond + Caveat are CDN fonts** (Google Fonts) — no local binaries were
  provided. Please send the licensed woff2 files to self-host for production.
- The **3D room builder** (the product's hero surface) is **not** recreated — it's
  a React-Three-Fiber scene. The landing hero uses a flat CSS "room preview"
  stand-in. Explore `apps/customer/src/scene/` + `ui/` in the repo to build it.
- **Product imagery is placeholder** (soft gradient wells) — the live shop pulls
  maker photos from Supabase. Drop real photography into `ProductCard image`.
- Two color directions exist in the sources (live sky/coral vs. Relume
  fuchsia/Fraunces). This system commits to the **live sky/coral** brand; the
  Relume palette survives only as the neutral ramp.
