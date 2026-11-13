/** Contract motion tokens. Numbers come from CSS variables, never from ad-hoc literals at call time. */

const FALLBACK = {
  dur1: 120,
  dur2: 200,
  dur3: 320,
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  stagger: 30,
  bounce: 0.12,
}

function ms(cs, name, fallback) {
  const n = parseFloat(cs.getPropertyValue(name))
  return Number.isFinite(n) ? n : fallback
}

export function motionTokens(el) {
  const root = el?.ownerDocument?.documentElement || document.documentElement
  const cs = getComputedStyle(root)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const ease = cs.getPropertyValue('--ease').trim().replace(/^["']|["']$/g, '') || FALLBACK.ease
  return {
    reduced,
    dur1: reduced ? 0 : ms(cs, '--dur-1', FALLBACK.dur1),
    dur2: reduced ? 0 : ms(cs, '--dur-2', FALLBACK.dur2),
    dur3: reduced ? 0 : ms(cs, '--dur-3', FALLBACK.dur3),
    ease,
    stagger: reduced ? 0 : ms(cs, '--stagger', FALLBACK.stagger),
    bounce: ms(cs, '--spring-bounce', FALLBACK.bounce),
  }
}

export function applyPersonality(personality) {
  const root = document.documentElement
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const dur = reduced ? [0, 0, 0] : personality.dur
  const stagger = reduced ? 0 : personality.stagger
  root.style.setProperty('--dur-1', `${dur[0]}ms`)
  root.style.setProperty('--dur-2', `${dur[1]}ms`)
  root.style.setProperty('--dur-3', `${dur[2]}ms`)
  root.style.setProperty('--ease', personality.ease)
  root.style.setProperty('--stagger', `${stagger}ms`)
  root.style.setProperty('--spring-bounce', String(personality.bounce))
}

export function clearMotion(el) {
  el.getAnimations().forEach((anim) => anim.cancel())
}
