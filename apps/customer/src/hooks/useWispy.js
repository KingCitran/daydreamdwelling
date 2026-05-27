import { useState, useEffect, useRef } from 'react'

const IDLE_MESSAGES = [
  "Need help with anything? ☁",
  "Try the shop for some inspiration! 🛍",
  "Your room is looking dreamy! 🌙",
  "Don't forget — you can save your room anytime!",
  "You can wishlist items to save them for later! 💜",
]

// Per-session sessionStorage flags so each trigger fires once per browser
// tab session, not every render. Welcome + empty-hint + first-place stay
// in localStorage (once-ever) because they're tutorial-y.
function firedThisSession(key) {
  try { return !!sessionStorage.getItem(key) } catch { return true }
}
function markFiredThisSession(key) {
  try { sessionStorage.setItem(key, '1') } catch { /* private mode */ }
}

const MOOD_REMARKS = {
  'Dream State':       "Mmm, Dream State. Feels like floating ✨",
  'Golden Hour':       "Golden Hour — my favorite warm one 🌅",
  'Moonlight':         "Moonlight — quietest mood on the menu 🌙",
  'Blush Hour':        "Blush Hour. Soft and pretty 🌸",
  'Coastal Morning':   "Coastal Morning — smell that salt air? 🌊",
  'Vivid Sunset':      "Vivid Sunset! Bold choice 🍇",
  'Bright Day':        "Bright Day. Wide open and ready ☀",
  'Neon Nights':       "Neon Nights. Now we're talking 💜",
  'Greenhouse':        "Greenhouse — green everywhere 🌿",
  "Ember's Sunrise":   "Ember's Sunrise. Cozy and dim 🔥",
  'Northern Lights':   "Northern Lights — keep watching the sky ✨",
  'Dark Academia':     "Dark Academia. Focused vibes 📚",
  'Candlelit Cozy Evening': "Candlelit. Pour something warm 🕯",
  'Studio':            "Studio. Honest light, real colors.",
  'Studio Dark':       "Studio Dark. Same honest light, less glare.",
}

export default function useWispy({ itemCount, mood, drawerOpen }) {
  const [message, setMessage] = useState(null)
  const idleIdxRef  = useRef(0)
  const prevCountRef   = useRef(itemCount)
  const prevMoodRef    = useRef(mood)
  const prevDrawerRef  = useRef(drawerOpen)
  const emptyTimerRef  = useRef(null)

  // Welcome (once ever) — empty-state hint is now ALSO once-ever. Wispy
  // talking every visit reads as nagging; "occasionally" is the brief.
  // Reset both with localStorage.removeItem('ddd_wispy_*') if needed.
  useEffect(() => {
    if (!localStorage.getItem('ddd_wispy_welcomed')) {
      localStorage.setItem('ddd_wispy_welcomed', '1')
      setMessage("Hi! I'm Wispy ✨ Ready to help you build your dream room!")
    } else if (itemCount === 0 && !localStorage.getItem('ddd_wispy_empty_hint')) {
      emptyTimerRef.current = setTimeout(() => {
        localStorage.setItem('ddd_wispy_empty_hint', '1')
        setMessage("Your room looks empty! 🛍 Browse the shop and start placing pieces.")
      }, 2500)
    }
    return () => clearTimeout(emptyTimerRef.current)
  }, [])

  // First placement (once ever)
  useEffect(() => {
    if (prevCountRef.current === 0 && itemCount > 0) {
      if (!localStorage.getItem('ddd_wispy_first_place')) {
        localStorage.setItem('ddd_wispy_first_place', '1')
        setMessage("That looks beautiful already! ✨ Keep going!")
      }
    }
    prevCountRef.current = itemCount
  }, [itemCount])

  // Activity nudge: first mood change in this session reads as Wispy
  // noticing the user is engaged. Per-mood remarks add character; the
  // sessionStorage gate prevents re-talking on every flip.
  useEffect(() => {
    if (mood && prevMoodRef.current && mood !== prevMoodRef.current) {
      const key = 'ddd_wispy_mood_change'
      if (!firedThisSession(key)) {
        markFiredThisSession(key)
        setMessage(MOOD_REMARKS[mood] ?? "Ooh, switching it up ✨")
      }
    }
    prevMoodRef.current = mood
  }, [mood])

  // Activity nudge: first time opening the shop drawer in this session.
  useEffect(() => {
    if (drawerOpen && !prevDrawerRef.current) {
      const key = 'ddd_wispy_shop_open'
      if (!firedThisSession(key)) {
        markFiredThisSession(key)
        setMessage("Welcome to the shop 🛍 Real makers, real pieces.")
      }
    }
    prevDrawerRef.current = drawerOpen
  }, [drawerOpen])

  function showWispy() {
    if (message) {
      setMessage(null)
      return
    }
    setMessage(IDLE_MESSAGES[idleIdxRef.current % IDLE_MESSAGES.length])
    idleIdxRef.current += 1
  }

  // Callable triggers for other parts of the app to fire activity-based
  // messages with built-in once-per-session gating.
  function nudgeOnSave() {
    const key = 'ddd_wispy_first_save'
    if (firedThisSession(key)) return
    markFiredThisSession(key)
    setMessage("Saved! Your room's safe now 💜")
  }
  function nudgeOnFirstWishlist() {
    const key = 'ddd_wispy_first_wishlist'
    if (firedThisSession(key)) return
    markFiredThisSession(key)
    setMessage("Saved to wishlist — I'll keep it warm for you ✨")
  }

  return {
    wispyMessage: message,
    dismissWispy: () => setMessage(null),
    showWispy,
    nudgeOnSave,
    nudgeOnFirstWishlist,
  }
}
