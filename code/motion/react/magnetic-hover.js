import { useEffect } from 'react'
import { magneticHover } from '../magnetic-hover.mjs'

export function useMagneticHover(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    return magneticHover(el)
  }, [ref])
}
