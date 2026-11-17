import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from './effects'

const label = { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 1.5, fill: 'currentColor', stroke: 'none' } as const
const delay = (seconds: number) => ({ animationDelay: `${seconds}s` })

const NODES = [[60, 70], [150, 40], [250, 80], [340, 50], [100, 160], [200, 150], [310, 170], [150, 250], [270, 245]]
const EDGES = [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [4, 5], [5, 2], [5, 6], [2, 6], [3, 6], [4, 7], [5, 7], [5, 8], [6, 8], [7, 8]]
const ROUTES = [[0, 1, 5, 6, 8], [3, 2, 5, 4, 7], [7, 5, 2, 3]]

function Mesh() {
  const still = prefersReducedMotion()
  return <>
    {EDGES.map(([a, b]) => <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} opacity=".28" />)}
    {NODES.map(([x, y], i) => (
      <g key={i}>
        <circle className="art-pulse" cx={x} cy={y} r="13" style={delay(i * 0.31)} />
        <circle cx={x} cy={y} r="5" fill="currentColor" stroke="none" />
      </g>
    ))}
    {!still && ROUTES.map((route, i) => (
      <circle key={i} r="4" fill="#fff" stroke="none">
        <animateMotion dur={`${4 + i}s`} begin={`${i * 1.2}s`} repeatCount="indefinite" path={`M${route.map(n => NODES[n].join(' ')).join(' L')}`} />
      </circle>
    ))}
  </>
}

function Vault() {
  return <>
    <g className="art-spin">
      <circle cx="200" cy="150" r="120" strokeDasharray="3 10" opacity=".5" />
      <circle cx="320" cy="150" r="5" fill="currentColor" stroke="none" />
    </g>
    <g className="art-spin reverse">
      <circle cx="200" cy="150" r="96" strokeDasharray="22 12" opacity=".32" />
      <circle cx="200" cy="54" r="4" fill="currentColor" stroke="none" />
    </g>
    <path d="M200 84l58 22v44c0 40-25 66-58 80-33-14-58-40-58-80v-44z" fill="currentColor" fillOpacity=".1" strokeWidth="2" />
    <rect x="182" y="150" width="36" height="28" rx="5" fill="currentColor" fillOpacity=".28" />
    <path d="M189 150v-10a11 11 0 0 1 22 0v10" strokeWidth="2" />
    <circle cx="200" cy="164" r="3" fill="currentColor" stroke="none" />
    <g>
      <rect x="18" y="24" width="112" height="34" rx="9" fill="currentColor" fillOpacity=".08" />
      <text x="30" y="39" {...label}>ACCESS · 24H</text>
      <rect className="art-shrink" x="30" y="46" width="88" height="3" rx="1.5" fill="currentColor" stroke="none" />
    </g>
    <g className="art-blink">
      <rect x="282" y="244" width="100" height="30" rx="9" fill="currentColor" fillOpacity=".08" />
      <text x="296" y="263" {...label}>REVOCABLE</text>
    </g>
  </>
}

const CODE_LINES = [[58, 120], [74, 170], [74, 90], [90, 150], [74, 60], [58, 130], [58, 100]]

function Clash() {
  return <>
    <rect x="40" y="36" width="232" height="228" rx="12" fill="currentColor" fillOpacity=".06" />
    {[58, 72, 86].map(x => <circle key={x} cx={x} cy="55" r="3" fill="currentColor" stroke="none" opacity=".5" />)}
    <rect x="112" y="52" width="142" height="6" rx="3" fill="currentColor" stroke="none" opacity=".16" />
    <rect className="art-timer" x="112" y="52" width="142" height="6" rx="3" fill="currentColor" stroke="none" />
    {CODE_LINES.map(([x, width], i) => (
      <rect key={i} className="art-type" x={x} y={86 + i * 23} width={width} height="8" rx="4" fill="currentColor" stroke="none" opacity={i % 3 === 1 ? 0.75 : 0.35} style={delay(i * 0.32)} />
    ))}
    {[[294, 150], [323, 108], [352, 72]].map(([x, height], i) => (
      <g key={x}>
        <rect className="art-rise" x={x} y={264 - height} width="22" height={height} rx="6" fill="currentColor" fillOpacity={0.5 - i * 0.14} stroke="none" style={delay(0.4 + i * 0.25)} />
        <text x={x + 8} y={254 - height} {...label}>{i + 1}</text>
      </g>
    ))}
  </>
}

function Invoice() {
  return <>
    <rect x="52" y="34" width="150" height="232" rx="10" fill="currentColor" fillOpacity=".06" />
    <rect x="70" y="54" width="70" height="8" rx="4" fill="currentColor" stroke="none" opacity=".6" />
    {[110, 90, 114, 70, 100, 84, 110].map((width, i) => <rect key={i} x="70" y={84 + i * 20} width={width} height="6" rx="3" fill="currentColor" stroke="none" opacity=".24" />)}
    <rect x="70" y="228" width="114" height="20" rx="5" opacity=".6" />
    <g className="art-scan">
      <rect x="46" y="34" width="162" height="26" fill="currentColor" stroke="none" opacity=".12" />
      <rect x="46" y="58" width="162" height="2.5" fill="#fff" stroke="none" />
    </g>
    <path className="art-dash" d="M212 150h36" strokeWidth="2" strokeDasharray="4 6" />
    {['GSTIN', 'HSN', 'TAX', 'B2B'].map((name, i) => (
      <g key={name} className="art-pop" style={delay(i * 0.45)}>
        <rect x="258" y={52 + i * 44} width="120" height="32" rx="9" fill="currentColor" fillOpacity=".09" />
        <text x="270" y={72 + i * 44} {...label}>{name}</text>
        <rect x="316" y={65 + i * 44} width={[48, 30, 40, 22][i]} height="6" rx="3" fill="currentColor" stroke="none" opacity=".55" />
      </g>
    ))}
    <text x="258" y="252" {...label}>→ GSTR-1.CSV</text>
  </>
}

const wave = (y: number) => `M-200 ${y}q25-14 50 0${'t50 0'.repeat(15)}`

function Ocean() {
  return <>
    {[60, 120, 180].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} strokeDasharray="2 12" opacity=".14" />)}
    {[100, 200, 300].map(x => <line key={x} x1={x} y1="0" x2={x} y2="300" strokeDasharray="2 12" opacity=".14" />)}
    {[0, 1.2, 2.4].map(start => <circle key={start} className="art-sonar" cx="118" cy="126" r="78" style={delay(start)} />)}
    <circle cx="118" cy="126" r="5" fill="currentColor" stroke="none" />
    <path className="art-dash" d="M118 126Q200 70 286 138" strokeDasharray="4 6" opacity=".7" />
    <g className="art-bob">
      <path d="M264 150h44l-8 12h-28z" fill="currentColor" fillOpacity=".4" />
      <path d="M286 150v-32" />
      <path d="M286 120v24h18z" fill="currentColor" fillOpacity=".22" />
    </g>
    <rect x="254" y="40" width="124" height="30" rx="15" fill="currentColor" fillOpacity=".1" />
    <circle className="art-blink" cx="271" cy="55" r="4" fill="#7dffb2" stroke="none" />
    <text x="283" y="59" {...label}>SAFE TO SAIL</text>
    {[206, 232, 258].map((y, i) => <path key={y} className="art-wave" d={wave(y)} opacity={0.6 - i * 0.16} strokeWidth="2" style={{ animationDuration: `${5 + i * 1.6}s` }} />)}
  </>
}

const ART: Record<string, () => JSX.Element> = {
  meshline: Mesh,
  medvault: Vault,
  codeclash: Clash,
  'gst-filing-agent': Invoice,
  orca: Ocean
}

export default function ProjectArt({ slug }: { slug: string }) {
  const Art = ART[slug] ?? Mesh
  const svg = useRef<SVGSVGElement>(null)

  // Only animate while on screen: five looping SVGs off-screen would repaint for nothing.
  useEffect(() => {
    const node = svg.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      node.classList.toggle('is-live', entry.isIntersecting)
      if (entry.isIntersecting) node.unpauseAnimations()
      else node.pauseAnimations()
    }, { rootMargin: '80px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <svg ref={svg} className="project-art" viewBox="0 0 400 300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <Art />
    </svg>
  )
}
