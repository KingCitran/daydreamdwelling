// Per-mood cloud rendering — copied verbatim from the customer scene's
// CloudConveyorPuffs MOOD_THEMES. We reuse the SAME tint + shade + glow
// layer formulas the scene uses for its cloud field so Wispy doesn't
// just have a flat colored silhouette; she renders with the exact
// pipeline the scene's clouds do and visually belongs in the room.
//
// Layers (composed bottom → top):
//   1. tint   — silhouette as CSS mask + tintGradient background +
//               tintShadow drop-shadow filter
//   2. shade  — cloud-base.png as background + mix-blend-mode: multiply
//               at shadeOpacity + shadeFilter (contrast/brightness tweak)
//   3. glow   — cloud-base.png as background + mix-blend-mode: screen
//               at glowOpacity + glowFilter + glowMask (top-of-cloud
//               gradient mask so highlight only kisses the crown)
//
// Moods without entries here fall back to plain cloud-base.png (the
// unthemed/photographic dusk-pastel default).

export const DEFAULT_GLOW_MASK =
  'linear-gradient(180deg, #fff 0%, #fff 38%, transparent 78%)'

export const MOOD_CLOUD_THEMES = {
  'Dream State': {
    tintGradient: 'linear-gradient(180deg, #ffe4cf 0%, #ffd1c4 18%, #f0b4c8 40%, #c89cd0 62%, #9579c8 85%, #7a5fb8 100%)',
    tintShadow:   'drop-shadow(0 8px 16px rgba(120,80,180,0.30))',
    shadeOpacity: 0.88, shadeFilter: 'contrast(1.45) brightness(1.0)',
    glowOpacity:  0.40, glowFilter:  'brightness(1.4) contrast(0.9)',
  },
  'Golden Hour': {
    tintGradient: 'linear-gradient(180deg, #5a2540 0%, #8e3a4a 15%, #d96a40 38%, #f4a25a 60%, #ffd58a 82%, #fff2c8 100%)',
    tintShadow:   'drop-shadow(0 8px 16px rgba(120,40,30,0.30))',
    shadeOpacity: 0.86, shadeFilter: 'contrast(1.4) brightness(1.0)',
    glowOpacity:  0.55, glowFilter:  'brightness(1.5) contrast(0.85) sepia(0.25) saturate(1.3)',
  },
  'Moonlight': {
    tintGradient: 'linear-gradient(180deg, #e8eef8 0%, #c8d4e8 20%, #8898c0 42%, #4a5888 64%, #1f2a50 86%, #0a1230 100%)',
    tintShadow:   'drop-shadow(0 8px 18px rgba(8,12,28,0.55))',
    shadeOpacity: 0.78, shadeFilter: 'contrast(1.55) brightness(0.92)',
    glowOpacity:  0.28, glowFilter:  'brightness(1.25) contrast(0.9) hue-rotate(200deg) saturate(0.55)',
    glowMask:     'linear-gradient(180deg, #fff 0%, #fff 32%, transparent 70%)',
  },
  'Blush Hour': {
    tintGradient: 'linear-gradient(180deg, #fff5f0 0%, #ffd6e0 18%, #f8a8c4 40%, #e87aa0 62%, #b8487a 85%, #7a2858 100%)',
    tintShadow:   'drop-shadow(0 8px 18px rgba(180,72,122,0.30))',
    shadeOpacity: 0.82, shadeFilter: 'contrast(1.25) brightness(1.05)',
    glowOpacity:  0.48, glowFilter:  'brightness(1.45) contrast(0.85) saturate(1.15)',
  },
  'Coastal Morning': {
    tintGradient: 'linear-gradient(180deg, #6a7a96 0%, #8294ac 20%, #b8b8b8 42%, #d8c4b0 62%, #e8b894 80%, #f0a878 92%, #f4b888 100%)',
    tintShadow:   'drop-shadow(0 -3px 14px rgba(255,180,90,0.30)) drop-shadow(0 8px 14px rgba(40,70,110,0.38))',
    shadeOpacity: 0.62, shadeFilter: 'contrast(1.15) brightness(1.08)',
    glowOpacity:  0.50, glowFilter:  'brightness(1.4) contrast(0.85) sepia(0.22) saturate(1.15) hue-rotate(-4deg)',
    glowMask:     'linear-gradient(180deg, transparent 30%, #fff 70%, #fff 100%)',
  },
  'Greenhouse': {
    tintGradient: 'linear-gradient(180deg, #fffaee 0%, #f8f0d8 15%, #ece6c8 35%, #d6e0b8 60%, #b8c8a0 80%, #8eaf7a 100%)',
    tintShadow:   'drop-shadow(0 -3px 14px rgba(255,210,90,0.32)) drop-shadow(0 8px 14px rgba(120,160,90,0.35))',
    shadeOpacity: 0.65, shadeFilter: 'contrast(1.30) brightness(1.0)',
    glowOpacity:  0.55, glowFilter:  'brightness(1.5) contrast(0.88) sepia(0.35) saturate(1.4)',
    glowMask:     'linear-gradient(180deg, #fff 0%, #fff 32%, transparent 72%)',
  },
  'Neon Nights': {
    tintGradient: 'linear-gradient(172deg, #ff7ae0 0%, #e060d8 10%, #b048d4 22%, #7a3ec0 38%, #4e2ca0 54%, #2e1c70 70%, #161250 84%, #0a0a32 94%, #1a2470 100%)',
    tintShadow:   'drop-shadow(0 -6px 18px rgba(255,80,220,0.65)) drop-shadow(0 8px 22px rgba(80,160,255,0.50))',
    shadeOpacity: 0.75, shadeFilter: 'contrast(1.4) brightness(0.95)',
    glowOpacity:  0.60, glowFilter:  'brightness(1.5) contrast(0.9) saturate(1.7) hue-rotate(280deg)',
    glowMask:     'linear-gradient(180deg, #fff 0%, #fff 30%, transparent 70%)',
  },
  'Vivid Sunset': {
    tintGradient: 'linear-gradient(180deg, #1c2858 0%, #4a3878 20%, #8a3878 36%, #d83078 52%, #ff5a78 66%, #ff7a48 78%, #f59428 87%, #e8902c 94%, #d88838 100%)',
    tintShadow:   'drop-shadow(0 -2px 9px rgba(255,140,90,0.28)) drop-shadow(0 8px 18px rgba(20,28,80,0.45))',
    shadeOpacity: 0.50, shadeFilter: 'contrast(1.3) brightness(1.1)',
    glowOpacity:  0.55, glowFilter:  'brightness(1.4) contrast(0.85) sepia(0.35) saturate(1.4) hue-rotate(-8deg)',
    glowMask:     'linear-gradient(180deg, transparent 35%, #fff 75%, #fff 100%)',
  },
  'Bright Day': {
    tintGradient: 'linear-gradient(180deg, #ffffff 0%, #f0f8ff 15%, #c8dcf0 38%, #88b0d8 60%, #5080b8 82%, #2858a0 100%)',
    tintShadow:   'drop-shadow(0 8px 16px rgba(40,88,160,0.32))',
    shadeOpacity: 0.72, shadeFilter: 'contrast(1.3) brightness(1.05)',
    glowOpacity:  0.55, glowFilter:  'brightness(1.5) contrast(0.9) saturate(0.85)',
  },
}

/** Returns the full theme params for a mood, or null if Wispy should
 * fall back to plain cloud-base.png. */
export function cloudThemeForMood(mood) {
  return MOOD_CLOUD_THEMES[mood] || null
}
