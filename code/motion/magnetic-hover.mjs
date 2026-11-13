import { clearMotion, motionTokens } from './tokens.mjs'

/** Move toward a pointer offset. Strength is a unitless fraction of that offset. */
export function magneticTo(el, x, y) {
  clearMotion(el)
  const t = motionTokens(el)
  if (t.reduced || t.dur1 === 0) {
    el.style.transform = 'none'
    return null
  }
  return el.animate(
    [
      { transform: 'translate(0px, 0px)' },
      { transform: `translate(${x}px, ${y}px)` },
    ],
    { duration: t.dur1, easing: t.ease, fill: 'both' },
  )
}

export function magneticHover(el, opts = {}) {
  const strength = opts.strength ?? 0.35
  const onMove = (event) => {
    const rect = el.getBoundingClientRect()
    const x = (event.clientX - (rect.left + rect.width / 2)) * strength
    const y = (event.clientY - (rect.top + rect.height / 2)) * strength
    magneticTo(el, x, y)
  }
  const onLeave = () => magneticTo(el, 0, 0)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)
  return () => {
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
  }
}
