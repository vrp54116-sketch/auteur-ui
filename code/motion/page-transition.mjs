import { clearMotion, motionTokens } from './tokens.mjs'

/** Cross a page out and the next page in. Duration is --dur-3. */
export function pageTransition(outgoing, incoming) {
  const t = motionTokens(incoming || outgoing)
  const anims = []
  if (outgoing) clearMotion(outgoing)
  if (incoming) clearMotion(incoming)
  if (t.reduced || t.dur3 === 0) {
    if (outgoing) {
      outgoing.style.opacity = '0'
      outgoing.style.transform = 'none'
    }
    if (incoming) {
      incoming.style.opacity = '1'
      incoming.style.transform = 'none'
    }
    return anims
  }
  if (outgoing) {
    anims.push(outgoing.animate(
      [
        { opacity: 1, transform: 'translateY(0px)' },
        { opacity: 0, transform: 'translateY(-12px)' },
      ],
      { duration: t.dur3, easing: t.ease, fill: 'both' },
    ))
  }
  if (incoming) {
    anims.push(incoming.animate(
      [
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0px)' },
      ],
      { duration: t.dur3, easing: t.ease, fill: 'both' },
    ))
  }
  return anims
}
