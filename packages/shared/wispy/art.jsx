// Wispy mascot — layered PNG composition.
//
// Cloud rendering exactly mirrors the customer scene's CloudConveyorPuffs
// pipeline so Wispy reads as one of the scene clouds. Three composite
// layers over the silhouette:
//   1. tint  — gradient-painted cloud shape via mask
//   2. shade — bundle's cloud-base.png as photo, multiply blend
//   3. glow  — same photo, screen blend, top-half mask for crown highlight
// All tuned per mood (theme.tintGradient/Shadow/shadeOpacity/...). For
// moods we haven't themed yet, the bundle's cloud-base.png renders alone.
//
// Face is one of 80 expression PNGs (40 dark + 40 light) picked by
// (slot, ink). Legs are a single PNG in the matching ink. Blush is two
// soft pink overlay dots at face cheek positions.

import {
  CLOUD_BASE_URL, CLOUD_SILHOUETTE_URL,
  getFaceUrl, getFaceBlush, getLegsUrl,
} from './faceMeta.js'
import { cloudThemeForMood, DEFAULT_GLOW_MASK } from './cloudPalette.js'

export default function WispyArt({
  slot = 'happy',
  ink  = 'dark',
  mood,
  width  = 140,
  height,
  // ── legacy props (v1) — kept callable so older sites don't break ──
  // eslint-disable-next-line no-unused-vars
  mouthOpen, eyeClosed, leftArmStyle, rightArmStyle, showSparkles,
}) {
  const effectiveSlot = eyeClosed ? 'blink' : slot
  const faceUrl  = getFaceUrl(effectiveSlot, ink)
  const showBlush = getFaceBlush(effectiveSlot)
  const legsUrl  = getLegsUrl(ink)
  const h = height ?? width
  const theme = cloudThemeForMood(mood)

  const cloudLayerBase = {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    transform: 'rotate(-9deg)', transformOrigin: 'center',
    pointerEvents: 'none',
  }
  const silhouetteMask = {
    WebkitMaskImage: `url(${CLOUD_SILHOUETTE_URL})`,
    maskImage: `url(${CLOUD_SILHOUETTE_URL})`,
    WebkitMaskSize: 'contain', maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center', maskPosition: 'center',
  }

  return (
    <div style={{ position: 'relative', width, height: h, pointerEvents: 'none' }}>
      {/* legs — behind the cloud, fade-mask at top so they dissolve into it */}
      <img
        src={legsUrl}
        alt=""
        style={{
          position: 'absolute',
          left: '39%', top: '53%',
          width: '22%', height: 'auto',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, transparent 18%, rgba(0,0,0,0.6) 35%, black 55%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, transparent 18%, rgba(0,0,0,0.6) 35%, black 55%)',
        }}
      />

      {theme ? (
        /* Themed mood: tint + shade + glow layers, same recipe as the
           scene cloud field. */
        <>
          {/* TINT — gradient through the cloud silhouette */}
          <div style={{
            ...cloudLayerBase,
            ...silhouetteMask,
            background: theme.tintGradient,
            filter: theme.tintShadow,
          }} />
          {/* SHADE — multiply blend of cloud photo for shadow detail */}
          <div style={{
            ...cloudLayerBase,
            backgroundImage: `url(${CLOUD_BASE_URL})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            mixBlendMode: 'multiply',
            opacity: theme.shadeOpacity,
            filter: theme.shadeFilter,
          }} />
          {/* GLOW — screen-blend highlight on the crown */}
          <div style={{
            ...cloudLayerBase,
            backgroundImage: `url(${CLOUD_BASE_URL})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            mixBlendMode: 'screen',
            opacity: theme.glowOpacity,
            filter: theme.glowFilter,
            WebkitMaskImage: theme.glowMask || DEFAULT_GLOW_MASK,
            maskImage: theme.glowMask || DEFAULT_GLOW_MASK,
          }} />
        </>
      ) : (
        /* Unthemed mood — fall back to the bundle's pre-shaded PNG. */
        <img
          src={CLOUD_BASE_URL}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      )}

      {/* Blush — soft pink cheek dots when the face wants them */}
      {showBlush && (
        <>
          <div style={blushDotStyle('left')} />
          <div style={blushDotStyle('right')} />
        </>
      )}

      {/* face on top of everything */}
      {faceUrl && (
        <img
          src={faceUrl}
          alt=""
          style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '16%', height: 'auto',
          }}
        />
      )}
    </div>
  )
}

function blushDotStyle(side) {
  // Cheek positions: just below the face, slightly outside its outer
  // edge. Face is 16% wide centered at 50%/50%, so cheeks are ~38% and
  // ~62% horizontally. Y is 58% so they sit on the lower half of the
  // face, where cheeks actually are. Dots are 9% — visible but soft.
  const isLeft = side === 'left'
  return {
    position: 'absolute',
    width: '9%', height: '9%',
    left: isLeft ? '38%' : '62%',
    top: '58%',
    transform: 'translate(-50%, -50%)',
    background:
      'radial-gradient(circle, rgba(244,140,170,0.90) 0%, rgba(244,140,170,0.55) 45%, transparent 75%)',
    borderRadius: '50%',
    filter: 'blur(1.2px)',
    pointerEvents: 'none',
  }
}

// Shared keyframes consumed by WispyProvider.
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
