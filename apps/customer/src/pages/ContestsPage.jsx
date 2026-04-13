import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import RaindropIcon from '@shared/RaindropIcon'
import ContestReveal from './ContestReveal'

const STATUS_COLORS = { upcoming: '#70a0ff', active: '#70c090', voting: '#f0c060', judging: '#ff7aa0', complete: '#9a7aee' }
const TYPE_LABELS   = { theme: 'Theme', placement: 'Product Placement', brief: 'Client Brief' }
const TYPE_ICONS    = { theme: '🎨', placement: '◈', brief: '📋' }
const DESIGNER_TIERS = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']
const TIER_COLORS    = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']

export default function ContestsPage({ onClose, roomItems = [], catalogue = {} }) {
  const t = useTheme()
  const { user } = useAuth()
  const [contests, setContests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [myEntries, setMyEntries] = useState(new Set())
  const [myVotes, setMyVotes]     = useState({})
  const [joining, setJoining]     = useState(null)
  const [entryForm, setEntryForm] = useState({ title: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState(null)
  const [expanded, setExpanded]   = useState(null)
  const [revealContest, setRevealContest] = useState(null)

  useEffect(() => { fetchContests() }, [])

  async function fetchContests() {
    setLoading(true)
    const { data } = await supabase
      .from('contests')
      .select('*, contest_entries(id, user_id, vote_count, is_winner, award, post_id, profiles(display_name, avatar_url, designer_tier), community_posts(screenshot_url, title)), sponsor:sponsor_id(display_name)')
      .order('starts_at', { ascending: false })
      .limit(20)
    setContests(data ?? [])
    setLoading(false)

    if (user && data) {
      const entered = new Set()
      data.forEach(c => (c.contest_entries ?? []).forEach(e => {
        if (e.user_id === user.id) entered.add(c.id)
      }))
      setMyEntries(entered)

      const allIds = data.flatMap(c => (c.contest_entries ?? []).map(e => e.id))
      if (allIds.length > 0) {
        const { data: votes } = await supabase
          .from('contest_votes').select('entry_id')
          .eq('user_id', user.id).in('entry_id', allIds)
        const m = {}
        ;(votes ?? []).forEach(v => { m[v.entry_id] = true })
        setMyVotes(m)
      }
    }
  }

  function validateEntry(c) {
    const type = c.contest_type || 'theme'
    const keys = new Set(roomItems.map(i => i.typeKey))
    if (type === 'placement') {
      const req = c.required_items ?? []
      const missing = req.filter(id => !keys.has(id))
      if (missing.length) return `Place all ${req.length} required products first (${missing.length} missing)`
    }
    if (type === 'brief' && c.budget_limit) {
      const total = roomItems.reduce((s, it) => s + (catalogue[it.typeKey]?.price ?? 0), 0)
      if (total > c.budget_limit) return `Room total ($${total.toLocaleString()}) exceeds budget ($${c.budget_limit.toLocaleString()})`
    }
    return null
  }

  async function submitEntry(c) {
    if (!user) return
    setSubmitting(true); setError(null)
    const ve = validateEntry(c)
    if (ve) { setError(ve); setSubmitting(false); return }

    const { data: post, error: pe } = await supabase
      .from('community_posts')
      .insert({ user_id: user.id, title: entryForm.title || `${c.title} Entry`, description: entryForm.description || '' })
      .select('id').single()
    if (pe) { setError(pe.message); setSubmitting(false); return }

    const { error: ee } = await supabase
      .from('contest_entries')
      .insert({ contest_id: c.id, user_id: user.id, post_id: post.id })
    if (ee) { setError(ee.message); setSubmitting(false); return }

    await supabase.from('loyalty_points').insert({ user_id: user.id, amount: 5, reason: 'contest_entry', ref_id: c.id })
    setMyEntries(prev => new Set([...prev, c.id]))
    setJoining(null); setEntryForm({ title: '', description: '' }); setSubmitting(false)
    fetchContests()
  }

  async function toggleVote(entry) {
    if (!user) return
    const voted = myVotes[entry.id]
    if (voted) {
      await supabase.from('contest_votes').delete().eq('entry_id', entry.id).eq('user_id', user.id)
      await supabase.from('contest_entries').update({ vote_count: Math.max(0, entry.vote_count - 1) }).eq('id', entry.id)
      setMyVotes(prev => { const n = { ...prev }; delete n[entry.id]; return n })
      setContests(prev => prev.map(ct => ({
        ...ct, contest_entries: (ct.contest_entries ?? []).map(e =>
          e.id === entry.id ? { ...e, vote_count: Math.max(0, e.vote_count - 1) } : e)
      })))
    } else {
      await supabase.from('contest_votes').insert({ entry_id: entry.id, user_id: user.id })
      await supabase.from('contest_entries').update({ vote_count: entry.vote_count + 1 }).eq('id', entry.id)
      setMyVotes(prev => ({ ...prev, [entry.id]: true }))
      setContests(prev => prev.map(ct => ({
        ...ct, contest_entries: (ct.contest_entries ?? []).map(e =>
          e.id === entry.id ? { ...e, vote_count: e.vote_count + 1 } : e)
      })))
      await supabase.from('loyalty_points').insert({ user_id: user.id, amount: 1, reason: 'contest_vote', ref_id: entry.id })
    }
  }

  const fmt = iso => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

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
          {contests.map(c => (
            <ContestCard key={c.id} contest={c} t={t} user={user}
              myEntries={myEntries} myVotes={myVotes} expanded={expanded} joining={joining}
              entryForm={entryForm} submitting={submitting} error={error}
              onToggleExpand={id => setExpanded(expanded === id ? null : id)}
              onToggleJoin={id => { setJoining(joining === id ? null : id); setError(null) }}
              onFormChange={setEntryForm} onSubmit={submitEntry} onVote={toggleVote} fmt={fmt}
              onReveal={() => setRevealContest(c)}
            />
          ))}
        </div>
      </div>

      {revealContest && (
        <ContestReveal
          entries={[...(revealContest.contest_entries ?? [])].sort((a, b) => b.vote_count - a.vote_count)}
          contest={revealContest}
          onClose={() => setRevealContest(null)}
        />
      )}
    </div>
  )
}

function ContestCard({ contest: c, t, user, myEntries, myVotes, expanded, joining, entryForm, submitting, error, onToggleExpand, onToggleJoin, onFormChange, onSubmit, onVote, onReveal, fmt }) {
  const type = c.contest_type || 'theme'
  const entries = [...(c.contest_entries ?? [])].sort((a, b) => b.vote_count - a.vote_count)
  const winners = entries.filter(e => e.is_winner)
  const isActive = c.status === 'active'
  const canVote = user && (c.status === 'active' || c.status === 'voting')
  const hasEntered = myEntries.has(c.id)
  const isExpanded = expanded === c.id
  const isJoining = joining === c.id

  return (
    <div style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: '20px 22px', borderLeft: `4px solid ${STATUS_COLORS[c.status] ?? t.textSoft}`, transition: 'border-color 0.2s, box-shadow 0.2s' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14 }}>{TYPE_ICONS[type]}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{TYPE_LABELS[type]}</span>
          </div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.text }}>{c.title}</h3>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: STATUS_COLORS[c.status], padding: '4px 10px', background: `${STATUS_COLORS[c.status]}15`, borderRadius: 12, flexShrink: 0 }}>{c.status}</span>
      </div>

      <p style={{ margin: '0 0 12px', fontSize: 13, color: t.textSoft, lineHeight: 1.6 }}>{c.description}</p>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: t.textSoft, flexWrap: 'wrap', marginBottom: 10 }}>
        <span>Theme: <strong style={{ color: t.text }}>{c.theme}</strong></span>
        <span>{fmt(c.starts_at)} — {fmt(c.ends_at)}</span>
        <span>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
      </div>

      {c.sponsor?.display_name && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: `${t.accent}10`, border: `1px solid ${t.accent}25`, borderRadius: 8, fontSize: 11, color: t.accent, fontWeight: 600, marginBottom: 10 }}>
          ✦ Sponsored by {c.sponsor.display_name}
        </div>
      )}

      {type === 'brief' && c.budget_limit && (
        <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 10 }}>
          Budget: <strong style={{ color: t.text }}>${c.budget_limit.toLocaleString()}</strong>
          {(c.required_categories ?? []).length > 0 && <> — Must include: {c.required_categories.join(', ')}</>}
        </div>
      )}

      {type === 'placement' && (c.required_items ?? []).length > 0 && (
        <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 10 }}>
          Required items: <strong style={{ color: t.text }}>{c.required_items.length} products must be placed</strong>
        </div>
      )}

      {c.prize_description && (
        <div style={{ fontSize: 12, color: t.accent, fontWeight: 600, marginBottom: 10 }}>
          ✦ Prize: {c.prize_description}{c.prize_credit > 0 && ` ($${c.prize_credit} store credit)`}
        </div>
      )}

      {winners.map(w => (
        <div key={w.id} style={{ marginTop: 4, padding: '8px 12px', background: `${t.accent}10`, borderRadius: 8, fontSize: 12, color: t.accent, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <RaindropIcon size={14} filled color={t.accent} />
          {w.award}: {w.profiles?.display_name ?? 'Unknown'} ({w.vote_count} <RaindropIcon size={11} filled color={t.accent} />)
        </div>
      ))}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        {isActive && !hasEntered && user && (
          <button onClick={() => onToggleJoin(c.id)} style={{ padding: '8px 16px', borderRadius: 10, background: isJoining ? 'transparent' : t.accent, color: isJoining ? t.textSoft : t.accentText, border: isJoining ? `1px solid ${t.surfaceBorder}` : 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {isJoining ? 'Cancel' : 'Join this contest'}
          </button>
        )}
        {isActive && !hasEntered && !user && <span style={{ fontSize: 12, color: t.textSoft, fontStyle: 'italic' }}>Sign in to join</span>}
        {hasEntered && (
          <span style={{ padding: '6px 14px', borderRadius: 10, background: `${STATUS_COLORS.active}15`, color: STATUS_COLORS.active, fontSize: 12, fontWeight: 700 }}>✓ Entered</span>
        )}
        {entries.length > 0 && (
          <button onClick={() => onToggleExpand(c.id)} style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft, fontSize: 12, cursor: 'pointer' }}>
            {isExpanded ? 'Hide entries ▴' : `View entries (${entries.length}) ▾`}
          </button>
        )}
        {c.status === 'complete' && entries.length > 0 && (
          <button onClick={onReveal} style={{ padding: '6px 14px', borderRadius: 8, background: `${STATUS_COLORS.complete}20`, border: `1px solid ${STATUS_COLORS.complete}40`, color: STATUS_COLORS.complete, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Watch Reveal ✦
          </button>
        )}
      </div>

      {/* Entry form */}
      {isJoining && (
        <div style={{ marginTop: 14, padding: 16, background: t.bg, borderRadius: 10, border: `1px solid ${t.surfaceBorder}` }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: t.text }}>Submit your room</h4>
          <input type="text" placeholder="Entry title (e.g. 'Sunset Reading Nook')" value={entryForm.title}
            onChange={e => onFormChange(p => ({ ...p, title: e.target.value }))}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.surfaceBorder}`, background: t.surface, color: t.text, fontSize: 13, marginBottom: 10, boxSizing: 'border-box', outline: 'none' }}
          />
          <textarea placeholder="Describe your design (optional)" value={entryForm.description} rows={3}
            onChange={e => onFormChange(p => ({ ...p, description: e.target.value }))}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.surfaceBorder}`, background: t.surface, color: t.text, fontSize: 13, marginBottom: 10, boxSizing: 'border-box', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
          />
          {error && isJoining && <p style={{ margin: '0 0 10px', fontSize: 12, color: '#ff6b6b' }}>{error}</p>}
          <button onClick={() => onSubmit(c)} disabled={submitting}
            style={{ padding: '10px 20px', borderRadius: 10, background: t.accent, color: t.accentText, border: 'none', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Submitting...' : 'Submit entry'}
          </button>
        </div>
      )}

      {/* Entries list */}
      {isExpanded && entries.length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map(entry => (
            <EntryRow key={entry.id} entry={entry} t={t} user={user} canVote={canVote} voted={myVotes[entry.id]} onVote={onVote} />
          ))}
        </div>
      )}
    </div>
  )
}

function EntryRow({ entry, t, user, canVote, voted, onVote }) {
  const p = entry.profiles
  const tier = p?.designer_tier ?? 0
  const isMine = user && entry.user_id === user.id

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: isMine ? `${t.accent}08` : t.bg, border: `1px solid ${isMine ? `${t.accent}30` : t.surfaceBorder}` }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: t.accentText, overflow: 'hidden', flexShrink: 0 }}>
        {p?.avatar_url ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p?.display_name || '?')[0].toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
          {p?.display_name || 'Dreamer'}
          {isMine && <span style={{ fontSize: 10, color: t.textSoft, marginLeft: 6 }}>(you)</span>}
        </span>
        {tier > 0 && <span style={{ fontSize: 10, color: TIER_COLORS[tier], fontWeight: 600, marginLeft: 8 }}>{DESIGNER_TIERS[tier]}</span>}
      </div>
      {entry.is_winner && (
        <span style={{ padding: '3px 8px', borderRadius: 8, background: `${t.accent}15`, color: t.accent, fontSize: 10, fontWeight: 700 }}>{entry.award || 'Winner'}</span>
      )}
      {canVote && !isMine ? (
        <button onClick={() => onVote(entry)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: voted ? t.accent : t.textSoft, fontWeight: voted ? 700 : 400, fontSize: 13, padding: '4px 6px', transition: 'color 0.2s, transform 0.15s', transform: voted ? 'scale(1.1)' : 'scale(1)' }}>
          <RaindropIcon size={18} filled={voted} color={voted ? t.accent : t.textSoft} />
          {entry.vote_count}
        </button>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: t.textSoft }}>
          <RaindropIcon size={14} filled={entry.vote_count > 0} color={t.textSoft} />
          {entry.vote_count}
        </span>
      )}
    </div>
  )
}
