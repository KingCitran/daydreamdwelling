// Ghost placement preview — translucent preview follows cursor on floor grid.
// R key swaps width/depth (rotating the footprint). Click to place. ESC to cancel.
import { useRef, useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ITEM_CATALOGUE } from '../data/items'
import { useTheme } from '@shared/ThemeProvider'

const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const _ray   = new THREE.Raycaster()
const _ptr   = new THREE.Vector2()
const _hit   = new THREE.Vector3()

const snap = v => Math.round(v)

export default function GhostPreview({ ghost, gridW, gridD, wallHeight, roomRotationRef, onPlace, onCancel, catalogue = ITEM_CATALOGUE }) {
  const { camera, gl } = useThree()
  const groupRef = useRef()
  const posRef   = useRef({ col: Math.floor(gridW / 2), row: Math.floor(gridD / 2) })
  const [rotated, setRotated] = useState(false)
  const rotatedRef = useRef(false)
  const t = useTheme()

  const def = catalogue[ghost.typeKey] ?? ITEM_CATALOGUE[ghost.typeKey]
  const isStairs = !!def?.isStairs
  const rawW = ghost.stairW ?? def?.sizes?.[0]?.footprint?.[0] ?? 1
  const rawD = ghost.stairD ?? def?.sizes?.[0]?.footprint?.[1] ?? 1
  const fh = isStairs ? (wallHeight ?? 8) : (def?.sizes?.[0]?.height ?? 2)
  const stairCount = ghost.stairCount ?? 14

  // R key swaps effective width/depth
  const fw = rotated ? rawD : rawW
  const fd = rotated ? rawW : rawD

  // Track pointer on floor plane
  useEffect(() => {
    const canvas = gl.domElement
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      _ptr.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
       -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      _ray.setFromCamera(_ptr, camera)
      if (!_ray.ray.intersectPlane(_plane, _hit)) return
      const ry = roomRotationRef.current
      const lx = Math.cos(ry) * _hit.x - Math.sin(ry) * _hit.z
      const lz = Math.sin(ry) * _hit.x + Math.cos(ry) * _hit.z
      const r = rotatedRef.current
      const ew = r ? rawD : rawW
      const ed = r ? rawW : rawD
      posRef.current = {
        col: Math.max(0, Math.min(gridW - ew, snap(lx + gridW / 2 - ew / 2))),
        row: Math.max(0, Math.min(gridD - ed, snap(lz + gridD / 2 - ed / 2))),
      }
    }
    canvas.addEventListener('pointermove', onMove)
    return () => canvas.removeEventListener('pointermove', onMove)
  }, [camera, gl, gridW, gridD, rawW, rawD, roomRotationRef])

  // Click to place
  useEffect(() => {
    const canvas = gl.domElement
    const onClick = (e) => {
      if (e.button !== 0) return
      onPlace(posRef.current.col, posRef.current.row, rotatedRef.current ? 90 : 0)
    }
    canvas.addEventListener('click', onClick)
    return () => canvas.removeEventListener('click', onClick)
  }, [gl, onPlace])

  // R to rotate, ESC to cancel
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onCancel(); return }
      if (e.key === 'r' || e.key === 'R') {
        rotatedRef.current = !rotatedRef.current
        setRotated(r => !r)
      }
    }
    const onContext = (e) => { e.preventDefault(); onCancel() }
    window.addEventListener('keydown', onKey)
    gl.domElement.addEventListener('contextmenu', onContext)
    return () => {
      window.removeEventListener('keydown', onKey)
      gl.domElement.removeEventListener('contextmenu', onContext)
    }
  }, [gl, onCancel])

  // Smooth position tracking
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
        // Ghost stair steps — axis-aligned, no rotation group
        <>
          {Array.from({ length: stairCount }, (_, i) => {
            const stepH = fh / stairCount
            const stepD = fd / stairCount
            return (
              <mesh key={i} position={[0, (i + 0.5) * stepH, (i + 0.5) * stepD - fd / 2]}>
                <boxGeometry args={[fw * 0.98, stepH * 0.9, stepD * 0.9]} />
                <meshStandardMaterial color={ghostColor} transparent opacity={0.35} roughness={0.6} />
              </mesh>
            )
          })}
        </>
      ) : (
        <mesh position={[0, fh / 2, 0]}>
          <boxGeometry args={[fw, fh, fd]} />
          <meshStandardMaterial color={ghostColor} transparent opacity={0.35} roughness={0.6} />
        </mesh>
      )}
      {/* Floor footprint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[fw, fd]} />
        <meshBasicMaterial color={ghostColor} transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
