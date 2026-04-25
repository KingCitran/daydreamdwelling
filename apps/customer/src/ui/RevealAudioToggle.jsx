import { useRevealAudioPrefs } from '../hooks/useRevealAudioPrefs'

const SOUND_LABELS = { all: 'All sounds', rain: 'Rain only', none: 'Silent' }
const SOUND_ICONS  = { all: '🔊', rain: '🌧️', none: '🔇' }

// Compact version for corner overlay on reveal page
export function RevealAudioToggleCorner() {
  const { soundMode, audioOutput, cycleSoundMode, toggleOutput } = useRevealAudioPrefs()
  const isDesktop = audioOutput === 'desktop'

  return (
    <div style={{
      position: 'absolute', top: 16, right: 110, zIndex: 20,
      display: 'flex', gap: 8, alignItems: 'center',
      padding: '6px 10px', borderRadius: 12,
      background: 'rgba(20,20,50,0.7)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(120,120,180,0.25)',
    }}>
      <button onClick={cycleSoundMode} title={SOUND_LABELS[soundMode]} style={{
        padding: '4px 10px', borderRadius: 8,
        background: 'rgba(40,40,80,0.5)', border: '1px solid rgba(120,120,180,0.2)',
        color: '#c0c0e0', fontSize: 14, cursor: 'pointer', minWidth: 36,
      }}>{SOUND_ICONS[soundMode]}</button>
      <LightswitchToggle on={isDesktop} onClick={toggleOutput}
        offLabel="🎧" onLabel="🔈" title={isDesktop ? 'Desktop volume' : 'Headphones volume'} />
    </div>
  )
}

// Full settings row for AccountModal or other settings panels
export function RevealAudioSettings({ t }) {
  const { soundMode, audioOutput, cycleSoundMode, toggleOutput } = useRevealAudioPrefs()
  const isDesktop = audioOutput === 'desktop'

  const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${t?.surfaceBorder || 'rgba(255,255,255,0.08)'}` }
  const labelStyle = { fontSize: 13, color: t?.text || '#ddddf0', fontWeight: 500 }
  const descStyle = { fontSize: 11, color: t?.textSoft || '#8080a0', marginTop: 2 }

  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: t?.textSoft || '#8080a0', textTransform: 'uppercase', letterSpacing: '1px' }}>Contest Reveal Audio</h3>

      <div style={rowStyle}>
        <div>
          <div style={labelStyle}>Sound mode</div>
          <div style={descStyle}>{SOUND_LABELS[soundMode]} — thunder, rain, and lightning cracks</div>
        </div>
        <button onClick={cycleSoundMode} style={{
          padding: '6px 14px', borderRadius: 8,
          background: t?.accent || '#9828f0', color: t?.accentText || '#fff',
          border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>{SOUND_ICONS[soundMode]} {SOUND_LABELS[soundMode]}</button>
      </div>

      <div style={rowStyle}>
        <div>
          <div style={labelStyle}>Audio output</div>
          <div style={descStyle}>{isDesktop ? 'Desktop — louder for speakers' : 'Headphones — comfortable for close listening'}</div>
        </div>
        <LightswitchToggle on={isDesktop} onClick={toggleOutput} offLabel="🎧" onLabel="🔈" large />
      </div>
    </div>
  )
}

function LightswitchToggle({ on, onClick, offLabel, onLabel, title, large = false }) {
  const w = large ? 60 : 48
  const h = large ? 28 : 22
  const knob = h - 4
  return (
    <button onClick={onClick} title={title} style={{
      position: 'relative', width: w, height: h, borderRadius: h / 2,
      background: on ? 'rgba(120,80,200,0.4)' : 'rgba(60,60,90,0.5)',
      border: `1px solid ${on ? 'rgba(158,120,240,0.5)' : 'rgba(120,120,180,0.25)'}`,
      cursor: 'pointer', transition: 'all 0.2s ease',
      display: 'flex', alignItems: 'center', padding: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2,
        left: on ? w - knob - 2 : 2,
        width: knob, height: knob, borderRadius: '50%',
        background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: large ? 14 : 11, transition: 'left 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}>{on ? onLabel : offLabel}</div>
    </button>
  )
}
