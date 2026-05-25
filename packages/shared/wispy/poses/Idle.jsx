import WispyArt from '../art.jsx'

// Idle = the default 'happy' face (two open eyes + smile). Blink loop
// upstream toggles eyeClosed which maps to the 'blink' slot inside WispyArt.
export default function Idle({ eyeClosed = false, mood, width }) {
  return <WispyArt slot="happy" mood={mood} eyeClosed={eyeClosed} width={width} />
}
