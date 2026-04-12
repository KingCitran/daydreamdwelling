import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import RaindropIcon from '@shared/RaindropIcon'

const STATUS_COLORS = { upcoming: '#70a0ff', active: '#70c090', voting: '#f0c060', judging: '#ff7aa0', complete: '#9a7aee' }
const TYPE_LABELS   = { theme: 'Theme', placement: 'Product Placement', brief: 'Client Brief' }
const TYPE_ICONS    = { theme: '🎨', placement: '◈', brief: '📋' }

export default function ContestsPage({ onClose }) {
  const t = useTheme()
  const [contests, setContests] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase.from('contests')
      .select('*, contest_entries(id, user_id, vote_count, is_winner, award, profiles(display_name)), sponsor:sponsor_id(display_name)')
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
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: t.text }}>Contests & Challenges</h1>
        <button onClick={onClose} style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft, cursor: 'pointer', fontSize: 13 }}>✕ Close</button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px' }}>
        {loading && <p style={{ color: t.textSoft, textAlign: 'center' }}>Loading...</p>}
        {!loading && contests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, opacity: 0.3, marginBottom: 16 }}>✦</div>
            <p style={{ fontSize: 15, color: t.text, fontWeight: 600 }}>No contests yet</p>
            <p style={{ fontSize: 13, color: t.textSoft }}>Design challenges are coming soon! Stay tuned.</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {contests.map(c => {
            const type = c.contest_type || 'theme'
            const entries = c.contest_entries ?? []
            const winners = entries.filter(e => e.is_winner)

            return (
              <div key={c.id} className="ddd-card" style={{
                background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14,
                padding: '20px 22px', borderLeft: `4px solid ${STATUS_COLORS[c.status] ?? t.textSoft}`,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14 }}>{TYPE_ICONS[type]}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        {TYPE_LABELS[type]}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.text }}>{c.title}</h3>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                    color: STATUS_COLORS[c.status], padding: '4px 10px',
                    background: `${STATUS_COLORS[c.status]}15`, borderRadius: 12,
                    flexShrink: 0,
                  }}>{c.status}</span>
                </div>

                <p style={{ margin: '0 0 12px', fontSize: 13, color: t.textSoft, lineHeight: 1.6 }}>{c.description}</p>

                {/* Contest details */}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: t.textSoft, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span>Theme: <strong style={{ color: t.text }}>{c.theme}</strong></span>
                  <span>{fmt(c.starts_at)} — {fmt(c.ends_at)}</span>
                  <span>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
                </div>

                {/* Sponsor badge */}
                {c.sponsor?.display_name && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', background: `${t.accent}10`, border: `1px solid ${t.accent}25`,
                    borderRadius: 8, fontSize: 11, color: t.accent, fontWeight: 600, marginBottom: 10,
                  }}>
                    ✦ Sponsored by {c.sponsor.display_name}
                  </div>
                )}

                {/* Budget constraint for briefs */}
                {type === 'brief' && c.budget_limit && (
                  <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 10 }}>
                    Budget: <strong style={{ color: t.text }}>${c.budget_limit.toLocaleString()}</strong>
                    {(c.required_categories ?? []).length > 0 && (
                      <> — Must include: {c.required_categories.join(', ')}</>
                    )}
                  </div>
                )}

                {/* Required items for placement */}
                {type === 'placement' && (c.required_items ?? []).length > 0 && (
                  <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 10 }}>
                    Required items: <strong style={{ color: t.text }}>{c.required_items.length} products must be placed</strong>
                  </div>
                )}

                {/* Prize */}
                {c.prize_description && (
                  <div style={{ fontSize: 12, color: t.accent, fontWeight: 600, marginBottom: 10 }}>
                    ✦ Prize: {c.prize_description}
                    {c.prize_credit > 0 && ` ($${c.prize_credit} store credit)`}
                  </div>
                )}

                {/* Winners */}
                {winners.map(w => (
                  <div key={w.id} style={{
                    marginTop: 4, padding: '8px 12px',
                    background: `${t.accent}10`, borderRadius: 8,
                    fontSize: 12, color: t.accent, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <RaindropIcon size={14} filled color={t.accent} />
                    {w.award}: {w.profiles?.display_name ?? 'Unknown'} ({w.vote_count} <RaindropIcon size={11} filled color={t.accent} />)
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
