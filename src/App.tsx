import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import Lenis from 'lenis'
import { ArrowDownRight, ArrowUp, ArrowUpRight, Copy, ExternalLink, Github, Linkedin, Mail, MapPin, Menu, Sparkles, X } from 'lucide-react'
import { projects, skills } from './data'
import { Confetti, CountUp, CursorGlow, Magnetic, RoleCycle, SECRETS, SECRET_IDS, Scramble, SplitText, Toaster, confetti, prefersReducedMotion, scrollToId, setLenis, toast, unlock, useSecrets, useTilt, warp } from './effects'
import Preloader from './Preloader'
import ProjectArt from './ProjectArt'
import TerminalOverlay from './Terminal'

const Scene3D = lazy(() => import('./Scene3D'))

const EMAIL = 'karthiksriram.dev@gmail.com'
const GITHUB = 'https://github.com/Karthik-Sriram-11'
const LINKEDIN = 'https://linkedin.com/in/karthiksriram11'
const EASE = [0.22, 1, 0.36, 1] as const

const reveal = { initial: { opacity: 0, y: 34, rotateX: 7 }, whileInView: { opacity: 1, y: 0, rotateX: 0 }, viewport: { once: true, margin: '-70px' }, transition: { duration: .8, ease: EASE } }

const NAV = [['home', 'Home'], ['journey', 'Journey'], ['experience', 'Experience'], ['craft', 'Craft'], ['stack', 'Stack'], ['connect', 'Connect']] as const
const heroPhrases = ['Full Stack Developer', 'MERN Developer', 'AI Enthusiast', 'Problem Solver', 'Hackathon Builder']
const allSkills = Object.values(skills).flat()

const heroStats = [
  { to: 7, pad: 0, prefix: '', suffix: '+', label: 'Projects shipped' },
  { to: allSkills.length, pad: 2, prefix: '', suffix: '', label: 'Technologies in rotation' },
  { to: 50, pad: 0, prefix: 'Top ', suffix: '', label: 'HackWithAI · ~1,000 teams' },
  { to: 1, pad: 2, prefix: '', suffix: '', label: 'Industry internship' }
]

const journey = [
  ['2026 — PRESENT', 'B.Tech CSE • 3rd Year', 'Shipping side projects and studying distributed systems, AI, and cloud-native architecture.'],
  ['2025', 'Hackathons & Full-Stack Focus', 'Built production-minded projects under pressure, including a secure medical records platform and a competitive coding arena.'],
  ['2025', 'Into the MERN Stack', 'Went from HTML/CSS tinkering to production-grade React, Node, Express, and MongoDB. First full-stack apps shipped.'],
  ['2024', 'First Line of Code', 'Wrote my first program. Fell in love with the loop of thinking → building → shipping. Never looked back.']
]

const experience = [
  {
    period: 'JUL 2026 — AUG 2026',
    role: 'Software Engineering Intern',
    focus: 'Cybersecurity Compliance',
    org: 'RHYM Technologies LLP · Hyderabad',
    points: [
      'Developed and maintained the CAP cybersecurity compliance platform using React.js, Node.js, MongoDB, and AWS, while fixing defects identified through system testing.',
      'Implemented audit-trail functionality, session persistence across page navigation, and assessment-level approval/rejection summaries for compliance workflows.',
      'Enhanced platform UI and usability across key workflows to improve the overall user experience.'
    ]
  },
  {
    period: 'AUG 2025 — PRESENT',
    role: 'Coordinator',
    focus: 'Accounting & Assets',
    org: 'Advanced Academic Centre (AAC), GRIET · Hyderabad',
    points: [
      'Managed financial records, registration accounting, asset tracking, and expense coordination for club activities and technical events.',
      'Coordinated junior project teams by tracking progress and acting as the communication bridge between students, mentors, and club leadership.',
      'Contributed to Project Expo and Opulence through financial operations, sponsorship outreach, logistics, and event coordination.'
    ]
  }
]

const arena = [
  { event: 'HACKWITHAI', rank: 50, field: 1000, approx: true, copy: 'Telangana’s largest 24-hour offline AI hackathon.' },
  { event: 'HACK WITH HYDERABAD', rank: 1000, field: 3000, approx: false, copy: 'Hosted at Microsoft Hyderabad.' }
]

const stored = (area: 'local' | 'session', key: string) => {
  try { return (area === 'local' ? window.localStorage : window.sessionStorage).getItem(key) === '1' } catch { return false }
}
const store = (area: 'local' | 'session', key: string, on: boolean) => {
  try {
    const storage = area === 'local' ? window.localStorage : window.sessionStorage
    if (on) storage.setItem(key, '1')
    else storage.removeItem(key)
  } catch { /* storage unavailable: the preference just won't persist */ }
}

const copyEmail = () => {
  if (!navigator.clipboard) { toast(EMAIL); return }
  navigator.clipboard.writeText(EMAIL).then(() => toast('Email copied to clipboard'), () => toast(EMAIL))
}

const greeting = () => {
  const hour = new Date().getHours()
  return hour < 5 || hour >= 22 ? 'Up late' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

// The 3D layer is decoration: if WebGL or its chunk fails, drop it rather than take the page down.
class SceneBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

function useActiveSection(pathname: string) {
  const [active, setActive] = useState('')

  useEffect(() => {
    if (pathname !== '/') { setActive(''); return }
    let frame = 0
    const measure = () => {
      frame = 0
      const line = window.innerHeight * 0.4
      let current: string = NAV[0][0]
      for (const [id] of NAV) {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule) }
  }, [pathname])

  return active
}

function LiveTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()).toLowerCase())
    update(); const id = window.setInterval(update, 1000)
    return () => window.clearInterval(id)
  }, [])
  return <>{time || '—'}</>
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 20 })
  return <motion.div className="scroll-progress" style={{ scaleX }} />
}

function Nav({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const logoClicks = useRef<number[]>([])

  const onLogo = () => {
    const now = Date.now()
    logoClicks.current = [...logoClicks.current.filter(t => now - t < 2500), now]
    if (logoClicks.current.length < 5) return
    logoClicks.current = []
    warp()
    if (!unlock('warp')) toast('Warp drive engaged')
  }
  // layoutRoot: the nav is position:fixed, so the pill must be measured against it, not the scrolling page.
  return <nav className="nav">
    <a href="/" className="brand" onClick={event => { event.preventDefault(); setOpen(false); onLogo(); onNavigate('home') }}>KS<span>.</span></a>
    <motion.div layoutRoot className={open ? 'navlinks open' : 'navlinks'}>
      {NAV.map(([id, label]) => (
        <a key={id} href={`/#${id}`} aria-current={active === id ? 'true' : undefined} onClick={event => { event.preventDefault(); setOpen(false); onNavigate(id) }}>
          {active === id && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
          <Scramble text={label} />
        </a>
      ))}
    </motion.div>
    <button className="menu" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
  </nav>
}

function Hero({ booted, onOpenTerminal }: { booted: boolean; onOpenTerminal: () => void }) {
  const root = useRef<HTMLElement>(null)
  const portrait = useTilt<HTMLDivElement>(12)
  const enter = (delay: number) => ({ initial: { opacity: 0, y: 26 }, animate: booted ? { opacity: 1, y: 0 } : undefined, transition: { delay, duration: .9, ease: EASE } })

  return <header id="home" className="stage-hero" ref={root} onMouseMove={event => {
    const rect = root.current!.getBoundingClientRect()
    root.current!.style.setProperty('--sx', `${event.clientX - rect.left}px`)
    root.current!.style.setProperty('--sy', `${event.clientY - rect.top}px`)
  }}>
    <div className="hero-atmosphere">
      <div className="hero-blob blob-1" />
      <div className="hero-blob blob-2" />
      <div className="hero-spotlight" />
      <div className="hero-grid-lines" />
    </div>
    <div className="sh-grid">
      <div className="sh-copy">
        <motion.p {...enter(0)} className="sh-status"><i /> Open for internships <span>/</span> Hyderabad <LiveTime /> IST</motion.p>
        <h1 className="sh-name"><SplitText text="Karthikeya Sriram" play={booted} delay={0.1} /></h1>
        <motion.p {...enter(.6)} className="sh-role"><span>&gt;</span><RoleCycle phrases={heroPhrases} /></motion.p>
        <motion.p {...enter(.7)} className="sh-tagline">Building software that solves real-world problems.</motion.p>
        <motion.p {...enter(.8)} className="sh-sub">I craft scalable web experiences, ship production-ready applications, and explore AI workflows while keeping design thoughtful and accessible.</motion.p>
        <motion.div {...enter(.9)} className="sh-cta">
          <Magnetic><button type="button" className="button primary" onClick={() => scrollToId('craft')}>View Projects <ArrowDownRight/></button></Magnetic>
          <Magnetic><a className="button secondary" href="/resume.pdf" target="_blank" rel="noopener noreferrer"><ExternalLink/> View Resume</a></Magnetic>
        </motion.div>
      </div>
      <motion.div {...enter(.45)} className="sh-side">
        <div className="sh-portrait tilt" ref={portrait.ref} onMouseMove={portrait.onMouseMove} onMouseLeave={portrait.onMouseLeave}>
          <span className="tilt-sheen" aria-hidden="true" />
          <div className="sh-photo"><img src="/profile.jpeg" alt="Karthikeya Sriram" onDoubleClick={onOpenTerminal} /></div>
          <span className="sh-chip chip-a depth-3">B.Tech CSE · Year 3</span>
          <span className="sh-chip chip-b depth-3"><MapPin /> Hyderabad, India</span>
        </div>
        <p className="sh-caption">Psst — double-click the photo to unlock a hidden terminal.</p>
      </motion.div>
    </div>
    <motion.dl {...enter(1.05)} className="sh-stats">
      {heroStats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.prefix}{booted ? <CountUp to={stat.to} pad={stat.pad} duration={2200} /> : '0'.repeat(stat.pad || 1)}{stat.suffix}</dd></div>)}
    </motion.dl>
  </header>
}

function Marquee() {
  const row = (items: string[], reverse: boolean) => (
    <div className={reverse ? 'marquee-track reverse' : 'marquee-track'}>
      {[0, 1].map(copy => <div className="marquee-set" key={copy}>{items.map(item => <span key={item}>{item}<i>✦</i></span>)}</div>)}
    </div>
  )
  return <div className="marquee" aria-hidden="true">{row(allSkills, false)}{row([...allSkills].reverse(), true)}</div>
}

function Journey() {
  const list = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 75%', 'end 55%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 26 })

  return <section id="journey" className="section journey">
    <motion.div {...reveal} className="eyebrow accent">THE PATH TAKEN</motion.div>
    <motion.h2 {...reveal}>Journey</motion.h2>
    <div className="journey-list" ref={list}>
      <motion.span className="journey-progress" style={{ scaleY }} aria-hidden="true" />
      {journey.map(([year, title, copy], i) => (
        <motion.article {...reveal} className={`journey-entry ${i === 0 ? 'current' : ''}`} key={title}>
          <span className="dot"></span>
          <div><small>{year}</small><h3>{title}</h3><p>{copy}</p></div>
        </motion.article>
      ))}
    </div>
  </section>
}

function ProjectCard({ project, index }: { project: typeof projects[number]; index: number }) {
  const tilt = useTilt<HTMLElement>(7)
  return <motion.article {...reveal} ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} className={`project tilt project-${project.color} ${index % 2 ? 'reverse' : ''}`}>
    <span className="tilt-sheen" aria-hidden="true" />
    <div className="project-copy depth-1">
      <div className="project-label"><b>0{index + 1} — PROJECT</b><span>{project.type}</span></div>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <div className="tags">{project.stack.map(s => <span key={s}>{s}</span>)}</div>
      <div className="project-links"><a href={project.github} target="_blank" rel="noreferrer"><Github/> CODE</a><Link to={`/work/${project.slug}`}>CASE STUDY <ArrowDownRight/></Link></div>
    </div>
    <div className="project-poster">
      <ProjectArt slug={project.slug} />
      <div className="poster-caption"><small>{project.name.toUpperCase()}</small><strong>{project.statement}</strong></div>
    </div>
  </motion.article>
}

function SkillBlock({ group, list }: { group: string; list: string[] }) {
  const tilt = useTilt<HTMLDivElement>(10)
  return <motion.div {...reveal} ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} className="skill-block tilt">
    <span className="tilt-sheen" aria-hidden="true" />
    <h3 className="depth-1">{group}</h3>
    {list.map(x => <span className="depth-1" key={x}>{x}<b>↗</b></span>)}
  </motion.div>
}

function ArenaCard({ entry }: { entry: typeof arena[number] }) {
  const tilt = useTilt<HTMLElement>(8)
  const about = entry.approx ? '~' : ''
  return <motion.article {...reveal} ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} className="arena-card tilt">
    <span className="tilt-sheen" aria-hidden="true" />
    <small>{entry.event}</small>
    <strong>Top <CountUp to={entry.rank} /></strong>
    <span className="arena-field">of {about}{entry.field.toLocaleString('en-US')} teams</span>
    <div className="arena-meter" aria-hidden="true">
      <motion.i initial={{ scaleX: 0 }} whileInView={{ scaleX: entry.rank / entry.field }} viewport={{ once: true }} transition={{ duration: 1.4, delay: .25, ease: EASE }} />
    </div>
    <span className="arena-percent">Top {about}{Math.round((entry.rank / entry.field) * 100)}% of the field</span>
    <p>{entry.copy}</p>
  </motion.article>
}

function SecretsHint() {
  const found = useSecrets()
  const next = SECRET_IDS.find(id => !found.includes(id))
  return <button type="button" className="secrets-hint" onClick={() => toast(next ? `Hint: ${SECRETS[next].hint}` : 'All secrets found. You’re thorough — let’s work together.')}>
    <i aria-hidden="true" /> {found.length}/{SECRET_IDS.length} secrets found
  </button>
}

function Home({ booted, onOpenTerminal, onNavigate }: { booted: boolean; onOpenTerminal: () => void; onNavigate: (id: string) => void }) {
  const location = useLocation()
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const lenis = new Lenis({ lerp: .15 })
    setLenis(lenis)
    let id = 0
    const tick = (time: number) => { lenis.raf(time); id = requestAnimationFrame(tick) }
    id = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(id); setLenis(null); lenis.destroy() }
  }, [])

  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo ?? location.hash.slice(1)
    if (!target) return
    const timer = window.setTimeout(() => scrollToId(target), 140)
    return () => window.clearTimeout(timer)
  }, [location.state, location.hash])

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFormState('sending'); setFormError('')
    const form = event.currentTarget
    const accessKey = import.meta.env.VITE_WEB3FORMS_KEY
    if (!accessKey) { setFormError('Contact form setup is pending. Please email me directly.'); setFormState('error'); return }
    const data = new FormData(form); data.append('access_key', accessKey); data.append('subject', 'New portfolio enquiry for Karthikeya Sriram'); data.append('from_name', 'Karthikeya Sriram Portfolio')
    try { const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data }); const result = await response.json(); if (!result.success) throw new Error(result.message || 'Message failed to send.'); setFormState('sent'); form.reset() } catch (error) { setFormError(error instanceof Error ? error.message : 'Message failed to send.'); setFormState('error') }
  }

  return <>
    <Hero booted={booted} onOpenTerminal={onOpenTerminal} />
    <Marquee />
    <main>
      <Journey />
      <section id="experience" className="section experience">
        <motion.div {...reveal} className="eyebrow accent">WORK HISTORY</motion.div>
        <motion.h2 {...reveal}>Experience</motion.h2>
        <div className="xp-list">
          {experience.map(job => (
            <motion.div {...reveal} className="experience-row" key={job.role}>
              <span>{job.period}</span>
              <div>
                <h2>{job.role}</h2>
                <p className="xp-focus">{job.focus}</p>
                <p className="xp-org">{job.org}</p>
              </div>
              <div className="xp-points">{job.points.map(point => <p key={point}>{point}</p>)}</div>
            </motion.div>
          ))}
        </div>
      </section>
      <section id="craft" className="section craft">
        <motion.div {...reveal} className="eyebrow accent">SELECTED WORKS</motion.div>
        <motion.div className="craft-title" {...reveal}><h2>Craft</h2><span>0{projects.length} PROJECTS</span></motion.div>
        <div className="project-stack">{projects.map((p, i) => <ProjectCard project={p} index={i} key={p.slug} />)}</div>
      </section>
      <section id="stack" className="section arsenal">
        <motion.div {...reveal} className="eyebrow">03 / TECH ARSENAL</motion.div>
        <motion.h2 {...reveal}>The tools are<br/><i>only the beginning.</i></motion.h2>
        <div className="skill-grid">{Object.entries(skills).map(([group, list]) => <SkillBlock group={group} list={list} key={group} />)}</div>
      </section>
      <section id="arena" className="section arena">
        <motion.div {...reveal} className="eyebrow accent">IN THE ARENA</motion.div>
        <motion.h2 {...reveal}>Tested under<br/><i>pressure.</i></motion.h2>
        <div className="arena-grid">{arena.map(entry => <ArenaCard entry={entry} key={entry.event} />)}</div>
      </section>
      <section id="connect" className="section contact">
        <motion.div {...reveal} className="contact-shell">
          <div>
            <div className="eyebrow accent">CONNECT</div>
            <h2>Let’s build something<br/><i>impactful</i> together.</h2>
            <p>Open for internships, hackathons, freelance, and thoughtful collaborations. Reach out — I reply fast.</p>
            <div className="contact-actions">
              <a href={`mailto:${EMAIL}`} target="_blank" rel="noreferrer"><Mail/> EMAIL</a>
              <a href={GITHUB} target="_blank" rel="noreferrer"><Github/> GITHUB</a>
              <a href={LINKEDIN} target="_blank" rel="noreferrer"><Linkedin/> LINKEDIN</a>
            </div>
            <button type="button" className="copy-email" onClick={copyEmail}><Copy /> {EMAIL}</button>
            <p className="location"><MapPin/> Hyderabad, Telangana, India</p>
          </div>
          <form onSubmit={sendMessage}>{formState === 'sent' ? <div className="sent"><Sparkles/> Message received. I’ll be in touch.</div> : <><input required name="name" placeholder="Your name"/><input required name="email" type="email" placeholder="Email address"/><input className="honeypot" name="botcheck" tabIndex={-1} autoComplete="off"/><textarea required name="message" placeholder="Tell me a little about it" rows={4}/><button disabled={formState === 'sending'}>{formState === 'sending' ? 'Sending…' : <>Send a note <ArrowUpRight/></>}</button>{formState === 'error' && <p className="form-error">{formError}</p>}</>}</form>
        </motion.div>
      </section>
    </main>
    <footer className="site-footer">
      <div className="footer-name" aria-hidden="true">Karthikeya Sriram</div>
      <div className="footer-row">
        <span>© 2026 Karthik Sriram</span>
        <span>{greeting()} — it’s <LiveTime /> in Hyderabad.</span>
        <SecretsHint />
        <button type="button" onClick={() => onNavigate('home')}>Back to top <ArrowUp /></button>
      </div>
    </footer>
  </>
}

function CaseStudy() {
  const { slug } = useParams()
  const index = Math.max(0, projects.findIndex(x => x.slug === slug))
  const p = projects[index]
  const next = projects[(index + 1) % projects.length]

  return <main className="case">
    <Link to="/" className="back">← Back to home</Link>
    <div className={`case-hero project-${p.color}`}>
      <div className="case-art"><ProjectArt slug={p.slug} /></div>
      <p>{p.type} / {p.year}</p>
      <h1>{p.name}</h1>
      <p>{p.description}</p>
    </div>
    <section>
      <div className="eyebrow accent">THE BUILD</div>
      <h2>How it<br/><i>comes together.</i></h2>
      <p className="lead">{p.challenge}</p>
      <div className="case-grid">
        <article><b>01</b><h3>Architecture</h3><p>{p.architecture}</p></article>
        <article><b>02</b><h3>Solution</h3><p>{p.solution}</p></article>
        <article><b>03</b><h3>Future improvements</h3><p>{p.next}</p></article>
      </div>
      <a className="button primary" href={p.github} target="_blank" rel="noreferrer">View on GitHub <Github/></a>
    </section>
    <Link to={`/work/${next.slug}`} className={`case-next project-${next.color}`}>
      <small>NEXT PROJECT</small>
      <strong>{next.name}</strong>
      <ArrowUpRight />
    </Link>
  </main>
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [booted, setBooted] = useState(() => prefersReducedMotion() || stored('session', 'ks-booted'))
  const [sceneReady, setSceneReady] = useState(false)
  const showScene = !prefersReducedMotion()
  const active = useActiveSection(location.pathname)

  const markSceneReady = useCallback(() => setSceneReady(true), [])
  const finishBoot = useCallback(() => { setBooted(true); store('session', 'ks-booted', true) }, [])

  const go = useCallback((id: string) => {
    if (location.pathname === '/') scrollToId(id)
    else navigate('/', { state: { scrollTo: id } })
  }, [location.pathname, navigate])
  const goRef = useRef(go)
  goRef.current = go

  useEffect(() => { if (terminalOpen) unlock('terminal') }, [terminalOpen])

  useEffect(() => {
    console.log('%cKS.', 'font: 800 44px Manrope, sans-serif; color: #d5ff55')
    console.log('%cHey, curious developer. There are five secrets on this site — run ks.secret() for a free one.', 'font: 13px monospace; color: #9fb2ff')
    const target = window as unknown as { ks?: { secret: () => string } }
    target.ks = { secret: () => { confetti(); return unlock('console') ? 'Unlocked. Check the footer for hints on the rest.' : 'Already found this one — check the footer for hints.' } }
    return () => { delete target.ks }
  }, [])

  useEffect(() => {
    const original = document.title
    const onVisibility = () => { document.title = document.hidden ? 'Still there? The orb misses you — KS.' : original }
    document.addEventListener('visibilitychange', onVisibility)
    return () => { document.removeEventListener('visibilitychange', onVisibility); document.title = original }
  }, [])


  useEffect(() => {
    const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
    let position = 0
    let typed = ''
    const handler = (event: KeyboardEvent) => {
      const key = event.key
      if (!isTyping(event.target) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (key.toLowerCase() === 'k') setTerminalOpen(true)
        if (key.length === 1) typed = (typed + key.toLowerCase()).slice(-4)
        if (typed === 'hire') {
          typed = ''
          confetti()
          if (!unlock('hire')) toast('Great choice. Let’s talk.')
          window.setTimeout(() => goRef.current('connect'), 900)
        }
      }
      if (key === sequence[position]) {
        position += 1
        if (position === sequence.length) {
          confetti()
          warp()
          if (!unlock('konami')) toast('↑↑↓↓←→←→BA — a person of culture')
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
    {!booted && <Preloader ready={sceneReady || !showScene} onDone={finishBoot} />}
    <div className="aurora" aria-hidden="true" />
    {showScene && <SceneBoundary><Suspense fallback={null}><Scene3D onReady={markSceneReady} /></Suspense></SceneBoundary>}
    <div className="grain" aria-hidden="true" />
    <ScrollProgress />
    <CursorGlow />
    <ScrollToTop />
    <Nav active={active} onNavigate={go} />
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home booted={booted} onOpenTerminal={() => setTerminalOpen(true)} onNavigate={go} />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
      </Routes>
    </AnimatePresence>
    <TerminalOverlay open={terminalOpen} onClose={() => setTerminalOpen(false)} />
    <Confetti />
    <Toaster />
  </>
}
