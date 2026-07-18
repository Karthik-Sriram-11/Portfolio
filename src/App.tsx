import { useEffect, useRef, useState } from 'react'
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import Lenis from 'lenis'
import { ArrowDownRight, ArrowUpRight, Download, ExternalLink, Github, Linkedin, Mail, MapPin, Menu, MoveRight, Sparkles, X } from 'lucide-react'
import { projects, skills } from './data'

const reveal = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-70px' }, transition: { duration: .65 } }

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

function Home() {
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
    <Hero />
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

function Hero() { const { scrollYProgress } = useScroll(); const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 20 }); return <header id="home" className="hero"><motion.div className="scroll-progress" style={{scaleX}}/><div className="aurora"></div><div className="grid-bg"></div><div className="hero-inner"><motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.8}}>KARTHIKEYA<br/><span>SRIRAM</span></motion.h1><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.25,duration:.8}} className="hero-bottom"><div><p>Full Stack Developer • Problem Solver. Building scalable software and AI-powered experiences with clean UI and thoughtful engineering.</p><div className="hero-actions"><a href="#craft" className="button primary">View Craft <ArrowDownRight/></a><a href="#connect" className="button">Get in Touch</a><a href="/Karthik-Sriram-Resume.pdf" target="_blank" rel="noreferrer" className="text-link">Resume <ExternalLink/></a></div></div><aside className="status-card"><div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}><img src="/profile.jpeg" alt="Karthikeya Sriram" style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(132, 157, 181, 0.3)' }} /><div><span><i/> LIVE STATUS</span><h4 style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#dedee4', fontWeight: 600 }}>Karthik Sriram</h4></div></div><p>Location <b>Hyderabad, IN</b></p><p>Local <LiveTime/></p><p>Status <b>B.Tech CSE • Year 3</b></p><p>Open for <strong>Internships</strong></p></aside></motion.div><div className="hero-meta"><span>SCROLL ↓</span><span>2026 / PORTFOLIO</span></div></div></header> }

function CaseStudy() { const { slug } = useParams(); const p = projects.find(x=>x.slug===slug) || projects[0]; return <main className="case"><Link to="/" className="back">← Back to home</Link><div className={`case-hero project-${p.color}`}><p>{p.type} / {p.year}</p><h1>{p.name}</h1><p>{p.description}</p></div><section><div className="eyebrow accent">THE BUILD</div><h2>How it<br/><i>comes together.</i></h2><p className="lead">{p.challenge}</p><div className="case-grid"><article><b>01</b><h3>Architecture</h3><p>{p.architecture}</p></article><article><b>02</b><h3>Solution</h3><p>{p.solution}</p></article><article><b>03</b><h3>Future improvements</h3><p>{p.next}</p></article></div><a className="button primary" href={p.github} target="_blank" rel="noreferrer">View on GitHub <Github/></a></section></main> }

export default function App() { return <><ScrollToTop/><Nav/><Routes><Route path="/" element={<Home/>}/><Route path="/work/:slug" element={<CaseStudy/>}/></Routes></> }
