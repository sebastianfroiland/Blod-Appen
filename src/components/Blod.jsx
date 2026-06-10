import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect, useRef, useState } from 'react'
import LiquidDrop, { MiniDrop } from './BloodDrop.jsx'

// ─── User ───────────────────────────────────────────────────────────────
const user = {
  name: 'Aksel',
  initials: 'AS',
  blodId: '2849',
  bloodType: 'O−',
  score: 78,
  testDate: '18. mai 2026'
}

// ─── Tests ──────────────────────────────────────────────────────────────
const tests = [
  { short: 'Nov 25', date: '3. november 2025', time: '08:40', lab: 'Fürst, Oslo' },
  { short: 'Jan 26', date: '12. januar 2026',  time: '09:05', lab: 'Fürst, Oslo' },
  { short: 'Mai 26', date: '18. mai 2026',     time: '09:14', lab: 'Fürst, Oslo' }
]
const LATEST = tests.length - 1

// ─── Markers ────────────────────────────────────────────────────────────
// v: one value per test (chronological). low/high = optimal. min/max = scale.
const markers = [
  // Blodceller
  { name: 'Hemoglobin',       unit: 'g/dL',     low: 13.5, high: 17.5, min: 11,   max: 19,   v: [14.8, 15.0, 15.1], group: 'Blodceller', cats: ['trening'],          desc: 'Frakter oksygen til musklene.',            note: 'Perfekt for utholdenhet.' },
  { name: 'Hematokrit',       unit: '%',        low: 40,   high: 50,   min: 30,   max: 60,   v: [43, 44, 44],       group: 'Blodceller', cats: ['trening'],          desc: 'Andel røde celler i blodet.',              note: 'Stabil og fin.' },
  { name: 'Røde blodceller',  unit: '10¹²/L',   low: 4.3,  high: 5.7,  min: 3.5,  max: 6.5,  v: [4.9, 5.0, 5.1],    group: 'Blodceller', cats: ['trening'],          desc: 'Cellene som bærer hemoglobinet.',          note: 'Godt nivå.' },
  { name: 'MCV',              unit: 'fL',       low: 82,   high: 98,   min: 70,   max: 110,  v: [88, 89, 90],       group: 'Blodceller', cats: [],                   desc: 'Størrelsen på de røde blodcellene.',       note: 'Normal størrelse.' },
  { name: 'Hvite blodceller', unit: '10⁹/L',    low: 3.5,  high: 10,   min: 2,    max: 12,   v: [6.8, 7.2, 7.8],    group: 'Blodceller', cats: ['immun'],            desc: 'Kroppens infeksjonsforsvar.',              note: 'Litt høyt — vanlig etter trening.' },
  { name: 'Blodplater',       unit: '10⁹/L',    low: 145,  high: 390,  min: 100,  max: 450,  v: [310, 315, 320],    group: 'Blodceller', cats: ['immun'],            desc: 'Sørger for at sår koagulerer.',            note: 'God sårheling.' },

  // Sukker & fett
  { name: 'Blodsukker',       unit: 'mmol/L',   low: 4.0,  high: 6.0,  min: 3,    max: 7,    v: [5.2, 5.1, 5.0],    group: 'Sukker & fett', cats: ['energi'],        desc: 'Fastende glukose.',                        note: 'Stabilt. Jevn energi.' },
  { name: 'HbA1c',            unit: 'mmol/mol', low: 20,   high: 42,   min: 15,   max: 60,   v: [34, 33, 33],       group: 'Sukker & fett', cats: ['energi', 'langtid'], desc: 'Snittsukker siste tre måneder.',       note: 'Veldig bra over tid.' },
  { name: 'Kolesterol',       unit: 'mmol/L',   low: 3.0,  high: 5.0,  min: 2,    max: 7,    v: [5.1, 4.9, 4.8],    group: 'Sukker & fett', cats: ['hjerte'],        desc: 'Totalkolesterol.',                         note: 'På vei ned — fortsett slik.' },
  { name: 'LDL',              unit: 'mmol/L',   low: 0,    high: 3.0,  min: 0,    max: 5,    v: [3.1, 3.0, 2.9],    group: 'Sukker & fett', cats: ['hjerte'],        desc: 'Det «slemme» kolesterolet.',               note: 'Nær grensen. Kosthold hjelper.' },
  { name: 'HDL',              unit: 'mmol/L',   low: 1.0,  high: 2.5,  min: 0.5,  max: 3,    v: [1.5, 1.6, 1.6],    group: 'Sukker & fett', cats: ['hjerte'],        desc: 'Det «snille» kolesterolet.',               note: 'Beskytter hjertet.' },
  { name: 'Triglyserider',    unit: 'mmol/L',   low: 0,    high: 1.7,  min: 0,    max: 4,    v: [1.3, 1.2, 1.1],    group: 'Sukker & fett', cats: ['hjerte'],        desc: 'Fett i blodet.',                           note: 'Lavt og fint.' },

  // Vitaminer & mineraler
  { name: 'Vitamin D',        unit: 'nmol/L',   low: 50,   high: 150,  min: 20,   max: 180,  v: [55, 61, 64],       group: 'Vitaminer & mineraler', cats: ['energi', 'immun'], desc: 'Solvitaminet.',                  note: '20 min sol gir et løft.' },
  { name: 'Vitamin B12',      unit: 'pmol/L',   low: 200,  high: 700,  min: 100,  max: 800,  v: [390, 400, 410],    group: 'Vitaminer & mineraler', cats: ['energi'], desc: 'Viktig for nerver og energi.',            note: 'Godt dekket.' },
  { name: 'Folat',            unit: 'nmol/L',   low: 7,    high: 40,   min: 0,    max: 50,   v: [17, 18, 18],       group: 'Vitaminer & mineraler', cats: ['energi'], desc: 'B-vitamin for celledeling.',              note: 'Fint nivå.' },
  { name: 'Jern',             unit: 'µmol/L',   low: 9,    high: 34,   min: 5,    max: 45,   v: [17, 18, 19],       group: 'Vitaminer & mineraler', cats: ['trening', 'energi'], desc: 'Råstoffet til hemoglobin.',    note: 'Stabilt og godt.' },
  { name: 'Ferritin',         unit: 'µg/L',     low: 30,   high: 300,  min: 0,    max: 400,  v: [120, 132, 145],    group: 'Vitaminer & mineraler', cats: ['trening', 'immun'], desc: 'Jernlageret ditt.',             note: 'Godt jernlager.' },
  { name: 'Magnesium',        unit: 'mmol/L',   low: 0.71, high: 0.94, min: 0.5,  max: 1.2,  v: [0.82, 0.84, 0.85], group: 'Vitaminer & mineraler', cats: ['trening'], desc: 'Muskler og restitusjon.',               note: 'Bra for musklene.' },
  { name: 'Kalsium',          unit: 'mmol/L',   low: 2.15, high: 2.51, min: 1.8,  max: 2.9,  v: [2.32, 2.34, 2.33], group: 'Vitaminer & mineraler', cats: [],         desc: 'Skjelett og nerver.',                     note: 'Helt normalt.' },

  // Salter
  { name: 'Natrium',          unit: 'mmol/L',   low: 137,  high: 145,  min: 125,  max: 155,  v: [140, 141, 141],    group: 'Salter', cats: [],                       desc: 'Væskebalanse.',                            note: 'I balanse.' },
  { name: 'Kalium',           unit: 'mmol/L',   low: 3.6,  high: 4.6,  min: 2.8,  max: 5.5,  v: [4.1, 4.2, 4.1],    group: 'Salter', cats: ['trening'],              desc: 'Muskel- og nervefunksjon.',                note: 'Fint — ingen krampefare.' },

  // Hormoner
  { name: 'TSH',              unit: 'mIU/L',    low: 0.27, high: 4.2,  min: 0,    max: 6,    v: [2.2, 2.1, 2.1],    group: 'Hormoner', cats: ['energi'],             desc: 'Styrer stoffskiftet.',                     note: 'Stoffskiftet går som det skal.' },
  { name: 'Fritt T4',         unit: 'pmol/L',   low: 12,   high: 22,   min: 8,    max: 28,   v: [15.4, 15.2, 15.6], group: 'Hormoner', cats: ['energi'],             desc: 'Skjoldbruskhormon.',                       note: 'Midt i sonen.' },
  { name: 'Testosteron',      unit: 'nmol/L',   low: 8.6,  high: 29,   min: 4,    max: 35,   v: [18, 19, 21],       group: 'Hormoner', cats: ['trening'],            desc: 'Muskelbygging og overskudd.',              note: 'Stigende — bra trent effekt.' },
  { name: 'Kortisol',         unit: 'nmol/L',   low: 133,  high: 537,  min: 50,   max: 700,  v: [420, 390, 350],    group: 'Hormoner', cats: ['trening'],            desc: 'Stresshormonet.',                          note: 'Synkende — god restitusjon.' },

  // Organer
  { name: 'Nyrer · eGFR',     unit: 'mL/min',   low: 90,   high: 130,  min: 50,   max: 140,  v: [104, 106, 108],    group: 'Organer', cats: ['langtid'],             desc: 'Nyrenes rensehastighet.',                  note: 'Utmerket rensing.' },
  { name: 'Kreatinin',        unit: 'µmol/L',   low: 60,   high: 105,  min: 30,   max: 150,  v: [88, 87, 86],       group: 'Organer', cats: ['langtid'],             desc: 'Avfallsstoff fra musklene.',               note: 'Normalt for aktive.' },
  { name: 'Lever · ALAT',     unit: 'U/L',      low: 10,   high: 70,   min: 0,    max: 100,  v: [32, 30, 28],       group: 'Organer', cats: ['langtid'],             desc: 'Leverenzym.',                              note: 'Leveren har det fint.' },
  { name: 'ASAT',             unit: 'U/L',      low: 15,   high: 45,   min: 0,    max: 80,   v: [30, 29, 28],       group: 'Organer', cats: ['langtid'],             desc: 'Lever- og muskelenzym.',                   note: 'Helt fint.' },
  { name: 'Gamma-GT',         unit: 'U/L',      low: 10,   high: 80,   min: 0,    max: 120,  v: [25, 24, 22],       group: 'Organer', cats: ['langtid'],             desc: 'Følsom levermarkør.',                      note: 'Lavt og bra.' },
  { name: 'Albumin',          unit: 'g/L',      low: 36,   high: 48,   min: 25,   max: 55,   v: [44, 44, 45],       group: 'Organer', cats: ['langtid'],             desc: 'Leverens hovedprotein.',                   note: 'God proteinstatus.' },
  { name: 'Urinsyre',         unit: 'µmol/L',   low: 230,  high: 480,  min: 100,  max: 600,  v: [350, 345, 340],    group: 'Organer', cats: ['langtid'],             desc: 'Avfallsstoff — høyt gir urinsyregikt.',    note: 'Trygt nivå.' },

  // Betennelse
  { name: 'CRP',              unit: 'mg/L',     low: 0,    high: 3,    min: 0,    max: 15,   v: [1.4, 1.0, 0.8],    group: 'Betennelse', cats: ['immun', 'hjerte'],  desc: 'Akutt betennelsesmarkør.',                 note: 'Lavt. Veldig bra.' },
  { name: 'SR',               unit: 'mm/t',     low: 0,    high: 15,   min: 0,    max: 40,   v: [8, 7, 7],          group: 'Betennelse', cats: ['immun'],            desc: 'Senkning — langsom betennelse.',           note: 'Ingen tegn til betennelse.' }
]

const groupOrder = ['Blodceller', 'Sukker & fett', 'Vitaminer & mineraler', 'Salter', 'Hormoner', 'Organer', 'Betennelse']
const byName = Object.fromEntries(markers.map((m) => [m.name, m]))

const cats = [
  { id: 'alle',    label: 'Alle',          featured: ['Hemoglobin', 'Vitamin D', 'CRP'] },
  { id: 'trening', label: 'Trening',       featured: ['Hemoglobin', 'Ferritin', 'Testosteron'], insight: 'Oksygentransport, restitusjon og muskelarbeid. Alt ligger til rette for gode økter.' },
  { id: 'energi',  label: 'Energi',        featured: ['Vitamin D', 'Blodsukker', 'TSH'],        insight: 'Stoffskifte og drivstoff. Vitamin D kan løftes litt.' },
  { id: 'hjerte',  label: 'Hjerte',        featured: ['LDL', 'HDL', 'Triglyserider'],           insight: 'Fettstoffer og hjertehelse. LDL nærmer seg grensen — kosthold hjelper.' },
  { id: 'immun',   label: 'Immunforsvar',  featured: ['Hvite blodceller', 'CRP', 'Vitamin D'],  insight: 'Forsvar og betennelse. Lave nivåer av betennelse — sterkt forsvar.' },
  { id: 'langtid', label: 'Langtidshelse', featured: ['HbA1c', 'Nyrer · eGFR', 'Lever · ALAT'], insight: 'Organfunksjon og blodsukker over tid. Stabilt og fint.' }
]

// ─── Trends / donations ────────────────────────────────────────────────
const trends = [
  { name: 'Hemoglobin', unit: 'g/dL',   now: '15,1', data: [14.2, 14.5, 14.8, 15.0, 15.1, 15.1], chip: '↑ stabil' },
  { name: 'CRP',        unit: 'mg/L',   now: '0,8',  data: [2.4, 1.9, 1.6, 1.2, 0.9, 0.8],       chip: '↓ 67 %' },
  { name: 'Vitamin D',  unit: 'nmol/L', now: '64',   data: [44, 48, 55, 58, 61, 64],             chip: '↑ på vei' }
]

const donations = {
  totalLiters: '5,4',
  count: 12,
  lives: 36,
  nextDate: '2. juli',
  yearGoal: { done: 3, of: 4 },
  history: [
    { date: '12. apr 2026', place: 'Blodbanken Oslo' },
    { date: '9. jan 2026',  place: 'Blodbanken Oslo' },
    { date: '3. okt 2025',  place: 'Blodbussen Majorstuen' },
    { date: '27. jun 2025', place: 'Blodbanken Oslo' },
    { date: '14. mar 2025', place: 'Blodbanken Ullevål' }
  ]
}

// ─── Helpers ───────────────────────────────────────────────────────────
const decs = (v) => (String(v).split('.')[1] || '').length
const fmtN = (v, d = decs(v)) => v.toFixed(d).replace('.', ',')

// Status for a marker at a given value
const statusOf = (m, val) => {
  if (val < m.low || val > m.high) return 'red'
  const p = (val - m.low) / (m.high - m.low)
  if (p > 0.88) return 'amber'
  if (m.low > m.min && p < 0.15) return 'amber'
  return 'green'
}
const dotClass = { green: 'bg-green', amber: 'bg-amber', red: 'bg-blood' }
const hexOf = { green: '#15A86B', amber: '#D98A1F', red: '#C41E3A' }

const countStatuses = (ti) => {
  let green = 0, follow = 0
  markers.forEach((m) => (statusOf(m, m.v[ti]) === 'green' ? green++ : follow++))
  return { green, follow }
}

// ─── Icons ─────────────────────────────────────────────────────────────
function Icon({ name, className = 'w-5 h-5' }) {
  const I = {
    home:     <><path d="M4 11 L12 4 L20 11" /><path d="M6 9.5 V20 H18 V9.5" /></>,
    doc:      <><rect x="5" y="3" width="14" height="18" rx="2.5" /><path d="M9 8 h6 M9 12 h6 M9 16 h4" /></>,
    chart:    <><path d="M4 19 L4 5" /><path d="M4 19 L20 19" /><path d="M7 14 L11 10 L14 12.5 L19 7" /></>,
    user:     <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20 c 1.5 -4 4 -5.5 7 -5.5 s 5.5 1.5 7 5.5" /></>,
    chevron:  <path d="M9 5 l7 7 -7 7" />,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="2.5" /><path d="M4 10 h16 M8 3 v4 M16 3 v4" /></>,
    share:    <><circle cx="6" cy="12" r="2.5" /><circle cx="17" cy="6" r="2.5" /><circle cx="17" cy="18" r="2.5" /><path d="M8.3 10.8 L14.8 7.2 M8.3 13.2 L14.8 16.8" /></>,
    download: <><path d="M12 4 v11" /><path d="M7 11 l5 5 5 -5" /><path d="M5 20 h14" /></>,
    logout:   <><path d="M14 4 H6 a2 2 0 0 0 -2 2 v12 a2 2 0 0 0 2 2 h8" /><path d="M15 8 l5 4 -5 4 M20 12 H9" /></>,
    search:   <><circle cx="11" cy="11" r="6" /><path d="M15.5 15.5 L20 20" /></>
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {I[name]}
    </svg>
  )
}

// ─── Small bits ────────────────────────────────────────────────────────
function Chip({ tone = 'green', children, onClick }) {
  const tones = {
    green: 'text-green bg-green/10 border-green/20',
    amber: 'text-amber bg-amber/10 border-amber/20',
    blood: 'text-blood bg-blood/10 border-blood/20',
    ink:   'text-ink/60 bg-ink/5 border-ink/10'
  }
  const cls = `mono text-[0.6rem] tracking-[0.12em] uppercase rounded-full border px-2.5 py-1 leading-none ${tones[tone]}`
  return onClick
    ? <button onClick={onClick} className={cls}>{children}</button>
    : <span className={cls}>{children}</span>
}

function CountUp({ to, duration = 1.4 }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf, start
    const step = (t) => {
      if (!start) start = t
      const p = Math.min(1, (t - start) / (duration * 1000))
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return <>{v}</>
}

// Tweens between values when they change (no restart from 0)
function NumTween({ value, decimals = 0, duration = 0.7 }) {
  const [disp, setDisp] = useState(value)
  const prevRef = useRef(value)
  useEffect(() => {
    const from = prevRef.current
    prevRef.current = value
    if (from === value) { setDisp(value); return }
    let raf, start
    const step = (t) => {
      if (!start) start = t
      const p = Math.min(1, (t - start) / (duration * 1000))
      const e = 1 - Math.pow(1 - p, 3)
      setDisp(from + (value - from) * e)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <>{disp.toFixed(decimals).replace('.', ',')}</>
}

function ScoreRing({ value, size = 132 }) {
  const R = 56, C = 2 * Math.PI * R
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" width="100%" height="100%" className="-rotate-90">
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E8556D" />
            <stop offset="100%" stopColor="#C41E3A" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r={R} stroke="rgba(26,26,46,0.07)" strokeWidth="9" fill="none" />
        <motion.circle
          cx="70" cy="70" r={R} stroke="url(#ring)" strokeWidth="9" fill="none" strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - value / 100) }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-5xl leading-none"><CountUp to={value} /></span>
        <span className="mono text-[0.55rem] tracking-[0.3em] uppercase text-ash mt-1">av 100</span>
      </div>
    </div>
  )
}

const view = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
}

// ─── LOGIN ─────────────────────────────────────────────────────────────
function Login({ onEnter }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const go = () => {
    setBusy(true)
    setTimeout(onEnter, 800)
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {!busy ? (
          <motion.div
            key="form"
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col items-center mb-10">
              <LiquidDrop fill={0.72} width={64} />
              <h1 className="serif text-5xl tracking-tightest mt-7">Blod</h1>
              <p className="mono text-[0.6rem] tracking-[0.35em] uppercase text-ash mt-3">
                Dine prøvesvar
              </p>
            </div>

            <div className="glass p-7">
              <label className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ash block mb-3">
                Prøvekode
              </label>
              <input
                autoFocus
                value={code}
                spellCheck={false}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && code.trim() && go()}
                placeholder="— — — —"
                maxLength={10}
                className="w-full bg-transparent border-b border-ink/15 focus:border-blood outline-none py-2.5 mono text-xl tracking-[0.4em] placeholder:text-ink/20 transition-colors"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!code.trim()}
                onClick={go}
                className="mt-7 w-full bg-blood text-paper py-3.5 rounded-full mono text-[0.65rem] tracking-[0.3em] uppercase disabled:opacity-25 transition-opacity"
              >
                Fortsett
              </motion.button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-ink/10" />
                <span className="mono text-[0.55rem] tracking-[0.3em] uppercase text-ash">eller</span>
                <div className="flex-1 h-px bg-ink/10" />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={go}
                className="w-full border border-ink/15 hover:border-ink/40 py-3.5 rounded-full mono text-[0.65rem] tracking-[0.3em] uppercase transition-colors flex items-center justify-center gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blood" />
                BankID
              </motion.button>
            </div>

            <p className="mono text-[0.55rem] tracking-[0.25em] uppercase text-ash/60 text-center mt-8">
              Simulerte data
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="busy"
            className="flex flex-col items-center gap-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <MiniDrop size={28} />
            </motion.div>
            <span className="mono text-[0.6rem] tracking-[0.35em] uppercase text-ash">Henter…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── HOME ──────────────────────────────────────────────────────────────
function Home({ goTo }) {
  const h = new Date().getHours()
  const greeting = h < 10 ? 'God morgen' : h < 18 ? 'God dag' : 'God kveld'
  const { green, follow } = countStatuses(LATEST)

  const menu = [
    { tab: 'resultater',  icon: 'doc',      title: 'Testresultat', sub: `${markers.length} markører` },
    { tab: 'utvikling',   icon: 'chart',    title: 'Utvikling',    sub: '↑ 3 i bedring' },
    { tab: 'blodgivning', icon: 'drop',     title: 'Blodgivning',  sub: `${donations.count} donasjoner` },
    { tab: 'profil',      icon: 'calendar', title: 'Neste prøve',  sub: '12. nov' }
  ]

  return (
    <motion.div {...view} className="space-y-6">
      <div className="flex items-end justify-between pt-2">
        <div>
          <p className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ash mb-2">{user.testDate}</p>
          <h1 className="serif text-4xl md:text-5xl tracking-tightest leading-none">
            {greeting}, <span className="italic">{user.name}</span>.
          </h1>
        </div>
        <button onClick={() => goTo('profil')} className="glass !rounded-full w-11 h-11 flex items-center justify-center shrink-0">
          <span className="mono text-[0.65rem] tracking-wider">{user.initials}</span>
        </button>
      </div>

      <motion.div
        className="glass p-6 md:p-8 flex items-center gap-6 md:gap-10"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <ScoreRing value={user.score} />
        <div className="flex-1">
          <h2 className="serif text-3xl md:text-4xl tracking-tightest leading-none mb-3">
            I god <span className="italic text-blood">form</span>.
          </h2>
          <div className="flex flex-wrap gap-2">
            <Chip tone="green" onClick={() => goTo('resultater')}>{green} innenfor</Chip>
            <Chip tone="amber" onClick={() => goTo('resultater')}>{follow} å følge</Chip>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {menu.map((it, i) => (
          <motion.button
            key={it.tab + it.title}
            onClick={() => goTo(it.tab)}
            whileTap={{ scale: 0.97 }}
            className="glass glass-hover p-5 text-left"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-10 h-10 rounded-2xl bg-blood/8 text-blood flex items-center justify-center mb-4">
              {it.icon === 'drop'
                ? <MiniDrop size={14} />
                : <Icon name={it.icon} className="w-[1.15rem] h-[1.15rem]" />}
            </div>
            <div className="serif text-xl leading-none mb-1.5">{it.title}</div>
            <div className="mono text-[0.58rem] tracking-[0.15em] uppercase text-ash">{it.sub}</div>
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={() => goTo('blodgivning')}
        whileTap={{ scale: 0.98 }}
        className="glass glass-hover w-full p-5 flex items-center gap-4 text-left"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <MiniDrop size={18} />
        <div className="flex-1">
          <span className="serif text-lg">Du kan gi blod igjen </span>
          <span className="serif text-lg italic text-blood">{donations.nextDate}</span>
        </div>
        <Icon name="chevron" className="w-4 h-4 text-ash" />
      </motion.button>
    </motion.div>
  )
}

// ─── ARC GAUGE (270°) ──────────────────────────────────────────────────
const polar = (cx, cy, r, deg) => {
  const rad = (deg - 90) * Math.PI / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}
const arcPath = (cx, cy, r, a0, a1) => {
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  const large = a1 - a0 > 180 ? 1 : 0
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

// Sweeps from -135° to +135° (270°)
function ArcGauge({ m, ti }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })
  const val = m.v[ti]
  const s = statusOf(m, val)
  const A0 = -135, A1 = 135, SPAN = 270
  const toAng = (v) => A0 + Math.max(0.02, Math.min(0.98, (v - m.min) / (m.max - m.min))) * SPAN
  const valAng = toAng(val)
  const p = (valAng - A0) / SPAN
  const [tx, ty] = polar(100, 100, 74, valAng)
  const delta = ti > 0 ? val - m.v[ti - 1] : null
  const dec = Math.max(...m.v.map(decs))

  return (
    <div ref={ref} className="glass p-4 md:p-5 text-center">
      <div className="relative">
        <svg viewBox="0 0 200 178" className="w-full">
          <defs>
            <linearGradient id={`gauge-${m.name.replace(/[^a-z]/gi, '')}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E8556D" />
              <stop offset="100%" stopColor="#C41E3A" />
            </linearGradient>
          </defs>

          {/* Track */}
          <path d={arcPath(100, 100, 74, A0, A1)} stroke="rgba(26,26,46,0.07)" strokeWidth="9" fill="none" strokeLinecap="round" />
          {/* Optimal zone */}
          <path d={arcPath(100, 100, 74, toAng(m.low), toAng(m.high))} stroke="rgba(21,168,107,0.25)" strokeWidth="9" fill="none" strokeLinecap="round" />
          {/* Boundary ticks */}
          {[m.low, m.high].map((b, i) => {
            const [x0, y0] = polar(100, 100, 64, toAng(b))
            const [x1, y1] = polar(100, 100, 84, toAng(b))
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(26,26,46,0.18)" strokeWidth="1.2" />
          })}
          {/* Value arc — constant full path, animated by pathLength */}
          <motion.path
            d={arcPath(100, 100, 74, A0, A1)}
            stroke={`url(#gauge-${m.name.replace(/[^a-z]/gi, '')})`}
            strokeWidth="9" fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: inView ? p : 0 }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
          {/* Tip dot */}
          <motion.circle
            animate={{ cx: tx, cy: ty }}
            r="6.5" fill={hexOf[s]} stroke="#fff" strokeWidth="2.5"
            initial={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            style={{ opacity: inView ? 1 : 0, filter: `drop-shadow(0 1px 6px ${hexOf[s]}66)` }}
          />
          {/* Min / max labels */}
          <text x="32" y="172" textAnchor="middle" className="mono" style={{ fontSize: 9, fill: 'rgba(26,26,46,0.35)' }}>{fmtN(m.min)}</text>
          <text x="168" y="172" textAnchor="middle" className="mono" style={{ fontSize: 9, fill: 'rgba(26,26,46,0.35)' }}>{fmtN(m.max)}</text>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 pointer-events-none">
          <span className="num text-3xl md:text-4xl leading-none">
            <NumTween value={val} decimals={dec} />
          </span>
          <span className="mono text-[0.52rem] tracking-[0.18em] uppercase text-ash mt-1">{m.unit}</span>
          {delta !== null && Math.abs(delta) > 0.001 && (
            <span className="mono text-[0.55rem] text-ash mt-1.5">
              {delta > 0 ? '↑' : '↓'} {fmtN(Math.abs(delta), dec)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass[s]}`} />
        <span className="text-[0.82rem] font-medium">{m.name}</span>
      </div>
      <div className="mono text-[0.52rem] tracking-[0.15em] uppercase text-ash mt-1">
        Optimalt {fmtN(m.low)}–{fmtN(m.high)}
      </div>
    </div>
  )
}

// ─── Marker row ────────────────────────────────────────────────────────
function Spark({ m, ti }) {
  const W = 76, H = 26, P = 5
  const min = Math.min(...m.v), max = Math.max(...m.v)
  const span = max - min || 1
  const pts = m.v.map((v, i) => [
    P + (i / (m.v.length - 1)) * (W - 2 * P),
    H - P - ((v - min) / span) * (H - 2 * P)
  ])
  const s = statusOf(m, m.v[ti])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <polyline
        points={pts.map((p) => p.join(',')).join(' ')}
        fill="none" stroke="rgba(26,26,46,0.3)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === ti ? 3 : 1.5}
          fill={i === ti ? hexOf[s] : 'rgba(26,26,46,0.3)'} />
      ))}
    </svg>
  )
}

function MarkerRow({ m, ti }) {
  const [open, setOpen] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })
  const val = m.v[ti]
  const s = statusOf(m, val)
  const range = m.max - m.min
  const pct = (v) => Math.max(2, Math.min(98, ((v - m.min) / range) * 100))
  const delta = ti > 0 ? val - m.v[ti - 1] : null
  const dec = Math.max(...m.v.map(decs))

  return (
    <div ref={ref} className="py-3.5 first:pt-1 last:pb-1">
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-baseline justify-between mb-2.5 gap-3">
          <span className="text-[0.95rem] font-medium truncate">{m.name}</span>
          <span className="flex items-baseline gap-2 shrink-0">
            {delta !== null && Math.abs(delta) > 0.001 && (
              <span className="mono text-[0.55rem] text-ash">
                {delta > 0 ? '↑' : '↓'} {fmtN(Math.abs(delta), dec)}
              </span>
            )}
            <span className="num text-2xl leading-none">
              <NumTween value={val} decimals={dec} />
            </span>
            <span className="mono text-[0.55rem] text-ash">{m.unit}</span>
            <span className={`w-2 h-2 rounded-full self-center ${dotClass[s]}`} />
          </span>
        </div>

        {/* Gradstokk */}
        <div className="relative h-3">
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full"
            style={{ background: 'linear-gradient(90deg, rgba(196,30,58,0.22), rgba(26,26,46,0.05) 16%, rgba(26,26,46,0.05) 84%, rgba(196,30,58,0.22))' }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-green/30"
            style={{ left: `${pct(m.low)}%`, width: `${pct(m.high) - pct(m.low)}%`, boxShadow: 'inset 0 0 4px rgba(21,168,107,0.35)' }}
          />
          <div className="absolute top-1/2 -translate-y-1/2 w-px h-2.5 bg-ink/20" style={{ left: `${pct(m.low)}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-px h-2.5 bg-ink/20" style={{ left: `${pct(m.high)}%` }} />
          <motion.div
            className="absolute top-1/2"
            initial={{ left: '2%', opacity: 0 }}
            animate={inView ? { left: `${pct(val)}%`, opacity: 1 } : {}}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <span className={`block w-3 h-3 rounded-full ring-[3px] ring-white shadow ${dotClass[s]}`} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-ink/45">{m.desc}</p>
                <p className="text-sm text-ink/75 mt-1">{m.note}</p>
              </div>
              <div className="shrink-0 text-right">
                <Spark m={m} ti={ti} />
                <div className="mono text-[0.52rem] tracking-[0.12em] uppercase text-ash mt-1">
                  {fmtN(m.low)}–{fmtN(m.high)} {m.unit}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── RESULTATER ────────────────────────────────────────────────────────
function Resultater() {
  const [ti, setTi] = useState(LATEST)
  const [cat, setCat] = useState('alle')
  const [q, setQ] = useState('')

  const activeCat = cats.find((c) => c.id === cat)
  const test = tests[ti]
  const { green, follow } = countStatuses(ti)

  const visible = markers.filter((m) =>
    (cat === 'alle' || m.cats.includes(cat)) &&
    (!q.trim() || m.name.toLowerCase().includes(q.trim().toLowerCase()))
  )
  const visibleGroups = groupOrder
    .map((g) => ({ title: g, items: visible.filter((m) => m.group === g) }))
    .filter((g) => g.items.length > 0)

  const featured = activeCat.featured.map((n) => byName[n]).filter(Boolean)

  return (
    <motion.div {...view} className="space-y-5">
      {/* Header */}
      <header className="flex items-end justify-between pt-2">
        <h1 className="serif text-4xl tracking-tightest">Testresultat</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="glass !rounded-full px-4 py-2 flex items-center gap-2 mono text-[0.6rem] tracking-[0.2em] uppercase text-ink/70"
        >
          <Icon name="download" className="w-3.5 h-3.5" />
          PDF
        </motion.button>
      </header>

      {/* Test picker */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="glass !rounded-full p-1 inline-flex gap-0.5">
          {tests.map((t, i) => {
            const active = i === ti
            return (
              <button key={t.short} onClick={() => setTi(i)} className="relative px-4 py-2 rounded-full">
                {active && (
                  <motion.span
                    layoutId="test-pill"
                    className="absolute inset-0 rounded-full bg-blood"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative mono text-[0.6rem] tracking-[0.15em] uppercase ${active ? 'text-paper' : 'text-ash'}`}>
                  {t.short}
                </span>
              </button>
            )
          })}
        </div>
        <span className="mono text-[0.55rem] tracking-[0.15em] uppercase text-ash">
          {test.date} · kl. {test.time} · {test.lab}
        </span>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        <Chip tone="ink">{markers.length} analysert</Chip>
        <Chip tone="green">{green} innenfor</Chip>
        <Chip tone={follow > 0 ? 'amber' : 'green'}>{follow} å følge</Chip>
      </div>

      {/* Search + categories */}
      <div className="space-y-3">
        <div className="glass !rounded-full px-4 py-2.5 flex items-center gap-2.5">
          <Icon name="search" className="w-4 h-4 text-ash" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Søk i markører…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink/30"
          />
          {q && (
            <button onClick={() => setQ('')} className="mono text-[0.6rem] uppercase text-ash">✕</button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-0.5">
          {cats.map((c) => {
            const active = c.id === cat
            return (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCat(c.id)}
                className={`shrink-0 rounded-full px-4 py-2 mono text-[0.6rem] tracking-[0.15em] uppercase border transition-colors ${
                  active
                    ? 'bg-ink text-paper border-ink'
                    : 'glass text-ash border-transparent'
                }`}
              >
                {c.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Category insight */}
      <AnimatePresence mode="wait">
        {activeCat.insight && (
          <motion.div
            key={cat}
            className="glass px-5 py-4 flex items-center gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blood shrink-0" />
            <p className="text-sm text-ink/75">{activeCat.insight}</p>
            <span className="mono text-[0.55rem] tracking-[0.15em] uppercase text-ash ml-auto shrink-0">
              {visible.length} markører
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured gauges */}
      {!q && (
        <div>
          <p className="mono text-[0.6rem] tracking-[0.35em] uppercase text-ash mb-3">I fokus</p>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {featured.map((m) => <ArcGauge key={`${cat}-${m.name}`} m={m} ti={ti} />)}
          </div>
        </div>
      )}

      {/* Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {visibleGroups.map((g, gi) => (
          <motion.section
            key={g.title}
            className="glass px-6 py-5"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 + gi * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="mono text-[0.6rem] tracking-[0.35em] uppercase text-ash">{g.title}</h2>
              <span className="mono text-[0.55rem] text-ash/60">{g.items.length}</span>
            </div>
            <div className="divide-y divide-ink/5">
              {g.items.map((m) => <MarkerRow key={m.name} m={m} ti={ti} />)}
            </div>
          </motion.section>
        ))}
      </div>

      {visibleGroups.length === 0 && (
        <div className="glass px-6 py-10 text-center">
          <p className="text-sm text-ash">Ingen markører matcher «{q}»</p>
        </div>
      )}

      {/* Doctor's note */}
      <motion.div
        className="glass p-6 flex items-start gap-4"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-11 h-11 rounded-full bg-ink/5 border hairline flex items-center justify-center shrink-0">
          <span className="serif text-sm">LK</span>
        </div>
        <div>
          <p className="serif italic text-lg leading-snug text-ink/85">
            «LDL og totalkolesterol er på vei ned — fortsett som nå. Ta vitamin D gjennom vinteren. Ellers et meget fint resultat.»
          </p>
          <p className="mono text-[0.55rem] tracking-[0.2em] uppercase text-ash mt-2.5">
            Dr. Lien Karlsen · Fastlege · 19. mai 2026
          </p>
        </div>
      </motion.div>

      <p className="mono text-[0.55rem] tracking-[0.2em] uppercase text-ash/60 text-center pt-1">
        Trykk på en markør for detaljer
      </p>
    </motion.div>
  )
}

// ─── UTVIKLING ─────────────────────────────────────────────────────────
function TrendCard({ t, i }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.35 })
  const W = 300, H = 120, P = 12
  const min = Math.min(...t.data), max = Math.max(...t.data)
  const span = max - min || 1
  const pts = t.data.map((v, j) => [
    P + (j / (t.data.length - 1)) * (W - 2 * P),
    H - P - 14 - ((v - min) / span) * (H - 2 * P - 24)
  ])
  const d = pts.map((p, j) => `${j ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')

  return (
    <motion.div
      ref={ref}
      className="glass glass-hover p-6"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.08 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium text-[0.95rem]">{t.name}</span>
        <Chip tone="green">{t.chip}</Chip>
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="num text-4xl leading-none">{t.now}</span>
        <span className="mono text-[0.55rem] text-ash">{t.unit}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <motion.path
          d={`${d} L ${pts.at(-1)[0]} ${H - P} L ${pts[0][0]} ${H - P} Z`}
          fill="rgba(196,30,58,0.06)"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
        <motion.path
          d={d} fill="none" stroke="#C41E3A" strokeWidth="1.8" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
        <motion.circle
          cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="4" fill="#15A86B"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.5, duration: 0.4 }}
        />
        <text x={P} y={H - 1} className="mono" style={{ fontSize: 8, fill: 'rgba(26,26,46,0.35)' }}>2023</text>
        <text x={W - P} y={H - 1} textAnchor="end" className="mono" style={{ fontSize: 8, fill: 'rgba(26,26,46,0.6)' }}>2026</text>
      </svg>
    </motion.div>
  )
}

function Utvikling() {
  return (
    <motion.div {...view} className="space-y-5">
      <header className="flex items-end justify-between pt-2">
        <h1 className="serif text-4xl tracking-tightest">Utvikling</h1>
        <Chip tone="ink">6 prøver</Chip>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trends.map((t, i) => <TrendCard key={t.name} t={t} i={i} />)}
      </div>
    </motion.div>
  )
}

// ─── BLODGIVNING ───────────────────────────────────────────────────────
function Blodgivning() {
  return (
    <motion.div {...view} className="space-y-5">
      <header className="flex items-end justify-between pt-2">
        <h1 className="serif text-4xl tracking-tightest">Blodgivning</h1>
        <Chip tone="blood">{user.bloodType} · Universalgiver</Chip>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {[
          [donations.totalLiters, 'liter gitt'],
          [donations.count, 'donasjoner'],
          [`≈ ${donations.lives}`, 'liv hjulpet']
        ].map(([v, l], i) => (
          <motion.div
            key={l}
            className="glass p-5 text-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 + i * 0.08 }}
          >
            <div className="num text-4xl md:text-5xl leading-none mb-2">{v}</div>
            <div className="mono text-[0.55rem] tracking-[0.2em] uppercase text-ash">{l}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          className="glass p-6 flex items-center gap-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <LiquidDrop fill={donations.yearGoal.done / donations.yearGoal.of} width={46} />
          <div>
            <div className="serif text-2xl leading-none mb-1.5">
              {donations.yearGoal.done} av {donations.yearGoal.of}
            </div>
            <div className="mono text-[0.55rem] tracking-[0.2em] uppercase text-ash">Årets mål</div>
          </div>
        </motion.div>

        <motion.div
          className="glass p-6 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
        >
          <div>
            <div className="serif text-2xl leading-none mb-1.5">
              Klar <span className="italic text-blood">{donations.nextDate}</span>
            </div>
            <div className="mono text-[0.55rem] tracking-[0.2em] uppercase text-ash">Neste mulighet</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="bg-blood text-paper rounded-full px-5 py-2.5 mono text-[0.6rem] tracking-[0.25em] uppercase shrink-0"
          >
            Bestill
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        className="glass px-6 py-5"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.46 }}
      >
        <h2 className="mono text-[0.6rem] tracking-[0.35em] uppercase text-ash mb-3">Historikk</h2>
        <div className="divide-y divide-ink/5">
          {donations.history.map((dn, i) => (
            <motion.div
              key={dn.date}
              className="flex items-center gap-4 py-3.5"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.06, duration: 0.5 }}
            >
              <MiniDrop size={13} />
              <div className="flex-1">
                <div className="text-[0.95rem] font-medium">{dn.date}</div>
                <div className="mono text-[0.55rem] tracking-[0.15em] uppercase text-ash mt-0.5">{dn.place}</div>
              </div>
              <span className="mono text-[0.6rem] text-ash">450 ml</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── PROFIL ────────────────────────────────────────────────────────────
function Profil({ onLogout }) {
  const rows = [
    { icon: 'share',    label: 'Del med legen' },
    { icon: 'download', label: 'Last ned PDF' },
    { icon: 'calendar', label: 'Bestill ny prøve' }
  ]
  return (
    <motion.div {...view} className="space-y-5">
      <header className="pt-2">
        <h1 className="serif text-4xl tracking-tightest">Profil</h1>
      </header>

      <motion.div
        className="glass p-7 flex items-center gap-5"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08 }}
      >
        <div className="w-16 h-16 rounded-full bg-blood/8 border border-blood/15 flex items-center justify-center">
          <span className="serif text-2xl text-blood">{user.initials}</span>
        </div>
        <div>
          <div className="serif text-2xl leading-none mb-2">Aksel Solberg</div>
          <div className="flex gap-2">
            <Chip tone="ink">ID {user.blodId}</Chip>
            <Chip tone="blood">{user.bloodType}</Chip>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="glass px-6 py-2"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16 }}
      >
        {rows.map((r) => (
          <button key={r.label} className="w-full flex items-center gap-4 py-4 border-b last:border-0 hairline text-left">
            <Icon name={r.icon} className="w-[1.1rem] h-[1.1rem] text-ash" />
            <span className="flex-1 text-[0.95rem]">{r.label}</span>
            <Icon name="chevron" className="w-3.5 h-3.5 text-ash/60" />
          </button>
        ))}
      </motion.div>

      <motion.button
        onClick={onLogout}
        whileTap={{ scale: 0.98 }}
        className="glass w-full px-6 py-4 flex items-center gap-4 text-blood"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.24 }}
      >
        <Icon name="logout" className="w-[1.1rem] h-[1.1rem]" />
        <span className="text-[0.95rem]">Logg ut</span>
      </motion.button>
    </motion.div>
  )
}

// ─── TAB BAR ───────────────────────────────────────────────────────────
const tabs = [
  { id: 'hjem',        label: 'Hjem',      icon: 'home' },
  { id: 'resultater',  label: 'Resultat',  icon: 'doc' },
  { id: 'utvikling',   label: 'Utvikling', icon: 'chart' },
  { id: 'blodgivning', label: 'Blod',      icon: 'drop' },
  { id: 'profil',      label: 'Profil',    icon: 'user' }
]

function TabBar({ tab, setTab }) {
  return (
    <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4">
      <nav className="glass !rounded-full px-2 py-1.5 flex items-center gap-0.5">
        {tabs.map((t) => {
          const active = tab === t.id
          return (
            <motion.button
              key={t.id}
              onClick={() => setTab(t.id)}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-col items-center gap-0.5 px-3.5 md:px-4 py-1.5 rounded-full"
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-blood/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative ${active ? 'text-blood' : 'text-ash'}`}>
                {t.icon === 'drop'
                  ? <MiniDrop size={12} color={active ? '#C41E3A' : '#797986'} className="my-[3px]" />
                  : <Icon name={t.icon} className="w-[1.15rem] h-[1.15rem]" />}
              </span>
              <span className={`relative mono text-[0.5rem] tracking-[0.12em] uppercase ${active ? 'text-blood' : 'text-ash'}`}>
                {t.label}
              </span>
            </motion.button>
          )
        })}
      </nav>
    </div>
  )
}

// ─── Ambient background ────────────────────────────────────────────────
function Ambient() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute rounded-full"
        style={{
          top: '-18%', left: '-12%', width: '55vw', height: '55vw',
          background: 'radial-gradient(circle, rgba(232,85,109,0.10), transparent 65%)',
          filter: 'blur(60px)'
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          bottom: '-22%', right: '-15%', width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(21,168,107,0.08), transparent 65%)',
          filter: 'blur(70px)'
        }}
      />
    </div>
  )
}

// ─── ROOT ──────────────────────────────────────────────────────────────
const params = new URLSearchParams(window.location.search)

export default function Blod() {
  const [authed, setAuthed] = useState(params.has('demo'))
  const [tab, setTab] = useState(params.get('tab') || 'hjem')

  useEffect(() => { window.scrollTo(0, 0) }, [tab, authed])

  const logout = () => { setAuthed(false); setTab('hjem') }

  return (
    <>
      <Ambient />
      <AnimatePresence mode="wait">
        {!authed ? (
          <motion.div key="login" className="relative z-10" exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.45 }}>
            <Login onEnter={() => setAuthed(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            className="relative z-10"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-3xl lg:max-w-5xl mx-auto px-5 md:px-8 pt-6 pb-32 min-h-[100dvh]">
              <AnimatePresence mode="wait">
                {tab === 'hjem'        && <motion.div key="hjem"><Home goTo={setTab} /></motion.div>}
                {tab === 'resultater'  && <motion.div key="res"><Resultater /></motion.div>}
                {tab === 'utvikling'   && <motion.div key="utv"><Utvikling /></motion.div>}
                {tab === 'blodgivning' && <motion.div key="blo"><Blodgivning /></motion.div>}
                {tab === 'profil'      && <motion.div key="pro"><Profil onLogout={logout} /></motion.div>}
              </AnimatePresence>
            </div>
            <TabBar tab={tab} setTab={setTab} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
