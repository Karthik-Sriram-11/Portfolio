import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

export function SplitText({ text, className = '', delay = 0.12 }: { text: string; className?: string; delay?: number }) {
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
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
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
