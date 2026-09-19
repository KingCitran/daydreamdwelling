// D-shaped button family — the DaydreamDwelling brand button.
// Pill with stem side squared: bowl-right = forward, bowl-left = back.
// Dream State palette: primary #7a48cc, secondary #ddd4f5, tertiary outline.

const VARIANTS = {
  primary:   { bg: '#7a48cc', color: '#fff', hoverBg: '#6a3bb8', shadow: '0 8px 20px rgba(122,72,204,.22)' },
  secondary: { bg: '#ddd4f5', color: '#2a1848', hoverBg: '#d1c6f0', shadow: 'none' },
  tertiary:  { bg: 'transparent', color: '#2a1848', hoverBg: 'transparent', border: '1px solid #b7a7e6', shadow: 'none' },
  disabled:  { bg: '#ede9ff', color: '#9a8cc2', shadow: 'none' },
}

const SIZES = {
  lg: { height: 50, fontSize: 15, padding: '0 30px 0 22px', radius: '6px 999px 999px 6px' },
  md: { height: 44, fontSize: 14, padding: '0 26px 0 18px', radius: '5px 999px 999px 5px' },
  sm: { height: 32, fontSize: 13, padding: '0 14px 0 10px', radius: '4px 999px 999px 4px' },
}

export default function DButton({
  children, variant = 'primary', size = 'md', reverse = false,
  disabled = false, onClick, href, style, ...props
}) {
  const v = disabled ? VARIANTS.disabled : VARIANTS[variant] || VARIANTS.primary
  const s = SIZES[size] || SIZES.md
  const radius = reverse
    ? s.radius.split(' ').reverse().join(' ')  // flip for back/close actions
    : s.radius

  const btnStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: s.height, padding: s.padding, borderRadius: radius,
    background: v.bg, color: v.color, border: v.border || 'none',
    boxShadow: v.shadow,
    fontSize: s.fontSize, fontWeight: 500, fontFamily: "'Commissioner', system-ui, sans-serif",
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none', whiteSpace: 'nowrap',
    transition: 'transform .18s, background .18s',
    touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
    ...style,
  }

  if (href && !disabled) {
    return <a href={href} style={btnStyle} {...props}>{children}</a>
  }
  return <button onClick={disabled ? undefined : onClick} disabled={disabled} style={btnStyle} {...props}>{children}</button>
}

// Chip variant — smaller, for filter tags
export function DChip({ children, active, onClick, style, ...props }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: 32, padding: '0 14px 0 10px',
      borderRadius: '4px 999px 999px 4px',
      background: active ? '#ddd4f5' : 'transparent',
      color: active ? '#2a1848' : '#7a6aa8',
      border: `1px solid ${active ? '#7a48cc' : '#b7a7e6'}`,
      fontSize: 13, fontWeight: 500, fontFamily: "'Commissioner', system-ui, sans-serif",
      cursor: 'pointer', whiteSpace: 'nowrap',
      transition: 'all .18s',
      touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
      ...style,
    }} {...props}>{children}</button>
  )
}
