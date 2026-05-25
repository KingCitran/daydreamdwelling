import WispyArt from '../art.jsx'

// v1 had a literal pointing arm; v1.0.0 art has no arms. We surface the
// "pointing" intent via a playful face slot — 'mischievous' reads as
// "look over there" without literal hands. direction is currently
// ignored; if we ever want a left-vs-right tilt we can flip the face
// PNG horizontally with transform: scaleX(-1).
// eslint-disable-next-line no-unused-vars
export default function Pointing({ direction, mouthOpen = false, eyeClosed = false, ink = 'dark', width }) {
  const slot = mouthOpen ? 'talking-1' : 'mischievous'
  return <WispyArt slot={slot} ink={ink} eyeClosed={eyeClosed} width={width} />
}
