function ramp(param, peak, decay, now) {
  const hold = Math.max(peak, 0.001)
  param.setValueAtTime(hold, now)
  param.exponentialRampToValueAtTime(0.001, now + Math.max(decay, 0.01))
}

export function tone(ctx, master, spec, links) {
  const now = ctx.currentTime
  const decay = spec.decay
  const amp = ctx.createGain()
  ramp(amp.gain, spec.gain, decay, now)
  amp.connect(master)
  const osc = ctx.createOscillator()
  osc.type = spec.wave || 'sine'
  osc.frequency.setValueAtTime(spec.freq, now)
  if (spec.freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(spec.freqEnd, now + Math.max(decay, 0.01))
  }
  osc.connect(amp)
  osc.start(now)
  osc.stop(now + decay + 0.02)
  links.push(['oscillator', 'gain'], ['gain', 'master'])
}

export function noise(ctx, master, spec, links) {
  const decay = spec.decay
  const length = Math.max(1, Math.floor(ctx.sampleRate * Math.max(decay, 0.02)))
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let brown = 0
  for (let i = 0; i < length; i++) {
    brown = (brown + 0.02 * (Math.random() * 2 - 1)) / 1.02
    data[i] = brown * 3.2
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = spec.filterType
  filter.frequency.value = spec.freq
  filter.Q.value = spec.q
  const amp = ctx.createGain()
  const now = ctx.currentTime
  ramp(amp.gain, spec.gain, decay, now)
  src.connect(filter)
  filter.connect(amp)
  amp.connect(master)
  src.start(now)
  src.stop(now + decay + 0.02)
  links.push(['buffer', 'biquad'], ['biquad', 'gain'], ['gain', 'master'])
}
