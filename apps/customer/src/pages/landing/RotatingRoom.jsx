// The Endless Room — Canvas wrapper + state management.
// Uses LandingRoomScene for the 3D rendering.

import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ROOMS_WITH_BRAND as DEFAULT_ROOMS } from './endlessRooms'
import LandingRoomScene from './LandingRoomScene'

export default function RotatingRoom({ onStateChange, rooms: roomsProp, startDelay = 0 }) {
  const ROOMS = roomsProp || DEFAULT_ROOMS
  const [sky, setSky] = useState({ cur: 0, prev: 0, seq: 0 })
  const [captionIdx, setCaptionIdx] = useState(0)
  const tickRef = useRef()

  tickRef.current = ({ caption, front }) => {
    setCaptionIdx(prev => prev === caption ? prev : caption)
    setSky(s => s.cur === front ? s : { cur: front, prev: s.cur, seq: s.seq + 1 })
  }

  useEffect(() => {
    onStateChange?.({
      caption: ROOMS[captionIdx],
      dark: ROOMS[sky.cur].dark,
      sky: ROOMS[sky.cur].sky,
      prevSky: ROOMS[sky.prev].sky,
      skyKey: sky.seq,
      skyMood: ROOMS[sky.cur].mood,
    })
  }, [captionIdx, sky.cur])

  return (
    <div style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 24px 48px rgba(60,80,120,0.25))' }}>
      <Canvas
        orthographic shadows
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <LandingRoomScene tickRef={tickRef} rooms={ROOMS} startDelay={startDelay} />
        </Suspense>
      </Canvas>
    </div>
  )
}
