import { useEffect, useRef, useState } from 'react'
import { projects, skills } from './data'
import { SECRETS, SECRET_IDS, confetti, readSecrets, warp } from './effects'

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
    'warp — engage the warp drive',
    'party — you know what this does',
    'secrets — how many have you found?',
    'clear — clear the terminal'
  ],
  whoami: () => ['Karthik Sriram', 'Full Stack Developer', 'Computer Science Student', 'Hackathon Enthusiast'],
  skills: () => Object.entries(skills).map(([group, list]) => `${group}: ${list.join(', ')}`),
  warp: () => { warp(); return ['Warp drive engaged. Look behind this window.'] },
  party: () => { confetti(); return ['Confetti deployed.'] },
  secrets: () => {
    const found = readSecrets()
    return [`${found.length}/${SECRET_IDS.length} found`, ...SECRET_IDS.map(id => (found.includes(id) ? `  ✓ ${SECRETS[id].name}` : '  · ???'))]
  },
  projects: () => projects.map(p => `${p.name} — ${p.type}`),
  github: () => ['https://github.com/Karthik-Sriram-11'],
  linkedin: () => ['https://linkedin.com/in/karthiksriram11'],
  resume: () => ['Resume available at /resume.pdf'],
  contact: () => ['karthiksriram.dev@gmail.com'],
  experience: () => ['Software Engineering Intern — RHYM Technologies LLP (Jul–Aug 2026)', 'Built the CAP cybersecurity compliance platform with React, Node, MongoDB, AWS', 'Coordinator – Accounting & Assets', 'Advanced Academic Centre (AAC), GRIET', 'Strategic finance and event coordination'],
  education: () => ['B.Tech CSE — 3rd Year', 'Passionate about software engineering and product design'],
  currently: () => ['Building MeshLine', 'Learning Docker', 'Exploring AWS', 'Looking for Full Stack Internship'],
  sudo: () => ['Permission denied: only an admin can run this command.'],
  coffee: () => ['☕ Coffee levels increased.', 'Coding speed +25%.'],
  matrix: () => ['Matrix mode engaged.'],
  music: () => ['Check out my Spotify playlist — https://open.spotify.com/playlist/your-playlist-link'],
  '404': () => ['404 — Not found.', 'Why did the developer go broke? Because he used up all his cache.'],
  hack: () => ['Top hackathons:', 'HACKWITHAI — Top 50', 'HACK WITH HYDERABAD — Top 1000']
}

export default function TerminalOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [history, setHistory] = useState<{ value: string; output: string[] }[]>([])
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState(-1)
  const [matrixMode, setMatrixMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalLogRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef(true)

  useEffect(() => {
    if (!open) return
    window.setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  useEffect(() => {
    if (!open || !autoScrollRef.current) return
    terminalLogRef.current?.scrollTo({ top: terminalLogRef.current.scrollHeight, behavior: 'smooth' })
  }, [history, open])

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
      confetti()
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
  return <div className="terminal-overlay" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Developer terminal">
    <div className="terminal-window">
      <div className="terminal-header"><div className="terminal-circles"><span/><span/><span/></div><button className="terminal-close" onClick={onClose} aria-label="Close terminal">⨯</button></div>
      <div className="terminal-body">
        {matrixMode && <div className="matrix-mask" aria-hidden="true" />}
        <div className="terminal-log" ref={terminalLogRef} onScroll={() => {
          if (!terminalLogRef.current) return
          const { scrollTop, scrollHeight, clientHeight } = terminalLogRef.current
          const atBottom = scrollHeight - scrollTop - clientHeight < 40
          autoScrollRef.current = atBottom
        }}>
          <div className="terminal-welcome">Welcome to the hidden terminal. Type <span>help</span> to get started.</div>
          {history.map((entry, index) => <div key={`${entry.value}-${index}`} className="terminal-entry"><div className="terminal-command">&gt; {entry.value}</div>{entry.output.map((line, lineIndex) => <div key={lineIndex} className="terminal-response">{line}</div>)}</div>)}
        </div>
        <div className="terminal-input-row"><span className="terminal-prompt">&gt;</span><input ref={inputRef} autoComplete="off" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Enter a command…" aria-label="Terminal command input" /></div>
      </div>
    </div>
  </div>
}
