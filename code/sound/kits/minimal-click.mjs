import { tone } from '../voice.mjs'

export const id = 'minimal-click'

export const events = {
  click: { wave: 'sine', freq: 1200, decay: 0.018, gain: 0.08 },
  toggle: { wave: 'sine', freq: 880, decay: 0.016, gain: 0.06 },
}

export function trigger(ctx, master, name, links) {
  const spec = events[name]
  if (!spec) return
  tone(ctx, master, spec, links)
}
