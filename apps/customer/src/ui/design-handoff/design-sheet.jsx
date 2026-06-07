// Shared UI primitives for the builder chrome. Everything derives its colors
// from the active mood theme via ui(theme).
const UIH = { useState: React.useState, useRef: React.useRef, useEffect: React.useEffect };

function ui(t) {
  const dark = t.isDark;
  return {
    panel: dark ? 'rgba(20,23,42,0.97)' : 'rgba(255,255,255,0.97)',
    card: dark ? 'rgba(255,255,255,0.05)' : 'rgba(120,100,170,0.06)',
    cardHi: dark ? 'rgba(255,255,255,0.09)' : 'rgba(120,100,170,0.11)',
    border: t.surfaceBorder,
    line: dark ? 'rgba(255,255,255,0.08)' : 'rgba(60,40,90,0.10)',
    text: t.text, soft: t.textSoft, accent: t.accent, accentText: t.accentText,
    nav: t.navBg, glow: t.glow, dark,
  };
}

function money(n) { return '$' + n.toLocaleString(); }

// Striped product placeholder with a color swatch + monospace category label.
function Thumb({ item, theme, h = 96, radius = 12 }) {
  const u = ui(theme);
  const col = item._color || item.color;
  return React.createElement('div', {
    style: {
      height: h, borderRadius: radius, position: 'relative', overflow: 'hidden',
      background: `repeating-linear-gradient(135deg, ${u.dark ? 'rgba(255,255,255,0.04)' : 'rgba(90,70,140,0.05)'} 0 7px, transparent 7px 14px), ${u.card}`,
      border: `1px solid ${u.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
  },
    React.createElement('div', {
      style: {
        width: '54%', height: '54%', borderRadius: 10,
        background: `linear-gradient(150deg, ${shade(col, 0.12)}, ${shade(col, -0.16)})`,
        boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
      },
    }),
    React.createElement('span', {
      style: {
        position: 'absolute', bottom: 6, left: 8, fontFamily: "'Spline Sans Mono','SF Mono',monospace",
        fontSize: 8.5, letterSpacing: '0.04em', color: u.soft, opacity: 0.8, textTransform: 'uppercase',
      },
    }, item.cat || item.sub || 'item'),
  );
}

function Stars({ rating, reviews, theme, size = 11 }) {
  const u = ui(theme);
  return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: size, fontWeight: 700, color: '#f0b54a' } },
    React.createElement(Icon, { name: 'star', size: size + 1, color: '#f0b54a', style: { fill: '#f0b54a' } }),
    rating,
    reviews ? React.createElement('span', { style: { color: u.soft, fontWeight: 500 } }, ` (${reviews})`) : null,
  );
}

function Chip({ active, onClick, children, theme, tint }) {
  const u = ui(theme);
  const a = tint || u.accent;
  return React.createElement('button', {
    onClick,
    style: {
      padding: '7px 13px', borderRadius: 999, whiteSpace: 'nowrap', cursor: 'pointer',
      border: `1px solid ${active ? a : u.line}`,
      background: active ? a : 'transparent',
      color: active ? (tint ? '#fff' : u.accentText) : u.soft,
      fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', letterSpacing: '0.01em',
      transition: 'all .15s', flexShrink: 0,
    },
  }, children);
}

function Btn({ children, onClick, variant = 'soft', theme, full, size = 'md', style }) {
  const u = ui(theme);
  const pad = size === 'sm' ? '8px 12px' : size === 'lg' ? '14px 18px' : '11px 16px';
  const styles = {
    primary: { background: u.accent, color: u.accentText, border: `1px solid ${u.accent}` },
    soft: { background: u.card, color: u.text, border: `1px solid ${u.line}` },
    ghost: { background: 'transparent', color: u.soft, border: `1px solid ${u.line}` },
    danger: { background: 'transparent', color: '#e8736f', border: '1px solid rgba(232,115,111,0.4)' },
  }[variant];
  return React.createElement('button', {
    onClick,
    style: {
      padding: pad, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
      fontSize: size === 'lg' ? 15 : 13.5, fontWeight: 700, width: full ? '100%' : undefined,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'all .15s', ...styles, ...style,
    },
  }, children);
}

function Stepper({ value, onChange, theme, suffix }) {
  const u = ui(theme);
  const b = { width: 30, height: 30, borderRadius: 9, border: `1px solid ${u.line}`, background: u.card, color: u.text, cursor: 'pointer', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
    React.createElement('button', { style: b, onClick: () => onChange(value - 1) }, '–'),
    React.createElement('span', { style: { minWidth: 30, textAlign: 'center', fontWeight: 800, fontSize: 15, color: u.text } }, value + (suffix || '')),
    React.createElement('button', { style: b, onClick: () => onChange(value + 1) }, '+'),
  );
}

// Sheet shell. variant: 'bottom' (mobile) or 'side' (tablet/desktop).
function Sheet({ variant, theme, title, accentDot, onClose, children, footer, sideGeom, height }) {
  const u = ui(theme);
  const isBottom = variant === 'bottom';
  const wrap = isBottom ? {
    position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 60,
    maxHeight: height || '82%', borderRadius: '22px 22px 0 0',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.28)',
  } : {
    position: 'absolute', top: sideGeom.top, bottom: sideGeom.bottom, left: sideGeom.left,
    width: sideGeom.width, zIndex: 60, borderRadius: 20,
    boxShadow: '0 16px 50px rgba(0,0,0,0.26)',
  };
  return React.createElement('div', {
    className: 'ddd-sheet',
    style: {
      ...wrap, background: u.panel, backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${u.border}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: "'Outfit',system-ui,sans-serif", color: u.text,
    },
  },
    isBottom && React.createElement('div', { onClick: onClose, style: { display: 'flex', justifyContent: 'center', padding: '8px 0 2px', cursor: 'pointer', flexShrink: 0 } },
      React.createElement('div', { style: { width: 38, height: 4, borderRadius: 2, background: u.soft, opacity: 0.5 } })),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 9, padding: isBottom ? '6px 16px 10px' : '15px 16px 11px', flexShrink: 0 } },
      accentDot && React.createElement('span', { style: { width: 9, height: 9, borderRadius: '50%', background: accentDot, flexShrink: 0 } }),
      React.createElement('h3', { style: { margin: 0, fontSize: 16.5, fontWeight: 800, letterSpacing: '-0.01em', flex: 1 } }, title),
      React.createElement('button', { onClick: onClose, style: { width: 32, height: 32, borderRadius: 9, border: `1px solid ${u.line}`, background: u.card, color: u.soft, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
        React.createElement(Icon, { name: 'close', size: 16 })),
    ),
    React.createElement('div', { className: 'ddd-sheet-body', style: { overflowY: 'auto', overflowX: 'hidden', padding: '0 16px 16px', flex: 1, WebkitOverflowScrolling: 'touch' } }, children),
    footer && React.createElement('div', { style: { padding: 14, borderTop: `1px solid ${u.line}`, flexShrink: 0, background: u.panel } }, footer),
  );
}

Object.assign(window, { ui, money, Thumb, Stars, Chip, Btn, Stepper, Sheet });
