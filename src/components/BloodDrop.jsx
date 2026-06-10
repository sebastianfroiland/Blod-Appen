// Liquid-fill blood drop with a gently waving surface. `fill` is 0–1.
export default function LiquidDrop({ fill = 0.72, width = 72, className = '' }) {
  const yTop = 28, yBot = 246
  const waterY = yBot - (yBot - yTop) * fill
  const id = `clip-${Math.round(fill * 100)}`

  return (
    <div className={`softPulse ${className}`} style={{ width, aspectRatio: '200 / 260' }}>
      <svg viewBox="0 0 200 260" width="100%" height="100%">
        <defs>
          <clipPath id={id}>
            <path d="M100 8 C 60 70, 18 120, 18 170 A 82 82 0 0 0 182 170 C 182 120, 140 70, 100 8 Z" />
          </clipPath>
          <linearGradient id="liquidL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#E8556D" />
            <stop offset="100%" stopColor="#8E1428" />
          </linearGradient>
        </defs>

        <path
          d="M100 8 C 60 70, 18 120, 18 170 A 82 82 0 0 0 182 170 C 182 120, 140 70, 100 8 Z"
          fill="rgba(196,30,58,0.06)"
          stroke="rgba(196,30,58,0.35)"
          strokeWidth="1.4"
        />

        <g clipPath={`url(#${id})`}>
          <g transform={`translate(0 ${waterY})`}>
            <g className="wave">
              <path
                d="M -200 10 Q -150 0, -100 10 T 0 10 T 100 10 T 200 10 T 300 10 T 400 10
                   L 400 300 L -200 300 Z"
                fill="url(#liquidL)"
                opacity="0.96"
              />
            </g>
            <g style={{ animation: 'liquidWave 9s linear infinite reverse' }}>
              <path
                d="M -200 14 Q -150 22, -100 14 T 0 14 T 100 14 T 200 14 T 300 14 T 400 14
                   L 400 300 L -200 300 Z"
                fill="#C41E3A"
                opacity="0.5"
              />
            </g>
          </g>
        </g>

        <path d="M70 52 Q 56 100, 60 150" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.5" />
      </svg>
    </div>
  )
}

export function MiniDrop({ size = 16, className = '', color = '#C41E3A' }) {
  return (
    <svg viewBox="0 0 24 32" width={size} height={size * 32 / 24} className={className} aria-hidden>
      <path d="M12 1 C 6 11, 2 17, 2 22 A 10 10 0 0 0 22 22 C 22 17, 18 11, 12 1 Z" fill={color} />
    </svg>
  )
}
