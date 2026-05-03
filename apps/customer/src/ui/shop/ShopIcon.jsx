// Custom stroke icons for shop browse modes — replaces the emoji set.
// All on a 24×24 viewBox, currentColor stroke at 1.9px, rounded caps/joins.
// Source: design pass in `Shop Mode Icons (1).html`.

const ICONS = {
  // ── Top-level modes ────────────────────────────────────────────────
  byObject: (
    <path d="M4 14v5M20 14v5M5 14h14M5 14a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2M5 14v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
  ),
  byRoom: (
    <>
      <path fill="currentColor" fillOpacity="0.22" stroke="none" d="M4 15.5l8 4.5 8-4.5-8-4.5z" />
      <path d="M4 15.5l8-4.5 8 4.5-8 4.5zM4 15.5v-7L12 4M20 15.5v-7L12 4M12 4v7" />
    </>
  ),
  byVibe: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7zM5 16l.5 1.4L7 18l-1.5.6L5 20l-.5-1.4L3 18l1.5-.6z" />
    </>
  ),
  byColor: (
    <>
      <circle cx="9" cy="9" r="5" />
      <circle cx="15" cy="9" r="5" />
      <circle cx="12" cy="15" r="5" />
    </>
  ),
  byFunction: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </>
  ),

  // ── By Object ──────────────────────────────────────────────────────
  furniture: (
    <path d="M4 14v5M20 14v5M5 14h14M5 14a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2M5 14v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
  ),
  lighting: (
    <path d="M8 13a4 4 0 1 1 8 0c0 1.5-1 2.5-1.5 3.5h-5C9 15.5 8 14.5 8 13zM10 18.5h4M10.5 21h3" />
  ),
  decor: (
    <path d="M9 12h6l-1 8h-4zM10 12V9h4v3M12 9V5M12 5c-1-1-2-1-2.5 0M12 5c1-1 2-1 2.5 0M9 7c-.5-.5-1.5-.5-2 0M15 7c.5-.5 1.5-.5 2 0" />
  ),
  surfaces: (
    <>
      <path fill="currentColor" fillOpacity="0.22" stroke="none" d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" />
    </>
  ),

  // ── By Room ────────────────────────────────────────────────────────
  livingRoom: (
    <path d="M4 13v5M20 13v5M5 15h14M5 15a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2M7 13v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
  ),
  bedroom: (
    <path d="M3 17v-3h18v3M3 17v3M21 17v3M3 14a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2M6 12V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3M13 12V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3" />
  ),
  kitchen: (
    <path d="M5 4h14v16H5zM5 9h14M7 7h0M11 7h0M15 7h0M17 7h0M8 12h8v6H8z" />
  ),
  office: (
    <path d="M3 5h18v11H3zM8 20h8M12 16v4M6 8h8" />
  ),
  diningRoom: (
    <path d="M3 9h18v2H3zM5 11v9M9 11v9M15 11v9M19 11v9" />
  ),
  kidsRoom: (
    <>
      <path d="M5 4h14v16H5z" />
      <circle cx="12" cy="10" r="2.2" />
      <path d="M9 17c1-3 5-3 6 0M10 15l-1-2M14 15l1-2" />
    </>
  ),
  bathroom: (
    <path d="M3 12h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0M8 6v0" />
  ),
  stairs: (
    <path d="M3 20h16M3 20v-4h4v-4h4v-4h4v-4h4M19 4v16" />
  ),

  // ── By Vibe ────────────────────────────────────────────────────────
  cozy: (
    <path d="M3 4h18v4H3zM5 8v12h14V8M8 20v-6h8v6M10 14c0-1 0-2 1-3M13 14c0-1 1-2 0-3" />
  ),
  modern: (
    <path d="M4 4h16v16H4zM4 14h10M14 4v16" />
  ),
  minimalist: (
    <path d="M5 5h14v14H5z" />
  ),
  darkAcademia: (
    <path d="M5 5h5a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H5zM19 5h-5a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h6z" />
  ),
  industrial: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </>
  ),
  cottagecore: (
    <>
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <g key={deg} transform={`rotate(${deg} 12 12)`}>
          <ellipse cx="12" cy="7" rx="1.9" ry="3.2" />
        </g>
      ))}
      <circle cx="12" cy="12" r="1.8" />
    </>
  ),
  tropical: (
    <path d="M12 21V9M12 9c-3-4-8-4-9-1 2 0 5 1 7 2M12 9c3-4 8-4 9-1-2 0-5 1-7 2M12 9c-4-2-6-6-4-8 2 1 4 3 5 6M12 9c4-2 6-6 4-8-2 1-4 3-5 6" />
  ),
  glam: (
    <>
      <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />
      <path d="M19 4v2M20 5h-2M5 18v2M6 19H4" />
    </>
  ),
  rustic: (
    <path d="M12 3l-4 5h2.5L7 13h2.5L6 19h12l-3.5-6H17l-3.5-5H16zM12 19v2" />
  ),
  zen: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a4 4 0 0 1 0 8 4 4 0 0 0 0 8" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  kids: (
    <>
      <circle cx="12" cy="11" r="5" />
      <circle cx="7" cy="7" r="2.2" />
      <circle cx="17" cy="7" r="2.2" />
      <circle cx="10" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M10 14c1 1 3 1 4 0M9 16l-2 5h10l-2-5" />
    </>
  ),

  // ── By Function ────────────────────────────────────────────────────
  seating: (
    <path d="M5 14v6M19 14v6M5 15h14a2 2 0 0 0 0-4 2 2 0 0 1-2-2V5H7v4a2 2 0 0 1-2 2 2 2 0 0 0 0 4z" />
  ),
  storage: (
    <path d="M4 5h16v5H4zM4 10h16v9H4zM4 14h16M9 7h6M9 12h0M15 12h0" />
  ),
  work: (
    <path d="M4 6h16v10H4zM9 20h6M12 16v4M9 11l2 2 4-4" />
  ),
  relax: (
    <>
      <path stroke="none" fill="currentColor" d="M12 6c-1.2 1.6-1.9 3.5-1.9 5.5 0 1.4.4 2.5 1.1 3.1.3.2.6.2.8.2s.5 0 .8-.2c.7-.6 1.1-1.7 1.1-3.1 0-2-.7-3.9-1.9-5.5z" />
      <path stroke="none" fill="currentColor" d="M6.6 8.8c-.3 1.3-.2 2.6.3 3.7.5 1.2 1.4 2.1 2.4 2.6.4.2.7.1.9 0 .2-.2.3-.4.2-.7-.1-1.1-.5-2.2-1.2-3.3-.7-1.1-1.6-2-2.6-2.3z" />
      <path stroke="none" fill="currentColor" d="M17.4 8.8c.3 1.3.2 2.6-.3 3.7-.5 1.2-1.4 2.1-2.4 2.6-.4.2-.7.1-.9 0-.2-.2-.3-.4-.2-.7.1-1.1.5-2.2 1.2-3.3.7-1.1 1.6-2 2.6-2.3z" />
      <path stroke="none" fill="currentColor" d="M3.5 13c.4 1.3 1.3 2.4 2.5 3 1.2.7 2.4.9 3.6.7.4-.1.6-.3.7-.5.1-.2 0-.5-.2-.7-.7-.8-1.7-1.5-3-1.9-1.3-.4-2.5-.6-3.6-.6z" />
      <path stroke="none" fill="currentColor" d="M20.5 13c-.4 1.3-1.3 2.4-2.5 3-1.2.7-2.4.9-3.6.7-.4-.1-.6-.3-.7-.5-.1-.2 0-.5.2-.7.7-.8 1.7-1.5 3-1.9 1.3-.4 2.5-.6 3.6-.6z" />
      <ellipse stroke="none" fill="currentColor" cx="12" cy="17" rx="3" ry="0.7" />
    </>
  ),
  entertain: (
    <path d="M7 3h10l-2 8a3 3 0 0 1-6 0zM12 11v7M8 21h8" />
  ),
  sleep: (
    <path d="M4 11v8M20 11v8M4 15h16M4 15a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3M8 12v-3h8v3" />
  ),
  display: (
    <path d="M4 5h16v12H4zM4 13l4-4 4 4 3-3 5 5" />
  ),
}

export default function ShopIcon({ name, size = 20 }) {
  const icon = ICONS[name]
  if (!icon) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      {icon}
    </svg>
  )
}
