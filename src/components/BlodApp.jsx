import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect, useRef, useState } from 'react'
import BloodDrop, { MiniDrop } from './BloodDrop.jsx'

// ─── Data (simulert, frisk norsk voksen 32 år) ──────────────────────────
const user = {
  name: 'Aksel',
  blodId: '2849',
  actualAge: 35,
  biologicalAge: 32,
  healthScore: 78,
  testDate: '18. mai 2026'
}

// HealthBar metric shape:
// value, unit, low/high = optimal range, displayMin/Max = bar window,
// athlete = where an elite athlete typically sits, comment, leftLabel/rightLabel
// inverse=true means lower is better (e.g. CRP) — bar visually shifts optimal zone left.
const M = {
  hemoglobin:  { name: 'Hemoglobin',      subtitle: 'Oksygenbærer',         value: 15.1, unit: 'g/dL',     low: 13.5, high: 17.5, displayMin: 11, displayMax: 19, athlete: 16.2, comment: 'Perfekt for utholdenhet.' },
  leukocytes:  { name: 'Hvite blodceller', subtitle: 'Infeksjonsforsvar',   value: 7.8,  unit: '10⁹/L',    low: 3.5,  high: 10.0, displayMin: 2,  displayMax: 12, athlete: 6.2, comment: 'Litt forhøyet — typisk etter trening.' },
  platelets:   { name: 'Blodplater',      subtitle: 'Sårheling',           value: 320,  unit: '10⁹/L',    low: 145,  high: 390,  displayMin: 100,displayMax: 450,athlete: 280, comment: 'God koaguleringsevne.' },
  vitaminD:    { name: 'Vitamin D',       subtitle: 'Solenergi',           value: 64,   unit: 'nmol/L',   low: 50,   high: 150,  displayMin: 20, displayMax: 180,athlete: 95,  comment: '20 min sol gir deg et løft.' },
  glucose:     { name: 'Blodsukker',      subtitle: 'Drivstoffmåler',      value: 5.0,  unit: 'mmol/L',   low: 4.0,  high: 6.0,  displayMin: 3,  displayMax: 7,  athlete: 4.9, comment: 'Stabilt blodsukker = jevn energi.' },
  cholesterol: { name: 'Kolesterolbalanse',subtitle: 'Hjertevennlig',      value: 4.8,  unit: 'mmol/L',   low: 3.0,  high: 5.0,  displayMin: 2,  displayMax: 7,  athlete: 4.2, comment: 'Nærmer seg øvre grense.' },
  egfr:        { name: 'Nyrer (eGFR)',    subtitle: 'Rensehastighet',      value: 108,  unit: 'mL/min',   low: 90,   high: 120,  displayMin: 60, displayMax: 130,athlete: 112, comment: 'Rensehastigheten er utmerket.' },
  alat:        { name: 'Lever (ALAT)',    subtitle: 'Leverhelse',          value: 28,   unit: 'U/L',      low: 10,   high: 45,   displayMin: 5,  displayMax: 80, athlete: 24,  comment: 'Leveren tåler en fest iblant.' },
  crp:         { name: 'CRP',             subtitle: 'Betennelsesalarm',    value: 0.8,  unit: 'mg/L',     low: 0,    high: 3,    displayMin: 0,  displayMax: 15, athlete: 0.5, comment: 'Lavt — veldig bra! Ingenting å se her.', inverse: true },
  ferritin:    { name: 'Ferritin',        subtitle: 'Jernlager',           value: 145,  unit: 'µg/L',     low: 30,   high: 300,  displayMin: 0,  displayMax: 400,athlete: 160, comment: 'Godt jernlager — ingen blodfattigdom.' }
}

// ─── Page indicator ─────────────────────────────────────────────────────
function PageIndicator({ active, total, onJump, labels }) {
  return (
    <div className="fixed right-5 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 items-end">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          className="group flex items-center gap-3"
          aria-label={`Gå til side ${i + 1}`}
        >
          <span className={`mono text-[0.6rem] tracking-[0.25em] uppercase transition-all duration-500 ${
            i === active ? 'opacity-100 text-bone' : 'opacity-0 group-hover:opacity-50 text-bone'
          }`}>
            {labels[i]}
          </span>
          <span className="relative flex items-center justify-center w-3 h-3">
            <motion.span
              className="block rounded-full"
              animate={{
                width: i === active ? 8 : 4,
                height: i === active ? 8 : 4,
                backgroundColor: i === active ? '#3DFF8F' : 'rgba(244,242,236,0.35)'
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={ i === active ? { boxShadow: '0 0 12px rgba(61,255,143,0.7)' } : {}}
            />
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Health Bar ─────────────────────────────────────────────────────────
function AthleteIcon({ size = 22 }) {
  // Tiny runner silhouette, line drawing, dim grey
  return (
    <svg viewBox="0 0 32 40" width={size} height={size * 40 / 32} fill="none" stroke="rgba(244,242,236,0.55)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="19" cy="6" r="3" />
      <path d="M 16 11 L 11 19 L 14 25 L 10 36" />
      <path d="M 14 25 L 21 23 L 26 28" />
      <path d="M 16 11 L 22 14 L 27 12" />
      <path d="M 11 19 L 5 17" />
    </svg>
  )
}

function HealthBar({ m, index = 0 }) {
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.4 })
  const reduce = useReducedMotion()
  const range = m.displayMax - m.displayMin
  const toPct = (v) => Math.max(0, Math.min(1, (v - m.displayMin) / range)) * 100

  const lowPct  = toPct(m.low)
  const highPct = toPct(m.high)
  const valPct  = toPct(m.value)
  const athPct  = toPct(m.athlete)

  // Determine status
  const status = m.value < m.low ? 'low' : m.value > m.high ? 'high' : 'ok'

  return (
    <motion.div
      ref={ref}
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.9, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header row */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="serif text-3xl md:text-4xl leading-none">{m.name}</h3>
          <p className="mono text-[0.65rem] tracking-[0.3em] uppercase text-ash mt-2">{m.subtitle}</p>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-2 justify-end">
            <span className="num text-5xl md:text-6xl">{m.value}</span>
            <span className="mono text-xs text-ash">{m.unit}</span>
          </div>
          <div className="mono text-[0.6rem] tracking-[0.25em] uppercase text-ash mt-1">
            Optimalt {m.low}–{m.high}
          </div>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-14 md:h-16">
        {/* Track background — red gradient outer + neon center */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full overflow-hidden">
          {/* Red base */}
          <div className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(255,51,85,0.55) 0%, rgba(255,51,85,0.18) 30%, rgba(255,51,85,0.18) 70%, rgba(255,51,85,0.55) 100%)'
            }}
          />
          {/* Neon optimal zone */}
          <motion.div
            className="absolute inset-y-0"
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={inView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.6 }}
            transition={{ duration: 1.4, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              left: `${lowPct}%`,
              width: `${highPct - lowPct}%`,
              background: 'linear-gradient(90deg, rgba(61,255,143,0.85), rgba(61,255,143,1), rgba(61,255,143,0.85))',
              boxShadow: '0 0 24px rgba(61,255,143,0.55), inset 0 0 12px rgba(61,255,143,0.4)',
              transformOrigin: 'center'
            }}
          />
        </div>

        {/* Tick marks at zone boundaries */}
        <div className="absolute top-1/2 -translate-y-1/2 w-px h-5 bg-bone/35" style={{ left: `${lowPct}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-px h-5 bg-bone/35" style={{ left: `${highPct}%` }} />

        {/* Athlete figure */}
        <motion.div
          className="absolute -top-1"
          initial={{ opacity: 0, y: -6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 + index * 0.1, duration: 0.7 }}
          style={{ left: `${athPct}%`, transform: 'translateX(-50%)' }}
        >
          <AthleteIcon size={20} />
        </motion.div>
        <motion.div
          className="absolute bottom-0 mono text-[0.55rem] tracking-[0.2em] uppercase text-bone/45 whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 + index * 0.1, duration: 0.7 }}
          style={{ left: `${athPct}%`, transform: 'translateX(-50%)' }}
        >
          Elite
        </motion.div>

        {/* User dot */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          initial={{ left: '-5%', opacity: 0 }}
          animate={inView ? { left: `${valPct}%`, opacity: 1 } : { left: '-5%', opacity: 0 }}
          transition={{ duration: reduce ? 0 : 1.6, delay: 0.5 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <span className="block w-4 h-4 rounded-full bg-bone whitePulse" />
        </motion.div>

        {/* Endpoint labels */}
        <div className="absolute -bottom-1 left-0 mono text-[0.55rem] tracking-[0.2em] uppercase text-blood/70">For lavt</div>
        <div className="absolute -bottom-1 right-0 mono text-[0.55rem] tracking-[0.2em] uppercase text-blood/70">For høyt</div>
      </div>

      {/* Comment */}
      <motion.p
        className="mt-8 text-bone/80 text-lg md:text-xl leading-relaxed max-w-2xl"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
      >
        <span className="text-neon mr-2">▸</span>{m.comment}
      </motion.p>
    </motion.div>
  )
}

// ─── Reusable bits ─────────────────────────────────────────────────────
function PageHeader({ idx, total, kicker, title, subtitle }) {
  return (
    <div className="absolute top-8 md:top-12 left-6 md:left-12 right-20 md:right-32 z-10">
      <div className="flex items-center gap-4 mb-4">
        <MiniDrop size={14} />
        <span className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ash">
          {String(idx).padStart(2,'0')} / {String(total).padStart(2,'0')}
        </span>
        <span className="flex-1 h-px bg-bone/15 max-w-[140px]" />
        <span className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ash hidden md:inline">
          {kicker}
        </span>
      </div>
      {title && (
        <div className="mt-2">
          <h2 className="serif text-3xl md:text-[2.6rem] leading-[0.95] tracking-tightest">{title}</h2>
          {subtitle && <p className="text-ash text-sm md:text-base mt-2 max-w-[60ch]">{subtitle}</p>}
        </div>
      )}
    </div>
  )
}

function ScrollCue({ label = 'Scroll' }) {
  return (
    <motion.div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }}
    >
      <span className="mono text-[0.55rem] tracking-[0.3em] uppercase text-ash">{label}</span>
      <motion.div
        className="w-px bg-bone/40"
        animate={{ scaleY: [0.2, 1, 0.2], originY: 0 }}
        transition={{ duration: 2.4, repeat: Infinity }}
        style={{ height: 32, transformOrigin: 'top' }}
      />
    </motion.div>
  )
}

// ─── PAGE 1: Helse-karakterkortet ───────────────────────────────────────
function Page1({ active }) {
  return (
    <section className="snap-page page-glow flex flex-col">
      <PageHeader idx={1} total={6} kicker="Helsekort" />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 px-6 md:px-12 pt-24 md:pt-28 pb-20 gap-y-8 md:gap-x-8 items-center">

        {/* Left: drop + ID */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <BloodDrop
            fill={user.healthScore}
            size={300}
            active={active}
            label={`${user.healthScore}`}
            sublabel="Helsescore"
          />
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <p className="serif text-2xl">Hei, <span className="italic">{user.name}</span>.</p>
            <p className="mono text-[0.65rem] tracking-[0.3em] uppercase text-ash mt-2">
              Blod-ID  ·  {user.blodId}
            </p>
          </motion.div>
        </div>

        {/* Right: 4 stat cards */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard delay={0.3} active={active} kicker="Biologisk alder">
            <div className="flex items-baseline gap-3">
              <span className="num text-7xl">{user.biologicalAge}</span>
              <span className="mono text-xs text-ash">år</span>
            </div>
            <p className="text-bone/70 text-sm mt-3 leading-snug">
              <span className="text-neon">▼ 3 år</span> yngre enn din faktiske alder
            </p>
          </StatCard>

          <StatCard delay={0.45} active={active} kicker="Helsehastighet">
            <Speedometer />
            <p className="text-bone/70 text-sm mt-3 leading-snug">Metabolsk tempo: <span className="text-neon">Høyt</span></p>
          </StatCard>

          <StatCard delay={0.6} active={active} kicker="Immunforsvar">
            <div className="flex items-baseline gap-3">
              <span className="serif text-5xl text-neon">Sterkt</span>
            </div>
            <ImmuneScale />
            <p className="text-bone/70 text-sm mt-3 leading-snug">Hvite blodceller og CRP innenfor.</p>
          </StatCard>

          <StatCard delay={0.75} active={active} kicker="Blodkvalitet">
            <div className="grid grid-cols-3 gap-3 mt-2">
              <QualityIcon icon="iron" label="Jern" status="Bra" />
              <QualityIcon icon="o2"   label="Oksygen" status="Optimalt" />
              <QualityIcon icon="fire" label="Betennelse" status="Lav" />
            </div>
          </StatCard>
        </div>
      </div>

      {/* Footer date + arrow */}
      <motion.div
        className="absolute bottom-6 left-6 md:left-12 mono text-[0.6rem] tracking-[0.3em] uppercase text-ash z-10"
        initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}} transition={{ delay: 1.6, duration: 0.8 }}
      >
        Prøve  ·  {user.testDate}
      </motion.div>
      <ScrollCue label="Scroll for detaljer" />
    </section>
  )
}

function StatCard({ children, kicker, delay = 0, active }) {
  return (
    <motion.div
      className="rounded-2xl border hairline bg-nightCard/60 backdrop-blur-sm p-5 md:p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ash mb-3">{kicker}</div>
      {children}
    </motion.div>
  )
}

function Speedometer() {
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.4 })
  const angle = 38 // -90 to +90; 38 = "Aktiv Optimal" (right of center)
  return (
    <div ref={ref} className="relative w-full">
      <svg viewBox="0 0 200 110" className="w-full">
        <defs>
          <linearGradient id="speedo" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF3355" />
            <stop offset="50%" stopColor="#FFB23D" />
            <stop offset="100%" stopColor="#3DFF8F" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="url(#speedo)" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.85" />
        {/* tick marks */}
        {[-70, -35, 0, 35, 70].map((a) => {
          const rad = (a - 90) * Math.PI / 180
          const x1 = 100 + Math.cos(rad) * 72
          const y1 = 100 + Math.sin(rad) * 72
          const x2 = 100 + Math.cos(rad) * 80
          const y2 = 100 + Math.sin(rad) * 80
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(244,242,236,0.35)" strokeWidth="1" />
        })}
        {/* needle */}
        <motion.g
          style={{ originX: '100px', originY: '100px' }}
          initial={{ rotate: -90 }}
          animate={inView ? { rotate: angle } : { rotate: -90 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <line x1="100" y1="100" x2="100" y2="30" stroke="#F4F2EC" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="100" cy="100" r="5" fill="#F4F2EC" />
        </motion.g>
      </svg>
      <div className="flex justify-between -mt-1 mono text-[0.55rem] tracking-wider uppercase text-ash">
        <span>Lavt</span><span>Aktiv Optimal</span><span>Høyt</span>
      </div>
    </div>
  )
}

function ImmuneScale() {
  return (
    <div className="mt-3 flex gap-1 h-1.5">
      <div className="flex-1 rounded-full bg-blood/70" />
      <div className="flex-1 rounded-full bg-amber/70" />
      <div className="flex-1 rounded-full bg-neon shadow-[0_0_12px_rgba(61,255,143,0.7)]" />
    </div>
  )
}

function QualityIcon({ icon, label, status }) {
  const paths = {
    iron: <path d="M12 3 L 4 8 V16 L 12 21 L 20 16 V 8 Z" />,
    o2:   <><circle cx="12" cy="9"  r="3" /><circle cx="8"  cy="15" r="3" /><circle cx="16" cy="15" r="3" /></>,
    fire: <path d="M12 3 c 3 5 5 7 5 11 a 5 5 0 0 1 -10 0 c 0 -2 2 -3 3 -6 c 1 1 2 1 2 -5 Z" />
  }
  return (
    <div className="flex flex-col items-center text-center gap-1.5">
      <div className="w-9 h-9 rounded-full border hairline-strong flex items-center justify-center text-neon">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          {paths[icon]}
        </svg>
      </div>
      <span className="mono text-[0.55rem] tracking-[0.2em] uppercase text-ash">{label}</span>
      <span className="text-xs text-bone">{status}</span>
    </div>
  )
}

// ─── PAGE 2-5: Health bar pages ────────────────────────────────────────
function BarPage({ idx, total, kicker, title, subtitle, metrics, active }) {
  return (
    <section className="snap-page page-glow flex flex-col">
      <PageHeader idx={idx} total={total} kicker={kicker} title={title} subtitle={subtitle} />
      <div className="flex-1 flex items-center justify-center px-6 md:px-12 pt-32 pb-16">
        <div className="w-full max-w-4xl space-y-14 md:space-y-16">
          {metrics.map((m, i) => active && <HealthBar key={m.name} m={m} index={i} />)}
        </div>
      </div>
      <ScrollCue />
    </section>
  )
}

// ─── PAGE 6: Personlig oppskrift ───────────────────────────────────────
function Page6({ active }) {
  return (
    <section className="snap-page page-glow flex flex-col">
      <PageHeader idx={6} total={6} kicker="Oppskrift" />

      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 pt-24 pb-20">
        <motion.div
          className="max-w-4xl mx-auto w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mono text-[0.65rem] tracking-[0.3em] uppercase text-ash mb-4">Din personlige oppskrift</p>
          <h2 className="serif text-5xl md:text-7xl leading-[0.95] tracking-tightest mb-12">
            Slik <span className="italic text-neon">styrker</span> du<br />kroppen videre.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <RecipeCard
              kicker="Største styrke"
              dotColor="bg-neon"
              title="Oksygentransport"
              body="Din oksygenbærende kapasitet er i verdensklasse. Hemoglobin, ferritin og oksygenbinding er alle innenfor eliteområdet."
              delay={0.3}
              active={active}
            />
            <RecipeCard
              kicker="Fokusområde"
              dotColor="bg-amber"
              title="Vitamin D"
              body="Verdiene ligger i nedre del av optimalt område — typisk etter vinteren. Lett å justere."
              delay={0.45}
              active={active}
            />
          </div>

          <motion.div
            className="rounded-2xl border hairline-strong bg-nightCard/40 p-6 md:p-8 flex items-start gap-5 mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={active ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.9 }}
          >
            <div className="w-12 h-12 rounded-full bg-neon/15 text-neon flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3 M5 5 l2 2 M17 17 l2 2 M5 19 l2 -2 M17 7 l2 -2" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ash mb-2">Anbefaling</div>
              <p className="serif text-2xl md:text-3xl leading-snug">
                Ta <span className="text-neon">15 minutter sol</span> på vei til jobb,<br className="hidden md:block" />
                eller en liten dose tran til frokost.
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}}
            transition={{ delay: 0.85, duration: 0.8 }}
          >
            <button className="flex-1 bg-neon text-night py-4 rounded-full mono text-xs tracking-[0.25em] uppercase hover:bg-neon/90 transition-colors">
              Del anonymt med legen
            </button>
            <button className="flex-1 border hairline-strong text-bone py-4 rounded-full mono text-xs tracking-[0.25em] uppercase hover:border-bone/40 transition-colors">
              Last ned som PDF
            </button>
          </motion.div>

          <motion.p
            className="mt-12 mono text-[0.6rem] tracking-[0.3em] uppercase text-ash/60 text-center"
            initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : {}}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Blod  ·  Helseindeks  ·  {user.testDate}  ·  Fürst Medisinsk Laboratorium
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

function RecipeCard({ kicker, dotColor, title, body, delay, active }) {
  return (
    <motion.div
      className="rounded-2xl border hairline bg-nightCard/40 p-6 md:p-7"
      initial={{ opacity: 0, y: 20 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ash">{kicker}</span>
      </div>
      <h3 className="serif text-3xl md:text-4xl leading-none mb-3">{title}</h3>
      <p className="text-bone/70 leading-relaxed">{body}</p>
    </motion.div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────
export default function BlodApp() {
  const containerRef = useRef(null)
  const [active, setActive] = useState(0)
  const labels = ['Karakter', 'Byggesteiner', 'Energi', 'Organer', 'Betennelse', 'Oppskrift']

  // Determine active page from scroll position
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const i = Math.round(el.scrollTop / el.clientHeight)
      setActive(i)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const jump = (i) => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: i * el.clientHeight, behavior: 'smooth' })
  }

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') jump(Math.min(5, active + 1))
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   jump(Math.max(0, active - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  return (
    <>
      {/* Brand */}
      <div className="fixed top-6 left-6 md:top-8 md:left-12 z-50 flex items-center gap-2.5">
        <MiniDrop size={14} />
        <span className="mono text-[0.65rem] tracking-[0.35em] uppercase">Blod</span>
      </div>

      <PageIndicator active={active} total={6} onJump={jump} labels={labels} />

      <div ref={containerRef} className="snap-y">
        <Page1 active={active === 0} />
        <BarPage
          idx={2} total={6} kicker="Side 2 av 6"
          title={<>Blodets <span className="italic text-neon">byggesteiner</span></>}
          subtitle="Celler og transport — rangert fra optimalt til oppmerksomhet."
          metrics={[M.hemoglobin, M.leukocytes, M.platelets]}
          active={active === 1}
        />
        <BarPage
          idx={3} total={6} kicker="Side 3 av 6"
          title={<>Energi & <span className="italic text-neon">stoffskifte</span></>}
          subtitle="Hvordan kroppen din håndterer drivstoff."
          metrics={[M.vitaminD, M.glucose, M.cholesterol]}
          active={active === 2}
        />
        <BarPage
          idx={4} total={6} kicker="Side 4 av 6"
          title={<>Organer & <span className="italic text-neon">filtrering</span></>}
          subtitle="Lever, nyrer og kroppens egne renseverk."
          metrics={[M.egfr, M.alat]}
          active={active === 3}
        />
        <BarPage
          idx={5} total={6} kicker="Side 5 av 6"
          title={<>Betennelse & <span className="italic text-neon">aldring</span></>}
          subtitle="De stille signalene som er verdt å kjenne til."
          metrics={[M.crp, M.ferritin]}
          active={active === 4}
        />
        <Page6 active={active === 5} />
      </div>
    </>
  )
}
