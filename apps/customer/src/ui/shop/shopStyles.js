import { useTheme } from '@shared/ThemeProvider'

export function useShopStyles() {
  const t = useTheme()
  return makeShopStyles(t)
}

export function makeShopStyles(t) {
  // Use panel tokens for consistent theming with builder panels
  const bg   = t.panelBg      ?? t.bg
  const surf = t.panelSurface ?? surf
  const bdr  = t.panelBorder  ?? bdr
  const txt  = t.panelText    ?? t.text
  const soft = t.panelTextSoft ?? soft

  return {
    drawer: {
      position: 'relative',
      width: '100%', height: '100%',
      background: bg, borderLeft: `1px solid ${bdr}`,
      display: 'flex', flexDirection: 'column',
      transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      zIndex: 20, fontFamily: 'system-ui, sans-serif',
    },
    header: {
      padding: '14px 16px 10px', borderBottom: `1px solid ${bdr}`, flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: 2,
    },
    headerTitle:  { fontSize: 17, fontWeight: 700, color: txt },
    headerCrumb:  { fontSize: 10, color: soft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

    navTabs: { display: 'flex', flexShrink: 0, borderBottom: `1px solid ${bdr}` },
    navTab: {
      flex: 1, padding: '10px 0',
      background: 'transparent', color: soft,
      border: 'none', borderBottom: '2px solid transparent',
      cursor: 'pointer', fontSize: 13, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
      transition: 'color 0.2s, border-color 0.2s, background 0.2s',
    },
    navTabActive: { color: txt, borderBottom: `2px solid ${t.accent}`, background: `${t.accent}08` },
    navBadge: {
      background: t.accent, color: t.accentText, borderRadius: '50%',
      width: 17, height: 17, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700,
    },

    searchBar: {
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 14px', borderBottom: `1px solid ${bdr}`, flexShrink: 0,
    },
    searchBackBtn: {
      padding: '5px 9px', background: 'transparent', color: soft,
      border: `1px solid ${bdr}`, borderRadius: 6,
      cursor: 'pointer', fontSize: 14, flexShrink: 0, lineHeight: 1,
    },
    searchInput: {
      flex: 1, padding: '7px 10px',
      background: surf, color: txt,
      border: `1px solid ${bdr}`, borderRadius: 6,
      fontSize: 13, outline: 'none',
    },
    searchClear: {
      background: 'transparent', border: 'none', color: soft,
      cursor: 'pointer', fontSize: 14, padding: '0 2px', flexShrink: 0,
    },

    scopeRow: {
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
      borderBottom: `1px solid ${bdr}`, flexShrink: 0,
    },
    scopeLabel: { fontSize: 10, color: soft, flexShrink: 0 },
    scopeBtn: {
      padding: '3px 10px', fontSize: 10,
      background: surf, color: soft,
      border: `1px solid ${bdr}`, borderRadius: 12, cursor: 'pointer',
    },
    scopeBtnActive: { background: `${t.accent}25`, borderColor: t.accent, color: txt, fontWeight: 700 },

    filterSection: { borderBottom: `1px solid ${bdr}`, flexShrink: 0 },
    filterToggle: {
      width: '100%', padding: '9px 18px',
      background: 'transparent', color: soft,
      border: 'none', cursor: 'pointer', fontSize: 12,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    filterDot: { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.accent, marginLeft: 6, verticalAlign: 'middle' },
    filterChevron: { fontSize: 9, color: soft },
    filterBody: { padding: '2px 18px 14px', display: 'flex', flexDirection: 'column', gap: 4 },
    filterGroupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    filterLabel: { margin: '0 0 4px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: soft },
    filterGroupSearch: { padding: '2px 8px', fontSize: 10, background: surf, color: txt, border: `1px solid ${bdr}`, borderRadius: 10, outline: 'none', width: 100 },
    filterNoResults: { fontSize: 10, color: soft, fontStyle: 'italic' },
    filterValue: { color: t.accent, fontWeight: 700, textTransform: 'none', letterSpacing: 0 },
    slider: { width: '100%', accentColor: t.accent, cursor: 'pointer' },
    chipRow: { display: 'flex', flexWrap: 'wrap', gap: 5 },
    chipRowScroll: { maxHeight: 110, overflowY: 'auto', paddingRight: 2 },
    chip: { padding: '3px 10px', background: surf, color: soft, border: `1px solid ${bdr}`, borderRadius: 12, cursor: 'pointer', fontSize: 10 },
    chipActive: { background: `${t.accent}25`, borderColor: t.accent, color: txt },
    filterActiveCount: { color: t.accent, fontWeight: 700 },
    showMoreBtn: { alignSelf: 'flex-start', marginTop: 2, padding: '2px 0', background: 'transparent', border: 'none', color: soft, cursor: 'pointer', fontSize: 10 },
    clearBtn: { alignSelf: 'flex-start', marginTop: 4, padding: '4px 12px', background: 'transparent', color: soft, border: `1px solid ${bdr}`, borderRadius: 5, cursor: 'pointer', fontSize: 10 },

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
      background: surf,
      border: `1px solid ${bdr}`,
      borderLeft: `3px solid ${soft}`,
      cursor: 'pointer', transition: 'background 0.15s',
    },
    modeEmoji:   { fontSize: 26, flexShrink: 0, lineHeight: 1 },
    modeText:    { display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 },
    modeLabel:   { fontSize: 14, fontWeight: 700, color: txt },
    modeTagline: { fontSize: 11, color: soft, lineHeight: 1.4 },
    modeArrow:   { fontSize: 20, color: soft, flexShrink: 0 },

    p1Content: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, padding: 14 },

    vibeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7, padding: '10px 14px' },
    vibeCard: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '12px 6px 10px', borderRadius: 10, cursor: 'pointer',
      border: `1px solid ${bdr}`, position: 'relative', textAlign: 'center',
      transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
    },
    vibeEmoji: { fontSize: 22, lineHeight: 1 },
    vibeName:  { fontSize: 10, fontWeight: 600, color: txt },
    vibeCount: { fontSize: 9, color: soft },

    colorGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '10px 14px' },
    colorCard: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: '14px 6px 12px', borderRadius: 12, cursor: 'pointer',
      background: surf, border: `1px solid ${bdr}`,
      position: 'relative', textAlign: 'center', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
    },
    colorSwatch: { width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0 },
    colorName:   { fontSize: 10, fontWeight: 600, color: txt, lineHeight: 1.3 },
    colorCount:  { position: 'absolute', top: 6, right: 7, fontSize: 9, fontWeight: 700, color: txt, background: `${t.accent}22`, borderRadius: 10, padding: '1px 5px' },

    catGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, padding: 14 },
    catCard: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '16px 10px 14px',
      background: surf, border: `1px solid ${bdr}`, borderRadius: 12,
      cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      position: 'relative', textAlign: 'center',
    },
    catCardEmpty:   { opacity: 0.3, cursor: 'default' },
    catEmoji:       { fontSize: 26, lineHeight: 1 },
    catCardName:    { fontSize: 13, fontWeight: 700, color: txt },
    catCardTagline: { fontSize: 10, color: soft, lineHeight: 1.4 },
    catCardCount:   { position: 'absolute', top: 8, right: 10, fontSize: 10, fontWeight: 700, color: txt, background: `${t.accent}22`, borderRadius: 10, padding: '1px 6px' },

    panelHeader: {
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px 6px', borderBottom: `1px solid ${bdr}`,
      position: 'sticky', top: 0, zIndex: 1,
      background: bg, flexShrink: 0,
    },
    panelTitle: { fontSize: 14, fontWeight: 700, color: txt },
    backBtn: { padding: '5px 12px', background: 'transparent', color: soft, border: `1px solid ${bdr}`, borderRadius: 20, cursor: 'pointer', fontSize: 11, flexShrink: 0 },

    subcatGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: '10px 14px' },
    subcatCard: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '12px 8px 10px',
      background: surf, border: `1px solid ${bdr}`, borderRadius: 10,
      cursor: 'pointer', position: 'relative', textAlign: 'center', transition: 'border-color 0.15s',
    },
    subcatEmoji:     { fontSize: 22, lineHeight: 1 },
    subcatCardName:  { fontSize: 11, fontWeight: 600, color: txt },
    subcatCardCount: { position: 'absolute', top: 6, right: 8, fontSize: 9, fontWeight: 700, color: txt, background: `${t.accent}22`, borderRadius: 10, padding: '1px 5px' },

    catItemList: { padding: '8px 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 },
    emptyMsg: { color: soft, fontSize: 13, textAlign: 'center', paddingTop: 20, margin: 0 },

    cartEmpty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 },
    cartEmptyIcon: { fontSize: 36, margin: 0 },
    cartList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
    cartItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${bdr}`, cursor: 'pointer' },
    cartThumb: { width: 52, height: 52, borderRadius: 8, flexShrink: 0 },
    cartInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
    cartLabel: { margin: 0, fontSize: 13, fontWeight: 600, color: txt, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    cartMeta:  { margin: 0, fontSize: 11, color: soft },
    cartLineTotal: { margin: 0, fontSize: 12, color: t.accent, fontWeight: 600 },
    cartControls: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 },
    qtyRow: { display: 'flex', alignItems: 'center', gap: 6 },
    qtyBtn: { width: 26, height: 26, borderRadius: 6, background: surf, color: txt, border: `1px solid ${bdr}`, cursor: 'pointer', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    qtyNum: { fontSize: 13, fontWeight: 700, color: txt, minWidth: 22, textAlign: 'center' },
    removeBtn: { background: 'transparent', color: soft, border: 'none', cursor: 'pointer', fontSize: 10, textDecoration: 'underline', padding: 0 },
    cartFooter: { padding: '14px 14px 18px', borderTop: `1px solid ${bdr}`, display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 },
    cartTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    cartTotalLabel: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: soft },
    cartTotalPrice: { fontSize: 20, fontWeight: 700, color: txt },
    checkoutBtn: { width: '100%', padding: '12px 0', background: t.accent, color: t.accentText, border: `1px solid ${t.accent}`, borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'background 0.2s, box-shadow 0.2s', boxShadow: `0 2px 12px ${t.accent}40` },
    checkoutNote: { margin: 0, fontSize: 10, color: soft, textAlign: 'center' },
    wishIcon:       { fontSize: 15, color: soft },
    wishIconActive: { fontSize: 19, color: '#ff7aa0' },
    unwishBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: '#ff7aa0', flexShrink: 0, padding: '0 4px', lineHeight: 1 },
    shareBtn: { width: '100%', padding: '10px 0', background: `${t.accent}20`, color: t.accent, border: `1px solid ${t.accent}55`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },

    tile: { background: surf, border: `1px solid ${bdr}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s' },
    thumb: { height: 110, position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 8 },
    thumbCategory: { background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', padding: '2px 8px', borderRadius: 10 },
    thumbRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
    thumbSwatchPip: { width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.6)', flexShrink: 0 },
    thumbFinishBadge: { background: `${t.accent}cc`, color: t.accentText, fontSize: 12, padding: '1px 6px', borderRadius: 10 },
    tileBody: { padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
    tileMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tileBrand: { fontSize: 10, color: soft },
    tileRating: { fontSize: 10, color: '#f0c060' },
    tileLabel: { margin: 0, fontSize: 14, fontWeight: 700, color: txt },
    tilePrice: { margin: 0, fontSize: 12, color: t.accent },
    tilePriceMax: { fontWeight: 400, color: soft },
    tileFinishPrice: { display: 'flex', alignItems: 'baseline', gap: 8, margin: '2px 0' },
    tileFinishRate:  { fontSize: 15, fontWeight: 700, color: t.accent },
    tileFinishUnit:  { fontSize: 11, fontWeight: 400, color: soft },
    tileRoomHint:    { fontSize: 10, color: soft },
    swatchRow: { display: 'flex', gap: 5, marginTop: 2 },
    swatch: { width: 12, height: 12, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, display: 'inline-block' },
    tileBtns: { display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' },
    tilePlace: { flex: 1, padding: '7px 0', background: `${t.accent}22`, color: t.accent, border: `1px solid ${t.accent}66`, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'background 0.2s, border-color 0.2s' },
    tileApply: { flex: 1, padding: '7px 0', background: `${t.accent}22`, color: t.accent, border: `1px solid ${t.accent}66`, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'background 0.2s, border-color 0.2s' },
    tileDetail: { flex: 1, fontSize: 12, color: soft, textAlign: 'center', userSelect: 'none' },

    // Sort row
    sortRow:       { display: 'flex', gap: 4, padding: '6px 10px 2px', flexWrap: 'wrap' },
    sortBtn:       { fontSize: 11, padding: '3px 9px', borderRadius: 20, border: `1px solid ${bdr}`, background: 'none', color: soft, cursor: 'pointer', letterSpacing: '0.02em' },
    sortBtnActive: { borderColor: t.accent, color: t.accent, background: `${t.accent}14` },

    // In room badge (positioned absolute inside thumb)
    inRoomBadge: { position: 'absolute', bottom: 6, left: 6, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: `${t.accent}dd`, color: t.accentText, padding: '2px 6px', borderRadius: 4, pointerEvents: 'none' },

    // Recently viewed row
    recentRow:       { padding: '8px 10px 4px' },
    recentLabel:     { fontSize: 10, color: soft, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 },
    recentScroll:    { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 },
    recentCard:      { flexShrink: 0, width: 68, cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: `1px solid ${bdr}`, background: surf },
    recentThumb:     { width: '100%', height: 48 },
    recentCardLabel: { display: 'block', fontSize: 10, color: txt, padding: '4px 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  }
}
