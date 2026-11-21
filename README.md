# Dukaan Dost — concept prototype

> **Concept prototype for a Paytm product case study. Not a Paytm product.**

A self-explanatory, click-through web prototype: a basic 4G Soundbox at a kirana counter that counts
repeat visits from any UPI ID and, on the 3rd visit in a month, speaks a brand-funded cashback line
("Yeh cashback aapko Parle-G ki taraf se").

- **Guided story** (≈2½ min): one tap on the cover unlocks audio, then 12 steps auto-play with captions,
  speech bubbles, thought bubbles and a "behind the scenes" log. Back / Pause / Next / Replay available
  (keyboard: ← → and Space).
- **Free play**: pick a customer or type a UPI ID, choose an amount, tap Scan & Pay; Next day / Next month / Reset.

Vite + React + TypeScript, no backend, all state in memory.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest rule tests
npm run build      # production build into dist/
```

## Where things live

| Path | What |
| --- | --- |
| `src/logic/rules.ts` | `evaluatePayment(state, payment) → { counted, reward, audioKeys, logLines, newState }` — all 7 rules, pure |
| `src/logic/rules.test.ts` | Unit tests for every rule |
| `src/story/steps.ts` | The guided story as data: captions, rule chips, thoughts, payments, audio. Edit text here. |
| `src/story/runner.ts` | Plays steps, auto-advances, rebuilds state silently on Back/Replay/Next |
| `src/audio/AudioPlayer.ts` | Queue player: ~400 ms gap between lines, pause/resume, mute, missing-file fallback |
| `src/audio/lines.ts` | Speech-bubble text (Roman Hindi) for every audio key |
| `src/components/` | CoverScreen, CustomerPhone, CounterScene, Soundbox, MerchantPanel, BehindTheScenesLog, StoryUI (CaptionBar, StoryControls, EndCard), FreePlay |
| `public/audio/*.mp3` | Generated Soundbox voice lines |
| `scripts/generate-audio.py` | Regenerates the voice lines |

### Rules (implemented in `rules.ts`)
1. Counts as a visit only if amount ≥ ₹50.
2. Max one counted visit per customer per day.
3. Merchant / staff UPI IDs (`ramesh@ptyes`, `sunil@okicici`) never count.
4. Reward on the 3rd counted visit in a month; one reward per customer per month.
5. ₹10 for any UPI app; ₹15 for Paytm UPI handles (`@ptyes`, `@ptaxis`, `@pthdfc`, `@ptsbi`).
6. Shop cap (medium shop ₹630/month): a reward that would exceed it is paused; the payment alert still plays.
7. Counters reset on the 1st of the month.

## Audio

All Soundbox lines are pre-generated MP3s in `public/audio/` (no live TTS at runtime), made with
[`edge-tts`](https://pypi.org/project/edge-tts/) using the stock Hindi neural voice `hi-IN-SwaraNeural`
at rate −5%, from Devanagari text with amounts written as words. `gTTS` is the fallback.

**Regenerate:**
```bash
pip install edge-tts gTTS
python3 scripts/generate-audio.py --force
```
The script decodes each file after generating and prints a table of durations.

**Replace a file with your own recording:** drop an MP3 with the same name into `public/audio/`
(e.g. `visit3.mp3`). Keys: `alert_40|50|80|100|120|150|200|250|500`, `visit1`, `visit2`, `visit3`,
`visit3_paytm`, `recap`. If you change the words, update the bubble text in `src/audio/lines.ts`.

If a file is missing or can't play, the speech bubble still shows the words, a console warning is
logged, and the story carries on. The 🔇 header toggle mutes audio; captions and bubbles keep working.

## Deploy to Netlify

`netlify.toml` sets build `npm run build`, publish `dist`.

- **Git deploy:** connect the repo in Netlify. Because this app lives in the `dukaan-dost/` folder,
  set **Base directory = `dukaan-dost`** (Netlify then picks up this folder's `netlify.toml`).
- **CLI:**
  ```bash
  npm install -g netlify-cli
  npm run build
  netlify deploy --prod --dir=dist
  ```
- **Drag and drop:** run `npm run build`, then drag the `dist/` folder onto https://app.netlify.com/drop.
