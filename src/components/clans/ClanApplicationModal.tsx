'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Send, Users, Star, Trophy, Sword, Clock,
  CheckCircle, AlertCircle, MessageSquare, Crown,
  Shield, Zap, Coins, Target, Heart
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import Link from 'next/link'

// Clan recruitment settings interface
export interface ClanRecruitmentSettings {
  isOpen: boolean
  minLevel: number
  minKD: number
  minPlaytime: number // in hours
  minCoins: number
  requiredClass?: string[]
  requiredFaction?: 'seraphar' | 'vorgaroth' | null
  autoAccept: boolean
  requireDiscord: boolean
  requireMic: boolean
  customQuestions: string[]
  welcomeMessage: string
}

export interface ClanData {
  id: string
  name: string
  tag: string
  logo: string
  faction: 'seraphar' | 'vorgaroth'
  level: number
  members: number
  maxMembers: number
  kills: number
  wars: { won: number; lost: number }
  founded: string
  leader: string
  description: string
  recruiting: boolean
  requirements?: string
  recruitmentSettings?: ClanRecruitmentSettings
}

interface ClanApplicationModalProps {
  clan: ClanData
  onClose: () => void
  onSubmit: (application: ClanApplication) => void
}

export interface ClanApplication {
  clanId: string
  clanName: string
  applicantId: string
  applicantName: string
  applicantLevel: number
  applicantClass: string
  applicantFaction: string
  message: string
  answers: Record<string, string>
  discordTag?: string
  hasMic: boolean
  availability: string
  playstyle: string
  previousClans: string
  whyJoin: string
  submittedAt: Date
  status: 'pending' | 'accepted' | 'rejected'
}

const PLAYSTYLES = [
  { id: 'pvp', label: 'PvP Fokus', icon: '⚔️', description: 'Raids, Kämpfe, Territorienkontrolle' },
  { id: 'pve', label: 'PvE Fokus', icon: '🐉', description: 'Quests, Dungeons, Boss-Kämpfe' },
  { id: 'builder', label: 'Builder', icon: '🏰', description: 'Base Building, Ressourcen' },
  { id: 'casual', label: 'Casual', icon: '🎮', description: 'Entspanntes Spielen' },
  { id: 'hardcore', label: 'Hardcore', icon: '💀', description: 'Täglich aktiv, kompetitiv' },
]

const AVAILABILITY = [
  { id: 'daily', label: 'Täglich', hours: '4+ Stunden' },
  { id: 'regular', label: 'Regelmäßig', hours: '2-4 Stunden' },
  { id: 'weekend', label: 'Wochenende', hours: 'Hauptsächlich WE' },
  { id: 'flexible', label: 'Flexibel', hours: 'Unterschiedlich' },
]

export function ClanApplicationModal({ clan, onClose, onSubmit }: ClanApplicationModalProps) {
  const { currentUser } = useStore()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    message: '',
    discordTag: '',
    hasMic: false,
    availability: '',
    playstyle: '',
    previousClans: '',
    whyJoin: '',
    customAnswers: {} as Record<string, string>,
  })

  // Check eligibility
  const recruitmentSettings = clan.recruitmentSettings || {
    isOpen: true,
    minLevel: 1,
    minKD: 0,
    minPlaytime: 0,
    minCoins: 0,
    autoAccept: false,
    requireDiscord: false,
    requireMic: false,
    customQuestions: [],
    welcomeMessage: '',
  }

  const userLevel = currentUser?.level || 0
  const userKD = currentUser ? (currentUser.kills / Math.max(1, currentUser.deaths)) : 0
  const userPlaytime = currentUser ? Math.floor(currentUser.playtime / 3600) : 0
  const userCoins = currentUser?.coins || 0

  const eligibilityChecks = [
    { 
      label: `Mindest-Level ${recruitmentSettings.minLevel}`, 
      passed: userLevel >= recruitmentSettings.minLevel,
      current: `Dein Level: ${userLevel}`
    },
    { 
      label: `K/D Ratio ${recruitmentSettings.minKD}+`, 
      passed: userKD >= recruitmentSettings.minKD,
      current: `Deine K/D: ${userKD.toFixed(2)}`
    },
    { 
      label: `${recruitmentSettings.minPlaytime}+ Stunden Spielzeit`, 
      passed: userPlaytime >= recruitmentSettings.minPlaytime,
      current: `Deine Spielzeit: ${userPlaytime}h`
    },
    { 
      label: `${recruitmentSettings.minCoins}+ Coins`, 
      passed: userCoins >= recruitmentSettings.minCoins,
      current: `Deine Coins: ${userCoins.toLocaleString()}`
    },
  ]

  const allEligible = eligibilityChecks.every(c => c.passed)
  const isFull = clan.members >= clan.maxMembers

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!currentUser) return

    setIsSubmitting(true)
    setError(null)

    try {
      const application: ClanApplication = {
        clanId: clan.id,
        clanName: clan.name,
        applicantId: currentUser.id,
        applicantName: currentUser.username,
        applicantLevel: currentUser.level,
        applicantClass: currentUser.playerClass || 'unknown',
        applicantFaction: currentUser.faction || 'none',
        message: formData.message,
        answers: formData.customAnswers,
        discordTag: formData.discordTag,
        hasMic: formData.hasMic,
        availability: formData.availability,
        playstyle: formData.playstyle,
        previousClans: formData.previousClans,
        whyJoin: formData.whyJoin,
        submittedAt: new Date(),
        status: recruitmentSettings.autoAccept ? 'accepted' : 'pending',
      }

      onSubmit(application)
      setSubmitted(true)
    } catch (err) {
      setError('Fehler beim Senden der Bewerbung. Bitte versuche es erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Not logged in
  if (!currentUser) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-8">
          <Users className="w-16 h-16 text-metal-600 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Anmeldung erforderlich</h2>
          <p className="text-metal-400 mb-6">
            Du musst angemeldet sein, um dich bei einer Gilde zu bewerben.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rust-600 hover:bg-rust-500 text-white font-bold rounded-lg"
          >
            Jetzt anmelden
          </Link>
        </div>
      </ModalWrapper>
    )
  }

  // Clan is full
  if (isFull) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Gilde ist voll</h2>
          <p className="text-metal-400 mb-6">
            {clan.name} hat bereits die maximale Mitgliederzahl ({clan.maxMembers}) erreicht.
          </p>
          <button onClick={onClose} className="px-6 py-3 bg-metal-700 hover:bg-metal-600 text-white font-bold rounded-lg">
            Schließen
          </button>
        </div>
      </ModalWrapper>
    )
  }

  // Success screen
  if (submitted) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Bewerbung gesendet!</h2>
          <p className="text-metal-400 mb-4">
            Deine Bewerbung bei <span className="text-amber-400">{clan.name}</span> wurde erfolgreich übermittelt.
          </p>
          {recruitmentSettings.autoAccept ? (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg mb-6">
              <p className="text-green-400 font-medium">Du wurdest automatisch akzeptiert!</p>
              <p className="text-metal-400 text-sm">Willkommen in der Gilde!</p>
            </div>
          ) : (
            <p className="text-metal-500 text-sm mb-6">
              Die Gildenmitglieder werden deine Bewerbung prüfen. Du erhältst eine Benachrichtigung.
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-6 py-3 bg-metal-700 hover:bg-metal-600 text-white font-bold rounded-lg">
              Schließen
            </button>
            <Link
              href={`/forum/board/clans?clan=${clan.id}`}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
            >
              Gilde im Forum
            </Link>
          </div>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-metal-800">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{clan.logo}</span>
          <div>
            <h2 className="font-display text-xl font-bold text-white">Bewerbung bei {clan.name}</h2>
            <p className="text-metal-400 text-sm">[{clan.tag}] • {clan.members}/{clan.maxMembers} Mitglieder</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-metal-800 rounded-lg">
          <X className="w-5 h-5 text-metal-400" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-metal-800">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                s < step ? 'bg-green-500 text-white' :
                s === step ? 'bg-amber-500 text-white' :
                'bg-metal-700 text-metal-400'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 ${s < step ? 'bg-green-500' : 'bg-metal-700'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-metal-500">
          <span>Voraussetzungen</span>
          <span>Bewerbung</span>
          <span>Abschluss</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Eligibility Check */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="font-bold text-white text-lg mb-4">Voraussetzungen prüfen</h3>
              
              <div className="space-y-3">
                {eligibilityChecks.map((check, i) => (
                  <div 
                    key={i}
                    className={`p-4 rounded-lg border ${
                      check.passed 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {check.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="text-white font-medium">{check.label}</span>
                      </div>
                      <span className={`text-sm ${check.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {check.current}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {recruitmentSettings.requireDiscord && (
                <div className="p-4 bg-[#5865F2]/20 border border-[#5865F2]/30 rounded-lg">
                  <div className="flex items-center gap-2 text-[#5865F2]">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">Discord Pflicht</span>
                  </div>
                  <p className="text-metal-400 text-sm mt-1">Diese Gilde erfordert Discord-Mitgliedschaft.</p>
                </div>
              )}

              {!allEligible && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">
                    Du erfüllst nicht alle Voraussetzungen. Du kannst trotzdem eine Bewerbung einreichen, 
                    aber die Chancen auf Aufnahme sind geringer.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Application Form */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="font-bold text-white text-lg">Deine Bewerbung</h3>

              {/* Why Join */}
              <div>
                <label className="block text-sm font-medium text-metal-300 mb-2">
                  Warum möchtest du {clan.name} beitreten? *
                </label>
                <textarea
                  value={formData.whyJoin}
                  onChange={e => updateField('whyJoin', e.target.value)}
                  rows={3}
                  maxLength={500}
                  required
                  className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white resize-none focus:border-amber-500 focus:outline-none"
                  placeholder="Erzähle uns, was dich an dieser Gilde interessiert..."
                />
                <p className="text-xs text-metal-500 mt-1">{formData.whyJoin.length}/500</p>
              </div>

              {/* Playstyle */}
              <div>
                <label className="block text-sm font-medium text-metal-300 mb-2">
                  Dein Spielstil *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PLAYSTYLES.map(style => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => updateField('playstyle', style.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.playstyle === style.id
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-metal-700 bg-metal-800/50 hover:border-metal-600'
                      }`}
                    >
                      <span className="text-2xl">{style.icon}</span>
                      <p className="text-white font-medium text-sm mt-1">{style.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-metal-300 mb-2">
                  Verfügbarkeit *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABILITY.map(avail => (
                    <button
                      key={avail.id}
                      type="button"
                      onClick={() => updateField('availability', avail.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.availability === avail.id
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-metal-700 bg-metal-800/50 hover:border-metal-600'
                      }`}
                    >
                      <p className="text-white font-medium">{avail.label}</p>
                      <p className="text-metal-400 text-xs">{avail.hours}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Previous Clans */}
              <div>
                <label className="block text-sm font-medium text-metal-300 mb-2">
                  Frühere Gilden (optional)
                </label>
                <input
                  type="text"
                  value={formData.previousClans}
                  onChange={e => updateField('previousClans', e.target.value)}
                  className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="z.B. Iron Legion (3 Monate), Phoenix Rising..."
                />
              </div>

              {/* Discord Tag */}
              {recruitmentSettings.requireDiscord && (
                <div>
                  <label className="block text-sm font-medium text-metal-300 mb-2">
                    Discord Tag *
                  </label>
                  <input
                    type="text"
                    value={formData.discordTag}
                    onChange={e => updateField('discordTag', e.target.value)}
                    required
                    className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="username#0000 oder username"
                  />
                </div>
              )}

              {/* Has Mic */}
              {recruitmentSettings.requireMic && (
                <div className="flex items-center justify-between p-4 bg-metal-800/50 border border-metal-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Mikrofon vorhanden?</p>
                    <p className="text-metal-400 text-sm">Für Voice-Chat erforderlich</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('hasMic', !formData.hasMic)}
                    className={`w-12 h-6 rounded-full transition-colors ${formData.hasMic ? 'bg-green-500' : 'bg-metal-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.hasMic ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              )}

              {/* Additional Message */}
              <div>
                <label className="block text-sm font-medium text-metal-300 mb-2">
                  Zusätzliche Nachricht (optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={e => updateField('message', e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white resize-none focus:border-amber-500 focus:outline-none"
                  placeholder="Weitere Informationen, die du teilen möchtest..."
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="font-bold text-white text-lg">Bewerbung überprüfen</h3>

              {/* Summary */}
              <div className="space-y-4">
                <div className="p-4 bg-metal-800/50 border border-metal-700 rounded-lg">
                  <p className="text-metal-500 text-sm mb-1">Gilde</p>
                  <p className="text-white font-bold flex items-center gap-2">
                    <span className="text-2xl">{clan.logo}</span>
                    {clan.name} [{clan.tag}]
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-metal-800/50 border border-metal-700 rounded-lg">
                    <p className="text-metal-500 text-sm mb-1">Spielstil</p>
                    <p className="text-white font-medium">
                      {PLAYSTYLES.find(s => s.id === formData.playstyle)?.label || '-'}
                    </p>
                  </div>
                  <div className="p-4 bg-metal-800/50 border border-metal-700 rounded-lg">
                    <p className="text-metal-500 text-sm mb-1">Verfügbarkeit</p>
                    <p className="text-white font-medium">
                      {AVAILABILITY.find(a => a.id === formData.availability)?.label || '-'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-metal-800/50 border border-metal-700 rounded-lg">
                  <p className="text-metal-500 text-sm mb-1">Motivation</p>
                  <p className="text-white">{formData.whyJoin || '-'}</p>
                </div>

                {formData.previousClans && (
                  <div className="p-4 bg-metal-800/50 border border-metal-700 rounded-lg">
                    <p className="text-metal-500 text-sm mb-1">Frühere Gilden</p>
                    <p className="text-white">{formData.previousClans}</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              {/* Terms */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-amber-400 text-sm">
                  Mit dem Absenden stimmst du zu, dass deine Profilinformationen an die Gilde übermittelt werden.
                  Der Gildenleiter kann deine Bewerbung annehmen oder ablehnen.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-metal-800">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          className="px-6 py-2 text-metal-400 hover:text-white transition-colors"
        >
          {step === 1 ? 'Abbrechen' : 'Zurück'}
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 2 && (!formData.whyJoin || !formData.playstyle || !formData.availability)}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            Weiter
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Bewerbung absenden
          </button>
        )}
      </div>
    </ModalWrapper>
  )
}

// Modal wrapper component
function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-metal-900 border border-metal-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
