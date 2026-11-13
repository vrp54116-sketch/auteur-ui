import pairings from './pairings.json' with { type: 'json' }
export { fontPairingConfigs } from './next-font.js'

export { pairings }

export function getPairing(id) {
  return pairings.find((p) => p.id === id) || null
}

export function applyPairingScale(id, targetEl = null) {
  const pairing = getPairing(id)
  if (!pairing) return false
  const root = targetEl || (typeof document !== 'undefined' ? document.documentElement : null)
  if (!root) return false

  const scale = pairing.scale
  root.style.setProperty('--text-xs', scale.textXs)
  root.style.setProperty('--text-sm', scale.textSm)
  root.style.setProperty('--text-base', scale.textBase)
  root.style.setProperty('--text-lg', scale.textLg)
  root.style.setProperty('--text-xl', scale.textXl)
  root.style.setProperty('--text-2xl', scale.text2xl)
  root.style.setProperty('--text-3xl', scale.text3xl)
  root.style.setProperty('--text-4xl', scale.text4xl)
  root.style.setProperty('--text-5xl', scale.text5xl)

  root.style.setProperty('--font-display', pairing.display.family)
  root.style.setProperty('--font-text', pairing.body.family)
  if (pairing.mono) {
    root.style.setProperty('--font-mono', pairing.mono.family)
  }
  return true
}
