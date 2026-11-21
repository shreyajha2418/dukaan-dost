import { useEffect } from 'react'
import { player } from './audio/AudioPlayer'
import { CounterScene } from './components/CounterScene'
import { CoverScreen } from './components/CoverScreen'
import { CustomerPhone } from './components/CustomerPhone'
import { FreePlayBar, useFreePlay } from './components/FreePlay'
import { MerchantPanel } from './components/MerchantPanel'
import { CaptionBar, EndCard, StoryControls } from './components/StoryUI'
import { goTo, pause, resume, STEP_COUNT, STEPS, stopStory } from './story/runner'
import { freePlayWorld, store, useWorld } from './world/store'

const DISCLAIMER = 'Concept prototype for a Paytm product case study. Not a Paytm product.'

function setMuted(m: boolean) {
  player.setMuted(m)
  store.set({ muted: m })
  try {
    localStorage.setItem('dukaan-dost-muted', m ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function startStory() {
  player.unlock()
  void goTo(0)
}

function startFreePlay() {
  player.unlock()
  stopStory()
  store.set(freePlayWorld(store.get().muted))
}

export default function App() {
  const world = useWorld()
  const fp = useFreePlay(world)

  useEffect(() => {
    player.setMuted(store.get().muted)
  }, [])

  // Keyboard: space = pause/play, arrows = back/next (story only).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const w = store.get()
      if (w.mode !== 'story') return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'BUTTON') return
      if (e.key === ' ') {
        e.preventDefault()
        if (w.paused) resume()
        else pause()
      } else if (e.key === 'ArrowRight') void goTo(w.stepIndex + 1)
      else if (e.key === 'ArrowLeft') void goTo(w.stepIndex - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (world.mode === 'cover') {
    return (
      <>
        <CoverScreen onStart={startStory} onFreePlay={startFreePlay} />
      </>
    )
  }

  const step = STEPS[world.stepIndex]
  const isStory = world.mode === 'story'
  const showEnd = isStory && step.end

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            DD
          </span>
          <div>
            <div className="brand-name">Dukaan Dost</div>
            <div className="brand-sub">{DISCLAIMER}</div>
          </div>
        </div>
        <button
          type="button"
          className="mute"
          onClick={() => setMuted(!world.muted)}
          aria-pressed={world.muted}
          aria-label={world.muted ? 'Unmute Soundbox audio' : 'Mute Soundbox audio'}
        >
          {world.muted ? '🔇 Muted' : '🔊 Sound on'}
        </button>
      </header>

      <main className={`stage ${isStory ? 'story' : 'free'}`}>
        <CounterScene world={world} />
        <div className="caption-area">
          {isStory ? (
            <>
              <CaptionBar step={step} index={world.stepIndex} total={STEP_COUNT} />
              <StoryControls
                index={world.stepIndex}
                total={STEP_COUNT}
                paused={world.paused}
                onBack={() => void goTo(world.stepIndex - 1)}
                onNext={() => void goTo(world.stepIndex + 1)}
                onReplay={() => void goTo(world.stepIndex)}
                onTogglePause={() => (world.paused ? resume() : pause())}
                onFreePlay={startFreePlay}
              />
            </>
          ) : (
            <FreePlayBar
              world={world}
              busy={fp.busy}
              onNextDay={fp.nextDay}
              onNextMonth={fp.nextMonth}
              onReset={fp.reset}
              onStory={() => void goTo(0)}
            />
          )}
        </div>
        {isStory ? (
          <CustomerPhone world={world} />
        ) : (
          <CustomerPhone world={world} controls={fp.phoneControls} onPay={fp.doPay} payDisabled={fp.busy} />
        )}
        <MerchantPanel world={world} />
        {showEnd && (
          <div className="end-overlay">
            <EndCard onReplay={() => void goTo(0)} onFreePlay={startFreePlay} />
          </div>
        )}
      </main>

      <footer className="footer">
        {DISCLAIMER} Characters, shop and brand campaign are illustrative. Voice: stock Microsoft neural TTS
        (hi-IN-SwaraNeural).
      </footer>
    </div>
  )
}
