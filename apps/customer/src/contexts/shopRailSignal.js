import { useEffect, useState } from 'react'

// Module-level signal for the static Shop right-rail. Shop isn't a dockable
// floating panel — it's a fixed right-side drawer with its own browsing UX.
// PlaceTabPanel + bottom-bar buttons fire this signal; AppInner subscribes
// via useShopRail() to render the rail.

const subs = new Set()
let _open = false

export const shopRail = {
  get isOpen() { return _open },
  set isOpen(v) {
    if (_open === v) return
    _open = v
    subs.forEach(cb => cb(v))
  },
}

export function openShop()  { shopRail.isOpen = true }
export function closeShop() { shopRail.isOpen = false }
export function toggleShop(){ shopRail.isOpen = !shopRail.isOpen }

export function useShopRail() {
  const [open, setOpen] = useState(_open)
  useEffect(() => {
    subs.add(setOpen)
    return () => { subs.delete(setOpen) }
  }, [])
  return open
}
