import { useEffect, useRef, useState } from 'react'
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import Lenis from 'lenis'
import { ArrowDownRight, ArrowUpRight, Download, ExternalLink, Github, Linkedin, Mail, MapPin, Menu, MoveRight, Sparkles, X } from 'lucide-react'
import { projects, skills } from './data'

const reveal = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-70px' }, transition: { duration: .65 } }
const heroPhrases = ['Full Stack Developer', 'MERN Developer', 'AI Enthusiast', 'Problem Solver', 'Hackathon Builder']
const heroStats = [
  { value: '8+', label: 'Projects Built' },
  { value: '12+', label: 'Hackathons' },
  { value: '15+', label: 'Technologies' },
  { value: '300+', label: 'DSA Problems' }
]

const commandOutput: Record<string, () => string[]> = {
  help: () => [
    'help — show available commands',
    'whoami — view profile summary',
    'skills — list core skills',
    'projects — list portfolio projects',
    'github — show GitHub profile',
    'linkedin — show LinkedIn',
    'resume — open resume link',
    'contact — email contact info',
    'experience — view work summary',
    'education — view education summary',
    'currently — current focus areas',
    'clear — clear the terminal'
  ],
  whoami: () => ['Karthik Sriram', 'Full Stack Developer', 'Computer Science Student', 'Hackathon Enthusiast'],
  skills: () => ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'AI / ML', 'AWS / Cloud', 'UI/UX'],
  projects: () => projects.map(p => `${p.name} — ${p.type}`),
  github: () => ['https://github.com/Karthik-Sriram-11'],
  linkedin: () => ['https://linkedin.com/in/karthiksriram11'],
  resume: () => ['Resume available at /resume.pdf'],
  contact: () => ['karthiksriram.dev@gmail.com'],
  experience: () => ['Assistant Manager – Accounting & Assets', 'Advanced Academic Centre (AAC), GRIET', 'Strategic finance and event coordination'],
  education: () => ['B.Tech CSE — 3rd Year', 'Passionate about software engineering and product design'],
  currently: () => ['Building MeshLine', 'Learning Docker', 'Exploring AWS', 'Looking for Full Stack Internship'],
  sudo: () => ['Permission denied: only an admin can run this command.'],
  coffee: () => ['☕ Coffee levels increased.', 'Coding speed +25%.'],
  matrix: () => ['Matrix mode engaged.'],
  music: () => ['Check out my Spotify playlist — https://open.spotify.com/playlist/your-playlist-link'],
  '404': () => ['404 — Not found.', 'Why did the developer go broke? Because he used up all his cache.'],
  hack: () => ['Top hackathons:', 'HACKWITHAI — Top 50', 'HACK WITH HYDERABAD — Top 1000']
}

function Nav() {
  const [open, setOpen] = useState(false)
  const items = ['Home', 'Journey', 'Experience', 'Craft', 'Stack', 'Connect']
  return <nav className="nav"><Link to="/" className="brand">KS<span>.</span></Link><div className={open ? 'navlinks open' : 'navlinks'}>{items.map(x => <a onClick={() => setOpen(false)} href={`/#${x === 'Home' ? 'home' : x.toLowerCase()}`} key={x}>{x}</a>)}</div><button className="menu" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></nav>
}

function Magnetic({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  return <a ref={ref} className={`magnetic ${className}`} onMouseMove={e => { const r = ref.current!.getBoundingClientRect(); ref.current!.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px)` }} onMouseLeave={() => ref.current!.style.transform = ''}>{children}</a>
}

function LiveTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()).toLowerCase())
    update(); const id = window.setInterval(update, 1000)
    return () => window.clearInterval(id)
  }, [])
  return <b>IST — {time || '—'}</b>
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Home({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [formError, setFormError] = useState('')
  useEffect(() => { const lenis = new Lenis({ lerp: .15 }); let id: number; const tick = (t:number) => { lenis.raf(t); id=requestAnimationFrame(tick) }; id=requestAnimationFrame(tick); return () => { cancelAnimationFrame(id); lenis.destroy() } }, [])
  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFormState('sending'); setFormError('')
    const form = event.currentTarget
    const accessKey = import.meta.env.VITE_WEB3FORMS_KEY
    if (!accessKey) { setFormError('Contact form setup is pending. Please email me directly.'); setFormState('error'); return }
    const data = new FormData(form); data.append('access_key', accessKey); data.append('subject', 'New portfolio enquiry for Karthikeya Sriram'); data.append('from_name', 'Karthikeya Sriram Portfolio')
    try { const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data }); const result = await response.json(); if (!result.success) throw new Error(result.message || 'Message failed to send.'); setFormState('sent'); form.reset() } catch (error) { setFormError(error instanceof Error ? error.message : 'Message failed to send.'); setFormState('error') }
  }
  return <>
    <Hero onOpenTerminal={onOpenTerminal} />
    <main>
      <section id="journey" className="section journey"><motion.div {...reveal} className="eyebrow accent">THE PATH TAKEN</motion.div><motion.h2 {...reveal}>Journey</motion.h2><div className="journey-list">{[['2026 — PRESENT','B.Tech CSE • 3rd Year','Deep in the internship hunt. Shipping side projects and studying distributed systems, AI, and cloud-native architecture.'],['2025','Hackathons & Full-Stack Focus','Built production-minded projects under pressure, including a secure medical records platform and a competitive coding arena.'],['2025','Into the MERN Stack','Went from HTML/CSS tinkering to production-grade React, Node, Express, and MongoDB. First full-stack apps shipped.'],['2024','First Line of Code','Wrote my first program. Fell in love with the loop of thinking → building → shipping. Never looked back.']].map(([year,title,copy],i)=><motion.article {...reveal} className={`journey-entry ${i===0?'current':''}`} key={title}><span className="dot"></span><div><small>{year}</small><h3>{title}</h3><p>{copy}</p></div></motion.article>)}</div></section>
      <section id="experience" className="section experience">
        <motion.div {...reveal} className="eyebrow accent">WORK HISTORY</motion.div>
        <motion.h2 {...reveal}>Experience</motion.h2>
        <div style={{ marginTop: '60px' }}>
          <motion.div {...reveal} className="experience-row">
            <span>AUG 2025 — PRESENT</span>
            <div>
              <h2>Assistant Manager</h2>
              <p style={{ marginTop: '6px', color: 'var(--blue)', font: '500 11px \'DM Mono\'', letterSpacing: '.13em', textTransform: 'uppercase' }}>Accounting & Assets</p>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>Advanced Academic Centre (AAC), GRIET · Hyderabad</p>
            </div>
            <div>
              <p>Managed financial records, registration accounting, asset tracking, and expense coordination for club activities and technical events.</p>
              <p style={{ marginTop: '12px' }}>Coordinated junior project teams by tracking progress and acting as the communication bridge between students, mentors, and club leadership.</p>
              <p style={{ marginTop: '12px' }}>Contributed to Project Expo and Opulence through financial operations, sponsorship outreach, logistics, and event coordination.</p>
            </div>
          </motion.div>
        </div>
      </section>
      <section id="craft" className="section craft"><motion.div {...reveal} className="eyebrow accent">SELECTED WORKS</motion.div><motion.div className="craft-title" {...reveal}><h2>Craft</h2><span>0{projects.length} PROJECTS</span></motion.div><div className="project-stack">{projects.map((p, i) => <motion.article {...reveal} className={`project project-${p.color} ${i % 2 ? 'reverse' : ''}`} key={p.slug}><div className="project-copy"><div className="project-label"><b>0{i+1} — PROJECT</b><span>{p.type}</span></div><h3>{p.name}</h3><p>{p.description}</p><div className="tags">{p.stack.map(s=><span key={s}>{s}</span>)}</div><div className="project-links"><a href={p.github} target="_blank" rel="noreferrer"><Github/> CODE</a><Link to={`/work/${p.slug}`}>CASE STUDY <ArrowDownRight/></Link></div></div><div className="project-poster"><div className="poster-card"><small>{p.name.toUpperCase()}</small><strong>{p.statement}</strong></div></div></motion.article>)}</div></section>
      <section id="stack" className="section arsenal"><motion.div {...reveal} className="eyebrow">03 / TECH ARSENAL</motion.div><motion.h2 {...reveal}>The tools are<br/><i>only the beginning.</i></motion.h2><div className="skill-grid">{Object.entries(skills).map(([group, list])=><motion.div {...reveal} className="skill-block" key={group}><h3>{group}</h3>{list.map(x=><span key={x}>{x}<b>↗</b></span>)}</motion.div>)}</div></section>
      <section id="arena" className="section experience"><motion.div {...reveal} className="eyebrow accent">IN THE ARENA</motion.div><motion.div {...reveal} className="achievement-bar"><span>HACKWITHAI</span><p>Top 50 of ~1,000 teams at Telangana’s largest 24-hour offline AI hackathon.</p><span>HACK WITH HYDERABAD</span><p>Top 1,000 of 3,000 teams at Microsoft Hyderabad.</p></motion.div></section>
      <section className="section playground"><motion.div {...reveal} className="eyebrow">05 / PLAYGROUND</motion.div><motion.div {...reveal} className="play-card"><div><span className="status"><i/> LIVE EXPERIMENT</span><h2>Type faster.<br/>Think <i>sharper.</i></h2><p>A tiny typing laboratory built for focus.</p><button onClick={() => alert('Playground modules are ready for expansion.')}>Launch experiment <MoveRight/></button></div><div className="typing"><span>64</span><small>WPM</small><div className="progress"><i></i></div><p>“Great software is the art of making complexity feel invisible.”</p></div></motion.div></section>
      <section id="connect" className="section contact"><motion.div {...reveal} className="contact-shell"><div><div className="eyebrow accent">CONNECT</div><h2>Let’s build something<br/><i>impactful</i> together.</h2><p>Open for internships, hackathons, freelance, and thoughtful collaborations. Reach out — I reply fast.</p><div className="contact-actions"><a href="mailto:karthiksriram.dev@gmail.com" target="_blank" rel="noreferrer"><Mail/> EMAIL</a><a href="https://github.com/Karthik-Sriram-11" target="_blank" rel="noreferrer"><Github/> GITHUB</a><a href="https://linkedin.com/in/karthiksriram11" target="_blank" rel="noreferrer"><Linkedin/> LINKEDIN</a></div><p className="location"><MapPin/> Hyderabad, Telangana, India</p></div><form onSubmit={sendMessage}>{formState === 'sent' ? <div className="sent"><Sparkles/> Message received. I’ll be in touch.</div> : <><input required name="name" placeholder="Your name"/><input required name="email" type="email" placeholder="Email address"/><input className="honeypot" name="botcheck" tabIndex={-1} autoComplete="off"/><textarea required name="message" placeholder="Tell me a little about it" rows={4}/><button disabled={formState === 'sending'}>{formState === 'sending' ? 'Sending…' : <>Send a note <ArrowUpRight/></>}</button>{formState === 'error' && <p className="form-error">{formError}</p>}</>}</form></motion.div></section>
    </main><footer><span>© 2026 Karthik Sriram</span><span>Made with curiosity & restraint.</span></footer>
  </>
}

function Hero({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 20 })
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [spotlight, setSpotlight] = useState({ x: '50%', y: '50%' })
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion) return
    const interval = window.setInterval(() => setPhraseIndex(prev => (prev + 1) % heroPhrases.length), 2800)
    return () => window.clearInterval(interval)
  }, [prefersReducedMotion])

  return <header id="home" className="hero" onMouseMove={e => {
    const x = (e.clientX / window.innerWidth) * 100
    const y = (e.clientY / window.innerHeight) * 100
    setSpotlight({ x: `${x}%`, y: `${y}%` })
  }} onMouseLeave={() => setSpotlight({ x: '50%', y: '50%' })}>
    <motion.div className="scroll-progress" style={{ scaleX }} />
    <div className="hero-atmosphere">
      <div className="hero-blob blob-1" />
      <div className="hero-blob blob-2" />
      <div className="hero-spotlight" style={{ left: spotlight.x, top: spotlight.y }} />
      <div className="hero-grid-lines" />
    </div>
    <div className="hero-inner">
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, ease: 'easeOut' }}>
        <span className="eyebrow accent">Premium engineering for product teams</span>
        <h1>Building software that solves real-world problems.</h1>
        <p className="hero-subline">I craft scalable web experiences, ship production-ready applications, and explore AI workflows while keeping design thoughtful and accessible.</p>
        <div className="hero-title-cycle" aria-live="polite">
          <span>{heroPhrases[phraseIndex]}</span>
        </div>
      </motion.div>
      <motion.div className="hero-panel" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15, duration: .9, ease: 'easeOut' }}>
        <div className="hero-left">
          <p className="hero-intro">I’m Karthikeya Sriram. I build premium developer experiences, lead hackathon-focused engineering, and pursue product design that feels confident without being loud.</p>
          <div className="hero-cta">
            <motion.a whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: .98 }} href="#craft" className="button primary">View Projects <ArrowDownRight/></motion.a>
            <motion.a whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: .98 }} href="/resume.pdf" target="_blank" rel="noreferrer" className="button secondary"><Download/> Download Resume</motion.a>
          </div>
          <div className="hero-stats">
            {heroStats.map(stat => <motion.div key={stat.label} className="hero-stat" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .4 }} transition={{ duration: .55, ease: 'easeOut' }}><strong>{stat.value}</strong><span>{stat.label}</span></motion.div>)}
          </div>
        </div>
        <motion.div className="hero-profile-card" whileHover={{ y: -8, boxShadow: '0 32px 84px rgba(20,40,90,.24)' }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
          <div className="profile-border">
            <img className="profile-photo" src="/profile.jpeg" alt="Karthikeya Sriram" onDoubleClick={onOpenTerminal} />
          </div>
          <div className="profile-details">
            <span className="status-pill">B.Tech CSE • Year 3</span>
            <p>Open for internships and product-focused roles. Double-click my photo to unlock a hidden terminal.</p>
          </div>
        </motion.div>
      </motion.div>
      <div className="hero-meta"><span>SCROLL ↓</span><span>2026 / PORTFOLIO</span></div>
    </div>
  </header>
}

function TerminalOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [history, setHistory] = useState<{ value: string; output: string[] }[]>([])
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState(-1)
  const [matrixMode, setMatrixMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    window.setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  useEffect(() => {
    if (!matrixMode) return
    const timer = window.setTimeout(() => setMatrixMode(false), 6000)
    return () => window.clearTimeout(timer)
  }, [matrixMode])

  const submitCommand = (command: string) => {
    const trimmed = command.trim().toLowerCase()
    if (!trimmed) return
    if (trimmed === 'clear') {
      setHistory([])
      setInput('')
      return
    }
    if (trimmed === 'sudo hire me') {
      setHistory(prev => [...prev, { value: command, output: ['Permission granted.', 'Opening internship opportunities...'] }])
      setInput('')
      return
    }
    if (trimmed === 'matrix') {
      setMatrixMode(true)
    }
    const handler = commandOutput[trimmed] ?? (() => ['Command not found. Try help.'])
    setHistory(prev => [...prev, { value: command, output: handler() }])
    setInput('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); submitCommand(input);
      setSelected(-1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault(); setSelected(prev => Math.max(0, Math.min(history.length - 1, prev === -1 ? history.length - 1 : prev - 1)))
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault(); setSelected(prev => (prev === -1 ? -1 : Math.min(history.length - 1, prev + 1)))
    }
    if (event.key === 'Escape') {
      event.preventDefault(); onClose()
    }
  }

  useEffect(() => {
    if (selected >= 0 && history[selected]) {
      setInput(history[selected].value)
    }
  }, [selected, history])

  if (!open) return null
  return <div className="terminal-overlay" role="dialog" aria-modal="true" aria-label="Developer terminal">
    <div className="terminal-window">
      <div className="terminal-header"><div className="terminal-circles"><span/><span/><span/></div><button className="terminal-close" onClick={onClose} aria-label="Close terminal">⨯</button></div>
      <div className="terminal-body">
        {matrixMode && <div className="matrix-mask" aria-hidden="true" />}
        <div className="terminal-log">
          <div className="terminal-welcome">Welcome to the hidden terminal. Type <span>help</span> to get started.</div>
          {history.map((entry, index) => <div key={`${entry.value}-${index}`} className="terminal-entry"><div className="terminal-command">&gt; {entry.value}</div>{entry.output.map((line, lineIndex) => <div key={lineIndex} className="terminal-response">{line}</div>)}</div>)}
        </div>
        <div className="terminal-input-row"><span className="terminal-prompt">&gt;</span><input ref={inputRef} autoComplete="off" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Enter a command…" aria-label="Terminal command input" /></div>
      </div>
    </div>
  </div>
}

function CaseStudy() { const { slug } = useParams(); const p = projects.find(x=>x.slug===slug) || projects[0]; return <main className="case"><Link to="/" className="back">← Back to home</Link><div className={`case-hero project-${p.color}`}><p>{p.type} / {p.year}</p><h1>{p.name}</h1><p>{p.description}</p></div><section><div className="eyebrow accent">THE BUILD</div><h2>How it<br/><i>comes together.</i></h2><p className="lead">{p.challenge}</p><div className="case-grid"><article><b>01</b><h3>Architecture</h3><p>{p.architecture}</p></article><article><b>02</b><h3>Solution</h3><p>{p.solution}</p></article><article><b>03</b><h3>Future improvements</h3><p>{p.next}</p></article></div><a className="button primary" href={p.github} target="_blank" rel="noreferrer">View on GitHub <Github/></a></section></main> }

export default function App() {
  const location = useLocation()
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [konamiActive, setKonamiActive] = useState(false)

  useEffect(() => {
    const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
    let position = 0
    const handler = (event: KeyboardEvent) => {
      const key = event.key
      if (key.toLowerCase() === 'k') {
        setTerminalOpen(true)
      }
      if (key === sequence[position]) {
        position += 1
        if (position === sequence.length) {
          setKonamiActive(true)
          position = 0
        }
      } else {
        position = key === sequence[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!konamiActive) return
    const timeout = window.setTimeout(() => setKonamiActive(false), 5000)
    return () => window.clearTimeout(timeout)
  }, [konamiActive])

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      const ripple = document.createElement('span')
      ripple.className = 'cursor-ripple'
      ripple.style.left = `${event.clientX}px`
      ripple.style.top = `${event.clientY}px`
      document.body.appendChild(ripple)
      window.setTimeout(() => ripple.remove(), 600)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  }, [])

  return <>
    {konamiActive && <div className="confetti-layer" aria-hidden="true" />}
    <ScrollToTop />
    <Nav />
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home onOpenTerminal={() => setTerminalOpen(true)} />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
      </Routes>
    </AnimatePresence>
    <TerminalOverlay open={terminalOpen} onClose={() => setTerminalOpen(false)} />
  </>
}
