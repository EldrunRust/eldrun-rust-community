'use client'

import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-metal-950 flex items-center justify-center p-4 pt-24">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-8 bg-metal-800 rounded-2xl flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-metal-500" />
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-bold text-white mb-4">
          Du bist offline
        </h1>
        
        <p className="text-metal-400 mb-8">
          Es konnte keine Verbindung zum Server hergestellt werden. 
          Bitte überprüfe deine Internetverbindung und versuche es erneut.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-rust-600 hover:bg-rust-500 text-white font-bold rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Erneut versuchen
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-metal-800 hover:bg-metal-700 text-white font-bold rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Zur Startseite
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-12 p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-left">
          <h3 className="font-bold text-white mb-3">Tipps:</h3>
          <ul className="space-y-2 text-sm text-metal-400">
            <li>• Überprüfe deine WLAN-Verbindung</li>
            <li>• Versuche, mobile Daten zu aktivieren</li>
            <li>• Starte deinen Router neu</li>
            <li>• Einige Seiten sind offline verfügbar</li>
          </ul>
        </div>

        {/* Branding */}
        <div className="mt-8 text-metal-600 text-sm">
          ELDRUN - Pfad des Krieges
        </div>
      </div>
    </div>
  )
}
