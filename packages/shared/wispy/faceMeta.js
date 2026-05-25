// ES-module port of the bundle's picker/face-meta.js, plus Vite-built
// URLs for the cloud/face/leg PNGs (resolved via import.meta.glob so all
// three consuming apps get hashed asset URLs at build time).
//
// Original triage: Hayley via picker/face-studio.html.
// To re-triage: open D:\Hayley\DaydreamDwelling\wispy-handoff-incoming\wispy-handoff\picker\face-studio.html,
// edit slots, export, and replace FACE_META below.

import cloudBaseUrl       from './assets/cloud/cloud-base.png?url'
import cloudSilhouetteUrl from './assets/cloud/cloud-silhouette.png?url'
import legsDarkUrl        from './assets/legs/legs-dark.png?url'
import legsLightUrl       from './assets/legs/legs-light.png?url'

// Bulk-import face PNGs as URLs. Keys come back like
// './assets/faces/dark/f001.png' — we strip down to 'f001'.
const darkFaces  = import.meta.glob('./assets/faces/dark/*.png',  { eager: true, query: '?url', import: 'default' })
const lightFaces = import.meta.glob('./assets/faces/light/*.png', { eager: true, query: '?url', import: 'default' })

function indexByFaceId(map) {
  const out = {}
  for (const [path, url] of Object.entries(map)) {
    const m = path.match(/\/(f\d{3})\.png$/i)
    if (m) out[m[1]] = url
  }
  return out
}

export const FACE_URLS = {
  dark:  indexByFaceId(darkFaces),
  light: indexByFaceId(lightFaces),
}

export const CLOUD_BASE_URL       = cloudBaseUrl
export const CLOUD_SILHOUETTE_URL = cloudSilhouetteUrl
export const LEGS_URLS = { dark: legsDarkUrl, light: legsLightUrl }

// Hayley's hand-triaged face → slot mapping. Skip-flagged faces aren't
// part of Wispy's expression set.
export const FACE_META = {
  f001: { slots: ['happy', 'talking-1'],                              blush: true,  skip: false },
  f002: { slots: ['talking-2', 'happy', 'laughing'],                  blush: true,  skip: false },
  f003: { slots: ['wink', 'happy', 'mischievous'],                    blush: true,  skip: false },
  f004: { slots: ['wink', 'happy', 'mischievous'],                    blush: true,  skip: false },
  f005: { slots: ['happy', 'wink'],                                   blush: true,  skip: false },
  f006: { slots: ['wink', 'happy'],                                   blush: true,  skip: false },
  f007: { slots: ['sleepy', 'happy', 'blink'],                        blush: true,  skip: false },
  f008: { slots: ['happy', 'blink'],                                  blush: true,  skip: false },
  f009: { slots: ['happy', 'laughing'],                               blush: true,  skip: false },
  f010: { slots: ['blink', 'happy'],                                  blush: true,  skip: false },
  f011: { slots: [],                                                   blush: true,  skip: true  },
  f012: { slots: ['sad', 'embarrassed'],                              blush: true,  skip: false },
  f013: { slots: ['surprised', 'talking-2', 'sad', 'confused'],       blush: true,  skip: false },
  f014: { slots: ['sad', 'blink', 'thinking', 'sleepy'],              blush: true,  skip: false },
  f015: { slots: ['sad', 'thinking', 'sleepy'],                       blush: true,  skip: false },
  f016: { slots: ['sad', 'embarrassed'],                              blush: true,  skip: false },
  f017: { slots: ['sad'],                                              blush: true,  skip: false },
  f018: { slots: ['sad', 'sleepy'],                                   blush: true,  skip: false },
  f019: { slots: [],                                                   blush: true,  skip: true  },
  f020: { slots: ['angry', 'shy', 'confused', 'oof'],                 blush: true,  skip: false },
  f021: { slots: [],                                                   blush: true,  skip: true  },
  f022: { slots: [],                                                   blush: true,  skip: true  },
  f023: { slots: [],                                                   blush: true,  skip: true  },
  f024: { slots: ['big-surprise', 'how-dare-you', 'starstruck'],      blush: true,  skip: false },
  f025: { slots: ['neutral', 'thinking', 'bored'],                    blush: false, skip: false },
  f026: { slots: ['sad', 'embarrassed', 'confused', 'shy'],           blush: true,  skip: false },
  f027: { slots: ['angry', 'determined'],                             blush: true,  skip: false },
  f028: { slots: [],                                                   blush: false, skip: true  },
  f029: { slots: [],                                                   blush: true,  skip: true  },
  f030: { slots: ['happy', 'smug', 'proud', 'mischievous'],           blush: true,  skip: false },
  f031: { slots: [],                                                   blush: true,  skip: true  },
  f032: { slots: [],                                                   blush: true,  skip: true  },
  f033: { slots: ['sad', 'embarrassed'],                              blush: true,  skip: false },
  f034: { slots: ['neutral', 'bored', 'oof'],                         blush: true,  skip: false },
  f035: { slots: ['shy', 'confused', 'oof', 'embarrassed'],           blush: true,  skip: false },
  f036: { slots: ['glasses'],                                          blush: true,  skip: false },
  f037: { slots: ['glasses'],                                          blush: true,  skip: false },
  f038: { slots: ['happy', 'giggle', 'talking-1'],                    blush: true,  skip: false },
  f039: { slots: ['love', 'proud', 'starstruck', 'happy', 'surprised'], blush: true, skip: false },
  f040: { slots: ['oof', 'embarrassed', 'confused', 'dazed'],         blush: true,  skip: false },
}

// Primary face per expression slot. Picked by hand so default renders
// are deterministic. Change values to swap.
export const SLOT_PRIMARY = {
  // Tier 1 — core expressions
  neutral:       'f025',
  happy:         'f005',
  surprised:     'f013',
  blink:         'f008',
  'talking-1':   'f001',
  'talking-2':   'f002',
  'talking-3':   null,
  curious:       null,
  // Tier 2 — moods
  sleepy:        'f018',
  thinking:      'f015',
  'big-surprise':'f024',
  laughing:      'f009',
  sad:           'f017',
  // Tier 3 — character
  wink:          'f005',
  'how-dare-you':'f024',
  mischievous:   'f030',
  smug:          'f030',
  'side-eye':    null,
  embarrassed:   'f035',
  proud:         'f030',
  love:          'f039',
  starstruck:    'f039',
  confused:      'f026',
  determined:    'f027',
  oof:           'f040',
  shy:           'f026',
  giggle:        'f038',
  bored:         'f034',
  dazed:         'f040',
  sick:          null,
  angry:         'f027',
  glasses:       'f036',
}

// Fallbacks for slots without a primary so renderers never get null.
export const SLOT_FALLBACK = {
  'talking-3': 'f038',
  curious:     'f003',
  'side-eye':  'f035',
  sick:        'f040',
}

/** Resolve slot name + ink mode → face PNG URL. Falls back through the
 * fallback table then to the neutral face. Returns null only if there's
 * no neutral face URL for the given ink mode (shouldn't happen). */
export function getFaceUrl(slot, ink) {
  const inkSet = ink === 'light' ? FACE_URLS.light : FACE_URLS.dark
  const direct   = SLOT_PRIMARY[slot]
  const fallback = SLOT_FALLBACK[slot]
  const faceId   = direct || fallback || SLOT_PRIMARY.neutral
  return inkSet[faceId] || inkSet[SLOT_PRIMARY.neutral] || null
}

/** Resolve legs URL for an ink mode. */
export function getLegsUrl(ink) {
  return ink === 'light' ? LEGS_URLS.light : LEGS_URLS.dark
}
