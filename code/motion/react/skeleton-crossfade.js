import { useEffect } from 'react'
import { skeletonCrossfade } from '../skeleton-crossfade.mjs'

export function useSkeletonCrossfade(skeletonRef, contentRef, token) {
  useEffect(() => {
    const skeleton = skeletonRef.current
    const content = contentRef.current
    if (!skeleton || !content) return undefined
    const anims = skeletonCrossfade(skeleton, content)
    return () => anims.forEach((anim) => anim.cancel())
  }, [skeletonRef, contentRef, token])
}
