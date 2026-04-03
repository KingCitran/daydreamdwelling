import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Floor from './Floor'
import Walls from './Walls'
import Items from './Items'
import Ceiling from './Ceiling'
import Measurements from './Measurements'

const CAM_OFFSET = 18
const ZOOM_MIN   = 15
const ZOOM_MAX   = 120

// skyColor = indirect ceiling/sky bounce; groundColor = floor bounce (always darker)
// keyI/keyC = main directional (window light); fillI/fillC = soft counter-fill
const MOOD_PRESETS = {
  bright:  { hemiI: 0.65, skyColor: '#f0f6ff', groundColor: '#c0a870', keyI: 1.6,  keyC: '#fffdf5', fillI: 0.30, fillC: '#d0e8ff' },
  day:     { hemiI: 0.40, skyColor: '#d8eeff', groundColor: '#a08850', keyI: 1.2,  keyC: '#fffdf0', fillI: 0.18, fillC: '#c8ddf0' },
  evening: { hemiI: 0.18, skyColor: '#ff9040', groundColor: '#3a1005', keyI: 0.55, keyC: '#ff7030', fillI: 0.08, fillC: '#ff9040' },
  cozy:    { hemiI: 0.04, skyColor: '#ff5010', groundColor: '#180404', keyI: 0.14, keyC: '#b03008', fillI: 0.04, fillC: '#ff5010' },
}

function IsometricCamera({ target, zoomRef }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(CAM_OFFSET, CAM_OFFSET, CAM_OFFSET)
    camera.lookAt(target)
    camera.zoom = zoomRef.current
    camera.updateProjectionMatrix()
  }, [camera, target, zoomRef])
  return null
}

// Orbits the camera Y from +CAM_OFFSET (floor view) to -CAM_OFFSET (ceiling view).
// X and Z stay fixed so the front-of-room orientation never changes.
// The camera always looks at the room's vertical midpoint, so the transition
// feels like the room tilting back — no rotation of room geometry at all.
function CameraOrbitController({ ceilingView, lookAtY }) {
  const { camera } = useThree()
  const camY = useRef(CAM_OFFSET)

  useFrame((_, delta) => {
    const targetY = ceilingView ? -CAM_OFFSET : CAM_OFFSET
    const t = 1 - Math.pow(0.004, delta)   // slightly slower arc than Y-spin
    camY.current = THREE.MathUtils.lerp(camY.current, targetY, t)
    camera.position.y = camY.current
    camera.lookAt(0, lookAtY, 0)
  })
  return null
}

function ScreenshotTrigger({ triggerRef }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    triggerRef.current = () => {
      gl.render(scene, camera)
      const url = gl.domElement.toDataURL('image/png')
      const a = Object.assign(document.createElement('a'), { href: url, download: 'my-room.png' })
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    return () => { triggerRef.current = null }
  }, [gl, scene, camera, triggerRef])
  return null
}

function ZoomController({ zoomRef }) {
  const { camera, gl } = useThree()
  useEffect(() => {
    const el = gl.domElement
    const onWheel = (e) => {
      e.preventDefault()
      zoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomRef.current - e.deltaY * 0.05))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [gl, zoomRef])

  useFrame((_, delta) => {
    const t = 1 - Math.pow(0.003, delta)
    const next = THREE.MathUtils.lerp(camera.zoom, zoomRef.current, t)
    if (Math.abs(next - camera.zoom) > 0.01) {
      camera.zoom = next
      camera.updateProjectionMatrix()
    }
  })
  return null
}

export default function RoomScene({
  targetRotation, cells, gridW, gridD, wallHeight,
  floorColor, wallColor,
  items, selectedId, onSelectItem, onMoveItem, onMoveWallItem, onDoubleClickItem,
  onDragStart, onDragEnd,
  zoomRef, screenshotRef, showMeasurements, showGrid,
  lightMood = 'day',
  ceilingView = false,
  ceilingPicker = null,
  onPlaceCeilingItem,
  onMoveCeilingItem,
  onEnterRoom,
  cartHighlight = null,
}) {
  const mood     = MOOD_PRESETS[lightMood] ?? MOOD_PRESETS.day
  const groupRef = useRef()
  const currentRY = useRef(0)

  const lookAtY = wallHeight / 2
  const camTarget = useMemo(
    () => new THREE.Vector3(0, lookAtY, 0),
    [lookAtY]
  )

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const t = 1 - Math.pow(0.001, delta)
    currentRY.current = THREE.MathUtils.lerp(currentRY.current, targetRotation, t)
    groupRef.current.rotation.y = currentRY.current
  })

  return (
    <>
      <IsometricCamera target={camTarget} zoomRef={zoomRef} />
      <CameraOrbitController ceilingView={ceilingView} lookAtY={lookAtY} />
      <ZoomController zoomRef={zoomRef} />
      <ScreenshotTrigger triggerRef={screenshotRef} />

      {/* Hemisphere: skyColor = ceiling/indirect bounce, groundColor = floor bounce */}
      <hemisphereLight skyColor={mood.skyColor} groundColor={mood.groundColor} intensity={mood.hemiI} />

      {/* Main window/sun light */}
      <directionalLight
        position={[16, 24, 12]}
        intensity={mood.keyI}
        color={mood.keyC}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-bias={-0.001}
        shadow-normalBias={0.02}
      />
      {/* Counter-fill from upper-left */}
      <directionalLight position={[-12, 14, -10]} intensity={mood.fillI} color={mood.fillC} />
      {/* Subtle backlight — separates items from dark corners */}
      <directionalLight position={[0, -6, -22]} intensity={0.07} color="#c8d8ff" />
      {/* In ceiling view: upward fill so the ceiling slab is lit */}
      <directionalLight position={[8, -20, 6]} intensity={ceilingView ? mood.keyI * 0.55 : 0.04} color={mood.keyC} />

      <group ref={groupRef}>
        <Floor
          cells={cells}
          gridW={gridW}
          gridD={gridD}
          floorColor={floorColor}
          showGrid={showGrid}
          onClickFloor={() => onSelectItem(null)}
          ceilingView={ceilingView}
        />
        <Walls
          cells={cells}
          gridW={gridW}
          gridD={gridD}
          wallHeight={wallHeight}
          wallColor={wallColor}
          currentRotationRef={currentRY}
          showGrid={showGrid}
          items={items}
        />
        <Items
          items={items}
          selectedId={selectedId}
          cells={cells}
          gridW={gridW}
          gridD={gridD}
          wallHeight={wallHeight}
          onSelectItem={onSelectItem}
          onMoveItem={onMoveItem}
          onMoveWallItem={onMoveWallItem}
          onDoubleClickItem={onDoubleClickItem}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          roomRotationRef={currentRY}
          ceilingView={ceilingView}
          onEnterRoom={onEnterRoom}
          cartHighlight={cartHighlight}
        />
        <Ceiling
          cells={cells}
          gridW={gridW}
          gridD={gridD}
          wallHeight={wallHeight}
          items={items}
          selectedId={selectedId}
          onClickCell={onPlaceCeilingItem}
          onSelectItem={onSelectItem}
          ceilingPicker={ceilingPicker}
          ceilingView={ceilingView}
          onMoveCeilingItem={onMoveCeilingItem}
          roomRotationRef={currentRY}
          cartHighlight={cartHighlight}
        />
        {showMeasurements && (
          <Measurements gridW={gridW} gridD={gridD} wallHeight={wallHeight} items={items} selectedId={selectedId} />
        )}
      </group>
    </>
  )
}
