import type { StoryStep } from '../story/types'

export function CaptionBar({ step, index, total }: { step: StoryStep; index: number; total: number }) {
  return (
    <div className="caption" aria-live="polite">
      <div className="caption-meta">
        <span className="caption-step">
          Step {index + 1} of {total}
        </span>
        {step.rule && <span className="rule-chip">{step.rule}</span>}
      </div>
      <p className="caption-text">{step.caption}</p>
    </div>
  )
}

export function StoryControls({
  index,
  total,
  paused,
  onBack,
  onTogglePause,
  onNext,
  onReplay,
  onFreePlay,
}: {
  index: number
  total: number
  paused: boolean
  onBack: () => void
  onTogglePause: () => void
  onNext: () => void
  onReplay: () => void
  onFreePlay: () => void
}) {
  return (
    <div className="controls" role="toolbar" aria-label="Story controls">
      <button type="button" onClick={onBack} disabled={index === 0} aria-label="Previous step">
        ◀ <span className="btn-text">Back</span>
      </button>
      <button type="button" onClick={onTogglePause} aria-label={paused ? 'Play' : 'Pause'} className="primary">
        {paused ? '▶' : '❚❚'} <span className="btn-text">{paused ? 'Play' : 'Pause'}</span>
      </button>
      <button type="button" onClick={onNext} disabled={index >= total - 1} aria-label="Next step">
        <span className="btn-text">Next</span> ▶
      </button>
      <button type="button" onClick={onReplay} aria-label="Replay this step">
        ↻ <span className="btn-text">Replay</span>
      </button>
      <div className="progress" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={i < index ? 'done' : i === index ? 'current' : ''} />
        ))}
      </div>
      <button type="button" onClick={onFreePlay} className="ghost">
        Free play
      </button>
    </div>
  )
}

export function EndCard({ onReplay, onFreePlay }: { onReplay: () => void; onFreePlay: () => void }) {
  const cards = [
    {
      icon: '🏪',
      who: 'Merchant',
      points: ['More repeat visits from shoppers who split with quick-commerce', 'Nothing to track: one opt-in, zero typing'],
    },
    {
      icon: '🍪',
      who: 'Brand',
      points: ['Name heard at the moment of purchase, at the shelf', 'Pay only for rewards actually earned; lift measured vs control shops'],
    },
    {
      icon: '💙',
      who: 'Paytm',
      points: ['Payments stay on the Paytm QR and Soundbox', 'A new ad product for FMCG brands', 'More reasons to pay with Paytm UPI'],
    },
  ]
  return (
    <div className="endcard" role="dialog" aria-label="Summary">
      <h2>Who wins with Dukaan Dost</h2>
      <div className="end-cards">
        {cards.map((c) => (
          <div key={c.who} className="end-card">
            <div className="end-icon" aria-hidden="true">
              {c.icon}
            </div>
            <h3>{c.who}</h3>
            <ul>
              {c.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="end-actions">
        <button type="button" className="big secondary" onClick={onReplay}>
          ↻ Replay story
        </button>
        <button type="button" className="big" onClick={onFreePlay}>
          Try it yourself (Free play)
        </button>
      </div>
    </div>
  )
}
