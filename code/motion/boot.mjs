import personalities from './personalities.json' with { type: 'json' }
import { applyPersonality } from './tokens.mjs'
import { revealOnScroll } from './reveal-on-scroll.mjs'
import { staggerList } from './stagger-list.mjs'
import { springSheet } from './spring-sheet.mjs'
import { flip } from './flip.mjs'
import { magneticHover, magneticTo } from './magnetic-hover.mjs'
import { pageTransition } from './page-transition.mjs'
import { numberTicker } from './number-ticker.mjs'
import { skeletonCrossfade } from './skeleton-crossfade.mjs'

const SELECTORS = {
  reveal: '[data-motion="reveal"]',
  stagger: '[data-motion="stagger"] > :first-child',
  sheet: '[data-motion="sheet"]',
  flip: '[data-motion="flip"]',
  magnetic: '[data-motion="magnetic"]',
  page: '[data-motion="page-in"]',
  ticker: '[data-motion="ticker"] [data-digit]',
  skeleton: '[data-motion="skeleton-content"]',
}

let sheetOpen = false
let flipLeft = false
let pageStep = 0

export function run(name, opts = {}) {
  if (name === 'reveal') return revealOnScroll(document.querySelector('[data-motion="reveal"]'), opts)
  if (name === 'stagger') return staggerList(document.querySelector('[data-motion="stagger"]'))
  if (name === 'sheet') {
    sheetOpen = !sheetOpen
    return springSheet(document.querySelector('[data-motion="sheet"]'), sheetOpen)
  }
  if (name === 'flip') {
    const el = document.querySelector('[data-motion="flip"]')
    flipLeft = !flipLeft
    const next = flipLeft ? '96px' : '0px'
    return flip(el, () => { el.style.left = next })
  }
  if (name === 'magnetic') return magneticTo(document.querySelector('[data-motion="magnetic"]'), 24, 16)
  if (name === 'page') {
    pageStep += 1
    const incoming = pageStep % 2 === 1
      ? document.querySelector('[data-motion="page-in"]')
      : document.querySelector('[data-motion="page-out"]')
    const outgoing = incoming.dataset.motion === 'page-in'
      ? document.querySelector('[data-motion="page-out"]')
      : document.querySelector('[data-motion="page-in"]')
    return pageTransition(outgoing, incoming)
  }
  if (name === 'ticker') return numberTicker(document.querySelector('[data-motion="ticker"]'), 48)
  if (name === 'skeleton') {
    return skeletonCrossfade(
      document.querySelector('[data-motion="skeleton"]'),
      document.querySelector('[data-motion="skeleton-content"]'),
    )
  }
  return null
}

export function hasAnim(name) {
  const el = document.querySelector(SELECTORS[name])
  if (!el) return false
  return el.getAnimations().some((anim) => {
    const dur = Number(anim.effect?.getComputedTiming()?.duration || 0)
    return dur > 0 && (anim.playState === 'running' || anim.playState === 'pending')
  })
}

export function sample(name) {
  const el = document.querySelector(SELECTORS[name])
  const anim = el?.getAnimations().find((item) => {
    const dur = Number(item.effect?.getComputedTiming()?.duration || 0)
    return dur > 0 && item.effect?.target === el && item.playState !== 'idle'
  })
  if (!anim) return { ok: false }
  anim.pause()
  anim.currentTime = 0
  const at0 = getComputedStyle(el).transform
  const dur = Number(anim.effect.getComputedTiming().duration)
  anim.currentTime = dur / 2
  const atMid = getComputedStyle(el).transform
  return { ok: true, at0, atMid, dur }
}

function mount() {
  applyPersonality(personalities.restrained)
  const magnetic = document.querySelector('[data-motion="magnetic"]')
  if (magnetic) magneticHover(magnetic)
  const sheet = document.querySelector('[data-motion="sheet"]')
  if (sheet) sheet.style.transform = 'translateY(100%)'
  const flipEl = document.querySelector('[data-motion="flip"]')
  if (flipEl) {
    flipEl.style.position = 'relative'
    flipEl.style.left = '0px'
  }
  for (const name of Object.keys(SELECTORS)) run(name)
  document.querySelector('[data-personality]')?.addEventListener('change', (event) => {
    applyPersonality(personalities[event.target.value])
  })
  for (const button of document.querySelectorAll('[data-run]')) {
    button.addEventListener('click', () => run(button.dataset.run))
  }
}

if (document.querySelector('[data-kitchen-sink]')) {
  window.__auteur = { run, hasAnim, sample, personalities }
  mount()
}
