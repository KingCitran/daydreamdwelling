import { useTheme, useMoodControl } from '@shared/ThemeProvider'
import Logo from '@shared/Logo'
import WispyArt from '@shared/wispy/art'
import FeedbackButton from '../ui/FeedbackButton'

// ── About page ─────────────────────────────────────────────────────
// Wispy tells the story of Hayley and DaydreamDwelling. Informal,
// warm, slightly poetic — like a friend introducing you to the person
// behind the curtain. No corporate speak.

export default function AboutPage({ onBack }) {
  const t = useTheme()
  const { mood } = useMoodControl()

  return (
    <div style={{
      minHeight: '100vh', background: t.bg,
      fontFamily: "'Outfit', system-ui, sans-serif",
      color: t.text,
    }}>
      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: t.navBg, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${t.navBorder}`,
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onBack}>
          <Logo size={26} color={t.accent} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>DaydreamDwelling</span>
        </div>
        <button onClick={onBack} style={{
          padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
          background: `${t.accent}10`, border: `1px solid ${t.accent}30`,
          color: t.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit',
        }}>← Back to Builder</button>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Wispy intro */}
        <div style={{
          padding: '28px 32px', borderRadius: 20,
          background: t.surface, border: `1px solid ${t.surfaceBorder}`,
          marginBottom: 40, position: 'relative',
        }}>
          <div style={{ width: 80, margin: '0 auto 12px' }}>
            <WispyArt slot="happy" mood={mood} width={80} />
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.8, color: t.text }}>
            Hi. I'm Wispy — I float around here and keep things cozy. You're probably
            wondering who's behind all this. Let me tell you about Hayley.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: t.textSoft, fontStyle: 'italic' }}>
            — Wispy, cloud-in-residence
          </p>
        </div>

        {/* The story */}
        <h1 style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: 32, fontWeight: 500, margin: '0 0 8px',
          color: t.text, textShadow: '0 0 0 transparent',
          WebkitTextStroke: 0,
        }}>
          One person. One idea.
        </h1>
        <p style={{ fontSize: 13, color: t.accent, fontWeight: 600, margin: '0 0 32px' }}>
          The story of DaydreamDwelling
        </p>

        <Section>
          <p>
            Hayley started DaydreamDwelling because she kept asking the same question
            everyone asks — <em>is there an easier way to figure out if this layout
            actually works?</em>
          </p>
          <p>
            She moves things around all the time. The couch goes here, no — there.
            The shelf looks better on that wall. The lamp needs to be closer to the
            reading chair. We've all done it. She just decided to build the tool
            she wished existed.
          </p>
        </Section>

        <Section>
          <p>
            This isn't a big company. There's no team of fifty. It's one person building
            something she cares about, late nights and weekends, learning as she goes.
            That's not a limitation — it's the whole point. Every decision here is made by
            someone who actually uses it.
          </p>
        </Section>

        <Section title="What this place is for">
          <p>
            DaydreamDwelling is for everyone who wants to upgrade their home in an honest way.
            Not the aspirational, out-of-reach kind of upgrade — the real kind. The kind where
            you try three different rug placements before committing. The kind where you find a
            small maker who builds exactly what you've been picturing.
          </p>
          <p>
            The room builder lets you design your space in 3D. The marketplace connects you
            with real sellers who make real things. The moods — all those skies and color
            palettes — they're there because your room should feel like <em>yours</em>,
            not like a catalog.
          </p>
        </Section>

        <Section title="Honesty and whimsy">
          <p>
            Two things matter here more than anything: being honest about what you're selling,
            and making the whole experience feel a little magical. Sellers show real prices,
            real dimensions, real shipping costs. No hidden fees, no inflated "was" prices.
          </p>
          <p>
            And the whimsy — the clouds drifting across the sky, the moon that changes
            every time you visit, the music that plays while you design — that's not decoration.
            That's the feeling of actually enjoying the process of making your home yours.
          </p>
        </Section>

        {/* Wispy closing */}
        <div style={{
          padding: '24px 28px', borderRadius: 20,
          background: t.surface, border: `1px solid ${t.surfaceBorder}`,
          marginTop: 40,
        }}>
          <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.8, color: t.text }}>
            That's Hayley. She's probably rearranging furniture right now — real or virtual,
            hard to say. If you want to talk to her, the feedback button is always there.
            She reads every single one.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <div style={{ width: 36 }}><WispyArt slot="resting" mood={mood} width={36} /></div>
            <p style={{ margin: 0, fontSize: 12, color: t.textSoft, fontStyle: 'italic' }}>See you around.</p>
          </div>
        </div>

        {/* Headshot placeholder — will be added later */}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${t.surfaceBorder}`,
        padding: '32px 24px', textAlign: 'center',
        fontSize: 12, color: t.textSoft,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12 }}>
          <a href="/" style={{ color: t.text, textDecoration: 'none' }}>Room Builder</a>
          <a href="/community" style={{ color: t.text, textDecoration: 'none' }}>Community</a>
          <a href="https://daydreamsellers.com" style={{ color: t.text, textDecoration: 'none' }}>Sell on Daydream</a>
        </div>
        © {new Date().getFullYear()} DaydreamDwelling. All rights reserved.
      </footer>

      <FeedbackButton />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {title && (
        <h2 style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: 22, fontWeight: 500, margin: '0 0 12px',
          letterSpacing: '-0.01em',
          textShadow: 'none', WebkitTextStroke: 0,
        }}>{title}</h2>
      )}
      <div style={{ fontSize: 15, lineHeight: 1.85, color: 'inherit' }}>
        {children}
      </div>
      <style>{`
        .about-section p { margin: 0 0 14px; }
        .about-section p:last-child { margin: 0; }
      `}</style>
    </div>
  )
}
