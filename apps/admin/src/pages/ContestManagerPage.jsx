import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const STATUS_COLORS = { upcoming: '#70a0ff', active: '#70c090', voting: '#f0c060', judging: '#ff7aa0', complete: '#9a7aee' }
const STATUS_ORDER  = ['upcoming', 'active', 'voting', 'judging', 'complete']
const TYPE_OPTIONS  = [{ value: 'theme', label: 'Theme' }, { value: 'placement', label: 'Product Placement' }, { value: 'brief', label: 'Client Brief' }]

const EMPTY_FORM = {
  title: '', description: '', theme: '', contest_type: 'theme',
  starts_at: '', ends_at: '', voting_ends_at: '',
  prize_description: '', prize_credit: 0, budget_limit: '',
  required_categories: '',
}

export default function ContestManagerPage() {
  const t = useTheme()
  const [contests, setContests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchContests() }, [])

  async function fetchContests() {
    setLoading(true)
    const { data } = await supabase
      .from('contests')
      .select('*, contest_entries(id, user_id, vote_count, is_winner, award, profiles(display_name))')
      .order('starts_at', { ascending: false })
    setContests(data ?? [])
    setLoading(false)
  }

  function startCreate() {
    setEditing('new')
    setForm(EMPTY_FORM)
    setError(null)
  }

  function startEdit(c) {
    setEditing(c.id)
    setForm({
      title: c.title, description: c.description || '', theme: c.theme,
      contest_type: c.contest_type || 'theme',
      starts_at: c.starts_at?.slice(0, 16) || '',
      ends_at: c.ends_at?.slice(0, 16) || '',
      voting_ends_at: c.voting_ends_at?.slice(0, 16) || '',
      prize_description: c.prize_description || '', prize_credit: c.prize_credit || 0,
      budget_limit: c.budget_limit || '',
      required_categories: (c.required_categories ?? []).join(', '),
    })
    setError(null)
  }

  async function saveContest() {
    if (!form.title || !form.theme || !form.starts_at || !form.ends_at) {
      setError('Title, theme, start date, and end date are required')
      return
    }
    setSaving(true); setError(null)
    const payload = {
      title: form.title, description: form.description, theme: form.theme,
      contest_type: form.contest_type,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      voting_ends_at: form.voting_ends_at ? new Date(form.voting_ends_at).toISOString() : null,
      prize_description: form.prize_description || null,
      prize_credit: Number(form.prize_credit) || 0,
      budget_limit: form.contest_type === 'brief' && form.budget_limit ? Number(form.budget_limit) : null,
      required_categories: form.contest_type === 'brief' && form.required_categories
        ? form.required_categories.split(',').map(s => s.trim()).filter(Boolean) : [],
    }

    let err
    if (editing === 'new') {
      const res = await supabase.from('contests').insert(payload)
      err = res.error
    } else {
      const res = await supabase.from('contests').update(payload).eq('id', editing)
      err = res.error
    }
    setSaving(false)
    if (err) { setError(err.message); return }
    setEditing(null)
    fetchContests()
  }

  async function updateStatus(contestId, newStatus) {
    await supabase.from('contests').update({ status: newStatus }).eq('id', contestId)
    fetchContests()
  }

  async function toggleWinner(entry, contestId) {
    const newVal = !entry.is_winner
    await supabase.from('contest_entries').update({
      is_winner: newVal,
      award: newVal ? 'Winner' : null,
    }).eq('id', entry.id)
    fetchContests()
  }

  async function deleteContest(id) {
    await supabase.from('contests').delete().eq('id', id)
    fetchContests()
  }

  const fmt = iso => iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.surfaceBorder}`, background: t.bg, color: t.text, fontSize: 13, boxSizing: 'border-box', outline: 'none' }
  const labelStyle = { fontSize: 11, fontWeight: 600, color: t.textSoft, marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: t.text, margin: 0 }}>Contest Manager</h1>
        <button onClick={startCreate} style={{ padding: '10px 20px', borderRadius: 10, background: t.accent, color: t.accentText, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + New Contest
        </button>
      </div>

      {/* Create / Edit form */}
      {editing && (
        <div style={{ marginBottom: 24, padding: 24, background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 18 }}>
            {editing === 'new' ? 'Create Contest' : 'Edit Contest'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Title</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Spring Bloom Challenge" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Contest details..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={labelStyle}>Theme</label>
              <input value={form.theme} onChange={e => setForm(p => ({ ...p, theme: e.target.value }))} placeholder="e.g. Cozy Autumn" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Contest Type</label>
              <select value={form.contest_type} onChange={e => setForm(p => ({ ...p, contest_type: e.target.value }))} style={inputStyle}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Starts At</label>
              <input type="datetime-local" value={form.starts_at} onChange={e => setForm(p => ({ ...p, starts_at: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Ends At</label>
              <input type="datetime-local" value={form.ends_at} onChange={e => setForm(p => ({ ...p, ends_at: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Voting Ends At (optional)</label>
              <input type="datetime-local" value={form.voting_ends_at} onChange={e => setForm(p => ({ ...p, voting_ends_at: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Prize</label>
              <input value={form.prize_description} onChange={e => setForm(p => ({ ...p, prize_description: e.target.value }))} placeholder="e.g. Featured placement + 500 loyalty points" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Prize Credit ($)</label>
              <input type="number" value={form.prize_credit} onChange={e => setForm(p => ({ ...p, prize_credit: e.target.value }))} style={inputStyle} />
            </div>
            {form.contest_type === 'brief' && (
              <>
                <div>
                  <label style={labelStyle}>Budget Limit ($)</label>
                  <input type="number" value={form.budget_limit} onChange={e => setForm(p => ({ ...p, budget_limit: e.target.value }))} placeholder="e.g. 500" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Required Categories (comma-separated)</label>
                  <input value={form.required_categories} onChange={e => setForm(p => ({ ...p, required_categories: e.target.value }))} placeholder="e.g. Seating, Lighting" style={inputStyle} />
                </div>
              </>
            )}
          </div>
          {error && <p style={{ fontSize: 12, color: '#ff6b6b', marginTop: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={saveContest} disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, background: t.accent, color: t.accentText, border: 'none', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : editing === 'new' ? 'Create Contest' : 'Save Changes'}
            </button>
            <button onClick={() => setEditing(null)} style={{ padding: '10px 20px', borderRadius: 10, background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Contest list */}
      {loading && <p style={{ color: t.textSoft }}>Loading contests...</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {contests.map(c => {
          const entries = [...(c.contest_entries ?? [])].sort((a, b) => b.vote_count - a.vote_count)
          const isExp = expanded === c.id
          const nextStatus = STATUS_ORDER[STATUS_ORDER.indexOf(c.status) + 1]

          return (
            <div key={c.id} style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: '18px 22px', borderLeft: `4px solid ${STATUS_COLORS[c.status] ?? t.textSoft}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text }}>{c.title}</h3>
                  <span style={{ fontSize: 11, color: t.textSoft }}>{c.theme} — {c.contest_type}</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: STATUS_COLORS[c.status], padding: '4px 10px', background: `${STATUS_COLORS[c.status]}15`, borderRadius: 12, flexShrink: 0 }}>{c.status}</span>
              </div>
              <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 12 }}>
                {fmt(c.starts_at)} — {fmt(c.ends_at)} | {entries.length} entries
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => startEdit(c)} style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft, fontSize: 12, cursor: 'pointer' }}>Edit</button>
                {nextStatus && (
                  <button onClick={() => updateStatus(c.id, nextStatus)} style={{ padding: '6px 14px', borderRadius: 8, background: `${STATUS_COLORS[nextStatus]}20`, border: `1px solid ${STATUS_COLORS[nextStatus]}40`, color: STATUS_COLORS[nextStatus], fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Advance to {nextStatus}
                  </button>
                )}
                {entries.length > 0 && (
                  <button onClick={() => setExpanded(isExp ? null : c.id)} style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft, fontSize: 12, cursor: 'pointer' }}>
                    {isExp ? 'Hide entries ▴' : `Entries (${entries.length}) ▾`}
                  </button>
                )}
                {entries.length === 0 && c.status === 'upcoming' && (
                  <button onClick={() => deleteContest(c.id)} style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', border: '1px solid #ff6b6b40', color: '#ff6b6b', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                )}
              </div>

              {isExp && entries.length > 0 && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {entries.map((entry, i) => (
                    <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: entry.is_winner ? `${t.accent}10` : t.bg, border: `1px solid ${entry.is_winner ? `${t.accent}30` : t.surfaceBorder}` }}>
                      <span style={{ fontSize: 12, color: t.textSoft, width: 24, textAlign: 'center' }}>#{i + 1}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: t.text }}>{entry.profiles?.display_name || 'Unknown'}</span>
                      <span style={{ fontSize: 12, color: t.textSoft }}>{entry.vote_count} votes</span>
                      <button onClick={() => toggleWinner(entry, c.id)} style={{ padding: '4px 10px', borderRadius: 6, background: entry.is_winner ? t.accent : 'transparent', color: entry.is_winner ? t.accentText : t.textSoft, border: entry.is_winner ? 'none' : `1px solid ${t.surfaceBorder}`, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        {entry.is_winner ? '★ Winner' : 'Set winner'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
