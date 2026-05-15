import WispyArt from '../art.jsx'

// `direction` = 'left' | 'right' — which arm extends out to point.
export default function Pointing({ direction = 'right', mouthOpen = false, eyeClosed = false }) {
  return (
    <WispyArt
      mouthOpen={mouthOpen}
      eyeClosed={eyeClosed}
      leftArmStyle={direction === 'left' ? 'point' : 'down'}
      rightArmStyle={direction === 'right' ? 'point' : 'down'}
    />
  )
}
