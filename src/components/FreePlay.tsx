import { useState } from 'react'
import { player } from '../audio/AudioPlayer'
import { PRESET_AMOUNTS } from '../audio/lines'
import { normalizeUpi } from '../logic/rules'
import { pay, setDate } from '../world/actions'
import { customPerson, FREE_PLAY_PEOPLE, type Person } from '../world/people'
import { freePlayWorld, store, type World } from '../world/store'

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function firstOfNextMonth(date: string): string {
  const [y, m] = date.split('-').map(Number)
  const ny = m === 12 ? y + 1 : y
  const nm = m === 12 ? 1 : m + 1
  return `${ny}-${String(nm).padStart(2, '0')}-01`
}

export function useFreePlay(world: World) {
  const [custom, setCustom] = useState('')
  const busy = world.busy

  const selectPerson = (p: Person) => {
    store.set((w) => ({
      phone: { ...w.phone, person: p, status: 'idle', notification: null, note: null },
      counter: { ...w.counter, front: p.role === 'merchant' ? null : p.id, thoughts: {} },
    }))
  }

  const applyCustom = () => {
    const id = normalizeUpi(custom)
    if (!/^[a-z0-9._-]+@[a-z0-9]+$/.test(id)) return
    selectPerson(customPerson(id))
  }

  const setAmount = (amount: number) =>
    store.set((w) => ({ phone: { ...w.phone, amount, status: 'idle', notification: null } }))

  const doPay = async () => {
    const w = store.get()
    if (w.busy || !w.phone.person) return
    store.set({ busy: true })
    try {
      await pay(w.phone.person, w.phone.amount, { instant: false, gen: player.token() })
    } catch {
      /* cancelled */
    } finally {
      store.set({ busy: false })
    }
  }

  const nextDay = () => {
    setDate(addDays(store.get().date, 1))
    store.set((w) => ({ phone: { ...w.phone, status: 'idle', notification: null }, bubble: { lines: [], speaking: false, label: null } }))
  }
  const nextMonth = () => {
    setDate(firstOfNextMonth(store.get().date))
    store.set((w) => ({ phone: { ...w.phone, status: 'idle', notification: null }, bubble: { lines: [], speaking: false, label: null } }))
  }
  const reset = () => {
    player.stop()
    store.set(freePlayWorld(store.get().muted))
  }

  const phoneControls = (
    <div className="fp-controls">
      <div className="fp-label">Who is paying?</div>
      <div className="chips" role="radiogroup" aria-label="Customer">
        {FREE_PLAY_PEOPLE.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={world.phone.person?.upiId === p.upiId}
            className={`chip${world.phone.person?.upiId === p.upiId ? ' on' : ''}`}
            onClick={() => selectPerson(p)}
            disabled={busy}
            title={p.upiId}
          >
            {p.role === 'merchant' ? 'Ramesh (owner)' : p.name}
          </button>
        ))}
      </div>
      <form
        className="fp-custom"
        onSubmit={(e) => {
          e.preventDefault()
          applyCustom()
        }}
      >
        <input
          aria-label="Or type a UPI ID"
          placeholder="or type a UPI ID, e.g. sita@ptaxis"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          disabled={busy}
        />
        <button type="submit" className="chip" disabled={busy}>
          Use
        </button>
      </form>
      <div className="fp-label">Amount</div>
      <div className="chips amounts" role="radiogroup" aria-label="Amount">
        {PRESET_AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={world.phone.amount === a}
            className={`chip${world.phone.amount === a ? ' on' : ''}`}
            onClick={() => setAmount(a)}
            disabled={busy}
          >
            ₹{a}
          </button>
        ))}
      </div>
    </div>
  )

  return { phoneControls, doPay, nextDay, nextMonth, reset, busy }
}

export function FreePlayBar({
  world,
  onNextDay,
  onNextMonth,
  onReset,
  onStory,
  busy,
}: {
  world: World
  onNextDay: () => void
  onNextMonth: () => void
  onReset: () => void
  onStory: () => void
  busy: boolean
}) {
  const label = new Date(`${world.date}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return (
    <div className="caption freeplay-bar">
      <div className="caption-meta">
        <span className="caption-step">Free play</span>
        <span className="rule-chip">Same rules, same audio</span>
      </div>
      <p className="caption-text">
        Pick who pays and how much on the phone, then tap <strong>Scan &amp; Pay</strong>. Try ₹40, paying twice a day, the
        owner's ID, or a Paytm handle (@ptyes, @ptaxis…).
      </p>
      <div className="controls" role="toolbar" aria-label="Free play controls">
        <span className="date-pill" aria-live="polite">
          📅 {label}
        </span>
        <button type="button" onClick={onNextDay} disabled={busy}>
          Next day
        </button>
        <button type="button" onClick={onNextMonth} disabled={busy}>
          Next month
        </button>
        <button type="button" onClick={onReset}>
          Reset demo
        </button>
        <button type="button" className="ghost" onClick={onStory}>
          Watch the story
        </button>
      </div>
    </div>
  )
}
