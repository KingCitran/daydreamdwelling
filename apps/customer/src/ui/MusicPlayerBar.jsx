import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import useMusicPlayer from '../hooks/useMusicPlayer'
import TrackTags from './TrackTags'

const DEST_LABELS = {
  spotify:     { label: 'Spotify',     icon: '♫' },
  apple_music: { label: 'Apple Music', icon: '◍' },
  bandcamp:    { label: 'Bandcamp',    icon: '◐' },
  website:     { label: 'Website',     icon: '◎' },
}

export default function MusicPlayerBar({ mood, station }) {
  const t = useTheme()
  const { user } = useAuth()
  const player = useMusicPlayer({ mood, station, enabled: true })
  const { currentTrack, isPlaying, muted, setMuted, toggle, next, audioElement, hasTracks } = player

  if (!hasTracks) return audioElement()

  const artist = currentTrack?.artist_profiles
  const links  = (artist?.external_links ?? {})

  async function onClickDestination(destinationKey) {
    if (!currentTrack) return
    try {
      const { data, error } = await supabase.functions.invoke('artist-ppc-click', {
        body: { trackId: currentTrack.id, destinationKey, userId: user?.id ?? null },
      })
      if (error) throw error
      if (data?.url) window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      // Fall back to direct link if edge function is unreachable — listener still gets through
      const fallback = links[destinationKey]
      if (fallback) window.open(fallback, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      {audioElement()}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(15,12,30,0.92)', backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${t.surfaceBorder}`, zIndex: 90,
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        {/* Track info */}
        <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggle} style={{
            width: 38, height: 38, borderRadius: '50%', border: 'none',
            background: t.accent, color: t.accentText, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
          }} title={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? '❚❚' : '▶'}</button>

          <button onClick={() => next('manual')} style={{
            background: 'none', border: 'none', color: t.textSoft, cursor: 'pointer',
            fontSize: 16, padding: 0, flexShrink: 0,
          }} title="Skip">⤼</button>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f0eaff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentTrack?.title}
            </div>
            <div style={{ fontSize: 11, color: '#a090c8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
              {artist?.artist_name ?? 'Artist'}
            </div>
            {currentTrack && (
              <TrackTags trackId={currentTrack.id} descriptiveTags={currentTrack.descriptive_tags ?? []} compact />
            )}
          </div>
        </div>

        {/* PPC destination buttons */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {Object.entries(links).map(([key, url]) => {
            if (!url) return null
            const meta = DEST_LABELS[key] ?? { label: key, icon: '↗' }
            return (
              <button key={key} onClick={() => onClickDestination(key)} style={{
                padding: '6px 12px', borderRadius: 16, border: `1px solid ${t.accent}40`,
                background: 'transparent', color: '#e0d9ff', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
              }} title={`Find on ${meta.label}`}>
                <span style={{ fontSize: 12 }}>{meta.icon}</span>
                {meta.label}
              </button>
            )
          })}
        </div>

        {/* Mute */}
        <button onClick={() => setMuted(m => !m)} style={{
          background: 'none', border: 'none', color: t.textSoft, cursor: 'pointer',
          fontSize: 14, padding: '6px 8px', flexShrink: 0,
        }} title={muted ? 'Unmute' : 'Mute'}>{muted ? '🔇' : '🔊'}</button>
      </div>
    </>
  )
}
