import { useEffect } from 'react'
import { springSheet } from '../spring-sheet.mjs'

export function useSpringSheet(ref, open) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const anim = springSheet(el, open)
    return () => anim?.cancel()
  }, [ref, open])
}
