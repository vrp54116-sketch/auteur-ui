import { tone } from '../voice.mjs'

export const id = 'glass'

export const events = {
  hover: { wave: 'sine', freq: 1800, freqEnd: 2400, decay: 0.04, gain: 0.05 },
  click: { wave: 'sine', freq: 2100, freqEnd: 3200, decay: 0.05, gain: 0.06 },
  success: { wave: 'triangle', freq: 1400, freqEnd: 2200, decay: 0.07, gain: 0.05 },
}

export function trigger(ctx, master, name, links) {
  const spec = events[name]
  if (!spec) return
  tone(ctx, master, spec, links)
}
