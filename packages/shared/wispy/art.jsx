// Wispy mascot — faithful port of the bundle's picker/wispy.jsx
// compositor. Source of truth:
//   D:\Hayley\DaydreamDwelling\wispy-handoff-incoming\wispy-handoff\picker\wispy.jsx
//
// Frame layout: width × (width * 0.95). Cloud body occupies top 72% of
// the frame; legs hang into the remaining 28%.
//
// Body sub-box layers (bottom → top), all silhouette-masked except aura:
//   1. drop shadow (silhouette + dark fill, blurred, offset down)
//   2. body fill (silhouette + 4-stop linear gradient from mood recipe)
//   3. top sheen (silhouette + radial white, screen blend)
//   4. underbelly shade (silhouette + radial purple, multiply blend)
//
// Face wrapper is positioned at the cloud body's anchor (50/50), sized
// to 16% of cloud width with aspect 1.8:1. Counter-rotated against the
// cloud's -9° tilt so the face stays level.
//
// Inside the face wrapper (sized relative to it, NOT the cloud body):
//   - blush: two ellipses, 34% × (34/1.5)% of face wrapper, at x=-2%/102%
//            y=60%, multiply blend with mood-blush pink. Skipped when
//            the active face is non-blushable (e.g. neutral, surprised).
//   - face PNG: used as CSS mask, painted with the mood recipe's ink
//            color via background-color (so a single face PNG set works
//            across all moods, no need for separate light/dark sets).
//
// Legs: separate PNG below the body sub-box, top-fade mask so they
// dissolve into the cloud silhouette. Tinted via background-color: ink.
//
// Old prop names (mouthOpen, eyeClosed, leftArmStyle, rightArmStyle,
// showSparkles) are accepted but ignored, except eyeClosed which still
// maps to the 'blink' slot so the blink loop in WispyMascot keeps
// working.

import {
  CLOUD_SILHOUETTE_URL, LEGS_URL,
  getFaceMaskUrl, isFaceBlushable,
} from './faceMeta.js'
import { recipeForMood } from './cloudPalette.js'

// Cloud body geometry — values come from wispy.json. anchorX/Y is where
// the face's center lands inside the cloud; scale is the face's width as
// a percentage of the cloud body width; rotate is the baked-in tilt.
const BODY = { anchorX: 50, anchorY: 50, scale: 16, rotate: -9 }

// Slots that should blink visibly when the random blink loop fires.
// Faces outside this set already have closed/half-closed eyes baked in
// (sleepy, sad, etc.); swapping them to the happy-blink frame mid-state
// produces a jarring face-change instead of a true blink.
const BLINKING_SLOTS = new Set([
  'happy', 'neutral', 'talking-1', 'talking-2', 'wink', 'laughing',
  'mischievous', 'smug', 'proud', 'giggle', 'love', 'starstruck',
  'big-surprise', 'glasses', 'surprised', 'angry', 'determined',
  'how-dare-you', 'thinking', 'curious', 'shy',
])

const BODY_BOX_FRAC = 0.72         // cloud body occupies the top 72% of the frame
const FRAME_ASPECT  = 0.95         // frame height as a multiple of width

const SILHOUETTE_MASK = {
  WebkitMaskImage: `url(${CLOUD_SILHOUETTE_URL})`,
  maskImage: `url(${CLOUD_SILHOUETTE_URL})`,
  WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center', maskPosition: 'center',
  WebkitMaskSize: 'contain', maskSize: 'contain',
}

export default function WispyArt({
  slot   = 'happy',
  mood,                  // mood key drives the recipe; null → DEFAULT_RECIPE
  width  = 280,
  inkOverride,           // optional override of the mood-recipe ink color
  // legacy props — accepted for back-compat, mostly no-op
  // eslint-disable-next-line no-unused-vars
  ink, mouthOpen, leftArmStyle, rightArmStyle, showSparkles, height,
  eyeClosed,
}) {
  // Only blink for slots whose underlying face actually has open eyes —
  // otherwise swapping to the happy-blink frame mid-state looks like a
  // jarring face change instead of a blink.
  const shouldBlink = eyeClosed && BLINKING_SLOTS.has(slot)
  const effectiveSlot = shouldBlink ? 'blink' : slot
  const faceUrl   = getFaceMaskUrl(effectiveSlot)
  const blushable = isFaceBlushable(effectiveSlot)

  const recipe = recipeForMood(mood)
  const inkColor = inkOverride || recipe.ink
  const gradient = recipe.gradient

  const W = width
  const H = Math.round(W * FRAME_ASPECT)
  const bodyBoxH = Math.round(W * BODY_BOX_FRAC)

  const faceWPct = BODY.scale  // 16

  return (
    <div style={{ position: 'relative', width: W, height: H, pointerEvents: 'none' }}>
      {/* Legs — rendered BEFORE the body so the top of the legs PNG sits
          behind the cloud silhouette and looks dissolved into it. */}
      <Legs W={W} bodyBoxH={bodyBoxH} ink={inkColor} />

      {/* Cloud body sub-box — rotated as a unit so the face stays glued
          to the cloud regardless of tilt. */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: W, height: bodyBoxH,
        transform: `rotate(${BODY.rotate}deg)`,
        transformOrigin: '50% 55%',
      }}>
        {/* Drop shadow — silhouette in dark, blurred, offset down */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(80, 60, 110, 0.35)',
          filter: `blur(${Math.max(6, W * 0.022)}px)`,
          transform: `translateY(${W * 0.022}px)`,
          ...SILHOUETTE_MASK,
        }} />

        {/* Body fill — mood gradient through the silhouette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: gradient,
          ...SILHOUETTE_MASK,
        }} />

        {/* Top sheen — radial white at the crown, screen blend */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 55% 35% at 50% 22%, rgba(255,255,255,0.55) 0%, transparent 60%)',
          mixBlendMode: 'screen',
          ...SILHOUETTE_MASK,
        }} />

        {/* Underbelly shade — radial purple-grey at the bottom, multiply blend */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 65% 28% at 50% 88%, rgba(120,90,150,0.18) 0%, transparent 70%)',
          mixBlendMode: 'multiply',
          ...SILHOUETTE_MASK,
        }} />

        {/* Face wrapper — counter-rotated so the face stays level. */}
        <div style={{
          position: 'absolute',
          left: `${BODY.anchorX}%`, top: `${BODY.anchorY}%`,
          width: `${faceWPct}%`,
          aspectRatio: '1.8 / 1',
          transform: `translate(-50%, -50%) rotate(${-BODY.rotate}deg)`,
          pointerEvents: 'none',
        }}>
          {blushable && (
            <>
              <BlushDot side="L" />
              <BlushDot side="R" />
            </>
          )}
          {faceUrl && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundColor: inkColor,
              WebkitMaskImage: `url(${faceUrl})`,
              maskImage: `url(${faceUrl})`,
              WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center', maskPosition: 'center',
              WebkitMaskSize: 'contain', maskSize: 'contain',
              opacity: 0.92,
              pointerEvents: 'none',
            }} />
          )}
        </div>
      </div>
    </div>
  )
}

function BlushDot({ side }) {
  const left = side === 'L' ? -2 : 102
  return (
    <div style={{
      position: 'absolute',
      left: `${left}%`, top: '60%',
      width: '34%', aspectRatio: '1.5 / 1',
      transform: 'translate(-50%, -50%)',
      background:
        'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(244,140,170,0.85) 0%, rgba(244,140,170,0.45) 50%, transparent 80%)',
      mixBlendMode: 'multiply',
      filter: 'blur(0.5px)',
      pointerEvents: 'none',
    }} />
  )
}

function Legs({ W, bodyBoxH, ink }) {
  const legW = W * 0.22
  const legH = legW * (212 / 264)
  // Two-layer mask: top-fade gradient + the legs PNG silhouette,
  // composited with mask-composite: intersect so the legs only show
  // where BOTH masks pass — i.e. the legs shape, fading at the top.
  const fadeMask = `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.0) 18%, rgba(0,0,0,0.6) 35%, black 55%)`
  return (
    <div style={{
      position: 'absolute',
      left: `${(W - legW) / 2}px`,
      top:  `${bodyBoxH * 0.75 - legH * 0.5}px`,
      width:  legW,
      height: legH,
      backgroundColor: ink,
      WebkitMaskImage: `${fadeMask}, url(${LEGS_URL})`,
      maskImage:        `${fadeMask}, url(${LEGS_URL})`,
      WebkitMaskRepeat: 'no-repeat, no-repeat',
      maskRepeat:        'no-repeat, no-repeat',
      WebkitMaskSize:    '100% 100%, contain',
      maskSize:          '100% 100%, contain',
      WebkitMaskPosition:'center, center',
      maskPosition:      'center, center',
      WebkitMaskComposite: 'source-in',
      maskComposite: 'intersect',
      pointerEvents: 'none',
    }} />
  )
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
