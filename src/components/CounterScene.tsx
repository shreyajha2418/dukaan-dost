import type { World } from '../world/store'
import type { PersonId } from '../world/people'
import { Character } from './Character'
import { QrSticker, Soundbox } from './Soundbox'

const PACK_COLORS = ['#F2C14E', '#E85D5D', '#3FA7D6', '#59C38A', '#F08A4B', '#9B6DD6', '#F7E1A0', '#D94F70']

function Shelves({ evening }: { evening: boolean }) {
  const rows = [38, 92, 146]
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="shelves" aria-hidden="true">
      <rect width="400" height="200" fill={evening ? '#3B3350' : '#FBEBD1'} />
      <rect x="0" y="0" width="400" height="10" fill={evening ? '#2A2440' : '#E9C796'} />
      {rows.map((y, ri) => (
        <g key={y}>
          {Array.from({ length: 16 }).map((_, i) => {
            const h = 22 + ((i * 7 + ri * 5) % 4) * 4
            const w = 18 + ((i + ri) % 3) * 3
            const x = 6 + i * 24.5
            const c = PACK_COLORS[(i + ri * 3) % PACK_COLORS.length]
            return (
              <g key={i} opacity={evening ? 0.55 : 1}>
                <rect x={x} y={y - h} width={w} height={h} rx="2" fill={c} />
                <rect x={x + 3} y={y - h + 5} width={w - 6} height="5" rx="1" fill="#fff" opacity="0.6" />
              </g>
            )
          })}
          <rect x="0" y={y} width="400" height="7" fill={evening ? '#5A4636' : '#A86E3C'} />
        </g>
      ))}
    </svg>
  )
}

function Thought({ text, side = 'right', speaking }: { text?: string; side?: 'left' | 'right'; speaking?: boolean }) {
  if (!text) return null
  return (
    <div className={`thought thought-${side}${speaking ? ' spoken' : ''}`} role="note">
      <span className="thought-text">
        {speaking ? '🗣️' : '💭'} {text}
      </span>
    </div>
  )
}

function Customer({ id, thoughts, queue }: { id: PersonId; thoughts: World['counter']['thoughts']; queue?: boolean }) {
  return (
    <div className={`customer${queue ? ' in-queue' : ''}`} key={id}>
      <Thought text={thoughts[id]} side={queue ? 'left' : 'right'} />
      <Character id={id} className="person" title={id} />
    </div>
  )
}

export function CounterScene({ world }: { world: World }) {
  const { counter, bubble, scene } = world
  const evening = scene === 'evening'
  return (
    <section className="panel counter-panel" aria-label="Kirana counter">
      <div className="panel-label">Kirana counter</div>
      <div className={`scene${evening ? ' evening' : ''}`}>
        <Shelves evening={evening} />
        <div className="shop-board">Ramesh Kirana Store</div>
        {evening && <div className="shutter" aria-hidden="true" />}
        <div className="shopkeeper">
          <Thought text={counter.thoughts.ramesh} side="left" speaking={world.speaker === 'ramesh'} />
          <Character id="ramesh" className="person" title="Ramesh, the shopkeeper" />
        </div>
        <div className="customers">
          {counter.queue && <Customer id={counter.queue} thoughts={counter.thoughts} queue />}
          {counter.front && <Customer id={counter.front} thoughts={counter.thoughts} />}
        </div>
        <div className="counter-top">
          <div className="counter-items">
            <Soundbox speaking={bubble.speaking} />
            <QrSticker />
          </div>
        </div>
      </div>
      <div className={`speech${bubble.speaking ? ' live' : ''}${bubble.lines.length ? '' : ' empty'}`} aria-live="polite">
        <div className="speech-head">
          <span>🔊 Soundbox says</span>
          {bubble.label && <span className="speech-label">{bubble.label}</span>}
        </div>
        {bubble.lines.length ? (
          bubble.lines.map((l, i) => (
            <p key={i} className="speech-line">
              “{l}”
            </p>
          ))
        ) : (
          <p className="speech-line muted">…waiting for a payment</p>
        )}
      </div>
    </section>
  )
}
