import { noise, tone } from '../voice.mjs'

export const id = 'analog-tape'

export const events = {
  open: { wave: 'sine', freq: 95, decay: 0.08, gain: 0.05 },
  close: { wave: 'sine', freq: 110, decay: 0.07, gain: 0.05 },
  navigate: { wave: 'sine', freq: 140, decay: 0.06, gain: 0.04 },
}

export function trigger(ctx, master, name, links) {
  const spec = events[name]
  if (!spec) return
  tone(ctx, master, spec, links)
  noise(ctx, master, {
    decay: spec.decay,
    gain: 0.04,
    filterType: 'bandpass',
    freq: 900,
    q: 0.7,
  }, links)
}
