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
  { count: 18, zMin: -32, zMax: -22, yMin: 8, yMax: 26, xSpread: 40, sizeMin: 6, sizeMax: 14, speed: 0.08, opacity: 0.06 },
  { count: 14, zMin: -22, zMax: -14, yMin: 6, yMax: 22, xSpread: 35, sizeMin: 4, sizeMax: 10, speed: 0.14, opacity: 0.09 },
  { count: 10, zMin: -14, zMax: -8,  yMin: 4, yMax: 18, xSpread: 28, sizeMin: 2, sizeMax: 7,  speed: 0.22, opacity: 0.07 },
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
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    // Gentle drift: sine on x, cosine on y, slower sine on z
    pos.x += sin(uTime * 0.15 + aPhase * 6.28) * 1.8;
    pos.y += cos(uTime * 0.1 + aPhase * 4.0) * 0.9;
    pos.z += sin(uTime * 0.08 + aPhase * 3.5) * 0.6;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    // Size attenuation: larger when closer
    gl_PointSize = aSize * (180.0 / -mvPos.z);
    vAlpha = aOpacity;
  }
`

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uGlobalOpacity;
  varying float vAlpha;

  void main() {
    // Soft radial circle with smooth falloff
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.05, dist) * vAlpha * uGlobalOpacity;
    // Extra soft edge
    alpha *= smoothstep(0.5, 0.25, dist);
    gl_FragColor = vec4(uColor, alpha);
  }
`

export default function CloudParticles({ skyColor = '#ccc0e8', accent = '#9a7aee', moodKey = 'Dream State' }) {
  const meshRef = useRef()
  const matRef = useRef()
  const timeRef = useRef(0)
  const targetColor = useRef(new THREE.Color(skyColor))
  const currentColor = useRef(new THREE.Color(skyColor))

  const moodPreset = MOOD_CLOUD_PRESETS[moodKey] ?? { opacityMult: 1.0, tintBlend: 0.2 }

  const { positions, sizes, opacities, phases, count } = useMemo(() => {
    const allPositions = []
    const allSizes = []
    const allOpacities = []
    const allPhases = []

    CLOUD_LAYERS.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const x = (Math.random() - 0.5) * layer.xSpread * 2
        const y = layer.yMin + Math.random() * (layer.yMax - layer.yMin)
        const z = layer.zMin + Math.random() * (layer.zMax - layer.zMin)
        allPositions.push(x, y, z)
        allSizes.push(layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin))
        allOpacities.push(layer.opacity * (0.6 + Math.random() * 0.4))
        allPhases.push(Math.random())
      }
    })

    return {
      positions: new Float32Array(allPositions),
      sizes: new Float32Array(allSizes),
      opacities: new Float32Array(allOpacities),
      phases: new Float32Array(allPhases),
      count: allPositions.length / 3,
    }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    return geo
  }, [positions, sizes, opacities, phases])

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
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [skyColor, accent, moodPreset.tintBlend, moodPreset.opacityMult])

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
