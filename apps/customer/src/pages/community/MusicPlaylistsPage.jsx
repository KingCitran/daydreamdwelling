import { useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { useMusicPlaylists } from '../../hooks/useMusicPlaylists'
import { useMusicPlayer } from '../../contexts/MusicPlayerContext'

// Manage your music playlists. Closes M4 of humming-velvet-tide together
// with the "+ playlist" affordance in MusicCatalogPage and the
// useMusicPlaylists hook.

export default function MusicPlaylistsPage({ onNavigate, onSignIn }) {
  const t = useTheme()
  const { user } = useAuth()
  const { playlists, loading, error, create, rename, remove, togglePublic, removeTrack } = useMusicPlaylists()
  const { setCustomQueue, playTrackAtIndex } = useMusicPlayer()
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  if (!user) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ color: t.textSoft, marginBottom: 16 }}>Sign in to keep your own music playlists.</p>
        <button onClick={onSignIn} style={{
          padding: '10px 22px', background: t.accent, color: t.accentText,
          border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>Sign in</button>
      </div>
    )
  }

  async function onCreate(e) {
    e.preventDefault()
    setCreating(true); setCreateErr('')
    const { error: err } = await create(newName)
    setCreating(false)
    if (err) setCreateErr(err)
    else setNewName('')
  }

  async function onRename(playlistId) {
    const { error: err } = await rename(playlistId, editName)
    if (!err) { setEditingId(null); setEditName('') }
  }

  async function onDelete(playlistId, name) {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return
    await remove(playlistId)
    if (expandedId === playlistId) setExpandedId(null)
  }

  function playPlaylist(pl, startIdx = 0) {
    const tracks = (pl.music_playlist_tracks ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order || a.added_at.localeCompare(b.added_at))
      .map(pt => pt.artist_tracks)
      .filter(Boolean)
    if (!tracks.length) return
    setCustomQueue(tracks, pl.name || 'Playlist', startIdx)
    playTrackAtIndex(startIdx)
  }

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: t.text, margin: '0 0 6px' }}>Your playlists</h1>
        <p style={{ fontSize: 13, color: t.textSoft, margin: 0 }}>
          Curate sets of approved tracks. Mark public to share a link with friends.
        </p>
      </header>

      <button onClick={() => onNavigate('/community/music')} style={{
        marginBottom: 18, background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
        color: t.text, padding: '7px 14px', borderRadius: 8,
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}>← Browse catalog</button>

      <form onSubmit={onCreate} style={{
        display: 'flex', gap: 10, marginBottom: 24,
        padding: 14, background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12,
      }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New playlist name"
          maxLength={100}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 8,
            background: t.bg, border: `1px solid ${t.surfaceBorder}`,
            color: t.text, fontSize: 13, fontFamily: 'inherit',
          }}
        />
        <button type="submit" disabled={creating || !newName.trim()} style={{
          padding: '10px 18px', borderRadius: 8, border: 'none',
          background: t.accent, color: t.accentText,
          fontSize: 13, fontWeight: 700, cursor: creating ? 'wait' : 'pointer',
          opacity: !newName.trim() ? 0.5 : 1,
        }}>{creating ? 'Creating…' : 'Create'}</button>
      </form>
      {createErr && <div style={{ color: '#ff8a8a', fontSize: 12, marginBottom: 14 }}>{createErr}</div>}

      {loading && <div style={{ color: t.textSoft, fontSize: 13, padding: 24, textAlign: 'center' }}>Loading…</div>}
      {error && <div style={{ color: '#ff8a8a', fontSize: 13, padding: 12, background: '#ff8a8a15', borderRadius: 10 }}>Couldn't load: {error}</div>}

      {!loading && playlists.length === 0 && !error && (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          background: t.surface, border: `1px dashed ${t.surfaceBorder}`, borderRadius: 14,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>♪</div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: '0 0 6px' }}>No playlists yet</h2>
          <p style={{ fontSize: 13, color: t.textSoft, margin: 0 }}>Make one above, then add tracks from the catalog.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {playlists.map(pl => {
          const trackCount = pl.music_playlist_tracks?.length ?? 0
          const isOpen = expandedId === pl.id
          const tracks = (pl.music_playlist_tracks ?? [])
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order || a.added_at.localeCompare(b.added_at))
          return (
            <div key={pl.id} style={{
              background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12,
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                <button onClick={() => setExpandedId(isOpen ? null : pl.id)} style={{
                  background: 'transparent', border: 'none', color: t.textSoft,
                  fontSize: 14, cursor: 'pointer', padding: 4,
                }}>{isOpen ? '▾' : '▸'}</button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === pl.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => onRename(pl.id)}
                      onKeyDown={e => { if (e.key === 'Enter') onRename(pl.id); if (e.key === 'Escape') { setEditingId(null); setEditName('') } }}
                      style={{
                        width: '100%', padding: '6px 8px', borderRadius: 6,
                        background: t.bg, border: `1px solid ${t.surfaceBorder}`,
                        color: t.text, fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{pl.name}</div>
                      {pl.is_public && (
                        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: `${t.accent}20`, color: t.accent, fontWeight: 700, letterSpacing: '0.3px' }}>PUBLIC</span>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: t.textSoft, marginTop: 2 }}>
                    {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
                  </div>
                </div>

                <button onClick={() => playPlaylist(pl)} disabled={trackCount === 0} title="Play all" style={{
                  padding: '7px 12px', borderRadius: 8,
                  background: trackCount === 0 ? 'transparent' : t.accent,
                  color: trackCount === 0 ? t.textSoft : t.accentText,
                  border: trackCount === 0 ? `1px solid ${t.surfaceBorder}` : 'none',
                  fontSize: 11, fontWeight: 700,
                  cursor: trackCount === 0 ? 'not-allowed' : 'pointer',
                  opacity: trackCount === 0 ? 0.5 : 1,
                }}>▶ Play</button>

                <button onClick={() => togglePublic(pl.id, !pl.is_public)} title={pl.is_public ? 'Make private' : 'Make public'} style={{
                  padding: '7px 10px', borderRadius: 8,
                  background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
                  color: t.text, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>{pl.is_public ? '🔓' : '🔒'}</button>

                <button onClick={() => { setEditingId(pl.id); setEditName(pl.name) }} title="Rename" style={{
                  padding: '7px 10px', borderRadius: 8,
                  background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
                  color: t.text, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>✎</button>

                <button onClick={() => onDelete(pl.id, pl.name)} title="Delete playlist" style={{
                  padding: '7px 10px', borderRadius: 8,
                  background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
                  color: '#ff8a8a', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>🗑</button>
              </div>

              {isOpen && (
                <div style={{ borderTop: `1px solid ${t.surfaceBorder}`, padding: '6px 0' }}>
                  {tracks.length === 0 ? (
                    <div style={{ padding: '16px 14px', fontSize: 12, color: t.textSoft, fontStyle: 'italic' }}>
                      Empty. Add tracks from the catalog.
                    </div>
                  ) : tracks.map((pt, idx) => {
                    const tr = pt.artist_tracks
                    if (!tr) return null
                    return (
                      <div key={pt.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 14px',
                      }}>
                        <button onClick={() => playPlaylist(pl, idx)} style={{
                          width: 28, height: 28, borderRadius: 14,
                          background: `${t.accent}25`, color: t.accent, border: 'none',
                          fontSize: 11, cursor: 'pointer', flexShrink: 0,
                        }}>▶</button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.title}</div>
                          <div style={{ fontSize: 10, color: t.textSoft }}>{tr.artist_profiles?.artist_name ?? '—'}</div>
                        </div>
                        <button onClick={() => removeTrack(pl.id, tr.id)} title="Remove from playlist" style={{
                          background: 'transparent', border: 'none', color: t.textSoft,
                          cursor: 'pointer', fontSize: 12, padding: 4,
                        }}>✕</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
