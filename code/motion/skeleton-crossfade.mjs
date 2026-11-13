import { clearMotion, motionTokens } from './tokens.mjs'

/** Crossfade a skeleton out while content rises in. Duration is --dur-2. */
export function skeletonCrossfade(skeleton, content) {
  clearMotion(skeleton)
  clearMotion(content)
  const t = motionTokens(content)
  if (t.reduced || t.dur2 === 0) {
    skeleton.style.opacity = '0'
    content.style.opacity = '1'
    content.style.transform = 'none'
    return []
  }
  const out = skeleton.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: t.dur2, easing: t.ease, fill: 'both' },
  )
  const inn = content.animate(
    [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0px)' },
    ],
    { duration: t.dur2, easing: t.ease, fill: 'both' },
  )
  return [out, inn]
}
