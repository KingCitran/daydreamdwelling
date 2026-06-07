// Main builder app + presenter shell (device + mood switcher).
(function () {
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const measure = () => { const r = ref.current.getBoundingClientRect(); setSize({ w: r.width, h: r.height }); };
    measure();
    requestAnimationFrame(measure);
    const t1 = setTimeout(measure, 200), t2 = setTimeout(measure, 600);
    const ro = new ResizeObserver(measure);
    ro.observe(ref.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return [ref, size];
}

const DEVICES = {
  mobile:  { w: 390, h: 844, label: 'Mobile', bezel: 13, radius: 46, sub: '390 × 844' },
  tablet:  { w: 1024, h: 768, label: 'Tablet', bezel: 16, radius: 26, sub: '1024 × 768' },
  desktop: { w: 1440, h: 880, label: 'Desktop', bezel: 0, radius: 12, sub: '1440 × 880' },
};
const geomFor = m => m === 'mobile' ? { topH: 84, dockH: 66, railW: 0 } : m === 'tablet' ? { topH: 60, dockH: 0, railW: 64 } : { topH: 64, dockH: 0, railW: 192 };
const ROOMS = ['Living Room', 'Bedroom', 'Studio Loft', 'Reading Nook'];
const DOCK_MOBILE = ['place', 'build', 'style', 'more'];
const RAIL_TABLET = ['place', 'build', 'style', 'music', 'more'];
const RAIL_DESKTOP = ['place', 'build', 'style', 'music', 'plan', 'social', 'more'];

const SEED = [
  { id: 'a', key: 'rug', x: 3, y: 3, rot: 0, swatchIndex: 0, sizeIndex: 1 },
  { id: 'b', key: 'sofa', x: 3.5, y: 1.2, rot: 0, swatchIndex: 1, sizeIndex: 1 },
  { id: 'c', key: 'coffee', x: 4, y: 3.6, rot: 0, swatchIndex: 1, sizeIndex: 1 },
  { id: 'd', key: 'plant', x: 0.4, y: 6.3, rot: 0, swatchIndex: 0, sizeIndex: 0 },
  { id: 'e', key: 'floorlamp', x: 8.6, y: 1, rot: 0, swatchIndex: 0, sizeIndex: 0 },
];

let _uid = 100;
function fits(it, items) {
  const ef = ISO.partsFor({ ...CATALOGUE[it.key], _color: '#000' }, it.rot);
  if (it.x < 0 || it.y < 0 || it.x + ef.efw > ISO.GW || it.y + ef.efd > ISO.GD) return false;
  return !items.some(o => {
    if (o.id === it.id) return false;
    const oe = ISO.partsFor({ ...CATALOGUE[o.key], _color: '#000' }, o.rot);
    return it.x < o.x + oe.efw && it.x + ef.efw > o.x && it.y < o.y + oe.efd && it.y + ef.efd > o.y;
  });
}
function findSpot(key, items) {
  for (let y = 1; y <= ISO.GD - 1; y += 0.5) for (let x = 1; x <= ISO.GW - 1; x += 0.5) {
    const cand = { id: '_', key, x, y, rot: 0 };
    if (fits(cand, items)) return { x, y };
  }
  return { x: 4, y: 4 };
}

function BuilderApp({ device, mode, mood, theme, onMood, initial = {}, frozen = false }) {
  const geom = geomFor(mode);
  const [items, setItems] = useState(initial.items || SEED);
  const [sel, setSel] = useState(initial.sel || null);
  const [tool, setTool] = useState('tool' in initial ? initial.tool : (mode === 'mobile' ? null : 'place'));
  const [detail, setDetail] = useState(initial.detail || null);       // { key, sizeIndex, swatchIndex }
  const [cart, setCart] = useState(initial.cart || []);
  const [cartOpen, setCartOpen] = useState(initial.cartOpen || false);
  const [checkoutDone, setCheckoutDone] = useState(initial.checkoutDone || false);
  const [wishlist, setWishlist] = useState(new Set(initial.wishlist || []));
  const [owned, setOwned] = useState(new Set(initial.owned || []));
  const [room, setRoom] = useState('Living Room');
  const [wallColor, setWallColor] = useState(null);
  const [floorColor, setFloorColor] = useState(null);
  const [measure, setMeasure] = useState(false);
  const [roomRot, setRoomRot] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState(null);
  const [flash, setFlash] = useState(false);
  const undoRef = useRef([]); const redoRef = useRef([]);
  const [, bump] = useState(0);

  const u = ui(theme);
  const placedKeys = useMemo(() => new Set(items.map(i => i.key)), [items]);
  const budget = useMemo(() => items.reduce((s, it) => s + (CATALOGUE[it.key].sizes[it.sizeIndex]?.price || CATALOGUE[it.key].price), 0), [items]);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const showToast = useCallback((msg, icon) => { setToast({ msg, icon }); clearTimeout(showToast._t); showToast._t = setTimeout(() => setToast(null), 1900); }, []);
  const commit = useCallback((next) => { undoRef.current.push(items); if (undoRef.current.length > 40) undoRef.current.shift(); redoRef.current = []; setItems(next); }, [items]);
  const undo = () => { if (!undoRef.current.length) { showToast('Nothing to undo', 'undo'); return; } redoRef.current.push(items); setItems(undoRef.current.pop()); setSel(null); };
  const redo = () => { if (!redoRef.current.length) return; undoRef.current.push(items); setItems(redoRef.current.pop()); };

  // reset tool default when switching layout (skipped in frozen board mode)
  const firstModeRef = useRef(true);
  useEffect(() => { if (firstModeRef.current) { firstModeRef.current = false; if (frozen || Object.keys(initial).length) return; } setTool(mode === 'mobile' ? null : 'place'); setDetail(null); setCartOpen(false); }, [mode]);

  const place = useCallback((key) => {
    const spot = findSpot(key, items);
    const def = CATALOGUE[key];
    const it = { id: 'i' + (_uid++), key, x: spot.x, y: spot.y, rot: 0, swatchIndex: 0, sizeIndex: Math.min(1, def.sizes.length - 1) };
    commit([...items, it]); setSel(it.id);
    if (mode === 'mobile') { setTool(null); setDetail(null); }
    showToast(`${def.label} placed`, 'check');
  }, [items, mode, commit, showToast]);

  const selItem = items.find(i => i.id === sel);
  const mutateSel = (patch) => { if (!selItem) return; commit(items.map(i => i.id === sel ? { ...i, ...patch } : i)); };
  const rotate = () => { if (!selItem) return; const n = ((selItem.rot || 0) + 1) % 4; const cand = { ...selItem, rot: n }; commit(items.map(i => i.id === sel ? cand : i)); };
  const del = () => { if (!selItem) return; commit(items.filter(i => i.id !== sel)); setSel(null); showToast('Removed', 'trash'); };
  const move = useCallback((id, x, y) => { setItems(its => its.map(i => i.id === id ? { ...i, x, y } : i)); }, []);

  const toggleWish = (key) => { setWishlist(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); showToast(n.has(key) ? 'Saved to wishlist' : 'Removed from wishlist', 'heart'); return n; }); };
  const addCart = (key, sizeIndex = 1, swatchIndex = 0) => {
    setCart(c => { const ex = c.find(x => x.key === key); if (ex) return c.map(x => x === ex ? { ...x, qty: x.qty + 1 } : x); return [...c, { key, qty: 1, sizeIndex: Math.min(sizeIndex, CATALOGUE[key].sizes.length - 1), swatchIndex }]; });
    showToast('Added to cart', 'cart');
  };
  const checkout = () => { setCheckoutDone(true); setOwned(o => { const n = new Set(o); cart.forEach(c => n.add(c.key)); return n; }); setTimeout(() => { setCart([]); setCheckoutDone(false); setCartOpen(false); }, 2200); };
  const screenshot = () => { setFlash(true); setTimeout(() => setFlash(false), 320); showToast('Saved to your room', 'camera'); };
  const openDetail = (key) => setDetail({ key, sizeIndex: Math.min(1, CATALOGUE[key].sizes.length - 1), swatchIndex: 0 });
  const openDetailForSel = () => { if (selItem) setDetail({ key: selItem.key, sizeIndex: selItem.sizeIndex, swatchIndex: selItem.swatchIndex, placed: sel }); };

  // ── sheet routing ──
  const side = mode !== 'mobile';
  const sideGeom = { top: geom.topH + 12, bottom: 12, left: 12 + geom.railW + 12, width: mode === 'desktop' ? 384 : 352 };
  const variant = side ? 'side' : 'bottom';

  function toolPanel() {
    if (!tool) return null;
    const close = () => setTool(mode === 'mobile' ? null : tool === 'place' ? null : null);
    const common = { variant, theme, sideGeom, onClose: () => setTool(null) };
    if (tool === 'place') return React.createElement(Sheet, { ...common, title: 'Shop & place', accentDot: TOOLS.place.tint, height: '84%' },
      React.createElement(ShopContent, { theme, mode, placedKeys, ownedKeys: owned, wishlist, onPlace: place, onDetail: openDetail, onWish: toggleWish }));
    if (tool === 'build') return React.createElement(Sheet, { ...common, title: 'Build', accentDot: TOOLS.build.tint },
      React.createElement(BuildContent, { theme, onPick: (l) => showToast(`${l} — tap a wall to place`, 'build') }));
    if (tool === 'style') return React.createElement(Sheet, { ...common, title: 'Style', accentDot: TOOLS.style.tint },
      React.createElement(StyleContent, { theme, wallColor, floorColor, onWall: setWallColor, onFloor: setFloorColor, mood, onMood }));
    if (tool === 'more') return React.createElement(Sheet, { ...common, title: 'More tools', accentDot: u.accent },
      React.createElement(MoreContent, { theme, railTools: mode === 'mobile' ? DOCK_MOBILE : mode === 'tablet' ? RAIL_TABLET : RAIL_DESKTOP, measure, onMeasure: () => { setMeasure(m => !m); }, onReset: () => { commit([]); setSel(null); showToast('Room reset', 'undo'); }, onShare: () => showToast('Share link copied', 'share'), onScreenshot: screenshot, onTool: (id) => setTool(id) }));
    if (tool === 'plan') return React.createElement(Sheet, { ...common, title: 'Plan · Budget', accentDot: TOOLS.plan.tint },
      React.createElement(PlanContent, { theme, items, budget, onAddAll: () => { items.forEach(it => addCart(it.key, it.sizeIndex, it.swatchIndex)); showToast('Room added to cart', 'cart'); }, measure, onMeasure: () => setMeasure(m => !m) }));
    // generic secondary
    const meta = { view: ['View', 'eye', 'Pinch to zoom · drag two fingers to orbit · use the camera button to capture. Measurement and grid toggles live here too.'], music: ['Music', 'music', 'Pick a station or playlist to score your decorating session. Playback continues as you build.'], social: ['Social', 'users', 'Share your room to the community feed, enter styling contests, and follow designers you love.'], account: ['Account', 'user', 'Profile, saved rooms, order history, followed sellers and app settings.'], saved: ['Saved rooms', 'layers', 'Every room you’ve designed, with thumbnails and last-edited dates — tap one to open it.'], settings: ['Settings', 'settings', 'Theme & mood defaults, units, accessibility options, notifications and account preferences.'], notifications: ['Alerts', 'bell', 'New pieces from sellers you follow, price drops on your wishlist, and contest announcements.'] }[tool] || ['Tool', 'sparkle', ''];
    return React.createElement(Sheet, { ...common, title: meta[0], accentDot: u.accent },
      React.createElement(SimplePanel, { theme, icon: meta[1], text: meta[2], tool }));
  }

  const showActionPill = selItem && !detail && (mode === 'mobile' ? true : true);

  return React.createElement('div', { style: { position: 'absolute', inset: 0, overflow: 'hidden', background: theme.sky, fontFamily: "'Outfit',system-ui,sans-serif", color: u.text } },
    // canvas
    React.createElement(CanvasRoom, { device, mode, geom, theme, items, sel, wallColor, floorColor, measure, roomRot, zoom, onSelect: setSel, onMove: move, onDeselect: () => setSel(null) }),
    // top bar
    React.createElement(TopBar, { theme, mode, room, rooms: ROOMS, onPickRoom: setRoom, onNewRoom: () => { setRoom('Untitled Room'); commit([]); setSel(null); setRoomRot(0); setZoom(1); }, budget, count: items.length, onBudget: () => setTool('plan'), onUndo: undo, onRedo: redo, cartCount, onCart: () => { setCartOpen(true); setCheckoutDone(false); }, onScreenshot: screenshot, onShare: () => showToast('Share link copied', 'share'), onAccount: () => setTool('account'), geom }),
    // tool dock
    React.createElement(ToolDock, { theme, mode, tools: mode === 'mobile' ? DOCK_MOBILE : mode === 'tablet' ? RAIL_TABLET : RAIL_DESKTOP, active: tool, onPick: id => { setTool(t => t === id ? null : id); setDetail(null); }, geom }),
    // on-canvas view controls (rotate room + zoom)
    React.createElement(ViewControls, { theme, mode, geom, zoom, roomRot, panelOpen: !!tool && mode !== 'mobile', onRotate: dir => setRoomRot(r => (((r + dir) % 4) + 4) % 4), onZoom: f => setZoom(z => Math.max(0.55, Math.min(2.2, +(z * f).toFixed(3)))), onReset: () => { setRoomRot(0); setZoom(1); showToast('View reset', 'eye'); } }),
    // panels
    toolPanel(),
    detail && React.createElement(Sheet, { variant, theme, sideGeom, title: 'Item details', accentDot: u.accent, onClose: () => setDetail(null), height: '86%' },
      React.createElement(DetailContent, {
        theme, k: detail.key, sel: detail, inRoom: placedKeys.has(detail.key), owned: owned.has(detail.key), wished: wishlist.has(detail.key),
        onSize: i => { setDetail(d => ({ ...d, sizeIndex: i })); if (detail.placed) mutateSel({ sizeIndex: i }); },
        onSwatch: i => { setDetail(d => ({ ...d, swatchIndex: i })); if (detail.placed) mutateSel({ swatchIndex: i }); },
        onPlace: detail.placed ? place : place, onAddCart: k => addCart(k, detail.sizeIndex, detail.swatchIndex), onWish: toggleWish,
        onReport: () => showToast('Thanks — report sent', 'check'),
      })),
    // cart
    cartOpen && (mode === 'mobile'
      ? React.createElement(Sheet, { variant: 'bottom', theme, title: 'Cart', accentDot: u.accent, onClose: () => setCartOpen(false), height: '86%', footer: !checkoutDone && cart.length > 0 && React.createElement(Btn, { theme, variant: 'primary', full: true, size: 'lg', onClick: checkout }, 'Checkout · ' + money(cart.reduce((s, l) => s + (CATALOGUE[l.key].sizes[l.sizeIndex]?.price || CATALOGUE[l.key].price) * l.qty, 0))) },
        React.createElement(CartContent, { theme, cart, done: checkoutDone, onQty: (i, q) => setCart(c => c.map((x, j) => j === i ? { ...x, qty: q } : x)), onRemove: i => setCart(c => c.filter((_, j) => j !== i)), onCheckout: checkout }))
      : React.createElement(CenterModal, { theme, title: 'Cart', onClose: () => setCartOpen(false), footer: !checkoutDone && cart.length > 0 && React.createElement(Btn, { theme, variant: 'primary', full: true, size: 'lg', onClick: checkout }, 'Checkout · ' + money(cart.reduce((s, l) => s + (CATALOGUE[l.key].sizes[l.sizeIndex]?.price || CATALOGUE[l.key].price) * l.qty, 0))) },
        React.createElement(CartContent, { theme, cart, done: checkoutDone, onQty: (i, q) => setCart(c => c.map((x, j) => j === i ? { ...x, qty: q } : x)), onRemove: i => setCart(c => c.filter((_, j) => j !== i)), onCheckout: checkout }))),
    // action pill
    showActionPill && React.createElement(ActionPill, { theme, item: selItem, geom, mode, onRotate: rotate, onDetails: openDetailForSel, onDelete: del, onWish: () => toggleWish(selItem.key), wished: wishlist.has(selItem.key) }),
    // toast
    toast && React.createElement('div', { style: { position: 'absolute', bottom: (mode === 'mobile' ? geom.dockH + (showActionPill ? 84 : 18) : 84), left: '50%', transform: 'translateX(-50%)', zIndex: 90, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 13, background: u.dark ? 'rgba(20,23,42,0.96)' : 'rgba(40,28,60,0.94)', color: '#fff', fontSize: 13.5, fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', pointerEvents: 'none' } },
      toast.icon && React.createElement(Icon, { name: toast.icon, size: 16, color: theme.accent }), toast.msg),
    // screenshot flash
    flash && React.createElement('div', { style: { position: 'absolute', inset: 0, background: '#fff', zIndex: 200, pointerEvents: 'none', animation: 'dddFlash .32s ease' } }),
  );
}

function CanvasRoom({ device, mode, geom, theme, items, sel, wallColor, floorColor, measure, roomRot, zoom, onSelect, onMove, onDeselect }) {
  const regionLeft = mode === 'mobile' ? 0 : geom.railW + 24;
  const regionTop = geom.topH, regionBottom = mode === 'mobile' ? geom.dockH : 0;
  const W = device.w - regionLeft, H = device.h - regionTop - regionBottom;
  const fit = Math.min((W * 0.97) / ISO.SCENE_W, (H * 0.96) / ISO.SCENE_H, 1.7);
  const scale = fit * (zoom || 1);
  return React.createElement('div', { onPointerDown: onDeselect, style: { position: 'absolute', top: regionTop, bottom: regionBottom, left: regionLeft, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', touchAction: 'none' } },
    React.createElement('div', { style: { width: ISO.SCENE_W, height: ISO.SCENE_H, transform: `scale(${scale})`, flexShrink: 0 } },
      React.createElement(IsoRoom, { items, selectedId: sel, theme, wallColor, floorColor, measure, roomRot, onSelect, onMove, onDeselect }),
    ),
  );
}

function CenterModal({ theme, title, onClose, children, footer }) {
  const u = ui(theme);
  return React.createElement('div', { onClick: onClose, style: { position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(10,8,20,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 } },
    React.createElement('div', { onClick: e => e.stopPropagation(), style: { width: 440, maxWidth: '100%', maxHeight: '86%', background: u.panel, border: `1px solid ${u.border}`, borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.4)', fontFamily: "'Outfit',sans-serif", color: u.text } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 9, padding: '15px 16px 12px' } },
        React.createElement('h3', { style: { margin: 0, fontSize: 17, fontWeight: 800, flex: 1 } }, title),
        React.createElement('button', { onClick: onClose, style: { width: 32, height: 32, borderRadius: 9, border: `1px solid ${u.line}`, background: u.card, color: u.soft, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, React.createElement(Icon, { name: 'close', size: 16 }))),
      React.createElement('div', { style: { overflowY: 'auto', padding: '0 16px 16px', flex: 1 } }, children),
      footer && React.createElement('div', { style: { padding: 14, borderTop: `1px solid ${u.line}` } }, footer),
    ),
  );
}

function SimplePanel({ theme, icon, text }) {
  const u = ui(theme);
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 13, padding: '26px 10px', textAlign: 'center' } },
    React.createElement('span', { style: { width: 58, height: 58, borderRadius: 16, background: u.card, display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.accent } }, React.createElement(Icon, { name: icon, size: 28 })),
    React.createElement('p', { style: { margin: 0, fontSize: 14, lineHeight: 1.55, color: u.soft, maxWidth: 280 } }, text),
  );
}

function PlanContent({ theme, items, budget, onAddAll, measure, onMeasure }) {
  const u = ui(theme);
  const byCat = {};
  items.forEach(it => { const c = CATALOGUE[it.key]; const p = c.sizes[it.sizeIndex]?.price || c.price; byCat[c.cat] = (byCat[c.cat] || 0) + p; });
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 13 } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 15, background: u.card, border: `1px solid ${u.line}` } },
      React.createElement('div', null, React.createElement('div', { style: { fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: u.soft } }, 'Room total'),
        React.createElement('div', { style: { fontSize: 30, fontWeight: 800, color: u.accent, letterSpacing: '-0.02em' } }, money(budget))),
      React.createElement('div', { style: { fontSize: 12.5, color: u.soft, fontWeight: 600 } }, `${items.length} pieces`)),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 7 } },
      Object.entries(byCat).map(([c, v]) => React.createElement('div', { key: c, style: { display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement('span', { style: { fontSize: 12.5, color: u.text, width: 86, flexShrink: 0 } }, c),
        React.createElement('div', { style: { flex: 1, height: 8, borderRadius: 4, background: u.card, overflow: 'hidden' } },
          React.createElement('div', { style: { width: `${Math.min(100, v / budget * 100)}%`, height: '100%', background: u.accent, borderRadius: 4 } })),
        React.createElement('span', { style: { fontSize: 12, fontWeight: 700, color: u.soft, width: 56, textAlign: 'right' } }, money(v)),
      )),
    ),
    React.createElement(Btn, { theme, variant: 'primary', full: true, onClick: onAddAll }, React.createElement(Icon, { name: 'cart', size: 16 }), 'Buy everything in this room'),
    React.createElement(Btn, { theme, variant: measure ? 'soft' : 'ghost', full: true, onClick: onMeasure }, React.createElement(Icon, { name: 'ruler', size: 16 }), measure ? 'Hide measurements' : 'Show measurements'),
  );
}

// ── Presenter shell ──
function Presenter() {
  const [device, setDevice] = useState('mobile');
  const [mood, setMood] = useState('Dream State');
  const [stageRef, stage] = useElementSize();
  const theme = MOODS[mood];
  const d = DEVICES[device];
  const mode = device;
  const pad = 70;
  const scale = stage.w ? Math.min((stage.w - 40) / (d.w + d.bezel * 2), (stage.h - pad) / (d.h + d.bezel * 2), 1) : 0.3;

  const ctrl = ui(theme);
  return React.createElement('div', { style: { position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: theme.isDark ? '#0a0a12' : '#e7e3ef', transition: 'background .3s' } },
    // presenter toolbar
    React.createElement('div', { style: { flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', flexWrap: 'wrap', borderBottom: '1px solid rgba(120,100,160,0.18)', background: theme.isDark ? 'rgba(16,16,26,0.6)' : 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', fontFamily: "'Outfit',sans-serif" } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 9, marginRight: 4 } },
        React.createElement(Logo, { size: 26, color: theme.accent }),
        React.createElement('span', { style: { fontFamily: "'EB Garamond',serif", fontSize: 18, fontWeight: 500, color: theme.isDark ? '#e8e2f4' : '#2a2040' } }, 'Builder redesign — prototype')),
      React.createElement('div', { style: { flex: 1 } }),
      React.createElement(SegBar, { label: 'Device', value: device, onChange: setDevice, theme, options: Object.keys(DEVICES).map(k => ({ id: k, label: DEVICES[k].label })) }),
      React.createElement(SegBar, { label: 'Mood', value: mood, onChange: setMood, theme, options: MOOD_KEYS.map(k => ({ id: k, label: MOODS[k].label })) }),
    ),
    // stage
    React.createElement('div', { ref: stageRef, style: { flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 } },
      React.createElement('div', { style: { transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform .25s ease' } },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: 16, fontFamily: "'Outfit',sans-serif", color: theme.isDark ? '#b8b0d0' : '#6a5f86', fontSize: 17, fontWeight: 600 } }, `${d.label} · `, React.createElement('span', { style: { opacity: 0.6 } }, d.sub)),
        // device frame
        React.createElement('div', { style: { width: d.w + d.bezel * 2, height: d.h + d.bezel * 2, padding: d.bezel, borderRadius: d.radius, background: d.bezel ? (theme.isDark ? '#1c1c28' : '#2a2535') : 'transparent', boxShadow: d.bezel ? '0 40px 100px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)' : '0 30px 80px rgba(0,0,0,0.3)' } },
          React.createElement('div', { style: { position: 'relative', width: d.w, height: d.h, borderRadius: Math.max(4, d.radius - d.bezel), overflow: 'hidden', background: theme.sky } },
            React.createElement(BuilderApp, { device: d, mode, mood, theme, onMood: setMood }),
            device === 'mobile' && React.createElement('div', { style: { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 132, height: 26, background: '#10101a', borderRadius: '0 0 16px 16px', zIndex: 300 } }),
          ),
        ),
      ),
    ),
  );
}

function SegBar({ label, value, onChange, options, theme }) {
  const dark = theme.isDark;
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
    React.createElement('span', { style: { fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: dark ? '#8a82a8' : '#8a7fa6', fontFamily: "'Outfit',sans-serif" } }, label),
    React.createElement('div', { style: { display: 'flex', gap: 3, padding: 3, borderRadius: 11, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(120,100,160,0.1)' } },
      options.map(o => React.createElement('button', { key: o.id, onClick: () => onChange(o.id),
        style: { padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: 12.5, fontWeight: 700, background: value === o.id ? theme.accent : 'transparent', color: value === o.id ? theme.accentText : (dark ? '#c0b8d8' : '#5a4f78'), transition: 'all .15s', whiteSpace: 'nowrap' } }, o.label)),
    ),
  );
}

// Reusable device frame (bezel + notch) wrapping a frozen BuilderApp — used by
// both the presenter and the static handoff board.
function DeviceFrame({ device, theme, initial, label }) {
  const d = DEVICES[device];
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 } },
    React.createElement('div', { style: { width: d.w + d.bezel * 2, height: d.h + d.bezel * 2, padding: d.bezel, borderRadius: d.radius, background: d.bezel ? '#2a2535' : 'transparent', boxShadow: d.bezel ? '0 20px 50px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.06)' : '0 14px 40px rgba(0,0,0,0.14)' } },
      React.createElement('div', { style: { position: 'relative', width: d.w, height: d.h, borderRadius: Math.max(4, d.radius - d.bezel), overflow: 'hidden', background: theme.sky } },
        React.createElement(BuilderApp, { device: d, mode: device, mood: 'Studio', theme, onMood: () => {}, initial: initial || {}, frozen: true }),
        device === 'mobile' && React.createElement('div', { style: { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 132, height: 26, background: '#10101a', borderRadius: '0 0 16px 16px', zIndex: 300 } }),
      ),
    ),
  );
}

window.DDD = { BuilderApp, DeviceFrame, DEVICES, geomFor, SEED };
if (document.getElementById('root')) {
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Presenter));
}
})();
