import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect, useRef, useState } from 'react'
import { patient, metrics, insights, flag } from '../data.js'
import BloodDrop, { MiniDrop } from './BloodDrop.jsx'

// ── helpers ─────────────────────────────────────────────────────────────
const statusColor = (s) => ({
  optimal:    'text-emerald',
  borderline: 'text-amber',
  attention:  'text-crimson'
}[s])
const statusDot = (s) => ({
  optimal:    'bg-emerald',
  borderline: 'bg-amber',
  attention:  'bg-crimson'
}[s])
const statusLabel = (s) => ({
  optimal:    'Innenfor',
  borderline: 'Grenseverdi',
  attention:  'Bør følges'
}[s])

function Reveal({ children, delay = 0, y = 24, className = '' }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15, rootMargin: '0px 0px -80px 0px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ idx, label, kicker }) {
  return (
    <div className="flex items-end justify-between mb-10 md:mb-14">
      <div className="flex items-baseline gap-5">
        <span className="mono text-[0.7rem] tracking-[0.3em] uppercase text-ink/45">{idx}</span>
        <h2 className="serif text-[2.2rem] md:text-[3rem] leading-none tracking-tightest">
          {label}
        </h2>
      </div>
      {kicker && (
        <div className="hidden md:block mono text-[0.65rem] tracking-[0.25em] uppercase text-ink/45 max-w-[20ch] text-right leading-relaxed">
          {kicker}
        </div>
      )}
    </div>
  )
}

// Numeric counter that animates from 0 → target when in view.
function CountUp({ to, decimals = 0, duration = 1.6, className = '' }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf, start
    const step = (t) => {
      if (!start) start = t
      const p = Math.min(1, (t - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(to * eased)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return <span ref={ref} className={className}>{val.toFixed(decimals)}</span>
}

// ── Header (sticky) ─────────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'bg-paper/85 backdrop-blur-md border-b hairline' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <MiniDrop size={14} />
          <span className="mono text-[0.7rem] tracking-[0.3em] uppercase">Blod</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 mono text-[0.65rem] tracking-[0.25em] uppercase text-ink/60">
          <a href="#oversikt" className="hover:text-ink">Oversikt</a>
          <a href="#nokkeltall" className="hover:text-ink">Nøkkeltall</a>
          <a href="#detaljer" className="hover:text-ink">Detaljer</a>
          <a href="#trender" className="hover:text-ink">Trender</a>
          <a href="#raad" className="hover:text-ink">Råd</a>
        </nav>
        <button className="mono text-[0.65rem] tracking-[0.25em] uppercase text-ink/60 hover:text-crimson">
          {patient.name.split(' ')[0]} ·  Logg ut
        </button>
      </div>
    </header>
  )
}

// ── Hero ────────────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160])
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.92])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const hbLow = metrics.hemoglobin.value < metrics.hemoglobin.low

  return (
    <section id="oversikt" ref={ref} className="relative min-h-[100svh] flex flex-col justify-center pt-28 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
      {/* Kicker line */}
      <Reveal delay={0.1}>
        <div className="flex items-center gap-3 mb-8">
          <span className="mono text-[0.65rem] tracking-[0.3em] uppercase text-ink/50">Prøve tatt</span>
          <span className="mono text-[0.7rem] tracking-[0.15em] text-ink/80">18.05.2026 — 09:14</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
          <span className="mono text-[0.7rem] tracking-[0.15em] text-emerald">Frigitt</span>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 items-center">
        {/* Left: title + name */}
        <div className="md:col-span-7">
          <Reveal delay={0.2}>
            <p className="serif text-[2rem] md:text-[2.6rem] leading-[1.05] tracking-tightest text-ink/75 max-w-[18ch]">
              God morgen,
            </p>
            <h1 className="serif text-[3.4rem] md:text-[5.6rem] leading-[0.95] tracking-tightest text-ink">
              {patient.name.split(' ')[0]}.
            </h1>
          </Reveal>
          <Reveal delay={0.5}>
            <p className="mt-6 max-w-[42ch] text-ink/70 leading-relaxed text-[1.05rem]">
              Det meste ser bra ut. Vi har funnet <span className="text-crimson font-medium">tre verdier</span> som er
              verdt å se nærmere på — bla nedover for en gjennomgang.
            </p>
          </Reveal>
          <Reveal delay={0.7}>
            <div className="mt-10 flex flex-wrap gap-3">
              <FlagPill status="attention" label="CRP forhøyet" />
              <FlagPill status="attention" label="Ferritin lav" />
              <FlagPill status="borderline" label="Vitamin D lav" />
              <FlagPill status="optimal" label="14 markører optimale" />
            </div>
          </Reveal>
        </div>

        {/* Right: filling blood drop */}
        <div className="md:col-span-5 flex justify-center md:justify-end relative">
          <motion.div style={{ y, scale, opacity }} className="relative">
            <BloodDrop
              fill={patient.overallScore}
              size={340}
              hbLow={hbLow}
              label={<><CountUp to={patient.overallScore} /></>}
              sublabel="Helseindeks"
            />
            {hbLow && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 mono text-[0.6rem] tracking-[0.25em] uppercase text-ink/55 whitespace-nowrap">
                Lavere fyllgrad — HB under referanse
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }}
      >
        <span className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ink/40">Bla</span>
        <motion.div
          className="w-px h-10 bg-ink/30"
          animate={{ scaleY: [0.3, 1, 0.3], originY: 0 }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
      </motion.div>
    </section>
  )
}

function FlagPill({ status, label }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border hairline">
      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(status)} ${status === 'attention' ? 'pulse-alert' : ''}`} />
      <span className="mono text-[0.7rem] tracking-[0.15em] uppercase text-ink/80">{label}</span>
    </div>
  )
}

// ── Glass card wrapper ─────────────────────────────────────────────────
function Card({ children, className = '', highlight = false }) {
  return (
    <div className={`relative rounded-2xl bg-white/70 backdrop-blur-sm border hairline p-6 md:p-7 ${highlight ? 'ring-1 ring-crimson/20' : ''} ${className}`}
         style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 24px 50px -30px rgba(26,26,46,0.12)' }}>
      {children}
    </div>
  )
}

function MetricHeader({ m }) {
  const status = flag(m.value, m.low, m.high)
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <div className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ink/50">{m.short}</div>
        <div className="text-ink/90 mt-1 text-[0.95rem] font-medium">{m.name}</div>
      </div>
      <div className={`flex items-center gap-1.5 ${statusColor(status)}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusDot(status)}`} />
        <span className="mono text-[0.6rem] tracking-[0.2em] uppercase">{statusLabel(status)}</span>
      </div>
    </div>
  )
}

// Big number readout
function BigValue({ value, unit, decimals = 1, status }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`num text-[3.2rem] leading-none ${status === 'attention' ? 'text-crimson' : 'text-ink'}`}>
        <CountUp to={value} decimals={decimals} />
      </span>
      <span className="mono text-[0.7rem] text-ink/55 tracking-wider">{unit}</span>
    </div>
  )
}

// ── Animated gauge (arc) ────────────────────────────────────────────────
function GaugeArc({ m }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 })
  const status = flag(m.value, m.low, m.high)
  // Map value within [low*0.6, high*1.3] window to [0..1]
  const lo = m.low * 0.7
  const hi = m.high * 1.15
  const pct = Math.max(0, Math.min(1, (m.value - lo) / (hi - lo)))
  // Arc 180° from left to right
  const R = 70, C = Math.PI * R
  const arcLen = pct * C

  // Reference band positions
  const lowPct  = Math.max(0, Math.min(1, (m.low - lo) / (hi - lo)))
  const highPct = Math.max(0, Math.min(1, (m.high - lo) / (hi - lo)))

  const isAttn = status === 'attention'

  return (
    <div ref={ref} className="relative">
      <svg viewBox="0 0 200 110" className="w-full">
        {/* track */}
        <path d="M 20 100 A 70 70 0 0 1 180 100" stroke="#1A1A2E" strokeOpacity="0.08" strokeWidth="2" fill="none" />
        {/* reference band */}
        <path
          d={`M ${20 + lowPct * 160} 100 A 70 70 0 0 1 ${20 + highPct * 160} 100`}
          stroke="#1F7A5A" strokeOpacity="0.18" strokeWidth="10" fill="none" strokeLinecap="round"
        />
        {/* value arc */}
        <motion.path
          d="M 20 100 A 70 70 0 0 1 180 100"
          stroke={isAttn ? '#C41E3A' : '#1A1A2E'} strokeWidth="3" fill="none" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
          animate={inView ? { strokeDashoffset: C - arcLen } : {}}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />
        {/* needle dot */}
        <motion.circle
          cx={20 + pct * 160}
          cy={100 - Math.sin(pct * Math.PI) * 70 + (1 - Math.sin(pct*Math.PI)) * 0}
          r="5"
          fill={isAttn ? '#C41E3A' : '#1A1A2E'}
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: 1.4, type: 'spring', stiffness: 180 }}
        />
      </svg>
      <div className="flex items-baseline justify-between mt-2">
        <BigValue value={m.value} unit={m.unit} decimals={m.value < 100 ? 1 : 0} status={status} />
        <span className="mono text-[0.62rem] text-ink/45 tracking-wider">
          {m.low}–{m.high}
        </span>
      </div>
    </div>
  )
}

// ── Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, width = 280, height = 70, status = 'optimal' }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 })
  const min = Math.min(...data), max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 10) + 5
    const y = height - ((v - min) / span) * (height - 20) - 10
    return [x, y]
  })
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${d} L ${pts.at(-1)[0]} ${height} L ${pts[0][0]} ${height} Z`
  const color = status === 'attention' ? '#C41E3A' : '#1A1A2E'

  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id={`spark-${status}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={area} fill={`url(#spark-${status})`}
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 1, delay: 0.8 }} />
      <motion.path
        d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {pts.map((p, i) => (
        <motion.circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3 : 1.6}
          fill={color}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.4 + i * 0.05, duration: 0.4 }}
        />
      ))}
    </svg>
  )
}

// ── Key Metrics section ─────────────────────────────────────────────────
function KeyMetrics() {
  const items = [metrics.hemoglobin, metrics.leukocytes, metrics.platelets, metrics.glucose]
  return (
    <section id="nokkeltall" className="px-6 md:px-10 max-w-7xl mx-auto py-24 md:py-32">
      <Reveal>
        <SectionLabel idx="01" label={<>Nøkkel<span className="italic text-crimson">tall</span></>}
          kicker="De fire markørene som forteller mest om dagens helse." />
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((m, i) => {
          const status = flag(m.value, m.low, m.high)
          const fromLeft = i % 2 === 0
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: fromLeft ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            >
              <Card highlight={status === 'attention'}>
                <MetricHeader m={m} />
                {m.id === 'glu' ? (
                  <>
                    <BigValue value={m.value} unit={m.unit} decimals={1} status={status} />
                    <div className="mt-4">
                      <Sparkline data={m.history} status={status} />
                    </div>
                    <div className="mt-1 flex items-center justify-between mono text-[0.6rem] tracking-wider text-ink/45">
                      <span>6 målinger</span>
                      <span>{m.low}–{m.high} {m.unit}</span>
                    </div>
                  </>
                ) : (
                  <GaugeArc m={m} />
                )}
                {m.note && (
                  <p className={`mt-4 text-[0.85rem] leading-relaxed ${statusColor(status)} ${status==='attention' ? 'shine rounded-md px-2 py-1 -mx-2' : ''}`}>
                    {m.note}
                  </p>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

// ── Cholesterol ─────────────────────────────────────────────────────────
function Cholesterol() {
  const items = [metrics.cholTotal, metrics.cholHDL, metrics.cholLDL]
  return (
    <section className="px-6 md:px-10 max-w-7xl mx-auto py-20 md:py-28">
      <Reveal>
        <SectionLabel idx="02" label={<>Kolesterol</>}
          kicker="HDL er det «gode», LDL det «mindre gode»." />
      </Reveal>
      <Reveal delay={0.2}>
        <Card>
          <div className="space-y-7">
            {items.map((m, i) => {
              const status = flag(m.value, m.low, m.high)
              const maxScale = 6.5
              const pct = Math.min(1, m.value / maxScale)
              const refStart = (m.low / maxScale) * 100
              const refEnd   = (m.high / maxScale) * 100
              return (
                <div key={m.id}>
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="flex items-baseline gap-3">
                      <span className="mono text-[0.65rem] tracking-[0.25em] uppercase text-ink/55">{m.short}</span>
                      <span className="text-ink/85 text-[0.95rem]">{m.name}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`num text-2xl ${status==='attention' ? 'text-crimson' : 'text-ink'}`}>
                        <CountUp to={m.value} decimals={1} />
                      </span>
                      <span className="mono text-[0.6rem] text-ink/45">{m.unit}</span>
                    </div>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-ink/[0.06] overflow-hidden">
                    {/* Reference band */}
                    <div className="absolute inset-y-0 bg-emerald/15"
                      style={{ left: `${refStart}%`, width: `${refEnd - refStart}%` }} />
                    {/* Bar */}
                    <motion.div
                      className={`absolute inset-y-0 left-0 ${status==='attention' ? 'bg-crimson' : status==='borderline' ? 'bg-amber' : 'bg-ink'}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct * 100}%` }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.1 }}
                      style={{ borderRadius: 999 }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between mono text-[0.6rem] tracking-wider text-ink/40">
                    <span>0</span>
                    <span>Anbefalt {m.low}–{m.high}</span>
                    <span>{maxScale}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </Reveal>
    </section>
  )
}

// ── Detailed Breakdown ──────────────────────────────────────────────────
function ComparativeBars({ items }) {
  return (
    <div className="space-y-4">
      {items.map((m, i) => {
        const status = flag(m.value, m.low, m.high)
        const pct = Math.min(1, m.value / (m.high * 1.2))
        return (
          <div key={m.id}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="mono text-[0.65rem] tracking-[0.2em] uppercase text-ink/60">{m.short}</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`num text-xl ${status==='attention'?'text-crimson':''}`}>
                  <CountUp to={m.value} decimals={m.value < 10 ? 1 : 0} />
                </span>
                <span className="mono text-[0.55rem] text-ink/45">{m.unit}</span>
              </div>
            </div>
            <div className="relative h-1.5 rounded-full bg-ink/[0.07] overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 ${status==='attention'?'bg-crimson':'bg-ink/70'}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct*100}%` }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.2, delay: 0.1 + i*0.08, ease:[0.22,1,0.36,1] }}
              />
            </div>
            <div className="mt-1 mono text-[0.58rem] text-ink/40 tracking-wider">
              Referanse {m.low}–{m.high}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Donut({ m, size = 130 }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 })
  const status = flag(m.value, m.low, m.high)
  const lo = m.low * 0.6, hi = m.high * 1.1
  const pct = Math.max(0, Math.min(1, (m.value - lo) / (hi - lo)))
  const R = 56, C = 2 * Math.PI * R
  const lowPct = Math.max(0, Math.min(1, (m.low - lo) / (hi - lo)))
  const highPct = Math.max(0, Math.min(1, (m.high - lo) / (hi - lo)))
  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 140 140" className="-rotate-90">
          <circle cx="70" cy="70" r={R} stroke="#1A1A2E" strokeOpacity="0.08" strokeWidth="6" fill="none" />
          <circle cx="70" cy="70" r={R}
            stroke="#1F7A5A" strokeOpacity="0.18" strokeWidth="10" fill="none"
            strokeDasharray={`${(highPct-lowPct)*C} ${C}`}
            strokeDashoffset={-lowPct * C}
          />
          <motion.circle cx="70" cy="70" r={R}
            stroke={status==='attention' ? '#C41E3A' : '#1A1A2E'} strokeWidth="6" fill="none" strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={inView ? { strokeDashoffset: C - pct * C } : {}}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`num text-3xl leading-none ${status==='attention'?'text-crimson':''}`}>
            <CountUp to={m.value} decimals={m.value < 10 ? 1 : 0} />
          </span>
          <span className="mono text-[0.55rem] text-ink/50 tracking-wider mt-1">{m.unit}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="mono text-[0.6rem] tracking-[0.25em] uppercase text-ink/55">{m.short}</div>
        <div className="mono text-[0.58rem] text-ink/40 tracking-wider mt-0.5">{m.low}–{m.high}</div>
      </div>
    </div>
  )
}

function StatusRange({ m }) {
  const status = flag(m.value, m.low, m.high)
  const lo = m.low * 0.85, hi = m.high * 1.05
  const pct = Math.max(0, Math.min(1, (m.value - lo) / (hi - lo)))
  const lowPct = (m.low - lo) / (hi - lo), highPct = (m.high - lo) / (hi - lo)
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="mono text-[0.6rem] tracking-[0.25em] uppercase text-ink/55">{m.short}</div>
          <div className="text-ink/85 text-[0.85rem] mt-0.5">{m.name}</div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`num text-2xl ${status==='attention'?'text-crimson':''}`}>
            <CountUp to={m.value} decimals={1} />
          </span>
          <span className="mono text-[0.55rem] text-ink/45">{m.unit}</span>
        </div>
      </div>
      <div className="relative h-7">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-ink/15" />
        <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-emerald/20 rounded-full"
          style={{ left: `${lowPct*100}%`, width: `${(highPct-lowPct)*100}%` }} />
        <motion.div
          initial={{ left: 0, opacity: 0 }}
          whileInView={{ left: `${pct*100}%`, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        >
          <div className={`w-3 h-3 rounded-full ${status==='attention'?'bg-crimson':'bg-ink'} ring-4 ring-paper`} />
        </motion.div>
      </div>
      <div className="flex justify-between mono text-[0.55rem] text-ink/40 mt-1">
        <span>{m.low}</span><span>{m.high}</span>
      </div>
    </div>
  )
}

function ProgressBar({ m }) {
  const status = flag(m.value, m.low, m.high)
  const pct = Math.min(1, m.value / m.high)
  const lowPct = m.low / m.high
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div>
          <span className="mono text-[0.6rem] tracking-[0.25em] uppercase text-ink/55 mr-2">{m.short}</span>
          <span className="text-ink/80 text-[0.85rem]">{m.name}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`num text-xl ${status==='attention'?'text-crimson':''}`}>
            <CountUp to={m.value} decimals={m.value < 10 ? 1 : 0} />
          </span>
          <span className="mono text-[0.55rem] text-ink/45">{m.unit}</span>
        </div>
      </div>
      <div className="relative h-2 rounded-full bg-ink/[0.06] overflow-hidden">
        <div className="absolute inset-y-0 bg-emerald/20"
          style={{ left: `${lowPct*100}%`, right: 0 }} />
        <motion.div
          className={`absolute inset-y-0 left-0 ${status==='attention'?'bg-crimson':status==='borderline'?'bg-amber':'bg-ink/80'}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct*100}%` }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.4, ease:[0.22,1,0.36,1] }}
        />
      </div>
      {m.note && <p className={`mt-2 text-[0.78rem] ${statusColor(status)}`}>{m.note}</p>}
    </div>
  )
}

function RadialGauge({ m, size = 150 }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 })
  const status = flag(m.value, m.low, m.high)
  const pct = Math.max(0, Math.min(1, m.value / m.high))
  const R = 58, C = 2 * Math.PI * R * 0.75  // 270° arc
  const lowPct = m.low / m.high
  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} viewBox="0 0 150 150" style={{ transform: 'rotate(135deg)' }}>
          <circle cx="75" cy="75" r={R} stroke="#1A1A2E" strokeOpacity="0.08" strokeWidth="5" fill="none"
            strokeDasharray={`${C} ${2*Math.PI*R}`} strokeLinecap="round" />
          <circle cx="75" cy="75" r={R} stroke="#1F7A5A" strokeOpacity="0.18" strokeWidth="9" fill="none"
            strokeDasharray={`${(1-lowPct)*C} ${2*Math.PI*R}`}
            strokeDashoffset={-lowPct*C}
            strokeLinecap="round"
          />
          <motion.circle cx="75" cy="75" r={R}
            stroke={status==='attention' ? '#C41E3A' : '#1A1A2E'} strokeWidth="5" fill="none" strokeLinecap="round"
            strokeDasharray={`${C} ${2*Math.PI*R}`}
            initial={{ strokeDashoffset: C }}
            animate={inView ? { strokeDashoffset: C - pct * C } : {}}
            transition={{ duration: 1.6, ease:[0.22,1,0.36,1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`num text-3xl leading-none ${status==='attention'?'text-crimson':status==='borderline'?'text-amber':''}`}>
            <CountUp to={m.value} decimals={m.value < 100 ? 0 : 0} />
          </span>
          <span className="mono text-[0.55rem] text-ink/45 tracking-wider mt-1">{m.unit}</span>
        </div>
      </div>
      <div className="text-center mt-2">
        <div className="mono text-[0.6rem] tracking-[0.25em] uppercase text-ink/60">{m.short}</div>
        <div className="text-ink/75 text-[0.78rem] mt-0.5">{m.name}</div>
      </div>
    </div>
  )
}

function CRPCard({ m }) {
  const status = flag(m.value, m.low, m.high)
  return (
    <Card highlight>
      <div className="flex items-start justify-between">
        <div>
          <div className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ink/55">{m.short}</div>
          <div className="text-ink/85 text-[0.95rem] mt-1">{m.name}</div>
        </div>
        <span className={`inline-block w-3 h-3 rounded-full ${statusDot(status)} pulse-alert`} />
      </div>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="num text-[4rem] leading-none text-crimson">
          <CountUp to={m.value} decimals={1} />
        </span>
        <span className="mono text-[0.7rem] text-ink/55 tracking-wider">{m.unit}</span>
      </div>
      <div className="mt-3">
        <Sparkline data={m.history} status="attention" />
      </div>
      <p className="mt-4 text-[0.85rem] text-crimson shine rounded-md px-2 py-1 -mx-2">
        {m.note}
      </p>
      <div className="mt-4 mono text-[0.6rem] text-ink/45 tracking-wider">Referanse {m.low}–{m.high} {m.unit}</div>
    </Card>
  )
}

function DetailedBreakdown() {
  return (
    <section id="detaljer" className="px-6 md:px-10 max-w-7xl mx-auto py-24 md:py-32 bg-gradient-to-b from-transparent via-bone/40 to-transparent -mx-6 md:-mx-10 rounded-3xl">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Reveal>
          <SectionLabel idx="02" label={<>Detaljert <span className="italic text-crimson">gjennomgang</span></>}
            kicker="Organsystemer i seks lag." />
        </Reveal>

        {/* Liver + Kidney */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Reveal>
            <Card>
              <div className="mb-5">
                <h3 className="serif text-2xl tracking-tight">Leverfunksjon</h3>
                <p className="mono text-[0.6rem] tracking-[0.25em] uppercase text-ink/45 mt-1">Sammenlignende</p>
              </div>
              <ComparativeBars items={[metrics.alat, metrics.asat, metrics.ggt]} />
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card>
              <div className="mb-5">
                <h3 className="serif text-2xl tracking-tight">Nyrefunksjon</h3>
                <p className="mono text-[0.6rem] tracking-[0.25em] uppercase text-ink/45 mt-1">Donut</p>
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <Donut m={metrics.kreatinin} />
                <Donut m={metrics.egfr} />
              </div>
            </Card>
          </Reveal>
        </div>

        {/* Thyroid */}
        <Reveal>
          <Card className="mb-6">
            <div className="mb-6">
              <h3 className="serif text-2xl tracking-tight">Skjoldbruskkjertel</h3>
              <p className="mono text-[0.6rem] tracking-[0.25em] uppercase text-ink/45 mt-1">Status mot referanseområde</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
              <StatusRange m={metrics.tsh} />
              <StatusRange m={metrics.t4} />
              <StatusRange m={metrics.t3} />
            </div>
          </Card>
        </Reveal>

        {/* Iron + Vitamins + CRP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Reveal>
            <Card>
              <div className="mb-5">
                <h3 className="serif text-2xl tracking-tight">Jernstatus</h3>
                <p className="mono text-[0.6rem] tracking-[0.25em] uppercase text-ink/45 mt-1">Progressbarer</p>
              </div>
              <div className="space-y-5">
                <ProgressBar m={metrics.ferritin} />
                <ProgressBar m={metrics.jern} />
                <ProgressBar m={metrics.transferrin} />
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card>
              <div className="mb-5">
                <h3 className="serif text-2xl tracking-tight">Vitaminer</h3>
                <p className="mono text-[0.6rem] tracking-[0.25em] uppercase text-ink/45 mt-1">Radialmåler</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <RadialGauge m={metrics.dvitamin} />
                <RadialGauge m={metrics.b12} />
                <RadialGauge m={metrics.folat} />
              </div>
              {metrics.dvitamin.note && (
                <p className="mt-4 text-[0.78rem] text-amber text-center">{metrics.dvitamin.note}</p>
              )}
            </Card>
          </Reveal>

          <Reveal delay={0.2}>
            <CRPCard m={metrics.crp} />
          </Reveal>
        </div>

        {/* SR small */}
        <Reveal delay={0.1}>
          <Card className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ink/55">{metrics.sr.short}</div>
                <h3 className="serif text-2xl tracking-tight mt-1">{metrics.sr.name}</h3>
                <p className="text-ink/55 text-[0.85rem] mt-2 max-w-[40ch]">
                  Senkningsreaksjon — supplerer CRP og fanger opp mer langvarig betennelse.
                </p>
              </div>
              <div className="flex-1">
                <StatusRange m={metrics.sr} />
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}

// ── Trends ──────────────────────────────────────────────────────────────
function TrendLine({ m, label }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })
  const data = m.history
  const W = 600, H = 160, padX = 20, padY = 20
  const min = Math.min(...data), max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * (W - padX * 2)
    const y = padY + (1 - (v - min) / span) * (H - padY * 2)
    return [x, y]
  })
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ')
  const status = flag(m.value, m.low, m.high)
  const color = status === 'attention' ? '#C41E3A' : '#1A1A2E'
  const prev = data[data.length - 2], cur = data[data.length - 1]
  const delta = cur - prev
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→'
  const deltaPct = ((delta / prev) * 100).toFixed(1)

  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="mono text-[0.6rem] tracking-[0.25em] uppercase text-ink/55 mr-3">{m.short}</span>
          <span className="text-ink/85 text-[0.95rem]">{m.name}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className={`num text-2xl ${status==='attention'?'text-crimson':''}`}>{cur}</span>
          <span className={`mono text-[0.7rem] tracking-wider ${delta > 0 ? 'text-crimson' : delta < 0 ? 'text-emerald' : 'text-ink/50'}`}>
            {arrow} {Math.abs(deltaPct)}%
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id={`trend-${m.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.5, 1].map(t => (
          <line key={t} x1={padX} x2={W - padX} y1={padY + t * (H - padY * 2)} y2={padY + t * (H - padY * 2)}
            stroke="#1A1A2E" strokeOpacity="0.06" strokeDasharray="2 4" />
        ))}
        {/* Reference band */}
        {(() => {
          const yLo = padY + (1 - (m.low - min) / span) * (H - padY * 2)
          const yHi = padY + (1 - (m.high - min) / span) * (H - padY * 2)
          const top = Math.min(yLo, yHi), height = Math.abs(yLo - yHi)
          return <rect x={padX} y={top} width={W - padX*2} height={height} fill="#1F7A5A" fillOpacity="0.08" />
        })()}
        {/* Area */}
        <motion.path
          d={`${d} L ${pts.at(-1)[0]} ${H - padY} L ${pts[0][0]} ${H - padY} Z`}
          fill={`url(#trend-${m.id})`}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
        />
        {/* Line */}
        <motion.path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Points */}
        {pts.map((p, i) => (
          <motion.g key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1.6 + i * 0.08, type: 'spring', stiffness: 220 }}
          >
            <circle cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 5 : 2.5}
              fill={i === pts.length - 1 ? color : '#FAF7F2'}
              stroke={color} strokeWidth={i === pts.length - 1 ? 0 : 1.5} />
          </motion.g>
        ))}
        {/* Labels under each point */}
        {pts.map((p, i) => (
          <text key={`t-${i}`} x={p[0]} y={H - 4} textAnchor="middle"
            className="mono"
            style={{ fontSize: 8.5, fill: '#1A1A2E', opacity: i === pts.length - 1 ? 0.85 : 0.4 }}>
            {label[i]}
          </text>
        ))}
      </svg>
    </div>
  )
}

function Trends() {
  const labels = ['Nov 23', 'Mai 24', 'Nov 24', 'Mai 25', 'Nov 25', 'Mai 26']
  const items = [metrics.hemoglobin, metrics.cholLDL, metrics.crp, metrics.ferritin]
  return (
    <section id="trender" className="px-6 md:px-10 max-w-7xl mx-auto py-24 md:py-32">
      <Reveal>
        <SectionLabel idx="03" label={<>Utvikling over <span className="italic text-crimson">tid</span></>}
          kicker="Seks målinger fordelt over to og et halvt år." />
      </Reveal>
      <Reveal delay={0.15}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
            {items.map(m => <TrendLine key={m.id} m={m} label={labels} />)}
          </div>
          <div className="mt-8 pt-6 border-t hairline flex items-center gap-6 mono text-[0.6rem] tracking-[0.2em] uppercase text-ink/55">
            <span className="flex items-center gap-2"><span className="inline-block w-3 h-px bg-ink/60" /> Verdi</span>
            <span className="flex items-center gap-2"><span className="inline-block w-3 h-2 bg-emerald/30" /> Referanseområde</span>
            <span className="flex items-center gap-2"><span>↑</span> Økning</span>
            <span className="flex items-center gap-2"><span>↓</span> Reduksjon</span>
          </div>
        </Card>
      </Reveal>
    </section>
  )
}

// ── Insights ────────────────────────────────────────────────────────────
function InsightIcon({ name }) {
  const common = "w-5 h-5"
  switch (name) {
    case 'flame':
      return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 3 c 2 4 5 6 5 10 a 5 5 0 0 1 -10 0 c 0 -3 2 -4 3 -7 c 1 2 2 2 2 -3 Z"/>
      </svg>
    case 'leaf':
      return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M20 4 c -10 0 -16 6 -16 14 c 8 0 16 -4 16 -14 Z M4 20 L 14 10"/>
      </svg>
    case 'sun':
      return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="4"/><path d="M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3 M5 5 l2 2 M17 17 l2 2 M5 19 l2 -2 M17 7 l2 -2"/>
      </svg>
    case 'heart':
      return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 20 s-7-4.5-7-10 a 4 4 0 0 1 7 -2.5 a 4 4 0 0 1 7 2.5 c 0 5.5 -7 10 -7 10 Z"/>
      </svg>
    default:
      return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 2 l2 7 7 1 -5 5 1 7 -5 -3 -5 3 1 -7 -5 -5 7 -1 z"/>
      </svg>
  }
}

function Insights() {
  return (
    <section id="raad" className="px-6 md:px-10 max-w-7xl mx-auto py-24 md:py-32">
      <Reveal>
        <SectionLabel idx="04" label={<>Innsikter & <span className="italic text-crimson">råd</span></>}
          kicker="Skreddersydd tolkning av tallene dine." />
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {insights.map((it, i) => {
          const wide = i === 0 || i === insights.length - 1
          const col = wide ? 'md:col-span-12' : 'md:col-span-6'
          return (
            <motion.div
              key={i}
              className={col}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card highlight={it.level === 'attention'}>
                <div className="flex items-start gap-5">
                  <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    it.level === 'attention' ? 'bg-crimson/10 text-crimson' :
                    it.level === 'borderline' ? 'bg-amber/15 text-amber' :
                    'bg-emerald/15 text-emerald'
                  }`}>
                    <InsightIcon name={it.icon} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(it.level)}`} />
                      <span className={`mono text-[0.6rem] tracking-[0.3em] uppercase ${statusColor(it.level)}`}>
                        {statusLabel(it.level)}
                      </span>
                    </div>
                    <h3 className="serif text-[1.6rem] md:text-[1.9rem] leading-tight tracking-tight mb-2">
                      {it.title}
                    </h3>
                    <p className="text-ink/70 leading-relaxed text-[0.95rem] max-w-[62ch]">
                      {it.body}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Footer-ish */}
      <Reveal delay={0.2}>
        <div className="mt-20 pt-10 border-t hairline grid grid-cols-1 md:grid-cols-3 gap-8 mono text-[0.65rem] tracking-[0.2em] uppercase text-ink/55">
          <div>
            <div className="text-ink/40 mb-1.5">Laboratorium</div>
            <div>{patient.lab}</div>
          </div>
          <div>
            <div className="text-ink/40 mb-1.5">Ordre-ID</div>
            <div>{patient.ordreId}</div>
          </div>
          <div>
            <div className="text-ink/40 mb-1.5">Rekvirent</div>
            <div>Fastlege  ·  Dr. Lien Karlsen</div>
          </div>
        </div>
        <div className="mt-12 mb-6 text-center">
          <div className="inline-flex items-center gap-2.5 mono text-[0.6rem] tracking-[0.3em] uppercase text-ink/40">
            <MiniDrop size={11} />
            <span>Blod  ·  2026</span>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

// ── Page composition ───────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <div className="relative">
      <Header />
      <Hero />
      <KeyMetrics />
      <Cholesterol />
      <DetailedBreakdown />
      <Trends />
      <Insights />
    </div>
  )
}
