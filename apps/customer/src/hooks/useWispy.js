import { useState, useEffect, useRef } from 'react'

const IDLE_MESSAGES = [
  "Need help with anything? ☁",
  "Try the shop for some inspiration! 🛍",
  "Your room is looking dreamy! 🌙",
  "Don't forget — you can save your room anytime!",
  "You can wishlist items to save them for later! 💜",
]

export default function useWispy({ itemCount }) {
  const [message, setMessage] = useState(null)
  const idleIdxRef  = useRef(0)
  const prevCountRef   = useRef(itemCount)
  const emptyTimerRef  = useRef(null)

  // Welcome (once ever) or empty-state hint (once per session)
  useEffect(() => {
    if (!localStorage.getItem('ddd_wispy_welcomed')) {
      localStorage.setItem('ddd_wispy_welcomed', '1')
      setMessage("Hi! I'm Wispy ✨ Ready to help you build your dream room!")
    } else if (itemCount === 0) {
      emptyTimerRef.current = setTimeout(() => {
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

  function showWispy() {
    if (message) {
      setMessage(null)
      return
    }
    setMessage(IDLE_MESSAGES[idleIdxRef.current % IDLE_MESSAGES.length])
    idleIdxRef.current += 1
  }

  return {
    wispyMessage: message,
    dismissWispy: () => setMessage(null),
    showWispy,
  }
}
