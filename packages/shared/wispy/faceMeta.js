// Face triage + URL resolution for the Wispy bundle.
//
// Faces are PNG silhouettes (ink-on-alpha). We bundle ONLY the dark set
// (`assets/faces/dark/`) and use them as CSS masks; the actual face ink
// color comes from the active mood recipe (cloudPalette.js) painted via
// `background-color` behind the mask. That's the picker/wispy.jsx
// approach — it sidesteps needing two PNG sets and lets the face hue
// shift per mood (Greenhouse gets dark green ink, Vivid Sunset gets
// wine, etc.) without re-rendering art.
//
// The bundle also ships `assets/faces/light/` but those PNGs aren't
// imported anymore. Left on disk in case we ever need them.
//
// Slot triage below comes from Hayley via picker/face-studio.html. To
// re-triage: open
//   D:\Hayley\DaydreamDwelling\wispy-handoff-incoming\wispy-handoff\picker\face-studio.html
// in a browser, drag faces around, export, paste the new FACE_META.

import cloudBaseUrl       from './assets/cloud/cloud-base.png?url'
import cloudSilhouetteUrl from './assets/cloud/cloud-silhouette.png?url'
import legsDarkUrl        from './assets/legs/legs-dark.png?url'

const faceMasks = import.meta.glob('./assets/faces/dark/*.png', {
  eager: true, query: '?url', import: 'default',
})

function indexByFaceId(map) {
  const out = {}
  for (const [path, url] of Object.entries(map)) {
    const m = path.match(/\/(f\d{3})\.png$/i)
    if (m) out[m[1]] = url
  }
  return out
}

export const FACE_MASK_URLS = indexByFaceId(faceMasks)

export const CLOUD_BASE_URL       = cloudBaseUrl
export const CLOUD_SILHOUETTE_URL = cloudSilhouetteUrl
export const LEGS_URL             = legsDarkUrl

// Hayley's per-face triage. `blushable` mirrors the picker/wispy.jsx
// FACES dict — only some faces want cheek-blush dots overlaid.
export const FACE_META = {
  f001: { slots: ['happy', 'talking-1'],                              blushable: true,  skip: false },
  f002: { slots: ['talking-2', 'happy', 'laughing'],                  blushable: true,  skip: false },
  f003: { slots: ['wink', 'happy', 'mischievous'],                    blushable: true,  skip: false },
  f004: { slots: ['wink', 'happy', 'mischievous'],                    blushable: true,  skip: false },
  f005: { slots: ['happy', 'wink'],                                   blushable: true,  skip: false },
  f006: { slots: ['wink', 'happy'],                                   blushable: true,  skip: false },
  f007: { slots: ['sleepy', 'happy', 'blink'],                        blushable: true,  skip: false },
  f008: { slots: ['happy', 'blink'],                                  blushable: true,  skip: false },
  f009: { slots: ['happy', 'laughing'],                               blushable: true,  skip: false },
  f010: { slots: ['blink', 'happy'],                                  blushable: true,  skip: false },
  f011: { slots: [],                                                   blushable: true,  skip: true  },
  f012: { slots: ['sad', 'embarrassed'],                              blushable: true,  skip: false },
  f013: { slots: ['surprised', 'talking-2', 'sad', 'confused'],       blushable: false, skip: false },
  f014: { slots: ['sad', 'blink', 'thinking', 'sleepy'],              blushable: true,  skip: false },
  f015: { slots: ['sad', 'thinking', 'sleepy'],                       blushable: true,  skip: false },
  f016: { slots: ['sad', 'embarrassed'],                              blushable: true,  skip: false },
  f017: { slots: ['sad'],                                              blushable: true,  skip: false },
  f018: { slots: ['sad', 'sleepy'],                                   blushable: true,  skip: false },
  f019: { slots: [],                                                   blushable: true,  skip: true  },
  f020: { slots: ['angry', 'shy', 'confused', 'oof'],                 blushable: true,  skip: false },
  f021: { slots: [],                                                   blushable: true,  skip: true  },
  f022: { slots: [],                                                   blushable: true,  skip: true  },
  f023: { slots: [],                                                   blushable: true,  skip: true  },
  f024: { slots: ['big-surprise', 'how-dare-you', 'starstruck'],      blushable: true,  skip: false },
  f025: { slots: ['neutral', 'thinking', 'bored'],                    blushable: false, skip: false },
  f026: { slots: ['sad', 'embarrassed', 'confused', 'shy'],           blushable: true,  skip: false },
  f027: { slots: ['angry', 'determined'],                             blushable: true,  skip: false },
  f028: { slots: [],                                                   blushable: false, skip: true  },
  f029: { slots: [],                                                   blushable: true,  skip: true  },
  f030: { slots: ['happy', 'smug', 'proud', 'mischievous'],           blushable: true,  skip: false },
  f031: { slots: [],                                                   blushable: true,  skip: true  },
  f032: { slots: [],                                                   blushable: true,  skip: true  },
  f033: { slots: ['sad', 'embarrassed'],                              blushable: true,  skip: false },
  f034: { slots: ['neutral', 'bored', 'oof'],                         blushable: true,  skip: false },
  f035: { slots: ['shy', 'confused', 'oof', 'embarrassed'],           blushable: true,  skip: false },
  f036: { slots: ['glasses'],                                          blushable: true,  skip: false },
  f037: { slots: ['glasses'],                                          blushable: true,  skip: false },
  f038: { slots: ['happy', 'giggle', 'talking-1'],                    blushable: true,  skip: false },
  f039: { slots: ['love', 'proud', 'starstruck', 'happy', 'surprised'], blushable: true, skip: false },
  f040: { slots: ['oof', 'embarrassed', 'confused', 'dazed'],         blushable: true,  skip: false },
}

export const SLOT_PRIMARY = {
  neutral:       'f025',
  // 'resting' is the default idle expression — soft smile, eyes
  // gently closed. She drifts most of the time so this reads better
  // than the wide-eyed happy variant (which felt like staring).
  resting:       'f008',
  happy:         'f001',  // two open eyes + smile (f005 was the wink variant)
  surprised:     'f013',
  blink:         'f008',
  'talking-1':   'f001',
  'talking-2':   'f002',
  'talking-3':   null,
  curious:       null,
  sleepy:        'f018',
  thinking:      'f015',
  'big-surprise':'f024',
  laughing:      'f009',
  sad:           'f017',
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

export const SLOT_FALLBACK = {
  'talking-3': 'f038',
  curious:     'f003',
  'side-eye':  'f035',
  sick:        'f040',
}

function resolveFaceId(slot) {
  return SLOT_PRIMARY[slot] || SLOT_FALLBACK[slot] || SLOT_PRIMARY.neutral
}

/** Face PNG URL to use as a CSS mask. The ink color comes from the
 * active mood recipe via `background-color` behind this mask. */
export function getFaceMaskUrl(slot) {
  const faceId = resolveFaceId(slot)
  return FACE_MASK_URLS[faceId] || FACE_MASK_URLS[SLOT_PRIMARY.neutral] || null
}

/** Whether the face wants cheek-blush dots overlaid. */
export function isFaceBlushable(slot) {
  const faceId = resolveFaceId(slot)
  return FACE_META[faceId]?.blushable ?? true
}
