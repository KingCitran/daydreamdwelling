import { useTheme } from '@shared/ThemeProvider'
import Logo from '@shared/Logo'
import WispyArt from '@shared/wispy/art'

export default function NotFoundPage() {
  const t = useTheme()

  return (
    <div style={{
      minHeight: '100vh', background: t.bg,
      fontFamily: "'Outfit', system-ui, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 24, padding: 32, textAlign: 'center',
    }}>
      <WispyArt slot="resting" mood="Dream State" width={120} />

      <h1 style={{
        fontFamily: "'EB Garamond', Georgia, serif",
        fontSize: 48, fontWeight: 400, color: t.text, margin: 0,
      }}>
        Lost in the clouds.
      </h1>

      <p style={{ fontSize: 15, color: t.textSoft, maxWidth: 380, lineHeight: 1.6, margin: 0 }}>
        This page doesn't exist — but there are plenty of rooms that do.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/" style={{
          padding: '10px 20px', borderRadius: 10,
          background: t.accent, color: t.accentText,
          textDecoration: 'none', fontSize: 13, fontWeight: 700,
        }}>Back to Builder</a>
        <a href="/?hub=1" style={{
          padding: '10px 20px', borderRadius: 10,
          background: 'transparent', color: t.accent,
          border: `1px solid ${t.accent}40`,
          textDecoration: 'none', fontSize: 13, fontWeight: 700,
        }}>Hub</a>
        <a href="/community" style={{
          padding: '10px 20px', borderRadius: 10,
          background: 'transparent', color: t.accent,
          border: `1px solid ${t.accent}40`,
          textDecoration: 'none', fontSize: 13, fontWeight: 700,
        }}>Community</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
        <Logo size={18} color={t.textSoft} />
        <span style={{ fontSize: 12, color: t.textSoft }}>DaydreamDwelling</span>
      </div>
    </div>
  )
}
