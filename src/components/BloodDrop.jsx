import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

// Dark-mode liquid-fill blood drop. fill: 0–100.
export default function BloodDrop({ fill = 80, size = 320, label, sublabel, pulse = true, active = true }) {
  const [animatedFill, setAnimatedFill] = useState(0)
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setAnimatedFill(fill), 300)
    return () => clearTimeout(t)
  }, [fill, active])

  const yTop = 30, yBot = 240
  const waterY = yBot - (yBot - yTop) * (animatedFill / 100)

  return (
    <div className="relative inline-block" style={{ width: size, height: size * 260 / 200 }}>
      <motion.svg
        viewBox="0 0 200 260"
        width={size}
        height={size * 260 / 200}
        className={pulse ? 'pulseDrop' : ''}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <defs>
          <clipPath id="dropClip">
            <path d="M100 8 C 60 70, 18 120, 18 170 A 82 82 0 0 0 182 170 C 182 120, 140 70, 100 8 Z" />
          </clipPath>
          <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#FF3355" />
            <stop offset="100%" stopColor="#8E1428" />
          </linearGradient>
          <radialGradient id="sheen" cx="0.3" cy="0.25" r="0.55">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Shell — subtle outline on dark */}
        <path
          d="M100 8 C 60 70, 18 120, 18 170 A 82 82 0 0 0 182 170 C 182 120, 140 70, 100 8 Z"
          fill="rgba(255,51,85,0.04)"
          stroke="rgba(255,51,85,0.35)"
          strokeWidth="1.2"
        />

        {/* Liquid */}
        <g clipPath="url(#dropClip)" filter="url(#glow)">
          <motion.g
            animate={{ y: waterY }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <g className="wave">
              <path
                d="M -200 10 Q -150 0, -100 10 T 0 10 T 100 10 T 200 10 T 300 10 T 400 10
                   L 400 260 L -200 260 Z"
                fill="url(#liquid)"
                opacity="0.95"
              />
            </g>
            <g style={{ animation: 'liquidWave 9s linear infinite reverse' }}>
              <path
                d="M -200 14 Q -150 22, -100 14 T 0 14 T 100 14 T 200 14 T 300 14 T 400 14
                   L 400 260 L -200 260 Z"
                fill="#FF3355"
                opacity="0.5"
              />
            </g>
          </motion.g>
          <ellipse cx="70" cy="80" rx="38" ry="58" fill="url(#sheen)" />
        </g>

        {/* Inner highlight */}
        <path d="M70 50 Q 56 100, 60 150" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.35" />
      </motion.svg>

      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {label && (
            <motion.div
              className="num text-bone text-[6rem] leading-none"
              style={{ textShadow: '0 4px 28px rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.9 }}
            >
              {label}
            </motion.div>
          )}
          {sublabel && (
            <motion.div
              className="mono text-bone/70 text-[0.7rem] tracking-[0.3em] uppercase mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.9 }}
            >
              {sublabel}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

export function MiniDrop({ size = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 32" width={size} height={size * 32 / 24} className={className} aria-hidden>
      <path d="M12 1 C 6 11, 2 17, 2 22 A 10 10 0 0 0 22 22 C 22 17, 18 11, 12 1 Z" fill="#FF3355" />
    </svg>
  )
}
