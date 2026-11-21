import type { StoryStep } from './types'

/**
 * The guided story. Edit captions, thoughts and timings here — components
 * just render whatever these actions put in the world.
 */
export const STEPS: StoryStep[] = [
  // 0
  {
    caption:
      'Ramesh runs a kirana with a basic Paytm Soundbox. He opts in to Dukaan Dost once, on the Paytm for Business app.',
    rule: 'One-time opt-in',
    actions: [
      { do: 'date', date: '2026-11-02' },
      { do: 'counter', front: null, queue: null },
      { do: 'phone', who: null },
      { do: 'merchant', patch: { optedIn: false, funding: null, showCap: false } },
      { do: 'wait', ms: 600 },
      // Ramesh says this out loud in a male voice (public/audio/ramesh_optin.mp3).
      { do: 'voice', who: 'ramesh', key: 'ramesh_optin' },
      { do: 'merchant', patch: { optedIn: true } },
      { do: 'wait', ms: 1400 },
      { do: 'merchant', patch: { funding: 'brand' } },
      { do: 'wait', ms: 1200 },
      { do: 'merchant', patch: { showCap: true } },
      {
        do: 'log',
        kind: 'info',
        text: 'Ramesh Kirana Store joined Dukaan Dost · Parle-G brand pool · cap ₹630/month (medium shop)',
      },
    ],
  },
  // 1 — first two visits, on two separate days, in one step
  {
    caption:
      'Riya pays ₹120 with Paytm UPI on 3 Nov and again on 7 Nov: two visits, on two separate days.',
    rule: 'Visits counted from her UPI ID',
    actions: [
      { do: 'date', date: '2026-11-03' },
      { do: 'counter', front: 'riya', queue: null },
      { do: 'phone', who: 'riya', amount: 120, note: 'Visit 1 · Tue, 3 Nov' },
      { do: 'thought', who: 'riya', text: 'Blinkit pe bhi mil jaata… par dukaan toh saamne hai.' },
      { do: 'wait', ms: 1800 },
      { do: 'pay', who: 'riya', amount: 120 },
      { do: 'wait', ms: 1200 },
      { do: 'clearThoughts' },
      { do: 'date', date: '2026-11-07' },
      { do: 'phone', who: 'riya', amount: 120, note: 'Visit 2 · Sat, 7 Nov (4 days later)' },
      { do: 'wait', ms: 1400 },
      { do: 'pay', who: 'riya', amount: 120 },
      { do: 'thought', who: 'riya', text: 'Bas ek aur visit… phir cashback.' },
    ],
  },
  // 2
  {
    caption: 'Third visit this month: the reward. Riya pays with Paytm UPI, so she gets ₹15.',
    rule: 'Reward on the 3rd visit',
    actions: [
      { do: 'date', date: '2026-11-12' },
      { do: 'counter', front: 'riya', queue: null },
      { do: 'phone', who: 'riya', amount: 120, note: 'Visit 3 · Thu, 12 Nov' },
      { do: 'wait', ms: 1000 },
      { do: 'pay', who: 'riya', amount: 120 },
      { do: 'thought', who: 'riya', text: '₹15 wapas! Badhiya.' },
    ],
  },
  // 3
  {
    caption: 'The brand moment: everyone at the counter hears Parle-G.',
    rule: 'Brand-funded reward',
    hold: 3500,
    actions: [
      { do: 'counter', front: 'riya', queue: 'meena' },
      { do: 'phone', who: 'riya', amount: 120 },
      { do: 'say', keys: ['visit3_paytm'], silent: true, label: 'Replay: what the queue just heard' },
      { do: 'wait', ms: 1200 },
      { do: 'thought', who: 'riya', text: 'Arre, Parle-G! Bachchon ke liye le leti hoon.' },
      { do: 'wait', ms: 2600 },
      { do: 'thought', who: 'meena', text: 'Parle-G… mujhe bhi lena tha.' },
      { do: 'wait', ms: 2600 },
      { do: 'phone', who: 'riya', amount: 150, note: '+ Parle-G pack added (₹30)' },
      { do: 'wait', ms: 1200 },
      { do: 'tap' },
      { do: 'say', keys: ['alert_150'] },
      { do: 'log', kind: 'info', text: 'Brand line heard by 2 shoppers at the counter' },
      { do: 'log', kind: 'info', text: 'Paytm sees the ₹150 amount, not the items' },
      {
        do: 'log',
        kind: 'info',
        text: 'Parle-G measures its sales lift in pilot vs control shops with its own distributor data',
      },
    ],
  },
  // 4
  {
    caption: 'Any UPI app counts. Arjun pays with Google Pay and gets the standard ₹10; Paytm UPI earns ₹15.',
    rule: 'Any UPI app · ₹15 on Paytm UPI',
    actions: [
      { do: 'date', date: '2026-11-14' },
      { do: 'clearThoughts' },
      { do: 'seed', upiId: 'arjun@okhdfcbank', visits: 2, lastVisitDate: '2026-11-10' },
      { do: 'log', kind: 'info', text: '⏩ Fast-forward: arjun@okhdfcbank already has 2 visits this month' },
      { do: 'counter', front: 'arjun', queue: null },
      { do: 'phone', who: 'arjun', amount: 120, note: 'Visit 3 · Sat, 14 Nov' },
      { do: 'wait', ms: 1200 },
      { do: 'pay', who: 'arjun', amount: 120 },
      { do: 'thought', who: 'arjun', text: 'Paytm UPI pe ₹5 zyada milta… agli baar try karunga.' },
    ],
  },
  // 5
  {
    caption: "Small payments don't count.",
    rule: 'Rule: ₹50 minimum',
    actions: [
      { do: 'counter', front: 'meena', queue: null },
      { do: 'phone', who: 'meena', amount: 40 },
      { do: 'thought', who: 'meena', text: 'Bas ek doodh ka packet.' },
      { do: 'wait', ms: 1800 },
      { do: 'pay', who: 'meena', amount: 40 },
    ],
  },
  // 6
  {
    caption:
      'At closing, the box tells Ramesh how many customers came back. Who gets a reward is worked out automatically.',
    rule: 'Zero effort for the merchant',
    hold: 3000,
    actions: [
      { do: 'date', date: '2026-11-28' },
      // Other shoppers this month, so the panel matches the recap (12 came back).
      { do: 'monthSoFar', rewarded: 7, twoVisits: 3, oneVisit: 6, paid: 80 },
      {
        do: 'log',
        kind: 'info',
        text: '⏩ Fast-forward to 28 Nov · 12 customers came back this month · 9 rewards, ₹105 of ₹630 used',
      },
      { do: 'counter', front: null, queue: null },
      { do: 'phone', who: null },
      { do: 'scene', scene: 'evening' },
      { do: 'wait', ms: 1500 },
      { do: 'say', keys: ['recap'], label: 'Closing-time recap' },
      { do: 'log', kind: 'info', text: 'Closing time · recap played on the Soundbox · no manual tracking by Ramesh' },
      { do: 'wait', ms: 600 },
      // Ramesh says this out loud in a male voice (public/audio/ramesh_closing.mp3).
      { do: 'voice', who: 'ramesh', key: 'ramesh_closing' },
    ],
  },
  // 7
  {
    caption: 'Dukaan Dost: repeat visits for the kirana, a moment of purchase for the brand, more UPI on the Paytm QR.',
    end: true,
    actions: [
      { do: 'scene', scene: 'evening' },
      { do: 'counter', front: null, queue: null },
    ],
  },
]
