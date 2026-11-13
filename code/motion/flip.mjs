import { clearMotion, motionTokens } from './tokens.mjs'

/** FLIP: measure, mutate layout, then invert with a transform. */
export function flip(el, mutate) {
  clearMotion(el)
  el.style.transform = 'none'
  const first = el.getBoundingClientRect()
  mutate()
  const last = el.getBoundingClientRect()
  const t = motionTokens(el)
  const dx = first.left - last.left
  const dy = first.top - last.top
  const sx = last.width ? first.width / last.width : 1
  const sy = last.height ? first.height / last.height : 1
  if (t.reduced || t.dur2 === 0) {
    el.style.transform = 'none'
    return null
  }
  return el.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
      { transform: 'translate(0px, 0px) scale(1, 1)' },
    ],
    { duration: t.dur2, easing: t.ease, fill: 'both' },
  )
}
