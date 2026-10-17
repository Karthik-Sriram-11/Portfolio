import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import * as THREE from 'three'

type Pointer = { x: number; y: number }

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
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.62
      pos[i * 3 + 2] = radius * Math.cos(phi)
      const tint = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      const brightness = 0.22 + Math.random() * 0.48
      col[i * 3] = tint.r * brightness
      col[i * 3 + 1] = tint.g * brightness
      col[i * 3 + 2] = tint.b * brightness
    }
    return [pos, col]
  }, [count])

  useFrame((state, delta) => {
    points.current.rotation.y += delta * 0.02
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.07
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

function GlowShell() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#27568f') },
      uColorB: { value: new THREE.Color('#5d5080') }
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

  useFrame(state => { material.uniforms.uTime.value = state.clock.elapsedTime })
  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh scale={1.38}>
      <icosahedronGeometry args={[1.5, 8]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

function Orb({ detail }: { detail: number }) {
  const group = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    group.current.rotation.y += delta * 0.14
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
      <GlowShell />
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

function CameraRig({ pointer }: { pointer: React.MutableRefObject<Pointer> }) {
  useFrame((state, delta) => {
    const ease = Math.min(1, delta * 2.4)
    state.camera.position.x += (pointer.current.x * 1.35 - state.camera.position.x) * ease
    state.camera.position.y += (pointer.current.y * 0.85 - state.camera.position.y) * ease
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function Scene3D() {
  const pointer = useRef<Pointer>({ x: 0, y: 0 })
  const compact = typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches

  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <Canvas
      className="scene3d"
      dpr={[1, compact ? 1.3 : 1.75]}
      camera={{ position: [0, 0, compact ? 11.5 : 8.6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Reflections />
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 4, 5]} intensity={14} color="#4f8bff" distance={24} />
      <pointLight position={[-5, -2, 3]} intensity={11} color="#8e6bd8" distance={24} />
      <pointLight position={[0, 3, -5]} intensity={8} color="#15c8df" distance={24} />
      <group position={compact ? [0.7, -1.4, 0] : [1.15, 0.1, 0]} scale={compact ? 0.78 : 0.92}>
        <Orb detail={compact ? 12 : 24} />
        <Shards />
      </group>
      <Starfield count={compact ? 900 : 2600} />
      <CameraRig pointer={pointer} />
    </Canvas>
  )
}
