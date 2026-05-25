import WispyArt from '../art.jsx'

export default function Idle({ eyeClosed = false, ink = 'dark', width }) {
  return <WispyArt slot="happy" ink={ink} eyeClosed={eyeClosed} width={width} />
}
