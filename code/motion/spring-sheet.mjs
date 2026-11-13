import { clearMotion, motionTokens } from './tokens.mjs'

/**
 * Sheet / modal travel. The curve is --ease (overshoot lives in the
 * kinetic and playful personalities). Duration is --dur-2.
 */
export function springSheet(el, open) {
  clearMotion(el)
  const t = motionTokens(el)
  const hidden = 'translateY(100%)'
  const shown = 'translateY(0px)'
  if (t.reduced || t.dur2 === 0) {
    el.style.transform = open ? shown : hidden
    return null
  }
  return el.animate(
    [
      { transform: open ? hidden : shown },
      { transform: open ? shown : hidden },
    ],
    { duration: t.dur2, easing: t.ease, fill: 'both' },
  )
}
