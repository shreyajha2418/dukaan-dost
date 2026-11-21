import { CancelledError, player } from '../audio/AudioPlayer'
import { bubbleText } from '../audio/lines'
import { pay, say, setDate, tapPhone, wait, type RunCtx } from '../world/actions'
import { PEOPLE, type PersonId } from '../world/people'
import { initialWorld, store } from '../world/store'
import { STEPS } from './steps'
import type { StoryAction, StoryStep } from './types'

const DEFAULT_HOLD = 2500

function person(id: PersonId) {
  return PEOPLE[id]
}

async function runAction(a: StoryAction, ctx: RunCtx): Promise<void> {
  switch (a.do) {
    case 'date':
      setDate(a.date)
      return
    case 'merchant':
      store.set((w) => ({ merchant: { ...w.merchant, ...a.patch } }))
      return
    case 'counter':
      store.set((w) => ({ counter: { ...w.counter, front: a.front, queue: a.queue ?? null } }))
      return
    case 'thought':
      store.set((w) => ({ counter: { ...w.counter, thoughts: { ...w.counter.thoughts, [a.who]: a.text } } }))
      return
    case 'clearThoughts':
      store.set((w) => ({ counter: { ...w.counter, thoughts: {} } }))
      return
    case 'phone':
      store.set((w) => ({
        phone: {
          person: a.who ? person(a.who) : null,
          amount: a.amount ?? 0,
          status: 'idle',
          notification: a.who === w.phone.person?.id ? w.phone.notification : null,
          note: a.note ?? null,
        },
      }))
      return
    case 'pay':
      store.set((w) => ({ phone: { ...w.phone, notification: null } }))
      await pay(person(a.who), a.amount, ctx)
      return
    case 'tap':
      await tapPhone(ctx)
      return
    case 'voice': {
      // A person speaks out loud: their thought bubble shows the words, the Soundbox stays quiet.
      store.set((w) => ({
        counter: { ...w.counter, thoughts: { ...w.counter.thoughts, [a.who]: bubbleText(a.key) } },
        speaker: a.who,
      }))
      try {
        if (!ctx.instant) await player.play([a.key], {}, ctx.gen)
      } finally {
        if (ctx.gen === player.token()) store.set({ speaker: null })
      }
      return
    }
    case 'say':
      await say(a.keys, ctx, { silent: a.silent, label: a.label ?? null })
      return
    case 'log':
      store.addLog([{ kind: a.kind, text: a.text }])
      return
    case 'seed':
      store.set((w) => ({
        shop: {
          ...w.shop,
          customers: {
            ...w.shop.customers,
            [a.upiId]: { visits: a.visits, lastVisitDate: a.lastVisitDate, rewarded: false, rewardPaused: false },
          },
        },
      }))
      return
    case 'capUsed':
      store.set((w) => ({ shop: { ...w.shop, rewardsPaid: a.amount, rewardsSent: a.rewardsSent } }))
      return
    case 'scene':
      store.set({ scene: a.scene })
      return
    case 'wait':
      await wait(a.ms, ctx)
      return
  }
}

/** Minimum time on screen so the caption can be read. */
function readingTime(step: StoryStep): number {
  return 1500 + step.caption.length * 55
}

async function runStep(step: StoryStep, ctx: RunCtx): Promise<void> {
  // Each step starts with a clean counter: no old thoughts, bubbles or notifications.
  store.set((w) => ({
    counter: { ...w.counter, thoughts: {} },
    bubble: { lines: [], speaking: false, label: null },
    phone: { ...w.phone, status: 'idle', notification: null, note: null },
  }))
  const started = Date.now()
  for (const a of step.actions) await runAction(a, ctx)
  if (ctx.instant || step.end) return
  const hold = Math.max(step.hold ?? DEFAULT_HOLD, readingTime(step) - (Date.now() - started))
  await wait(hold, ctx)
}

/** Jump to a step: rebuild state from scratch silently, then play on from there. */
export async function goTo(index: number): Promise<void> {
  const target = Math.max(0, Math.min(STEPS.length - 1, index))
  player.stop()
  const gen = player.token()
  const muted = store.get().muted
  store.set({ ...initialWorld('story', muted), stepIndex: target })
  try {
    for (let i = 0; i < target; i++) await runStep(STEPS[i], { instant: true, gen })
    await playFrom(target, gen)
  } catch (e) {
    if (!(e instanceof CancelledError)) console.error(e)
  }
}

/** Play steps live, auto-advancing, until the end card or a cancel. */
async function playFrom(index: number, gen: number): Promise<void> {
  for (let i = index; i < STEPS.length; i++) {
    if (gen !== player.token()) return
    store.set({ stepIndex: i, paused: false })
    await runStep(STEPS[i], { instant: false, gen })
  }
}

export function pause(): void {
  player.pause()
  store.set({ paused: true })
}

export function resume(): void {
  player.resume()
  store.set({ paused: false })
}

export function stopStory(): void {
  player.stop()
}

export const STEP_COUNT = STEPS.length
export { STEPS }
