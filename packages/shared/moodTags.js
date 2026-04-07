/**
 * Maps each mood key to a set of style tags.
 * This is the shared contract between quiz results and seller product tags.
 * Buyers are matched to products when tags overlap.
 */
export const MOOD_TO_TAGS = {
  'Golden Hour':      ['warm', 'ambient', 'rustic', 'golden'],
  'Bright Day':       ['natural', 'airy', 'minimal', 'clean'],
  'Cozy Evening':     ['warm', 'cozy', 'intimate', 'rustic'],
  'Moonlight':        ['cool', 'serene', 'minimal', 'nocturnal'],
  'Dark Academia':    ['dark', 'vintage', 'moody', 'intellectual'],
  'Cottagecore Dawn': ['cottagecore', 'floral', 'vintage', 'natural'],
  'Coastal Morning':  ['coastal', 'natural', 'breezy', 'blue'],
  'Dream State':      ['ethereal', 'pastel', 'whimsical', 'romantic'],
  'Neon Nights':      ['neon', 'bold', 'electric', 'modern'],
  'Candlelight':      ['warm', 'romantic', 'intimate', 'golden'],
  'Greenhouse':       ['botanical', 'organic', 'green', 'natural'],
  'Studio':           ['minimal', 'clean', 'modern', 'neutral'],
  'Studio Dark':      ['dark', 'minimal', 'monochrome', 'modern'],
}
