'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Star, Zap, Shield, Users, Settings, BarChart3, Code, Github, Heart, Check, ArrowRight, Cpu, Wifi, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function AdminToolPage() {
  const [activeTab, setActiveTab] = useState('features')

  const features = [
    {
      icon: Wifi,
      title: 'Multi-Server Management',
      description: 'Verwalte mehrere Rust Server gleichzeitig mit RCON-Verbindung und Echtzeit-Monitoring'
    },
    {
      icon: Users,
      title: 'Player Management',
      description: 'Live Spieler-Liste, Statistiken, Kick/Ban mit Gründen und 12 Monate Spieler-Historie'
    },
    {
      icon: Code,
      title: 'RCON Console',
      description: 'Vollständige Konsolen-Kontrolle mit Befehls-Historie und Quick-Commands'
    },
    {
      icon: Cpu,
      title: 'Server Monitoring',
      description: 'Echtzeit FPS, Memory, Entities Überwachung mit automatischer Reconnect-Funktion'
    },
    {
      icon: Settings,
      title: 'Plugin Management',
      description: 'Oxide/uMod & Carbon Support - Installation, Updates, Enable/Disable/Reload'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Logging',
      description: 'Performance-Metriken, Spieler-Aktivitäts-Tracking, Event-Logging und Datenexport'
    },
    {
      icon: Lock,
      title: 'Config Editor',
      description: 'Echtzeit Konfigurationsbearbeitung mit JSON Validierung und Auto-Backup'
    },
    {
      icon: Heart,
      title: 'Discord Integration',
      description: 'Bot-Anbindung, Chat-Bridge, Alert-System und Admin-Commands über Discord'
    }
  ]

  const specs = [
    { label: 'Framework', value: '.NET 8.0 + WPF' },
    { label: 'Plattform', value: 'Windows 10/11 (64-bit)' },
    { label: 'Größe', value: '~50 MB (Single EXE)' },
    { label: 'Lizenz', value: 'MIT - Kostenlos & Open Source' },
    { label: 'UI Theme', value: '3 professionelle Themes (Dark/Light/Blue)' },
    { label: 'Datenbank', value: 'SQLite + Entity Framework Core' }
  ]

  const steps = [
    {
      number: '1',
      title: 'Download',
      description: 'Lade die neueste Version herunter'
    },
    {
      number: '2',
      title: '.NET 8 installieren',
      description: 'Falls noch nicht vorhanden'
    },
    {
      number: '3',
      title: 'Tool starten',
      description: 'Doppelklick auf EldrunAdminTool.exe'
    },
    {
      number: '4',
      title: 'Server verbinden',
      description: 'RCON-Daten eingeben und verbinden'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-metal-950 via-metal-950 to-black pt-24 pb-20">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-rust-500 to-amber-600 shadow-2xl">
              <Cpu className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 tracking-tight">
            Eldrun Admin Tool
          </h1>

          <p className="text-xl md:text-2xl text-metal-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Das ultimative <span className="text-gold-400 font-bold">kostenlose</span> Rust Server Administration Tool der Eldrun Community. Professionell. Selbst programmiert. Open Source.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => window.open('https://github.com/eldrun/admin-tool/releases', '_blank')}
              className="bg-gradient-to-r from-rust-500 to-amber-600 hover:from-rust-600 hover:to-amber-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              <Download className="w-5 h-5" />
              Jetzt Kostenlos Downloaden
            </Button>
            <Button
              onClick={() => window.open('https://github.com/eldrun/admin-tool', '_blank')}
              className="bg-metal-800 hover:bg-metal-700 text-gold-400 border border-gold-500/50 font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 text-lg transition-all"
            >
              <Github className="w-5 h-5" />
              GitHub Repository
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-metal-400">
            <Star className="w-5 h-5 text-gold-400 fill-gold-400" />
            <span>Über 1000+ Downloads • 100% Kostenlos • MIT Lizenz</span>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {[
            { icon: Zap, title: 'Blitzschnell', desc: 'Native Windows App - keine Verzögerungen' },
            { icon: Shield, title: 'Sicher', desc: 'Lokale Speicherung - deine Daten gehören dir' },
            { icon: Code, title: 'Open Source', desc: 'Vollständiger Quellcode auf GitHub' }
          ].map((item, i) => (
            <div key={i} className="bg-metal-900/50 border border-metal-800 rounded-xl p-6 hover:border-gold-500/50 transition-all">
              <item.icon className="w-8 h-8 text-gold-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-metal-400">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-20"
        >
          <div className="flex gap-4 mb-8 border-b border-metal-800">
            {[
              { id: 'features', label: 'Features' },
              { id: 'specs', label: 'Spezifikationen' },
              { id: 'installation', label: 'Installation' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-bold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-gold-400 border-gold-400'
                    : 'text-metal-400 border-transparent hover:text-gold-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Features Tab */}
          {activeTab === 'features' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {features.map((feature, i) => (
                <div key={i} className="bg-metal-900/30 border border-metal-800 rounded-xl p-6 hover:border-gold-500/50 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-rust-500/20 to-amber-600/20 rounded-lg group-hover:from-rust-500/30 group-hover:to-amber-600/30 transition-all">
                      <feature.icon className="w-6 h-6 text-gold-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-metal-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Specs Tab */}
          {activeTab === 'specs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {specs.map((spec, i) => (
                <div key={i} className="bg-metal-900/30 border border-metal-800 rounded-xl p-6 flex items-center justify-between">
                  <span className="text-metal-400 font-semibold">{spec.label}</span>
                  <span className="text-gold-400 font-bold">{spec.value}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Installation Tab */}
          {activeTab === 'installation' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {steps.map((step, i) => (
                  <div key={i} className="relative">
                    <div className="bg-gradient-to-br from-rust-500 to-amber-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg mb-4">
                      {step.number}
                    </div>
                    <h3 className="font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-metal-400 text-sm">{step.description}</p>
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-6 left-12 w-full h-0.5 bg-gradient-to-r from-gold-500 to-transparent"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-metal-900/50 border border-gold-500/30 rounded-xl p-8">
                <h3 className="text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Voraussetzungen
                </h3>
                <ul className="space-y-3 text-metal-300">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-gold-400" />
                    Windows 10 oder 11 (64-bit)
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-gold-400" />
                    .NET 8.0 Runtime (kostenlos von microsoft.com)
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-gold-400" />
                    ~50 MB freier Speicherplatz
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-gold-400" />
                    Rust Server mit aktiviertem RCON
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Key Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gradient-to-r from-rust-500/10 via-amber-600/10 to-rust-500/10 border border-gold-500/20 rounded-2xl p-12 mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-300 mb-8">
            Warum Eldrun Admin Tool?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-gold-400" />
                Von der Community, für die Community
              </h3>
              <p className="text-metal-300">
                Entwickelt von Eldrun für Rust Server Administratoren. Keine versteckten Kosten, keine Telemetrie, keine Werbung.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-gold-400" />
                Professionelle Qualität
              </h3>
              <p className="text-metal-300">
                Gebaut mit modernem .NET 8, WPF und Best Practices. Produktionsreife Robustheit und Performance.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-gold-400" />
                Vollständig Open Source
              </h3>
              <p className="text-metal-300">
                MIT Lizenz - du kannst den Code einsehen, modifizieren und erweitern. Keine Geheimnisse.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-gold-400" />
                Ständig verbessert
              </h3>
              <p className="text-metal-300">
                Regelmäßige Updates, Bug Fixes und neue Features basierend auf Community Feedback.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 mb-6">
            Bereit, deinen Server zu verwalten?
          </h2>
          <p className="text-xl text-metal-300 mb-8 max-w-2xl mx-auto">
            Lade das Eldrun Admin Tool jetzt kostenlos herunter und erlebe professionelle Rust Server Administration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.open('https://github.com/eldrun/admin-tool/releases', '_blank')}
              className="bg-gradient-to-r from-rust-500 to-amber-600 hover:from-rust-600 hover:to-amber-700 text-white font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-2 text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              <Download className="w-5 h-5" />
              Download (Kostenlos)
            </Button>
            <Button
              onClick={() => window.open('https://github.com/eldrun/admin-tool', '_blank')}
              className="bg-metal-800 hover:bg-metal-700 text-gold-400 border border-gold-500/50 font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-2 text-lg transition-all"
            >
              <Github className="w-5 h-5" />
              Source Code
            </Button>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 pt-12 border-t border-metal-800 text-center text-metal-400"
        >
          <p className="mb-4">
            Fragen? Probleme? Beiträge?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <a href="https://eldrun.lol" className="text-gold-400 hover:text-gold-300 transition-colors">
              Website
            </a>
            <span>•</span>
            <a href="https://github.com/eldrun/admin-tool/issues" className="text-gold-400 hover:text-gold-300 transition-colors">
              GitHub Issues
            </a>
            <span>•</span>
            <a href="https://discord.gg/eldrun" className="text-gold-400 hover:text-gold-300 transition-colors">
              Discord Community
            </a>
          </div>
          <p className="mt-6 text-xs">
            Made with ❤️ by the Eldrun Community • MIT License
          </p>
        </motion.div>
      </div>
    </div>
  )
}
