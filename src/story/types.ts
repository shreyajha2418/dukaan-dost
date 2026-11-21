import type { LogKind } from '../logic/rules'
import type { MerchantView } from '../world/store'
import type { PersonId } from '../world/people'

export type StoryAction =
  /** Set today's date (YYYY-MM-DD). */
  | { do: 'date'; date: string }
  /** Update the Paytm for Business screen. */
  | { do: 'merchant'; patch: Partial<MerchantView> }
  /** Who stands at the counter and in the queue. */
  | { do: 'counter'; front: PersonId | null; queue?: PersonId | null }
  /** Thought bubble above a person. */
  | { do: 'thought'; who: PersonId; text: string }
  | { do: 'clearThoughts' }
  /** Show a person's phone with an amount (no payment yet). */
  | { do: 'phone'; who: PersonId | null; amount?: number; note?: string | null }
  /** Run a real payment through evaluatePayment (audio + log come from the rules). */
  | { do: 'pay'; who: PersonId; amount: number }
  /** Animate the phone paying without the rules engine (scripted moments). */
  | { do: 'tap' }
  /** A person speaks a line out loud in their own voice (audio key in public/audio). */
  | { do: 'voice'; who: PersonId; key: string }
  /** Scripted Soundbox lines. silent = bubble only, no audio. */
  | { do: 'say'; keys: string[]; silent?: boolean; label?: string }
  /** Extra "behind the scenes" line. */
  | { do: 'log'; kind: LogKind; text: string }
  /** Fast-forward: give a customer earlier visits this month. */
  | { do: 'seed'; upiId: string; visits: number; lastVisitDate: string }
  /** Fast-forward: set how much of the cap is used. */
  | { do: 'capUsed'; amount: number; rewardsSent: number }
  | { do: 'scene'; scene: 'day' | 'evening' }
  | { do: 'wait'; ms: number }

export interface StoryStep {
  /** Narrator caption (English). */
  caption: string
  /** Small rule chip linking to the deck. */
  rule?: string
  actions: StoryAction[]
  /** Pause after the last action before auto-advancing (default 2500 ms). */
  hold?: number
  /** Shows the end card instead of auto-advancing. */
  end?: boolean
}
