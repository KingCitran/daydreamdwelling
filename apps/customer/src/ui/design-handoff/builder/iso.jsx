// IsoRoom — a procedural isometric room placeholder rendered as ONE SVG of
// depth-sorted polygons (floor, walls, grid, blocky furniture). SVG polygons
// capture reliably (screenshots, PDF, PPTX) and stay crisp at any scale.
// Tap a piece to select; drag to move. Everything tints from the active mood.
(function () {
const { useRef, useState, useEffect, useCallback } = React;

const GW = 10, GD = 10, WH = 7;            // square grid → clean 90° view rotation
const HW = 20, HH = 10, ZH = 22;          // half-tile w/h, height per ft (px)
const OX = GD * HW, OY = WH * ZH;
const SCENE_W = (GW + GD) * HW;
const SCENE_H = (GW + GD) * HH + WH * ZH;
const proj = (x, y, z) => ({ sx: OX + (x - y) * HW, sy: OY + (x + y) * HH - z * ZH });
const pstr = pts => pts.map(p => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(' ');

function shade(hex, amt) {
  let h = ('' + hex).replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16); let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt >= 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { r *= (1 + amt); g *= (1 + amt); b *= (1 + amt); }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

function backRect(efw, efd, rot, th) {
  if (rot === 0) return { x: 0, y: 0, w: efw, d: th };
  if (rot === 1) return { x: efw - th, y: 0, w: th, d: efd };
  if (rot === 2) return { x: 0, y: efd - th, w: efw, d: th };
  return { x: 0, y: 0, w: th, d: efd };
}

function partsFor(c, rot) {
  const efw = rot % 2 ? c.fd : c.fw;
  const efd = rot % 2 ? c.fw : c.fd;
  const col = c._color, dark = shade(col, -0.18);
  const parts = [];
  const push = (x, y, w, d, z0, h, color) => parts.push({ x, y, w, d, z0, h, color });
  switch (c.shape) {
    case 'flat': push(0, 0, efw, efd, 0, Math.max(0.05, c.fh), col); break;
    case 'box': case 'tall': push(0, 0, efw, efd, 0, c.fh, col); break;
    case 'table': {
      const top = 0.16, lt = 0.18;
      push(0, 0, efw, efd, c.fh - top, top, col);
      [[0, 0], [efw - lt, 0], [0, efd - lt], [efw - lt, efd - lt]].forEach(([lx, ly]) => push(lx, ly, lt, lt, 0, c.fh - top, dark));
      break;
    }
    case 'sofa': case 'chair': {
      const seatH = 0.7;
      push(0, 0, efw, efd, 0, seatH, col);
      const bk = backRect(efw, efd, rot, 0.32);
      push(bk.x, bk.y, bk.w, bk.d, seatH - 0.1, c.fh - seatH + 0.1, shade(col, 0.07));
      break;
    }
    case 'bed': {
      const matH = 0.9;
      push(0, 0, efw, efd, 0, matH, col);
      const hb = backRect(efw, efd, rot, 0.4);
      push(hb.x, hb.y, hb.w, hb.d, 0, c.fh + 0.4, shade(col, -0.07));
      break;
    }
    case 'lamp': {
      const baseR = 0.5, poleR = 0.14, shR = Math.min(0.95, efw * 0.95);
      push((efw - baseR) / 2, (efd - baseR) / 2, baseR, baseR, 0, 0.12, dark);
      push((efw - poleR) / 2, (efd - poleR) / 2, poleR, poleR, 0, c.fh - 0.6, shade(col, -0.08));
      push((efw - shR) / 2, (efd - shR) / 2, shR, shR, c.fh - 0.6, 0.62, shade(col, 0.14));
      break;
    }
    case 'pendant': {
      const z0 = 5.0, cordR = 0.08, shR = Math.min(efw, c.fw);
      push((efw - cordR) / 2, (efd - cordR) / 2, cordR, cordR, z0 + 0.7, WH - (z0 + 0.7), dark);
      push((efw - shR) / 2, (efd - shR) / 2, shR, shR, z0, 0.7, col);
      break;
    }
    case 'plant': {
      const potR = Math.min(0.7, efw), folR = Math.min(1.05, efw * 1.05);
      push((efw - potR) / 2, (efd - potR) / 2, potR, potR, 0, 0.6, '#b07a55');
      push((efw - folR) / 2, (efd - folR) / 2, folR, folR, 0.55, c.fh - 0.55, '#5f8a55');
      break;
    }
    default: push(0, 0, efw, efd, 0, c.fh, col);
  }
  return { efw, efd, parts };
}

// Room-view rotation (square grid). Display = base rotated 90°·roomRot CW.
function dispItem(it, roomRot) {
  let cur = { x: it.x, y: it.y, rot: it.rot, key: it.key };
  const steps = ((roomRot % 4) + 4) % 4;
  for (let i = 0; i < steps; i++) {
    const ef = partsFor({ ...CATALOGUE[cur.key], _color: '#000' }, cur.rot);
    cur = { x: cur.y, y: GW - (cur.x + ef.efw), rot: (cur.rot + 1) % 4, key: cur.key };
  }
  return cur;
}
function invRotVec(vx, vy, roomRot) {
  let a = vx, b = vy;
  const steps = ((roomRot % 4) + 4) % 4;
  for (let i = 0; i < steps; i++) { const na = -b, nb = a; a = na; b = nb; }
  return [a, b];
}

// One cuboid → up to 3 polygons (top, left=+y, right=+x)
function cuboidPolys(gx, gy, p, onDown, key, lift) {
  const { x, y, w, d, z0, h, color } = p;
  const X = gx + x, Y = gy + y, Z1 = z0, Z2 = z0 + h;
  const T = [proj(X, Y, Z2), proj(X + w, Y, Z2), proj(X + w, Y + d, Z2), proj(X, Y + d, Z2)];
  const f = c => lift ? shade(c, 0.05) : c;
  const mk = (k, pts, fill) => React.createElement('polygon', { key: k, points: pstr(pts), fill, stroke: shade(fill, -0.12), strokeWidth: 0.4, onPointerDown: onDown, style: { cursor: 'grab' } });
  return [
    mk(key + 'r', [T[1], T[2], proj(X + w, Y + d, Z1), proj(X + w, Y, Z1)], f(shade(color, -0.22))),
    mk(key + 'l', [T[3], T[2], proj(X + w, Y + d, Z1), proj(X, Y + d, Z1)], f(shade(color, -0.05))),
    mk(key + 't', T, f(shade(color, 0.13))),
  ];
}

function IsoRoom({ items, selectedId, theme, wallColor, floorColor, measure, roomRot = 0, onSelect, onMove, onDeselect }) {
  const dragRef = useRef(null);
  const [, force] = useState(0);

  const onItemDown = useCallback((e, id) => {
    e.stopPropagation();
    const it = items.find(i => i.id === id); if (!it) return;
    onSelect(id);
    const svg = e.currentTarget.ownerSVGElement;
    const k = svg ? svg.getBoundingClientRect().width / SCENE_W : 1;
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, k, roomRot, moved: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  }, [items, onSelect, roomRot]);

  useEffect(() => {
    const move = e => {
      const dr = dragRef.current; if (!dr) return;
      const dsx = e.clientX - dr.sx, dsy = e.clientY - dr.sy;
      const k = dr.k || 1;
      const ax = dsx / k, ay = dsy / k;
      const dx = (ax / HW + ay / HH) / 2, dy = (ay / HH - ax / HW) / 2;
      if (Math.abs(dsx) + Math.abs(dsy) > 4) dr.moved = true;
      const it = items.find(i => i.id === dr.id); if (!it) return;
      const [bdx, bdy] = invRotVec(dx, dy, dr.roomRot || 0);
      const ef = partsFor({ ...CATALOGUE[it.key], _color: '#000' }, it.rot);
      const nx = Math.max(0, Math.min(GW - ef.efw, Math.round((dr.ox + bdx) * 2) / 2));
      const ny = Math.max(0, Math.min(GD - ef.efd, Math.round((dr.oy + bdy) * 2) / 2));
      onMove(dr.id, nx, ny);
    };
    const up = () => { if (dragRef.current) { dragRef.current = null; force(n => n + 1); } };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [items, onMove]);

  const fl = floorColor || theme.floor;
  const wl = wallColor ? shade(wallColor, -0.04) : theme.wallL;
  const wr = wallColor ? shade(wallColor, -0.12) : theme.wallR;
  const kids = [];

  // back walls (behind), then floor
  kids.push(React.createElement('polygon', { key: 'wr', points: pstr([proj(0, 0, WH), proj(GW, 0, WH), proj(GW, 0, 0), proj(0, 0, 0)]), fill: wr }));
  kids.push(React.createElement('polygon', { key: 'wl', points: pstr([proj(0, 0, WH), proj(0, GD, WH), proj(0, GD, 0), proj(0, 0, 0)]), fill: wl }));
  kids.push(React.createElement('polygon', { key: 'floor', points: pstr([proj(0, 0, 0), proj(GW, 0, 0), proj(GW, GD, 0), proj(0, GD, 0)]), fill: fl, onPointerDown: e => { e.stopPropagation(); onDeselect(); } }));

  // grid lines
  const gd = [];
  for (let gx = 0; gx <= GW; gx++) { const a = proj(gx, 0, 0), b = proj(gx, GD, 0); gd.push(`M${a.sx.toFixed(1)} ${a.sy.toFixed(1)}L${b.sx.toFixed(1)} ${b.sy.toFixed(1)}`); }
  for (let gy = 0; gy <= GD; gy++) { const a = proj(0, gy, 0), b = proj(GW, gy, 0); gd.push(`M${a.sx.toFixed(1)} ${a.sy.toFixed(1)}L${b.sx.toFixed(1)} ${b.sy.toFixed(1)}`); }
  kids.push(React.createElement('path', { key: 'grid', d: gd.join(''), stroke: theme.grid, strokeWidth: 1, fill: 'none', style: { pointerEvents: 'none' } }));

  // selection pad
  const sel = items.find(i => i.id === selectedId);
  if (sel) {
    const ds = dispItem(sel, roomRot);
    const ef = partsFor({ ...CATALOGUE[sel.key], _color: '#000' }, ds.rot); const pad = 0.14;
    kids.push(React.createElement('polygon', { key: 'sp1', style: { pointerEvents: 'none' }, fill: theme.accent, opacity: 0.9, points: pstr([proj(ds.x - pad, ds.y - pad, 0.02), proj(ds.x + ef.efw + pad, ds.y - pad, 0.02), proj(ds.x + ef.efw + pad, ds.y + ef.efd + pad, 0.02), proj(ds.x - pad, ds.y + ef.efd + pad, 0.02)]) }));
    kids.push(React.createElement('polygon', { key: 'sp2', style: { pointerEvents: 'none' }, fill: fl, points: pstr([proj(ds.x, ds.y, 0.03), proj(ds.x + ef.efw, ds.y, 0.03), proj(ds.x + ef.efw, ds.y + ef.efd, 0.03), proj(ds.x, ds.y + ef.efd, 0.03)]) }));
  }

  // furniture (depth-sorted)
  const flat = [];
  items.forEach(it => {
    const c = CATALOGUE[it.key];
    const resolved = { ...c, _color: c.swatches?.[it.swatchIndex]?.hex || c.color };
    const ds = dispItem(it, roomRot);
    const { parts } = partsFor(resolved, ds.rot);
    parts.forEach((p, pi) => flat.push({ it, dx: ds.x, dy: ds.y, p, key: `${it.id}-${pi}`, depth: (ds.x + p.x + p.w) + (ds.y + p.y + p.d) + (p.z0 + p.h) * 0.5 }));
  });
  flat.sort((a, b) => a.depth - b.depth);
  flat.forEach(({ it, dx, dy, p, key }) => cuboidPolys(dx, dy, p, e => onItemDown(e, it.id), key, it.id === selectedId).forEach(el => kids.push(el)));

  const svg = React.createElement('svg', {
    width: SCENE_W, height: SCENE_H, viewBox: `0 0 ${SCENE_W} ${SCENE_H}`,
    style: { display: 'block', overflow: 'visible' }, shapeRendering: 'geometricPrecision',
    onPointerDown: () => onDeselect(),
  }, kids);

  // measurement label (HTML overlay so it stays upright + legible)
  let label = null;
  if (measure && sel) {
    const c = CATALOGUE[sel.key]; const ds = dispItem(sel, roomRot); const ef = partsFor({ ...c, _color: '#000' }, ds.rot);
    const mid = proj(ds.x + ef.efw / 2, ds.y + ef.efd + 0.3, 0);
    label = React.createElement('div', { key: 'meas', style: { position: 'absolute', left: mid.sx, top: mid.sy, transform: 'translate(-50%,-50%)', fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 7, whiteSpace: 'nowrap', background: theme.accent, color: theme.accentText, pointerEvents: 'none', fontFamily: "'Outfit',sans-serif" } }, `${ef.efw.toFixed(1)} × ${ef.efd.toFixed(1)} ft`);
  }

  return React.createElement('div', { style: { position: 'relative', width: SCENE_W, height: SCENE_H } }, svg, label);
}

window.IsoRoom = IsoRoom;
window.ISO = { SCENE_W, SCENE_H, GW, GD, partsFor };
window.shade = shade;
})();
