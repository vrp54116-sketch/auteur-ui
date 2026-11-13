import { useEffect } from 'react'
import { staggerList } from '../stagger-list.mjs'

export function useStaggerList(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    staggerList(el)
  }, [ref])
}
