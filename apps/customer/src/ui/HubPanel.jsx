import { useBuilderStyles } from './styles/appStyles'

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
  const s = useBuilderStyles()
  return (
    <div style={{ ...s.hubPanel, width: compact ? Math.min(220, vw - 60) : 234 }}>
      <p style={s.hubSectionLabel}>View</p>
      <div style={s.hubBtnRow}>
        <button style={s.hubBtn} onClick={() => { zoomRef.current = Math.min(120, zoomRef.current + 10) }}>＋ Zoom In</button>
        <button style={s.hubBtn} onClick={() => { zoomRef.current = Math.max(15, zoomRef.current - 10) }}>－ Zoom Out</button>
      </div>
      <div style={s.hubBtnRow}>
        <button
          style={{ ...s.hubBtn, ...(showMeasurements ? s.hubBtnActive : {}) }}
          onClick={() => setShowMeasurements(v => !v)}
        >📐 Measure</button>
        <button
          style={{ ...s.hubBtn, ...(showGrid ? s.hubBtnActive : {}) }}
          onClick={() => setShowGrid(v => !v)}
        >{showGrid ? '▦ Grid On' : '▢ Grid Off'}</button>
      </div>

      <div style={s.hubDivider} />
      <p style={s.hubSectionLabel}>Panels</p>
      <div style={s.hubBtnRow}>
        <button
          style={{ ...s.hubBtn, ...(panelOpen ? s.hubBtnActive : {}) }}
          onClick={() => { setPanelOpen(p => !p); setStyleOpen(false); setHubOpen(false) }}
        >⚙ Layout</button>
        <button
          style={{ ...s.hubBtn, ...(styleOpen ? s.hubBtnActive : {}) }}
          onClick={() => { setStyleOpen(p => !p); setPanelOpen(false); setHubOpen(false) }}
        >🎨 Style</button>
        <button
          style={{ ...s.hubBtn, ...(roomPanelOpen ? s.hubBtnActive : {}) }}
          onClick={() => { setRoomPanelOpen(v => !v); setHubOpen(false) }}
        >🏠 Room{itemCount > 0 ? ` (${itemCount})` : ''}</button>
      </div>

      <div style={s.hubDivider} />
      <p style={s.hubSectionLabel}>Place</p>
      <div style={s.hubBtnRow}>
        <button
          style={{ ...s.hubBtn, ...(windowPickerOpen || wallPickerTypeKey === 'window' ? s.hubBtnActive : {}) }}
          onClick={() => { setWindowPickerOpen(v => !v); setDoorPickerOpen(false); setHubOpen(false) }}
        >🪟 Window</button>
        <button
          style={{ ...s.hubBtn, ...(doorPickerOpen || wallPickerTypeKey === 'door' ? s.hubBtnActive : {}) }}
          onClick={() => { setDoorPickerOpen(v => !v); setWindowPickerOpen(false); setHubOpen(false) }}
        >🚪 Door</button>
      </div>

      <div style={s.hubDivider} />
      <p style={s.hubSectionLabel}>History</p>
      <div style={s.hubBtnRow}>
        <button
          style={{ ...s.hubBtn, ...(!canUndo ? s.hubBtnDisabled : {}) }}
          onClick={undo} disabled={!canUndo}
        >↩ Undo</button>
        <button
          style={{ ...s.hubBtn, ...(!canRedo ? s.hubBtnDisabled : {}) }}
          onClick={redo} disabled={!canRedo}
        >↪ Redo</button>
      </div>
      <div style={s.hubBtnRow}>
        <button style={s.hubBtn} onClick={saveBookmark}>📌 Bookmark</button>
        {bookmark && (
          <button style={{ ...s.hubBtn, ...s.hubRestoreBtn }} onClick={restoreBookmark}>↺ Restore</button>
        )}
      </div>

      <div style={s.hubDivider} />
      <p style={s.hubSectionLabel}>Cloud</p>
      <div style={s.hubBtnRow}>
        <button style={s.hubBtn} onClick={onCloudSave} title={isSignedIn ? 'Save to cloud' : 'Sign in to save'}>
          ☁ {isSignedIn ? 'Save' : 'Save (sign in)'}
        </button>
        <button style={s.hubBtn} onClick={onCloudLoad} title={isSignedIn ? 'Load from cloud' : 'Sign in to load'}>
          📂 My Rooms
        </button>
      </div>

      <div style={s.hubDivider} />
      <p style={s.hubSectionLabel}>File</p>
      <div style={s.hubBtnRow}>
        <button style={s.hubBtn} onClick={exportRoom}>💾 Export</button>
        <label style={{ ...s.hubBtn, ...s.hubLabel }}>
          📂 Import
          <input ref={importRef} type="file" accept=".json"
            style={{ display: 'none' }} onChange={importRoom} />
        </label>
      </div>
      <div style={s.hubBtnRow}>
        <button style={s.hubBtn} onClick={() => screenshotRef.current?.()}>📷 Screenshot</button>
        <button style={s.hubBtn} onClick={async () => {
          if (!screenshotRef.current) return
          screenshotRef.current()
          await new Promise(r => setTimeout(r, 100))
          const canvas = document.querySelector('canvas')
          if (!canvas) return
          canvas.toBlob(async (blob) => {
            if (!blob) return
            const file = new File([blob], 'my-room.png', { type: 'image/png' })
            if (navigator.share && navigator.canShare?.({ files: [file] })) {
              navigator.share({ files: [file], title: 'My DaydreamDwelling Room', text: 'Check out my room on DaydreamDwelling! ✦' })
            } else {
              // Fallback: download the image so the user can share it manually
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = 'my-daydream-room.png'
              a.click()
              URL.revokeObjectURL(url)
            }
          }, 'image/png')
        }}>🔗 Share</button>
      </div>

    </div>
  )
}
