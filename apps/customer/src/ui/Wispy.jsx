import { useEffect } from 'react'
import useSharedWispy from '@shared/wispy/useWispy'

// LEGACY SHIM — preserves the old `<Wispy message={msg} onDismiss={...} />`
// call site in App.jsx while delegating rendering to the new shared
// Wispy mascot (WispyProvider/WispyMascot/WispyBubble in packages/shared/
// wispy). The customer-app `hooks/useWispy` still drives welcome /
// first-placement / idle-nudge messages exactly as before; they now
// surface in the new mascot's speech bubble instead of the old inline
// SVG character that lived in this file.
//
// When the customer app fully migrates to the shared event-bus API
// (subscribe/emit/markComplete), this shim can be deleted.

export default function Wispy({ message, onDismiss }) {
  const { say, hideBubble } = useSharedWispy()

  useEffect(() => {
    if (!message) return
    say({ text: message, onDismiss })
    // hideBubble cleanup if this component unmounts while a message is
    // still showing — prevents stale text from sticking around.
    return () => hideBubble()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])

  return null
}
