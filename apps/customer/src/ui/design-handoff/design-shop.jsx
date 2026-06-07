// Shop catalog sheet + product cards + item detail sheet.
function ProductCard({ k, theme, inRoom, owned, wished, onPlace, onDetail, onWish }) {
  const u = ui(theme), c = CATALOGUE[k];
  return React.createElement('div', {
    style: { background: u.card, border: `1px solid ${u.line}`, borderRadius: 16, padding: 9, display: 'flex', flexDirection: 'column', gap: 7, position: 'relative' },
  },
    React.createElement('div', { style: { position: 'relative', cursor: 'pointer' }, onClick: () => onPlace(k) },
      React.createElement(Thumb, { item: c, theme, h: 92 }),
      (inRoom || owned) && React.createElement('span', {
        style: { position: 'absolute', top: 7, left: 7, fontSize: 9.5, fontWeight: 800, padding: '3px 7px', borderRadius: 999, background: owned ? '#3fb88a' : u.accent, color: '#fff', letterSpacing: '0.02em' },
      }, owned ? '✓ Owned' : 'In your room'),
      React.createElement('button', {
        onClick: e => { e.stopPropagation(); onWish(k); },
        style: { position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 9, border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.32)', color: wished ? '#ff9ab8' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' },
      }, React.createElement(Icon, { name: 'heart', size: 15, color: wished ? '#ff9ab8' : '#fff', style: wished ? { fill: '#ff9ab8' } : undefined })),
    ),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, padding: '0 2px' } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 } },
        React.createElement('span', { style: { fontSize: 13.5, fontWeight: 700, color: u.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, c.label),
        React.createElement('span', { style: { fontSize: 13.5, fontWeight: 800, color: u.accent, flexShrink: 0 } }, money(c.price)),
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 } },
        React.createElement('span', { style: { fontSize: 11, color: u.soft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, c.brand),
        React.createElement(Stars, { rating: c.rating, theme, size: 10.5 }),
      ),
    ),
    React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 1 } },
      React.createElement(Btn, { theme, size: 'sm', variant: 'primary', full: true, onClick: () => onPlace(k) },
        React.createElement(Icon, { name: 'plus', size: 14 }), 'Place'),
      React.createElement('button', { onClick: () => onDetail(k), style: { width: 36, flexShrink: 0, borderRadius: 12, border: `1px solid ${u.line}`, background: 'transparent', color: u.soft, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        React.createElement(Icon, { name: 'info', size: 16 })),
    ),
  );
}

function ShopContent({ theme, mode, placedKeys, ownedKeys, wishlist, onPlace, onDetail, onWish }) {
  const u = ui(theme);
  const [cat, setCat] = UIH.useState('All');
  const [q, setQ] = UIH.useState('');
  const [sort, setSort] = UIH.useState('featured');
  const cats = ['All', ...CAT_ORDER.filter(c => CATALOGUE_KEYS.some(k => CATALOGUE[k].cat === c))];
  let keys = CATALOGUE_KEYS.filter(k => (cat === 'All' || CATALOGUE[k].cat === cat) && (!q || CATALOGUE[k].label.toLowerCase().includes(q.toLowerCase()) || CATALOGUE[k].brand.toLowerCase().includes(q.toLowerCase())));
  if (sort === 'priceLow') keys = keys.slice().sort((a, b) => CATALOGUE[a].price - CATALOGUE[b].price);
  if (sort === 'priceHigh') keys = keys.slice().sort((a, b) => CATALOGUE[b].price - CATALOGUE[a].price);
  if (sort === 'rating') keys = keys.slice().sort((a, b) => CATALOGUE[b].rating - CATALOGUE[a].rating);
  const cols = mode === 'desktop' ? 2 : mode === 'tablet' ? 3 : 2;

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 11 } },
    // search + sort
    React.createElement('div', { style: { display: 'flex', gap: 8, position: 'sticky', top: 0, background: u.panel, paddingTop: 2, paddingBottom: 4, zIndex: 2 } },
      React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 12, background: u.card, border: `1px solid ${u.line}` } },
        React.createElement(Icon, { name: 'search', size: 16, color: u.soft }),
        React.createElement('input', { value: q, onChange: e => setQ(e.target.value), placeholder: 'Search furniture, sellers…', style: { border: 'none', background: 'transparent', outline: 'none', color: u.text, fontSize: 13.5, fontFamily: 'inherit', width: '100%' } }),
      ),
      React.createElement('select', { value: sort, onChange: e => setSort(e.target.value), style: { borderRadius: 12, border: `1px solid ${u.line}`, background: u.card, color: u.text, fontSize: 12.5, fontWeight: 700, padding: '0 8px', fontFamily: 'inherit', cursor: 'pointer' } },
        React.createElement('option', { value: 'featured' }, 'Featured'),
        React.createElement('option', { value: 'priceLow' }, 'Price ↑'),
        React.createElement('option', { value: 'priceHigh' }, 'Price ↓'),
        React.createElement('option', { value: 'rating' }, 'Top rated'),
      ),
    ),
    // category chips
    React.createElement('div', { style: { display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2, margin: '0 -16px', padding: '0 16px 2px' }, className: 'ddd-chips' },
      cats.map(c => React.createElement(Chip, { key: c, active: cat === c, onClick: () => setCat(c), theme }, c)),
    ),
    // grid
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 10 } },
      keys.map(k => React.createElement(ProductCard, {
        key: k, k, theme, inRoom: placedKeys.has(k), owned: ownedKeys.has(k), wished: wishlist.has(k),
        onPlace, onDetail, onWish,
      })),
    ),
    keys.length === 0 && React.createElement('div', { style: { textAlign: 'center', color: u.soft, padding: '30px 0', fontSize: 13 } }, 'No matches — try another search.'),
  );
}

function DetailContent({ theme, k, sel, onSize, onSwatch, onPlace, onAddCart, onWish, wished, onReport, inRoom, owned }) {
  const u = ui(theme), c = CATALOGUE[k];
  const resolved = { ...c, _color: c.swatches[sel.swatchIndex]?.hex || c.color };
  const price = c.sizes[sel.sizeIndex]?.price || c.price;
  const Row = ({ label, children }) => React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 7 } },
    React.createElement('span', { style: { fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: u.soft } }, label), children);

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
    React.createElement('div', { style: { display: 'flex', gap: 13 } },
      React.createElement('div', { style: { width: 124, flexShrink: 0 } }, React.createElement(Thumb, { item: resolved, theme, h: 124, radius: 14 })),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 } },
        React.createElement('span', { style: { fontSize: 11.5, color: u.soft, fontWeight: 600 } }, c.brand),
        React.createElement('h2', { style: { margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05 } }, c.label),
        React.createElement(Stars, { rating: c.rating, reviews: c.reviews, theme, size: 12 }),
        React.createElement('div', { style: { fontSize: 22, fontWeight: 800, color: u.accent, marginTop: 2 } }, money(price)),
        (inRoom || owned) && React.createElement('span', { style: { alignSelf: 'flex-start', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 999, background: owned ? '#3fb88a22' : u.accent + '22', color: owned ? '#3fb88a' : u.accent } }, owned ? '✓ Owned' : 'In your room'),
      ),
    ),
    c.sizes.length > 1 && React.createElement(Row, { label: 'Size' },
      React.createElement('div', { style: { display: 'flex', gap: 7, flexWrap: 'wrap' } },
        c.sizes.map((s, i) => React.createElement('button', { key: i, onClick: () => onSize(i),
          style: { padding: '8px 12px', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, border: `1px solid ${i === sel.sizeIndex ? u.accent : u.line}`, background: i === sel.sizeIndex ? u.accent + '18' : 'transparent', color: i === sel.sizeIndex ? u.accent : u.text, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 } },
          React.createElement('span', null, s.label),
          React.createElement('span', { style: { fontSize: 10.5, color: u.soft, fontWeight: 600 } }, money(s.price))),
        ),
      ),
    ),
    React.createElement(Row, { label: 'Color' },
      React.createElement('div', { style: { display: 'flex', gap: 9, flexWrap: 'wrap' } },
        c.swatches.map((sw, i) => React.createElement('button', { key: i, title: sw.name, onClick: () => onSwatch(i),
          style: { width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', background: sw.hex, border: i === sel.swatchIndex ? `2px solid ${u.text}` : `1px solid ${u.line}`, boxShadow: i === sel.swatchIndex ? `0 0 0 3px ${u.accent}55` : 'none' } }),
        ),
      ),
    ),
    React.createElement('div', { style: { display: 'flex', gap: 9 } },
      onPlace && React.createElement(Btn, { theme, variant: 'primary', full: true, onClick: () => onPlace(k), size: 'md' }, React.createElement(Icon, { name: 'plus', size: 16 }), inRoom ? 'Place another' : 'Place in room'),
      React.createElement(Btn, { theme, variant: 'soft', full: true, onClick: () => onAddCart(k), size: 'md' }, React.createElement(Icon, { name: 'cart', size: 16 }), 'Add to cart'),
      React.createElement('button', { onClick: () => onWish(k), style: { width: 46, flexShrink: 0, borderRadius: 12, border: `1px solid ${wished ? '#ff9ab8' : u.line}`, background: wished ? '#ff9ab822' : u.card, color: wished ? '#ff9ab8' : u.soft, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        React.createElement(Icon, { name: 'heart', size: 18, color: wished ? '#ff9ab8' : u.soft, style: wished ? { fill: '#ff9ab8' } : undefined })),
    ),
    React.createElement('div', { style: { height: 1, background: u.line } }),
    React.createElement(Row, { label: 'About' },
      React.createElement('p', { style: { margin: 0, fontSize: 13.5, lineHeight: 1.55, color: u.text, opacity: 0.92 } }, c.desc),
      React.createElement('div', { style: { display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 4 } },
        React.createElement('span', { style: { fontSize: 11.5, padding: '5px 10px', borderRadius: 9, background: u.card, color: u.soft, fontWeight: 600 } }, c.materials),
        React.createElement('span', { style: { fontSize: 11.5, padding: '5px 10px', borderRadius: 9, background: u.card, color: u.soft, fontWeight: 600 } }, c.sub),
      ),
    ),
    // find similar
    React.createElement(Row, { label: 'Find similar' },
      React.createElement('div', { style: { display: 'flex', gap: 9, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 4px' } },
        CATALOGUE_KEYS.filter(x => CATALOGUE[x].cat === c.cat && x !== k).slice(0, 6).map(x => React.createElement('div', { key: x, onClick: () => onPlace && onPlace(x), style: { width: 92, flexShrink: 0, cursor: 'pointer' } },
          React.createElement(Thumb, { item: CATALOGUE[x], theme, h: 62, radius: 10 }),
          React.createElement('div', { style: { fontSize: 11, fontWeight: 700, marginTop: 4, color: u.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, CATALOGUE[x].label),
          React.createElement('div', { style: { fontSize: 11, color: u.accent, fontWeight: 700 } }, money(CATALOGUE[x].price)),
        )),
      ),
    ),
    React.createElement('button', { onClick: onReport, style: { alignSelf: 'flex-start', background: 'none', border: 'none', color: u.soft, fontSize: 12, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 0 } }, 'Report this item'),
  );
}

Object.assign(window, { ProductCard, ShopContent, DetailContent });
