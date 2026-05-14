import { useState, useEffect } from 'react'
import { supabase } from '@shared/supabase'
import RaindropIcon from '@shared/RaindropIcon'
import { resolveRoomItems } from '../../utils/resolveRoomItems'
import { DESIGNER_TIERS, TIER_COLORS } from './PostCard'

const MOOD_GRADIENTS = {
  'Golden Hour': 'linear-gradient(135deg, #451a03, #fbbf24)',
  'Moonlight': 'linear-gradient(135deg, #0f172a, #c4b5fd)',
  'Dream State': 'linear-gradient(135deg, #2e1065, #f5d0fe)',
  'Blush Hour': 'linear-gradient(135deg, #500724, #fdf2f8)',
  'Candlelit Cozy Evening': 'linear-gradient(135deg, #1c1917, #fff7ed)',
  'Vivid Sunset': 'linear-gradient(135deg, #010101, #ffaa3d)',
  "Ember's Sunrise": 'linear-gradient(135deg, #15080e, #dcd0f0)',
  'Northern Lights': 'linear-gradient(135deg, #02060e, #01efac)',
  'Neon Nights': 'linear-gradient(135deg, #6600ff, #00ffcc)',
  'Greenhouse': 'linear-gradient(135deg, #052e16, #ecfdf5)',
  'Dark Academia': 'linear-gradient(135deg, #1a1207, #d4a373)',
}

export default function ContestEntryDetail({ entry, t, user, canVote, voted, onVote, cart }) {
  const p = entry.profiles
  const tier = p?.designer_tier ?? 0
  const isMine = user && entry.user_id === user.id
  const cp = entry.community_posts
  const screenshot = cp?.screenshot_url

  const [expanded, setExpanded]     = useState(false)
  const [roomItems, setRoomItems]   = useState([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [addedAll, setAddedAll]     = useState(false)

  useEffect(() => {
    if (!expanded || roomItems.length > 0 || !cp?.room_id) return
    let cancelled = false
    async function load() {
      setItemsLoading(true)
      const { data: room } = await supabase
        .from('saved_rooms').select('data')
        .eq('id', cp.room_id).maybeSingle()
      if (cancelled) return
      if (room?.data) {
        const resolved = await resolveRoomItems(room.data)
        if (!cancelled) setRoomItems(resolved.filter(i => i.source !== 'unknown'))
      }
      setItemsLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [expanded, cp?.room_id])

  function handleBuyAll() {
    if (!cart || roomItems.length === 0) return
    cart.addRoomItems(roomItems)
    setAddedAll(true)
    setTimeout(() => setAddedAll(false), 2500)
  }

  const totalPrice = roomItems.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      background: isMine ? `${t.accent}05` : t.bg,
      border: `1px solid ${isMine ? `${t.accent}30` : t.surfaceBorder}`,
    }}>
      {/* Main entry row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', cursor: 'pointer',
      }} onClick={() => setExpanded(e => !e)}>
        {/* Screenshot thumbnail */}
        <div style={{
          width: 44, height: 32, borderRadius: 6, overflow: 'hidden',
          background: t.surface, border: `1px solid ${t.surfaceBorder}`, flexShrink: 0,
        }}>
          {screenshot
            ? <img src={screenshot} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', background: MOOD_GRADIENTS[cp?.mood] || 'linear-gradient(135deg, #1a1a2e, #533483)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, opacity: 0.7 }}>✦</div>}
        </div>

        {/* Avatar */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: t.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: t.accentText, overflow: 'hidden', flexShrink: 0,
        }}>
          {p?.avatar_url
            ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (p?.display_name || '?')[0].toUpperCase()}
        </div>

        {/* Name + tier */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
            {p?.display_name || 'Dreamer'}
            {isMine && <span style={{ fontSize: 10, color: t.textSoft, marginLeft: 6 }}>(you)</span>}
          </span>
          {tier > 0 && <span style={{ fontSize: 10, color: TIER_COLORS[tier], fontWeight: 600, marginLeft: 8 }}>{DESIGNER_TIERS[tier]}</span>}
          {cp?.title && <div style={{ fontSize: 11, color: t.textSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cp.title}</div>}
        </div>

        {/* Winner badge */}
        {entry.is_winner && (
          <span style={{ padding: '3px 8px', borderRadius: 8, background: `${t.accent}15`, color: t.accent, fontSize: 10, fontWeight: 700 }}>{entry.award || 'Winner'}</span>
        )}

        {/* Vote / count */}
        {canVote && !isMine ? (
          <button onClick={e => { e.stopPropagation(); onVote(entry) }} title="Drop your raindrop" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: voted ? `${t.accent}20` : `${t.accent}10`,
            border: `1.5px solid ${voted ? t.accent : `${t.accent}40`}`,
            cursor: 'pointer', borderRadius: 10,
            color: voted ? t.accent : t.text, fontWeight: 700, fontSize: 14,
            padding: '6px 12px', transition: 'all 0.2s',
            transform: voted ? 'scale(1.05)' : 'scale(1)',
            boxShadow: voted ? `0 0 0 3px ${t.accent}15` : 'none',
          }}>
            <RaindropIcon size={22} filled={voted} color={t.accent} />
            {entry.vote_count}
          </button>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: t.textSoft }}>
            <RaindropIcon size={14} filled={entry.vote_count > 0} color={t.textSoft} />
            {entry.vote_count}
          </span>
        )}

        {/* Expand chevron */}
        <span style={{ fontSize: 11, color: t.textSoft, flexShrink: 0 }}>{expanded ? '▴' : '▾'}</span>
      </div>

      {/* Expanded detail — items + Buy This Room */}
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${t.surfaceBorder}` }}>
          {/* Screenshot large */}
          {screenshot && (
            <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', maxHeight: 200 }}>
              <img src={screenshot} alt={cp?.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Mood tag */}
          {cp?.mood && (
            <div style={{ marginTop: 10 }}>
              <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: `${t.accent}12`, border: `1px solid ${t.accent}25`, color: t.accent }}>
                ✦ {cp.mood}
              </span>
            </div>
          )}

          {/* Items in this room */}
          <div style={{ marginTop: 12 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: t.text }}>
              Items in this Room
              {roomItems.length > 0 && <span style={{ fontWeight: 500, color: t.textSoft, marginLeft: 6 }}>{roomItems.length}</span>}
            </h4>

            {itemsLoading && <div style={{ fontSize: 11, color: t.textSoft, padding: '8px 0' }}>Loading items...</div>}

            {!itemsLoading && !cp?.room_id && (
              <div style={{ fontSize: 11, color: t.textSoft, padding: '8px 0' }}>No room data linked to this entry.</div>
            )}

            {!itemsLoading && cp?.room_id && roomItems.length === 0 && (
              <div style={{ fontSize: 11, color: t.textSoft, padding: '8px 0' }}>No purchasable items found.</div>
            )}

            {!itemsLoading && roomItems.length > 0 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {roomItems.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 10px', borderRadius: 8,
                      background: t.surface, border: `1px solid ${t.surfaceBorder}`,
                      fontSize: 11,
                    }}>
                      {item.swatchHex && (
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: item.swatchHex, border: `1px solid ${t.surfaceBorder}`, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
                        <div style={{ fontSize: 10, color: t.textSoft }}>
                          {item.brand}{item.sizeName ? ` · ${item.sizeName}` : ''}{item.qty > 1 ? ` × ${item.qty}` : ''}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: t.text, flexShrink: 0 }}>${(item.price * item.qty).toFixed(2)}</div>
                      {cart && (
                        <button onClick={() => cart.addItem(item.typeKey, item.sizeIndex, item.swatchIndex)} style={{
                          padding: '3px 6px', borderRadius: 5,
                          background: `${t.accent}10`, border: `1px solid ${t.accent}30`,
                          color: t.accent, fontSize: 9, fontWeight: 700, cursor: 'pointer',
                        }}>+ Cart</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Buy This Room */}
                {cart && (
                  <div style={{ marginTop: 10, borderTop: `1px solid ${t.surfaceBorder}`, paddingTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Room Total</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>${totalPrice.toFixed(2)}</span>
                    </div>
                    <button onClick={handleBuyAll} style={{
                      width: '100%', padding: '10px', borderRadius: 10,
                      background: addedAll ? '#22c55e' : t.accent,
                      color: addedAll ? '#fff' : t.accentText,
                      border: 'none', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', transition: 'background 0.3s',
                    }}>
                      {addedAll ? '✓ Added to Cart!' : `Buy This Room — $${totalPrice.toFixed(2)}`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
