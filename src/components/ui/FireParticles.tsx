'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
}

interface FireParticlesProps {
  count?: number
  className?: string
}

export function FireParticles({ count = 30, className = '' }: FireParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.6 + 0.2
    }))
    setParticles(newParticles)
  }, [count])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bottom-0 rounded-full"
            style={{
              left: `${particle.x}%`,
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, rgba(255,150,50,${particle.opacity}) 0%, rgba(255,80,20,${particle.opacity * 0.5}) 50%, transparent 100%)`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(255,100,30,${particle.opacity})`
            }}
            initial={{ y: 0, opacity: 0, scale: 0 }}
            animate={{
              y: [0, -window.innerHeight * 0.8],
              opacity: [0, particle.opacity, particle.opacity, 0],
              scale: [0.5, 1, 0.8, 0.3]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeOut'
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Glowing embers at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-900/20 via-red-900/10 to-transparent" />
      
      {/* Ambient fire glow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-64 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(ellipse, rgba(255,100,30,0.15) 0%, rgba(200,50,20,0.1) 40%, transparent 70%)'
        }}
        animate={{
          opacity: [0.5, 0.8, 0.6, 0.7, 0.5],
          scale: [1, 1.05, 0.98, 1.02, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  )
}

export function FloatingEmbers({ count = 15 }: { count?: number }) {
  const [embers, setEmbers] = useState<Particle[]>([])

  useEffect(() => {
    const newEmbers: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.8 + 0.2
    }))
    setEmbers(newEmbers)
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {embers.map((ember) => (
        <motion.div
          key={ember.id}
          className="absolute rounded-full bg-orange-400"
          style={{
            left: `${ember.x}%`,
            width: ember.size,
            height: ember.size,
            boxShadow: `0 0 ${ember.size * 3}px rgba(255,150,50,${ember.opacity})`
          }}
          initial={{ 
            y: '100vh', 
            x: 0,
            opacity: 0 
          }}
          animate={{
            y: '-10vh',
            x: [0, 30, -20, 40, -30, 0],
            opacity: [0, ember.opacity, ember.opacity, ember.opacity * 0.5, 0]
          }}
          transition={{
            duration: ember.duration,
            delay: ember.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  )
}
