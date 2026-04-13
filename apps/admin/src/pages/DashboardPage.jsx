import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

export default function DashboardPage({ onNavigate }) {
  const t = useTheme()
  const [stats, setStats] = useState({ contests: 0, entries: 0, posts: 0, users: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from('contests').select('id', { count: 'exact', head: true }),
      supabase.from('contest_entries').select('id', { count: 'exact', head: true }),
      supabase.from('community_posts').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]).then(([c, e, p, u]) => {
      setStats({ contests: c.count ?? 0, entries: e.count ?? 0, posts: p.count ?? 0, users: u.count ?? 0 })
    })
  }, [])

  const cards = [
    { label: 'Contests', value: stats.contests, icon: '✦', action: 'contests' },
    { label: 'Contest Entries', value: stats.entries, icon: '◈' },
    { label: 'Community Posts', value: stats.posts, icon: '🌐' },
    { label: 'Users', value: stats.users, icon: '👤' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: t.text, marginBottom: 28 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 }}>
        {cards.map(card => (
          <div key={card.label} onClick={() => card.action && onNavigate(card.action)}
            style={{ padding: '24px 20px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, cursor: card.action ? 'pointer' : 'default', transition: 'border-color 0.2s' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: t.text }}>{card.value}</div>
            <div style={{ fontSize: 12, color: t.textSoft, marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
