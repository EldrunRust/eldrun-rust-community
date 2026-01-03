'use client'

import { motion } from 'framer-motion'
import { Crosshair, Shield, Users, Timer, Plus, Radio } from 'lucide-react'
import Link from 'next/link'
import { AuthGate } from '@/components/AuthGate'

export default function OpsPage() {
  return (
    <AuthGate>
    <div className="min-h-screen bg-metal-950 pt-24">
      <div className="border-b border-metal-800 bg-metal-900/50 backdrop-blur-sm">
        <div className="container-rust py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rust-500/20 border border-rust-500/30 flex items-center justify-center">
                <Radio className="w-6 h-6 text-rust-400" />
              </div>
              <div>
                <h1 className="font-display font-black text-2xl text-white">OPS WAR ROOM</h1>
                <p className="text-metal-500 text-sm font-mono">Live-Pins • Rollen • Timer • Alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/ops/session/new">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-rust-600 hover:bg-rust-500 text-white font-body rounded-lg border border-rust-400/30 transition-colors">
                  <Plus className="w-4 h-4" />
                  Session erstellen
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-rust py-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Crosshair className="w-5 h-5 text-gold-400" />
              <h2 className="font-medieval font-bold text-white">Taktik & Pins</h2>
            </div>
            <p className="text-metal-400 text-sm">Setze Live-Pins (Danger, Loot, Base, Enemy). Koordiniere Pushes und Rotationen mit deinem Team.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-radiation-400" />
              <h2 className="font-medieval font-bold text-white">Rollen Board</h2>
            </div>
            <p className="text-metal-400 text-sm">Leader, Scout, Builder, Medic, Logistics. Jeder weiß sofort, was zu tun ist.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Timer className="w-5 h-5 text-rust-400" />
              <h2 className="font-medieval font-bold text-white">Mission Timer & Alerts</h2>
            </div>
            <p className="text-metal-400 text-sm">Timer für Push/Retreat/Extract. Alerts für Raid, Rare Drops, Enemy Spotted.</p>
          </motion.div>
        </div>

        <div className="mt-10 bg-metal-900/30 border border-metal-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-metal-300" />
            <h3 className="font-medieval font-bold text-white">Start</h3>
          </div>
          <p className="text-metal-400 text-sm mb-4">Für AAA-Flows starten wir mit Demo-Sessions (ohne Login). Danach hängen wir Rechte/Clan-Scopes dran.</p>
          <Link href="/ops/session/new">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-metal-800 hover:bg-metal-700 text-white font-body rounded-lg border border-metal-700 transition-colors">
              <Plus className="w-4 h-4" />
              Jetzt eine Ops Session erzeugen
            </span>
          </Link>
        </div>
      </div>
    </div>
    </AuthGate>
  )
}
