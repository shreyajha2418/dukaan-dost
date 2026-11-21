/**
 * Dukaan Dost reward rules — one pure function, no side effects.
 *
 * 1. A payment counts as a visit only if amount >= ₹50.
 * 2. Max one counted visit per customer per day.
 * 3. UPI IDs of the merchant or his staff never count.
 * 4. Reward on the 3rd counted visit in the month; one reward per customer per month.
 * 5. ₹10 for any UPI app, ₹15 if the payer uses a Paytm UPI handle.
 * 6. Shop cap: if paying a reward would exceed the monthly budget, the reward
 *    is paused (payment alert still plays) and the log says so.
 * 7. Counters reset on the 1st of the month.
 */

export const PAYTM_HANDLES = ['ptyes', 'ptaxis', 'pthdfc', 'ptsbi'] as const

export interface ShopConfig {
  shopName: string
  /** UPI IDs of the merchant and staff — never counted. */
  merchantIds: string[]
  staffIds: string[]
  monthlyCap: number
  minAmount: number
  visitsForReward: number
  baseReward: number
  paytmReward: number
  /** Who funds the reward, e.g. "Parle-G pool". */
  fundingLabel: string
}

export interface CustomerRecord {
  visits: number
  lastVisitDate: string | null
  rewarded: boolean
  rewardPaused: boolean
}

export interface ShopState {
  config: ShopConfig
  /** "YYYY-MM" — the month the counters belong to. */
  month: string
  customers: Record<string, CustomerRecord>
  rewardsPaid: number
  rewardsSent: number
}

export interface Payment {
  upiId: string
  amount: number
  /** "YYYY-MM-DD" */
  date: string
}

export interface Reward {
  amount: number
  paytmBonus: boolean
  fundingLabel: string
}

export type LogKind = 'counted' | 'reward' | 'skip' | 'excluded' | 'cap' | 'month' | 'info'

export interface LogLine {
  kind: LogKind
  text: string
}

export interface Evaluation {
  counted: boolean
  reward: Reward | null
  audioKeys: string[]
  /** In chronological order (UI shows newest first). */
  logLines: LogLine[]
  newState: ShopState
}

export const MEDIUM_SHOP_CONFIG: ShopConfig = {
  shopName: 'Ramesh Kirana Store',
  merchantIds: ['ramesh@ptyes'],
  staffIds: ['sunil@okicici'],
  monthlyCap: 630,
  minAmount: 50,
  visitsForReward: 3,
  baseReward: 10,
  paytmReward: 15,
  fundingLabel: 'Parle-G pool',
}

export function monthOf(date: string): string {
  return date.slice(0, 7)
}

export function createShopState(date: string, config: ShopConfig = MEDIUM_SHOP_CONFIG): ShopState {
  return { config, month: monthOf(date), customers: {}, rewardsPaid: 0, rewardsSent: 0 }
}

export function normalizeUpi(id: string): string {
  return id.trim().toLowerCase()
}

export function isPaytmHandle(upiId: string): boolean {
  const handle = normalizeUpi(upiId).split('@')[1] ?? ''
  return (PAYTM_HANDLES as readonly string[]).includes(handle)
}

export function rupees(n: number): string {
  return `₹${n}`
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return `${MONTH_NAMES[m - 1]} ${y}`
}

/**
 * Rule 7: if `date` is in a later month than the state, reset all counters.
 * Pure: returns the same object when nothing changes.
 */
export function rollover(state: ShopState, date: string): { state: ShopState; logLines: LogLine[] } {
  const month = monthOf(date)
  if (month === state.month) return { state, logLines: [] }
  return {
    state: { ...state, month, customers: {}, rewardsPaid: 0, rewardsSent: 0 },
    logLines: [{ kind: 'month', text: `New month (${monthLabel(month)}) → all visit counters and the shop cap reset` }],
  }
}

export function evaluatePayment(state: ShopState, payment: Payment): Evaluation {
  const upi = normalizeUpi(payment.upiId)
  const amount = payment.amount
  const { state: base, logLines } = rollover(state, payment.date)
  const cfg = base.config
  const alertKey = `alert_${amount}`
  const lines: LogLine[] = [...logLines]

  const notCounted = (line: LogLine): Evaluation => ({
    counted: false,
    reward: null,
    audioKeys: [alertKey],
    logLines: [...lines, line],
    newState: base,
  })

  // Rule 3: merchant / staff IDs never count.
  if (cfg.merchantIds.map(normalizeUpi).includes(upi)) {
    return notCounted({ kind: 'excluded', text: `${upi} is the merchant's own ID → excluded` })
  }
  if (cfg.staffIds.map(normalizeUpi).includes(upi)) {
    return notCounted({ kind: 'excluded', text: `${upi} is a staff member's ID → excluded` })
  }

  // Rule 1: minimum amount.
  if (!(amount >= cfg.minAmount)) {
    return notCounted({
      kind: 'skip',
      text: `${upi} · ${rupees(amount)} is below ${rupees(cfg.minAmount)} minimum → not counted`,
    })
  }

  const prev: CustomerRecord = base.customers[upi] ?? {
    visits: 0,
    lastVisitDate: null,
    rewarded: false,
    rewardPaused: false,
  }

  // Rule 2: one counted visit per customer per day.
  if (prev.lastVisitDate === payment.date) {
    return notCounted({ kind: 'skip', text: `${upi} · 2nd payment today → not counted` })
  }

  const visits = prev.visits + 1
  const target = cfg.visitsForReward
  let record: CustomerRecord = { ...prev, visits, lastVisitDate: payment.date }
  let rewardsPaid = base.rewardsPaid
  let rewardsSent = base.rewardsSent
  let reward: Reward | null = null
  const audioKeys = [alertKey]

  if (visits < target) {
    lines.push({ kind: 'counted', text: `${upi} · ${rupees(amount)} · visit counted (${visits} of ${target})` })
    audioKeys.push(`visit${visits}`)
  } else if (visits === target && !prev.rewarded) {
    lines.push({ kind: 'counted', text: `${upi} · ${rupees(amount)} · visit counted (${visits} of ${target})` })
    const paytm = isPaytmHandle(upi)
    const value = paytm ? cfg.paytmReward : cfg.baseReward

    // Rule 6: shop cap.
    if (rewardsPaid + value > cfg.monthlyCap) {
      record = { ...record, rewardPaused: true }
      lines.push({
        kind: 'cap',
        text: `Shop cap reached (${rupees(rewardsPaid)}/${rupees(cfg.monthlyCap)}; ${rupees(value)} won't fit) → reward paused until 1st`,
      })
    } else {
      // Rules 4 & 5.
      reward = { amount: value, paytmBonus: paytm, fundingLabel: cfg.fundingLabel }
      rewardsPaid += value
      rewardsSent += 1
      record = { ...record, rewarded: true }
      lines.push({
        kind: 'reward',
        text: paytm
          ? `${upi} · visit ${visits} → ${rupees(value)} reward sent (Paytm UPI bonus, ${cfg.fundingLabel})`
          : `${upi} · visit ${visits} → ${rupees(value)} reward sent (${cfg.fundingLabel})`,
      })
      audioKeys.push(paytm ? 'visit3_paytm' : 'visit3')
    }
  } else {
    // Visit 4+ (or 3rd visit already handled): still a visit, no second reward.
    const why = record.rewardPaused ? 'reward paused (shop cap)' : 'already rewarded this month'
    lines.push({
      kind: 'counted',
      text: `${upi} · ${rupees(amount)} · visit counted (${visits} this month) · ${why}`,
    })
  }

  return {
    counted: true,
    reward,
    audioKeys,
    logLines: lines,
    newState: {
      ...base,
      customers: { ...base.customers, [upi]: record },
      rewardsPaid,
      rewardsSent,
    },
  }
}
