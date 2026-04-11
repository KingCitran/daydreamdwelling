import { useTheme } from '@shared/ThemeProvider'

export function useBuilderStyles() {
  const t = useTheme()
  return makeBuilderStyles(t)
}

export function makeBuilderStyles(t) {
  // Active state: subtle accent tint that works in both light and dark moods
  const accentTint = `${t.accent}22`
  return {
    app: {
      width: '100vw', height: '100vh',
      background: t.bg,
      fontFamily: 'system-ui, sans-serif',
      overflow: 'hidden',
    },
    leftColumn: {
      position: 'absolute', bottom: 28, left: 28,
      display: 'flex', flexDirection: 'column', gap: 8,
      alignItems: 'flex-start',
      maxWidth: 'calc(100vw - 56px)',
    },
    bottomBar: {
      display: 'flex', flexDirection: 'row', gap: 6,
      flexWrap: 'wrap',
    },
    bottomBtn: {
      padding: '10px 18px',
      background: t.navBg, color: t.text,
      border: `1.5px solid ${t.surfaceBorder}`, borderRadius: 8,
      cursor: 'pointer', fontSize: 14,
      boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
      transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    },
    bottomBtnActive: {
      background: accentTint, borderColor: t.accent,
    },
    bottomCartBtn: {
      background: accentTint, borderColor: t.accent, color: t.text,
      display: 'flex', alignItems: 'center', gap: 6,
    },
    bottomSellBtn: {
      background: '#1a3a2a', borderColor: '#3a8a5a', color: '#a0ffcc',
    },
    hubPanel: {
      background: t.navBg, border: `1.5px solid ${t.surfaceBorder}`,
      borderRadius: 10, padding: '12px 14px 14px',
      width: 234, display: 'flex', flexDirection: 'column', gap: 7,
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    },
    hubSectionLabel: {
      margin: '2px 0 2px', fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '1px', color: t.textSoft,
    },
    hubDivider: {
      height: 1, background: t.surfaceBorder, margin: '1px 0',
    },
    hubBtnRow: {
      display: 'flex', gap: 6,
    },
    hubBtn: {
      flex: 1, padding: '7px 0',
      background: t.surface, color: t.text,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 6,
      cursor: 'pointer', fontSize: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.2s, border-color 0.2s, color 0.2s',
    },
    hubBtnActive: {
      background: accentTint, borderColor: t.accent, color: t.accent,
    },
    hubBtnDisabled: {
      opacity: 0.3, cursor: 'not-allowed',
    },
    hubLabel: {
      cursor: 'pointer',
    },
    hubRestoreBtn: {
      background: accentTint, borderColor: t.accent, color: t.accent,
    },
    hubBgRow: { display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' },
    hubBgSwatch: {
      width: 22, height: 22, borderRadius: 5,
      border: '2px solid transparent', cursor: 'pointer', flexShrink: 0,
    },
    hubBgSwatchActive: { border: '2px solid #fff' },
    hubBgPicker: {
      width: 28, height: 28, padding: 0,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 5,
      cursor: 'pointer', background: 'transparent',
    },
    roomPanel: {
      background: t.navBg, border: `1.5px solid ${t.surfaceBorder}`,
      borderRadius: 10, width: 280, maxHeight: 320,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    },
    roomPanelHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px 8px',
      borderBottom: `1px solid ${t.surfaceBorder}`, flexShrink: 0,
    },
    roomPanelTitle: { fontSize: 13, fontWeight: 700, color: t.text },
    roomPanelCount: { fontSize: 11, color: t.textSoft },
    roomPanelList: { overflowY: 'auto', flex: 1 },
    roomPanelEmpty: { color: t.textSoft, fontSize: 12, padding: 16, textAlign: 'center', margin: 0 },
    roomPanelItem: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px', borderBottom: `1px solid ${t.surfaceBorder}`,
      cursor: 'pointer',
    },
    roomPanelThumb: { width: 36, height: 36, borderRadius: 6, flexShrink: 0 },
    roomPanelInfo: { flex: 1, minWidth: 0 },
    roomPanelName: { margin: 0, fontSize: 12, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    roomPanelMeta: { margin: 0, fontSize: 10, color: t.textSoft },
    roomPanelIcon: { fontSize: 12, flexShrink: 0 },
    roomPanelUnwish: {
      fontSize: 12, color: '#ff7aa0', flexShrink: 0,
      background: 'transparent', border: 'none',
      cursor: 'pointer', padding: 0, lineHeight: 1,
    },
    cartBadge: {
      background: t.accent, color: t.accentText,
      borderRadius: '50%', width: 20, height: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, flexShrink: 0,
    },
    controls: {
      background: t.navBg, border: `1.5px solid ${t.surfaceBorder}`,
      borderRadius: 12, padding: '10px 14px',
      display: 'flex', flexDirection: 'column', gap: 8,
      width: 300, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto',
      boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    },
    ctrlRow:     { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    ctrlNameRow:      { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    ctrlNameLeft:     { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexShrink: 1 },
    ctrlNameRight:    { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
    ctrlRating:       { fontSize: 11, color: '#f0c060', fontWeight: 600, whiteSpace: 'nowrap' },
    ctrlRatingCount:  { fontSize: 10, color: t.textSoft, fontWeight: 400 },
    ctrlHDivider: { height: 1, background: t.surfaceBorder },
    controlsLeft: { display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 },
    controlsTitle: { margin: 0, fontSize: 14, fontWeight: 700, color: t.text },
    controlsBrand: { margin: 0, fontSize: 10, color: t.textSoft, letterSpacing: '0.3px' },
    badgeRow: { display: 'flex', gap: 6, alignItems: 'center' },
    wallNudgeGroup: { display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' },
    wallNudgeRow:   { display: 'flex', gap: 3 },

    // Diamond switcher
    diamondWrap: {
      position: 'relative', width: 70, height: 70, flexShrink: 0,
      background: t.bg, border: `1.5px solid ${t.surfaceBorder}`, borderRadius: 10,
      overflow: 'hidden',
    },
    diamondBg: { display: 'none' },
    dBarTL: { position: 'absolute', width: 33, height: 8, left: 8,  top: 20, transform: 'rotate(-45deg)', cursor: 'pointer', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
    dBarTR: { position: 'absolute', width: 33, height: 8, left: 31, top: 20, transform: 'rotate(45deg)',  cursor: 'pointer', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
    dBarBR: { position: 'absolute', width: 33, height: 8, left: 31, top: 43, transform: 'rotate(-45deg)', cursor: 'pointer', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
    dBarBL: { position: 'absolute', width: 33, height: 8, left: 8,  top: 43, transform: 'rotate(45deg)',  cursor: 'pointer', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
    dBarActive: { background: t.accent, borderColor: t.accent },

    swapFaceBtn: {
      width: 70, height: 70, cursor: 'pointer', flexShrink: 0,
      background: t.surface, border: `1.5px solid ${t.surfaceBorder}`, borderRadius: 10,
      color: t.text, fontSize: 22, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.15s, border-color 0.15s',
    },
    // Mini wall diagram (in SelectedControls)
    wallSideGroup:    { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' },
    miniWallDiagram:  { display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' },
    miniWallRow:      { display: 'flex', gap: 2, alignItems: 'center' },
    miniWallRoom:     { width: 30, height: 22, background: t.bg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 2 },
    miniWallTop:    { width: 50, height: 8, cursor: 'pointer', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: '3px 3px 0 0', padding: 0 },
    miniWallBottom: { width: 50, height: 8, cursor: 'pointer', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: '0 0 3px 3px', padding: 0 },
    miniWallLeft:   { width: 8, height: 22, cursor: 'pointer', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: '3px 0 0 3px', padding: 0 },
    miniWallRight:  { width: 8, height: 22, cursor: 'pointer', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: '0 3px 3px 0', padding: 0 },
    miniWallActive: { background: t.accent, borderColor: t.accent },

    wallBtnGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(2, 32px)', gridTemplateRows: 'repeat(2, 32px)', gap: 4,
    },
    wallNudgeBtn:      { width: 28, height: 24, borderRadius: 5, border: `1px solid ${t.surfaceBorder}`, background: t.navBg, color: t.text, cursor: 'pointer', fontSize: 12 },
    wallSideBtn: {
      width: 32, height: 32, borderRadius: 6, border: `1px solid ${t.surfaceBorder}`,
      background: t.navBg, color: t.textSoft, cursor: 'pointer', fontSize: 12, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
    },
    wallSideBtnActive: { background: accentTint, borderColor: t.accent, color: t.accent },
    badgeOwned:  { fontSize: 10, color: '#70c070', fontWeight: 600 },
    badgeLocked: { fontSize: 10, color: '#f0c060', fontWeight: 600 },
    badgeWish:   { fontSize: 10, color: '#ff7aa0', fontWeight: 600 },
    ctrlDivider: { width: 1, height: 32, background: t.surfaceBorder, flexShrink: 0 },
    rotateBtn: {
      padding: '6px 14px', borderRadius: 7,
      background: t.surface, color: t.text,
      border: `1px solid ${t.surfaceBorder}`,
      cursor: 'pointer', fontSize: 14, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
    },
    sizeLabel: { fontSize: 10, color: t.textSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 },
    swatchRow: { display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' },
    swatchBtn: {
      width: 22, height: 22, borderRadius: '50%',
      border: '2px solid transparent',
      cursor: 'pointer', flexShrink: 0,
      transition: 'border-color 0.15s, transform 0.15s',
    },
    swatchBtnActive: { border: '2px solid #fff', transform: 'scale(1.3)' },
    sizeCycle: { display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 },
    cycleArrow: {
      width: 24, height: 24, borderRadius: 5,
      background: t.surface, color: t.text,
      border: `1px solid ${t.surfaceBorder}`,
      cursor: 'pointer', fontSize: 14, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      lineHeight: 1, padding: 0,
    },
    cycleLabel: { fontSize: 12, color: t.text, fontWeight: 600, whiteSpace: 'nowrap', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' },
    cyclePrice: { fontWeight: 400, color: t.textSoft },
    qtyRow: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
    qtyBtn: {
      width: 26, height: 26, borderRadius: 6,
      background: t.surface, color: t.text,
      border: `1px solid ${t.surfaceBorder}`,
      cursor: 'pointer', fontSize: 15, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    paneStep: {
      background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
      color: t.textSoft, fontSize: 10, padding: '1px 5px',
      cursor: 'pointer', borderRadius: 3, lineHeight: 1,
    },
    stepperInput: {
      width: 40, textAlign: 'center',
      background: t.surface, border: `1px solid ${t.surfaceBorder}`,
      color: t.text, borderRadius: 4, padding: '3px 2px', fontSize: 12,
    },
    stepperUnit: { color: t.textSoft, fontSize: 11 },
    qtyNum: { fontSize: 14, fontWeight: 700, color: t.text, minWidth: 20, textAlign: 'center' },
    actionRow: { display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' },
    actionBtn: {
      padding: '5px 10px', borderRadius: 6,
      background: t.surface, color: t.text,
      border: `1px solid ${t.surfaceBorder}`,
      cursor: 'pointer', fontSize: 12, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 4,
      transition: 'background 0.2s, border-color 0.2s', flexShrink: 0,
    },
    iconRow: { display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 },
    iconBtn: {
      width: 28, height: 28, borderRadius: 6,
      background: t.surface, color: t.text,
      border: `1px solid ${t.surfaceBorder}`,
      cursor: 'pointer', fontSize: 13,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.2s, border-color 0.2s, transform 0.2s',
    },
    iconWish:     { color: '#ff7aa0', borderColor: t.surfaceBorder },
    iconCart:     { background: accentTint, borderColor: t.accent, color: t.accent },
    iconOwned:    { background: '#2a4a2a', borderColor: '#3a7a3a', color: '#70c070' },
    iconUnlocked: { color: t.textSoft, borderColor: t.surfaceBorder },
    iconLocked:   { background: '#3a2a08', borderColor: '#d4a020', color: '#f0c060', boxShadow: '0 0 0 1.5px #d4a02050' },
    iconInfo:     { color: t.accent },
    iconDelete:   { background: '#4a2a35', borderColor: '#7a3a4a', color: '#ffaaaa' },
    // ── Wall picker ───────────────────────────────────────────────────
    wallPickerOverlay: {
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    },
    wallPickerPanel: {
      background: t.navBg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14,
      padding: '22px 26px 20px', width: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    },
    wallPickerTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: t.text },
    wallPickerSub:   { margin: 0, fontSize: 12, color: t.textSoft, textAlign: 'center' },
    wallPickerCancel: {
      marginTop: 4, padding: '6px 20px', cursor: 'pointer',
      background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
      borderRadius: 6, color: t.textSoft, fontSize: 12,
    },
    musicPanel: {
      position: 'absolute', top: 16,
      width: 300,
      background: t.navBg, border: `1px solid ${t.surfaceBorder}`,
      borderRadius: 12, padding: 12,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 30, fontFamily: 'system-ui, sans-serif',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    },
    musicHeader: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    musicTitle: { fontSize: 13, fontWeight: 700, color: t.text },
    musicClose: {
      background: 'transparent', border: 'none',
      color: t.textSoft, cursor: 'pointer', fontSize: 14, lineHeight: 1,
    },
    stationGrid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
    },
    stationCard: {
      padding: '8px 10px', borderRadius: 8,
      border: `1px solid ${t.surfaceBorder}`, background: t.surface,
      cursor: 'pointer', textAlign: 'left',
      display: 'flex', flexDirection: 'column', gap: 3,
    },
    stationCardActive: {
      border: `1px solid ${t.accent}`, background: accentTint,
    },
    stationComingSoon: {
      textAlign: 'center', padding: '12px 8px',
      background: t.surface, borderRadius: 8, border: `1px solid ${t.surfaceBorder}`,
    },
    sectionLabel: {
      margin: 0, fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '1px', color: t.textSoft,
    },
    ceilingBanner: {
      position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
      background: t.navBg, border: `1px solid ${t.accent}`,
      borderRadius: 10, padding: '10px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      zIndex: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    },
    ceilingBannerText: { fontSize: 13, color: t.text, fontWeight: 500 },
    ceilingBannerCancel: {
      padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
      background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft, fontSize: 12,
    },
    // ── Room banner ──────────────────────────────────────────────────
    roomBannerWrap: {
      position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 2, zIndex: 45,
    },
    roomBannerBtn: {
      padding: '10px 20px', borderRadius: '10px 0 0 10px',
      background: t.navBg, border: `1.5px solid ${t.accent}`,
      color: t.text, fontSize: 17, fontWeight: 700,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(6px)',
      letterSpacing: '0.2px',
    },
    roomBannerEdit: {
      padding: '4px 8px', borderRadius: 6,
      background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
      color: t.textSoft, fontSize: 12, cursor: 'pointer',
      marginLeft: 2,
    },
    roomBannerInput: {
      padding: '10px 14px', borderRadius: '10px 0 0 10px',
      background: t.navBg, border: `1.5px solid ${t.accent}`,
      color: t.text, fontSize: 17, fontWeight: 700,
      outline: 'none', minWidth: 140, boxSizing: 'border-box',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
    roomBannerDrop: {
      padding: '10px 10px', borderRadius: '0 10px 10px 0',
      background: t.navBg, border: `1.5px solid ${t.accent}`, borderLeft: 'none',
      color: t.textSoft, fontSize: 13, cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(6px)',
    },
    roomDropdown: {
      position: 'absolute', top: '100%', left: 0, marginTop: 4,
      background: t.navBg, border: `1px solid ${t.surfaceBorder}`,
      borderRadius: 8, padding: '4px 0', minWidth: 160,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 200,
      display: 'flex', flexDirection: 'column',
    },
    roomDropItem: {
      padding: '8px 14px', background: 'transparent', border: 'none',
      color: t.text, fontSize: 12, cursor: 'pointer', textAlign: 'left',
    },
    roomDropItemActive: { color: t.accent, fontWeight: 700 },
    // ── Room overview ────────────────────────────────────────────────
    overviewOverlay: {
      position: 'fixed', inset: 0, zIndex: 300,
      background: t.navBg, backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
    },
    overviewHeader: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderBottom: `1px solid ${t.surfaceBorder}`, flexShrink: 0,
    },
    overviewTitle: { fontSize: 16, fontWeight: 700, color: t.text },
    overviewHeaderBtn: {
      padding: '6px 14px', borderRadius: 6,
      background: t.surface, border: `1px solid ${t.surfaceBorder}`, color: t.text,
      fontSize: 12, cursor: 'pointer',
    },
    overviewClose: {
      padding: '6px 12px', borderRadius: 6,
      background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft,
      fontSize: 14, cursor: 'pointer', marginLeft: 8,
    },
    overviewCanvas: {
      flex: 1, overflow: 'auto',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: 40,
    },
  }
}
