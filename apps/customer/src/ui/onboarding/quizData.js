/**
 * Quiz questions, answer options, and scoring matrix.
 * Each answer's `scores` map adds weighted points to mood keys.
 * `gradient` is shown as a placeholder until `photo` paths are set.
 * To use custom photos: set photo: '/assets/quiz/your-image.jpg' on any answer.
 */

export const QUESTIONS = [
  {
    id: 'q1',
    text: 'What kind of light fills your dream space?',
    answers: [
      { id: 'q1a', label: 'Bright natural light',    photo: null, gradient: 'linear-gradient(135deg, #e8f0e4 0%, #a8d0a8 100%)', scores: { 'Bright Day': 3, 'Coastal Morning': 2, 'Studio': 1 } },
      { id: 'q1b', label: 'Warm golden glow',         photo: null, gradient: 'linear-gradient(135deg, #fde8b0 0%, #c87820 100%)', scores: { 'Golden Hour': 3, 'Greenhouse': 1, 'Candlelight': 1 } },
      { id: 'q1c', label: 'Cool moonlit blue',         photo: null, gradient: 'linear-gradient(135deg, #1a2040 0%, #5070c8 100%)', scores: { 'Moonlight': 3, 'Studio Dark': 1, 'Dream State': 1 } },
      { id: 'q1d', label: 'Moody candlelit warmth',    photo: null, gradient: 'linear-gradient(135deg, #100806 0%, #e09828 60%, #281008 100%)', scores: { 'Candlelight': 3, 'Dark Academia': 2, 'Cozy Evening': 2 } },
      { id: 'q1e', label: 'Electric neon color',       photo: null, gradient: 'linear-gradient(135deg, #04040c 0%, #9828f0 50%, #00e0ff 100%)', scores: { 'Neon Nights': 3, 'Studio Dark': 1 } },
      { id: 'q1f', label: 'Soft dreamy haze',          photo: null, gradient: 'linear-gradient(135deg, #ede9ff 0%, #7a48cc 100%)', scores: { 'Dream State': 3, 'Cottagecore Dawn': 2 } },
    ],
  },
  {
    id: 'q2',
    text: 'Pick your color palette.',
    answers: [
      { id: 'q2a', label: 'Warm amber and gold',       photo: null, gradient: 'linear-gradient(135deg, #fda020 0%, #c87820 100%)', scores: { 'Golden Hour': 2, 'Cozy Evening': 1, 'Candlelight': 2, 'Dark Academia': 1 } },
      { id: 'q2b', label: 'Cool ocean and sky',         photo: null, gradient: 'linear-gradient(135deg, #d0e8f8 0%, #1a60b8 100%)', scores: { 'Coastal Morning': 3, 'Moonlight': 1, 'Bright Day': 1 } },
      { id: 'q2c', label: 'Bold vivid colors',          photo: null, gradient: 'linear-gradient(135deg, #ff0080 0%, #9828f0 50%, #00e0ff 100%)', scores: { 'Neon Nights': 3, 'Dream State': 1 } },
      { id: 'q2d', label: 'Blush and soft pastels',     photo: null, gradient: 'linear-gradient(135deg, #fde8e4 0%, #c06858 100%)', scores: { 'Cottagecore Dawn': 3, 'Dream State': 2 } },
      { id: 'q2e', label: 'Deep charcoal and black',    photo: null, gradient: 'linear-gradient(135deg, #181818 0%, #3a3a3a 100%)', scores: { 'Studio Dark': 3, 'Dark Academia': 2 } },
      { id: 'q2f', label: 'Earthy green and wood',      photo: null, gradient: 'linear-gradient(135deg, #c8e8c0 0%, #389848 100%)', scores: { 'Greenhouse': 3, 'Cottagecore Dawn': 1, 'Bright Day': 1 } },
    ],
  },
  {
    id: 'q3',
    text: 'Your dream space makes you feel...',
    answers: [
      { id: 'q3a', label: 'Energized and alive',        photo: null, gradient: 'linear-gradient(135deg, #e8f8e0 0%, #3a7a4a 100%)', scores: { 'Bright Day': 2, 'Coastal Morning': 2, 'Greenhouse': 1 } },
      { id: 'q3b', label: 'Calm and grounded',           photo: null, gradient: 'linear-gradient(135deg, #e8e8e8 0%, #888888 100%)', scores: { 'Moonlight': 2, 'Studio': 2, 'Greenhouse': 2 } },
      { id: 'q3c', label: 'Warm and cradled',            photo: null, gradient: 'linear-gradient(135deg, #201008 0%, #d4882a 100%)', scores: { 'Cozy Evening': 3, 'Candlelight': 2, 'Cottagecore Dawn': 1 } },
      { id: 'q3d', label: 'Focused and creative',        photo: null, gradient: 'linear-gradient(135deg, #100a04 0%, #b88828 100%)', scores: { 'Dark Academia': 2, 'Studio': 2, 'Studio Dark': 2 } },
      { id: 'q3e', label: 'Magical and dreamy',          photo: null, gradient: 'linear-gradient(135deg, #ede9ff 0%, #7a48cc 100%)', scores: { 'Dream State': 3, 'Cottagecore Dawn': 1, 'Neon Nights': 1 } },
      { id: 'q3f', label: 'Bold and electric',           photo: null, gradient: 'linear-gradient(135deg, #04040c 0%, #9828f0 100%)', scores: { 'Neon Nights': 2, 'Golden Hour': 1, 'Coastal Morning': 1 } },
    ],
  },
  {
    id: 'q4',
    text: 'Which space would you live in?',
    answers: [
      { id: 'q4a', label: 'Sunlit café, open windows, white walls',     photo: null, gradient: 'linear-gradient(135deg, #f7faf4 0%, #3a7a4a 100%)', scores: { 'Bright Day': 3, 'Coastal Morning': 1 } },
      { id: 'q4b', label: 'Dark wood shelves, vintage maps, leather',    photo: null, gradient: 'linear-gradient(135deg, #0a0804 0%, #b88828 100%)', scores: { 'Dark Academia': 3, 'Cozy Evening': 1 } },
      { id: 'q4c', label: 'Wildflowers, linen curtains, terracotta',     photo: null, gradient: 'linear-gradient(135deg, #fde8e0 0%, #c06858 80%, #389848 100%)', scores: { 'Cottagecore Dawn': 3, 'Greenhouse': 2 } },
      { id: 'q4d', label: 'Concrete walls, glass, clean minimal lines',  photo: null, gradient: 'linear-gradient(135deg, #e0e0e0 0%, #181818 100%)', scores: { 'Studio': 3, 'Studio Dark': 1 } },
      { id: 'q4e', label: 'Fairy lights, crystals, flowing fabric',      photo: null, gradient: 'linear-gradient(135deg, #ede9ff 0%, #c8b8f8 50%, #fde8ff 100%)', scores: { 'Dream State': 2, 'Cottagecore Dawn': 1, 'Moonlight': 1 } },
      { id: 'q4f', label: 'LED strips, neon wall art, bold statement',   photo: null, gradient: 'linear-gradient(135deg, #04040c 0%, #ff0080 50%, #9828f0 100%)', scores: { 'Neon Nights': 3, 'Golden Hour': 1 } },
    ],
  },
  {
    id: 'q5',
    text: 'What time of day feels most like home?',
    answers: [
      { id: 'q5a', label: 'Dawn, first light',            photo: null, gradient: 'linear-gradient(135deg, #fde8e4 0%, #c06858 100%)', scores: { 'Bright Day': 2, 'Cottagecore Dawn': 3 } },
      { id: 'q5b', label: 'Golden hour, warm dusk',        photo: null, gradient: 'linear-gradient(135deg, #fda020 0%, #c87820 100%)', scores: { 'Golden Hour': 3, 'Cozy Evening': 1 } },
      { id: 'q5c', label: 'Open bright midday',            photo: null, gradient: 'linear-gradient(135deg, #e8f8f8 0%, #1a60b8 100%)', scores: { 'Coastal Morning': 2, 'Bright Day': 1, 'Greenhouse': 1 } },
      { id: 'q5d', label: 'Soft twilight',                 photo: null, gradient: 'linear-gradient(135deg, #ede9ff 0%, #5070c8 100%)', scores: { 'Dream State': 2, 'Cottagecore Dawn': 1, 'Golden Hour': 1 } },
      { id: 'q5e', label: 'Midnight, cool and quiet',      photo: null, gradient: 'linear-gradient(135deg, #06080e 0%, #5070c8 100%)', scores: { 'Moonlight': 3, 'Studio Dark': 2 } },
      { id: 'q5f', label: '2AM, lamp in the dark',         photo: null, gradient: 'linear-gradient(135deg, #0a0802 0%, #e09828 100%)', scores: { 'Dark Academia': 2, 'Candlelight': 3, 'Studio Dark': 1 } },
    ],
  },
  {
    id: 'q6',
    text: 'How does your ideal space feel to guests?',
    answers: [
      { id: 'q6a', label: 'Warm and welcoming',             photo: null, gradient: 'linear-gradient(135deg, #c8e8c0 0%, #389848 100%)', scores: { 'Greenhouse': 2, 'Bright Day': 1, 'Cozy Evening': 1, 'Cottagecore Dawn': 1 } },
      { id: 'q6b', label: 'Cool and sophisticated',          photo: null, gradient: 'linear-gradient(135deg, #d0e8f8 0%, #1a60b8 100%)', scores: { 'Coastal Morning': 2, 'Studio': 2, 'Moonlight': 1 } },
      { id: 'q6c', label: 'Mysterious and intriguing',       photo: null, gradient: 'linear-gradient(135deg, #0a0804 0%, #b88828 100%)', scores: { 'Dark Academia': 3, 'Moonlight': 1, 'Studio Dark': 1 } },
      { id: 'q6d', label: 'Whimsical and magical',           photo: null, gradient: 'linear-gradient(135deg, #ede9ff 0%, #7a48cc 100%)', scores: { 'Dream State': 3, 'Cottagecore Dawn': 1, 'Neon Nights': 1 } },
      { id: 'q6e', label: 'Electric and exciting',           photo: null, gradient: 'linear-gradient(135deg, #04040c 0%, #9828f0 100%)', scores: { 'Neon Nights': 2, 'Golden Hour': 1 } },
      { id: 'q6f', label: 'Quiet and minimal',               photo: null, gradient: 'linear-gradient(135deg, #e0e0e0 0%, #444444 100%)', scores: { 'Studio': 2, 'Studio Dark': 2, 'Moonlight': 1 } },
    ],
  },
  {
    id: 'q7',
    text: 'Your element.',
    answers: [
      { id: 'q7a', label: 'Fire — passion and warmth',       photo: null, gradient: 'linear-gradient(135deg, #fda020 0%, #c83820 100%)', scores: { 'Golden Hour': 1, 'Cozy Evening': 1, 'Candlelight': 1 } },
      { id: 'q7b', label: 'Earth — grounding and growth',    photo: null, gradient: 'linear-gradient(135deg, #c8e8a0 0%, #389848 100%)', scores: { 'Greenhouse': 1, 'Cottagecore Dawn': 1, 'Cozy Evening': 1 } },
      { id: 'q7c', label: 'Metal — clarity and precision',   photo: null, gradient: 'linear-gradient(135deg, #e0e0e0 0%, #888888 100%)', scores: { 'Studio': 1, 'Studio Dark': 1, 'Coastal Morning': 1 } },
      { id: 'q7d', label: 'Water — flow and reflection',     photo: null, gradient: 'linear-gradient(135deg, #d0e8f8 0%, #5070c8 100%)', scores: { 'Moonlight': 1, 'Dream State': 1, 'Coastal Morning': 1 } },
      { id: 'q7e', label: 'Wood — growth and creativity',    photo: null, gradient: 'linear-gradient(135deg, #e8f0c8 0%, #3a7a4a 100%)', scores: { 'Greenhouse': 1, 'Bright Day': 1, 'Cottagecore Dawn': 1 } },
    ],
  },
]

const MOOD_ORDER = [
  'Golden Hour', 'Bright Day', 'Cozy Evening', 'Moonlight', 'Dark Academia',
  'Cottagecore Dawn', 'Coastal Morning', 'Dream State', 'Neon Nights',
  'Candlelight', 'Greenhouse', 'Studio', 'Studio Dark',
]

/**
 * @param {Record<string, string>} answers - { q1: 'q1b', q2: 'q2a', ... }
 * @returns {string} The mood key with the highest total score
 */
export function calcResult(answers) {
  const totals = {}
  for (const q of QUESTIONS) {
    const chosen = answers[q.id]
    if (!chosen) continue
    const answer = q.answers.find(a => a.id === chosen)
    if (!answer) continue
    for (const [mood, weight] of Object.entries(answer.scores)) {
      totals[mood] = (totals[mood] ?? 0) + weight
    }
  }
  // Tiebreak: prefer mood that appears earlier in MOOD_ORDER
  return MOOD_ORDER.reduce((best, mood) => {
    if (!best) return mood
    const bestScore = totals[best] ?? 0
    const moodScore = totals[mood] ?? 0
    return moodScore > bestScore ? mood : best
  }, null) ?? 'Studio Dark'
}
