import { useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'

const MOCK_REVIEWS = [
  { id: 1, stars: 5, reviewer: 'Mara T.',    date: 'Apr 2, 2026',  product: 'Linen Storage Ottoman',      body: 'Absolutely beautiful. Exactly as described and packed so carefully. Will be ordering the matching footstool next month.' },
  { id: 2, stars: 5, reviewer: 'James K.',   date: 'Mar 28, 2026', product: 'Rattan Accent Chair',        body: 'This chair is stunning in person. The photos do not do it justice. Great communication from the seller too.' },
  { id: 3, stars: 4, reviewer: 'Sofia R.',   date: 'Mar 20, 2026', product: 'Ceramic Planter Set (3)',    body: 'Really happy with the quality. Shipping took a little longer than expected but the seller kept me updated the whole time.' },
  { id: 4, stars: 5, reviewer: 'Lena B.',    date: 'Mar 15, 2026', product: 'Woven Wall Hanging',         body: 'Dreamy. It anchors the whole room. I\'ve already recommended this shop to three friends.' },
  { id: 5, stars: 3, reviewer: 'Noah A.',    date: 'Mar 10, 2026', product: 'Terracotta Herb Pot',        body: 'Nice pot, but one of the three arrived with a small chip. The seller sorted it out quickly, just delayed things a bit.' },
  { id: 6, stars: 5, reviewer: 'Isabelle C.', date: 'Feb 28, 2026', product: 'Rattan Accent Chair',      body: 'Second time buying from this shop and it never disappoints. The craftsmanship is second to none.' },
  { id: 7, stars: 4, reviewer: 'Tom H.',     date: 'Feb 20, 2026', product: 'Linen Storage Ottoman',     body: 'Great piece, solid and well made. Colour was slightly darker than expected but I actually prefer it.' },
  { id: 8, stars: 5, reviewer: 'Amara O.',   date: 'Feb 12, 2026', product: 'Macramé Hanging Planter',   body: 'My plants have never looked happier! The texture and weight of this are perfect. Shipped faster than expected.' },
]

const STAR_FILTERS = ['All', '5★', '4★', '3★ & below']

function stars(n) {
  return Array.from({ length: 5 }, (_, i) => i < n ? '★' : '☆').join('')
}

function avgRating(reviews) {
  return (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
}

export default function ReviewsPage() {
  const t = useTheme()
  const [items,   setItems]   = useState(MOCK_REVIEWS)
  const [filter,  setFilter]  = useState('All')
  const [replies, setReplies] = useState({})   // { [id]: { open, text, sent } }

  const visible = items.filter(r => {
    if (filter === '5★')        return r.stars === 5
    if (filter === '4★')        return r.stars === 4
    if (filter === '3★ & below') return r.stars <= 3
    return true
  })

  const avg    = avgRating(items)
  const dist   = [5, 4, 3, 2, 1].map(n => ({ n, count: items.filter(r => r.stars === n).length }))
  const maxDist = Math.max(...dist.map(d => d.count))

  function toggleReply(id) {
    setReplies(prev => ({ ...prev, [id]: { open: !prev[id]?.open, text: prev[id]?.text ?? '', sent: prev[id]?.sent ?? false } }))
  }
  function setReplyText(id, text) {
    setReplies(prev => ({ ...prev, [id]: { ...prev[id], text } }))
  }
  function sendReply(id) {
    setReplies(prev => ({ ...prev, [id]: { ...prev[id], sent: true, open: false } }))
  }

  return (
    <div style={{ maxWidth: 700 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 }}>Reviews</h1>
        <p style={{ fontSize: 13, color: t.textSoft }}>What your customers are saying.</p>
      </div>

      {/* Summary card */}
      <div style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16, padding: '22px 24px', marginBottom: 20, display: 'flex', gap: 32, alignItems: 'center' }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: t.text, lineHeight: 1 }}>{avg}</div>
          <div style={{ fontSize: 18, color: t.accent, letterSpacing: 2, margin: '6px 0 4px' }}>{stars(Math.round(+avg))}</div>
          <div style={{ fontSize: 12, color: t.textSoft }}>{items.length} reviews</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {dist.map(({ n, count }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: t.textSoft, width: 16, textAlign: 'right', flexShrink: 0 }}>{n}</span>
              <span style={{ fontSize: 10, color: t.accent }}>★</span>
              <div style={{ flex: 1, height: 6, background: t.surfaceBorder, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${maxDist ? (count / maxDist) * 100 : 0}%`, background: t.accent, borderRadius: 4, transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: 11, color: t.textSoft, width: 18, flexShrink: 0 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {STAR_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter === f ? t.accent : t.surfaceBorder}`, background: filter === f ? `${t.accent}18` : 'transparent', color: filter === f ? t.accent : t.textSoft, fontSize: 12, fontWeight: filter === f ? 600 : 500, cursor: 'pointer' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Review list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map(r => {
          const reply = replies[r.id] ?? {}
          return (
            <div key={r.id} style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, color: t.accent, letterSpacing: 1 }}>{stars(r.stars)}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{r.reviewer}</span>
                  </div>
                  <p style={{ fontSize: 11, color: t.textSoft }}>{r.product} · {r.date}</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: t.text, lineHeight: 1.7, marginBottom: reply.sent ? 0 : 12 }}>{r.body}</p>

              {reply.sent ? (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.surfaceBorder}` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: t.accent, marginBottom: 4 }}>Your reply</p>
                  <p style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.6 }}>{reply.text}</p>
                </div>
              ) : (
                <>
                  <button onClick={() => toggleReply(r.id)}
                    style={{ fontSize: 12, fontWeight: 600, color: t.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {reply.open ? 'Cancel' : '↩ Reply'}
                  </button>
                  {reply.open && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <textarea
                        style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.5)', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.text, fontSize: 13, resize: 'vertical', height: 80, outline: 'none' }}
                        placeholder="Write a public reply…"
                        value={reply.text ?? ''}
                        onChange={e => setReplyText(r.id, e.target.value)}
                      />
                      <button onClick={() => sendReply(r.id)} disabled={!reply.text?.trim()}
                        style={{ alignSelf: 'flex-end', padding: '8px 18px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: reply.text?.trim() ? 1 : 0.5 }}>
                        Post reply →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      <p style={{ marginTop: 28, fontSize: 11, color: t.textSoft, textAlign: 'center', opacity: 0.6 }}>
        Live reviews from Supabase — coming when customer order flow is complete.
      </p>
    </div>
  )
}
