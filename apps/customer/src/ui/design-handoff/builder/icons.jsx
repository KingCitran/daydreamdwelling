// Icon — 24×24, currentColor stroke, round caps. Adapted from the product's
// shared Icon library (same drawing rules) plus a few additions in-style.
const ICON_PATHS = {
  place:    '<path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z"/><path d="M4 8.5 12 13l8-4.5M12 13v7"/>',
  build:    '<path d="M14 7l3-3 3 3-3 3M15.5 8.5 5 19l-2-2L13.5 6.5"/>',
  swatch:   '<circle cx="9" cy="9" r="4.5"/><circle cx="15.5" cy="15" r="4.5"/>',
  eye:      '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/>',
  music:    '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  plan:     '<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4V3h6v1M9 9h6M9 13h6M9 17h3"/>',
  users:    '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.7"/>',
  user:     '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  cart:     '<path d="M3 4h2l2.5 11h11l2-7H7M9 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>',
  search:   '<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',
  filter:   '<path d="M4 6h16M7 12h10M10 18h4"/>',
  sliders:  '<path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/>',
  heart:    '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  rotate:   '<path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5"/>',
  trash:    '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  info:     '<circle cx="12" cy="12" r="9"/><path d="M12 8v0.1M11 12h1v5h1"/>',
  lock:     '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check:    '<path d="M5 12l4 4 10-10"/>',
  plus:     '<path d="M12 5v14M5 12h14"/>',
  minus:    '<path d="M5 12h14"/>',
  close:    '<path d="M6 6l12 12M18 6 6 18"/>',
  more:     '<path d="M5 7h14M5 12h14M5 17h14"/>',
  grid:     '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  chevronRight:'<path d="M9 6l6 6-6 6"/>',
  chevronLeft: '<path d="M15 6l-6 6 6 6"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  chevronUp:   '<path d="M6 15l6-6 6 6"/>',
  undo:     '<path d="M9 7H5V3M5 7a9 9 0 1 1-2 6" />',
  redo:     '<path d="M15 7h4V3M19 7a9 9 0 1 0 2 6"/>',
  camera:   '<path d="M3 8h3l1.5-2h9L18 8h3v11H3z"/><circle cx="12" cy="13" r="3.5"/>',
  share:    '<circle cx="6" cy="12" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="17" cy="18" r="2.5"/><path d="M8.2 11 14.8 7.2M8.2 13l6.6 3.8"/>',
  wall:     '<path d="M3 5h18v14H3z M3 10h18M3 15h18M9 5v5M15 10v5M6 15v4M18 5v5"/>',
  floor:    '<path fill="currentColor" fill-opacity="0.18" stroke="none" d="M4 15.5l8 4.5 8-4.5-8-4.5z"/><path d="M4 15.5l8-4.5 8 4.5-8 4.5zM4 15.5v-1M20 15.5v-1M12 11v9"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.3 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.3-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z"/>',
  sparkle:  '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  bell:     '<path d="M6 9a6 6 0 1 1 12 0v4l2 3H4l2-3zM10 19a2 2 0 0 0 4 0"/>',
  ruler:    '<rect x="2.5" y="8" width="19" height="8" rx="1.5" transform="rotate(-45 12 12)"/><path d="M9 9l1.2 1.2M11.5 6.5l1.8 1.8M14 4l1.2 1.2"/>',
  home:     '<path d="M4 11l8-7 8 7M6 10v9h12v-9"/>',
  trophy:   '<path d="M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 18h6M10 18l.5-3h3l.5 3M8 21h8"/>',
  layers:   '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5" opacity="0.5"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  signout:  '<path d="M9 5H5v14h4M16 8l4 4-4 4M10 12h10"/>',
  star:     '<path d="M12 4l2.3 5.3L20 10l-4 3.8 1 5.7L12 16.8 7 19.5l1-5.7L4 10l5.7-.7z"/>',
};

function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.9, style }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { flexShrink: 0, display: 'block', ...style },
    'aria-hidden': true,
    dangerouslySetInnerHTML: { __html: d },
  });
}

window.Icon = Icon;
window.ICON_PATHS = ICON_PATHS;
