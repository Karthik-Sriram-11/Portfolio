import { useEffect, useRef, useState } from 'react'

const STEPS = ['Waking the scene', 'Compiling shaders', 'Aligning pixels', 'Ready']

// Holds short of 100 until the 3D scene has drawn (or MAX_WAIT passes), so the curtain never lifts on a half-built page.
const MAX_WAIT = 4500

export default function Preloader({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const isReady = useRef(ready)
  isReady.current = ready

  useEffect(() => {
    const start = performance.now()
    let frame = 0
    let exit = 0
    const tick = (now: number) => {
      const elapsed = now - start
      const waiting = !isReady.current && elapsed < MAX_WAIT
      const progress = Math.min(waiting ? 0.6 : 1, elapsed / 1300)
      setCount(Math.round((1 - Math.pow(1 - progress, 3)) * 100))
      if (progress < 1) { frame = requestAnimationFrame(tick); return }
      setLeaving(true)
      exit = window.setTimeout(onDone, 700)
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); window.clearTimeout(exit) }
  }, [onDone])

  return (
    <div className={leaving ? 'boot is-leaving' : 'boot'} role="status" aria-label="Loading portfolio">
      <div className="boot-top"><b>KS<span>.</span></b><span>PORTFOLIO / 2026</span></div>
      <div className="boot-main" aria-hidden="true">
        <span className="boot-step">{STEPS[Math.min(STEPS.length - 1, Math.floor(count / 26))]}</span>
        <strong>{String(count).padStart(3, '0')}</strong>
      </div>
      <div className="boot-bar" aria-hidden="true"><i style={{ transform: `scaleX(${count / 100})` }} /></div>
    </div>
  )
}
