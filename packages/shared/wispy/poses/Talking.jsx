import WispyArt from '../art.jsx'

// Mouth flap is a slot cycle between two talking faces.
// mouthOpen → 'talking-2' (open), !mouthOpen → 'talking-1' (closed-ish).
// WispyMascot's 180ms flap interval drives the alternation.
export default function Talking({ mouthOpen = false, eyeClosed = false, mood, width }) {
  const slot = mouthOpen ? 'talking-2' : 'talking-1'
  return <WispyArt slot={slot} mood={mood} eyeClosed={eyeClosed} width={width} />
}
