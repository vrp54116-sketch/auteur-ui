import * as analogTape from './kits/analog-tape.mjs'
import * as glass from './kits/glass.mjs'
import * as minimalClick from './kits/minimal-click.mjs'
import * as softMechanical from './kits/soft-mechanical.mjs'

export const THROTTLE_MS = 60
export const STORAGE_KEY = 'auteur-ui.sound'
const MAX_VOLUME = 0.25

const KITS = {
  'minimal-click': minimalClick,
  'soft-mechanical': softMechanical,
  glass,
  'analog-tape': analogTape,
}

let shared = null
let master = null
const cleanups = []

export function resetSound() {
  while (cleanups.length) cleanups.pop()()
  master = null
  if (shared) {
    const ctx = shared
    shared = null
    try { ctx.close?.() } catch { /* already closed */ }
  }
}

function memoryStorage() {
  const mem = new Map()
  return {
    getItem: (key) => (mem.has(key) ? mem.get(key) : null),
    setItem: (key, value) => mem.set(key, String(value)),
  }
}

function resolveStorage(options) {
  if (options.storage) return options.storage
  try {
    if (typeof localStorage !== 'undefined') return localStorage
  } catch { /* private mode */ }
  return memoryStorage()
}

export function initSound(options = {}) {
  const kitName = KITS[options.kit] ? options.kit : 'minimal-click'
  const kit = KITS[kitName]
  const storage = resolveStorage(options)
  let muted = storage.getItem(STORAGE_KEY) !== 'on'
  const volume = Math.min(Math.max(options.volume ?? 0.1, 0), MAX_VOLUME)
  const Ctor = options.AudioContext || globalThis.AudioContext || globalThis.webkitAudioContext
  if (!Ctor) throw new Error('AudioContext is unavailable')
  if (!shared) {
    shared = new Ctor()
    master = shared.createGain()
    master.gain.value = volume
    master.connect(shared.destination)
  } else {
    master.gain.value = volume
  }
  let unlocked = shared.state === 'running'
  let last = -Infinity
  let played = 0
  let throttled = 0
  let lastLinks = []
  const subs = new Set()

  function emit() {
    for (const fn of subs) fn(muted)
  }

  function reduced() {
    return typeof matchMedia === 'function'
      && matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function unlock() {
    unlocked = true
    const pending = shared.resume?.()
    return pending && typeof pending.then === 'function' ? pending.then(() => true) : Promise.resolve(true)
  }

  if (typeof document !== 'undefined') {
    const onGesture = () => { unlock() }
    document.addEventListener('pointerdown', onGesture)
    document.addEventListener('keydown', onGesture)
    cleanups.push(() => {
      document.removeEventListener('pointerdown', onGesture)
      document.removeEventListener('keydown', onGesture)
    })
  }

  function setMuted(value) {
    muted = Boolean(value)
    storage.setItem(STORAGE_KEY, muted ? 'off' : 'on')
    emit()
  }

  function play(event) {
    if (muted) return { ok: false, reason: 'muted' }
    if (!unlocked) return { ok: false, reason: 'locked' }
    if (reduced()) return { ok: false, reason: 'reduced' }
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (now - last < THROTTLE_MS) {
      throttled += 1
      return { ok: false, reason: 'throttle' }
    }
    if (!kit.events[event]) return { ok: false, reason: 'unknown' }
    last = now
    const links = []
    kit.trigger(shared, master, event, links)
    lastLinks = links
    played += 1
    return { ok: true }
  }

  return {
    play,
    unlock,
    setMuted,
    get muted() { return muted },
    subscribe(fn) {
      subs.add(fn)
      return () => subs.delete(fn)
    },
    stats: () => ({ played, throttled, muted, unlocked }),
    graph: () => ({
      state: shared.state,
      kit: kitName,
      masterGain: master.gain.value,
      links: [['master', 'destination'], ...lastLinks],
    }),
  }
}
