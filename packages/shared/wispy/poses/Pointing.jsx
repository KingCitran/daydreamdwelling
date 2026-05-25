import WispyArt from '../art.jsx'

// v1.0.0 art has no arms — 'pointing' is conveyed through a playful
// face slot ('mischievous'). direction is currently ignored.
// eslint-disable-next-line no-unused-vars
export default function Pointing({ direction, mouthOpen = false, eyeClosed = false, mood, width }) {
  const slot = mouthOpen ? 'talking-1' : 'mischievous'
  return <WispyArt slot={slot} mood={mood} eyeClosed={eyeClosed} width={width} />
}
