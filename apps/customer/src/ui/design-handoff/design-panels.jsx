// Style, Build, Cart and More panel contents.
const Label = (u, label) => React.createElement('span', { style: { fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: u.soft } }, label);

function Seg({ theme, options, value, onChange }) {
  const u = ui(theme);
  return React.createElement('div', { style: { display: 'flex', gap: 4, padding: 4, background: u.card, borderRadius: 13, border: `1px solid ${u.line}` } },
    options.map(o => React.createElement('button', { key: o.id, onClick: () => onChange(o.id),
      style: { flex: 1, padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, background: value === o.id ? u.accent : 'transparent', color: value === o.id ? u.accentText : u.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 } },
      o.icon && React.createElement(Icon, { name: o.icon, size: 15 }), o.label)),
  );
}

function StyleContent({ theme, surface, wallColor, floorColor, onWall, onFloor, mood, onMood }) {
  const u = ui(theme);
  const [tab, setTab] = UIH.useState('wall');
  const presets = tab === 'wall' ? WALL_PRESETS : FLOOR_PRESETS;
  const current = tab === 'wall' ? wallColor : floorColor;
  const setColor = tab === 'wall' ? onWall : onFloor;
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
    React.createElement(Seg, { theme, value: tab, onChange: setTab, options: [{ id: 'wall', label: 'Walls', icon: 'wall' }, { id: 'floor', label: 'Floor', icon: 'floor' }] }),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 9 } },
      Label(u, tab === 'wall' ? 'Wall colour' : 'Floor material'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 } },
        presets.map(p => {
          const active = current === p.hex;
          return React.createElement('button', { key: p.name, onClick: () => setColor(p.hex),
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: 5, borderRadius: 13, cursor: 'pointer', border: `1px solid ${active ? u.accent : u.line}`, background: active ? u.accent + '14' : 'transparent', fontFamily: 'inherit' } },
            React.createElement('div', { style: { width: '100%', height: 40, borderRadius: 9, background: tab === 'floor' ? `repeating-linear-gradient(90deg, ${shade(p.hex, 0.06)} 0 6px, ${shade(p.hex, -0.08)} 6px 12px)` : `linear-gradient(150deg, ${shade(p.hex, 0.1)}, ${shade(p.hex, -0.1)})`, boxShadow: active ? `0 0 0 2px ${u.accent}55` : 'inset 0 0 0 1px rgba(0,0,0,0.06)' } }),
            React.createElement('span', { style: { fontSize: 10.5, fontWeight: 700, color: active ? u.accent : u.soft } }, p.name),
          );
        }),
      ),
    ),
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 13, background: u.card, border: `1px solid ${u.line}` } },
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: u.text } }, 'Custom colour'),
        React.createElement('div', { style: { fontSize: 11.5, color: u.soft } }, 'Pick any shade with the eyedropper')),
      React.createElement('input', { type: 'color', value: current || '#cccccc', onChange: e => setColor(e.target.value), style: { width: 40, height: 40, borderRadius: 10, border: `1px solid ${u.line}`, background: 'none', cursor: 'pointer', padding: 2 } }),
    ),
    React.createElement('div', { style: { height: 1, background: u.line } }),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 9 } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7 } }, React.createElement(Icon, { name: 'sparkle', size: 15, color: u.accent }), Label(u, 'Lighting mood')),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 } },
        MOOD_KEYS.map(m => {
          const mt = MOODS[m], active = m === mood;
          return React.createElement('button', { key: m, onClick: () => onMood(m),
            style: { display: 'flex', flexDirection: 'column', gap: 6, padding: 8, borderRadius: 13, cursor: 'pointer', textAlign: 'left', border: `1px solid ${active ? u.accent : u.line}`, background: active ? u.accent + '12' : 'transparent', fontFamily: 'inherit' } },
            React.createElement('div', { style: { height: 34, borderRadius: 8, background: mt.sky, border: `1px solid ${u.line}` } }),
            React.createElement('span', { style: { fontSize: 11.5, fontWeight: 800, color: u.text } }, mt.label),
            React.createElement('span', { style: { fontSize: 10, color: u.soft, lineHeight: 1.2 } }, mt.desc),
          );
        }),
      ),
    ),
  );
}

const BUILD_ITEMS = [
  { id: 'wall', label: 'Wall', icon: 'wall' }, { id: 'door', label: 'Door', icon: 'build' },
  { id: 'window', label: 'Window', icon: 'grid' }, { id: 'opening', label: 'Opening', icon: 'layers' },
  { id: 'stairs', label: 'Stairs', icon: 'plan' }, { id: 'closet', label: 'Closet', icon: 'home' },
];
function BuildContent({ theme, onPick }) {
  const u = ui(theme);
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 13 } },
    React.createElement('p', { style: { margin: 0, fontSize: 13, color: u.soft, lineHeight: 1.5 } }, 'Tap an element, then tap a wall or floor in the room to place it. Drag the edges to resize.'),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 } },
      BUILD_ITEMS.map(b => React.createElement('button', { key: b.id, onClick: () => onPick(b.label),
        style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 15, cursor: 'pointer', border: `1px solid ${u.line}`, background: u.card, color: u.text, fontFamily: 'inherit' } },
        React.createElement('span', { style: { width: 42, height: 42, borderRadius: 12, background: u.cardHi, display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.accent } }, React.createElement(Icon, { name: b.icon, size: 21 })),
        React.createElement('span', { style: { fontSize: 12.5, fontWeight: 700 } }, b.label),
      )),
    ),
  );
}

function CartContent({ theme, cart, onQty, onRemove, onCheckout, done }) {
  const u = ui(theme);
  if (done) return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '36px 12px', textAlign: 'center' } },
    React.createElement('div', { style: { width: 62, height: 62, borderRadius: '50%', background: '#3fb88a', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, React.createElement(Icon, { name: 'check', size: 32, color: '#fff', strokeWidth: 2.6 })),
    React.createElement('h2', { style: { margin: 0, fontSize: 20, fontWeight: 800 } }, 'Order placed!'),
    React.createElement('p', { style: { margin: 0, fontSize: 13.5, color: u.soft, maxWidth: 240, lineHeight: 1.5 } }, 'Your pieces are on the way. We saved this room to your designs so you can track delivery.'),
  );
  const lines = cart.map(ci => ({ ci, c: CATALOGUE[ci.key], price: (CATALOGUE[ci.key].sizes[ci.sizeIndex]?.price || CATALOGUE[ci.key].price) }));
  const subtotal = lines.reduce((s, l) => s + l.price * l.ci.qty, 0);
  const shipping = subtotal > 0 ? (subtotal > 800 ? 0 : 49) : 0;
  if (cart.length === 0) return React.createElement('div', { style: { textAlign: 'center', color: u.soft, padding: '46px 12px', fontSize: 13.5 } },
    React.createElement(Icon, { name: 'cart', size: 30, color: u.soft, style: { margin: '0 auto 10px' } }), 'Your cart is empty.', React.createElement('br'), 'Add pieces from the shop or your room.');
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 11 } },
    lines.map((l, i) => React.createElement('div', { key: i, style: { display: 'flex', gap: 11, alignItems: 'center', padding: 9, borderRadius: 14, background: u.card, border: `1px solid ${u.line}` } },
      React.createElement('div', { style: { width: 58, flexShrink: 0 } }, React.createElement(Thumb, { item: { ...l.c, _color: l.c.swatches[l.ci.swatchIndex]?.hex || l.c.color }, theme, h: 58, radius: 10 })),
      React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        React.createElement('div', { style: { fontSize: 13.5, fontWeight: 700, color: u.text } }, l.c.label),
        React.createElement('div', { style: { fontSize: 11, color: u.soft } }, l.c.sizes[l.ci.sizeIndex]?.label || l.c.brand),
        React.createElement('div', { style: { fontSize: 14, fontWeight: 800, color: u.accent, marginTop: 2 } }, money(l.price)),
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 } },
        React.createElement(Stepper, { theme, value: l.ci.qty, onChange: v => onQty(i, Math.max(1, v)) }),
        React.createElement('button', { onClick: () => onRemove(i), style: { background: 'none', border: 'none', color: u.soft, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 3 } }, React.createElement(Icon, { name: 'trash', size: 13 }), 'Remove'),
      ),
    )),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 13px', borderRadius: 14, background: u.card, border: `1px solid ${u.line}`, marginTop: 2 } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: u.soft } }, React.createElement('span', null, 'Subtotal'), React.createElement('span', { style: { color: u.text, fontWeight: 600 } }, money(subtotal))),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: u.soft } }, React.createElement('span', null, 'Shipping'), React.createElement('span', { style: { color: u.text, fontWeight: 600 } }, shipping === 0 ? 'Free' : money(shipping))),
      React.createElement('div', { style: { height: 1, background: u.line, margin: '3px 0' } }),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800 } }, React.createElement('span', null, 'Total'), React.createElement('span', { style: { color: u.accent } }, money(subtotal + shipping))),
    ),
  );
}

// Secondary tools that may already live on the rail (excluded from More when they do).
const MORE_TOOL_ITEMS = [
  { id: 'music', label: 'Music', icon: 'music', desc: 'Stations & playlists' },
  { id: 'plan', label: 'Plan', icon: 'plan', desc: 'Budget & measure' },
  { id: 'social', label: 'Social', icon: 'users', desc: 'Community & contests' },
];
// Account / system entries — always tertiary, never on the rail.
const MORE_SYSTEM_ITEMS = [
  { id: 'account', label: 'Account', icon: 'user', desc: 'Profile & orders' },
  { id: 'saved', label: 'Saved rooms', icon: 'layers', desc: 'Your designs' },
  { id: 'notifications', label: 'Alerts', icon: 'bell', desc: '2 new' },
  { id: 'settings', label: 'Settings', icon: 'settings', desc: 'Preferences' },
];
function MoreContent({ theme, railTools, onTool, measure, onMeasure, onReset, onShare, onScreenshot }) {
  const u = ui(theme);
  const rail = railTools || [];
  const tiles = [...MORE_TOOL_ITEMS.filter(t => !rail.includes(t.id)), ...MORE_SYSTEM_ITEMS];
  const Tile = (t) => React.createElement('button', { key: t.id, onClick: () => onTool(t.id),
    style: { display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 15, cursor: 'pointer', border: `1px solid ${u.line}`, background: u.card, color: u.text, fontFamily: 'inherit', textAlign: 'left', position: 'relative', minWidth: 0 } },
    React.createElement('span', { style: { width: 38, height: 38, borderRadius: 11, background: u.cardHi, display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.accent, flexShrink: 0 } }, React.createElement(Icon, { name: t.icon, size: 19 })),
    React.createElement('span', { style: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, flex: 1 } },
      React.createElement('span', { style: { fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, t.label),
      React.createElement('span', { style: { fontSize: 10.5, color: u.soft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, t.desc)),
    t.id === 'notifications' && React.createElement('span', { style: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#e8736f' } }),
  );
  const QolBtn = (icon, label, onClick, active) => React.createElement('button', { onClick,
    style: { minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 4px', borderRadius: 14, cursor: 'pointer', border: `1px solid ${active ? u.accent : u.line}`, background: active ? u.accent + '14' : u.card, color: active ? u.accent : u.text, fontFamily: 'inherit', fontSize: 11, fontWeight: 700 } },
    React.createElement(Icon, { name: icon, size: 18 }), label);
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 13 } },
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 } }, tiles.map(Tile)),
    React.createElement('div', { style: { height: 1, background: u.line } }),
    Label(u, 'Quick actions'),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 } },
      QolBtn('ruler', 'Measure', onMeasure, measure),
      QolBtn('camera', 'Capture', onScreenshot),
      QolBtn('share', 'Share', onShare),
      QolBtn('undo', 'Reset', onReset),
    ),
  );
}

Object.assign(window, { StyleContent, BuildContent, CartContent, MoreContent, Seg });
