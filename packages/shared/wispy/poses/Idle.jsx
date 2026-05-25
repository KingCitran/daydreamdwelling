import WispyArt from '../art.jsx'

export default function Idle({ eyeClosed = false, ink = 'dark', mood, width }) {
  return <WispyArt slot="happy" ink={ink} mood={mood} eyeClosed={eyeClosed} width={width} />
}
