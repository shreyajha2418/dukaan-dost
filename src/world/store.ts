import { useSyncExternalStore } from 'react'
import { createShopState, type LogKind, type ShopState } from '../logic/rules'
import type { Person, PersonId } from './people'

export interface LogEntry {
  id: number
  kind: LogKind
  text: string
  date: string
}

export interface MerchantView {
  optedIn: boolean
  funding: 'brand' | 'self' | null
  showCap: boolean
}

export interface PhoneView {
  person: Person | null
  amount: number
  status: 'idle' | 'paying' | 'paid'
  notification: string | null
  note: string | null
}

export interface World {
  mode: 'cover' | 'story'
  stepIndex: number
  paused: boolean
  muted: boolean
  shop: ShopState
  date: string
  log: LogEntry[]
  merchant: MerchantView
  phone: PhoneView
  counter: { front: PersonId | null; queue: PersonId | null; thoughts: Partial<Record<PersonId, string>> }
  bubble: { lines: string[]; speaking: boolean; label: string | null }
  scene: 'day' | 'evening'
  /** Person currently speaking out loud (not the Soundbox). */
  speaker: PersonId | null
}

export const START_DATE = '2026-11-02'

export function initialWorld(mode: World['mode'] = 'cover', muted = false): World {
  return {
    mode,
    stepIndex: 0,
    paused: false,
    muted,
    shop: createShopState(START_DATE),
    date: START_DATE,
    log: [],
    merchant: { optedIn: false, funding: null, showCap: false },
    phone: { person: null, amount: 0, status: 'idle', notification: null, note: null },
    counter: { front: null, queue: null, thoughts: {} },
    bubble: { lines: [], speaking: false, label: null },
    scene: 'day',
    speaker: null,
  }
}

type Listener = () => void

function readMuted(): boolean {
  try {
    return localStorage.getItem('dukaan-dost-muted') === '1'
  } catch {
    return false
  }
}

class Store {
  private state: World = initialWorld('cover', readMuted())
  private listeners = new Set<Listener>()
  private logId = 0

  get = (): World => this.state

  set = (patch: Partial<World> | ((w: World) => Partial<World>)): void => {
    const p = typeof patch === 'function' ? patch(this.state) : patch
    this.state = { ...this.state, ...p }
    this.listeners.forEach((l) => l())
  }

  subscribe = (l: Listener): (() => void) => {
    this.listeners.add(l)
    return () => this.listeners.delete(l)
  }

  addLog(lines: { kind: LogKind; text: string }[]): void {
    if (!lines.length) return
    const date = this.state.date
    const entries = lines.map((l) => ({ ...l, id: ++this.logId, date }))
    this.set((w) => ({ log: [...entries.reverse(), ...w.log].slice(0, 200) }))
  }
}

export const store = new Store()

export function useWorld(): World {
  return useSyncExternalStore(store.subscribe, store.get)
}
