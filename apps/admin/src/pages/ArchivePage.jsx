import { useTheme } from '@shared/ThemeProvider'

const ENTRIES = [
  {
    key: 'landing-v1',
    title: 'Landing page — v1',
    desc: 'The pre-Sky-redesign landing. Carousel, designer leaderboard, supabase featured room. Archived 2026-05-09.',
    href: '/?legacy=v1',
  },
]

export default function ArchivePage() {
  const t = useTheme()
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 }}>Archive</h1>
        <p style={{ fontSize: 13, color: t.textSoft }}>Snapshots of pages and components that were replaced or retired. Preserved for reference.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {ENTRIES.map(e => (
          <a key={e.key} href={e.href} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'block', textDecoration: 'none',
              background: t.surface, border: `1px solid ${t.surfaceBorder}`,
              borderRadius: 16, padding: '20px 22px',
              transition: 'border-color 0.18s ease, transform 0.18s ease',
            }}
            onMouseEnter={e2 => { e2.currentTarget.style.borderColor = t.accent }}
            onMouseLeave={e2 => { e2.currentTarget.style.borderColor = t.surfaceBorder }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{e.title}</span>
              <span style={{ fontSize: 11, color: t.accent, letterSpacing: '0.5px' }}>open in new tab →</span>
            </div>
            <p style={{ fontSize: 13, color: t.textSoft, margin: 0, lineHeight: 1.55 }}>{e.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
