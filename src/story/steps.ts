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
      { do: 'wait', ms: 1500 },
      { do: 'merchant', patch: { optedIn: true } },
      { do: 'wait', ms: 1600 },
      { do: 'merchant', patch: { funding: 'brand' } },
      { do: 'wait', ms: 1200 },
      { do: 'merchant', patch: { showCap: true } },
      {
        do: 'log',
        kind: 'info',
        text: 'Ramesh Kirana Store joined Dukaan Dost · Parle-G brand pool · cap ₹630/month (medium shop)',
      },
      { do: 'thought', who: 'ramesh', text: 'Bas ek baar on karna hai. Baaki Soundbox sambhaal lega.' },
    ],
  },
  // 1
  {
    caption: 'Riya shops here and on Blinkit. She pays ₹120 with PhonePe.',
    rule: 'Any UPI app counts',
    actions: [
      { do: 'date', date: '2026-11-03' },
      { do: 'counter', front: 'riya', queue: null },
      { do: 'phone', who: 'riya', amount: 120 },
      { do: 'thought', who: 'riya', text: 'Blinkit pe bhi mil jaata… par dukaan toh saamne hai.' },
      { do: 'wait', ms: 2200 },
      { do: 'pay', who: 'riya', amount: 120 },
    ],
  },
  // 2
  {
    caption: 'A few days later, Riya is back.',
    rule: 'Visits counted from her UPI ID',
    actions: [
      { do: 'date', date: '2026-11-07' },
      { do: 'counter', front: 'riya', queue: null },
      { do: 'phone', who: 'riya', amount: 120 },
      { do: 'wait', ms: 1000 },
      { do: 'pay', who: 'riya', amount: 120 },
      { do: 'thought', who: 'riya', text: 'Bas ek aur visit… phir ₹10.' },
    ],
  },
  // 3
  {
    caption: 'Third visit this month: the reward.',
    rule: 'Reward on the 3rd visit',
    actions: [
      { do: 'date', date: '2026-11-12' },
      { do: 'counter', front: 'riya', queue: null },
      { do: 'phone', who: 'riya', amount: 120 },
      { do: 'wait', ms: 1000 },
      { do: 'pay', who: 'riya', amount: 120 },
      { do: 'thought', who: 'riya', text: '₹10 wapas! Badhiya.' },
    ],
  },
  // 4
  {
    caption: 'The brand moment: everyone at the counter hears Parle-G.',
    rule: 'Brand-funded reward',
    hold: 3500,
    actions: [
      { do: 'counter', front: 'riya', queue: 'meena' },
      { do: 'phone', who: 'riya', amount: 120 },
      { do: 'say', keys: ['visit3'], silent: true, label: 'Replay: what the queue just heard' },
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
  // 5
  {
    caption: 'Arjun pays with Paytm UPI, so his reward is bigger.',
    rule: '₹15 on Paytm UPI',
    actions: [
      { do: 'date', date: '2026-11-14' },
      { do: 'clearThoughts' },
      { do: 'seed', upiId: 'arjun@ptyes', visits: 2, lastVisitDate: '2026-11-10' },
      { do: 'log', kind: 'info', text: '⏩ Fast-forward: arjun@ptyes already has 2 visits this month' },
      { do: 'counter', front: 'arjun', queue: null },
      { do: 'phone', who: 'arjun', amount: 120 },
      { do: 'wait', ms: 1200 },
      { do: 'pay', who: 'arjun', amount: 120 },
      { do: 'thought', who: 'arjun', text: 'Paytm UPI pe ₹5 zyada. Nice.' },
    ],
  },
  // 6
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
  // 7
  {
    caption: "Paying twice in a day doesn't help.",
    rule: 'Rule: 1 visit per day',
    hold: 3000,
    actions: [
      { do: 'date', date: '2026-11-15' },
      { do: 'counter', front: 'riya', queue: null },
      { do: 'phone', who: 'riya', amount: 120, note: 'Morning' },
      { do: 'wait', ms: 1000 },
      { do: 'pay', who: 'riya', amount: 120 },
      { do: 'wait', ms: 1200 },
      { do: 'phone', who: 'riya', amount: 120, note: 'Evening, same day' },
      { do: 'thought', who: 'riya', text: 'Do baar pay karoon toh do visit?' },
      { do: 'wait', ms: 1800 },
      { do: 'pay', who: 'riya', amount: 120 },
    ],
  },
  // 8
  {
    caption: "The shopkeeper can't reward himself.",
    rule: 'Rule: merchant & staff IDs excluded',
    actions: [
      { do: 'counter', front: null, queue: null },
      { do: 'phone', who: 'ramesh', amount: 120 },
      { do: 'thought', who: 'ramesh', text: 'Apne hi QR pe pay karke dekhta hoon…' },
      { do: 'wait', ms: 2200 },
      { do: 'pay', who: 'ramesh', amount: 120 },
    ],
  },
  // 9
  {
    caption: 'Each shop has a monthly reward cap, so spend stays in control.',
    rule: 'Rule: shop cap ₹630/month',
    actions: [
      { do: 'date', date: '2026-11-20' },
      { do: 'capUsed', amount: 625, rewardsSent: 60 },
      { do: 'log', kind: 'info', text: '⏩ Fast-forward to 20 Nov: ₹625 of ₹630 already given out this month' },
      { do: 'seed', upiId: 'kavya@oksbi', visits: 2, lastVisitDate: '2026-11-16' },
      { do: 'counter', front: 'kavya', queue: null },
      { do: 'phone', who: 'kavya', amount: 120 },
      { do: 'wait', ms: 1800 },
      { do: 'pay', who: 'kavya', amount: 120 },
    ],
  },
  // 10
  {
    caption: 'At closing, the box tells Ramesh how many customers came back. He typed nothing all day.',
    rule: 'Zero effort for the merchant',
    hold: 3000,
    actions: [
      { do: 'counter', front: null, queue: null },
      { do: 'phone', who: null },
      { do: 'scene', scene: 'evening' },
      { do: 'wait', ms: 1500 },
      { do: 'say', keys: ['recap'], label: 'Closing-time recap' },
      { do: 'log', kind: 'info', text: 'Closing time · daily recap played on the Soundbox' },
      { do: 'thought', who: 'ramesh', text: '12 log wapas aaye. Aur maine kuch likha bhi nahi.' },
    ],
  },
  // 11
  {
    caption: 'Dukaan Dost: repeat visits for the kirana, a moment of purchase for the brand, more UPI on the Paytm QR.',
    end: true,
    actions: [
      { do: 'scene', scene: 'evening' },
      { do: 'counter', front: null, queue: null },
    ],
  },
]
