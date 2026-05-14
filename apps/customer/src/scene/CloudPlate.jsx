import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMoodControl } from '@shared/ThemeProvider'

const MOODS = {
  'Golden Hour':      { hi:'#fff8d8', mid:'#e8c080', lo:'#986828', deep:'#3a1400', sun:'#ffe0a0' },
  'Bright Day':       { hi:'#ffffff', mid:'#d8ecff', lo:'#88acd0', deep:'#2858a0', sun:'#ffffff' },
  'Vivid Sunset':     { hi:'#f0c898', mid:'#c08050', lo:'#683018', deep:'#0c0200', sun:'#f0a050' },
  'Moonlight':        { hi:'#8098b0', mid:'#506878', lo:'#283848', deep:'#040810', sun:'#90a8c0' },
  'Dark Academia':    { hi:'#d8c098', mid:'#a08050', lo:'#584020', deep:'#0a0604', sun:'#d0b880' },
  'Blush Hour': { hi:'#fff0e8', mid:'#f0b8a8', lo:'#a06858', deep:'#281018', sun:'#ffd8c8' },
  'Coastal Morning':  { hi:'#f0f8ff', mid:'#b0d0e8', lo:'#5888a8', deep:'#0c2038', sun:'#e8f4ff' },
  'Dream State':      { hi:'#f0e0ff', mid:'#b898d8', lo:'#6848a0', deep:'#0c0620', sun:'#e0c8ff' },
  'Neon Nights':      { hi:'#8860c0', mid:'#5030a0', lo:'#281060', deep:'#040008', sun:'#a070e0' },
  'Candlelit Cozy Evening':      { hi:'#f0c070', mid:'#a86828', lo:'#502008', deep:'#040100', sun:'#e8a040' },
  'Greenhouse':       { hi:'#c8e8c0', mid:'#80b070', lo:'#406838', deep:'#060c04', sun:'#d8f0c8' },
  'Studio':           { hi:'#f0f2f4', mid:'#c0c4c8', lo:'#888c90', deep:'#484c50', sun:'#f8f8fa' },
  'Studio Dark':      { hi:'#808488', mid:'#585c60', lo:'#383c40', deep:'#101218', sun:'#a0a4a8' },
}

const vert = `
  varying vec2 vW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // World coords: spread noise across the plane so we get MANY clusters
    vW = (uv - 0.5) * 12.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const frag = `
  uniform vec3 uHi, uMid, uLo, uDeep, uSun;
  uniform float uTime;
  varying vec2 vW;
  varying vec2 vUv;

  // Simplex 2D noise
  vec3 mod289(vec3 x){return x-floor(x/289.0)*289.0;}
  vec2 mod289v(vec2 x){return x-floor(x/289.0)*289.0;}
  vec3 perm(vec3 x){return mod289((x*34.0+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(.211324865,.366025403,-.577350269,.024390243);
    vec2 i=floor(v+dot(v,C.yy)),x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
    i=mod289v(i);
    vec3 p=perm(perm(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
    vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
    m=m*m; m=m*m;
    vec3 x=2.0*fract(p*C.www)-1.0,h=abs(x)-.5,a0=x-floor(x+.5);
    m*=1.79284291-.85373472*(a0*a0+h*h);
    vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.0*dot(m,g);
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }

  // Soft cloud beds — single large diffuse circles, atmospheric background
  float cloudBed(vec2 p, float cellSize, float seed) {
    vec2 cell = floor(p / cellSize);
    float d = 0.0;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        vec2 c = cell + vec2(float(x), float(y));
        if (hash(c + seed) < 0.08) continue;
        vec2 jit = vec2(hash(c + seed + 1.7), hash(c + seed + 3.3)) - 0.5;
        vec2 anchor = (c + 0.5 + jit * 0.4) * cellSize;
        float r = cellSize * (1.1 + hash(c + seed + 5.1) * 0.5);
        d += 1.0 - smoothstep(0.0, 1.0, length(p - anchor) / r);
      }
    }
    return d;
  }

  // Varied cloud formations — each cell picks a TYPE: wisp/horizontal/cluster/tower/dense
  float cloudFormations(vec2 p, float cellSize, float seed) {
    vec2 cell = floor(p / cellSize);
    float d = 0.0;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        vec2 c = cell + vec2(float(x), float(y));
        if (hash(c + seed) < 0.08) continue;

        // Cloud type for this cell
        float t = hash(c + seed + 13.0);

        vec2 stretch = vec2(1.0);
        float baseSize = 0.55;
        float countF = 4.0;

        if (t < 0.2) {              // small wispy
          baseSize = 0.4; countF = 3.0;
        } else if (t < 0.42) {       // stretched horizontal drift
          stretch = vec2(2.0, 0.6); baseSize = 0.55; countF = 4.0;
        } else if (t < 0.62) {       // round cluster
          stretch = vec2(1.0, 0.85); baseSize = 0.55; countF = 4.0;
        } else if (t < 0.82) {       // tower stack (vertical)
          stretch = vec2(0.65, 1.5); baseSize = 0.55; countF = 4.0;
        } else {                     // fat dense mass
          stretch = vec2(1.1, 1.0); baseSize = 0.95; countF = 2.0;
        }

        for (int i = 0; i < 4; i++) {
          if (float(i) >= countF) continue;
          float fi = float(i);
          vec2 jit = vec2(hash(c + seed + fi * 7.3), hash(c + seed + fi * 11.7)) - 0.5;
          vec2 anchor = (c + 0.5 + jit * stretch) * cellSize;
          float r = cellSize * baseSize * (0.85 + hash(c + seed + fi * 13.1) * 0.5);
          d += 1.0 - smoothstep(0.0, 1.0, length(p - anchor) / r);
        }
      }
    }
    return d;
  }

  // Cloud layer: shape + minimal noise wobble
  // mode: 0 = soft beds (background), 1 = varied formations
  vec2 cloud(vec2 pos, float thresh, float softness, float cellSize, float seed, int mode) {
    float shape = mode == 0
      ? cloudBed(pos, cellSize, seed)
      : cloudFormations(pos, cellSize, seed);

    float wobble = snoise(pos * 1.8 + seed) * 0.08;
    float n = shape + wobble;

    float mask = smoothstep(thresh - softness, thresh + softness, n);
    float height = smoothstep(thresh, thresh + 0.6, n);
    return vec2(mask, height);
  }

  void main() {
    vec2 c = vUv - 0.5;
    float dist = length(c) * 2.0;
    float edge = 1.0 - smoothstep(0.6, 0.98, dist);

    // === 4 LAYERS — distinct roles, hierarchy, varied motion ===

    // Coverage gradient: sparse at top of cloud layer, dense below
    // L0 = uppermost wisps, L3 = thick blanket beneath

    // Screen-Y depth gradient: reduce coverage at top of screen
    // vUv.y higher = top of screen in isometric view (plate rotated -PI/2 X)
    float yFade = mix(1.0, 0.1, smoothstep(0.0, 0.85, vUv.y));

    // L0 UPPERMOST: barely-there wisps, you're above them
    vec2 p0 = vW + vec2(uTime * 0.002, uTime * 0.0005);
    vec2 L0 = cloud(p0, 0.85, 0.35, 1.3, 1.0, 1);
    L0.x *= yFade;

    // L1 UPPER: scattered lighter formations
    vec2 p1 = vW + vec2(5.3, 3.1) + vec2(uTime * 0.005, -uTime * 0.0008);
    vec2 L1 = cloud(p1, 0.55, 0.28, 1.0, 11.0, 1);
    L1.x *= mix(1.0, 0.2, smoothstep(0.1, 0.9, vUv.y));

    // L2 MID: getting denser
    vec2 p2 = vW + vec2(11.7, 8.4) + vec2(uTime * 0.013, uTime * 0.002);
    vec2 L2 = cloud(p2, 0.35, 0.22, 1.8, 23.0, 1);
    L2.x *= mix(1.0, 0.35, smoothstep(0.2, 1.0, vUv.y));

    // L3 LOWEST: thick cloud blanket — dense heavy coverage below you
    vec2 p3 = vW + vec2(19.2, 14.6) + vec2(uTime * 0.026, -uTime * 0.004);
    vec2 L3 = cloud(p3, 0.22, 0.18, 2.6, 37.0, 1);
    L3.x *= mix(1.0, 0.5, smoothstep(0.3, 1.0, vUv.y));

    // LOW CONTRAST tones — narrow range, slightly desaturated, lifted brightness
    vec3 shadowTone = mix(uMid, uLo, 0.2) * vec3(0.94, 0.95, 1.0);
    vec3 litTone = mix(uMid, uHi, 0.35) * vec3(1.0, 0.99, 0.97);
    vec3 sunGlow = uSun * 0.03;

    // All layers use a narrow tonal range — calm, not attention-grabbing

    // L0 FAR: nearly flat atmospheric wash
    vec3 c0 = mix(shadowTone * 0.88, shadowTone * 0.95, L0.y);

    // L1 MID-FAR: barely perceptible shading
    vec3 c1 = mix(shadowTone * 0.9, uMid * 0.95, L1.y) + sunGlow * L1.y;

    // L2 MID-NEAR: gentle visible form
    vec3 c2 = mix(shadowTone * 0.92, litTone * 0.92, L2.y) + sunGlow * L2.y;
    c2 = mix(c2, shadowTone * 0.9, (1.0 - L2.y) * L2.x * 0.06);

    // L3 FOREGROUND: most defined, but still soft
    vec3 c3 = mix(shadowTone * 0.93, litTone, L3.y) + sunGlow * L3.y * 1.5;
    c3 = mix(c3, shadowTone * 0.88, (1.0 - L3.y) * L3.x * 0.1);

    // === FORM-BASED DIRECTIONAL HIGHLIGHTS ===
    // dFdy = rate of cloud height change going down the screen.
    // Positive dFdy = height INCREASES going down = surface tilts DOWN toward viewer = FACES UP (lit).
    // Negative dFdy = height DECREASES going down = surface tilts UP toward top of screen = FACES DOWN (shadow).
    vec3 peakHi = mix(uHi, vec3(1.0), 0.35) * vec3(1.0, 0.99, 0.95);

    float slope1 = dFdy(L1.y) * 80.0;
    c1 = mix(c1, peakHi, clamp(slope1, 0.0, 1.0) * L1.x * 0.4);
    c1 = mix(c1, shadowTone * 0.85, clamp(-slope1, 0.0, 1.0) * L1.x * 0.15);

    float slope2 = dFdy(L2.y) * 70.0;
    c2 = mix(c2, peakHi, clamp(slope2, 0.0, 1.0) * L2.x * 0.55);
    c2 = mix(c2, shadowTone * 0.8, clamp(-slope2, 0.0, 1.0) * L2.x * 0.22);

    float slope3 = dFdy(L3.y) * 60.0;
    c3 = mix(c3, peakHi, clamp(slope3, 0.0, 1.0) * L3.x * 0.7);
    c3 = mix(c3, shadowTone * 0.75, clamp(-slope3, 0.0, 1.0) * L3.x * 0.3);

    // Composite — lifted, airy
    // Start with a bright base so gaps aren't dark
    vec3 hazeBase = mix(uDeep, shadowTone * 0.7, 0.55);
    vec3 col = hazeBase;
    col = mix(col, c0, L0.x * 0.2);
    col = mix(col, c1, L1.x * 0.55);
    col = mix(col, c2, L2.x * 0.7);
    col = mix(col, c3, L3.x * 0.65);

    float total = max(max(L0.x, L1.x), max(L2.x, L3.x));

    float alpha = edge * mix(0.3, 1.0, total);

    gl_FragColor = vec4(col, alpha);
  }
`

export default function CloudPlate({ gridW = 12, gridD = 12 }) {
  const { mood } = useMoodControl()
  const cm = MOODS[mood] ?? MOODS['Dream State']
  const timeRef = useRef(0)
  const radius = Math.max(gridW, gridD) * 5

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uHi:   { value: new THREE.Color(cm.hi) },
      uMid:  { value: new THREE.Color(cm.mid) },
      uLo:   { value: new THREE.Color(cm.lo) },
      uDeep: { value: new THREE.Color(cm.deep) },
      uSun:  { value: new THREE.Color(cm.sun) },
      uTime: { value: 0 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    extensions: { derivatives: true },
  }), [])

  useFrame((_, delta) => {
    timeRef.current += delta
    const u = material.uniforms
    u.uTime.value = timeRef.current
    const r = delta * 1.5
    u.uHi.value.lerp(new THREE.Color(cm.hi), r)
    u.uMid.value.lerp(new THREE.Color(cm.mid), r)
    u.uLo.value.lerp(new THREE.Color(cm.lo), r)
    u.uDeep.value.lerp(new THREE.Color(cm.deep), r)
    u.uSun.value.lerp(new THREE.Color(cm.sun), r)
  })

  return (
    <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <circleGeometry args={[radius, 64]} />
    </mesh>
  )
}
