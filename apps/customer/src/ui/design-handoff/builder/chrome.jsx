// Chrome: brand mark, top bar, tool dock (responsive), selected-item action pill.
function Logo({ size = 30, color = 'currentColor' }) {
  return React.createElement('svg', { width: size, height: size, viewBox: '0 0 48 48', fill: 'none', style: { display: 'block', flexShrink: 0 } },
    React.createElement('path', { d: 'M24 38 L8 29 L8 25 Q8 19 14 16 L24 10 L24 14 L16 19 Q12 21.5 12 25 L12 27 L24 34Z', fill: color, opacity: 0.25 }),
    React.createElement('path', { d: 'M8 25 L8 13 Q8 7 14 4 L24 10 L24 14 L16 19 Q12 21.5 12 25Z', fill: color, opacity: 0.6 }),
    React.createElement('path', { d: 'M24 10 L34 4 Q40 7 40 13 L40 25 Q40 21.5 36 19 L24 14Z', fill: color, opacity: 0.4 }),
    React.createElement('path', { d: 'M24 38 L40 29 L40 25 Q40 21.5 36 19 L24 14 L24 34Z', fill: color, opacity: 0.18 }),
    React.createElement('g', { transform: 'translate(24,8)', opacity: 0.85 },
      React.createElement('path', { d: 'M0 -3L0.6 -0.6L3 0L0.6 0.6L0 3L-0.6 0.6L-3 0L-0.6 -0.6Z', fill: color })),
  );
}

function IconBtn({ theme, icon, onClick, label, badge, active, size = 38 }) {
  const u = ui(theme);
  return React.createElement('button', { onClick, title: label, 'aria-label': label,
    style: { width: size, height: size, borderRadius: 12, flexShrink: 0, position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${active ? u.accent : u.line}`, background: active ? u.accent + '1c' : u.card, color: active ? u.accent : u.text } },
    React.createElement(Icon, { name: icon, size: Math.round(size * 0.5) }),
    badge ? React.createElement('span', { style: { position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 9, background: u.accent, color: u.accentText, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${u.nav}` } }, badge) : null,
  );
}

function RoomSwitcher({ theme, mode, room, rooms, onPick, onNew }) {
  const u = ui(theme);
  const [open, setOpen] = UIH.useState(false);
  return React.createElement('div', { style: { position: 'relative', minWidth: 0, flexShrink: mode === 'mobile' ? 1 : 0 } },
    React.createElement('button', { onClick: () => setOpen(o => !o),
      style: { display: 'flex', alignItems: 'center', gap: 7, padding: mode === 'mobile' ? '6px 10px' : '8px 13px', borderRadius: 12, cursor: 'pointer', border: `1px solid ${u.line}`, background: u.card, color: u.text, fontFamily: 'inherit', maxWidth: '100%' } },
      React.createElement(Icon, { name: 'home', size: 15, color: u.soft }),
      React.createElement('span', { style: { fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, room),
      React.createElement(Icon, { name: 'chevronDown', size: 14, color: u.soft }),
    ),
    open && React.createElement('div', { style: { position: 'absolute', top: '110%', left: 0, minWidth: 200, background: u.panel, border: `1px solid ${u.border}`, borderRadius: 14, padding: 6, zIndex: 120, boxShadow: '0 14px 40px rgba(0,0,0,0.28)', backdropFilter: 'blur(16px)' } },
      rooms.map(r => React.createElement('button', { key: r, onClick: () => { onPick(r); setOpen(false); },
        style: { display: 'flex', width: '100%', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: r === room ? u.accent + '16' : 'transparent', color: r === room ? u.accent : u.text, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, textAlign: 'left' } },
        React.createElement(Icon, { name: 'home', size: 15 }), r, r === room && React.createElement(Icon, { name: 'check', size: 15, style: { marginLeft: 'auto' } }))),
      React.createElement('div', { style: { height: 1, background: u.line, margin: '4px 6px' } }),
      React.createElement('button', { onClick: () => { onNew(); setOpen(false); },
        style: { display: 'flex', width: '100%', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: u.soft, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, textAlign: 'left' } },
        React.createElement(Icon, { name: 'plus', size: 15 }), 'New room'),
    ),
  );
}

function BudgetChip({ theme, total, count, onClick, compact }) {
  const u = ui(theme);
  return React.createElement('button', { onClick, title: 'Room budget',
    style: { display: 'flex', alignItems: 'center', gap: compact ? 5 : 7, padding: compact ? '6px 9px' : '8px 12px', borderRadius: 12, cursor: 'pointer', border: `1px solid ${u.line}`, background: u.card, color: u.text, fontFamily: 'inherit', flexShrink: 0 } },
    React.createElement('span', { style: { width: 7, height: 7, borderRadius: '50%', background: '#3fb88a', flexShrink: 0 } }),
    React.createElement('span', { style: { fontSize: compact ? 13 : 14, fontWeight: 800 } }, money(total)),
    !compact && React.createElement('span', { style: { fontSize: 11.5, color: u.soft, fontWeight: 600 } }, `· ${count} item${count === 1 ? '' : 's'}`),
  );
}

function TopBar({ theme, mode, room, rooms, onPickRoom, onNewRoom, budget, count, onBudget, onUndo, onRedo, canUndo, canRedo, cartCount, onCart, onScreenshot, onShare, onAccount, geom }) {
  const u = ui(theme);
  const bar = { position: 'absolute', top: 0, left: 0, right: 0, height: geom.topH, zIndex: 80, display: 'flex', alignItems: 'center', gap: mode === 'mobile' ? 8 : 12, padding: mode === 'mobile' ? 'max(env(safe-area-inset-top), 30px) 10px 0' : '0 16px', background: u.nav, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderBottom: `1px solid ${u.line}`, fontFamily: "'Outfit',system-ui,sans-serif", color: u.text };
  if (mode === 'mobile') {
    return React.createElement('header', { style: bar },
      React.createElement(Logo, { size: 30, color: u.accent }),
      React.createElement('div', { style: { flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' } },
        React.createElement(RoomSwitcher, { theme, mode, room, rooms, onPick: onPickRoom, onNew: onNewRoom }),
        React.createElement(BudgetChip, { theme, total: budget, count, onClick: onBudget, compact: true }),
      ),
      React.createElement(IconBtn, { theme, icon: 'undo', onClick: onUndo, label: 'Undo', size: 36 }),
      React.createElement(IconBtn, { theme, icon: 'cart', onClick: onCart, label: 'Cart', badge: cartCount || null, size: 36 }),
    );
  }
  return React.createElement('header', { style: bar },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 } },
      React.createElement(Logo, { size: 32, color: u.accent }),
      mode === 'desktop' && React.createElement('span', { style: { fontFamily: "'EB Garamond',Georgia,serif", fontSize: 21, fontWeight: 500, letterSpacing: '-0.01em' } }, 'Daydream', React.createElement('span', { style: { color: u.accent, fontStyle: 'italic' } }, 'Dwelling')),
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 9 } },
      React.createElement(RoomSwitcher, { theme, mode, room, rooms, onPick: onPickRoom, onNew: onNewRoom }),
      React.createElement(BudgetChip, { theme, total: budget, count, onClick: onBudget }),
    ),
    React.createElement('div', { style: { flex: 1 } }),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 } },
      React.createElement(IconBtn, { theme, icon: 'undo', onClick: onUndo, label: 'Undo', active: false }),
      React.createElement(IconBtn, { theme, icon: 'redo', onClick: onRedo, label: 'Redo' }),
      React.createElement('div', { style: { width: 1, height: 26, background: u.line, margin: '0 2px' } }),
      React.createElement(IconBtn, { theme, icon: 'camera', onClick: onScreenshot, label: 'Screenshot' }),
      React.createElement(IconBtn, { theme, icon: 'share', onClick: onShare, label: 'Share room' }),
      React.createElement(IconBtn, { theme, icon: 'cart', onClick: onCart, label: 'Cart', badge: cartCount || null }),
      React.createElement(IconBtn, { theme, icon: 'user', onClick: onAccount, label: 'Account' }),
    ),
  );
}

// Tool dock — bottom bar (mobile) or vertical rail (tablet/desktop).
function ToolDock({ theme, mode, tools, active, onPick, geom }) {
  const u = ui(theme);
  if (mode === 'mobile') {
    return React.createElement('nav', { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: geom.dockH, zIndex: 70, display: 'flex', alignItems: 'stretch', padding: '6px 8px', paddingBottom: 'max(6px, env(safe-area-inset-bottom))', background: u.nav, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderTop: `1px solid ${u.line}`, fontFamily: "'Outfit',sans-serif" } },
      tools.map(id => {
        const t = TOOLS[id] || { label: 'More', icon: 'more', tint: u.accent };
        const on = active === id;
        return React.createElement('button', { key: id, onClick: () => onPick(id),
          style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', minWidth: 0, padding: 0 } },
          React.createElement('span', { style: { width: 46, height: 32, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? t.tint : 'transparent', color: on ? '#fff' : u.soft, transition: 'all .15s' } },
            React.createElement(Icon, { name: id === 'more' ? 'more' : t.icon, size: 21, strokeWidth: on ? 2.1 : 1.9 })),
          React.createElement('span', { style: { fontSize: 10.5, fontWeight: on ? 800 : 600, color: on ? u.text : u.soft } }, t.label),
        );
      }),
    );
  }
  // vertical rail
  const railW = geom.railW;
  return React.createElement('nav', { style: { position: 'absolute', top: geom.topH + 12, bottom: 12, left: 12, width: railW, zIndex: 70, display: 'flex', flexDirection: 'column', gap: 6, padding: 8, background: u.nav, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: `1px solid ${u.border}`, borderRadius: 20, fontFamily: "'Outfit',sans-serif", boxShadow: '0 12px 36px rgba(0,0,0,0.18)' } },
    tools.map(id => {
      const t = TOOLS[id] || { label: 'More', icon: 'more', tint: u.accent };
      const on = active === id;
      const wide = mode === 'desktop';
      return React.createElement('button', { key: id, onClick: () => onPick(id), title: t.label,
        style: { display: 'flex', alignItems: 'center', gap: 11, padding: wide ? '10px 12px' : 0, justifyContent: wide ? 'flex-start' : 'center', height: wide ? 'auto' : 50, borderRadius: 14, border: `1px solid ${on ? t.tint + '88' : 'transparent'}`, background: on ? t.tint + '1e' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: u.text } },
        React.createElement('span', { style: { width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? t.tint : u.card, color: on ? '#fff' : u.soft, transition: 'all .15s' } },
          React.createElement(Icon, { name: id === 'more' ? 'more' : t.icon, size: 20 })),
        wide && React.createElement('span', { style: { fontSize: 14, fontWeight: on ? 800 : 600, color: on ? u.text : u.soft } }, t.label),
      );
    }),
  );
}

function ActionPill({ theme, item, geom, mode, onRotate, onDetails, onDelete, onWish, wished }) {
  const u = ui(theme), c = CATALOGUE[item.key];
  const price = c.sizes[item.sizeIndex]?.price || c.price;
  const bottom = mode === 'mobile' ? geom.dockH + 14 : 22;
  const aBtn = (icon, label, onClick, tint) => React.createElement('button', { onClick, title: label, 'aria-label': label,
    style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 12px', borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer', color: tint || u.text, fontFamily: 'inherit', minWidth: 52 } },
    React.createElement(Icon, { name: icon, size: 20 }),
    React.createElement('span', { style: { fontSize: 10.5, fontWeight: 700 } }, label));
  return React.createElement('div', { style: { position: 'absolute', bottom, left: '50%', transform: 'translateX(-50%)', zIndex: 75, display: 'flex', alignItems: 'center', gap: 2, padding: 6, background: u.panel, border: `1px solid ${u.border}`, borderRadius: 18, boxShadow: '0 12px 34px rgba(0,0,0,0.30)', backdropFilter: 'blur(18px)', fontFamily: "'Outfit',sans-serif", maxWidth: 'calc(100% - 24px)' } },
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', padding: '4px 12px 4px 10px', minWidth: 0 } },
      React.createElement('span', { style: { fontSize: 13.5, fontWeight: 800, color: u.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, c.label),
      React.createElement('span', { style: { fontSize: 11.5, fontWeight: 700, color: u.accent } }, money(price)),
    ),
    React.createElement('div', { style: { width: 1, height: 34, background: u.line, flexShrink: 0 } }),
    aBtn('rotate', 'Rotate', onRotate),
    aBtn('sliders', 'Edit', onDetails),
    aBtn('heart', wished ? 'Saved' : 'Save', onWish, wished ? '#ff9ab8' : u.text),
    aBtn('trash', 'Delete', onDelete, '#e8736f'),
  );
}

// On-canvas view controls — rotate the room 90° and zoom. Replaces the old View tab.
function ViewControls({ theme, mode, geom, zoom, roomRot, panelOpen, onRotate, onZoom, onReset }) {
  const u = ui(theme);
  const bottom = mode === 'mobile' ? geom.dockH + 14 : 18;
  const btn = (icon, label, onClick, extra) => React.createElement('button', { onClick, title: label, 'aria-label': label,
    style: { width: 38, height: 38, border: 'none', background: 'transparent', cursor: 'pointer', color: u.text, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 11, ...extra } },
    React.createElement(Icon, { name: icon, size: 19 }));
  const divider = React.createElement('div', { style: { height: 1, alignSelf: 'stretch', background: u.line, margin: '2px 7px' } });
  return React.createElement('div', { style: { position: 'absolute', right: 14, bottom, zIndex: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4, background: u.panel, border: `1px solid ${u.border}`, borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.20)', fontFamily: "'Outfit',sans-serif" } },
    btn('rotate', 'Rotate room left', () => onRotate(-1), { transform: 'scaleX(-1)' }),
    btn('rotate', 'Rotate room right', () => onRotate(1)),
    divider,
    btn('plus', 'Zoom in', () => onZoom(1.15)),
    React.createElement('span', { style: { fontSize: 9.5, fontWeight: 800, color: u.soft, padding: '1px 0' } }, Math.round((zoom || 1) * 100) + '%'),
    btn('minus', 'Zoom out', () => onZoom(1 / 1.15)),
    divider,
    btn('home', 'Reset view', onReset),
  );
}

Object.assign(window, { Logo, IconBtn, RoomSwitcher, BudgetChip, TopBar, ToolDock, ActionPill, ViewControls });
