/** Speech-bubble text (Roman Hindi) for every Soundbox audio key. */
const FIXED: Record<string, string> = {
  visit1: 'Is mahine 2 aur visit par ₹10 cashback.',
  visit2: 'Is mahine 1 aur visit par ₹10 cashback.',
  visit1_paytm: 'Is mahine 2 aur visit par ₹15 cashback.',
  visit2_paytm: 'Is mahine 1 aur visit par ₹15 cashback.',
  visit3: 'Shukriya! Aapko ₹10 cashback mila. Yeh cashback aapko Parle-G ki taraf se. Wapas zaroor aaiyega!',
  visit3_paytm:
    'Shukriya! Aapko Paytm UPI par ₹15 cashback mila. Yeh cashback aapko Parle-G ki taraf se. Wapas zaroor aaiyega!',
  recap: 'Aaj 4 customers ko reward mila. Is mahine 12 customers wapas aaye.',
  // Spoken by Ramesh (male voice), shown in his thought bubble, not the Soundbox bubble.
  ramesh_optin: 'Chalo, Dukaan Dost on kar deta hoon. Bas ek baar karna hai, baaki Soundbox sambhaal lega.',
  ramesh_closing:
    'Waah, is mahine 12 customers wapas aaye! Aur kisko reward dena hai, mujhe koi hisaab nahi lagana pada. Sab apne aap ho gaya!',
}

/** Amounts that have a generated alert_<amount>.mp3 (story uses 40, 120, 150). */
export const PRESET_AMOUNTS = [40, 50, 80, 100, 120, 150, 200, 250, 500] as const

export function bubbleText(key: string): string {
  if (FIXED[key]) return FIXED[key]
  const m = /^alert_(\d+(?:\.\d+)?)$/.exec(key)
  if (m) return `Paytm par ₹${m[1]} prapt hue.`
  return key
}

export function audioUrl(key: string): string {
  return `${import.meta.env.BASE_URL}audio/${key}.mp3`
}

export const ALL_AUDIO_KEYS = [
  ...PRESET_AMOUNTS.map((a) => `alert_${a}`),
  ...Object.keys(FIXED),
]
