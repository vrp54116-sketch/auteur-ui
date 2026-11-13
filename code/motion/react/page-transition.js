import { useEffect } from 'react'
import { pageTransition } from '../page-transition.mjs'

export function usePageTransition(outRef, inRef, token) {
  useEffect(() => {
    const outgoing = outRef.current
    const incoming = inRef.current
    if (!outgoing && !incoming) return undefined
    const anims = pageTransition(outgoing, incoming)
    return () => anims.forEach((anim) => anim.cancel())
  }, [outRef, inRef, token])
}
