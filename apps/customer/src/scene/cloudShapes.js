// Cloud-shape Easter-egg sprites. Rare-spawn clouds (~1.5% probability) shaped
// like castles, teddy bears, sailboats, etc. that drift through the cloud
// field as a "look, a cloud animal!" delight moment.
//
// PNG files live in `apps/customer/public/clouds-shapes/`. Each entry below
// references a file there. The `moods` array limits which moods this shape
// can spawn in — use '*' (or omit) for any-mood shapes.
//
// To add a new shape:
//   1. Drop the PNG into /public/clouds-shapes/
//   2. Add an entry below with id / filename / label / moods
//   3. (Optional) Tune SHAPE_SPAWN_RATE if you want more or fewer easter eggs

export const SHAPE_SPAWN_RATE = 0.015  // 1.5% of cloud spawns are a shape

// Each shape: { id, filename, label, moods? }
// 70 PNGs available in /clouds-shapes/. Mood arrays decide where each can spawn —
// '*' or omitted means any mood. Edit/extend freely.
export const CLOUD_SHAPES = [
  // Romantic — Blush Hour + Dream State
  { id: 'heart-1',     filename: 'Heart 1.png',     label: 'Heart',         moods: ['Blush Hour', 'Dream State'] },
  { id: 'heart-2',     filename: 'Heart 5.png',     label: 'Heart',         moods: ['Blush Hour'] },
  { id: 'love',        filename: 'Love.png',        label: 'Love',          moods: ['Blush Hour'] },
  { id: 'cupid-1',     filename: 'Cupid 1.png',     label: 'Cupid',         moods: ['Blush Hour'] },
  { id: 'ring',        filename: 'Ring.png',        label: 'Ring',          moods: ['Blush Hour'] },

  // Celestial / night — Moonlight + Dream State
  { id: 'angel-1',     filename: 'Angel 1.png',     label: 'Angel',         moods: ['Moonlight', 'Dream State'] },
  { id: 'angel-2',     filename: 'Angel 2.png',     label: 'Angel',         moods: ['Dream State'] },
  { id: 'moon',        filename: 'Moon.png',        label: 'Moon',          moods: ['Moonlight'] },
  { id: 'star',        filename: 'Star.png',        label: 'Star',          moods: ['Moonlight', 'Dream State', 'Vivid Sunset'] },
  { id: 'crown',       filename: 'Crown.png',       label: 'Crown',         moods: ['Moonlight', 'Dream State'] },
  { id: 'cat-1',       filename: 'Cat 1.png',       label: 'Cat',           moods: ['Moonlight'] },

  // Fantasy — Dream State + Vivid Sunset
  { id: 'unicorn-1',   filename: 'Unicorn 1.png',   label: 'Unicorn',       moods: ['Dream State'] },
  { id: 'unicorn-2',   filename: 'Unicorn 3.png',   label: 'Unicorn',       moods: ['Dream State', 'Blush Hour'] },
  { id: 'castle-1',    filename: 'Castle 1.png',    label: 'Castle',        moods: ['Dream State', 'Moonlight'] },
  { id: 'castle-2',    filename: 'Castle 2.png',    label: 'Castle',        moods: ['Vivid Sunset'] },
  { id: 'dinosaur-1',  filename: 'Dinosaur 1.png',  label: 'Dinosaur',      moods: ['Vivid Sunset'] },
  { id: 'carriage-1',  filename: 'Carriage 1.png',  label: 'Carriage',      moods: ['Dream State', 'Vivid Sunset'] },

  // Coastal / sky travel — Coastal Morning + Bright Day
  { id: 'boat',        filename: 'Boat.png',        label: 'Sailboat',      moods: ['Coastal Morning'] },
  { id: 'dolphin',     filename: 'Dolphin.png',     label: 'Dolphin',       moods: ['Coastal Morning'] },
  { id: 'whale-1',     filename: 'Whale 1.png',     label: 'Whale',         moods: ['Coastal Morning'] },
  { id: 'butterfly-1', filename: 'Butterfly 1.png', label: 'Butterfly',     moods: ['Coastal Morning', 'Greenhouse'] },
  { id: 'butterfly-2', filename: 'Butterfly 2.png', label: 'Butterfly',     moods: ['Greenhouse', 'Blush Hour'] },
  { id: 'pigeon-1',    filename: 'Pigeon 1.png',    label: 'Bird',          moods: ['Coastal Morning', 'Greenhouse'] },
  { id: 'balloon',     filename: 'Balloon.png',     label: 'Hot Air Balloon', moods: ['Coastal Morning'] },
  { id: 'paper-plane', filename: 'Paper airplane.png', label: 'Paper Plane', moods: ['*'] },
  { id: 'plane',       filename: 'Plane.png',       label: 'Plane',         moods: ['Coastal Morning'] },

  // Greenhouse — garden creatures
  { id: 'rabbit-1',    filename: 'Rabbit 1.png',    label: 'Rabbit',        moods: ['Greenhouse', 'Blush Hour'] },
  { id: 'bear-1',      filename: 'Bear 1.png',      label: 'Bear',          moods: ['Greenhouse'] },

  // Neon Nights — futuristic / energetic
  { id: 'rocket',      filename: 'Rocket.png',      label: 'Rocket',        moods: ['Neon Nights'] },
  { id: 'car',         filename: 'Car.png',         label: 'Car',           moods: ['Neon Nights'] },
  { id: 'music-1',     filename: 'Music 1.png',     label: 'Music Note',    moods: ['Neon Nights'] },
  { id: 'music-2',     filename: 'Music 3.png',     label: 'Music Note',    moods: ['Neon Nights'] },

  // Cross-mood ambient
  { id: 'sun',         filename: 'Sun.png',         label: 'Sun',           moods: ['Bright Day', 'Golden Hour'] },
  { id: 'rainbow',     filename: 'Rainbow.png',     label: 'Rainbow',       moods: ['Bright Day', 'Dream State'] },
  { id: 'swan-1',      filename: 'Swan 1.png',      label: 'Swan',          moods: ['Dream State', 'Coastal Morning'] },
]

// Filter the shape pool to those allowed in the current mood.
export function shapesForMood(mood) {
  return CLOUD_SHAPES.filter(s => !s.moods || s.moods.includes('*') || s.moods.includes(mood))
}

// Pick a random shape from the pool allowed in this mood, or null if no
// shapes are available for this mood (in which case spawn a regular cloud).
export function pickShape(mood) {
  const pool = shapesForMood(mood)
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

// URL helper — uses the public folder so it works in dev + production.
export function shapeUrl(shape) {
  return `/clouds-shapes/${shape.filename}`
}

// Check whether the manifest is currently empty (no entries) so we can fall
// back gracefully if user hasn't added shapes yet.
export const HAS_SHAPES = CLOUD_SHAPES.length > 0
