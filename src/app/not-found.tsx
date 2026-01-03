'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Sword, Shield, Skull } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-metal-950 via-metal-900 to-metal-950 flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <div className="text-[180px] md:text-[240px] font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-rust-500 via-rust-600 to-rust-800 leading-none select-none">
            404
          </div>
          
          {/* Floating Icons */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-1/4 left-0 text-rust-500/30"
          >
            <Sword className="w-12 h-12" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute top-1/3 right-0 text-amber-500/30"
          >
            <Shield className="w-14 h-14" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-1/4 left-1/4 text-metal-600/50"
          >
            <Skull className="w-10 h-10" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Territorium nicht gefunden
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-metal-400 text-lg mb-8 max-w-md mx-auto"
        >
          Dieses Land wurde von den Schatten verschlungen. 
          Kehre zurück zu den sicheren Mauern von Eldrun.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rust-600 to-rust-700 hover:from-rust-500 hover:to-rust-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-rust-900/50 hover:shadow-rust-800/50"
          >
            <Home className="w-5 h-5" />
            Zur Startseite
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-metal-800 hover:bg-metal-700 text-metal-200 font-semibold rounded-lg transition-all duration-300 border border-metal-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </button>
        </motion.div>

        {/* Decorative Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-12 h-px bg-gradient-to-r from-transparent via-rust-500/50 to-transparent"
        />

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-metal-600 text-sm"
        >
          Error Code: 404 | ELDRUN - Pfad des Krieges
        </motion.p>
      </div>
    </div>
  )
}
