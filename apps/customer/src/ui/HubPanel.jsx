import { styles } from './styles/appStyles'

export default function HubPanel({
  compact, vw,
  zoomRef,
  showMeasurements, setShowMeasurements,
  showGrid, setShowGrid,
  panelOpen, setPanelOpen,
  styleOpen, setStyleOpen,
  setHubOpen,
  roomPanelOpen, setRoomPanelOpen,
  itemCount,
  windowPickerOpen, setWindowPickerOpen,
  doorPickerOpen, setDoorPickerOpen,
  wallPickerTypeKey,
  canUndo, canRedo, undo, redo,
  saveBookmark, bookmark, restoreBookmark,
  exportRoom, importRef, importRoom,
  onCloudSave, onCloudLoad, isSignedIn,
  screenshotRef,
}) {
  return (
    <div style={{ ...styles.hubPanel, width: compact ? Math.min(220, vw - 60) : 234 }}>
      <p style={styles.hubSectionLabel}>View</p>
      <div style={styles.hubBtnRow}>
        <button style={styles.hubBtn} onClick={() => { zoomRef.current = Math.min(120, zoomRef.current + 10) }}>＋ Zoom In</button>
        <button style={styles.hubBtn} onClick={() => { zoomRef.current = Math.max(15, zoomRef.current - 10) }}>－ Zoom Out</button>
      </div>
      <div style={styles.hubBtnRow}>
        <button
          style={{ ...styles.hubBtn, ...(showMeasurements ? styles.hubBtnActive : {}) }}
          onClick={() => setShowMeasurements(v => !v)}
        >📐 Measure</button>
        <button
          style={{ ...styles.hubBtn, ...(showGrid ? styles.hubBtnActive : {}) }}
          onClick={() => setShowGrid(v => !v)}
        >{showGrid ? '▦ Grid On' : '▢ Grid Off'}</button>
      </div>

      <div style={styles.hubDivider} />
      <p style={styles.hubSectionLabel}>Panels</p>
      <div style={styles.hubBtnRow}>
        <button
          style={{ ...styles.hubBtn, ...(panelOpen ? styles.hubBtnActive : {}) }}
          onClick={() => { setPanelOpen(p => !p); setStyleOpen(false); setHubOpen(false) }}
        >⚙ Layout</button>
        <button
          style={{ ...styles.hubBtn, ...(styleOpen ? styles.hubBtnActive : {}) }}
          onClick={() => { setStyleOpen(p => !p); setPanelOpen(false); setHubOpen(false) }}
        >🎨 Style</button>
        <button
          style={{ ...styles.hubBtn, ...(roomPanelOpen ? styles.hubBtnActive : {}) }}
          onClick={() => { setRoomPanelOpen(v => !v); setHubOpen(false) }}
        >🏠 Room{itemCount > 0 ? ` (${itemCount})` : ''}</button>
      </div>

      <div style={styles.hubDivider} />
      <p style={styles.hubSectionLabel}>Place</p>
      <div style={styles.hubBtnRow}>
        <button
          style={{ ...styles.hubBtn, ...(windowPickerOpen || wallPickerTypeKey === 'window' ? styles.hubBtnActive : {}) }}
          onClick={() => { setWindowPickerOpen(v => !v); setDoorPickerOpen(false); setHubOpen(false) }}
        >🪟 Window</button>
        <button
          style={{ ...styles.hubBtn, ...(doorPickerOpen || wallPickerTypeKey === 'door' ? styles.hubBtnActive : {}) }}
          onClick={() => { setDoorPickerOpen(v => !v); setWindowPickerOpen(false); setHubOpen(false) }}
        >🚪 Door</button>
      </div>

      <div style={styles.hubDivider} />
      <p style={styles.hubSectionLabel}>History</p>
      <div style={styles.hubBtnRow}>
        <button
          style={{ ...styles.hubBtn, ...(!canUndo ? styles.hubBtnDisabled : {}) }}
          onClick={undo} disabled={!canUndo}
        >↩ Undo</button>
        <button
          style={{ ...styles.hubBtn, ...(!canRedo ? styles.hubBtnDisabled : {}) }}
          onClick={redo} disabled={!canRedo}
        >↪ Redo</button>
      </div>
      <div style={styles.hubBtnRow}>
        <button style={styles.hubBtn} onClick={saveBookmark}>📌 Bookmark</button>
        {bookmark && (
          <button style={{ ...styles.hubBtn, ...styles.hubRestoreBtn }} onClick={restoreBookmark}>↺ Restore</button>
        )}
      </div>

      <div style={styles.hubDivider} />
      <p style={styles.hubSectionLabel}>Cloud</p>
      <div style={styles.hubBtnRow}>
        <button style={styles.hubBtn} onClick={onCloudSave} title={isSignedIn ? 'Save to cloud' : 'Sign in to save'}>
          ☁ {isSignedIn ? 'Save' : 'Save (sign in)'}
        </button>
        <button style={styles.hubBtn} onClick={onCloudLoad} title={isSignedIn ? 'Load from cloud' : 'Sign in to load'}>
          📂 My Rooms
        </button>
      </div>

      <div style={styles.hubDivider} />
      <p style={styles.hubSectionLabel}>File</p>
      <div style={styles.hubBtnRow}>
        <button style={styles.hubBtn} onClick={exportRoom}>💾 Export</button>
        <label style={{ ...styles.hubBtn, ...styles.hubLabel }}>
          📂 Import
          <input ref={importRef} type="file" accept=".json"
            style={{ display: 'none' }} onChange={importRoom} />
        </label>
      </div>
      <div style={styles.hubBtnRow}>
        <button style={styles.hubBtn} onClick={() => screenshotRef.current?.()}>📷 Screenshot</button>
      </div>

    </div>
  )
}
