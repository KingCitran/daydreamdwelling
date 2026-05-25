import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import WispyMascot from './WispyMascot.jsx'
import WispyBubble from './WispyBubble.jsx'
import { WISPY_KEYFRAMES } from './art.jsx'

export const WispyContext = createContext(null)

const MOBILE_BREAKPOINT = 720
const IDLE_TO_SLEEP_MS = 60_000
const COMPLETION_KEY = 'ddd_wispy_completion_v1'

function loadCompletion() {
  if (typeof localStorage === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(COMPLETION_KEY) || '{}') } catch { return {} }
}

function saveCompletion(c) {
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem(COMPLETION_KEY, JSON.stringify(c)) } catch { /* quota */ }
}

export default function WispyProvider({ children, enabled = true, defaultPosition = 'top-left' }) {
  const [pose, setPose] = useState('idle')
  const [bubble, setBubble] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [position, setPosition] = useState(defaultPosition)
  const [completion, setCompletion] = useState(loadCompletion)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
  )

  const listenersRef = useRef(new Map())   // eventName → Set<cb>
  const idleTimerRef = useRef(null)
  const previousPoseRef = useRef('idle')

  // ── Event bus ──────────────────────────────────────────────────────────
  const subscribe = useCallback((eventName, cb) => {
    let set = listenersRef.current.get(eventName)
    if (!set) { set = new Set(); listenersRef.current.set(eventName, set) }
    set.add(cb)
    return () => set.delete(cb)
  }, [])

  const emit = useCallback((eventName, payload) => {
    const set = listenersRef.current.get(eventName)
    if (!set) return
    for (const cb of set) {
      try { cb(payload) } catch (e) { console.error('[wispy] listener threw', e) }
    }
  }, [])

  // ── Bubble API ─────────────────────────────────────────────────────────
  const say = useCallback((opts) => {
    const id = Math.random().toString(36).slice(2)
    setBubble({ id, ...opts })
    if (opts?.pose) setPose(opts.pose)
    else setPose('talking')
  }, [])

  const hideBubble = useCallback(() => {
    setBubble(null)
    setPose('idle')
  }, [])

  // ── Dismiss / reopen ───────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    setDismissed(true)
    setBubble(null)
  }, [])

  const reopen = useCallback(() => {
    setDismissed(false)
    setPose('idle')
  }, [])

  // ── Completion ─────────────────────────────────────────────────────────
  const markComplete = useCallback((area) => {
    setCompletion((prev) => {
      const next = { ...prev, [area]: new Date().toISOString() }
      saveCompletion(next)
      return next
    })
  }, [])

  const isComplete = useCallback((area) => Boolean(completion?.[area]), [completion])

  const replay = useCallback((area) => {
    setCompletion((prev) => {
      const next = { ...prev }
      delete next[area]
      saveCompletion(next)
      return next
    })
  }, [])

  // ── Idle → sleeping ────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return
    function resetIdle() {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (pose === 'sleeping') setPose(previousPoseRef.current || 'idle')
      idleTimerRef.current = setTimeout(() => {
        previousPoseRef.current = pose
        setPose('sleeping')
      }, IDLE_TO_SLEEP_MS)
    }
    const events = ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart']
    for (const e of events) window.addEventListener(e, resetIdle, { passive: true })
    resetIdle()
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      for (const e of events) window.removeEventListener(e, resetIdle)
    }
  }, [enabled, pose])

  // ── Mobile detection ───────────────────────────────────────────────────
  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < MOBILE_BREAKPOINT) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ── Migrate legacy guest flags to first sign-in (caller responsibility) ─
  // Caller can pass `bridgeGuestCompletion: { builder: true, ... }` once after
  // signup to merge old localStorage-only flags into the profile-backed store.
  const bridgeGuestCompletion = useCallback((flags) => {
    setCompletion((prev) => {
      const next = { ...prev }
      const now = new Date().toISOString()
      for (const [area, val] of Object.entries(flags || {})) {
        if (val && !next[area]) next[area] = now
      }
      saveCompletion(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({
    pose, setPose,
    bubble, say, hideBubble,
    dismissed, dismiss, reopen,
    position, setPosition,
    isMobile,
    completion, isComplete, markComplete, replay, bridgeGuestCompletion,
    subscribe, emit,
  }), [
    pose, bubble, dismissed, position, isMobile, completion,
    say, hideBubble, dismiss, reopen, isComplete, markComplete, replay, bridgeGuestCompletion,
    subscribe, emit,
  ])

  const portalTarget = typeof document !== 'undefined' ? document.body : null

  return (
    <WispyContext.Provider value={value}>
      {children}
      {enabled && portalTarget && createPortal(
        <>
          <style>{WISPY_KEYFRAMES}</style>
          <WispyMascot />
          <WispyBubble />
        </>,
        portalTarget
      )}
    </WispyContext.Provider>
  )
}
