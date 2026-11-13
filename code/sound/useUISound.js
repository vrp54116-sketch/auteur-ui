import { useEffect, useMemo, useState } from 'react'
import { initSound } from './initSound.mjs'

/** React hook. One shared AudioContext, muted until the persisted toggle is on. */
export function useUISound(options = {}) {
  const api = useMemo(
    () => initSound({ kit: options.kit, volume: options.volume }),
    [options.kit, options.volume],
  )
  const [muted, setMutedState] = useState(() => api.muted)
  useEffect(() => api.subscribe(setMutedState), [api])
  return {
    play: (event) => api.play(event),
    muted,
    setMuted: (value) => api.setMuted(value),
    unlock: () => api.unlock(),
  }
}
