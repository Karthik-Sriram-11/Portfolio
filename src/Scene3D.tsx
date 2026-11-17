import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, PerformanceMonitor } from '@react-three/drei'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import * as THREE from 'three'

type Pointer = { x: number; y: number }
type Stage = { x: number; y: number; scale: number; a: string; b: string }
type Rig = { x: number; y: number; scale: number; spin: number; a: THREE.Color; b: THREE.Color }

// Where the orb rests while each section is under the middle of the viewport.
const STAGES: Record<string, Stage> = {
  home: { x: 1.75, y: 0.35, scale: 1.0, a: '#27568f', b: '#5d5080' },
  journey: { x: 3.15, y: -0.15, scale: 1.22, a: '#2a63a8', b: '#4a4f9a' },
  experience: { x: 4.5, y: 2.2, scale: 0.6, a: '#5b4b9e', b: '#7a4f8f' },
  craft: { x: -5.3, y: -0.5, scale: 1.05, a: '#1f6f86', b: '#3b5fa8' },
  stack: { x: 4.9, y: 2.0, scale: 0.78, a: '#1f7a6c', b: '#2f6aa0' },
  arena: { x: 4.1, y: 1.9, scale: 0.8, a: '#8a6a2f', b: '#7a4f8f' },
  connect: { x: 0, y: -2.15, scale: 1.55, a: '#3a4fa8', b: '#7a3f8f' },
  case: { x: 3.7, y: 1.5, scale: 0.85, a: '#27568f', b: '#5d5080' }
}
const ORDER = ['home', 'journey', 'experience', 'craft', 'stack', 'arena', 'connect']

// Set by the 'ks:warp' easter egg; every animated part reads it each frame.
let warpUntil = 0
const warping = () => performance.now() < warpUntil

const PALETTE = ['#3287ff', '#15c8df', '#8c76ff', '#ffffff'].map(c => new THREE.Color(c))

function useDotTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.45)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(canvas)
  }, [])
}

// Metals render black without reflections; RoomEnvironment ships with three so no CDN fetch.
function Reflections() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envMap
    return () => { scene.environment = null; envMap.dispose(); pmrem.dispose() }
  }, [gl, scene])
  return null
}

function Starfield({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null!)
  const map = useDotTexture()

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 4.5 + Math.random() * 9
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = radius * Math.cos(phi)
      const tint = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      const brightness = 0.22 + Math.random() * 0.48
      col[i * 3] = tint.r * brightness
      col[i * 3 + 1] = tint.g * brightness
      col[i * 3 + 2] = tint.b * brightness
    }
    return [pos, col]
  }, [count])

  // Scrolling turns the whole field, so the page feels like it moves through space.
  useFrame((state, delta) => {
    const boost = warping()
    points.current.rotation.y += delta * (boost ? 1.1 : 0.02)
    points.current.scale.z = THREE.MathUtils.damp(points.current.scale.z, boost ? 3.2 : 1, 4, delta)
    const target = window.scrollY * 0.00032 + Math.sin(state.clock.elapsedTime * 0.08) * 0.07
    points.current.rotation.x = THREE.MathUtils.damp(points.current.rotation.x, target, 3, delta)
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        sizeAttenuation
        vertexColors
        map={map}
        transparent
        opacity={0.92}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function GlowShell({ rig }: { rig: React.MutableRefObject<Rig> }) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(STAGES.home.a) },
      uColorB: { value: new THREE.Color(STAGES.home.b) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 viewDir = normalize(-vView);
        float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 3.4);
        vec3 tint = mix(uColorA, uColorB, 0.5 + 0.5 * sin(uTime * 0.45 + vView.y * 0.4));
        gl_FragColor = vec4(tint, fresnel * 0.45);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  }), [])

  useFrame((state, delta) => {
    const ease = Math.min(1, delta * 1.6)
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uColorA.value.lerp(rig.current.a, ease)
    material.uniforms.uColorB.value.lerp(rig.current.b, ease)
  })
  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh scale={1.38}>
      <icosahedronGeometry args={[1.5, 8]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

function Orb({ detail, rig }: { detail: number; rig: React.MutableRefObject<Rig> }) {
  const group = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    group.current.rotation.y += delta * (0.14 + rig.current.spin)
    group.current.rotation.x = Math.sin(t * 0.22) * 0.14
    group.current.position.y = Math.sin(t * 0.55) * 0.14
  })

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.5, detail]} />
        <MeshDistortMaterial
          color="#05091c"
          emissive="#0a1533"
          emissiveIntensity={0.12}
          metalness={1}
          roughness={0.26}
          envMapIntensity={0.4}
          distort={0.34}
          speed={1.35}
        />
      </mesh>
      <mesh scale={1.13}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshBasicMaterial color="#6fd9ff" wireframe transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <GlowShell rig={rig} />
    </group>
  )
}

function Shards() {
  const group = useRef<THREE.Group>(null!)
  const shards = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    radius: 2.7 + (i % 3) * 0.6,
    speed: 0.2 + i * 0.05,
    offset: (i / 7) * Math.PI * 2,
    height: (i % 4 - 1.5) * 0.75,
    scale: 0.09 + (i % 3) * 0.045
  })), [])

  useFrame(state => {
    const t = state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      const shard = shards[i]
      child.position.set(
        Math.cos(t * shard.speed + shard.offset) * shard.radius,
        shard.height + Math.sin(t * 0.5 + shard.offset) * 0.32,
        Math.sin(t * shard.speed + shard.offset) * shard.radius
      )
      child.rotation.x = t * 0.5
      child.rotation.y = t * 0.36
    })
  })

  return (
    <group ref={group}>
      {shards.map((shard, i) => (
        <mesh key={i} scale={shard.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#7f9fd0" metalness={0.95} roughness={0.22} emissive="#16307f" emissiveIntensity={0.18} />
        </mesh>
      ))}
    </group>
  )
}

function activeStage(previous: string) {
  if (document.querySelector('.case')) return 'case'
  const middle = window.innerHeight * 0.5
  for (const id of ORDER) {
    const rect = document.getElementById(id)?.getBoundingClientRect()
    if (rect && rect.top <= middle && rect.bottom > middle) return id
  }
  return previous
}

function Travelling({ compact, rig, children }: { compact: boolean; rig: React.MutableRefObject<Rig>; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!)
  const stage = useRef('home')
  const frames = useRef(0)
  const lastScroll = useRef(typeof window === 'undefined' ? 0 : window.scrollY)

  useFrame((_, delta) => {
    if (frames.current++ % 8 === 0) {
      stage.current = activeStage(stage.current)
      rig.current.a.set(STAGES[stage.current].a)
      rig.current.b.set(STAGES[stage.current].b)
    }
    const target = STAGES[stage.current]
    const state = rig.current
    state.x = THREE.MathUtils.damp(state.x, compact ? target.x * 0.24 : target.x, 1.7, delta)
    state.y = THREE.MathUtils.damp(state.y, compact ? target.y * 1.15 - 1.3 : target.y, 1.7, delta)
    state.scale = THREE.MathUtils.damp(state.scale, compact ? target.scale * 0.8 : target.scale, 1.7, delta)

    const velocity = window.scrollY - lastScroll.current
    lastScroll.current = window.scrollY
    const spinTarget = warping() ? 7 : THREE.MathUtils.clamp(velocity * 0.03, -1.6, 1.6)
    state.spin = THREE.MathUtils.damp(state.spin, spinTarget, 3, delta)

    group.current.position.set(state.x, state.y, 0)
    group.current.scale.setScalar(state.scale)
  })

  return <group ref={group}>{children}</group>
}

function FirstFrames({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  useFrame(() => { if (frames.current++ === 2) onReady() })
  return null
}

function CameraRig({ pointer }: { pointer: React.MutableRefObject<Pointer> }) {
  useFrame((state, delta) => {
    const ease = Math.min(1, delta * 2.4)
    state.camera.position.x += (pointer.current.x * 1.35 - state.camera.position.x) * ease
    state.camera.position.y += (pointer.current.y * 0.85 - state.camera.position.y) * ease
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function Scene3D({ onReady }: { onReady: () => void }) {
  const pointer = useRef<Pointer>({ x: 0, y: 0 })
  const compact = typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches
  const [dpr, setDpr] = useState(compact ? 1.3 : 1.6)
  const rig = useRef<Rig>({
    x: compact ? STAGES.home.x * 0.24 : STAGES.home.x,
    y: compact ? STAGES.home.y * 1.15 - 1.3 : STAGES.home.y,
    scale: 0.2,
    spin: 0,
    a: new THREE.Color(STAGES.home.a),
    b: new THREE.Color(STAGES.home.b)
  })

  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    const onWarp = () => { warpUntil = performance.now() + 3200 }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('ks:warp', onWarp)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('ks:warp', onWarp) }
  }, [])

  return (
    <Canvas
      className="scene3d"
      dpr={dpr}
      camera={{ position: [0, 0, compact ? 11.5 : 8.6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      {/* The scene runs behind the whole page, so trade sharpness for frame rate on slow GPUs. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Reflections />
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 4, 5]} intensity={14} color="#4f8bff" distance={24} />
      <pointLight position={[-5, -2, 3]} intensity={11} color="#8e6bd8" distance={24} />
      <pointLight position={[0, 3, -5]} intensity={8} color="#15c8df" distance={24} />
      <Travelling compact={compact} rig={rig}>
        <Orb detail={compact ? 12 : 24} rig={rig} />
        <Shards />
      </Travelling>
      <Starfield count={compact ? 900 : 2600} />
      <CameraRig pointer={pointer} />
      <FirstFrames onReady={onReady} />
    </Canvas>
  )
}
