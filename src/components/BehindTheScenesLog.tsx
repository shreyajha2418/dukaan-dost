import type { LogEntry } from '../world/store'

const ICONS: Record<LogEntry['kind'], string> = {
  counted: '✔',
  reward: '₹',
  skip: '–',
  excluded: '⛔',
  cap: '⏸',
  month: '📅',
  info: 'ℹ',
}

function shortDate(d: string) {
  return new Date(`${d}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function BehindTheScenesLog({ log }: { log: LogEntry[] }) {
  return (
    <div className="log" aria-label="Behind the scenes log">
      <div className="log-head">
        <span>Behind the scenes</span>
        <small>what Paytm decides, newest first</small>
      </div>
      <ol className="log-list" aria-live="polite">
        {log.length === 0 && <li className="log-empty">Nothing yet. Payments will show up here.</li>}
        {log.map((e) => (
          <li key={e.id} className={`log-line k-${e.kind}`}>
            <span className="log-icon" aria-hidden="true">
              {ICONS[e.kind]}
            </span>
            <span className="log-text">{e.text}</span>
            <span className="log-date">{shortDate(e.date)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
