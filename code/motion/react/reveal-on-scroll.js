import { useEffect } from 'react'
import { revealOnScroll } from '../reveal-on-scroll.mjs'

export function useRevealOnScroll(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = revealOnScroll(el)
    return () => io.disconnect()
  }, [ref])
}
