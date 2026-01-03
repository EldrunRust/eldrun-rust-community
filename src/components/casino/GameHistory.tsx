'use client'

import { motion } from 'framer-motion'
import { X, History, TrendingUp, TrendingDown } from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'

interface GameHistoryProps {
  onClose: () => void
}

export function GameHistory({ onClose }: GameHistoryProps) {
  const { history } = useCasinoStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-metal-900 border border-metal-700 w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-metal-700">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <History className="w-5 h-5 text-rust-400" />
            Spielverlauf
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-metal-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-metal-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Noch keine Spiele gespielt.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 border flex items-center justify-between ${
                    entry.result === 'win'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      entry.result === 'win' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {entry.result === 'win' 
                        ? <TrendingUp className="w-5 h-5 text-green-400" />
                        : <TrendingDown className="w-5 h-5 text-red-400" />
                      }
                    </div>
                    <div>
                      <p className="font-display font-bold text-white">{entry.game}</p>
                      <p className="text-metal-500 text-sm">
                        {new Date(entry.timestamp).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-metal-400 text-sm">
                      Einsatz: {entry.bet.toLocaleString()}
                    </p>
                    <p className={`font-mono font-bold ${
                      entry.result === 'win' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {entry.result === 'win' ? '+' : ''}{(entry.payout - entry.bet).toLocaleString()}
                    </p>
                    {entry.multiplier && (
                      <p className="text-metal-500 text-xs">{entry.multiplier}x</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {history.length > 0 && (
          <div className="p-4 border-t border-metal-700 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-metal-500 text-sm">Spiele</p>
              <p className="font-mono font-bold text-white">{history.length}</p>
            </div>
            <div className="text-center">
              <p className="text-metal-500 text-sm">Gewonnen</p>
              <p className="font-mono font-bold text-green-400">
                {history.filter(h => h.result === 'win').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-metal-500 text-sm">Verloren</p>
              <p className="font-mono font-bold text-red-400">
                {history.filter(h => h.result === 'lose').length}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
