// Raindrop color schemes — gradient tiers for RaindropMobile
// Each tier: { min: voteThreshold, color, glow (nullable), anim (nullable) }

export const COLOR_SCHEMES = {
  // Daylight (Bright Day) — blue sky dominant with scattered white + light grey
  // clouds. Exactly ONE bright yellow tier (the sun) at the rare 25k+ band so
  // only the highest-vote clouds get a sun above them.
  daylight: [
    { min: 100000, color: '#ffffff', glow: 'rgba(255,255,255,0.6)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 25000,  color: '#facc15', glow: 'rgba(250,204,21,0.6)',  anim: 'ddd-shimmer 3s ease-in-out infinite' }, // THE sun (only bright yellow)
    { min: 8000,   color: '#f1f5f9', glow: 'rgba(241,245,249,0.5)', anim: 'ddd-pearl 5s ease-in-out infinite' },   // light grey cloud
    { min: 3000,   color: '#93c5fd', glow: 'rgba(147,197,253,0.45)', anim: 'ddd-shimmer 2.8s ease-in-out infinite' }, // sky blue (peak at typical counts)
    { min: 1000,   color: '#38bdf8', glow: 'rgba(56,189,248,0.4)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' }, // bright sky
    { min: 500,    color: '#e2e8f0', glow: null, anim: null }, // cloud light grey
    { min: 250,    color: '#60a5fa', glow: null, anim: null }, // medium blue
    { min: 100,    color: '#cbd5e1', glow: null, anim: null }, // cloud grey
    { min: 50,     color: '#0ea5e9', glow: null, anim: null }, // azure
    { min: 20,     color: '#94a3b8', glow: null, anim: null }, // storm grey
    { min: 10,     color: '#1e40af', glow: null, anim: null }, // deep blue
    { min: 5,      color: '#1e3a8a', glow: null, anim: null }, // navy
    { min: 0,      color: '#0c1f4d', glow: null, anim: null }, // deep night
  ],
  sunset: [
    { min: 100000, color: '#fef3c7', glow: 'rgba(254,243,199,0.6)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 50000,  color: '#fcd34d', glow: 'rgba(252,211,77,0.5)',  anim: 'ddd-shimmer 3s ease-in-out infinite' },
    { min: 10000,  color: '#fbbf24', glow: 'rgba(251,191,36,0.5)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 5000,   color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 1000,   color: '#f97316', glow: 'rgba(249,115,22,0.4)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 500,    color: '#ef4444', glow: null, anim: null },
    { min: 250,    color: '#f472b6', glow: null, anim: null },
    { min: 100,    color: '#e879f9', glow: null, anim: null },
    { min: 50,     color: '#c084fc', glow: null, anim: null },
    { min: 20,     color: '#a78bfa', glow: null, anim: null },
    { min: 10,     color: '#818cf8', glow: null, anim: null },
    { min: 5,      color: '#6366f1', glow: null, anim: null },
    { min: 0,      color: '#4f46e5', glow: null, anim: null },
  ],
  // Northern — real aurora palette + iconic vivid green streak (#39ff88) brightly
  // glowing at peak, mid-range, and mid-low so the signature aurora green is unmistakable.
  northern: [
    { min: 100000, color: '#39ff88', glow: 'rgba(57,255,136,0.85)', anim: 'ddd-aurora 3s ease-in-out infinite' }, // ICONIC neon green streak
    { min: 50000,  color: '#a0ffd8', glow: 'rgba(160,255,216,0.6)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 10000,  color: '#39ff88', glow: 'rgba(57,255,136,0.7)',  anim: 'ddd-aurora 2.5s ease-in-out infinite' }, // streak echo
    { min: 5000,   color: '#01efac', glow: 'rgba(1,239,172,0.55)',  anim: 'ddd-aurora 3s ease-in-out infinite' },
    { min: 3000,   color: '#39ff88', glow: 'rgba(57,255,136,0.6)',  anim: 'ddd-aurora 2.8s ease-in-out infinite' }, // streak echo
    { min: 1000,   color: '#22d3ee', glow: 'rgba(34,211,238,0.4)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 500,    color: '#01c8ae', glow: null, anim: null },
    { min: 250,    color: '#2023a6', glow: null, anim: null },
    { min: 100,    color: '#524094', glow: null, anim: null },
    { min: 50,     color: '#34d399', glow: null, anim: null },
    { min: 20,     color: '#502a83', glow: null, anim: null },
    { min: 10,     color: '#3b1f70', glow: null, anim: null },
    { min: 5,      color: '#2023a6', glow: null, anim: null },
    { min: 0,      color: '#1a1050', glow: null, anim: null },
  ],
  // Ember — bonfire at sunset cooling into night.
  // Named after the founder's daughter; #ffd361 ("Ember") is the signature tier.
  // White spark at peak + a few white "flickering" sparks scattered through the
  // mid/lower tiers (anim: ddd-flicker) like real coals throwing sparks.
  ember: [
    { min: 100000, color: '#ffffff', glow: 'rgba(255,255,255,0.7)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 25000,  color: '#fdf3d8', glow: 'rgba(253,243,216,0.6)', anim: 'ddd-pearl 5s ease-in-out infinite' },
    { min: 8000,   color: '#fff0a8', glow: 'rgba(255,240,168,0.55)', anim: 'ddd-shimmer 3.2s ease-in-out infinite' },
    { min: 3000,   color: '#ffd361', glow: 'rgba(255,211,97,0.55)', anim: 'ddd-shimmer 3s ease-in-out infinite' },
    { min: 1000,   color: '#fdb81e', glow: 'rgba(253,184,30,0.5)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 500,    color: '#ffffff', glow: 'rgba(255,255,255,0.9)', anim: 'ddd-flicker 1.8s ease-in-out infinite' }, // white spark
    { min: 250,    color: '#fe9b22', glow: 'rgba(254,155,34,0.45)', anim: 'ddd-shimmer 2.2s ease-in-out infinite' },
    { min: 100,    color: '#ffffff', glow: 'rgba(255,255,255,0.9)', anim: 'ddd-flicker 2.4s ease-in-out infinite' }, // white spark
    { min: 50,     color: '#ff3a1f', glow: 'rgba(255,58,31,0.85)', anim: 'ddd-coal-cool 5s ease-in-out infinite' }, // RED coal — cools to pale blue and back
    { min: 20,     color: '#ea580c', glow: null, anim: null },
    { min: 10,     color: '#ffffff', glow: 'rgba(255,255,255,0.9)', anim: 'ddd-flicker 2.1s ease-in-out infinite' }, // white spark
    { min: 5,      color: '#9f1a18', glow: null, anim: null },
    { min: 0,      color: '#2a1810', glow: null, anim: null }, // warm ash shadow (was cold charcoal)
  ],
  // Vivid Sunset — striking gold/yellow sky burning into red, magenta, deep night.
  // The full sunset spectrum reflected on still water.
  vividsunset: [
    { min: 100000, color: '#fff5d4', glow: 'rgba(255,245,212,0.6)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 25000,  color: '#ffe066', glow: 'rgba(255,224,102,0.6)', anim: 'ddd-shimmer 3s ease-in-out infinite' },
    { min: 8000,   color: '#ffd361', glow: 'rgba(255,211,97,0.6)',  anim: 'ddd-shimmer 2.8s ease-in-out infinite' },
    { min: 3000,   color: '#ffaa3d', glow: 'rgba(255,170,61,0.55)', anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 1000,   color: '#ff7a3a', glow: 'rgba(255,122,58,0.5)',  anim: 'ddd-shimmer 2.2s ease-in-out infinite' },
    { min: 500,    color: '#d62713', glow: 'rgba(214,39,19,0.4)',   anim: null }, // sunset red
    { min: 250,    color: '#ed6ab8', glow: null, anim: null }, // magenta cloud
    { min: 100,    color: '#b53da1', glow: null, anim: null }, // deep magenta
    { min: 50,     color: '#642aa5', glow: null, anim: null }, // twilight purple
    { min: 20,     color: '#3d3772', glow: null, anim: null }, // dusky violet
    { min: 10,     color: '#2a0a56', glow: null, anim: null }, // midnight purple
    { min: 5,      color: '#140655', glow: null, anim: null }, // deep indigo
    { min: 0,      color: '#010101', glow: null, anim: null }, // pure night
  ],
  // Dream State — PURPLE-DOMINANT pastels. No whites or pale pinks at the top —
  // peak is a soft pastel purple. Pinks/blues/yellow as scattered low-tier accents.
  dreamcloud: [
    { min: 100000, color: '#d8b4fe', glow: 'rgba(216,180,254,0.5)', anim: 'ddd-pearl 7s ease-in-out infinite' }, // pastel violet (peak)
    { min: 25000,  color: '#c4b5fd', glow: null, anim: null }, // pastel purple
    { min: 8000,   color: '#a78bfa', glow: null, anim: null }, // soft purple
    { min: 3000,   color: '#e9d5ff', glow: null, anim: null }, // pastel lavender
    { min: 1000,   color: '#9f7aea', glow: null, anim: null }, // muted violet
    { min: 500,    color: '#fbcfe8', glow: null, anim: null }, // pastel pink accent
    { min: 250,    color: '#b794f4', glow: null, anim: null }, // dusty purple
    { min: 100,    color: '#ddd6fe', glow: null, anim: null }, // pale lavender
    { min: 50,     color: '#bfdbfe', glow: null, anim: null }, // pastel blue accent
    { min: 20,     color: '#8b5cf6', glow: null, anim: null }, // deeper purple
    { min: 10,     color: '#fef08a', glow: null, anim: null }, // pastel yellow accent
    { min: 5,      color: '#7c3aed', glow: null, anim: null }, // royal purple
    { min: 0,      color: '#5b21b6', glow: null, anim: null }, // deep dream purple
  ],
  // Golden Hour — pure yellow→orange ladder, no pinks or corals breaking the warmth.
  goldenhour: [
    { min: 100000, color: '#fff0e0', glow: 'rgba(255,240,224,0.6)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 25000,  color: '#fde68a', glow: 'rgba(253,230,138,0.55)', anim: 'ddd-shimmer 3.2s ease-in-out infinite' },
    { min: 8000,   color: '#fbbf24', glow: 'rgba(251,191,36,0.55)', anim: 'ddd-shimmer 3s ease-in-out infinite' },
    { min: 3000,   color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 1000,   color: '#eab308', glow: 'rgba(234,179,8,0.4)',   anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 500,    color: '#d97706', glow: null, anim: null }, // burnt orange
    { min: 250,    color: '#ca8a04', glow: null, anim: null }, // dark honey
    { min: 100,    color: '#b45309', glow: null, anim: null }, // amber
    { min: 50,     color: '#a16207', glow: null, anim: null }, // dark amber
    { min: 20,     color: '#854d0e', glow: null, anim: null }, // bronze
    { min: 10,     color: '#713f12', glow: null, anim: null }, // dark bronze
    { min: 5,      color: '#9a3412', glow: null, anim: null }, // burnt sienna
    { min: 0,      color: '#7c2d12', glow: null, anim: null }, // shadow rust
  ],
  // Moonlight — bright moon at peak, then DARKER mid/low tiers (deep navy, slate,
  // ink) for night-sky contrast. Glow on the dark tiers keeps them visible
  // against any background.
  moonlight: [
    { min: 100000, color: '#ffffff', glow: 'rgba(255,255,255,0.9)', anim: 'ddd-silver 4s ease-in-out infinite' }, // full moon
    { min: 50000,  color: '#e0e7ff', glow: 'rgba(224,231,255,0.65)', anim: 'ddd-silver 3.5s ease-in-out infinite' }, // moon halo
    { min: 25000,  color: '#475569', glow: 'rgba(180,200,240,0.55)', anim: 'ddd-silver 3s ease-in-out infinite' }, // DARK slate, bright glow
    { min: 10000,  color: '#334155', glow: 'rgba(180,200,240,0.5)', anim: 'ddd-silver 2.8s ease-in-out infinite' }, // DARKER slate
    { min: 5000,   color: '#1e293b', glow: 'rgba(160,180,240,0.5)', anim: 'ddd-silver 2.5s ease-in-out infinite' }, // night slate w/ glow
    { min: 1000,   color: '#312e81', glow: 'rgba(180,170,240,0.45)', anim: 'ddd-shimmer 2.8s ease-in-out infinite' }, // ink violet w/ glow
    { min: 500,    color: '#0f172a', glow: 'rgba(160,180,220,0.4)', anim: 'ddd-silver 3s ease-in-out infinite' }, // deep navy w/ glow
    { min: 250,    color: '#1e1b4b', glow: 'rgba(170,160,220,0.35)', anim: null }, // dark indigo w/ glow
    { min: 100,    color: '#64748b', glow: null, anim: null }, // dim silver
    { min: 50,     color: '#0c0a2e', glow: null, anim: null }, // deepest indigo
    { min: 20,     color: '#475569', glow: null, anim: null }, // slate echo
    { min: 10,     color: '#080720', glow: null, anim: null }, // black-blue
    { min: 5,      color: '#1e293b', glow: null, anim: null }, // night slate echo
    { min: 0,      color: '#040312', glow: null, anim: null }, // pitch midnight
  ],
  // Candlelit Cozy Evening — pure honey dominant, but slightly less of the
  // brightest yellow tiers. Brights toned down, glow opacities reduced.
  candlelight: [
    { min: 100000, color: '#fde68a', glow: 'rgba(253,230,138,0.55)', anim: 'ddd-shimmer 1.8s ease-in-out infinite' }, // pale yellow-orange flame
    { min: 50000,  color: '#fcd34d', glow: 'rgba(252,211,77,0.5)',  anim: 'ddd-shimmer 1.7s ease-in-out infinite' }, // candle gold (toned down from bright honey)
    { min: 25000,  color: '#fbbf24', glow: 'rgba(251,191,36,0.5)',  anim: 'ddd-shimmer 1.6s ease-in-out infinite' }, // honey amber
    { min: 10000,  color: '#f59e0b', glow: 'rgba(245,158,11,0.45)', anim: 'ddd-shimmer 1.5s ease-in-out infinite' }, // burning honey
    { min: 5000,   color: '#eab308', glow: 'rgba(234,179,8,0.4)',   anim: 'ddd-shimmer 1.5s ease-in-out infinite' }, // honey amber (was bright pale)
    { min: 1000,   color: '#d97706', glow: 'rgba(217,119,6,0.4)',   anim: 'ddd-shimmer 1.8s ease-in-out infinite' }, // dark honey
    { min: 500,    color: '#ca8a04', glow: 'rgba(202,138,4,0.35)',  anim: 'ddd-shimmer 2s ease-in-out infinite' }, // deep honey
    { min: 250,    color: '#eab308', glow: null, anim: null }, // honey echo
    { min: 100,    color: '#a16207', glow: null, anim: null }, // dark honey
    { min: 50,     color: '#fbbf24', glow: null, anim: null }, // honey echo (single bright accent)
    { min: 20,     color: '#854d0e', glow: null, anim: null }, // amber bronze
    { min: 10,     color: '#78350f', glow: null, anim: null }, // dark bronze
    { min: 5,      color: '#3a1a06', glow: null, anim: null }, // candle base
    { min: 0,      color: '#1a0c04', glow: null, anim: null }, // deep cozy dark
  ],
  // Neon Nights — half the cluster cycles ROYGBIV in tier-groups (drops within
  // a tier sync to each other so the color shift is visible as coordinated group
  // movement). Other tiers shimmer in vivid blacklight purples for a UV-reactive feel.
  neon: [
    { min: 100000, color: '#ff0000', glow: 'rgba(255,255,255,0.9)', anim: 'ddd-roygbiv 18s linear infinite' },  // ROYGBIV
    { min: 50000,  color: '#ff0000', glow: 'rgba(255,255,255,0.9)', anim: 'ddd-roygbiv 18s linear infinite' },  // ROYGBIV (synced w/ peak)
    { min: 25000,  color: '#a855f7', glow: 'rgba(168,85,247,0.85)', anim: 'ddd-shimmer 3.5s ease-in-out infinite' }, // blacklight purple
    { min: 10000,  color: '#ff0000', glow: 'rgba(255,255,255,0.85)', anim: 'ddd-roygbiv 18s linear infinite' }, // ROYGBIV (same group)
    { min: 5000,   color: '#d946ef', glow: 'rgba(217,70,239,0.85)', anim: 'ddd-shimmer 3.2s ease-in-out infinite' }, // electric magenta
    { min: 1000,   color: '#ff0000', glow: 'rgba(255,255,255,0.8)', anim: 'ddd-roygbiv 18s linear infinite' },  // ROYGBIV (same group)
    { min: 500,    color: '#c026d3', glow: 'rgba(192,38,211,0.8)',  anim: 'ddd-shimmer 3.5s ease-in-out infinite' }, // vivid purple-pink
    { min: 250,    color: '#ff0000', glow: 'rgba(255,255,255,0.75)', anim: 'ddd-roygbiv 18s linear infinite' }, // ROYGBIV (same group)
    { min: 100,    color: '#a855f7', glow: 'rgba(168,85,247,0.7)',  anim: 'ddd-shimmer 4s ease-in-out infinite' }, // blacklight purple
    { min: 50,     color: '#ff0000', glow: 'rgba(255,255,255,0.7)', anim: 'ddd-roygbiv 18s linear infinite' },  // ROYGBIV (same group)
    { min: 20,     color: '#7c3aed', glow: 'rgba(124,58,237,0.65)', anim: 'ddd-shimmer 4.5s ease-in-out infinite' }, // deep blacklight
    { min: 10,     color: '#581c87', glow: null, anim: null }, // wine purple
    { min: 5,      color: '#3b0764', glow: null, anim: null }, // deepest purple
    { min: 0,      color: '#1e1b4b', glow: null, anim: null }, // night shadow
  ],
  // Greenhouse — pale yellows pushed to the LAST tiers (min:10, min:5) so they
  // render at the extreme edges of the cluster, closest to the cloud body.
  greenhouse: [
    { min: 100000, color: '#ffffff', glow: 'rgba(255,255,255,0.6)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 25000,  color: '#86efac', glow: 'rgba(134,239,172,0.6)', anim: 'ddd-shimmer 3s ease-in-out infinite' }, // bright young leaf
    { min: 8000,   color: '#22c55e', glow: 'rgba(34,197,94,0.5)',  anim: 'ddd-shimmer 2.8s ease-in-out infinite' }, // emerald
    { min: 3000,   color: '#4ade80', glow: 'rgba(74,222,128,0.45)', anim: 'ddd-aurora 3s ease-in-out infinite' }, // peak typical-count
    { min: 1000,   color: '#15803d', glow: null, anim: null }, // forest green
    { min: 500,    color: '#16a34a', glow: null, anim: null }, // deep emerald
    { min: 250,    color: '#84cc16', glow: null, anim: null }, // spring green
    { min: 100,    color: '#22c55e', glow: null, anim: null }, // emerald echo
    { min: 50,     color: '#ec4899', glow: null, anim: null }, // rose flower
    { min: 20,     color: '#a855f7', glow: null, anim: null }, // violet flower
    { min: 10,     color: '#fef3c7', glow: 'rgba(254,243,199,0.5)', anim: 'ddd-shimmer 2.8s ease-in-out infinite' }, // pale lemon (cloud-edge)
    { min: 5,      color: '#fef08a', glow: 'rgba(254,240,138,0.45)', anim: 'ddd-shimmer 3.4s ease-in-out infinite' }, // pale lemon (cloud-edge)
    { min: 0,      color: '#166534', glow: null, anim: null }, // forest shadow
  ],
  // Cottagecore Dawn — pink-dominant palette top to bottom. Brighter, more
  // saturated rose/pink throughout instead of dusty mauves.
  cottagedawn: [
    { min: 100000, color: '#ffffff', glow: 'rgba(255,255,255,0.65)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 50000,  color: '#fce7f3', glow: 'rgba(252,231,243,0.6)', anim: 'ddd-pearl 5s ease-in-out infinite' }, // pale pink mist
    { min: 25000,  color: '#fbcfe8', glow: 'rgba(251,207,232,0.55)', anim: 'ddd-shimmer 3s ease-in-out infinite' }, // soft pink
    { min: 10000,  color: '#f9a8d4', glow: 'rgba(249,168,212,0.5)', anim: 'ddd-shimmer 2.8s ease-in-out infinite' }, // bright rose
    { min: 5000,   color: '#f1b2a9', glow: 'rgba(241,178,169,0.45)', anim: 'ddd-shimmer 2.5s ease-in-out infinite' }, // peachy pink
    { min: 1000,   color: '#ec4899', glow: 'rgba(236,72,153,0.4)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' }, // hot pink
    { min: 500,    color: '#f472b6', glow: null, anim: null }, // bright candy pink
    { min: 250,    color: '#e8a0a0', glow: null, anim: null }, // dusty rose
    { min: 100,    color: '#db2777', glow: null, anim: null }, // deep pink
    { min: 50,     color: '#d4a0a0', glow: null, anim: null }, // pale rose
    { min: 20,     color: '#be185d', glow: null, anim: null }, // wine pink
    { min: 10,     color: '#9c8399', glow: null, anim: null }, // mauve (palette accent)
    { min: 5,      color: '#831843', glow: null, anim: null }, // dark wine
    { min: 0,      color: '#4a1d3a', glow: null, anim: null }, // deep cottage shadow
  ],
  // Coastal Morning — sand pushed even closer to peak (min:50000, 25000) so it
  // renders at the central/bottom of the cluster — the beach line beneath the
  // bright sky/sea foam. Sky/coral/sun shifted to mid tiers.
  coastal: [
    { min: 100000, color: '#ffffff', glow: 'rgba(255,255,255,0.65)', anim: 'ddd-pearl 6s ease-in-out infinite' }, // pure white sea foam
    { min: 50000,  color: '#e8d4b0', glow: 'rgba(232,212,176,0.6)', anim: 'ddd-shimmer 3s ease-in-out infinite' }, // SAND (central bottom)
    { min: 25000,  color: '#d4b890', glow: 'rgba(212,184,144,0.55)', anim: 'ddd-shimmer 2.8s ease-in-out infinite' }, // wet sand (central bottom)
    { min: 10000,  color: '#fff5ee', glow: 'rgba(255,245,238,0.5)', anim: 'ddd-pearl 5s ease-in-out infinite' }, // warm sea cream
    { min: 5000,   color: '#ffcba4', glow: 'rgba(255,203,164,0.45)', anim: 'ddd-shimmer 2.5s ease-in-out infinite' }, // peach sky
    { min: 1000,   color: '#ff9a76', glow: 'rgba(255,154,118,0.45)', anim: 'ddd-shimmer 2.5s ease-in-out infinite' }, // coral sky
    { min: 500,    color: '#fbbf24', glow: null, anim: null }, // gold sun
    { min: 250,    color: '#38bdf8', glow: null, anim: null }, // shallow water
    { min: 100,    color: '#f97316', glow: null, anim: null }, // sunset orange
    { min: 50,     color: '#0ea5e9', glow: null, anim: null }, // ocean
    { min: 20,     color: '#a87f53', glow: null, anim: null }, // dark sand accent
    { min: 10,     color: '#0369a1', glow: null, anim: null }, // deep ocean
    { min: 5,      color: '#0c4a6e', glow: null, anim: null }, // ocean shadow
    { min: 0,      color: '#082f49', glow: null, anim: null }, // abyss
  ],
  // Dark Academia — FOREST GREENS dominate (6 green tiers), with ivory + pale
  // honey only at the very top, browns rounding out the bottom.
  academia: [
    { min: 100000, color: '#e8dec0', glow: 'rgba(232,222,192,0.5)', anim: 'ddd-pearl 6s ease-in-out infinite' }, // soft aged ivory (toned down)
    { min: 50000,  color: '#d4c8a8', glow: 'rgba(212,200,168,0.45)', anim: 'ddd-shimmer 3s ease-in-out infinite' }, // warm parchment ivory
    { min: 25000,  color: '#1f4d2e', glow: 'rgba(31,77,46,0.6)',    anim: 'ddd-shimmer 2.8s ease-in-out infinite' }, // forest green (deep)
    { min: 10000,  color: '#4a5d3f', glow: 'rgba(74,93,63,0.55)',   anim: 'ddd-shimmer 2.6s ease-in-out infinite' }, // muted military green
    { min: 5000,   color: '#15803d', glow: 'rgba(21,128,61,0.55)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' }, // forest green (vibrant)
    { min: 1000,   color: '#3d4f33', glow: null, anim: null }, // deep military green
    { min: 500,    color: '#65733d', glow: null, anim: null }, // olive green
    { min: 250,    color: '#14532d', glow: null, anim: null }, // dark forest
    { min: 100,    color: '#5b6b48', glow: null, anim: null }, // military green echo
    { min: 50,     color: '#8b4513', glow: null, anim: null }, // brown
    { min: 20,     color: '#5a3318', glow: null, anim: null }, // walnut brown
    { min: 10,     color: '#3a2410', glow: null, anim: null }, // dark brown
    { min: 5,      color: '#1a0f08', glow: null, anim: null }, // brown shadow
    { min: 0,      color: '#0a0604', glow: null, anim: null }, // pure brown ink
  ],
  // Studio / Studio Dark — clean neutral with subtle cool tint
  studio: [
    { min: 100000, color: '#ffffff', glow: 'rgba(255,255,255,0.5)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 50000,  color: '#e2e8f0', glow: 'rgba(226,232,240,0.4)', anim: 'ddd-silver 3s ease-in-out infinite' },
    { min: 10000,  color: '#cbd5e1', glow: 'rgba(203,213,225,0.4)', anim: 'ddd-silver 2.5s ease-in-out infinite' },
    { min: 5000,   color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 1000,   color: '#64748b', glow: 'rgba(100,116,139,0.3)', anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 500,    color: '#475569', glow: null, anim: null },
    { min: 250,    color: '#334155', glow: null, anim: null },
    { min: 100,    color: '#1e293b', glow: null, anim: null },
    { min: 50,     color: '#0f172a', glow: null, anim: null },
    { min: 20,     color: '#64748b', glow: null, anim: null },
    { min: 10,     color: '#475569', glow: null, anim: null },
    { min: 5,      color: '#334155', glow: null, anim: null },
    { min: 0,      color: '#1e293b', glow: null, anim: null },
  ],
}

// Map room mood names to raindrop color schemes
export const MOOD_COLOR_SCHEMES = {
  'Golden Hour':           'goldenhour',
  'Bright Day':            'daylight',
  'Vivid Sunset':          'vividsunset',
  "Ember's Sunrise":                 'ember',
  'Candlelit Cozy Evening':'candlelight',
  'Moonlight':             'moonlight',
  'Northern Lights':       'northern',
  'Dark Academia':         'academia',
  'Cottagecore Dawn':      'cottagedawn',
  'Coastal Morning':       'coastal',
  'Dream State':           'dreamcloud',
  'Neon Nights':           'neon',
  'Greenhouse':            'greenhouse',
  'Studio':                'studio',
  'Studio Dark':           'studio',
}
