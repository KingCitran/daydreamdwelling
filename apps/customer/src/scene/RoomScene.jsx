import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Floor from './Floor'
import Walls from './Walls'
import Items from './Items'
import Ceiling from './Ceiling'
import Measurements from './Measurements'
import GhostPreview from './GhostPreview'
import { useMoodControl } from '@shared/ThemeProvider'

const CAM_OFFSET = 18
const ZOOM_MIN   = 15
const ZOOM_MAX   = 120

// skyColor = indirect ceiling/sky bounce; groundColor = floor bounce (always darker)
// keyI/keyC = main directional (window light); fillI/fillC = soft counter-fill
// Goal: atmosphere without color-casting walls — keep keyC near-white, raise hemiI in dark moods
const MOOD_SCENE_PRESETS = {
  'Golden Hour':      { hemiI: 0.28, skyColor: '#c8a870', groundColor: '#4a2010', keyI: 0.80, keyC: '#fff4e0', fillI: 0.18, fillC: '#f0ddb0' },
  'Bright Day':       { hemiI: 0.55, skyColor: '#e8f0f8', groundColor: '#b8a870', keyI: 1.20, keyC: '#fffdf8', fillI: 0.28, fillC: '#e0ecf8' },
  'Vivid Sunset':     { hemiI: 0.22, skyColor: '#9a5830', groundColor: '#1e0808', keyI: 0.40, keyC: '#f0b870', fillI: 0.14, fillC: '#d09050' },
  'Moonlight':        { hemiI: 0.28, skyColor: '#a0a8c0', groundColor: '#0a0c18', keyI: 0.42, keyC: '#dce8f8', fillI: 0.16, fillC: '#9098b8' },
  'Dark Academia':    { hemiI: 0.22, skyColor: '#9a8050', groundColor: '#160c04', keyI: 0.48, keyC: '#f0d888', fillI: 0.14, fillC: '#c8a858' },
  'Blush Hour': { hemiI: 0.40, skyColor: '#f0c0b0', groundColor: '#9a5040', keyI: 0.72, keyC: '#ffe8d8', fillI: 0.22, fillC: '#f0cabb' },
  'Coastal Morning':  { hemiI: 0.50, skyColor: '#c0e0f0', groundColor: '#6090b0', keyI: 1.10, keyC: '#f0f8ff', fillI: 0.28, fillC: '#c0d8f0' },
  'Dream State':      { hemiI: 0.45, skyColor: '#ccc0e8', groundColor: '#9078b0', keyI: 0.82, keyC: '#f8f0ff', fillI: 0.22, fillC: '#d8c8f4' },
  'Neon Nights':      { hemiI: 0.18, skyColor: '#401890', groundColor: '#000820', keyI: 0.48, keyC: '#e070d0', fillI: 0.20, fillC: '#2040c0' },
  'Candlelit Cozy Evening':      { hemiI: 0.18, skyColor: '#9a5828', groundColor: '#0e0000', keyI: 0.32, keyC: '#f8b060', fillI: 0.12, fillC: '#e09050' },
  'Greenhouse':       { hemiI: 0.40, skyColor: '#88c868', groundColor: '#384010', keyI: 0.88, keyC: '#ecf8d0', fillI: 0.22, fillC: '#a8cc78' },
  'Studio':           { hemiI: 0.60, skyColor: '#f8f8f8', groundColor: '#c0c0c0', keyI: 1.30, keyC: '#ffffff', fillI: 0.40, fillC: '#f0f0f0' },
  'Studio Dark':      { hemiI: 0.50, skyColor: '#d8d8d8', groundColor: '#808080', keyI: 1.10, keyC: '#ffffff', fillI: 0.35, fillC: '#f0f0f0' },
}
// Legacy fallbacks for old save files
const MOOD_LEGACY = {
  bright:  MOOD_SCENE_PRESETS['Bright Day'],
  day:     { hemiI: 0.40, skyColor: '#d8eeff', groundColor: '#a08850', keyI: 1.2,  keyC: '#fffdf0', fillI: 0.18, fillC: '#c8ddf0' },
  evening: MOOD_SCENE_PRESETS['Golden Hour'],
  cozy:    MOOD_SCENE_PRESETS['Vivid Sunset'],
}

// Touch gesture controller — swipe to rotate, 2-finger pinch to zoom + pan.
// Suppresses rotation while an item is being dragged (activeDragRef).
function TouchController({ onRotate, onSwipeVertical, zoomRef, panRef, activeDragRef }) {
  const { gl } = useThree()
  const touchState = useRef({ startX: 0, startY: 0, startDist: 0, startZoom: 0, startMidX: 0, startMidY: 0, startPanX: 0, startPanZ: 0, singleTouch: false })

  useEffect(() => {
    const el = gl.domElement
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        touchState.current.startX = e.touches[0].clientX
        touchState.current.startY = e.touches[0].clientY
        touchState.current.singleTouch = true
      } else if (e.touches.length === 2) {
        touchState.current.singleTouch = false
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        touchState.current.startDist = Math.hypot(dx, dy)
        touchState.current.startZoom = zoomRef.current
        // Track midpoint for pan (delta-based)
        touchState.current.lastMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        touchState.current.lastMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      }
    }
    const onTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        const dist = Math.hypot(dx, dy)
        // Pinch zoom
        const scale = dist / (touchState.current.startDist || 1)
        zoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, touchState.current.startZoom * scale))
        // 2-finger pan — delta from last midpoint
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        const tdx = midX - touchState.current.lastMidX
        const tdy = midY - touchState.current.lastMidY
        touchState.current.lastMidX = midX
        touchState.current.lastMidY = midY

        const s = 0.5 / zoomRef.current
        panRef.current.x -= (tdx * 0.707 + tdy * 0.408) * s
        panRef.current.z -= (tdx * -0.707 + tdy * 0.408) * s
      }
    }
    const onTouchEnd = (e) => {
      // Don't rotate/swipe if the user was dragging an item
      if (activeDragRef?.current !== null) {
        touchState.current.singleTouch = false
        return
      }
      if (touchState.current.singleTouch && e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchState.current.startX
        const dy = e.changedTouches[0].clientY - touchState.current.startY
        const absDx = Math.abs(dx), absDy = Math.abs(dy)
        if (absDx > absDy && absDx > 120) {
          onRotate(dx > 0 ? Math.PI / 2 : -Math.PI / 2)
        } else if (absDy > absDx && absDy > 120 && onSwipeVertical) {
          onSwipeVertical(dy < 0 ? 'up' : 'down')
        }
      }
      touchState.current.singleTouch = false
    }
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [gl, onRotate, onSwipeVertical, zoomRef, panRef, activeDragRef])
  return null
}

function IsometricCamera({ target, zoomRef, panRef }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(CAM_OFFSET + panRef.current.x, CAM_OFFSET, CAM_OFFSET + panRef.current.z)
    camera.lookAt(target.x + panRef.current.x, target.y, target.z + panRef.current.z)
    camera.zoom = zoomRef.current
    camera.updateProjectionMatrix()
  }, [camera, target, zoomRef, panRef])
  return null
}

// Orbits the camera Y from +CAM_OFFSET (floor view) to -CAM_OFFSET (ceiling view).
// X and Z stay fixed so the front-of-room orientation never changes.
// The camera always looks at the room's vertical midpoint, so the transition
// feels like the room tilting back — no rotation of room geometry at all.
function CameraOrbitController({ ceilingView, lookAtY, panRef }) {
  const { camera } = useThree()
  const camY = useRef(CAM_OFFSET)

  useFrame((_, delta) => {
    const targetY = ceilingView ? -CAM_OFFSET : CAM_OFFSET
    const t = 1 - Math.pow(0.004, delta)
    camY.current = THREE.MathUtils.lerp(camY.current, targetY, t)
    const px = panRef.current.x, pz = panRef.current.z
    camera.position.set(CAM_OFFSET + px, camY.current, CAM_OFFSET + pz)
    camera.lookAt(px, lookAtY, pz)
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

function ZoomController({ zoomRef, panRef }) {
  const { camera, gl } = useThree()
  const dragState = useRef({ active: false, startX: 0, startY: 0, startPanX: 0, startPanZ: 0 })

  useEffect(() => {
    const el = gl.domElement
    const onWheel = (e) => {
      e.preventDefault()
      zoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomRef.current - e.deltaY * 0.05))
    }
    // Desktop pan: middle-click drag or shift+left-click drag.
    // Uses the camera's orthographic frustum to convert screen pixels
    // to world units 1:1 — feels like grabbing the floor and sliding
    // it. Camera right/up vectors handle the isometric angle naturally.
    const onMouseDown = (e) => {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        e.preventDefault()
        dragState.current = { active: true, lastX: e.clientX, lastY: e.clientY }
      }
    }
    const onMouseMove = (e) => {
      if (!dragState.current.active) return
      const dx = e.clientX - dragState.current.lastX
      const dy = e.clientY - dragState.current.lastY
      dragState.current.lastX = e.clientX
      dragState.current.lastY = e.clientY

      // Simple proportional pan: 20 world units / (zoom * viewport)
      // gives ~1:1 feel across zoom levels. The 20 matches our room
      // scale (~20ft rooms). Isometric vectors map screen axes to XZ.
      const s = 0.5 / camera.zoom
      panRef.current.x -= (dx * 0.707 + dy * 0.408) * s
      panRef.current.z -= (dx * -0.707 + dy * 0.408) * s
    }
    const onMouseUp = () => { dragState.current.active = false }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [gl, zoomRef, panRef])

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
  floorColor, floorTexture, floorOverrides, wallColor, wallTexture, wallFinish, wallOverrides,
  paintMode, onClickCell, onClickWall,
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
  lightsOff = false,
  catalogue,
  cloudsOn = true,
  ghostPlacement = null,
  onGhostPlace,
  onGhostCancel,
  onRotate,
  onSwipeVertical,
  panRef: externalPanRef,
  yOffset = 0,
  lookAtYOverride,
}) {
  const { mood: sharedMood } = useMoodControl()
  const mood = MOOD_SCENE_PRESETS[sharedMood] ?? MOOD_LEGACY[lightMood] ?? MOOD_LEGACY.day
  const groupRef = useRef()
  const currentRY = useRef(0)
  const activeDragRef = useRef(null)
  const internalPanRef = useRef({ x: 0, z: 0 })
  const panRef = externalPanRef || internalPanRef

  // Cells to cut from the floor (under return stairs = stairwell openings)
  const floorCutouts = useMemo(() => {
    const cuts = new Set()
    for (const it of items) {
      if (!it.stairs || !it.returnStair) continue
      const sw = it.stairW ?? 3, sd = it.stairD ?? 5
      const rotated = it.rotation === 90 || it.rotation === 270
      const ew = rotated ? sd : sw, ed = rotated ? sw : sd
      for (let dc = 0; dc < ew; dc++)
        for (let dr = 0; dr < ed; dr++)
          cuts.add(`${it.col + dc},${it.row + dr}`)
    }
    return cuts
  }, [items])

  const lookAtY = lookAtYOverride ?? (wallHeight / 2 + yOffset)
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
      <IsometricCamera target={camTarget} zoomRef={zoomRef} panRef={panRef} />
      <CameraOrbitController ceilingView={ceilingView} lookAtY={lookAtY} panRef={panRef} />
      <ZoomController zoomRef={zoomRef} panRef={panRef} />
      {onRotate && <TouchController onRotate={onRotate} onSwipeVertical={onSwipeVertical} zoomRef={zoomRef} panRef={panRef} activeDragRef={activeDragRef} />}
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

      <group ref={groupRef} position={[0, yOffset, 0]}>
        <Floor
          cells={cells}
          gridW={gridW}
          gridD={gridD}
          floorColor={floorColor}
          floorTexture={floorTexture}
          floorOverrides={floorOverrides}
          showGrid={showGrid}
          floorCutouts={floorCutouts}
          onClickFloor={ghostPlacement ? undefined : () => onSelectItem(null)}
          onClickCell={onClickCell}
          ceilingView={ceilingView}
          paintMode={paintMode}
        />
        <Walls
          cells={cells}
          gridW={gridW}
          gridD={gridD}
          wallHeight={wallHeight}
          wallColor={wallColor}
          wallTexture={wallTexture}
          wallFinish={wallFinish}
          wallOverrides={wallOverrides}
          currentRotationRef={currentRY}
          showGrid={showGrid}
          items={items}
          paintMode={paintMode}
          onClickWall={onClickWall}
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
          lightsOff={lightsOff}
          catalogue={catalogue}
          activeDragRef={activeDragRef}
        />
        {ghostPlacement && (
          <GhostPreview
            ghost={ghostPlacement}
            gridW={gridW} gridD={gridD}
            wallHeight={wallHeight}
            roomRotationRef={currentRY}
            onPlace={onGhostPlace}
            onCancel={onGhostCancel}
            catalogue={catalogue}
          />
        )}
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
          lightsOff={lightsOff}
        />
        {showMeasurements && (
          <Measurements gridW={gridW} gridD={gridD} wallHeight={wallHeight} items={items} selectedId={selectedId} />
        )}
      </group>
    </>
  )
}
