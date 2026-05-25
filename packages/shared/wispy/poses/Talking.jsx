import WispyArt from '../art.jsx'

// Mouth flap in v1 was a binary open/closed swap; in v1.0.0 it's a slot
// cycle between two talking faces. mouthOpen → 'talking-2' (open),
// !mouthOpen → 'talking-1' (closed-ish). WispyMascot's existing flap
// interval (180ms) keeps driving the alternation.
export default function Talking({ mouthOpen = false, eyeClosed = false, ink = 'dark', width }) {
  const slot = mouthOpen ? 'talking-2' : 'talking-1'
  return <WispyArt slot={slot} ink={ink} eyeClosed={eyeClosed} width={width} />
}
