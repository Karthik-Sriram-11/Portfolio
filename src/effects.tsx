import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type Lenis from 'lenis'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null
export const setLenis = (instance: Lenis | null) => { lenis = instance }

export function scrollToId(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  if (lenis) lenis.scrollTo(target, { offset: id === 'home' ? 0 : -24, duration: 1.3 })
  else target.scrollIntoView({ behavior: 'smooth' })
}

export const toast = (message: string) => window.dispatchEvent(new CustomEvent('ks:toast', { detail: message }))

export function Toaster() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    let timer = 0
    const show = (event: Event) => {
      setMessage((event as CustomEvent<string>).detail)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setMessage(''), 2400)
    }
    window.addEventListener('ks:toast', show)
    return () => { window.removeEventListener('ks:toast', show); window.clearTimeout(timer) }
  }, [])

  return (
    <AnimatePresence>
      {message && (
        <motion.div className="toast" role="status" initial={{ opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .98 }} transition={{ duration: .28 }}>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function useTilt<T extends HTMLElement>(max = 9) {
  const ref = useRef<T>(null)

  const onMouseMove = useCallback((event: React.MouseEvent<T>) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    node.style.setProperty('--rx', `${(0.5 - py) * max}deg`)
    node.style.setProperty('--ry', `${(px - 0.5) * max}deg`)
    node.style.setProperty('--mx', `${px * 100}%`)
    node.style.setProperty('--my', `${py * 100}%`)
    node.style.setProperty('--sheen', '1')
  }, [max])

  const onMouseLeave = useCallback(() => {
    const node = ref.current
    if (!node) return
    node.style.setProperty('--rx', '0deg')
    node.style.setProperty('--ry', '0deg')
    node.style.setProperty('--sheen', '0')
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}

export function Magnetic({ children, strength = 0.22 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  return (
    <span
      ref={ref}
      className="magnetic-wrap"
      onMouseMove={event => {
        const node = ref.current!
        const rect = node.getBoundingClientRect()
        node.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * strength}px, ${(event.clientY - rect.top - rect.height / 2) * strength}px)`
      }}
      onMouseLeave={() => { ref.current!.style.transform = '' }}
    >
      {children}
    </span>
  )
}

export function SplitText({ text, className = '', delay = 0.12, play = true }: { text: string; className?: string; delay?: number; play?: boolean }) {
  let charIndex = 0
  return (
    <span className={`split ${className}`.trim()} aria-label={text}>
      {text.split(' ').map((word, wordIndex) => (
        <span className="split-word" key={wordIndex}>
          {word.split('').map((char, index) => {
            const stagger = charIndex++ * 0.035
            return (
              <motion.span
                className="split-char"
                key={index}
                aria-hidden="true"
                initial={{ opacity: 0, rotateX: -86, y: '0.45em' }}
                animate={play ? { opacity: 1, rotateX: 0, y: 0 } : undefined}
                transition={{ delay: delay + stagger, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {char}
              </motion.span>
            )
          })}
        </span>
      ))}
    </span>
  )
}

export function RoleCycle({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState(() => (prefersReducedMotion() ? phrases[0] : ''))

  useEffect(() => {
    if (prefersReducedMotion()) return
    let phrase = 0
    let length = 0
    let deleting = false
    let timer = 0
    const step = () => {
      const current = phrases[phrase]
      length += deleting ? -1 : 1
      setText(current.slice(0, length))
      let wait = deleting ? 32 : 66
      if (!deleting && length === current.length) { deleting = true; wait = 1700 }
      else if (deleting && length === 0) { deleting = false; phrase = (phrase + 1) % phrases.length; wait = 320 }
      timer = window.setTimeout(step, wait)
    }
    timer = window.setTimeout(step, 1100)
    return () => window.clearTimeout(timer)
  }, [phrases])

  return (
    <span className="role-cycle" aria-label={phrases.join(', ')}>
      <span aria-hidden="true">{text}</span>
      <i className="caret" aria-hidden="true" />
    </span>
  )
}

const formatCount = (value: number, pad: number) => Math.round(value).toLocaleString('en-US').padStart(pad, '0')

export function CountUp({ to, pad = 0, duration = 1500 }: { to: number; pad?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (prefersReducedMotion()) { node.textContent = formatCount(to, pad); return }
    let frame = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration)
        node.textContent = formatCount(to * (1 - Math.pow(1 - progress, 4)), pad)
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    observer.observe(node)
    return () => { observer.disconnect(); cancelAnimationFrame(frame) }
  }, [to, pad, duration])

  return <span ref={ref}>{formatCount(0, pad)}</span>
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/<>*+'

export function Scramble({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const frame = useRef(0)

  const run = useCallback(() => {
    const node = ref.current
    if (!node || prefersReducedMotion()) return
    cancelAnimationFrame(frame.current)
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 420)
      const settled = Math.floor(progress * text.length)
      node.textContent = text.split('').map((char, i) => (i < settled || char === ' ' ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join('')
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }, [text])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return <span ref={ref} onMouseEnter={run}>{text}</span>
}

export function CursorGlow() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion()) return
    document.body.classList.add('has-custom-cursor')

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const trailing = { ...target }
    let frame = 0

    const move = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
      if (dot.current) dot.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
      const hot = (event.target as HTMLElement | null)?.closest('a, button, input, textarea, .tilt')
      ring.current?.classList.toggle('is-hot', Boolean(hot))
    }

    const loop = () => {
      trailing.x += (target.x - trailing.x) * 0.17
      trailing.y += (target.y - trailing.y) * 0.17
      if (ring.current) ring.current.style.transform = `translate3d(${trailing.x}px, ${trailing.y}px, 0)`
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      document.body.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  )
}

export const SECRETS = {
  terminal: { name: 'Opened the hidden terminal', hint: 'Try double-clicking my photo.' },
  warp: { name: 'Warp drive', hint: 'The KS. logo likes being clicked. A lot.' },
  konami: { name: 'Konami code', hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
  hire: { name: 'Said the magic word', hint: 'Just type the word “hire” anywhere.' },
  console: { name: 'Read the console', hint: 'Developers always check the console.' }
} as const
export type SecretId = keyof typeof SECRETS
export const SECRET_IDS = Object.keys(SECRETS) as SecretId[]
const SECRET_KEY = 'ks-secrets'

export const readSecrets = (): SecretId[] => {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(SECRET_KEY) || '[]')
    return Array.isArray(saved) ? SECRET_IDS.filter(id => saved.includes(id)) : []
  } catch { return [] }
}

// Returns false when the secret was already found, so callers can show their own message instead.
export function unlock(id: SecretId) {
  const found = readSecrets()
  if (found.includes(id)) return false
  const next = [...found, id]
  try { window.localStorage.setItem(SECRET_KEY, JSON.stringify(next)) } catch { /* private mode: progress just won't persist */ }
  toast(`Secret ${next.length}/${SECRET_IDS.length} unlocked — ${SECRETS[id].name}`)
  window.dispatchEvent(new Event('ks:secrets'))
  return true
}

export function useSecrets() {
  const [found, setFound] = useState(readSecrets)
  useEffect(() => {
    const sync = () => setFound(readSecrets())
    window.addEventListener('ks:secrets', sync)
    return () => window.removeEventListener('ks:secrets', sync)
  }, [])
  return found
}

export const confetti = () => window.dispatchEvent(new Event('ks:confetti'))
export const warp = () => window.dispatchEvent(new Event('ks:warp'))

const CONFETTI_COLORS = ['#d5ff55', '#3287ff', '#8c76ff', '#15c8df', '#ff7ab6', '#ffffff']
const CONFETTI_MS = 3400

export function Confetti() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let frame = 0
    const burst = () => {
      const node = canvas.current
      const ctx = node?.getContext('2d')
      if (!node || !ctx || prefersReducedMotion()) return
      const width = window.innerWidth
      const height = window.innerHeight
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      node.width = width * dpr
      node.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const pieces = Array.from({ length: 190 }, (_, i) => {
        const left = i % 2 === 0
        return {
          x: left ? -10 : width + 10,
          y: height * (0.55 + Math.random() * 0.3),
          vx: (left ? 1 : -1) * (5 + Math.random() * 11),
          vy: -(11 + Math.random() * 13),
          size: 6 + Math.random() * 7,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.35,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]
        }
      })

      cancelAnimationFrame(frame)
      const start = performance.now()
      let last = start
      const tick = (now: number) => {
        const step = Math.min(3, (now - last) / 16.7)
        last = now
        const age = now - start
        ctx.clearRect(0, 0, width, height)
        ctx.globalAlpha = Math.max(0, 1 - Math.max(0, age - CONFETTI_MS * 0.6) / (CONFETTI_MS * 0.4))
        for (const p of pieces) {
          p.vy += 0.36 * step
          p.vx *= Math.pow(0.985, step)
          p.x += p.vx * step
          p.y += p.vy * step
          p.rotation += p.spin * step
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation)
          ctx.scale(1, Math.cos(p.rotation * 2))
          ctx.fillStyle = p.color
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
          ctx.restore()
        }
        if (age < CONFETTI_MS) frame = requestAnimationFrame(tick)
        else ctx.clearRect(0, 0, width, height)
      }
      frame = requestAnimationFrame(tick)
    }
    window.addEventListener('ks:confetti', burst)
    return () => { window.removeEventListener('ks:confetti', burst); cancelAnimationFrame(frame) }
  }, [])

  return <canvas ref={canvas} className="confetti" aria-hidden="true" />
}
