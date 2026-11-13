import { clearMotion, motionTokens } from './tokens.mjs'

const FROM = { opacity: 0, transform: 'translateY(12px)' }
const TO = { opacity: 1, transform: 'translateY(0px)' }

/** Stagger the first N children. Delay is index × --stagger, capped at 5. */
export function staggerList(container, opts = {}) {
  const t = motionTokens(container)
  const max = opts.max ?? 5
  const items = [...container.children].slice(0, max)
  const anims = []
  items.forEach((el, i) => {
    clearMotion(el)
    if (t.reduced || t.dur1 === 0) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }
    anims.push(el.animate([FROM, TO], {
      duration: t.dur1,
      delay: i * t.stagger,
      easing: t.ease,
      fill: 'both',
    }))
  })
  return anims
}
