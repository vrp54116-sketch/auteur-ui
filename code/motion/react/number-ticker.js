import { useEffect } from 'react'
import { numberTicker } from '../number-ticker.mjs'

export function useNumberTicker(ref, value) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const anims = numberTicker(el, value)
    return () => anims.forEach((anim) => anim.cancel())
  }, [ref, value])
}
