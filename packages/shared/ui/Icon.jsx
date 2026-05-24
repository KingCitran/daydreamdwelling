/**
 * Icon.jsx — DaydreamDwelling icon library
 *
 * A single, theme-aware <Icon /> component. Drop this into
 * packages/shared/ui/ (create the folder if needed) and import it from any app:
 *
 *   import { Icon } from '@shared/ui/Icon'
 *   <Icon name="cart" size={20} />
 *   <Icon name="tools" size={24} color="var(--accent)" />
 *
 * DESIGN RULES (so all icons stay consistent when adding new ones):
 *   - 24×24 viewBox
 *   - stroke uses currentColor, stroke-width 1.9, linecap + linejoin "round"
 *   - duotone fills use currentColor at fill-opacity 0.22
 *   - outline-only by default (no solid fills) — use fill-opacity duotone for
 *     "body" icons like the isometric cube (floor/ceiling/shop3d)
 *
 * COMPAT: works with React 18/19, no dependencies. Uses currentColor so it
 * inherits text color by default; pass `color` to override.
 */

import React from 'react'

// ─── Icon path data ────────────────────────────────────────────────────────
// Each entry is a fragment of SVG children rendered inside a 24×24 viewBox.
// Stroke styles are applied globally via the wrapper <svg>.
const PATHS = {
  /* OUTDOOR */
  furniture:
    `<path d="M4 10v8M20 10v8M4 10h16v4H4zM6 14v4M18 14v4"/>`,
  planters:
    `<path d="M12 12c-2-3-4-3-4-1s1.5 3 4 3M12 14c2-3 4-3 4-1s-1.5 3-4 3M12 8v6"/>` +
    `<path d="M6 14h12l-1.5 6h-9z"/>`,
  lighting:
    `<path d="M3 6q4 4 9 4t9-4"/>` +
    `<path d="M6 8v2l-1.5 3h3L6 10M12 10v2l-1.5 3h3L12 12M18 8v2l-1.5 3h3L18 10"/>`,
  decor:
    `<path d="M12 4l1.8 4.6L18 10l-3.4 3 .8 4.6L12 15l-3.4 2.6.8-4.6L6 10l4.2-1.4z"/>`,
  supplies:
    `<path d="M12 21V11M12 11c0-3-2-5-4-5 0 3 2 5 4 5zM12 11c0-3 2-5 4-5 0 3-2 5-4 5z"/>`,
  shade:
    `<path d="M3 12c0-5 4-8 9-8s9 3 9 8H3zM12 12v8M10 20h4"/>`,
  cart:
    `<path d="M3 4h2l2.5 11h11l2-7H7M9 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>`,
  search:
    `<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>`,
  filter:
    `<path d="M4 6h16M7 12h10M10 18h4"/>`,

  /* SELLER */
  dashboard:
    `<path d="M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z"/>`,
  products:
    `<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>`,
  shop3d:
    `<path fill="currentColor" fill-opacity="0.22" stroke="none" d="M4 15.5l8 4.5 8-4.5-8-4.5z"/>` +
    `<path d="M4 15.5l8-4.5 8 4.5-8 4.5zM4 15.5v-7L12 4M20 15.5v-7L12 4M12 4v7"/>`,
  orders:
    `<path d="M5 7h14l-1 12H6zM9 7V5a3 3 0 0 1 6 0v2"/>`,
  earnings:
    `<path d="M3 17l5-6 4 3 5-7 4 5"/><path d="M3 21h18"/>`,
  notifications:
    `<path d="M6 9a6 6 0 1 1 12 0v4l2 3H4l2-3zM10 19a2 2 0 0 0 4 0"/>`,
  messages:
    `<path d="M4 5h16v11H8l-4 4z"/><path d="M8 10h8M8 13h5"/>`,
  shipping:
    `<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>`,
  reviews:
    `<path d="M12 4l2.5 5.5L20 10l-4 3.8 1 5.5L12 16.6 7 19.3l1-5.5L4 10l5.5-.5z"/>`,
  discounts:
    `<path d="M13 3l8 8-10 10-8-8V3h10z"/><circle cx="8" cy="8" r="1.4"/>`,
  promoted:
    `<path d="M3 10v4l14 6V4zM17 8v8M3 14a3 3 0 0 0 3 3h2l1 4h3l-1-4"/>`,
  tools:
    `<path d="M3 9h18v11H3zM9 9V6a3 3 0 0 1 6 0v3M3 13h6v2h6v-2h6"/>`,
  settings:
    `<circle cx="12" cy="12" r="3"/>` +
    `<path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>`,

  /* BUILDER */
  wishlist:
    `<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>`,
  wall:
    `<path d="M3 6h18M3 12h18M3 18h18M9 6v6M15 12v6M7 18v0M17 6v0"/>`,
  ceiling:
    // Ceiling is Floor rotated 180°
    `<g transform="rotate(180 12 12)">` +
      `<path fill="currentColor" fill-opacity="0.22" stroke="none" d="M4 15.5l8 4.5 8-4.5-8-4.5z"/>` +
      `<path d="M4 15.5l8-4.5 8 4.5-8 4.5zM4 15.5v-7L12 4M20 15.5v-7L12 4M12 4v7"/>` +
    `</g>`,
  floor:
    `<path fill="currentColor" fill-opacity="0.22" stroke="none" d="M4 15.5l8 4.5 8-4.5-8-4.5z"/>` +
    `<path d="M4 15.5l8-4.5 8 4.5-8 4.5zM4 15.5v-7L12 4M20 15.5v-7L12 4M12 4v7"/>`,
  rotate:
    `<path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5"/>`,
  undo:
    `<path d="M4 10h11a5 5 0 0 1 0 10h-4M4 10l5-5M4 10l5 5"/>`,
  swatch:
    `<circle cx="9" cy="9" r="5"/><circle cx="15" cy="15" r="5"/>`,
  save:
    `<path d="M5 4h12l3 3v13H5zM8 4v6h8V4M8 14h8v6H8z"/>`,
  trash:
    `<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>`,
  info:
    `<circle cx="12" cy="12" r="9"/><path d="M12 8v0.1M11 12h1v5h1"/>`,
  lock:
    `<rect x="5" y="11" width="14" height="10" rx="2"/>` +
    `<path d="M8 11V8a4 4 0 0 1 8 0v3"/>`,
  user:
    `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,

  /* COMMON */
  chevronRight: `<path d="M9 6l6 6-6 6"/>`,
  chevronDown:  `<path d="M6 9l6 6 6-6"/>`,
  chevronLeft:  `<path d="M15 6l-6 6 6 6"/>`,
  chevronUp:    `<path d="M6 15l6-6 6 6"/>`,
  close:        `<path d="M6 6l12 12M18 6l-12 12"/>`,
  menu:         `<path d="M4 7h16M4 12h16M4 17h16"/>`,
  external:     `<path d="M14 4h6v6M20 4L10 14M14 12v7H5V10h7"/>`,
  plus:         `<path d="M12 5v14M5 12h14"/>`,
  check:        `<path d="M5 12l4 4 10-10"/>`,
  signout:      `<path d="M9 5H5v14h4M16 8l4 4-4 4M10 12h10"/>`,

  /* STATUS */
  paid:
    `<circle cx="12" cy="12" r="9"/><path d="M7 12l3.5 3.5L17 9"/>`,
  pending:
    `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  shipped:
    `<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>`,
}

export const ICON_NAMES = Object.keys(PATHS)

/**
 * <Icon name="cart" size={20} color="currentColor" strokeWidth={1.9} />
 *
 * Props:
 *   name         — required, one of ICON_NAMES
 *   size         — px (default 20)
 *   color        — stroke + duotone fill color (default "currentColor")
 *   strokeWidth  — default 1.9
 *   className    — optional, passthrough
 *   style        — optional, merged with vertical-align: -2px for inline text use
 *   title        — optional, accessible label (adds <title> + role="img")
 *   ...rest      — any other SVG prop
 */
export function Icon({
  name,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.9,
  className,
  style,
  title,
  ...rest
}) {
  const d = PATHS[name]
  if (!d) {
    if (typeof console !== 'undefined') {
      console.warn(`<Icon> unknown name: "${name}". Valid names:`, ICON_NAMES)
    }
    return null
  }

  const a11y = title
    ? { role: 'img', 'aria-label': title }
    : { 'aria-hidden': true, focusable: false }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ verticalAlign: '-2px', flexShrink: 0, ...style }}
      {...a11y}
      {...rest}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: (title ? `<title>${title}</title>` : '') + d,
      }}
    />
  )
}

export default Icon
