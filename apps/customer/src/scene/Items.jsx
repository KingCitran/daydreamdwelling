import { useRef, useState, useMemo, memo, Suspense } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { ITEM_CATALOGUE } from '../data/items'
import { findSurfaceAt, isSurfaceItem } from '../utils/roomGeometry'
import { getTexture } from './textures'

// Shared wood texture for doors and window frames.
let _woodPBR = null
function getWoodPBR() {
  if (!_woodPBR) _woodPBR = getTexture('wood', '#ffffff')
  return _woodPBR
}

// D-shape geometry for D-rug and D-window items
import { makeDShape as _makeDShape, weaveRugTexture } from './dShapes'
let _dRugTex = null
// Lazy-init so texture is only created when a D-rug exists
if (typeof window !== 'undefined') {
  try { _dRugTex = weaveRugTexture() } catch {}
}

// Wood-textured material — used for door panels, frames, window frames.
// color tints the texture (white = natural wood, darker = stained).
function WoodMaterial({ color, roughness = 0.75 }) {
  const pbr = getWoodPBR()
  return (
    <meshStandardMaterial
      color={color}
      map={pbr?.map || undefined}
      normalMap={pbr?.normalMap || undefined}
      roughnessMap={pbr?.roughnessMap || undefined}
      roughness={pbr?.roughnessMap ? 1.0 : roughness}
      metalness={0}
    />
  )
}

const WALL_T      = 0.28
const _plane      = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const _ray        = new THREE.Raycaster()
const _ptr        = new THREE.Vector2()
const _hit        = new THREE.Vector3()

const snapF = v => Math.round(v * 4) / 4   // 0.25 ft grid (floor — finer for better placement)
const snapW = v => Math.round(v * 4) / 4   // 0.25 ft grid (wall)

// Point-light config per lighting typeKey — color, intensity, distance (in ft)
// Note: ceiling items (chandelier, pendant, recessedLight, ceilingFan) are rendered
// exclusively by Ceiling.jsx and are skipped here.
const LIGHT_CONFIG = {
  floorLamp:    { color: '#ffcc88', intensity: 3.0, distance: 12 },
  tableLamp:    { color: '#ffcc88', intensity: 2.0, distance: 8  },
  stringLights: { color: '#ffe8a0', intensity: 1.2, distance: 6  },
  deskLamp:     { color: '#ffcc88', intensity: 1.8, distance: 6  },
  wallSconce:   { color: '#ffcc88', intensity: 2.5, distance: 8  },
}

// Renders a .glb model loaded from Supabase Storage. Falls back to nothing
// if the load fails (caller wraps in Suspense with a box fallback).
// Fresh clone on every size change so Box3 always measures the original geometry.
// Sheen → Three.js roughness target. Blended with the model's own roughness
// so mixed-material products (chrome legs + matte wood top) keep their variation.
const SHEEN_ROUGHNESS = { flat: 0.95, eggshell: 0.82, satin: 0.65, semiGloss: 0.42, highGloss: 0.18 }
const BLEND = 0.5 // 50% model's own roughness, 50% seller's target

export const GlbModel = memo(function GlbModel({ url, fw, fh, fd, scale = 1, rotationDeg = 0, materialSheen = null }) {
  const { scene } = useGLTF(url)

  // Clone fresh every time dimensions change so we always measure unscaled geometry
  const model = useMemo(() => {
    const cloned = scene.clone(true)
    const sheenTarget = materialSheen ? SHEEN_ROUGHNESS[materialSheen] : null

    // Brighten materials and enable shadow casting on every mesh.
    // Tripo models bake ambient occlusion into textures (too dark) but
    // also capture real material variation (metal vs wood vs fabric).
    // We preserve that variation while nudging toward the seller's sheen.
    cloned.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          const mat = child.material
          if (mat.color) mat.color.multiplyScalar(1.3)

          if (sheenTarget != null && mat.roughness != null) {
            // Blend: keep model's material variation, pull toward seller's target.
            // A chrome leg (model roughness ~0.2) stays shinier than a wood top
            // (model roughness ~0.7) even when seller picks "satin" for both.
            mat.roughness = mat.roughness * BLEND + sheenTarget * (1 - BLEND)
            // Boost metalness slightly for glossy targets so shiny parts reflect
            if (sheenTarget < 0.5) {
              mat.metalness = Math.max(mat.metalness ?? 0, 0.04)
            }
          } else if (mat.roughness != null) {
            mat.roughness = Math.min(mat.roughness, 0.88)
          }
          mat.envMapIntensity = 1.5
          mat.needsUpdate = true
        }
      }
    })

    const box = new THREE.Box3().setFromObject(cloned)
    const size = box.getSize(new THREE.Vector3())
    const min = box.min.clone()
    if (size.x === 0 || size.y === 0 || size.z === 0) return cloned
    // Scale to fit inside the declared footprint box
    const fitScale = Math.min(fw / size.x, fh / size.y, fd / size.z) * scale
    cloned.scale.setScalar(fitScale)
    // Position so the model sits on the floor (y=0) and is centered on x/z.
    // The parent group is already at wy = fh/2, so we offset down by -fh/2
    // to put the model's bottom at y = -fh/2 (world y=0).
    const cx = (box.min.x + box.max.x) / 2
    const cz = (box.min.z + box.max.z) / 2
    cloned.position.set(
      -cx * fitScale,
      -min.y * fitScale - fh / 2,
      -cz * fitScale,
    )
    return cloned
  }, [scene, fw, fh, fd, scale, materialSheen])

  return (
    <group rotation={[0, -(rotationDeg * Math.PI) / 180, 0]}>
      <primitive object={model} />
    </group>
  )
})

export function isWallDef(def) {
  return def.category === 'Wall Decor' || def.subcategory === 'Wall Sconces' || def.category === 'Windows' || def.category === 'Doors'
}

// Returns the world-space wall CENTER coordinate (z for N/S, x for W/E).
// wallAnchor — when set, overrides the colBounds/rowBounds lookup so items on interior
// wall faces (parallel to an outer wall) sit on the right face rather than the outermost.
function actualWallFace(wall, wallU, gridW, gridD, colBounds, rowBounds, wallAnchor) {
  switch (wall) {
    case 'N': {
      const col = Math.max(0, Math.min(gridW - 1, Math.floor(wallU)))
      const row = wallAnchor ?? (colBounds[col]?.minR ?? 0)
      return row - gridD / 2
    }
    case 'S': {
      const col = Math.max(0, Math.min(gridW - 1, Math.floor(wallU)))
      const row = wallAnchor ?? (colBounds[col]?.maxR ?? gridD - 1)
      return row + 1 - gridD / 2
    }
    case 'W': {
      const row = Math.max(0, Math.min(gridD - 1, Math.floor(wallU)))
      const col = wallAnchor ?? (rowBounds[row]?.minC ?? 0)
      return col - gridW / 2
    }
    case 'E': {
      const row = Math.max(0, Math.min(gridD - 1, Math.floor(wallU)))
      const col = wallAnchor ?? (rowBounds[row]?.maxC ?? gridW - 1)
      return col + 1 - gridW / 2
    }
    default: return 0
  }
}

// ── Stair visual — adapted from open3dFloorplan (MIT license) ──
// Treads + risers + side stringers. fw/fd are RAW unrotated dimensions.
// Centered at origin, parent rotation group handles orientation.
function StairVisual({ fw, fd, wallHeight, stairCount, color }) {
  const wh = wallHeight ?? 8
  const sc = stairCount ?? 14
  const riserH = wh / sc
  const treadD = fd / sc
  const treadThick = 0.12  // ~1.5 inches
  const riserThick = 0.08
  const stringerW = 0.1
  const darkerColor = '#8a6a48'
  const stringerColor = '#7a5a38'
  return (
    <group position={[0, 0, -fd / 2]}>
      {/* Treads + risers */}
      {Array.from({ length: sc }, (_, i) => (
        <group key={i}>
          <mesh position={[0, (i + 1) * riserH - treadThick / 2, i * treadD + treadD / 2]}
            castShadow receiveShadow>
            <boxGeometry args={[fw, treadThick, treadD]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[0, i * riserH + riserH / 2, i * treadD + riserThick / 2]}
            castShadow>
            <boxGeometry args={[fw - stringerW * 2, riserH, riserThick]} />
            <meshStandardMaterial color={darkerColor} roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Side stringers — diagonal boards supporting the steps */}
      {[-1, 1].map(side => (
        <mesh key={side}
          position={[side * (fw / 2 - stringerW / 2), wh / 2, fd / 2]}
          castShadow>
          <boxGeometry args={[stringerW, wh * 1.02, fd * 1.01]} />
          <meshStandardMaterial color={stringerColor} roughness={0.75} />
        </mesh>
      ))}
    </group>
  )
}

// ── Floor item ─────────────────────────────────────────────────────
const ItemMesh = memo(function ItemMesh({ item, allItems, isSelected, isCartHighlighted, gridW, gridD, wallHeight, onSelect, onMove, onDoubleClick,
                    onDragStart, onDragEnd, roomRotationRef, activeDragRef, hoveredSurfaceRef, lightsOff = false, catalogue = ITEM_CATALOGUE, onEnterRoom }) {
  const def        = catalogue[item.typeKey]
  if (!def || !def.sizes) return null   // live-only product, no 3D geometry
  const size       = def.sizes[item.sizeIndex] ?? def.sizes[0]
  if (!size) return null
  const isStairs   = !!def.isStairs && !!item.stairs
  // Stairs use their own stairW/stairD dimensions
  const [fw, fd]   = isStairs
    ? [item.stairW ?? 1, item.stairD ?? 3]
    : (size.footprint && size.footprint[0] > 0) ? size.footprint : [2, 2]
  const fh         = isStairs ? (wallHeight ?? 8) : (size.height && size.height > 0) ? size.height : 2
  const rotated    = item.rotation === 90 || item.rotation === 270
  const effectiveW = rotated ? fd : fw
  const effectiveD = rotated ? fw : fd
  const wx = (item.col + effectiveW / 2) - gridW / 2
  const wz = (item.row + effectiveD / 2) - gridD / 2

  // Surface stacking: if item is on a parent surface, raise it by parent's height
  let surfaceY = 0
  if (item.parentId != null) {
    const parent = allItems?.find(it => it.id === item.parentId)
    if (parent) {
      const pDef = catalogue[parent.typeKey] ?? ITEM_CATALOGUE[parent.typeKey]
      const pSize = pDef?.sizes?.[parent.sizeIndex] ?? pDef?.sizes?.[0]
      surfaceY = (pSize?.height && pSize.height > 0) ? pSize.height : 2
    }
  }
  const wy = isStairs ? 0 : (fh / 2 + surfaceY)

  const lightCfg = LIGHT_CONFIG[item.typeKey] ?? null
  // Chandelier represents ceiling mount — push the point light up near the ceiling
  const lightY = item.typeKey === 'chandelier' && wallHeight
    ? (wallHeight ?? 3) - fh   // world Y ≈ wallHeight − fh/2
    : fh * 0.4                 // near top of item

  const { camera, gl } = useThree()

  const pointerToGrid = (clientX, clientY) => {
    _ptr.set(
       (clientX / gl.domElement.clientWidth)  *  2 - 1,
      -(clientY / gl.domElement.clientHeight) *  2 + 1,
    )
    _ray.setFromCamera(_ptr, camera)
    if (!_ray.ray.intersectPlane(_plane, _hit)) return null
    const ry = roomRotationRef.current
    const lx = Math.cos(ry) * _hit.x - Math.sin(ry) * _hit.z
    const lz = Math.sin(ry) * _hit.x + Math.cos(ry) * _hit.z
    return {
      col: Math.max(0, Math.min(gridW - effectiveW, snapF(lx + gridW / 2 - effectiveW / 2))),
      row: Math.max(0, Math.min(gridD - effectiveD, snapF(lz + gridD / 2 - effectiveD / 2))),
    }
  }

  const onPointerDown = (e) => {
    e.stopPropagation()
    onSelect(item.id)
    if (item.locked) return
    if (activeDragRef.current !== null) return
    activeDragRef.current = item.id
    onDragStart()
    const canvas = gl.domElement
    canvas.style.cursor = 'grabbing'
    const capturedId = item.id
    let lastCol = -1, lastRow = -1
    const def_ = catalogue[item.typeKey]
    const isSurfaceCandidate = def_ && !isSurfaceItem(def_) && !item.wall && !item.ceiling
    const handleMove = (ev) => {
      const g = pointerToGrid(ev.clientX, ev.clientY)
      if (g && (g.col !== lastCol || g.row !== lastRow)) {
        lastCol = g.col; lastRow = g.row
        onMove(capturedId, g.col, g.row)
        // Surface highlight: detect if dragged item is over a surface
        if (hoveredSurfaceRef && isSurfaceCandidate) {
          const testItem = { ...item, col: g.col, row: g.row }
          const surface = findSurfaceAt(allItems, testItem, catalogue)
          hoveredSurfaceRef.current = surface?.id ?? null
        }
      }
    }
    const handleUp   = () => {
      activeDragRef.current = null; canvas.style.cursor = ''; onDragEnd()
      if (hoveredSurfaceRef) hoveredSurfaceRef.current = null
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup',   handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup',   handleUp)
  }

  const outlineColor = item.locked ? '#f0c060' : item.owned ? '#f0c060' : '#9a7aee'

  const modelUrl = def.modelUrl || null
  const modelScale = def.scaleMultiplier ?? 1
  const modelRotation = def.orientationOffsetDeg ?? 0

  return (
    <group
      position={[wx, wy, wz]}
      onPointerDown={onPointerDown}
      onClick={e => e.stopPropagation()}
      onDoubleClick={e => { e.stopPropagation(); if (isStairs && onEnterRoom) onEnterRoom(item.id); else onDoubleClick(item.typeKey) }}
    >
      {isStairs && item.returnStair ? (
        /* Floor opening: trim border + 3-sided safety railing (open on front) */
        <group>
          {/* Wooden trim around the opening edge */}
          {[
            { p: [0, 0.06, -effectiveD/2], s: [effectiveW + 0.12, 0.12, 0.06] },
            { p: [0, 0.06,  effectiveD/2], s: [effectiveW + 0.12, 0.12, 0.06] },
            { p: [-effectiveW/2, 0.06, 0],  s: [0.06, 0.12, effectiveD] },
            { p: [ effectiveW/2, 0.06, 0],  s: [0.06, 0.12, effectiveD] },
          ].map(({ p, s }, i) => (
            <mesh key={`t${i}`} position={p} castShadow>
              <boxGeometry args={s} />
              <meshStandardMaterial color="#a08060" roughness={0.75} />
            </mesh>
          ))}
          {/* Corner posts — 3ft tall (~36 inches, standard railing) */}
          {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz], i) => (
            <mesh key={`p${i}`} position={[sx * effectiveW/2, 1.5, sz * effectiveD/2]} castShadow>
              <boxGeometry args={[0.1, 3, 0.1]} />
              <meshStandardMaterial color="#8a6a48" roughness={0.65} />
            </mesh>
          ))}
          {/* Top rails on 3 sides (open on +D side for stair access) */}
          <mesh position={[0, 3, -effectiveD/2]} castShadow>
            <boxGeometry args={[effectiveW, 0.06, 0.06]} />
            <meshStandardMaterial color="#a08060" roughness={0.7} />
          </mesh>
          <mesh position={[-effectiveW/2, 3, 0]} castShadow>
            <boxGeometry args={[0.06, 0.06, effectiveD]} />
            <meshStandardMaterial color="#a08060" roughness={0.7} />
          </mesh>
          <mesh position={[effectiveW/2, 3, 0]} castShadow>
            <boxGeometry args={[0.06, 0.06, effectiveD]} />
            <meshStandardMaterial color="#a08060" roughness={0.7} />
          </mesh>
        </group>
      ) : isStairs ? (
        /* Rotation applied to the group, steps built along raw depth axis
           — ported from open3dFloorplan pattern */
        <group rotation={[0, -(item.rotation * Math.PI) / 180, 0]}>
          <StairVisual fw={fw} fd={fd} wallHeight={wallHeight} stairCount={item.stairCount ?? 14} color={def.swatches?.[item.swatchIndex]?.hex ?? def.color ?? '#9a8a7a'} />
        </group>
      ) : modelUrl ? (
        <group rotation={[0, -(item.rotation * Math.PI) / 180, 0]}>
          {/* Contact shadow — soft multi-ring oval for grounded look */}
          <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -fh / 2 + 0.003, 0]}>
            {/* Core shadow — tight under the item */}
            <mesh scale={[fw * 0.4, fd * 0.4, 1]}>
              <circleGeometry args={[1, 32]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.18} depthWrite={false} />
            </mesh>
            {/* Mid ring — softer spread */}
            <mesh scale={[fw * 0.55, fd * 0.55, 1]} position={[0, 0, -0.001]}>
              <circleGeometry args={[1, 32]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.09} depthWrite={false} />
            </mesh>
            {/* Outer ring — feathered edge */}
            <mesh scale={[fw * 0.7, fd * 0.7, 1]} position={[0, 0, -0.002]}>
              <circleGeometry args={[1, 32]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.04} depthWrite={false} />
            </mesh>
          </group>
          <Suspense fallback={
            <mesh castShadow receiveShadow>
              <boxGeometry args={[fw, fh, fd]} />
              <meshStandardMaterial color={def.swatches?.[item.swatchIndex]?.hex ?? def.color ?? '#9a7aee'} roughness={0.76} opacity={0.4} transparent />
            </mesh>
          }>
            <GlbModel url={modelUrl} fw={fw} fh={fh} fd={fd} scale={modelScale} rotationDeg={modelRotation} materialSheen={def.materialSheen} />
          </Suspense>
        </group>
      ) : def.dShape && !def.window ? (
        /* D-shaped floor item (D-rug) — woven texture on D-shaped flat mesh */
        <group rotation={[0, -(item.rotation * Math.PI) / 180, 0]}>
          <mesh rotation-x={-Math.PI / 2} position-y={-fh / 2 + 0.01} receiveShadow>
            <shapeGeometry args={[_makeDShape(fw, fd)]} />
            <meshStandardMaterial
              map={_dRugTex}
              color={def.swatches?.[item.swatchIndex]?.hex ?? def.color ?? '#d4b880'}
              roughness={0.92}
              polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2}
            />
          </mesh>
        </group>
      ) : (
        <group rotation={[0, -(item.rotation * Math.PI) / 180, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[fw, fh, fd]} />
            <meshStandardMaterial
              color={def.swatches?.[item.swatchIndex]?.hex ?? def.color ?? '#9a7aee'}
              roughness={0.76} metalness={0}
              emissive={lightCfg && !lightsOff ? lightCfg.color : '#000000'}
              emissiveIntensity={lightCfg && !lightsOff ? 0.25 : 0}
            />
          </mesh>
        </group>
      )}
      {lightCfg && !lightsOff && (
        <pointLight
          position={[0, lightY, 0]}
          color={lightCfg.color}
          intensity={lightCfg.intensity}
          distance={lightCfg.distance}
          decay={2}
        />
      )}
      {isCartHighlighted && !isSelected && (
        <mesh>
          <boxGeometry args={[fw + 0.16, fh + 0.16, fd + 0.16]} />
          <meshBasicMaterial color="#ffd700" wireframe />
        </mesh>
      )}
      {isSelected && (
        <mesh>
          <boxGeometry args={[fw + 0.08, fh + 0.08, fd + 0.08]} />
          <meshBasicMaterial color={outlineColor} wireframe />
        </mesh>
      )}
    </group>
  )
})

// Returns the [minU, maxU] of the contiguous wall-face segment at wallAnchor that contains
// the item's current wallU position.  Used to clamp drag so items stop at wall edges.
function getWallFaceBounds(wall, wallAnchor, wallU, cells, gridW, gridD) {
  if (wallAnchor === undefined) {
    return wall === 'N' || wall === 'S' ? [0, gridW] : [0, gridD]
  }
  if (wall === 'N' || wall === 'S') {
    const r  = wallAnchor
    const c0 = Math.max(0, Math.min(gridW - 1, Math.floor(wallU)))
    const ok = wall === 'N'
      ? c => cells.has(`${c},${r}`) && !cells.has(`${c},${r - 1}`)
      : c => cells.has(`${c},${r}`) && !cells.has(`${c},${r + 1}`)
    if (!ok(c0)) return [0, gridW]   // stale anchor — safe fallback
    let lo = c0, hi = c0
    while (lo > 0       && ok(lo - 1)) lo--
    while (hi < gridW-1 && ok(hi + 1)) hi++
    return [lo, hi + 1]
  } else {
    const c  = wallAnchor
    const r0 = Math.max(0, Math.min(gridD - 1, Math.floor(wallU)))
    const ok = wall === 'W'
      ? r => cells.has(`${c},${r}`) && !cells.has(`${c - 1},${r}`)
      : r => cells.has(`${c},${r}`) && !cells.has(`${c + 1},${r}`)
    if (!ok(r0)) return [0, gridD]
    let lo = r0, hi = r0
    while (lo > 0       && ok(lo - 1)) lo--
    while (hi < gridD-1 && ok(hi + 1)) hi++
    return [lo, hi + 1]
  }
}

// ── Wall item ──────────────────────────────────────────────────────
const WallItemMesh = memo(function WallItemMesh({ item, isSelected, isCartHighlighted, gridW, gridD, wallHeight, colBounds, rowBounds, cells, wallVisible, onSelect, onMoveWall,
                        onDoubleClick, onDragStart, onDragEnd, roomRotationRef, activeDragRef, onEnterRoom, lightsOff = false, catalogue = ITEM_CATALOGUE }) {
  const def      = catalogue[item.typeKey]
  if (!def || !def.sizes) return null
  const size     = def.sizes[item.sizeIndex] ?? def.sizes[0]
  if (!size?.footprint) return null
  const fw       = item.customW ?? size.footprint[0]
  const fd       = size.footprint[1]
  const fh       = item.customH ?? (size.height || 1)
  const lightCfg = LIGHT_CONFIG[item.typeKey] ?? null

  const { camera, gl } = useThree()

  const wallU  = item.wallU ?? gridW / 2
  const wallH  = item.wallH ?? Math.min(wallHeight - fh / 2 - 0.05, wallHeight * 0.6)

  // Compute actual wall face world-space coordinate
  const wf = actualWallFace(item.wall, wallU, gridW, gridD, colBounds, rowBounds, item.wallAnchor)

  // Windows and doors fill the full wall thickness (centered at wall centre).
  // Other wall items (sconces, art) sit against the inner face and protrude inward.
  const OFFSET = (def.window || def.door) ? 0 : WALL_T / 2 + fd / 2

  let wx, wy, wz, rotY
  switch (item.wall) {
    case 'N': wx = wallU - gridW / 2; wy = wallH; wz = wf + OFFSET; rotY = 0;            break
    case 'S': wx = wallU - gridW / 2; wy = wallH; wz = wf - OFFSET; rotY = Math.PI;      break
    case 'W': wx = wf + OFFSET; wy = wallH; wz = wallU - gridD / 2; rotY =  Math.PI / 2; break
    case 'E': wx = wf - OFFSET; wy = wallH; wz = wallU - gridD / 2; rotY = -Math.PI / 2; break
    default:  return null
  }

  const onPointerDown = (e) => {
    e.stopPropagation()
    onSelect(item.id)
    if (item.locked) return
    if (activeDragRef.current !== null) return
    activeDragRef.current = item.id
    onDragStart()
    const canvas = gl.domElement
    canvas.style.cursor = 'grabbing'
    const capturedId = item.id

    // Mutable anchor — starts at item's current anchor and can change when the pointer
    // moves past the current face's valid height range (depth-direction drag).
    // Horizontal-gap cells still freeze (return null) to prevent jumping to interior faces.
    let currentAnchor = item.wallAnchor

    const isNS    = item.wall === 'N' || item.wall === 'S'
    const gridLen = isNS ? gridW : gridD
    const hLo = fh / 2
    const hHi = def.door ? fh / 2 : wallHeight - fh / 2

    // Project pointer onto the given anchor's face plane. Returns {rawU, rawH} or null.
    const projAnchor = (anchor, lox, loy, loz, ldx, ldy, ldz) => {
      if (isNS) {
        const pz = (item.wall === 'N' ? anchor - gridD / 2 + WALL_T / 2
                                      : anchor + 1 - gridD / 2 - WALL_T / 2)
        if (Math.abs(ldz) < 0.001) return null
        const t = (pz - loz) / ldz
        if (t < 0) return null
        return { rawU: lox + t * ldx + gridW / 2, rawH: loy + t * ldy }
      } else {
        const px = (item.wall === 'W' ? anchor - gridW / 2 + WALL_T / 2
                                      : anchor + 1 - gridW / 2 - WALL_T / 2)
        if (Math.abs(ldx) < 0.001) return null
        const t = (px - lox) / ldx
        if (t < 0) return null
        return { rawU: loz + t * ldz + gridD / 2, rawH: loy + t * ldy }
      }
    }

    // Is `anchor` a valid face at column (N/S) or row (W/E) `idx`?
    const anchorOk = (anchor, idx) => {
      if (item.wall === 'N') return cells.has(`${idx},${anchor}`)   && !cells.has(`${idx},${anchor - 1}`)
      if (item.wall === 'S') return cells.has(`${idx},${anchor}`)   && !cells.has(`${idx},${anchor + 1}`)
      if (item.wall === 'W') return cells.has(`${anchor},${idx}`)   && !cells.has(`${anchor - 1},${idx}`)
      /* E */                return cells.has(`${anchor},${idx}`)   && !cells.has(`${anchor + 1},${idx}`)
    }

    // All valid face anchors for item.wall at column/row `idx`, shallow→deep order.
    const facesAt = (idx) => {
      const out = []
      if (item.wall === 'N') { for (let r = 0;        r < gridD;  r++) if (anchorOk(r, idx)) out.push(r) }
      if (item.wall === 'S') { for (let r = gridD - 1; r >= 0;    r--) if (anchorOk(r, idx)) out.push(r) }
      if (item.wall === 'W') { for (let c = 0;        c < gridW;  c++) if (anchorOk(c, idx)) out.push(c) }
      if (item.wall === 'E') { for (let c = gridW - 1; c >= 0;    c--) if (anchorOk(c, idx)) out.push(c) }
      return out
    }

    const pointerToWall = (clientX, clientY) => {
      _ptr.set(
         (clientX / gl.domElement.clientWidth)  *  2 - 1,
        -(clientY / gl.domElement.clientHeight) *  2 + 1,
      )
      _ray.setFromCamera(_ptr, camera)
      const ry = roomRotationRef.current
      const cv = Math.cos(ry), sv = Math.sin(ry)
      const o  = _ray.ray.origin,  d = _ray.ray.direction
      const lox = cv * o.x - sv * o.z, loy = o.y, loz = sv * o.x + cv * o.z
      const ldx = cv * d.x - sv * d.z, ldy = d.y, ldz = sv * d.x + cv * d.z

      const cur = projAnchor(currentAnchor, lox, loy, loz, ldx, ldy, ldz)
      if (!cur) return null

      const idx = Math.max(0, Math.min(gridLen - 1, Math.floor(cur.rawU)))

      // Horizontal boundary: current anchor doesn't exist at this column.
      // Try all faces (bidirectional). The parallax shift (rawU moves by ~anchor_diff
      // when projecting onto a different face plane) naturally prevents gap-jumps:
      // an isolated nook behind an outer-wall gap will land at the wrong altIdx and
      // fail the anchorOk check, so the transition is rejected without special-casing.
      if (!anchorOk(currentAnchor, idx)) {
        for (const anchor of facesAt(idx)) {
          if (anchor === currentAnchor) continue
          const proj = projAnchor(anchor, lox, loy, loz, ldx, ldy, ldz)
          if (!proj) continue
          const altIdx = Math.max(0, Math.min(gridLen - 1, Math.floor(proj.rawU)))
          if (!anchorOk(anchor, altIdx)) continue
          currentAnchor = anchor
          return {
            wallU: Math.max(fw / 2, Math.min(gridLen - fw / 2, snapW(proj.rawU))),
            wallH: Math.max(hLo, Math.min(hHi, snapW(proj.rawH))),
            wallAnchor: currentAnchor,
          }
        }
        return null  // no face reachable at this column → freeze
      }

      // H in valid range → stay on current anchor
      if (cur.rawH >= hLo && cur.rawH <= hHi) {
        return {
          wallU: Math.max(fw / 2, Math.min(gridLen - fw / 2, snapW(cur.rawU))),
          wallH: Math.max(hLo, Math.min(hHi, snapW(cur.rawH))),
          wallAnchor: currentAnchor,
        }
      }

      // H out of range → pointer has moved past this face in the depth direction.
      // Try parallel faces at the same column/row. The H gap between faces equals the
      // anchor distance (~1 unit per row/col), so switching lands firmly in the other
      // face's valid range with no oscillation possible.
      for (const anchor of facesAt(idx)) {
        if (anchor === currentAnchor) continue
        const proj = projAnchor(anchor, lox, loy, loz, ldx, ldy, ldz)
        if (!proj) continue
        const altIdx = Math.max(0, Math.min(gridLen - 1, Math.floor(proj.rawU)))
        if (!anchorOk(anchor, altIdx)) continue
        if (proj.rawH < hLo || proj.rawH > hHi) continue
        currentAnchor = anchor  // commit to new face
        return {
          wallU: Math.max(fw / 2, Math.min(gridLen - fw / 2, snapW(proj.rawU))),
          wallH: Math.max(hLo, Math.min(hHi, snapW(proj.rawH))),
          wallAnchor: currentAnchor,
        }
      }

      // No valid alternative at this column — clamp and stay.
      // Prevents freezing after a boundary transition where the pointer's H
      // projection temporarily exceeds the valid range on the new face.
      return {
        wallU: Math.max(fw / 2, Math.min(gridLen - fw / 2, snapW(cur.rawU))),
        wallH: Math.max(hLo, Math.min(hHi, snapW(cur.rawH))),
        wallAnchor: currentAnchor,
      }
    }

    const handleMove = (ev) => { const g = pointerToWall(ev.clientX, ev.clientY); if (g) onMoveWall(capturedId, g.wallU, g.wallH, g.wallAnchor) }
    const handleUp   = () => {
      activeDragRef.current = null; canvas.style.cursor = ''; onDragEnd()
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup',   handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup',   handleUp)
  }

  const outlineColor = item.locked ? '#f0c060' : item.owned ? '#f0c060' : '#9a7aee'

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    if (def.door && onEnterRoom) { onEnterRoom(item.id); return }
    if (item.stairs && onEnterRoom) { onEnterRoom(item.id); return }
    onDoubleClick(item.typeKey)
  }

  // ── D-Window rendering ──────────────────────────────────────────────
  if (def.window && def.dShape) {
    const FRAME_W = 0.25  // frame ring width
    const frameColor = '#c08a4e'
    const glassHex = def.swatches?.[item.swatchIndex]?.hex ?? '#c0e8ff'
    // D-window frame: rectangular outer (fills the wall opening), D-shaped inner hole
    const dFrameGeo = useMemo(() => {
      const outer = new THREE.Shape()
      outer.moveTo(-fw / 2, -fh / 2)
      outer.lineTo(fw / 2, -fh / 2)
      outer.lineTo(fw / 2, fh / 2)
      outer.lineTo(-fw / 2, fh / 2)
      outer.closePath()
      const iw = fw - FRAME_W * 2, ih = fh - FRAME_W * 2
      const inner = new THREE.Path()
      inner.moveTo(-iw / 2, -ih / 2)
      inner.lineTo(-iw / 2, ih / 2)
      inner.lineTo(-iw * 0.05, ih / 2)
      inner.bezierCurveTo(iw * 0.5, ih * 0.48, iw * 0.5, -ih * 0.48, -iw * 0.05, -ih / 2)
      inner.closePath()
      outer.holes.push(inner)
      const g = new THREE.ExtrudeGeometry(outer, { depth: fd * 1.5, bevelEnabled: false })
      g.translate(0, 0, -fd * 0.75)
      return g
    }, [fw, fh, fd])
    // D-shaped glass pane — matches inner hole exactly
    const iw = fw - FRAME_W * 2, ih = fh - FRAME_W * 2
    const dGlassGeo = useMemo(() => new THREE.ShapeGeometry(_makeDShape(iw, ih)), [iw, ih])

    return (
      <group visible={wallVisible !== false}>
        <group position={[wx, wy, wz]} rotation={[0, rotY, 0]}
          onPointerDown={onPointerDown} onClick={e => e.stopPropagation()} onDoubleClick={handleDoubleClick}>
          {isSelected && <mesh><boxGeometry args={[fw + 0.3, fh + 0.3, fd + 0.3]} /><meshBasicMaterial color={outlineColor} wireframe /></mesh>}
          {/* Wooden D-frame ring */}
          <mesh geometry={dFrameGeo} castShadow>
            <meshStandardMaterial color={frameColor} roughness={0.6} emissive="#604020" emissiveIntensity={0.1} side={THREE.DoubleSide} />
          </mesh>
          {/* Glass pane */}
          <mesh geometry={dGlassGeo}>
            <meshStandardMaterial color={glassHex} transparent opacity={0.12}
              roughness={0.05} metalness={0.15} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      </group>
    )
  }

  // ── Window rendering ────────────────────────────────────────────────
  if (def.window) {
    const FRAME = 0.08
    const MULL  = FRAME * 0.7   // mullion thickness
    const frameColor = '#f0e8d8'   // light natural wood window frame
    const glassHex   = def.swatches?.[item.swatchIndex]?.hex ?? '#c0e8ff'

    const cols = Math.max(1, item.paneCols ?? 1)
    const rows = Math.max(1, item.paneRows ?? 2)

    // Glass-area bounds inside frame (sill is 1.5× FRAME tall)
    const gxL = -(fw / 2 - FRAME), gxR = fw / 2 - FRAME
    const gyT =   fh / 2 - FRAME,  gyB = -(fh / 2 - FRAME * 1.5)
    const gW  = gxR - gxL,         gH  = gyT - gyB

    const pW = (gW - (cols - 1) * MULL) / cols
    const pH = (gH - (rows - 1) * MULL) / rows

    // Pane centres
    const panes = []
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        panes.push({
          px: gxL + (c + 0.5) * pW + c * MULL,
          py: gyT - (r + 0.5) * pH - r * MULL,
        })

    // Mullion positions
    const hMulls = Array.from({ length: rows - 1 }, (_, r) =>
      gyT - (r + 1) * pH - r * MULL - MULL / 2)
    const vMulls = Array.from({ length: cols - 1 }, (_, c) =>
      gxL + (c + 1) * pW + c * MULL + MULL / 2)

    return (
      <group visible={wallVisible !== false}>
        <group
          position={[wx, wy, wz]}
          rotation={[0, rotY, 0]}
          onPointerDown={onPointerDown}
          onClick={e => e.stopPropagation()}
          onDoubleClick={handleDoubleClick}
        >
          {isCartHighlighted && !isSelected && (
            <mesh>
              <boxGeometry args={[fw + 0.16, fh + 0.16, fd + 0.16]} />
              <meshBasicMaterial color="#ffd700" wireframe />
            </mesh>
          )}
          {isSelected && (
            <mesh>
              <boxGeometry args={[fw + 0.08, fh + 0.08, fd + 0.08]} />
              <meshBasicMaterial color={outlineColor} wireframe />
            </mesh>
          )}
          {/* Left frame */}
          <mesh position={[-(fw / 2 - FRAME / 2), 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[FRAME, fh, fd]} />
            <WoodMaterial color={frameColor} roughness={0.8} />
          </mesh>
          {/* Right frame */}
          <mesh position={[fw / 2 - FRAME / 2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[FRAME, fh, fd]} />
            <WoodMaterial color={frameColor} roughness={0.8} />
          </mesh>
          {/* Top frame */}
          <mesh position={[0, fh / 2 - FRAME / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[fw, FRAME, fd]} />
            <WoodMaterial color={frameColor} roughness={0.8} />
          </mesh>
          {/* Sill */}
          <mesh position={[0, -(fh / 2 - FRAME * 0.75), 0]} castShadow receiveShadow>
            <boxGeometry args={[fw + 0.06, FRAME * 1.5, fd * 1.25]} />
            <WoodMaterial color={frameColor} roughness={0.75} />
          </mesh>
          {/* Horizontal mullions */}
          {hMulls.map((my, i) => (
            <mesh key={`hm${i}`} position={[0, my, 0]}>
              <boxGeometry args={[gW, MULL, fd * 0.6]} />
              <WoodMaterial color={frameColor} roughness={0.8} />
            </mesh>
          ))}
          {/* Vertical mullions */}
          {vMulls.map((mx, i) => (
            <mesh key={`vm${i}`} position={[mx, 0, 0]}>
              <boxGeometry args={[MULL, gH, fd * 0.6]} />
              <WoodMaterial color={frameColor} roughness={0.8} />
            </mesh>
          ))}
          {panes.map(({ px, py }, i) => (
            <mesh key={`pane${i}`} position={[px, py, 0]}>
              <planeGeometry args={[pW - 0.01, pH - 0.01]} />
              <meshStandardMaterial color={glassHex} transparent opacity={0.12}
                roughness={0.05} metalness={0.15} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          ))}
        </group>
      </group>
    )
  }

  // ── Door rendering ───────────────────────────────────────────────────
  if (def.door) {
    const FRAME      = 0.12      // jamb/header thickness (wider = more visible)
    const CASING     = 0.1       // casing width beyond door opening
    const CASING_T   = 0.04      // casing protrusion from wall face
    const frameColor = '#e8dcc8'   // light natural wood frame
    const casingColor = '#ddd0b8'  // slightly warmer casing
    const panelColor = def.swatches?.[item.swatchIndex]?.hex ?? '#f0e4d0' // light wood panel default
    const innerW     = fw - 2 * FRAME

    const isUnlinked = item.wasLinked === true && !item.connectedRoomId && !def.entryway
    const isEntryway = !!def.entryway

    return (
      // Doors are ALWAYS visible — they are navigation anchors and must be
      // clickable even when on a "hidden" wall (the back wall hides to show
      // room interior, but the linked door back to the previous room lives there).
      <group>
        {/* Unlinked door indicator: floating red ring above the door */}
        {isUnlinked && (
          <group position={[wx, wy + fh / 2 + 0.22, wz]} rotation={[0, rotY, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.12, 0.20, 16]} />
              <meshBasicMaterial color="#ff3333" side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}
        {/* Entryway door indicator: floating green triangle marker */}
        {isEntryway && (
          <group position={[wx, wy + fh / 2 + 0.22, wz]} rotation={[0, rotY, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.10, 0.18, 3]} />
              <meshBasicMaterial color="#44bb44" side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}
        <group
          position={[wx, wy, wz]}
          rotation={[0, rotY, 0]}
          onPointerDown={onPointerDown}
          onDoubleClick={handleDoubleClick}
        >
          {isCartHighlighted && !isSelected && (
            <mesh>
              <boxGeometry args={[fw + 0.16, fh + 0.16, fd + 0.16]} />
              <meshBasicMaterial color="#ffd700" wireframe />
            </mesh>
          )}
          {isSelected && (
            <mesh>
              <boxGeometry args={[fw + 0.08, fh + 0.08, fd + 0.08]} />
              <meshBasicMaterial color={outlineColor} wireframe />
            </mesh>
          )}
          {/* Left jamb */}
          <mesh position={[-(fw / 2 - FRAME / 2), 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[FRAME, fh, fd]} />
            <WoodMaterial color={frameColor} roughness={0.8} />
          </mesh>
          {/* Right jamb */}
          <mesh position={[fw / 2 - FRAME / 2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[FRAME, fh, fd]} />
            <WoodMaterial color={frameColor} roughness={0.8} />
          </mesh>
          {/* Header */}
          <mesh position={[0, fh / 2 - FRAME / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[fw, FRAME, fd]} />
            <WoodMaterial color={frameColor} roughness={0.8} />
          </mesh>
          {/* Door panel */}
          <mesh position={[0, -FRAME / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[innerW, fh - FRAME, fd * 0.7]} />
            <WoodMaterial color={panelColor} roughness={0.65} />
          </mesh>
          {/* Handle */}
          <mesh position={[innerW / 2 - 0.14, -fh * 0.1, fd / 2 + 0.02]}>
            <boxGeometry args={[0.05, 0.22, 0.05]} />
            <meshStandardMaterial color="#b0b0b8" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* ── Door casing — room-facing side (local +z = room interior) ── */}
          {/* Left casing strip */}
          <mesh position={[-(fw / 2 + CASING / 2), 0, fd / 2 + CASING_T / 2]} castShadow>
            <boxGeometry args={[CASING, fh + CASING, CASING_T]} />
            <WoodMaterial color={casingColor} roughness={0.75} />
          </mesh>
          {/* Right casing strip */}
          <mesh position={[fw / 2 + CASING / 2, 0, fd / 2 + CASING_T / 2]} castShadow>
            <boxGeometry args={[CASING, fh + CASING, CASING_T]} />
            <WoodMaterial color={casingColor} roughness={0.75} />
          </mesh>
          {/* Top casing strip */}
          <mesh position={[0, fh / 2 + CASING / 2, fd / 2 + CASING_T / 2]} castShadow>
            <boxGeometry args={[fw + CASING * 2, CASING, CASING_T]} />
            <WoodMaterial color={casingColor} roughness={0.75} />
          </mesh>
        </group>
      </group>
    )
  }

  return (
    <>
      {/* Door floor marker — gold strip on floor when wall is hidden */}
      {def.door && wallVisible === false && (
        <mesh position={[wx, 0.02, wz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[fw * 0.9, 0.4]} />
          <meshBasicMaterial color="#f0c060" transparent opacity={0.4} />
        </mesh>
      )}
      <group visible={wallVisible !== false}>
        <mesh
          position={[wx, wy, wz]}
          rotation={[0, rotY, 0]}
          castShadow receiveShadow
          onPointerDown={onPointerDown}
          onClick={e => e.stopPropagation()}
          onDoubleClick={e => { e.stopPropagation(); onDoubleClick(item.typeKey) }}
        >
          <boxGeometry args={[fw, fh, fd]} />
          <meshStandardMaterial
            color={def.swatches?.[item.swatchIndex]?.hex ?? def.color ?? '#9a7aee'}
            roughness={0.76} metalness={0}
            emissive={lightCfg && !lightsOff ? lightCfg.color : '#000000'}
            emissiveIntensity={lightCfg && !lightsOff ? 0.25 : 0}
          />
          {lightCfg && !lightsOff && (
            <pointLight
              position={[0, fh * 0.3, -fd * 0.6]}
              color={lightCfg.color}
              intensity={lightCfg.intensity}
              distance={lightCfg.distance}
              decay={2}
            />
          )}
          {isCartHighlighted && !isSelected && (
            <mesh>
              <boxGeometry args={[fw + 0.16, fh + 0.16, fd + 0.16]} />
              <meshBasicMaterial color="#ffd700" wireframe />
            </mesh>
          )}
          {isSelected && (
            <mesh>
              <boxGeometry args={[fw + 0.08, fh + 0.08, fd + 0.08]} />
              <meshBasicMaterial color={outlineColor} wireframe />
            </mesh>
          )}
        </mesh>
      </group>
    </>
  )
})

// ── Surface highlight during drag ─────────────────────────────────
// Reads hoveredSurfaceRef each frame and renders a glowing outline on
// the surface item that will accept the dragged item.
const SurfaceHighlight = memo(function SurfaceHighlight({ items, hoveredSurfaceRef, gridW, gridD, catalogue }) {
  const meshRef = useRef()
  const [vis, setVis] = useState(false)

  useFrame(() => {
    const sid = hoveredSurfaceRef.current
    if (!sid) { if (vis) setVis(false); return }
    const sItem = items.find(it => it.id === sid)
    if (!sItem) { if (vis) setVis(false); return }
    const sDef = catalogue[sItem.typeKey] ?? ITEM_CATALOGUE[sItem.typeKey]
    const sSize = sDef?.sizes?.[sItem.sizeIndex] ?? sDef?.sizes?.[0]
    if (!sSize) { if (vis) setVis(false); return }
    const [sw, sd] = sSize.footprint ?? [1, 1]
    const sh = sSize.height ?? 1
    const rotated = sItem.rotation === 90 || sItem.rotation === 270
    const ew = rotated ? sd : sw
    const ed = rotated ? sw : sd
    const wx = (sItem.col + ew / 2) - gridW / 2
    const wz = (sItem.row + ed / 2) - gridD / 2
    if (meshRef.current) {
      meshRef.current.position.set(wx, sh + 0.02, wz)
      meshRef.current.scale.set(ew + 0.12, 1, ed + 0.12)
    }
    if (!vis) setVis(true)
  })

  return vis ? (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#70e0a0" transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  ) : null
})

// Which 2 walls are visible per camera quadrant — matches Walls.jsx VISIBLE_NORMALS
const VISIBLE_WALLS = [
  new Set(['N', 'W']), // q0
  new Set(['N', 'E']), // q1
  new Set(['S', 'E']), // q2
  new Set(['S', 'W']), // q3
]
function getQuadrant(ry) {
  const r = ((ry % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  return Math.floor((r + Math.PI / 4) / (Math.PI / 2)) % 4
}

// ── Router ─────────────────────────────────────────────────────────
export default function Items({
  items, selectedId, cells, gridW, gridD, wallHeight,
  onSelectItem, onMoveItem, onMoveWallItem, onDoubleClickItem,
  onDragStart, onDragEnd, roomRotationRef,
  ceilingView = false,
  onEnterRoom,
  cartHighlight = null,
  lightsOff = false,
  catalogue = ITEM_CATALOGUE,
  activeDragRef: externalDragRef,
}) {
  const internalDragRef = useRef(null)
  const activeDragRef = externalDragRef || internalDragRef
  const hoveredSurfaceRef = useRef(null)
  const [visibleWalls, setVisibleWalls] = useState(VISIBLE_WALLS[0])
  const prevQ = useRef(0)

  // Per-column and per-row bounds derived from the room cells
  const { colBounds, rowBounds } = useMemo(() => {
    const colB = {}, rowB = {}
    for (const key of cells) {
      const [c, r] = key.split(',').map(Number)
      if (!colB[c]) colB[c] = { minR: r, maxR: r }
      else { if (r < colB[c].minR) colB[c].minR = r; if (r > colB[c].maxR) colB[c].maxR = r }
      if (!rowB[r]) rowB[r] = { minC: c, maxC: c }
      else { if (c < rowB[r].minC) rowB[r].minC = c; if (c > rowB[r].maxC) rowB[r].maxC = c }
    }
    return { colBounds: colB, rowBounds: rowB }
  }, [cells])

  useFrame(() => {
    const q = getQuadrant(roomRotationRef.current)
    if (q !== prevQ.current) {
      prevQ.current = q
      setVisibleWalls(VISIBLE_WALLS[q])
    }
  })

  return (
    <group>
      {items.map(item => {
        // Ceiling items are rendered by Ceiling.jsx (disc marker + point light)
        if (item.ceiling) return null

        const def    = catalogue[item.typeKey]
        const isCartHighlighted = !!(cartHighlight &&
          item.typeKey === cartHighlight.typeKey &&
          item.sizeIndex === cartHighlight.sizeIndex &&
          item.swatchIndex === cartHighlight.swatchIndex)
        const shared = {
          item,
          allItems: items,
          isSelected: selectedId === item.id,
          isCartHighlighted,
          gridW, gridD, wallHeight,
          onSelect:      onSelectItem,
          onDoubleClick: onDoubleClickItem,
          onDragStart, onDragEnd,
          roomRotationRef, activeDragRef, hoveredSurfaceRef,
          lightsOff,
          catalogue,
        }
        if (!def) return null   // UUID item not yet in catalogue — skip until async load completes
        if (isWallDef(def) && item.wall) {
          return (
            <WallItemMesh
              key={item.id} {...shared}
              wallHeight={wallHeight}
              colBounds={colBounds}
              rowBounds={rowBounds}
              cells={cells}
              onMoveWall={onMoveWallItem}
              wallVisible={visibleWalls.has(item.wall)}
              onEnterRoom={onEnterRoom}
            />
          )
        }
        if (ceilingView) return null
        return <ItemMesh key={item.id} {...shared} onMove={onMoveItem} onEnterRoom={onEnterRoom} />
      })}
      <SurfaceHighlight items={items} hoveredSurfaceRef={hoveredSurfaceRef} gridW={gridW} gridD={gridD} catalogue={catalogue} />
    </group>
  )
}
