import { useMemo } from 'react'

/** Deterministic QR-looking pattern (decorative only). */
function useQrCells(size = 21) {
  return useMemo(() => {
    const cells: Array<[number, number]> = []
    let seed = 7
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    const inFinder = (x: number, y: number) =>
      (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9)
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) if (!inFinder(x, y) && rnd() > 0.52) cells.push([x, y])
    return cells
  }, [size])
}

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="7" height="7" fill="#0B1B3A" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#0B1B3A" />
    </g>
  )
}

export function QrSticker() {
  const cells = useQrCells()
  return (
    <div className="qr-sticker" aria-label="Static UPI QR sticker">
      <div className="qr-top">Scan &amp; Pay</div>
      <svg viewBox="-1 -1 23 23" className="qr-code" aria-hidden="true">
        <rect x="-1" y="-1" width="23" height="23" fill="#fff" />
        {cells.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0B1B3A" />
        ))}
        <Finder x={0} y={0} />
        <Finder x={14} y={0} />
        <Finder x={0} y={14} />
      </svg>
      <div className="qr-bottom">Any UPI app</div>
    </div>
  )
}

/** Basic 4G Soundbox: speaker grille, no screen. Pulses while speaking. */
export function Soundbox({ speaking }: { speaking: boolean }) {
  const dots = []
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 5; c++) {
      const dx = c - 2
      const dy = r - 2
      if (dx * dx + dy * dy <= 5) dots.push(<circle key={`${r}${c}`} cx={30 + dx * 8} cy={62 + dy * 8} r="2.6" />)
    }
  return (
    <div className={`soundbox-wrap${speaking ? ' speaking' : ''}`} aria-label={speaking ? 'Soundbox speaking' : 'Soundbox'}>
      <div className="waves" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <svg viewBox="0 0 60 110" className="soundbox" aria-hidden="true">
        <defs>
          <linearGradient id="sbBody" x1="0" x2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E6F2FA" />
          </linearGradient>
        </defs>
        <rect x="2" y="4" width="56" height="102" rx="12" fill="url(#sbBody)" stroke="#0B3A7A" strokeWidth="2" />
        <path d="M2 30 V16 Q2 4 14 4 H46 Q58 4 58 16 V30 Z" fill="#002E6E" />
        <text x="12" y="22" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif">
          4G
        </text>
        <circle cx="46" cy="18" r="3.2" className="sb-led" />
        <g fill="#0B3A7A" opacity="0.75">{dots}</g>
        <rect x="14" y="88" width="32" height="6" rx="3" fill="#00BAF2" opacity="0.9" />
        <text x="30" y="102" textAnchor="middle" fontSize="5.5" fill="#0B3A7A" fontFamily="Inter, sans-serif" fontWeight="600">
          SOUNDBOX
        </text>
      </svg>
    </div>
  )
}
