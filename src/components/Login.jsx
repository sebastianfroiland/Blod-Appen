import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { MiniDrop } from './BloodDrop.jsx'

export default function Login({ onEnter }) {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = (e) => {
    e?.preventDefault()
    if (!code.trim() && !e?.bankid) return
    setSubmitting(true)
    setTimeout(() => onEnter(), 900)
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative floating drops in background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[12%] left-[8%] drift" style={{ animationDelay: '0s' }}>
          <MiniDrop size={14} className="opacity-25" />
        </div>
        <div className="absolute top-[22%] right-[14%] drift" style={{ animationDelay: '1.5s' }}>
          <MiniDrop size={10} className="opacity-20" />
        </div>
        <div className="absolute bottom-[18%] left-[20%] drift" style={{ animationDelay: '2.2s' }}>
          <MiniDrop size={18} className="opacity-15" />
        </div>
        <div className="absolute bottom-[10%] right-[10%] drift" style={{ animationDelay: '0.8s' }}>
          <MiniDrop size={12} className="opacity-20" />
        </div>
      </div>

      {/* Top brand */}
      <motion.div
        className="absolute top-8 left-8 flex items-center gap-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <MiniDrop size={16} />
        <span className="mono text-[0.7rem] tracking-[0.3em] uppercase text-ink/70">Blod</span>
      </motion.div>
      <motion.div
        className="absolute top-8 right-8 mono text-[0.65rem] tracking-[0.25em] uppercase text-ink/50"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
      >
        v2.4 — 2026
      </motion.div>

      <AnimatePresence>
        {!submitting && (
          <motion.div
            key="login-card"
            className="relative w-full max-w-md"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Animated big drop */}
            <motion.div
              className="flex justify-center mb-10"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <div className="drift">
                <svg viewBox="0 0 100 130" width="74" height="96">
                  <defs>
                    <linearGradient id="loginDrop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E03A56" />
                      <stop offset="100%" stopColor="#8E1428" />
                    </linearGradient>
                  </defs>
                  <path d="M50 4 C 30 36, 8 60, 8 85 A 42 42 0 0 0 92 85 C 92 60, 70 36, 50 4 Z" fill="url(#loginDrop)" />
                  <path d="M30 28 Q 22 52, 24 76" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55" />
                </svg>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              className="text-center mb-1"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="serif text-[3.4rem] leading-[0.95] tracking-tightest text-ink">
                Velkommen <span className="italic text-crimson">tilbake</span>
              </h1>
            </motion.div>
            <motion.p
              className="text-center text-ash text-[0.95rem] mb-10 max-w-[28ch] mx-auto leading-relaxed"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
            >
              Logg inn for å se dine siste blodprøvesvar.
            </motion.p>

            {/* Form */}
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
            >
              <label className="block mono text-[0.65rem] tracking-[0.25em] uppercase text-ink/55 mb-3">
                Prøvekode
              </label>
              <div className="relative">
                <input
                  autoFocus
                  inputMode="text"
                  spellCheck={false}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="FÜ — — — — —"
                  className="w-full bg-transparent border-b border-ink/25 focus:border-crimson outline-none py-3 mono text-lg tracking-[0.3em] text-ink placeholder:text-ink/25 transition-colors"
                  maxLength={14}
                />
                <motion.div
                  className="absolute left-0 right-0 -bottom-px h-px bg-crimson origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: code ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              <button
                type="submit"
                disabled={!code.trim()}
                className="mt-8 w-full bg-ink text-paper py-4 rounded-full text-sm tracking-[0.15em] uppercase mono transition-all hover:bg-crimson disabled:opacity-30 disabled:hover:bg-ink"
              >
                Fortsett
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-7">
                <div className="flex-1 h-px bg-ink/15" />
                <span className="mono text-[0.6rem] tracking-[0.3em] uppercase text-ink/45">eller</span>
                <div className="flex-1 h-px bg-ink/15" />
              </div>

              <button
                type="button"
                onClick={() => { setSubmitting(true); setTimeout(() => onEnter(), 900) }}
                className="w-full bg-transparent border border-ink/20 hover:border-ink py-4 rounded-full text-sm tracking-[0.15em] uppercase mono text-ink transition-all flex items-center justify-center gap-3"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-crimson" />
                Logg inn med BankID
              </button>

              <p className="text-center text-[0.72rem] text-ink/45 mt-8 leading-relaxed mono tracking-wide">
                Ved innlogging godtar du <span className="underline decoration-ink/30 underline-offset-2">personvern</span>vilkårene.
              </p>
            </motion.form>
          </motion.div>
        )}

        {submitting && (
          <motion.div
            key="loading"
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            >
              <MiniDrop size={36} />
            </motion.div>
            <p className="mono text-[0.7rem] tracking-[0.3em] uppercase text-ash">Henter prøvesvar…</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-0 right-0 text-center mono text-[0.6rem] tracking-[0.3em] uppercase text-ink/35">
        Fürst Medisinsk Laboratorium  ·  Oslo
      </div>
    </div>
  )
}
