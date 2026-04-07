import { useTheme } from '@shared/ThemeProvider'

export function useShopStyles() {
  const t = useTheme()
  return makeShopStyles(t)
}

export function makeShopStyles(t) {
  return {
    drawer: {
      position: 'relative',
      width: '100%', height: '100%',
      background: t.bg, borderLeft: `1px solid ${t.surfaceBorder}`,
      display: 'flex', flexDirection: 'column',
      transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      zIndex: 20, fontFamily: 'system-ui, sans-serif',
    },
    header: {
      padding: '14px 16px 10px', borderBottom: `1px solid ${t.surfaceBorder}`, flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: 2,
    },
    headerTitle:  { fontSize: 17, fontWeight: 700, color: t.text },
    headerCrumb:  { fontSize: 10, color: t.textSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

    navTabs: { display: 'flex', flexShrink: 0, borderBottom: `1px solid ${t.surfaceBorder}` },
    navTab: {
      flex: 1, padding: '10px 0',
      background: 'transparent', color: t.textSoft,
      border: 'none', borderBottom: '2px solid transparent',
      cursor: 'pointer', fontSize: 13, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    },
    navTabActive: { color: t.text, borderBottom: `2px solid ${t.accent}` },
    navBadge: {
      background: t.accent, color: t.accentText, borderRadius: '50%',
      width: 17, height: 17, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700,
    },

    searchBar: {
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 14px', borderBottom: `1px solid ${t.surfaceBorder}`, flexShrink: 0,
    },
    searchBackBtn: {
      padding: '5px 9px', background: 'transparent', color: t.textSoft,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 6,
      cursor: 'pointer', fontSize: 14, flexShrink: 0, lineHeight: 1,
    },
    searchInput: {
      flex: 1, padding: '7px 10px',
      background: t.surface, color: t.text,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 6,
      fontSize: 13, outline: 'none',
    },
    searchClear: {
      background: 'transparent', border: 'none', color: t.textSoft,
      cursor: 'pointer', fontSize: 14, padding: '0 2px', flexShrink: 0,
    },

    scopeRow: {
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
      borderBottom: `1px solid ${t.surfaceBorder}`, flexShrink: 0,
    },
    scopeLabel: { fontSize: 10, color: t.textSoft, flexShrink: 0 },
    scopeBtn: {
      padding: '3px 10px', fontSize: 10,
      background: t.surface, color: t.textSoft,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 12, cursor: 'pointer',
    },
    scopeBtnActive: { background: `${t.accent}25`, borderColor: t.accent, color: t.text, fontWeight: 700 },

    filterSection: { borderBottom: `1px solid ${t.surfaceBorder}`, flexShrink: 0 },
    filterToggle: {
      width: '100%', padding: '9px 18px',
      background: 'transparent', color: t.textSoft,
      border: 'none', cursor: 'pointer', fontSize: 12,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    filterDot: { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.accent, marginLeft: 6, verticalAlign: 'middle' },
    filterChevron: { fontSize: 9, color: t.textSoft },
    filterBody: { padding: '2px 18px 14px', display: 'flex', flexDirection: 'column', gap: 4 },
    filterGroupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    filterLabel: { margin: '0 0 4px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: t.textSoft },
    filterGroupSearch: { padding: '2px 8px', fontSize: 10, background: t.surface, color: t.text, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, outline: 'none', width: 100 },
    filterNoResults: { fontSize: 10, color: t.textSoft, fontStyle: 'italic' },
    filterValue: { color: t.accent, fontWeight: 700, textTransform: 'none', letterSpacing: 0 },
    slider: { width: '100%', accentColor: t.accent, cursor: 'pointer' },
    chipRow: { display: 'flex', flexWrap: 'wrap', gap: 5 },
    chipRowScroll: { maxHeight: 110, overflowY: 'auto', paddingRight: 2 },
    chip: { padding: '3px 10px', background: t.surface, color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12, cursor: 'pointer', fontSize: 10 },
    chipActive: { background: `${t.accent}25`, borderColor: t.accent, color: t.text },
    filterActiveCount: { color: t.accent, fontWeight: 700 },
    showMoreBtn: { alignSelf: 'flex-start', marginTop: 2, padding: '2px 0', background: 'transparent', border: 'none', color: t.textSoft, cursor: 'pointer', fontSize: 10 },
    clearBtn: { alignSelf: 'flex-start', marginTop: 4, padding: '4px 12px', background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 5, cursor: 'pointer', fontSize: 10 },

    list: { flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 },

    slideContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
    slidePanel: {
      position: 'absolute', inset: 0,
      overflowY: 'auto', overflowX: 'hidden',
      transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      display: 'flex', flexDirection: 'column',
    },

    modeList: { display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px' },
    modeCard: {
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.07)',
      cursor: 'pointer', transition: 'opacity 0.15s',
    },
    modeEmoji:   { fontSize: 26, flexShrink: 0, lineHeight: 1 },
    modeText:    { display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 },
    modeLabel:   { fontSize: 14, fontWeight: 700, color: '#e0d9ff' },   // stays white — on dark gradient cards
    modeTagline: { fontSize: 11, color: '#9898cc', lineHeight: 1.4 },   // stays muted — on dark gradient cards
    modeArrow:   { fontSize: 20, color: '#7878aa', flexShrink: 0 },

    p1Content: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, padding: 14 },

    vibeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7, padding: '10px 14px' },
    vibeCard: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '12px 6px 10px', borderRadius: 10, cursor: 'pointer',
      border: `1px solid ${t.surfaceBorder}`, position: 'relative', textAlign: 'center',
    },
    vibeEmoji: { fontSize: 22, lineHeight: 1 },
    vibeName:  { fontSize: 10, fontWeight: 600, color: t.text },
    vibeCount: { fontSize: 9, color: t.textSoft },

    colorGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '10px 14px' },
    colorCard: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: '14px 6px 12px', borderRadius: 12, cursor: 'pointer',
      background: t.surface, border: `1px solid ${t.surfaceBorder}`,
      position: 'relative', textAlign: 'center', transition: 'border-color 0.15s',
    },
    colorSwatch: { width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0 },
    colorName:   { fontSize: 10, fontWeight: 600, color: t.text, lineHeight: 1.3 },
    colorCount:  { position: 'absolute', top: 6, right: 7, fontSize: 9, fontWeight: 700, color: t.text, background: `${t.accent}22`, borderRadius: 10, padding: '1px 5px' },

    catGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, padding: 14 },
    catCard: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '16px 10px 14px',
      background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12,
      cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
      position: 'relative', textAlign: 'center',
    },
    catCardEmpty:   { opacity: 0.3, cursor: 'default' },
    catEmoji:       { fontSize: 26, lineHeight: 1 },
    catCardName:    { fontSize: 13, fontWeight: 700, color: t.text },
    catCardTagline: { fontSize: 10, color: t.textSoft, lineHeight: 1.4 },
    catCardCount:   { position: 'absolute', top: 8, right: 10, fontSize: 10, fontWeight: 700, color: t.text, background: `${t.accent}22`, borderRadius: 10, padding: '1px 6px' },

    panelHeader: {
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px 6px', borderBottom: `1px solid ${t.surfaceBorder}`,
      position: 'sticky', top: 0, zIndex: 1,
      background: t.bg, flexShrink: 0,
    },
    panelTitle: { fontSize: 14, fontWeight: 700, color: t.text },
    backBtn: { padding: '5px 12px', background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 20, cursor: 'pointer', fontSize: 11, flexShrink: 0 },

    subcatGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: '10px 14px' },
    subcatCard: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '12px 8px 10px',
      background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10,
      cursor: 'pointer', position: 'relative', textAlign: 'center', transition: 'border-color 0.15s',
    },
    subcatEmoji:     { fontSize: 22, lineHeight: 1 },
    subcatCardName:  { fontSize: 11, fontWeight: 600, color: t.text },
    subcatCardCount: { position: 'absolute', top: 6, right: 8, fontSize: 9, fontWeight: 700, color: t.text, background: `${t.accent}22`, borderRadius: 10, padding: '1px 5px' },

    catItemList: { padding: '8px 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 },
    emptyMsg: { color: t.textSoft, fontSize: 13, textAlign: 'center', paddingTop: 20, margin: 0 },

    cartEmpty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 },
    cartEmptyIcon: { fontSize: 36, margin: 0 },
    cartList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
    cartItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${t.surfaceBorder}`, cursor: 'pointer' },
    cartThumb: { width: 52, height: 52, borderRadius: 8, flexShrink: 0 },
    cartInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
    cartLabel: { margin: 0, fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    cartMeta:  { margin: 0, fontSize: 11, color: t.textSoft },
    cartLineTotal: { margin: 0, fontSize: 12, color: t.accent, fontWeight: 600 },
    cartControls: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 },
    qtyRow: { display: 'flex', alignItems: 'center', gap: 6 },
    qtyBtn: { width: 26, height: 26, borderRadius: 6, background: t.surface, color: t.text, border: `1px solid ${t.surfaceBorder}`, cursor: 'pointer', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    qtyNum: { fontSize: 13, fontWeight: 700, color: t.text, minWidth: 22, textAlign: 'center' },
    removeBtn: { background: 'transparent', color: t.textSoft, border: 'none', cursor: 'pointer', fontSize: 10, textDecoration: 'underline', padding: 0 },
    cartFooter: { padding: '14px 14px 18px', borderTop: `1px solid ${t.surfaceBorder}`, display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 },
    cartTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    cartTotalLabel: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: t.textSoft },
    cartTotalPrice: { fontSize: 20, fontWeight: 700, color: t.text },
    checkoutBtn: { width: '100%', padding: '12px 0', background: t.accent, color: t.accentText, border: `1px solid ${t.accent}`, borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
    checkoutNote: { margin: 0, fontSize: 10, color: t.textSoft, textAlign: 'center' },
    wishIcon:       { fontSize: 15, color: t.textSoft },
    wishIconActive: { fontSize: 19, color: '#ff7aa0' },
    unwishBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: '#ff7aa0', flexShrink: 0, padding: '0 4px', lineHeight: 1 },
    shareBtn: { width: '100%', padding: '10px 0', background: `${t.accent}20`, color: t.accent, border: `1px solid ${t.accent}55`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },

    tile: { background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' },
    thumb: { height: 110, position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 8 },
    thumbCategory: { background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', padding: '2px 8px', borderRadius: 10 },
    thumbRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
    thumbSwatchPip: { width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.6)', flexShrink: 0 },
    thumbFinishBadge: { background: `${t.accent}cc`, color: t.accentText, fontSize: 12, padding: '1px 6px', borderRadius: 10 },
    tileBody: { padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
    tileMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tileBrand: { fontSize: 10, color: t.textSoft },
    tileRating: { fontSize: 10, color: '#f0c060' },
    tileLabel: { margin: 0, fontSize: 14, fontWeight: 700, color: t.text },
    tilePrice: { margin: 0, fontSize: 12, color: t.accent },
    tilePriceMax: { fontWeight: 400, color: t.textSoft },
    tileFinishPrice: { display: 'flex', alignItems: 'baseline', gap: 8, margin: '2px 0' },
    tileFinishRate:  { fontSize: 15, fontWeight: 700, color: t.accent },
    tileFinishUnit:  { fontSize: 11, fontWeight: 400, color: t.textSoft },
    tileRoomHint:    { fontSize: 10, color: t.textSoft },
    swatchRow: { display: 'flex', gap: 5, marginTop: 2 },
    swatch: { width: 12, height: 12, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, display: 'inline-block' },
    tileBtns: { display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' },
    tilePlace: { flex: 1, padding: '7px 0', background: t.accent, color: t.accentText, border: `1px solid ${t.accent}`, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
    tileApply: { flex: 1, padding: '7px 0', background: t.accent, color: t.accentText, border: `1px solid ${t.accent}`, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
    tileDetail: { flex: 1, fontSize: 12, color: t.textSoft, textAlign: 'center', userSelect: 'none' },
  }
}
