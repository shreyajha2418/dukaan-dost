import { describe, expect, it } from 'vitest'
import {
  MEDIUM_SHOP_CONFIG,
  createShopState,
  evaluatePayment,
  isPaytmHandle,
  type Payment,
  type ShopState,
} from './rules'

const start = () => createShopState('2026-11-01')

/** Run a list of payments, returning the final state and every evaluation. */
function run(state: ShopState, payments: Payment[]) {
  const results = []
  let s = state
  for (const p of payments) {
    const r = evaluatePayment(s, p)
    results.push(r)
    s = r.newState
  }
  return { state: s, results }
}

const pay = (upiId: string, amount: number, date: string): Payment => ({ upiId, amount, date })

describe('Rule 1: ₹50 minimum', () => {
  it('does not count ₹40 but still plays the payment alert', () => {
    const r = evaluatePayment(start(), pay('meena@okaxis', 40, '2026-11-03'))
    expect(r.counted).toBe(false)
    expect(r.reward).toBeNull()
    expect(r.audioKeys).toEqual(['alert_40'])
    expect(r.logLines.at(-1)?.text).toBe('meena@okaxis · ₹40 is below ₹50 minimum → not counted')
    expect(r.newState.customers['meena@okaxis']).toBeUndefined()
  })

  it('counts exactly ₹50', () => {
    const r = evaluatePayment(start(), pay('meena@okaxis', 50, '2026-11-03'))
    expect(r.counted).toBe(true)
    expect(r.audioKeys).toEqual(['alert_50', 'visit1'])
  })

  it('counts ₹49.99 as below minimum', () => {
    expect(evaluatePayment(start(), pay('a@ybl', 49.99, '2026-11-03')).counted).toBe(false)
  })
})

describe('Rule 2: one counted visit per day', () => {
  it('does not count a 2nd payment on the same day', () => {
    const { results, state } = run(start(), [
      pay('riya@ybl', 120, '2026-11-03'),
      pay('riya@ybl', 120, '2026-11-03'),
    ])
    expect(results[0].counted).toBe(true)
    expect(results[1].counted).toBe(false)
    expect(results[1].audioKeys).toEqual(['alert_120'])
    expect(results[1].logLines.at(-1)?.text).toBe('riya@ybl · 2nd payment today → not counted')
    expect(state.customers['riya@ybl'].visits).toBe(1)
  })

  it('counts again on the next day', () => {
    const { results } = run(start(), [pay('riya@ybl', 120, '2026-11-03'), pay('riya@ybl', 120, '2026-11-04')])
    expect(results[1].counted).toBe(true)
    expect(results[1].audioKeys).toEqual(['alert_120', 'visit2'])
  })

  it('a below-minimum payment does not use up the day', () => {
    const { results } = run(start(), [pay('riya@ybl', 40, '2026-11-03'), pay('riya@ybl', 120, '2026-11-03')])
    expect(results[1].counted).toBe(true)
  })

  it('treats UPI IDs case-insensitively', () => {
    const { results } = run(start(), [pay('Riya@YBL', 120, '2026-11-03'), pay('riya@ybl ', 120, '2026-11-03')])
    expect(results[1].counted).toBe(false)
  })
})

describe('Rule 3: merchant and staff IDs never count', () => {
  it("excludes the merchant's own ID", () => {
    const r = evaluatePayment(start(), pay('ramesh@ptyes', 120, '2026-11-03'))
    expect(r.counted).toBe(false)
    expect(r.audioKeys).toEqual(['alert_120'])
    expect(r.logLines.at(-1)).toEqual({ kind: 'excluded', text: "ramesh@ptyes is the merchant's own ID → excluded" })
  })

  it('excludes staff IDs', () => {
    const r = evaluatePayment(start(), pay('sunil@okicici', 200, '2026-11-03'))
    expect(r.counted).toBe(false)
    expect(r.logLines.at(-1)?.kind).toBe('excluded')
  })

  it('never rewards the merchant even after 3 days', () => {
    const { results, state } = run(start(), [
      pay('ramesh@ptyes', 120, '2026-11-03'),
      pay('ramesh@ptyes', 120, '2026-11-04'),
      pay('ramesh@ptyes', 120, '2026-11-05'),
    ])
    expect(results.every((r) => !r.counted && !r.reward)).toBe(true)
    expect(state.rewardsPaid).toBe(0)
  })
})

describe('Rule 4: reward on the 3rd visit, once a month', () => {
  it('speaks visit1, visit2, then rewards ₹10 on visit 3', () => {
    const { results, state } = run(start(), [
      pay('riya@ybl', 120, '2026-11-03'),
      pay('riya@ybl', 120, '2026-11-07'),
      pay('riya@ybl', 120, '2026-11-12'),
    ])
    expect(results.map((r) => r.audioKeys)).toEqual([
      ['alert_120', 'visit1'],
      ['alert_120', 'visit2'],
      ['alert_120', 'visit3'],
    ])
    expect(results[0].logLines[0].text).toBe('riya@ybl · ₹120 · visit counted (1 of 3)')
    expect(results[2].reward).toEqual({ amount: 10, paytmBonus: false, fundingLabel: 'Parle-G pool' })
    expect(results[2].logLines.at(-1)?.text).toBe('riya@ybl · visit 3 → ₹10 reward sent (Parle-G pool)')
    expect(state.rewardsPaid).toBe(10)
    expect(state.rewardsSent).toBe(1)
  })

  it('does not reward a 4th or 5th visit in the same month', () => {
    const { results, state } = run(start(), [
      pay('riya@ybl', 120, '2026-11-03'),
      pay('riya@ybl', 120, '2026-11-04'),
      pay('riya@ybl', 120, '2026-11-05'),
      pay('riya@ybl', 120, '2026-11-06'),
      pay('riya@ybl', 120, '2026-11-07'),
    ])
    expect(results[3].counted).toBe(true)
    expect(results[3].reward).toBeNull()
    expect(results[3].audioKeys).toEqual(['alert_120'])
    expect(results[4].reward).toBeNull()
    expect(state.rewardsPaid).toBe(10)
  })

  it('tracks customers independently', () => {
    const { state } = run(start(), [
      pay('riya@ybl', 120, '2026-11-03'),
      pay('meena@okaxis', 120, '2026-11-03'),
    ])
    expect(state.customers['riya@ybl'].visits).toBe(1)
    expect(state.customers['meena@okaxis'].visits).toBe(1)
  })
})

describe('Rule 5: ₹15 for Paytm UPI handles', () => {
  it.each(['ptyes', 'ptaxis', 'pthdfc', 'ptsbi'])('recognises @%s', (h) => {
    expect(isPaytmHandle(`arjun@${h}`)).toBe(true)
  })

  it('does not treat other handles as Paytm', () => {
    expect(isPaytmHandle('riya@ybl')).toBe(false)
    expect(isPaytmHandle('meena@okaxis')).toBe(false)
    expect(isPaytmHandle('paytm')).toBe(false)
  })

  it('rewards ₹15 and speaks the Paytm line', () => {
    const { results, state } = run(start(), [
      pay('arjun@ptyes', 120, '2026-11-03'),
      pay('arjun@ptyes', 120, '2026-11-04'),
      pay('arjun@ptyes', 120, '2026-11-05'),
    ])
    expect(results[2].reward).toEqual({ amount: 15, paytmBonus: true, fundingLabel: 'Parle-G pool' })
    expect(results[2].audioKeys).toEqual(['alert_120', 'visit3_paytm'])
    expect(results[2].logLines.at(-1)?.text).toContain('₹15 reward')
    expect(state.rewardsPaid).toBe(15)
  })
})

describe('Rule 6: monthly shop cap', () => {
  const nearCap: ShopState = {
    ...start(),
    rewardsPaid: 625,
    customers: { 'kavya@oksbi': { visits: 2, lastVisitDate: '2026-11-10', rewarded: false, rewardPaused: false } },
  }

  it('pauses the reward when it would exceed the cap, but still plays the alert', () => {
    const r = evaluatePayment(nearCap, pay('kavya@oksbi', 120, '2026-11-20'))
    expect(r.counted).toBe(true)
    expect(r.reward).toBeNull()
    expect(r.audioKeys).toEqual(['alert_120'])
    expect(r.logLines.at(-1)).toEqual({
      kind: 'cap',
      text: "Shop cap reached (₹625/₹630; ₹10 won't fit) → reward paused until 1st",
    })
    expect(r.newState.rewardsPaid).toBe(625)
    expect(r.newState.customers['kavya@oksbi'].rewardPaused).toBe(true)
  })

  it('pays a reward that lands exactly on the cap', () => {
    const s = { ...nearCap, rewardsPaid: 620 }
    const r = evaluatePayment(s, pay('kavya@oksbi', 120, '2026-11-20'))
    expect(r.reward?.amount).toBe(10)
    expect(r.newState.rewardsPaid).toBe(630)
  })

  it('a ₹15 Paytm reward can be paused while a ₹10 one still fits', () => {
    const s: ShopState = {
      ...start(),
      rewardsPaid: 618,
      customers: {
        'arjun@ptyes': { visits: 2, lastVisitDate: '2026-11-10', rewarded: false, rewardPaused: false },
        'riya@ybl': { visits: 2, lastVisitDate: '2026-11-10', rewarded: false, rewardPaused: false },
      },
    }
    const a = evaluatePayment(s, pay('arjun@ptyes', 120, '2026-11-20'))
    expect(a.reward).toBeNull()
    const b = evaluatePayment(a.newState, pay('riya@ybl', 120, '2026-11-20'))
    expect(b.reward?.amount).toBe(10)
  })

  it('uses the configured cap (e.g. self-fund ₹200)', () => {
    const s = { ...nearCap, rewardsPaid: 195, config: { ...MEDIUM_SHOP_CONFIG, monthlyCap: 200 } }
    expect(evaluatePayment(s, pay('kavya@oksbi', 120, '2026-11-20')).reward).toBeNull()
  })
})

describe('Rule 7: counters reset on the 1st', () => {
  it('resets visits, rewards and the cap in a new month', () => {
    const { state } = run(start(), [
      pay('riya@ybl', 120, '2026-11-03'),
      pay('riya@ybl', 120, '2026-11-04'),
      pay('riya@ybl', 120, '2026-11-05'),
    ])
    expect(state.rewardsPaid).toBe(10)
    const r = evaluatePayment(state, pay('riya@ybl', 120, '2026-12-01'))
    expect(r.logLines[0].kind).toBe('month')
    expect(r.newState.month).toBe('2026-12')
    expect(r.newState.rewardsPaid).toBe(0)
    expect(r.newState.customers['riya@ybl'].visits).toBe(1)
    expect(r.audioKeys).toEqual(['alert_120', 'visit1'])
  })

  it('allows a new reward in the new month', () => {
    const days = ['2026-11-03', '2026-11-04', '2026-11-05', '2026-12-01', '2026-12-02', '2026-12-03']
    const { results } = run(start(), days.map((d) => pay('riya@ybl', 120, d)))
    expect(results.filter((r) => r.reward).length).toBe(2)
  })

  it('a paused reward stays paused until the 1st, then the customer starts fresh', () => {
    const s: ShopState = {
      ...start(),
      rewardsPaid: 625,
      customers: { 'kavya@oksbi': { visits: 2, lastVisitDate: '2026-11-10', rewarded: false, rewardPaused: false } },
    }
    const { results } = run(s, [
      pay('kavya@oksbi', 120, '2026-11-20'),
      pay('kavya@oksbi', 120, '2026-11-21'),
    ])
    expect(results[1].reward).toBeNull()
    expect(results[1].logLines.at(-1)?.text).toContain('reward paused')
  })
})

describe('purity', () => {
  it('does not mutate the input state', () => {
    const s = start()
    const snapshot = JSON.stringify(s)
    evaluatePayment(s, pay('riya@ybl', 120, '2026-11-03'))
    expect(JSON.stringify(s)).toBe(snapshot)
  })
})
