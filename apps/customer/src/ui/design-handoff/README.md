# Handoff: DaydreamDwelling — Builder UI Redesign

## Overview
A responsive redesign of the DaydreamDwelling room-builder's **button layout, tool
navigation, and panel system** across three breakpoints (mobile / tablet / desktop).
The goal was a clearer tool model, no duplicated buttons, and quality-of-life
features (undo, budget, room switching, screenshot/share, search/sort, measurements)
surfaced without cluttering the 3D canvas.

The interactive prototype lives in `builder/index.html` (a presenter shell that lets
you flip between the three breakpoints and three "mood" color themes). The flat
design reference lives in `builder/studio-board.html` — **every panel at every size,
in one neutral "Studio" palette.**

## About the Design Files
The files in `builder/` are **design references created in HTML/React** — prototypes
that show the intended look, layout, and behavior. They are **not production code to
copy wholesale.** Your task is to **recreate these designs inside the real app's
existing environment** (`room-platform/apps/customer`, a Vite + React codebase) using
its established components, context, and conventions — not to drop these HTML files in.

The prototype deliberately rebuilds everything in plain `React.createElement` so it can
run as standalone HTML. The real app already has equivalents you should map onto:
`PlaceTabPanel.jsx`, `BuildTabPanel.jsx`, `StylePanel.jsx`, `ViewTabPanel.jsx`,
`MusicTabPanel.jsx`, `PlanTabPanel.jsx`, `SocialTabPanel.jsx`, `AccountModal.jsx`,
`DockablePanel.jsx`, `MobileChrome.jsx`, `SideTabStrip.jsx`, `SideTabContext.jsx`,
`SelectedControls.jsx`, the `ui/shop/*` tabs, and `Icon.jsx`. **Re-implement the
redesign by editing those, not by importing the prototype.**

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and interactions are all final
and intentional. Match them precisely. The one abstraction: the prototype is themed
through a token object (see **Design Tokens**) — every color in the chrome comes from
the active theme, so the same layout re-tints across the three moods. Wire the redesign
to your existing theme system the same way (the real app already has a mood/theme
system in `packages/shared/themes.js`).

---

## Breakpoints & Global Geometry

| Breakpoint | Frame (prototype) | Top bar | Tool navigation | Panels |
|---|---|---|---|---|
| **Mobile**  | 390 × 844 | 84px tall (incl. notch safe-area) | **Bottom dock**, 66px, 4 tabs | **Bottom sheets** (slide up) |
| **Tablet**  | 1024 × 768 | 60px | **Left icon rail**, 64px wide, floating | **Docked side panel** (352px) |
| **Desktop** | 1440 × 880 | 64px | **Left labelled rail**, 192px wide | **Docked side panel** (384px) / centered modals |

Safe-area: the mobile top bar uses `padding-top: max(30px, env(safe-area-inset-top))`
with `<meta viewport ... viewport-fit=cover>` so it insets under a real notch/status
bar when packaged as a native iOS/Android app (works in WKWebView / Android WebView,
not just PWA).

### Tool sets per breakpoint (no tool is ever duplicated)
- **Mobile dock (4):** Place · Build · Style · **More**
- **Tablet rail (6):** Place · Build · Style · View · Music · **More**
- **Desktop rail (8):** Place · Build · Style · View · Music · Plan · Social · **More**

The **More** menu is breakpoint-aware: it shows only secondary tools **not already on
the rail**, plus always-tertiary system items (Account, Saved rooms, Alerts, Settings)
and a row of quick actions (Measure, Capture, Share, Reset). This is the fix for the
"View/Plan/Music appear twice" and "More tiles overflow the panel" feedback — see
`builder/panels.jsx › MoreContent` (uses `min-width: 0` + ellipsis so tiles never
overflow).

---

## Screens / Views

Each "panel" opens from a tool button. On mobile it's a **bottom sheet**; on
tablet/desktop a **docked side panel** anchored beside the rail (cart/checkout become a
**centered modal** on desktop). Layout, copy, and components below are identical across
sizes unless noted — only the container changes.

### 1. Builder · idle (nothing selected)
- The 3D room fills the canvas region (between top bar and dock/rail).
- **Top bar** (left→right): logo; room-name switcher (chevron dropdown, lists rooms +
  "New room"); budget chip (green dot + running `$total` + item count); spacer;
  undo/redo; screenshot (camera); share; cart (badge); account. On mobile the bar is
  condensed: logo · room switcher · compact budget · undo · cart.
- **On-canvas view controls** (bottom-right cluster, all breakpoints): rotate-left,
  rotate-right (90° room rotation), zoom-in, live `%` readout, zoom-out, reset-view.
  This replaces the old "View" tab's room-navigation role.

### 2. Item selected (floating action pill)
- Tapping a furniture piece selects it (accent selection pad under it on the floor).
- A **floating pill** appears bottom-center: item name + price, divider, then
  **Rotate · Edit · Save(♥) · Delete**. Each is an icon over a 10.5px label.
- Drag a selected piece to move it; placement snaps to a 0.5ft grid and is collision-
  checked.

### 3. Place · Shop
- Sticky header row: search input (`Search furniture, sellers…`) + sort `<select>`
  (Featured / Price ↑ / Price ↓ / Top rated).
- Horizontally-scrolling **category chips** (All, Seating, Tables, Storage, Bedroom,
  Lighting, Textiles, Decor, Wall Decor, Specialty).
- **Product grid** (2 cols mobile/desktop, 3 cols tablet). Each card: striped thumbnail
  with a colored product block + monospace category tag; **"In your room"** (accent) or
  **"✓ Owned"** (green) badge top-left; wishlist heart top-right; name + price; brand +
  star rating; a primary **Place** button + an info (`ⓘ`) button that opens detail.

### 4. Item detail
- Large thumbnail (reflects selected color) + brand, name, star rating + review count,
  big price, in-room/owned badge.
- **Size** selector (pill buttons, each showing label + price), **Color** swatches
  (circular, selected ring in accent).
- Actions: **Place in room** (primary) · **Add to cart** · wishlist heart.
- **About** (description + material/sub-category tags), **Find similar** (horizontal
  scroller of same-category items), and a "Report this item" text link.

### 5. Cart
- Line items: thumbnail, name, size label, price, quantity **stepper**, remove link.
- Totals card: subtotal, shipping (free over $800, else $49), divider, **total**.
- Footer: **Checkout · $total** primary button. Empty state shows a cart icon + copy.

### 6. Checkout · success
- Centered green check disc, "Order placed!", confirmation copy. Auto-returns to cart
  after a beat in the prototype (just show the success state in production).

### 7. Style
- Segmented control: **Walls / Floor**.
- Preset swatch grid (4 cols) — wall colors render as solid chips, floor materials as a
  striped/woodgrain fill; selected gets an accent ring. Plus a **custom color** row
  with a native color input ("eyedropper").
- **Lighting mood** row: 3 cards (Dream State / Golden Hour / Moonlight) each previewing
  the mood's sky gradient — selecting one re-tints the entire builder live.

### 8. Build
- Intro line, then a 3-col grid of element tiles: Wall, Door, Window, Opening, Stairs,
  Closet (icon in a rounded square + label). "Tap an element, then tap a wall/floor."

### 9. Plan · Budget
- **Room total** card (big accent number + piece count).
- Spend **by category** — labeled progress bars (category, bar filled to % of total,
  `$` value).
- **Buy everything in this room** (primary, adds all to cart) and a **Show/Hide
  measurements** toggle (overlays ft dimensions on the selected piece).

### 10–12. Music / Social / Account (+ Saved rooms, Settings, Alerts)
- In the prototype these are lightweight descriptive stubs. In production, mount the
  real components (`MusicTabPanel`, `SocialTabPanel`, `AccountModal`, etc.). The
  redesign's only requirement: they open through the same panel container and are
  reachable per the tool-set table above (Music = rail on tablet/desktop, in **More**
  on mobile; Plan/Social = rail on desktop, **More** on smaller sizes).

### 13. More menu
- 2-col grid of tiles (icon square + label + one-line desc; Alerts shows a red dot),
  containing only non-rail tools for that breakpoint + system items.
- **Quick actions** row (4): Measure (toggle), Capture, Share, Reset.

---

## Interactions & Behavior
- **Select / deselect:** tap a piece to select; tap empty floor to deselect.
- **Move:** drag a selected piece; snaps to 0.5ft grid, collision-checked, clamped to
  room bounds. Drag math inverse-rotates so moves stay correct after room rotation.
- **Room rotate:** ±90° steps (square grid keeps it clean & reversible).
- **Zoom:** 0.55×–2.2× around center; reset returns to 0° / 100%.
- **Undo/redo:** history stack (cap 40) of the items array; every place/move/delete/
  style change commits a snapshot.
- **Toasts:** brief confirmation toast on place/remove/share/screenshot/etc.
- **Screenshot:** white flash + "Saved to your room" toast.
- **Sheets:** mobile sheets animate up; have a drag handle; close via handle, X, or
  scrim. (Note: avoid CSS entrance `animation` + `backdrop-filter` on an element
  inside a CSS `transform`-scaled ancestor — in Chromium that blanks the layer. The
  prototype uses opaque panels and no entrance animation for this reason. In the real
  app, where panels aren't inside a scaled presenter, normal blur/animation is fine.)
- **No duplicated tools; More is filtered per breakpoint** (see above).

## State Management
Per-room builder state (the prototype keeps it all in `BuilderApp`; map to your store/
context): `items[]` (each `{id, key, x, y, rot, swatchIndex, sizeIndex}`), `selectedId`,
`activeTool`, `detail` (open item-detail descriptor), `cart[]`, `cartOpen`,
`checkoutDone`, `wishlist:Set`, `owned:Set`, `room` name, `wallColor`, `floorColor`,
`mood`, `measure` (bool), `roomRot` (0–3), `zoom`, plus undo/redo snapshot stacks.
`BuilderApp` accepts an `initial` prop to seed any of these (used by the Studio board to
freeze each panel open — handy reference for which state opens which view).

## Design Tokens

**Type:** `Outfit` (all UI), `EB Garamond` (serif wordmark / a few headers),
`Spline Sans Mono` (tiny uppercase category tags only).

**Theme token shape** (every chrome color derives from the active theme — see
`builder/theme.js`): `bg, surface, surfaceBorder, text, textSoft, accent, accentText,
navBg, glow, sky, floor, wallL, wallR, grid, isDark`.

| Token | Studio (neutral baseline) | Dream State | Golden Hour | Moonlight |
|---|---|---|---|---|
| accent | `#3d4a5c` | `#7a48cc` | `#c87820` | `#5e7ee0` |
| text | `#1f2632` | `#2a1848` | `#2e1e08` | `#d2d9ef` |
| textSoft | `#6b7686` | `#7c6aa0` | `#8a6a30` | `#7e8cba` |
| bg | `#eef0f3` | `#ece7ff` | `#fbf1dd` | `#0b0f1c` |
| isDark | false | false | false | true |

**Studio is the neutral palette in the board** — recoloring = swapping Studio's tokens
for a mood's. Full values for all moods are in `builder/theme.js`.

**Per-tool identity tints** (small accent on the active tab / panel dot; independent of
mood): place `#e87fc8`, build `#3fb88a`, style `#9b7ae0`, view `#5ea8c8`,
music `#8a78e0`, plan `#5bb0c8`, social `#e87fa0`, account `#5fb88a`.

**Radii:** buttons 12 · cards 14–16 · panels/sheets 20 (side) / 22 top (bottom sheet) ·
chips & pills 999. **Hit targets:** ≥44px (dock tabs 46×32 icon zone in a 66px bar;
icon buttons 36–38px). **Sheet sizing:** bottom sheet max-height 82–86%; side panel
352px (tablet) / 384px (desktop), anchored `top: topbar+12`, `left: rail+~36`.

## Assets
No external image assets — the room and furniture are **procedural** (depth-sorted CSS/
SVG cuboids in `builder/iso.jsx`; `shape` + footprint `fw/fd/fh` per catalogue item
drive the blocky stand-ins). Icons are inline SVG (`builder/icons.jsx`, same drawing
rules as the app's `Icon.jsx`). The logo is inline SVG (`Logo` in `builder/chrome.jsx`).
The furniture catalogue (`builder/catalogue.js`) is a curated subset of the real
`items.js` (authentic brands, prices, swatches, ratings) — in production use the real
catalogue.

## Files
In `builder/` (all referenced design source):
- `index.html` — interactive prototype shell (device + mood switcher).
- `studio-board.html` + `board.jsx` — the flat **Studio board**: every panel × every
  size in the neutral palette. Best starting point for visual reference.
- `theme.js` — mood themes + Studio neutral + per-tool tints.
- `catalogue.js` — furniture data + wall/floor presets.
- `icons.jsx` — icon set. `iso.jsx` — procedural isometric room + rotation/zoom.
- `ui.jsx` — primitives (Sheet, Thumb, Chip, Btn, Stepper, Stars…).
- `shop.jsx` — Shop grid + Product card + Item detail.
- `panels.jsx` — Style, Build, Cart, More (+ MoreContent dedup logic).
- `chrome.jsx` — Logo, TopBar, ToolDock (dock/rail), ActionPill, ViewControls.
- `app.jsx` — `BuilderApp` (state), responsive routing, `DeviceFrame`, presenter.

Real-app components to map onto are listed under **About the Design Files**.
