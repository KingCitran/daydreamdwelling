// Wispy mascot — layered PNG composition.
//
// Replaces the inline-SVG v1 art with the locked v1.0.0 PNG bundle
// delivered by claude-design. The cloud body is a single PNG; the face
// is one of 40 expression PNGs; legs sit behind the cloud with a
// top-fade mask so they dissolve into the silhouette.
//
// Placement values come from the bundle's wispy.json:
//   - face: anchorX 0.50, anchorY 0.50, widthFraction 0.16
//   - legs: anchorX 0.50, anchorY 0.75, widthFraction 0.22
//   - top-fade mask: linear gradient on the legs PNG
//
// Ink mode (light cream face/legs for dark backgrounds vs dark plum for
// light) is selected by the caller via the `ink` prop; pick it with
// inkForBg(bg) from inkMode.js when you have a theme handy.
//
// The arms-and-sparkles props from v1 are no longer present (claude-
// design dropped them in favor of richer face variants). The old
// signature is accepted but ignored so nothing crashes during migration.

import { CLOUD_BASE_URL, CLOUD_SILHOUETTE_URL, getFaceUrl, getFaceBlush, getLegsUrl } from './faceMeta.js'
import { cloudStyleForMood } from './cloudPalette.js'

export default function WispyArt({
  slot = 'happy',
  ink  = 'dark',
  mood,    // mood name (e.g. 'Dream State'); when set, tints the cloud
  width  = 140,
  height,  // optional override; defaults to width (square)
  // ── legacy props from v1 — kept for back-compat, otherwise no-op ──
  // eslint-disable-next-line no-unused-vars
  mouthOpen, eyeClosed, leftArmStyle, rightArmStyle, showSparkles,
}) {
  // Honor the v1 eyeClosed convention so the blink loop in WispyMascot
  // still works without knowing about slots.
  const effectiveSlot = eyeClosed ? 'blink' : slot
  const faceUrl  = getFaceUrl(effectiveSlot, ink)
  const showBlush = getFaceBlush(effectiveSlot)
  const legsUrl  = getLegsUrl(ink)
  const h = height ?? width

  // Mood tint: when defined, lays a per-mood gradient over the base
  // cloud PNG with mix-blend-mode so the bundle's baked sheen + drop
  // shadow + tilt all survive and the cloud takes on the mood color.
  // When undefined (moods we haven't themed yet), the base PNG renders
  // alone — pre-shaded dusk pastel, still fully opaque.
  const cloudStyle = cloudStyleForMood(mood)

  return (
    <div style={{ position: 'relative', width, height: h, pointerEvents: 'none', filter: cloudStyle?.shadow }}>
      {/* legs — behind the cloud (DOM order matters) */}
      <img
        src={legsUrl}
        alt=""
        style={{
          position: 'absolute',
          left: '39%',
          top:  '53%',
          width: '22%',
          height: 'auto',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, transparent 18%, rgba(0,0,0,0.6) 35%, black 55%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, transparent 18%, rgba(0,0,0,0.6) 35%, black 55%)',
        }}
      />
      {/* cloud body — the bundle's pre-shaded PNG always renders for
          opacity + sheen + shadow + -9deg tilt. */}
      <img
        src={CLOUD_BASE_URL}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      {/* Mood tint — silhouette-masked gradient overlaid on the base via
          mix-blend-mode: color, which replaces the base's hue and
          saturation while preserving its luminance. The bundle's pink
          dusk-pastel cloud keeps its highlights, shadows, and shape but
          actually changes color to match the mood. (multiply at 78% only
          darkened the pink — barely shifted hue.) */}
      {cloudStyle && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            WebkitMaskImage: `url(${CLOUD_SILHOUETTE_URL})`,
            maskImage: `url(${CLOUD_SILHOUETTE_URL})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            background: cloudStyle.gradient,
            mixBlendMode: 'color',
            opacity: 0.95,
            transform: 'rotate(-9deg)',  // match the tilt baked into cloud-base.png
            transformOrigin: 'center',
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Blush — soft pink radial dots flanking the face. Positions per
          wispy.json (centers at x=-2%/102%, y=60%). Hayley's per-face
          triage decides whether to show them; the neutral face has
          blush:false intentionally. */}
      {showBlush && (
        <>
          <div style={blushDotStyle('left')} />
          <div style={blushDotStyle('right')} />
        </>
      )}
      {/* face on top of cloud, anchored center, 16% wide */}
      {faceUrl && (
        <img
          src={faceUrl}
          alt=""
          style={{
            position: 'absolute',
            left: '50%',
            top:  '50%',
            transform: 'translate(-50%, -50%)',
            width: '16%',
            height: 'auto',
          }}
        />
      )}
    </div>
  )
}

function blushDotStyle(side) {
  // wispy.json says blush sits at x=-0.02 / 1.02 of the FACE (not the
  // cloud container), with the face being 16% wide centered at 50/50.
  //   left blush x  = 50% - 8% + (-0.02 * 16%)  ≈ 41.7% of cloud
  //   right blush x = 50% + 8% + ( 0.02 * 16%)  ≈ 58.3% of cloud
  // y=0.60 of face puts the dot just below face center (cheek line).
  // Dots are ~7% of cloud — small + soft, not floating blobs.
  const isLeft = side === 'left'
  return {
    position: 'absolute',
    width: '7%',
    height: '7%',
    left: isLeft ? '41.7%' : '58.3%',
    top: '55%',
    transform: 'translate(-50%, -50%)',
    background: 'radial-gradient(circle, rgba(244,140,170,0.85) 0%, rgba(244,140,170,0.45) 50%, transparent 80%)',
    borderRadius: '50%',
    filter: 'blur(1px)',
    pointerEvents: 'none',
  }
}

// Shared keyframes consumed by WispyProvider. Kept stable across the
// v1 → v1.0.0 art rewrite so the provider doesn't need to change.
export const WISPY_KEYFRAMES = `
@keyframes wispyIn {
  from { opacity: 0; transform: translateY(22px) scale(0.85); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes wispyPoof {
  0%   { opacity: 1;   transform: scale(1)    translateY(0);    filter: blur(0px); }
  55%  { opacity: 0.7; transform: scale(1.22) translateY(-8px); filter: blur(0px); }
  100% { opacity: 0;   transform: scale(0.05) translateY(-14px); filter: blur(4px); }
}
@keyframes wispyBob {
  0%, 100% { transform: translateY(0px);  }
  50%      { transform: translateY(-7px); }
}
@keyframes wispyBubbleIn {
  from { opacity: 0; transform: translateY(8px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}
@keyframes wispyHighlight {
  0%, 100% { box-shadow: 0 0 0 0 rgba(180,140,230,0.6), 0 0 0 0 rgba(180,140,230,0.4); }
  50%      { box-shadow: 0 0 0 6px rgba(180,140,230,0.0), 0 0 24px 4px rgba(180,140,230,0.55); }
}
@keyframes wispyHalo {
  0%, 100% { opacity: 0.55; transform: scale(0.92); }
  50%      { opacity: 1;    transform: scale(1.08); }
}
`
