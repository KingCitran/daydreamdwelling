import { useContext } from 'react'
import { WispyContext } from './WispyProvider.jsx'

export default function useWispy() {
  const ctx = useContext(WispyContext)
  if (!ctx) {
    // Soft fallback so consumers don't crash if mounted outside a provider.
    return {
      emit: () => {},
      subscribe: () => () => {},
      say: () => {},
      hideBubble: () => {},
      dismiss: () => {},
      reopen: () => {},
      setPose: () => {},
      markComplete: () => {},
      isComplete: () => false,
      replay: () => {},
      bridgeGuestCompletion: () => {},
      bubble: null,
      pose: 'idle',
      dismissed: true,
      completion: {},
      isMobile: false,
    }
  }
  return ctx
}
