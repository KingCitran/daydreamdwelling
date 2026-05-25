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

import { CLOUD_BASE_URL, getFaceUrl, getLegsUrl } from './faceMeta.js'

export default function WispyArt({
  slot = 'happy',
  ink  = 'dark',
  width  = 140,
  height,  // optional override; defaults to width (square)
  // ── legacy props from v1 — kept for back-compat, otherwise no-op ──
  // eslint-disable-next-line no-unused-vars
  mouthOpen, eyeClosed, leftArmStyle, rightArmStyle, showSparkles,
}) {
  // Honor the v1 eyeClosed convention so the blink loop in WispyMascot
  // still works without knowing about slots.
  const effectiveSlot = eyeClosed ? 'blink' : slot
  const faceUrl = getFaceUrl(effectiveSlot, ink)
  const legsUrl = getLegsUrl(ink)
  const h = height ?? width

  return (
    <div style={{ position: 'relative', width, height: h, pointerEvents: 'none' }}>
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
      {/* cloud body */}
      <img
        src={CLOUD_BASE_URL}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
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
`
