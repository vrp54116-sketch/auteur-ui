import { motionTokens } from './tokens.mjs'

/** Roll each digit on a strip. Non-digits are static. */
export function numberTicker(el, value) {
  const t = motionTokens(el)
  const text = String(value)
  el.replaceChildren()
  el.style.display = 'inline-flex'
  const anims = []
  for (const char of text) {
    const col = document.createElement('span')
    col.style.display = 'inline-block'
    col.style.overflow = 'hidden'
    col.style.height = '1em'
    if (!/\d/.test(char)) {
      col.textContent = char
      el.append(col)
      continue
    }
    const strip = document.createElement('span')
    strip.dataset.digit = char
    strip.style.display = 'block'
    strip.style.lineHeight = '1'
    strip.textContent = '0123456789'
    col.append(strip)
    el.append(col)
    const ty = `translateY(${-Number(char)}em)`
    if (t.reduced || t.dur2 === 0) {
      strip.style.transform = ty
      continue
    }
    anims.push(strip.animate(
      [{ transform: 'translateY(0em)' }, { transform: ty }],
      { duration: t.dur2, easing: t.ease, fill: 'both' },
    ))
  }
  return anims
}
