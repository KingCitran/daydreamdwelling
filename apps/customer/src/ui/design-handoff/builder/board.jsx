// Studio Design Board — every builder panel, at every breakpoint, in one neutral
// theme. Built from the prototype's real components (window.DDD), so what you see
// IS the shipping layout — Claude Code only swaps the Studio tokens for the mood
// palettes and wires live data.
//
// Plain scrolling layout (no pan/zoom): a breakpoint toggle + a wrapping grid of
// labelled, scaled-down device frames. Only one breakpoint mounts at a time.
const { useState } = React;
const { DeviceFrame, DEVICES } = window.DDD;
const T = window.STUDIO;
const INK = '#1f2632', SOFT = '#6b7686', LINE = 'rgba(30,40,60,0.13)';

const CART = [
  { key: 'sofa', qty: 1, sizeIndex: 1, swatchIndex: 1 },
  { key: 'coffee', qty: 1, sizeIndex: 1, swatchIndex: 0 },
  { key: 'rug', qty: 2, sizeIndex: 0, swatchIndex: 0 },
];

// SEED ids: a=rug · b=sofa · c=coffee · d=plant · e=floorlamp
const STATES = [
  { id: 'idle',     name: 'Builder · idle',     desc: 'Room · chrome · tool dock/rail · on-canvas view controls', init: { tool: null } },
  { id: 'selected', name: 'Item selected',      desc: 'Floating action pill — rotate · edit · save · delete', init: { tool: null, sel: 'b' } },
  { id: 'place',    name: 'Place · Shop',       desc: 'Search · category chips · sort · cards · in-room / owned badges', init: { tool: 'place', owned: ['plant'], wishlist: ['boucle'] } },
  { id: 'detail',   name: 'Item detail',        desc: 'Size · colour · place / add-to-cart · find similar', init: { tool: null, detail: { key: 'sofa', sizeIndex: 1, swatchIndex: 1 } } },
  { id: 'cart',     name: 'Cart',               desc: 'Line items · steppers · subtotal / shipping / total', init: { cartOpen: true, cart: CART } },
  { id: 'checkout', name: 'Checkout · success', desc: 'Order-placed confirmation', init: { cartOpen: true, checkoutDone: true, cart: CART } },
  { id: 'style',    name: 'Style',              desc: 'Walls / floor swatches · custom colour · lighting mood', init: { tool: 'style' } },
  { id: 'build',    name: 'Build',              desc: 'Walls · doors · windows · openings · stairs · closet', init: { tool: 'build' } },
  { id: 'plan',     name: 'Plan · Budget',      desc: 'Room total · spend-by-category · buy-all · measurements', init: { tool: 'plan' } },
  { id: 'music',    name: 'Music',              desc: 'Stations & playlists', init: { tool: 'music' } },
  { id: 'social',   name: 'Social',             desc: 'Community feed · contests · follows', init: { tool: 'social' } },
  { id: 'account',  name: 'Account',            desc: 'Profile · saved rooms · orders · settings', init: { tool: 'account' } },
  { id: 'more',     name: 'More menu',          desc: 'Secondary tools (de-duped vs rail) + quick actions', init: { tool: 'more' } },
];

const DEVICE_META = {
  mobile:  { label: 'Mobile',  note: '390 × 844 · bottom dock + sheets', targetW: 300 },
  tablet:  { label: 'Tablet',  note: '1024 × 768 · icon rail + docked panels', targetW: 470 },
  desktop: { label: 'Desktop', note: '1440 × 880 · labelled rail + docked panels / modals', targetW: 680 },
};

function Frame({ device, state }) {
  const d = DEVICES[device], m = DEVICE_META[device];
  const W = d.w + d.bezel * 2, H = d.h + d.bezel * 2;
  const scale = m.targetW / W;
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
      React.createElement('span', { style: { fontSize: 14, fontWeight: 800, color: INK, letterSpacing: '-0.01em' } }, state.name),
      React.createElement('span', { style: { fontSize: 11.5, color: SOFT, lineHeight: 1.35, maxWidth: m.targetW } }, state.desc)),
    React.createElement('div', { style: { width: W * scale, height: H * scale, borderRadius: 10, overflow: 'hidden', boxShadow: '0 6px 22px rgba(20,28,44,0.13)', border: `1px solid ${LINE}` } },
      React.createElement('div', { style: { width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' } },
        React.createElement(DeviceFrame, { device, theme: T, initial: state.init }),
      ),
    ),
  );
}

function Toggle({ device, onPick }) {
  return React.createElement('div', { style: { position: 'sticky', top: 0, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16, padding: '12px 28px', background: 'rgba(244,245,247,0.95)', borderBottom: `1px solid ${LINE}`, backdropFilter: 'blur(8px)', zIndex: 50 } },
    React.createElement(window.Logo, { size: 27, color: INK }),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', marginRight: 8 } },
      React.createElement('span', { style: { fontFamily: "'EB Garamond',serif", fontSize: 18, fontWeight: 600, color: INK, lineHeight: 1 } }, 'Studio Board'),
      React.createElement('span', { style: { fontSize: 11.5, color: SOFT, marginTop: 3 } }, 'Neutral baseline — every panel · every size')),
    React.createElement('div', { style: { flex: 1 } }),
    React.createElement('span', { style: { fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: SOFT } }, 'Breakpoint'),
    React.createElement('div', { style: { display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: 'rgba(30,40,60,0.07)' } },
      Object.keys(DEVICES).map(k => React.createElement('button', { key: k, onClick: () => onPick(k),
        style: { padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 700, background: device === k ? INK : 'transparent', color: device === k ? '#fff' : SOFT } },
        DEVICE_META[k].label))),
  );
}

function Board() {
  const [device, setDevice] = useState('mobile');
  const m = DEVICE_META[device];
  return React.createElement('div', { style: { minHeight: '100%', display: 'flex', flexDirection: 'column' } },
    React.createElement(Toggle, { device, onPick: setDevice }),
    React.createElement('div', { style: { padding: '22px 28px 8px' } },
      React.createElement('h2', { style: { margin: 0, fontSize: 20, fontWeight: 800, color: INK } }, m.label, ' layout'),
      React.createElement('p', { style: { margin: '4px 0 0', fontSize: 13, color: SOFT } }, m.note, ' · ', STATES.length, ' panels')),
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 30, padding: '14px 28px 56px', alignItems: 'flex-start' } },
      STATES.map(s => React.createElement(Frame, { key: device + '-' + s.id, device, state: s })),
    ),
  );
}

ReactDOM.createRoot(document.getElementById('board')).render(React.createElement(Board));
