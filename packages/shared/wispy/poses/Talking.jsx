import WispyArt from '../art.jsx'

// Talking is Idle with mouth alternating. The flap toggle lives in Mascot;
// Talking just renders the open-mouth frame when asked.
export default function Talking({ mouthOpen = true, eyeClosed = false }) {
  return (
    <WispyArt
      mouthOpen={mouthOpen}
      eyeClosed={eyeClosed}
      leftArmStyle="down"
      rightArmStyle="wave"
    />
  )
}
