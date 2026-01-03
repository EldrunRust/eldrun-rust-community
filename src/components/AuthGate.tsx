'use client'

import { useStore } from '@/store/useStore'
import { LogIn, UserPlus, Lock } from 'lucide-react'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { currentUser, openAuthModal } = useStore()

  if (currentUser) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-metal-950 flex items-center justify-center p-4">
      <div className="bg-metal-900 border border-metal-800 rounded-xl p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-3 bg-rust-500/20 border border-rust-500/50 rounded-full">
            <Lock className="w-8 h-8 text-rust-400" />
          </div>
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">Anmelden erforderlich</h2>
          <p className="text-metal-300">
            Um diese Seite zu betreten, musst du dich anmelden oder ein Konto erstellen.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 bg-gradient-to-r from-rust-500 to-rust-600 text-white font-display font-bold rounded-lg hover:from-rust-400 hover:to-rust-500 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Anmelden
          </button>
          <button
            onClick={() => openAuthModal('register')}
            className="w-full py-3 bg-metal-800 border border-metal-700 text-white font-display font-bold rounded-lg hover:bg-metal-700 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Registrieren
          </button>
        </div>
        <p className="text-metal-500 text-sm">
          Werde Teil der Eldrun Community und erhalte Zugang zu allen Features.
        </p>
      </div>
    </div>
  )
}
