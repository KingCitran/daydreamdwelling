import WispyArt from '../art.jsx'

// Idle = resting expression by default (closed-eye soft smile). She's
// drifting most of the time, so eyes-open felt like staring. The blink
// loop's eyeClosed override is a no-op here since her eyes are already
// closed at rest.
export default function Idle({ eyeClosed = false, mood, width }) {
  return <WispyArt slot="resting" mood={mood} eyeClosed={eyeClosed} width={width} />
}
