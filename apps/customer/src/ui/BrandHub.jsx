import { useEffect, useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import Logo from '@shared/Logo'

// ── Brand Hub ──────────────────────────────────────────────────────
// Overlay that opens when the user clicks the DaydreamDwelling logo
// in the builder top bar. Shows quick stats about the platform +
// navigation links to key pages. "Home base" feeling.

const LINKS = [
  { label: 'Landing Page',     href: '/?landing=1',  emoji: '🏠' },
  { label: 'About',            href: '/?about=1',    emoji: '☁' },
  { label: 'Community',        href: '/community',   emoji: '🎨' },
  { label: 'Music Catalog',    href: '/community/music', emoji: '🎵' },
  { label: 'Contests',         href: '/community/contests', emoji: '🏆' },
  { label: 'Sell on Daydream', href: 'https://daydreamsellers.com', emoji: '🛍️', external: true },
  { label: 'Daydream Blossoms', href: 'https://daydreamblossoms.com', emoji: '🌿', external: true },
]

export default function BrandHub({ onClose }) {
  const t = useTheme()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function load() {
      const [waitlist, rooms, tracks, community] = await Promise.all([
        supabase.from('waitlist').select('id', { count: 'exact', head: true }),
        supabase.from('saved_rooms').select('id', { count: 'exact', head: true }),
        supabase.from('artist_tracks').select('id', { count: 'exact', head: true }).eq('approval_status', 'approved'),
        supabase.from('community_posts').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        waitlist: waitlist.count ?? 0,
        rooms: rooms.count ?? 0,
        tracks: tracks.count ?? 0,
        community: community.count ?? 0,
      })
    }
    load()
  }, [])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: 80,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 380, maxWidth: '92vw',
        background: t.panelBg ?? t.navBg,
        border: `1px solid ${t.panelBorder ?? t.surfaceBorder}`,
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        fontFamily: "'Outfit', system-ui, sans-serif",
        color: t.panelText ?? t.text,
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 16px', textAlign: 'center',
          borderBottom: `1px solid ${t.panelBorder ?? t.surfaceBorder}`,
        }}>
          <Logo size={40} color={t.accent} />
          <h2 style={{
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: 24, fontWeight: 400, margin: '8px 0 4px',
          }}>
            Daydream<span style={{ color: t.accent, fontStyle: 'italic' }}>Dwelling</span>
          </h2>
          <p style={{ margin: 0, fontSize: 11, color: t.panelTextSoft ?? t.textSoft }}>
            Design your space. Find your style.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
            background: t.panelBorder ?? t.surfaceBorder,
          }}>
            {[
              { n: stats.waitlist, label: 'Waitlist' },
              { n: stats.rooms, label: 'Rooms' },
              { n: stats.tracks, label: 'Tracks' },
              { n: stats.community, label: 'Shared' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '14px 8px', textAlign: 'center',
                background: t.panelBg ?? t.navBg,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: t.accent }}>{s.n}</div>
                <div style={{ fontSize: 9, color: t.panelTextSoft ?? t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        <div style={{ padding: '12px 12px 16px' }}>
          {LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                textDecoration: 'none',
                color: t.panelText ?? t.text,
                fontSize: 13, fontWeight: 500,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${t.accent}12`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{link.emoji}</span>
              <span style={{ flex: 1 }}>{link.label}</span>
              {link.external && <span style={{ fontSize: 10, color: t.panelTextSoft ?? t.textSoft }}>↗</span>}
            </a>
          ))}
        </div>

        {/* Signed in as */}
        {user && (
          <div style={{
            padding: '10px 24px 14px',
            borderTop: `1px solid ${t.panelBorder ?? t.surfaceBorder}`,
            fontSize: 11, color: t.panelTextSoft ?? t.textSoft,
            textAlign: 'center',
          }}>
            Signed in as {user.email}
          </div>
        )}
      </div>
    </div>
  )
}
