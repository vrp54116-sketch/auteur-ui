import { motion, useReducedMotion } from 'motion/react'

function read(name, fallback) {
  const n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name))
  return Number.isFinite(n) ? n : fallback
}

/** Optional variant. Spring bounce and duration come from contract CSS variables. */
export function SpringSheet({ open, children }) {
  const reduce = useReducedMotion()
  const duration = read('--dur-2', 200) / 1000
  const bounce = read('--spring-bounce', 0.12)
  return (
    <motion.div
      initial={false}
      animate={{ y: open ? 0 : '100%' }}
      transition={reduce ? { duration: 0 } : { type: 'spring', duration, bounce }}
    >
      {children}
    </motion.div>
  )
}
