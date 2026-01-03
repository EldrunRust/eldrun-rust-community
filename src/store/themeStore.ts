import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'dark' | 'light' | 'system'
export type AccentColor = 'amber' | 'red' | 'blue' | 'green' | 'purple' | 'pink' | 'cyan'

interface ThemeSettings {
  mode: ThemeMode
  accentColor: AccentColor
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  compactMode: boolean
}

interface ThemeState {
  settings: ThemeSettings
  isSystemDark: boolean
  
  // Actions
  setMode: (mode: ThemeMode) => void
  setAccentColor: (color: AccentColor) => void
  setReducedMotion: (value: boolean) => void
  setHighContrast: (value: boolean) => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  setCompactMode: (value: boolean) => void
  resetToDefaults: () => void
  
  // Computed
  isDarkMode: () => boolean
  getAccentClasses: () => { primary: string; secondary: string; gradient: string }
}

const defaultSettings: ThemeSettings = {
  mode: 'dark',
  accentColor: 'amber',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  compactMode: false,
}

const ACCENT_COLORS = {
  amber: {
    primary: 'text-amber-400',
    secondary: 'text-amber-500',
    gradient: 'from-amber-400 via-rust-400 to-red-600',
  },
  red: {
    primary: 'text-red-400',
    secondary: 'text-red-500',
    gradient: 'from-red-400 via-rose-500 to-pink-600',
  },
  blue: {
    primary: 'text-blue-400',
    secondary: 'text-blue-500',
    gradient: 'from-blue-400 via-cyan-500 to-teal-600',
  },
  green: {
    primary: 'text-green-400',
    secondary: 'text-green-500',
    gradient: 'from-green-400 via-emerald-500 to-teal-600',
  },
  purple: {
    primary: 'text-purple-400',
    secondary: 'text-purple-500',
    gradient: 'from-purple-400 via-violet-500 to-indigo-600',
  },
  pink: {
    primary: 'text-pink-400',
    secondary: 'text-pink-500',
    gradient: 'from-pink-400 via-rose-500 to-red-600',
  },
  cyan: {
    primary: 'text-cyan-400',
    secondary: 'text-cyan-500',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
  },
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isSystemDark: true,

      setMode: (mode) => set((state) => ({
        settings: { ...state.settings, mode }
      })),

      setAccentColor: (accentColor) => set((state) => ({
        settings: { ...state.settings, accentColor }
      })),

      setReducedMotion: (reducedMotion) => set((state) => ({
        settings: { ...state.settings, reducedMotion }
      })),

      setHighContrast: (highContrast) => set((state) => ({
        settings: { ...state.settings, highContrast }
      })),

      setFontSize: (fontSize) => set((state) => ({
        settings: { ...state.settings, fontSize }
      })),

      setCompactMode: (compactMode) => set((state) => ({
        settings: { ...state.settings, compactMode }
      })),

      resetToDefaults: () => set({ settings: defaultSettings }),

      isDarkMode: () => {
        const { settings, isSystemDark } = get()
        if (settings.mode === 'system') return isSystemDark
        return settings.mode === 'dark'
      },

      getAccentClasses: () => {
        const { settings } = get()
        return ACCENT_COLORS[settings.accentColor]
      },
    }),
    {
      name: 'eldrun-theme-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
)

export default useThemeStore
