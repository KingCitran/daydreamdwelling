// Ghost placement preview — translucent mesh follows cursor on floor grid.
// Used when placing stairs, furniture, etc. before committing position.
import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ITEM_CATALOGUE } from '../data/items'
import { useTheme } from '@shared/ThemeProvider'

const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const _ray   = new THREE.Raycaster()
const _ptr   = new THREE.Vector2()
const _hit   = new THREE.Vector3()

const snap = v => Math.round(v)  // 1-ft grid snap for placement

export default function GhostPreview({ ghost, gridW, gridD, wallHeight, roomRotationRef, onPlace, onCancel, catalogue = ITEM_CATALOGUE }) {
  const { camera, gl } = useThree()
  const groupRef = useRef()
  const posRef   = useRef({ col: Math.floor(gridW / 2), row: Math.floor(gridD / 2) })
  const t = useTheme()

  // Resolve dimensions from ghost config
  const def = catalogue[ghost.typeKey] ?? ITEM_CATALOGUE[ghost.typeKey]
  const isStairs = !!def?.isStairs
  const fw = ghost.stairW ?? def?.sizes?.[0]?.footprint?.[0] ?? 1
  const fd = ghost.stairD ?? def?.sizes?.[0]?.footprint?.[1] ?? 1
  const fh = isStairs ? (wallHeight ?? 8) : (def?.sizes?.[0]?.height ?? 2)
  const stairCount = ghost.stairCount ?? 12

  // Track pointer position on floor plane every frame
  useEffect(() => {
    const canvas = gl.domElement
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      _ptr.set(
        ((e.clientX - rect.left) / rect.width)  *  2 - 1,
       -((e.clientY - rect.top)  / rect.height) *  2 + 1,
      )
      _ray.setFromCamera(_ptr, camera)
      if (!_ray.ray.intersectPlane(_plane, _hit)) return
      const ry = roomRotationRef.current
      const lx = Math.cos(ry) * _hit.x - Math.sin(ry) * _hit.z
      const lz = Math.sin(ry) * _hit.x + Math.cos(ry) * _hit.z
      posRef.current = {
        col: Math.max(0, Math.min(gridW - fw, snap(lx + gridW / 2 - fw / 2))),
        row: Math.max(0, Math.min(gridD - fd, snap(lz + gridD / 2 - fd / 2))),
      }
    }
    canvas.addEventListener('pointermove', onMove)
    return () => canvas.removeEventListener('pointermove', onMove)
  }, [camera, gl, gridW, gridD, fw, fd, roomRotationRef])

  // Click to place
  useEffect(() => {
    const canvas = gl.domElement
    const onClick = (e) => {
      // Only left click
      if (e.button !== 0) return
      onPlace(posRef.current.col, posRef.current.row)
    }
    canvas.addEventListener('click', onClick)
    return () => canvas.removeEventListener('click', onClick)
  }, [gl, onPlace])

  // ESC or right-click to cancel
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    const onContext = (e) => { e.preventDefault(); onCancel() }
    window.addEventListener('keydown', onKey)
    gl.domElement.addEventListener('contextmenu', onContext)
    return () => {
      window.removeEventListener('keydown', onKey)
      gl.domElement.removeEventListener('contextmenu', onContext)
    }
  }, [gl, onCancel])

  // Animate position smoothly
  useFrame(() => {
    if (!groupRef.current) return
    const { col, row } = posRef.current
    const tx = (col + fw / 2) - gridW / 2
    const tz = (row + fd / 2) - gridD / 2
    groupRef.current.position.x += (tx - groupRef.current.position.x) * 0.3
    groupRef.current.position.z += (tz - groupRef.current.position.z) * 0.3
  })

  const ghostColor = t.accent ?? '#9b7ae0'

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {isStairs ? (
        // Stair ghost — stepped boxes
        <group position={[0, 0, 0]}>
          {Array.from({ length: stairCount }, (_, i) => {
            const stepH = fh / stairCount
            const stepD = fd / stairCount
            return (
              <mesh key={i} position={[0, (i + 0.5) * stepH, -fd / 2 + (i + 0.5) * stepD]}>
                <boxGeometry args={[fw, stepH * 0.95, stepD * 0.95]} />
                <meshStandardMaterial color={ghostColor} transparent opacity={0.4} roughness={0.6} />
              </mesh>
            )
          })}
        </group>
      ) : (
        // Generic item ghost — simple box
        <mesh position={[0, fh / 2, 0]}>
          <boxGeometry args={[fw, fh, fd]} />
          <meshStandardMaterial color={ghostColor} transparent opacity={0.4} roughness={0.6} />
        </mesh>
      )}
      {/* Floor footprint indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[fw, fd]} />
        <meshBasicMaterial color={ghostColor} transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
