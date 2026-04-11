import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

const STATUS_COLORS = { upcoming: '#70a0ff', active: '#70c090', voting: '#f0c060', judging: '#ff7aa0', complete: '#9a7aee' }

export default function ContestsPage({ onClose }) {
  const t = useTheme()
  const { user } = useAuth()
  const [contests, setContests] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase.from('contests')
      .select('*, contest_entries(id, user_id, vote_count, is_winner, award, profiles(display_name))')
      .order('starts_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { setContests(data ?? []); setLoading(false) })
  }, [])

  function fmt(iso) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 250, background: t.bg, overflowY: 'auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '14px 24px', borderBottom: `1px solid ${t.surfaceBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: t.bg, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: t.text }}>Theme Contests</h1>
        <button onClick={onClose} style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft, cursor: 'pointer', fontSize: 13 }}>✕ Close</button>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px' }}>
        {loading && <p style={{ color: t.textSoft, textAlign: 'center' }}>Loading…</p>}
        {!loading && contests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>🏆</p>
            <p style={{ fontSize: 15, color: t.text, fontWeight: 600 }}>No contests yet</p>
            <p style={{ fontSize: 13, color: t.textSoft }}>Theme contests are coming soon! Stay tuned.</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {contests.map(c => (
            <div key={c.id} style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: '18px 20px', borderLeft: `4px solid ${STATUS_COLORS[c.status] ?? t.textSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: t.text }}>{c.title}</h3>
                <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[c.status], textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.status}</span>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: t.textSoft, lineHeight: 1.5 }}>{c.description}</p>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: t.textSoft }}>
                <span>Theme: <strong style={{ color: t.text }}>{c.theme}</strong></span>
                <span>{fmt(c.starts_at)} — {fmt(c.ends_at)}</span>
                <span>{(c.contest_entries ?? []).length} entries</span>
              </div>
              {/* Winners */}
              {(c.contest_entries ?? []).filter(e => e.is_winner).map(w => (
                <div key={w.id} style={{ marginTop: 8, padding: '6px 10px', background: `${t.accent}15`, borderRadius: 8, fontSize: 12, color: t.accent, fontWeight: 600 }}>
                  🏆 {w.award}: {w.profiles?.display_name ?? 'Unknown'} ({w.vote_count} votes)
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
