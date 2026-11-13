import { noise, tone } from '../voice.mjs'

export const id = 'soft-mechanical'

export const events = {
  click: { wave: 'square', freq: 220, decay: 0.024, gain: 0.06 },
  press: { wave: 'square', freq: 180, decay: 0.02, gain: 0.05 },
  release: { wave: 'square', freq: 320, decay: 0.016, gain: 0.04 },
}

export function trigger(ctx, master, name, links) {
  const spec = events[name]
  if (!spec) return
  tone(ctx, master, spec, links)
  noise(ctx, master, {
    decay: 0.012,
    gain: 0.04,
    filterType: 'highpass',
    freq: 1400,
    q: 0.8,
  }, links)
}
