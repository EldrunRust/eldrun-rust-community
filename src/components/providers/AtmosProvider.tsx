'use client'

import { useEffect, useState } from 'react'

type TimeTheme = 'dawn' | 'day' | 'dusk' | 'night'

const themeClasses: Record<TimeTheme, string> = {
  dawn: 'theme-dawn bg-gradient-to-br from-amber-900/40 via-metal-950 to-metal-950',
  day: 'theme-day bg-gradient-to-br from-metal-900 via-metal-950 to-metal-950',
  dusk: 'theme-dusk bg-gradient-to-br from-purple-900/40 via-metal-950 to-metal-950',
  night: 'theme-night bg-gradient-to-br from-indigo-950/60 via-metal-950 to-metal-950',
}

function resolveTheme(date = new Date()): TimeTheme {
  const hour = date.getHours()
  if (hour >= 5 && hour < 10) return 'dawn'
  if (hour >= 10 && hour < 18) return 'day'
  if (hour >= 18 && hour < 22) return 'dusk'
  return 'night'
}

export function AtmosProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<TimeTheme>(() => resolveTheme())

  useEffect(() => {
    setTheme(resolveTheme())
    const interval = setInterval(() => setTheme(resolveTheme()), 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const classList = document.body.classList
    // Remove old theme classes
    Object.keys(themeClasses).forEach((key) => {
      classList.remove(key)
      classList.remove('theme-' + key)
    })
    // Apply new theme class
    classList.add('theme-' + theme)
  }, [theme])

  return (
    <div className={themeClasses[theme]}>
      {children}
    </div>
  )
}
