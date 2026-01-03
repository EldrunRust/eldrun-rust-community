'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, AlertTriangle, Zap } from 'lucide-react'

interface WipeCountdownProps {
  wipeDate?: Date
  wipeName?: string
  compact?: boolean
}

export function WipeCountdown({ 
  wipeDate = new Date('2025-01-02T19:00:00'), 
  wipeName = 'Force Wipe',
  compact = false 
}: WipeCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = wipeDate.getTime() - Date.now()
      
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff
      }
    }

    setTimeLeft(calculateTimeLeft())
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [wipeDate])

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24
  const isVeryUrgent = timeLeft.days === 0 && timeLeft.hours < 6

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
        isVeryUrgent 
          ? 'bg-red-500/20 border-red-500/50 text-red-400' 
          : isUrgent 
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
            : 'bg-metal-800/50 border-metal-700 text-metal-300'
      }`}>
        <Clock className="w-4 h-4" />
        <span className="font-mono text-sm">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border ${
        isVeryUrgent 
          ? 'bg-gradient-to-br from-red-900/30 to-red-950/50 border-red-500/50' 
          : isUrgent 
            ? 'bg-gradient-to-br from-amber-900/30 to-amber-950/50 border-amber-500/50'
            : 'bg-gradient-to-br from-metal-800/50 to-metal-900/50 border-metal-700'
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {isVeryUrgent && (
          <>
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
          </>
        )}
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isVeryUrgent ? 'bg-red-500/20' : isUrgent ? 'bg-amber-500/20' : 'bg-metal-700'
            }`}>
              {isVeryUrgent ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <Calendar className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-white">{wipeName}</h3>
              <p className="text-sm text-metal-400">
                {wipeDate.toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          {isVeryUrgent && (
            <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 rounded-full animate-pulse">
              <Zap className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400 font-bold">BALD!</span>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: timeLeft.days, label: 'Tage' },
            { value: timeLeft.hours, label: 'Stunden' },
            { value: timeLeft.minutes, label: 'Minuten' },
            { value: timeLeft.seconds, label: 'Sekunden' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`text-center p-4 rounded-xl ${
                isVeryUrgent 
                  ? 'bg-red-500/10 border border-red-500/30' 
                  : isUrgent 
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'bg-metal-800/50 border border-metal-700'
              }`}
            >
              <div className={`font-mono text-3xl font-black ${
                isVeryUrgent ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-white'
              }`}>
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-xs text-metal-400 mt-1">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 bg-metal-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                isVeryUrgent 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                  : isUrgent 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                    : 'bg-gradient-to-r from-amber-500 to-rust-500'
              }`}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.max(0, 100 - (timeLeft.total / (7 * 24 * 60 * 60 * 1000)) * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WipeCountdown
