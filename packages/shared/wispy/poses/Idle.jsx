import WispyArt from '../art.jsx'

export default function Idle({ mouthOpen = false, eyeClosed = false }) {
  return (
    <WispyArt
      mouthOpen={mouthOpen}
      eyeClosed={eyeClosed}
      leftArmStyle="down"
      rightArmStyle="wave"
    />
  )
}
