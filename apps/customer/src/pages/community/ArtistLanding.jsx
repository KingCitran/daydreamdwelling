import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

export default function ArtistLanding({ onNavigate, onSignIn }) {
  const t = useTheme()
  const { user } = useAuth()
  const [hasArtistProfile, setHasArtistProfile] = useState(false)
  const [topTracks, setTopTracks] = useState([])

  useEffect(() => {
    if (!user) return
    supabase
      .from('artist_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setHasArtistProfile(!!data))
  }, [user])

  useEffect(() => {
    supabase
      .from('artist_tracks')
      .select('id, title, artist_id, station_tags, mood_tags, play_count, artist_profiles(artist_name, avatar_url)')
      .eq('approval_status', 'approved')
      .eq('rotation_status', 'active')
      .order('play_count', { ascending: false })
      .limit(6)
      .then(({ data }) => setTopTracks(data ?? []))
  }, [])

  const primaryCta = hasArtistProfile ? 'Open dashboard →' : user ? 'Claim your artist profile →' : 'Sign in to join'
  const onPrimary = () => {
    if (!user) return onSignIn?.()
    onNavigate(hasArtistProfile ? '/community/artists/dashboard' : '/community/artists/submit')
  }

  return (
    <div style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Hero */}
      <section style={{
        textAlign: 'center', padding: '48px 24px 56px',
        background: `linear-gradient(180deg, ${t.accent}10 0%, transparent 100%)`,
        borderRadius: 24, marginBottom: 40,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 12 }}>
          Artist Program
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: t.text, margin: '0 0 14px', lineHeight: 1.15 }}>
          Get your music heard in real rooms
        </h1>
        <p style={{ fontSize: 16, color: t.textSoft, maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.55 }}>
          Submit free. Play in mood-matched rooms across the platform. Keep your analytics. Pay only for the
          extras that move the needle.
        </p>
        <button onClick={onPrimary} style={{
          padding: '14px 28px', borderRadius: 12, border: 'none',
          background: t.accent, color: t.accentText, fontSize: 14, fontWeight: 700,
          cursor: 'pointer', boxShadow: `0 6px 20px ${t.accent}30`,
        }}>{primaryCta}</button>

        <div style={{ marginTop: 14 }}>
          <button onClick={() => onNavigate('/community/artists/dashboard')} style={{
            background: 'none', border: 'none', color: t.text, opacity: 0.7,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            textDecoration: 'underline', textUnderlineOffset: 3,
          }}>Preview the artist dashboard →</button>
        </div>
      </section>

      {/* Value props */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: t.text, marginBottom: 20, textAlign: 'center' }}>
          Why join?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {VALUE_PROPS.map(v => (
            <div key={v.title} style={{
              background: t.surface, border: `1px solid ${t.surfaceBorder}`,
              borderRadius: 16, padding: '20px 22px',
            }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{v.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 6 }}>{v.title}</div>
              <div style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.55 }}>{v.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: t.text, marginBottom: 20, textAlign: 'center' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {STEPS.map((s, i) => (
            <div key={s.title} style={{
              background: t.surface, border: `1px solid ${t.surfaceBorder}`,
              borderRadius: 16, padding: '22px 24px',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `${t.accent}20`, color: t.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, marginBottom: 12,
              }}>{i + 1}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.55 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Top tracks */}
      {topTracks.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: t.text, marginBottom: 20, textAlign: 'center' }}>
            Top tracks right now
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {topTracks.map(track => (
              <div key={track.id} style={{
                background: t.surface, border: `1px solid ${t.surfaceBorder}`,
                borderRadius: 14, padding: '14px 16px',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>{track.title}</div>
                <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 8 }}>
                  {track.artist_profiles?.artist_name ?? 'Artist'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(track.station_tags ?? []).slice(0, 3).map(tag => (
                    <span key={tag} style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                      background: `${t.accent}15`, color: t.accent,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section style={{
        textAlign: 'center', padding: '32px 24px',
        background: `${t.accent}08`, border: `1px solid ${t.accent}25`,
        borderRadius: 20,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: '0 0 8px' }}>
          Ready to get heard?
        </h2>
        <p style={{ fontSize: 13, color: t.textSoft, margin: '0 0 20px' }}>
          Free to submit. No subscription. Your data stays yours.
        </p>
        <button onClick={onPrimary} style={{
          padding: '12px 26px', borderRadius: 10, border: 'none',
          background: t.accent, color: t.accentText, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>{primaryCta}</button>
      </section>
    </div>
  )
}

const VALUE_PROPS = [
  { icon: '🎧', title: 'Free station play',  body: 'Approved tracks rotate through mood-matched stations across the platform — designers and shoppers hear you in their rooms.' },
  { icon: '🔗', title: 'Click-throughs you control', body: 'Listeners can jump to your Spotify, Apple Music, Bandcamp, or your own site. Pre-pay $0.10–$0.25 per click to fund the connection.' },
  { icon: '📊', title: 'Free analytics',     body: 'See your plays, skip rate, station performance, and click-through volume — all without a subscription.' },
  { icon: '🔒', title: 'Your data stays yours', body: 'No exclusive rights. No music ownership claims. Cancel anytime. Take your tracks elsewhere whenever you want.' },
]

const STEPS = [
  { title: 'Submit your track',  body: 'Upload a 30s–8min audio file (mp3, wav, aac, m4a) and add station tags. Auto-screened, then a real human approves it within 48 hours.' },
  { title: 'Tracks play in rooms', body: 'Approved tracks join the rotation for matching moods (Cozy, Bright, Evening, Focus, Nature, Romance, Party). Skip rate gates rotation tier.' },
  { title: 'Opt into monetization', body: 'Add click-through links and pre-pay your PPC balance. Premium analytics, sponsored placements, and designer commissions unlock as you grow.' },
]
