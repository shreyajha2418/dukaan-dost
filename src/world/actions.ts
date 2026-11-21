import { CancelledError, player } from '../audio/AudioPlayer'
import { bubbleText } from '../audio/lines'
import { evaluatePayment, rollover, rupees, type Evaluation } from '../logic/rules'
import type { Person } from './people'
import { store } from './store'

export interface RunCtx {
  /** Instant mode: rebuild state silently (no audio, no waits). */
  instant: boolean
  gen: number
}

export async function wait(ms: number, ctx: RunCtx): Promise<void> {
  if (ctx.instant) {
    if (ctx.gen !== player.token()) throw new CancelledError()
    return
  }
  await player.sleep(ms, ctx.gen)
}

/** Play Soundbox lines with the speech bubble in sync. */
export async function say(
  keys: string[],
  ctx: RunCtx,
  opts: { silent?: boolean; label?: string | null; onLine?: (key: string) => void } = {},
): Promise<void> {
  const label = opts.label ?? null
  if (ctx.instant || opts.silent) {
    keys.forEach((k) => opts.onLine?.(k))
    store.set({ bubble: { lines: keys.map(bubbleText), speaking: false, label } })
    return
  }
  store.set({ bubble: { lines: [], speaking: false, label } })
  await player.play(
    keys,
    {
      onLine: (key, text, i) => {
        opts.onLine?.(key)
        store.set((w) => ({ bubble: { ...w.bubble, lines: i === 0 ? [text] : [...w.bubble.lines, text] } }))
      },
      onSpeakingChange: (speaking) => store.set((w) => ({ bubble: { ...w.bubble, speaking } })),
    },
    ctx.gen,
  )
}

function rewardNotification(ev: Evaluation): string | null {
  if (!ev.reward) return null
  return `${rupees(ev.reward.amount)} cashback received${ev.reward.paytmBonus ? ' (Paytm UPI bonus)' : ''} · from ${ev.reward.fundingLabel}, via Dukaan Dost`
}

/** Phone tap animation without the rules engine (used for the scripted brand moment). */
export async function tapPhone(ctx: RunCtx): Promise<void> {
  store.set((w) => ({ phone: { ...w.phone, status: 'paying', notification: null } }))
  await wait(700, ctx)
  store.set((w) => ({ phone: { ...w.phone, status: 'paid' } }))
}

/** Full payment: phone tap → evaluatePayment → log → Soundbox audio. */
export async function pay(person: Person, amount: number, ctx: RunCtx): Promise<Evaluation> {
  store.set((w) => ({ phone: { ...w.phone, person, amount } }))
  await tapPhone(ctx)
  const w = store.get()
  const ev = evaluatePayment(w.shop, { upiId: person.upiId, amount, date: w.date })
  store.set({ shop: ev.newState })
  store.addLog(ev.logLines)
  const note = rewardNotification(ev)
  await say(ev.audioKeys, ctx, {
    onLine: (key) => {
      if (key.startsWith('visit3') && note) store.set((s) => ({ phone: { ...s.phone, notification: note } }))
    },
  })
  return ev
}

/** Change the date, applying the month rollover (rule 7) immediately. */
export function setDate(date: string): void {
  const w = store.get()
  const r = rollover(w.shop, date)
  store.set({ date, shop: r.state })
  store.addLog(r.logLines)
}
