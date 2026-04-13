import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Layered depth cloud particles behind the room.
 * 3 parallax layers (far / mid / near), mood-responsive colors.
 * Extensible via MOOD_CLOUD_PRESETS for per-mood variations.
 *
 * Props:
 *   skyColor  — hex from MOOD_SCENE_PRESETS (atmosphere tint)
 *   accent    — hex from theme accent (highlight tint)
 *   moodKey   — mood name for future per-mood cloud types
 */

const CLOUD_LAYERS = [
  { count: 12, zMin: -32, zMax: -22, yMin: 6, yMax: 28, xSpread: 50, sizeMin: 30, sizeMax: 60, driftSpeed: 0.4, opacity: 0.18 },
  { count: 10, zMin: -22, zMax: -14, yMin: 4, yMax: 24, xSpread: 45, sizeMin: 20, sizeMax: 45, driftSpeed: 0.7, opacity: 0.22 },
  { count: 8,  zMin: -14, zMax: -8,  yMin: 2, yMax: 20, xSpread: 38, sizeMin: 14, sizeMax: 32, driftSpeed: 1.1, opacity: 0.16 },
]

// Future: per-mood cloud presets (fog density, particle count, color overrides, special elements)
export const MOOD_CLOUD_PRESETS = {
  'Moonlight':     { opacityMult: 1.3, tintBlend: 0.4 },
  'Neon Nights':   { opacityMult: 1.5, tintBlend: 0.6 },
  'Cozy Evening':  { opacityMult: 1.2, tintBlend: 0.3 },
  'Candlelight':   { opacityMult: 1.4, tintBlend: 0.3 },
  'Bright Day':    { opacityMult: 0.7, tintBlend: 0.1 },
  'Studio':        { opacityMult: 0.5, tintBlend: 0.1 },
  'Studio Dark':   { opacityMult: 0.6, tintBlend: 0.1 },
  'Dream State':   { opacityMult: 1.0, tintBlend: 0.3 },
}

const vertexShader = `
  attribute float aSize;
  attribute float aOpacity;
  attribute float aPhase;
  attribute float aDrift;
  uniform float uTime;
  uniform float uXRange;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    // Steady left-to-right drift, wrapping around
    float driftX = mod(pos.x + uTime * aDrift + aPhase * uXRange * 2.0, uXRange * 2.0) - uXRange;
    pos.x = driftX;
    // Gentle vertical bob only
    pos.y += sin(uTime * 0.12 + aPhase * 5.0) * 0.8;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    // Large soft clouds — orthographic camera so use fixed scale
    gl_PointSize = aSize * 4.0;
    vAlpha = aOpacity;
  }
`

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uGlobalOpacity;
  varying float vAlpha;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    // Big soft gaussian-like falloff
    float alpha = exp(-dist * dist * 8.0) * vAlpha * uGlobalOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`

export default function CloudParticles({ skyColor = '#ccc0e8', accent = '#9a7aee', moodKey = 'Dream State' }) {
  const meshRef = useRef()
  const timeRef = useRef(0)
  const targetColor = useRef(new THREE.Color(skyColor))
  const currentColor = useRef(new THREE.Color(skyColor))

  const moodPreset = MOOD_CLOUD_PRESETS[moodKey] ?? { opacityMult: 1.0, tintBlend: 0.2 }

  const maxXSpread = Math.max(...CLOUD_LAYERS.map(l => l.xSpread))

  const { positions, sizes, opacities, phases, drifts } = useMemo(() => {
    const allPositions = []
    const allSizes = []
    const allOpacities = []
    const allPhases = []
    const allDrifts = []

    CLOUD_LAYERS.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const x = (Math.random() - 0.5) * layer.xSpread * 2
        const y = layer.yMin + Math.random() * (layer.yMax - layer.yMin)
        const z = layer.zMin + Math.random() * (layer.zMax - layer.zMin)
        allPositions.push(x, y, z)
        allSizes.push(layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin))
        allOpacities.push(layer.opacity * (0.7 + Math.random() * 0.3))
        allPhases.push(Math.random())
        allDrifts.push(layer.driftSpeed * (0.7 + Math.random() * 0.6))
      }
    })

    return {
      positions: new Float32Array(allPositions),
      sizes: new Float32Array(allSizes),
      opacities: new Float32Array(allOpacities),
      phases: new Float32Array(allPhases),
      drifts: new Float32Array(allDrifts),
    }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('aDrift', new THREE.BufferAttribute(drifts, 1))
    return geo
  }, [positions, sizes, opacities, phases, drifts])

  const material = useMemo(() => {
    // Blend skyColor with accent for warmth
    const baseColor = new THREE.Color(skyColor)
    const accentColor = new THREE.Color(accent)
    baseColor.lerp(accentColor, moodPreset.tintBlend)

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: baseColor },
        uGlobalOpacity: { value: moodPreset.opacityMult },
        uXRange: { value: maxXSpread },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [skyColor, accent, moodPreset.tintBlend, moodPreset.opacityMult, maxXSpread])

  useFrame((_, delta) => {
    timeRef.current += delta
    if (material.uniforms) {
      material.uniforms.uTime.value = timeRef.current
    }

    // Smooth color transitions when mood changes
    targetColor.current.set(skyColor).lerp(new THREE.Color(accent), moodPreset.tintBlend)
    currentColor.current.lerp(targetColor.current, delta * 2)
    if (material.uniforms) {
      material.uniforms.uColor.value.copy(currentColor.current)
      material.uniforms.uGlobalOpacity.value = THREE.MathUtils.lerp(
        material.uniforms.uGlobalOpacity.value, moodPreset.opacityMult, delta * 2
      )
    }
  })

  return (
    <points ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />
  )
}
