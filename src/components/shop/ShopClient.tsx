'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Activity, Coins, Star, LogIn, User, Gavel } from 'lucide-react'
import { HeatmapShop } from '@/components/heatmap/HeatmapShop'
import { useStore } from '@/store/useStore'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function ShopClient() {
  const { currentUser, openAuthModal } = useStore()

  return (
    <div className="space-y-8">
      {/* Shop Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-metal-900/50 border border-metal-800 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/shop/auction">
            <Button variant="ghost" className="gap-2 border-gold-500/30 text-gold-400 hover:bg-gold-500/10">
              <Gavel className="w-4 h-4" />
              Auktionshaus
            </Button>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-metal-800 border border-metal-700 rounded-lg">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="font-mono text-sm text-metal-300">SHOP ONLINE</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <img src="/images/currency/gold.svg" alt="Gold" className="w-5 h-5 object-contain" />
                <span className="font-mono font-bold text-amber-400">{currentUser.coins.toLocaleString()}</span>
              </div>
              <Link 
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 bg-metal-800 border border-metal-700 rounded-lg hover:border-rust-500 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-rust-500 to-amber-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-white">{currentUser.displayName || currentUser.username}</p>
                  <p className="text-xs text-metal-400">Level {currentUser.level}</p>
                </div>
              </Link>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-2 px-4 py-2 bg-rust-600 hover:bg-rust-500 text-white font-bold rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Anmelden
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <HeatmapShop />
      </motion.div>
    </div>
  )
}
