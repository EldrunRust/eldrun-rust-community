'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function HeroBackgroundRotator({
  intervalMs = 30000,
  images,
}: {
  intervalMs?: number
  images?: string[]
}) {
  const slides = useMemo(
    () =>
      images && images.length
        ? images
        : [
            '/images/hero/bg-01.png',
            '/images/hero/bg-02.png',
            '/images/hero/bg-03.png',
            '/images/hero/bg-04.png',
          ],
    [images]
  )

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, intervalMs)
    return () => window.clearInterval(t)
  }, [intervalMs, slides.length])

  const url = slides[index] || slides[0]

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={url}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            scale: [1.02, 1.08],
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.2, ease: [0.22, 0.6, 0.36, 1] },
            scale: { duration: intervalMs / 1000, ease: 'linear' },
          }}
          className="absolute inset-0 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${url}')`,
            backgroundSize: 'cover',
            filter: 'saturate(1.05) contrast(1.05) brightness(0.95)',
            willChange: 'opacity, transform',
          }}
        />
      </AnimatePresence>
    </div>
  )
}
