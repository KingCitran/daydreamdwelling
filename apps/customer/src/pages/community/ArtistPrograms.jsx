import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const PACKS = [
  { pack: 10,  cents: 1000,  label: '$10', clicksAt15: 67  },
  { pack: 25,  cents: 2500,  label: '$25', clicksAt15: 167, popular: true },
  { pack: 50,  cents: 5000,  label: '$50', clicksAt15: 333 },
  { pack: 100, cents: 10000, label: '$100',clicksAt15: 667 },
]

export default function ArtistPrograms({ onNavigate }) {
  const { user } = useAuth()
  const t = useTheme()
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [topupBusy, setTopupBusy] = useState(null)
  const [topupErr, setTopupErr] = useState('')

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('artist_profiles').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { setArtist(data); setLoading(false) })
  }, [user])

  async function buyTopup(pack) {
    if (!artist) return
    setTopupBusy(pack)
    setTopupErr('')
    try {
      const { data, error } = await supabase.functions.invoke('artist-ppc-topup', {
        body: { pack, artistId: artist.user_id },
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
      else throw new Error('No checkout URL returned')
    } catch (err) {
      setTopupErr(err.message ?? 'Top-up failed')
      setTopupBusy(null)
    }
  }

  const s = makeStyles(t)

  if (!user) return <div style={{ padding: 48, textAlign: 'center', color: t.textSoft }}>Sign in to view programs.</div>
  if (loading) return <div style={{ padding: 48, color: t.textSoft }}>Loading…</div>

  if (!artist) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h1 style={s.pageTitle}>Claim your artist profile first</h1>
        <p style={{ ...s.subtitle, marginBottom: 20 }}>Submit a track to claim a profile, then you can opt into programs.</p>
        <button onClick={() => onNavigate('/community/artists/submit')} style={{
          padding: '12px 24px', background: t.accent, color: t.accentText,
          border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>+ Submit your first track</button>
      </div>
    )
  }

  const balanceDollars = ((artist.ppc_balance_cents ?? 0) / 100).toFixed(2)
  const ppcRate = artist.ppc_rate_cents ?? 15

  return (
    <div style={{ padding: '32px 0' }}>
      <h1 style={s.pageTitle}>Programs</h1>
      <p style={s.subtitle}>Free baseline forever. Opt into the parts that move the needle.</p>

      {/* PPC TOP-UP — the only Phase 1 paid program */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={s.sectionTitle}>PPC Click-Through Top-up</h2>
            <p style={s.sectionDesc}>Each click on a "find on Spotify / Apple / Bandcamp" link costs ${(ppcRate / 100).toFixed(2)}. Top up your balance to keep funding clicks.</p>
          </div>
          <div style={s.balancePill}>
            Balance: <strong style={{ color: t.accent, fontSize: 16, marginLeft: 6 }}>${balanceDollars}</strong>
          </div>
        </div>

        <div style={s.packGrid}>
          {PACKS.map(p => (
            <button key={p.pack} onClick={() => buyTopup(p.pack)} disabled={topupBusy !== null} style={{
              ...s.packCard,
              border: p.popular ? `2px solid ${t.accent}` : `1px solid ${t.surfaceBorder}`,
              cursor: topupBusy !== null ? 'wait' : 'pointer',
              opacity: topupBusy !== null && topupBusy !== p.pack ? 0.5 : 1,
            }}>
              {p.popular && <div style={{ fontSize: 9, fontWeight: 800, color: t.accent, letterSpacing: '1px', marginBottom: 6 }}>POPULAR</div>}
              <div style={{ fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: t.textSoft }}>~{p.clicksAt15} clicks at ${(ppcRate / 100).toFixed(2)} each</div>
              {topupBusy === p.pack && <div style={{ marginTop: 8, fontSize: 11, color: t.accent }}>Opening checkout…</div>}
            </button>
          ))}
        </div>

        {topupErr && <div style={{ marginTop: 12, fontSize: 12, color: '#ff8a8a' }}>{topupErr}</div>}
      </section>

      {/* Phase 2/3 programs — show as coming soon to set expectations */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Coming soon</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {COMING_SOON.map(prog => (
            <div key={prog.title} style={{
              background: t.surface, border: `1px dashed ${t.surfaceBorder}`,
              borderRadius: 16, padding: '20px 22px',
            }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{prog.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{prog.title}</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: `${t.accent}15`, color: t.accent, letterSpacing: '0.5px' }}>SOON</span>
              </div>
              <div style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.55 }}>{prog.body}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button onClick={() => onNavigate('/community/artists/dashboard')} style={{ background: 'none', border: 'none', color: t.accent, fontSize: 13, cursor: 'pointer' }}>← Back to dashboard</button>
      </div>
    </div>
  )
}

const COMING_SOON = [
  { icon: '⭐', title: 'Sponsored Station Placement', body: 'Pay to put your track at the top of a station\'s rotation for N days. Great for new releases.' },
  { icon: '📊', title: 'Premium Analytics',           body: 'Demographics, geography, mood-room breakdown, peak listening times. Monthly subscription.' },
  { icon: '🎼', title: 'Designer Commissions',        body: 'Top room designers can commission custom tracks for their featured rooms. Platform takes a small cut.' },
]

function makeStyles(t) {
  return {
    pageTitle:    { fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 6 },
    subtitle:     { fontSize: 13, color: t.textSoft, marginBottom: 28 },
    section:      { marginBottom: 36 },
    sectionHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12, flexWrap: 'wrap' },
    sectionTitle: { fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 4 },
    sectionDesc:  { fontSize: 13, color: t.textSoft, margin: 0, maxWidth: 520 },
    balancePill:  { padding: '8px 14px', borderRadius: 20, background: `${t.accent}10`, fontSize: 12, fontWeight: 600, color: t.text },
    packGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 },
    packCard:     { padding: '20px 18px', borderRadius: 14, background: t.surface, textAlign: 'left', fontFamily: 'inherit', transition: 'transform 0.15s' },
  }
}
