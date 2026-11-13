import { useCallback } from 'react'
import { flip } from '../flip.mjs'

export function useFlip(ref) {
  return useCallback((mutate) => {
    const el = ref.current
    if (!el) return null
    return flip(el, mutate)
  }, [ref])
}
