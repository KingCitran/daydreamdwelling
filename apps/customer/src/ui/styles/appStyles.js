export const styles = {
  app: {
    width: '100vw', height: '100vh',
    background: '#1a1a2e',
    fontFamily: 'system-ui, sans-serif',
    overflow: 'hidden',
  },
  leftColumn: {
    position: 'absolute', bottom: 28, left: 28,
    display: 'flex', flexDirection: 'column', gap: 8,
    alignItems: 'flex-start',
  },
  bottomBar: {
    display: 'flex', flexDirection: 'row', gap: 8,
  },
  bottomBtn: {
    padding: '10px 18px',
    background: '#2a2a3d', color: '#e0d9ff',
    border: '1px solid #4a4a6a', borderRadius: 8,
    cursor: 'pointer', fontSize: 14,
  },
  bottomBtnActive: {
    background: '#1e1e30', borderColor: '#6a6a9a',
  },
  bottomCartBtn: {
    background: '#3a2a5a', borderColor: '#7a5aaa', color: '#e0d9ff',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  bottomSellBtn: {
    background: '#1a3a2a', borderColor: '#3a8a5a', color: '#a0ffcc',
  },
  hubPanel: {
    background: '#2a2a3d', border: '1px solid #4a4a6a',
    borderRadius: 10, padding: '12px 14px 14px',
    width: 234, display: 'flex', flexDirection: 'column', gap: 7,
  },
  hubSectionLabel: {
    margin: '2px 0 2px', fontSize: 10, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa',
  },
  hubDivider: {
    height: 1, background: '#3a3a5a', margin: '1px 0',
  },
  hubBtnRow: {
    display: 'flex', gap: 6,
  },
  hubBtn: {
    flex: 1, padding: '7px 0',
    background: '#3a3a55', color: '#d0cfff',
    border: '1px solid #4a4a6a', borderRadius: 6,
    cursor: 'pointer', fontSize: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  hubBtnActive: {
    background: '#2a3a4a', borderColor: '#5a8aaa', color: '#a0d0ff',
  },
  hubBtnDisabled: {
    opacity: 0.3, cursor: 'not-allowed',
  },
  hubLabel: {
    cursor: 'pointer',
  },
  hubRestoreBtn: {
    background: '#2a3a4a', borderColor: '#5a8aaa', color: '#a0d0ff',
  },
  hubBgRow: { display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' },
  hubBgSwatch: {
    width: 22, height: 22, borderRadius: 5,
    border: '2px solid transparent', cursor: 'pointer', flexShrink: 0,
  },
  hubBgSwatchActive: { border: '2px solid #fff' },
  hubBgPicker: {
    width: 28, height: 28, padding: 0,
    border: '1px solid #4a4a6a', borderRadius: 5,
    cursor: 'pointer', background: 'transparent',
  },
  roomPanel: {
    background: '#2a2a3d', border: '1px solid #4a4a6a',
    borderRadius: 10, width: 280, maxHeight: 320,
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  roomPanelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px 8px',
    borderBottom: '1px solid #3a3a5a', flexShrink: 0,
  },
  roomPanelTitle: { fontSize: 13, fontWeight: 700, color: '#e0d9ff' },
  roomPanelCount: { fontSize: 11, color: '#7878aa' },
  roomPanelList: { overflowY: 'auto', flex: 1 },
  roomPanelEmpty: { color: '#7878aa', fontSize: 12, padding: 16, textAlign: 'center', margin: 0 },
  roomPanelItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px', borderBottom: '1px solid #2a2a3a',
    cursor: 'pointer',
  },
  roomPanelThumb: { width: 36, height: 36, borderRadius: 6, flexShrink: 0 },
  roomPanelInfo: { flex: 1, minWidth: 0 },
  roomPanelName: { margin: 0, fontSize: 12, fontWeight: 600, color: '#e0d9ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roomPanelMeta: { margin: 0, fontSize: 10, color: '#7878aa' },
  roomPanelIcon: { fontSize: 12, flexShrink: 0 },
  roomPanelUnwish: {
    fontSize: 12, color: '#ff7aa0', flexShrink: 0,
    background: 'transparent', border: 'none',
    cursor: 'pointer', padding: 0, lineHeight: 1,
  },
  cartBadge: {
    background: '#9a7aee', color: '#fff',
    borderRadius: '50%', width: 20, height: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  controls: {
    background: '#2a2a3d', border: '1px solid #4a4a6a',
    borderRadius: 12, padding: '10px 14px',
    display: 'flex', flexDirection: 'column', gap: 8,
    minWidth: 600, maxWidth: 'calc(100vw - 40px)',
  },
  ctrlRow:     { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  ctrlNameRow:      { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  ctrlNameLeft:     { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexShrink: 1 },
  ctrlNameRight:    { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  ctrlRating:       { fontSize: 11, color: '#f0c060', fontWeight: 600, whiteSpace: 'nowrap' },
  ctrlRatingCount:  { fontSize: 10, color: '#9090b8', fontWeight: 400 },
  ctrlHDivider: { height: 1, background: '#3a3a5a' },
  controlsLeft: { display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 },
  controlsTitle: { margin: 0, fontSize: 14, fontWeight: 700, color: '#e0d9ff' },
  controlsBrand: { margin: 0, fontSize: 10, color: '#7878aa', letterSpacing: '0.3px' },
  badgeRow: { display: 'flex', gap: 6, alignItems: 'center' },
  wallNudgeGroup: { display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' },
  wallNudgeRow:   { display: 'flex', gap: 3 },


  // Diamond switcher — 70×70 rounded-square container.
  // Tips at r=23 from center (35,35): T=(35,12) R=(58,35) B=(35,58) L=(12,35)
  // Edge length = 23√2 ≈ 32.5 px → bars are 33 px wide so endpoints meet.
  // Edge midpoints: tl=(24,24) tr=(46,24) br=(46,46) bl=(24,46)
  // Bar positions: left = midX − 16.5, top = midY − 4
  diamondWrap: {
    position: 'relative', width: 70, height: 70, flexShrink: 0,
    background: '#1a1a2e', border: '1.5px solid #3a3a5a', borderRadius: 10,
    overflow: 'hidden',
  },
  diamondBg: { display: 'none' }, // container itself is the rounded square
  dBarTL: { position: 'absolute', width: 33, height: 8, left: 8,  top: 20, transform: 'rotate(-45deg)', cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
  dBarTR: { position: 'absolute', width: 33, height: 8, left: 31, top: 20, transform: 'rotate(45deg)',  cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
  dBarBR: { position: 'absolute', width: 33, height: 8, left: 31, top: 43, transform: 'rotate(-45deg)', cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
  dBarBL: { position: 'absolute', width: 33, height: 8, left: 8,  top: 43, transform: 'rotate(45deg)',  cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: 4, padding: 0, transition: 'background 0.12s, border-color 0.12s' },
  dBarActive: { background: '#5050aa', borderColor: '#9898ff' },

  swapFaceBtn: {
    width: 70, height: 70, cursor: 'pointer', flexShrink: 0,
    background: '#1a1a2e', border: '1.5px solid #3a3a5a', borderRadius: 10,
    color: '#c0b8ff', fontSize: 22, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s, border-color 0.15s',
  },
  // Mini wall diagram (in SelectedControls)
  wallSideGroup:    { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' },
  miniWallDiagram:  { display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' },
  miniWallRow:      { display: 'flex', gap: 2, alignItems: 'center' },
  miniWallRoom:     { width: 30, height: 22, background: '#1e1e2e', border: '1px solid #2a2a4a', borderRadius: 2 },
  miniWallTop:    { width: 50, height: 8, cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: '3px 3px 0 0', padding: 0 },
  miniWallBottom: { width: 50, height: 8, cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: '0 0 3px 3px', padding: 0 },
  miniWallLeft:   { width: 8, height: 22, cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: '3px 0 0 3px', padding: 0 },
  miniWallRight:  { width: 8, height: 22, cursor: 'pointer', background: '#2a2a4a', border: '1px solid #5050a0', borderRadius: '0 3px 3px 0', padding: 0 },
  miniWallActive: { background: '#5050aa', borderColor: '#9898ff' },

  wallBtnGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 32px)', gridTemplateRows: 'repeat(2, 32px)', gap: 4,
  },
  wallNudgeBtn:      { width: 28, height: 24, borderRadius: 5, border: '1px solid #4a4a6a', background: '#2a2a3d', color: '#c0b8e8', cursor: 'pointer', fontSize: 12 },
  wallSideBtn: {
    width: 32, height: 32, borderRadius: 6, border: '1px solid #4a4a6a',
    background: '#2a2a3d', color: '#9898cc', cursor: 'pointer', fontSize: 12, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  },
  wallSideBtnActive: { background: '#3a2a5a', borderColor: '#9a7aee', color: '#c4a8ff' },
  badgeOwned:  { fontSize: 10, color: '#70c070', fontWeight: 600 },
  badgeLocked: { fontSize: 10, color: '#f0c060', fontWeight: 600 },
  badgeWish:   { fontSize: 10, color: '#ff7aa0', fontWeight: 600 },
  ctrlDivider: { width: 1, height: 32, background: '#3a3a5a', flexShrink: 0 },
  rotateBtn: {
    padding: '6px 14px', borderRadius: 7,
    background: '#3a3a55', color: '#c0b8ff',
    border: '1px solid #5a5a8a',
    cursor: 'pointer', fontSize: 14, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
  },
  sizeLabel: { fontSize: 10, color: '#7878aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 },
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
    background: '#3a3a55', color: '#c0b8ff',
    border: '1px solid #4a4a6a',
    cursor: 'pointer', fontSize: 14, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1, padding: 0,
  },
  cycleLabel: { fontSize: 12, color: '#e0d9ff', fontWeight: 600, whiteSpace: 'nowrap', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' },
  cyclePrice: { fontWeight: 400, color: '#9898cc' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 6,
    background: '#3a3a55', color: '#d0cfff',
    border: '1px solid #4a4a6a',
    cursor: 'pointer', fontSize: 15, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  paneStep: {
    background: 'transparent', border: '1px solid #4a4a6a',
    color: '#9090cc', fontSize: 10, padding: '1px 5px',
    cursor: 'pointer', borderRadius: 3, lineHeight: 1,
  },
  qtyNum: { fontSize: 14, fontWeight: 700, color: '#e0d9ff', minWidth: 20, textAlign: 'center' },
  actionRow: { display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' },
  actionBtn: {
    padding: '5px 10px', borderRadius: 6,
    background: '#3a3a55', color: '#d0cfff',
    border: '1px solid #4a4a6a',
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 4,
    transition: 'background 0.15s', flexShrink: 0,
  },
  iconRow: { display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 },
  iconBtn: {
    width: 28, height: 28, borderRadius: 6,
    background: '#3a3a55', color: '#d0cfff',
    border: '1px solid #4a4a6a',
    cursor: 'pointer', fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  },
  iconWish:   { color: '#ff7aa0', borderColor: '#6a4a6a' },
  iconCart:   { background: '#3a2a5a', borderColor: '#7a5aaa', color: '#c0a8ff' },
  iconOwned:    { background: '#2a4a2a', borderColor: '#3a7a3a', color: '#70c070' },
  iconUnlocked: { color: '#a090cc', borderColor: '#4a4a6a' },
  iconLocked:   { background: '#3a2a08', borderColor: '#d4a020', color: '#f0c060', boxShadow: '0 0 0 1.5px #d4a02050' },
  iconInfo:   { color: '#9878cc' },
  iconDelete: { background: '#4a2a35', borderColor: '#7a3a4a', color: '#ffaaaa' },
  // ── Wall picker ───────────────────────────────────────────────────
  wallPickerOverlay: {
    position: 'fixed', inset: 0, zIndex: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
  },
  wallPickerPanel: {
    background: '#1e1e2e', border: '1px solid #3a3a5a', borderRadius: 14,
    padding: '22px 26px 20px', width: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
  },
  wallPickerTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#e0d8ff' },
  wallPickerSub:   { margin: 0, fontSize: 12, color: '#9090b8', textAlign: 'center' },
  wallPickerCancel: {
    marginTop: 4, padding: '6px 20px', cursor: 'pointer',
    background: 'transparent', border: '1px solid #4a4a6a',
    borderRadius: 6, color: '#7070a0', fontSize: 12,
  },
  musicPanel: {
    position: 'absolute', top: 16,
    width: 300,
    background: '#1e1e30', border: '1px solid #3a3a5a',
    borderRadius: 12, padding: 12,
    display: 'flex', flexDirection: 'column', gap: 8,
    zIndex: 30, fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
  },
  musicHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  musicTitle: { fontSize: 13, fontWeight: 700, color: '#e0d9ff' },
  musicClose: {
    background: 'transparent', border: 'none',
    color: '#7878aa', cursor: 'pointer', fontSize: 14, lineHeight: 1,
  },
  stationGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
  },
  stationCard: {
    padding: '8px 10px', borderRadius: 8,
    border: '1px solid #3a3a5a', background: '#252538',
    cursor: 'pointer', textAlign: 'left',
    display: 'flex', flexDirection: 'column', gap: 3,
  },
  stationCardActive: {
    border: '1px solid #9a7aee', background: '#2d2250',
  },
  stationComingSoon: {
    textAlign: 'center', padding: '12px 8px',
    background: '#252538', borderRadius: 8, border: '1px solid #3a3a5a',
  },
  sectionLabel: {
    margin: 0, fontSize: 10, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '1px', color: '#7878aa',
  },
  ceilingBanner: {
    position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
    background: '#1e1e30', border: '1px solid #6060aa',
    borderRadius: 10, padding: '10px 18px',
    display: 'flex', alignItems: 'center', gap: 14,
    zIndex: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  },
  ceilingBannerText: { fontSize: 13, color: '#c0b8ff', fontWeight: 500 },
  ceilingBannerCancel: {
    padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
    background: 'transparent', border: '1px solid #5a5a8a', color: '#8888b8', fontSize: 12,
  },
  // ── Room banner ──────────────────────────────────────────────────
  roomBannerWrap: {
    position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 2, zIndex: 45,
  },
  roomBannerBtn: {
    padding: '10px 20px', borderRadius: '10px 0 0 10px',
    background: 'rgba(20,18,40,0.88)', border: '1.5px solid #6a6acc',
    color: '#d8d4ff', fontSize: 17, fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(6px)',
    letterSpacing: '0.2px',
  },
  roomBannerEdit: {
    padding: '4px 8px', borderRadius: 6,
    background: 'transparent', border: '1px solid #5a5a8a',
    color: '#9090c0', fontSize: 12, cursor: 'pointer',
    marginLeft: 2,
  },
  roomBannerInput: {
    padding: '10px 14px', borderRadius: '10px 0 0 10px',
    background: 'rgba(20,18,40,0.92)', border: '1.5px solid #9a7aee',
    color: '#e8e4ff', fontSize: 17, fontWeight: 700,
    outline: 'none', minWidth: 140, boxSizing: 'border-box',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  },
  roomBannerDrop: {
    padding: '10px 10px', borderRadius: '0 10px 10px 0',
    background: 'rgba(20,18,40,0.88)', border: '1.5px solid #6a6acc', borderLeft: 'none',
    color: '#9090c0', fontSize: 13, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(6px)',
  },
  roomDropdown: {
    position: 'absolute', top: '100%', left: 0, marginTop: 4,
    background: '#1e1e30', border: '1px solid #4a4a6a',
    borderRadius: 8, padding: '4px 0', minWidth: 160,
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 200,
    display: 'flex', flexDirection: 'column',
  },
  roomDropItem: {
    padding: '8px 14px', background: 'transparent', border: 'none',
    color: '#c0b8ff', fontSize: 12, cursor: 'pointer', textAlign: 'left',
  },
  roomDropItemActive: { color: '#9a7aee', fontWeight: 700 },
  // ── Room overview ────────────────────────────────────────────────
  overviewOverlay: {
    position: 'fixed', inset: 0, zIndex: 300,
    background: 'rgba(10,10,20,0.92)', backdropFilter: 'blur(4px)',
    display: 'flex', flexDirection: 'column',
    fontFamily: 'system-ui, sans-serif',
  },
  overviewHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', borderBottom: '1px solid #3a3a5a', flexShrink: 0,
  },
  overviewTitle: { fontSize: 16, fontWeight: 700, color: '#e0d9ff' },
  overviewHeaderBtn: {
    padding: '6px 14px', borderRadius: 6,
    background: '#3a3a55', border: '1px solid #5a5a8a', color: '#c0b8ff',
    fontSize: 12, cursor: 'pointer',
  },
  overviewClose: {
    padding: '6px 12px', borderRadius: 6,
    background: 'transparent', border: '1px solid #5a5a8a', color: '#8888bb',
    fontSize: 14, cursor: 'pointer', marginLeft: 8,
  },
  overviewCanvas: {
    flex: 1, overflow: 'auto',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: 40,
  },
}

// ── Room Banner (top-center name badge + dropdown) ───────────────────
function RoomBanner({ currentRoomId, roomName, allRoomsData, roomNames, onOpenOverview, onNavigate, onRename }) {
  const [dropOpen,  setDropOpen]  = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [draft,     setDraft]     = useState(roomName)
  const roomIds   = Object.keys(allRoomsData).map(Number)
  const hasMultiple = roomIds.length > 1

  const commitRename = () => {
    const trimmed = draft.trim()
    if (trimmed) onRename(currentRoomId, trimmed)
    setEditing(false)
  }

  return (
    <div style={styles.roomBannerWrap}>
      {editing ? (
        <input
          style={styles.roomBannerInput}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => {
            if (e.key === 'Enter')  commitRename()
            if (e.key === 'Escape') { setEditing(false); setDraft(roomName) }
          }}
          autoFocus
        />
      ) : (
        <button style={styles.roomBannerBtn} onClick={onOpenOverview} title="Click to open overview · double-click to rename">
          🏠 <span onDoubleClick={e => { e.stopPropagation(); setDraft(roomName); setEditing(true) }}>{roomName}</span>
        </button>
      )}
      {!editing && (
        <button style={styles.roomBannerEdit}
          onClick={() => { setDraft(roomName); setEditing(true) }}
          title="Rename room">✏</button>
      )}
      {!editing && hasMultiple && (
        <div style={{ position: 'relative' }}>
          <button style={styles.roomBannerDrop} onClick={() => setDropOpen(v => !v)} title="Switch room">▾</button>
          {dropOpen && (
            <div style={styles.roomDropdown}>
              {roomIds.map(id => {
                const name = roomNames[id] || `Room ${id + 1}`
                const isActive = id === currentRoomId
                return (
                  <button key={id} style={{ ...styles.roomDropItem, ...(isActive ? styles.roomDropItemActive : {}) }}
                    onClick={() => { onNavigate(id); setDropOpen(false) }}
                  >
                    {isActive ? '● ' : '○ '}{name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
