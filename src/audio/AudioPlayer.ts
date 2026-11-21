import { ALL_AUDIO_KEYS, audioUrl, bubbleText } from './lines'

export class CancelledError extends Error {
  constructor() {
    super('cancelled')
  }
}

export interface PlayHooks {
  /** Called as each line starts (so the speech bubble shows exactly what's spoken). */
  onLine?: (key: string, text: string, index: number) => void
  onSpeakingChange?: (speaking: boolean) => void
}

const GAP_MS = 400

/**
 * Plays a queue of Soundbox lines in order and resolves when done.
 * - Missing/broken files: warns, waits a reading-time estimate, continues.
 * - Muted: no sound, but waits the same estimated time so the story stays in sync.
 * - pause()/resume() affect both audio and the waits; stop() rejects with CancelledError.
 */
export class AudioPlayer {
  private el: HTMLAudioElement | null = null
  private muted = false
  private paused = false
  private generation = 0
  private resumeWaiters: Array<() => void> = []
  private durations = new Map<string, number>()

  private get audio(): HTMLAudioElement {
    if (!this.el) {
      this.el = new Audio()
      this.el.preload = 'auto'
    }
    return this.el
  }

  /** Must be called from a user gesture (the cover button) to unlock audio. */
  unlock(): void {
    const a = this.audio
    a.muted = true
    a.src = audioUrl('alert_40')
    a.play()
      .then(() => {
        a.pause()
        a.currentTime = 0
        a.muted = this.muted
      })
      .catch(() => {
        a.muted = this.muted
      })
    this.preloadAll()
  }

  preloadAll(): void {
    for (const key of ALL_AUDIO_KEYS) {
      const probe = new Audio()
      probe.preload = 'metadata'
      probe.src = audioUrl(key)
      probe.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(probe.duration)) this.durations.set(key, probe.duration * 1000)
      })
    }
  }

  setMuted(m: boolean): void {
    this.muted = m
    if (this.el) this.el.muted = m
  }

  isMuted(): boolean {
    return this.muted
  }

  pause(): void {
    this.paused = true
    this.el?.pause()
  }

  resume(): void {
    this.paused = false
    const waiters = this.resumeWaiters
    this.resumeWaiters = []
    waiters.forEach((w) => w())
  }

  /** Cancel everything in flight. */
  stop(): void {
    this.generation++
    this.paused = false
    const waiters = this.resumeWaiters
    this.resumeWaiters = []
    waiters.forEach((w) => w())
    if (this.el) {
      this.el.pause()
      this.el.removeAttribute('src')
      this.el.load()
    }
  }

  private check(gen: number) {
    if (gen !== this.generation) throw new CancelledError()
  }

  private waitWhilePaused(gen: number): Promise<void> {
    if (!this.paused) return Promise.resolve()
    return new Promise<void>((res) => this.resumeWaiters.push(res)).then(() => {
      this.check(gen)
      return this.waitWhilePaused(gen)
    })
  }

  /** A pausable, cancellable sleep. */
  async sleep(ms: number, gen = this.generation): Promise<void> {
    let remaining = ms
    while (remaining > 0) {
      this.check(gen)
      await this.waitWhilePaused(gen)
      this.check(gen)
      const step = Math.min(remaining, 100)
      await new Promise((r) => setTimeout(r, step))
      if (!this.paused) remaining -= step
    }
    this.check(gen)
  }

  token(): number {
    return this.generation
  }

  estimate(key: string): number {
    const known = this.durations.get(key)
    if (known) return known
    return Math.max(1800, bubbleText(key).length * 75)
  }

  async play(keys: string[], hooks: PlayHooks = {}, gen = this.generation): Promise<void> {
    for (let i = 0; i < keys.length; i++) {
      this.check(gen)
      if (i > 0) await this.sleep(GAP_MS, gen)
      await this.waitWhilePaused(gen)
      const key = keys[i]
      hooks.onLine?.(key, bubbleText(key), i)
      hooks.onSpeakingChange?.(true)
      try {
        if (this.muted) await this.sleep(this.estimate(key), gen)
        else await this.playOne(key, gen)
      } finally {
        if (gen === this.generation) hooks.onSpeakingChange?.(false)
      }
    }
  }

  private playOne(key: string, gen: number): Promise<void> {
    const a = this.audio
    return new Promise<void>((resolve, reject) => {
      let settled = false
      let fallback = false
      const cleanup = () => {
        a.removeEventListener('ended', onEnded)
        a.removeEventListener('error', onError)
        clearInterval(watch)
      }
      const finish = () => {
        if (settled) return
        settled = true
        cleanup()
        if (gen !== this.generation) reject(new CancelledError())
        else resolve()
      }
      const toFallback = (why: string) => {
        if (fallback || settled) return
        fallback = true
        cleanup()
        console.warn(`[Dukaan Dost] audio "${key}" unavailable (${why}); showing speech bubble only.`)
        this.sleep(this.estimate(key), gen).then(
          () => {
            settled = true
            resolve()
          },
          (e) => {
            settled = true
            reject(e)
          },
        )
      }
      const onEnded = () => finish()
      const onError = () => toFallback('load error')
      // Handle pause/resume and cancellation while the element plays.
      let wasPaused = false
      const watch = setInterval(() => {
        if (gen !== this.generation) return finish()
        if (this.paused && !wasPaused) {
          wasPaused = true
          a.pause()
        } else if (!this.paused && wasPaused) {
          wasPaused = false
          a.play().catch(() => toFallback('resume blocked'))
        }
      }, 80)
      a.addEventListener('ended', onEnded)
      a.addEventListener('error', onError)
      a.muted = this.muted
      a.src = audioUrl(key)
      a.currentTime = 0
      a.play().catch((e: unknown) => {
        if (gen !== this.generation) return finish()
        toFallback(e instanceof Error ? e.name : 'play() rejected')
      })
    })
  }
}

export const player = new AudioPlayer()
