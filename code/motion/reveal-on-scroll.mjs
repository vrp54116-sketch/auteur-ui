import { clearMotion, motionTokens } from './tokens.mjs'

const FROM = { opacity: 0, transform: 'translateY(16px)' }
const TO = { opacity: 1, transform: 'translateY(0px)' }

/** Reveal when the element intersects the viewport. */
export function revealOnScroll(el, opts = {}) {
  el.__reveal?.disconnect()
  clearMotion(el)
  const t = motionTokens(el)
  if (t.reduced || t.dur2 === 0) {
    el.style.opacity = '1'
    el.style.transform = 'none'
    return { disconnect() {} }
  }
  el.style.opacity = '0'
  el.style.transform = 'translateY(16px)'
  const trigger = () => {
    return el.animate([FROM, TO], { duration: t.dur2, easing: t.ease, fill: 'both' })
  }
  if (opts.immediate) {
    return trigger()
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      trigger()
      io.disconnect()
    }
  }, { threshold: opts.threshold ?? 0.01, root: opts.root ?? null })
  el.__reveal = io
  io.observe(el)
  return io
}
