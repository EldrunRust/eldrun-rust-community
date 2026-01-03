'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, Save, Settings, Users, Star, Trophy, Coins,
  Clock, Shield, MessageSquare, Plus, Trash2, 
  Eye, EyeOff, CheckCircle, Zap
} from 'lucide-react'
import { ClanRecruitmentSettings, ClanData } from './ClanApplicationModal'

interface ClanSettingsModalProps {
  clan: ClanData
  onClose: () => void
  onSave: (settings: ClanRecruitmentSettings) => void
}

const CLASS_OPTIONS = [
  { id: 'krieger', label: 'Krieger', icon: '⚔️' },
  { id: 'assassine', label: 'Assassine', icon: '🗡️' },
  { id: 'magier', label: 'Magier', icon: '🔮' },
  { id: 'heiler', label: 'Heiler', icon: '💚' },
  { id: 'tank', label: 'Wächter', icon: '🛡️' },
]

export function ClanSettingsModal({ clan, onClose, onSave }: ClanSettingsModalProps) {
  const [settings, setSettings] = useState<ClanRecruitmentSettings>(
    clan.recruitmentSettings || {
      isOpen: true,
      minLevel: 1,
      minKD: 0,
      minPlaytime: 0,
      minCoins: 0,
      requiredClass: [],
      requiredFaction: null,
      autoAccept: false,
      requireDiscord: false,
      requireMic: false,
      customQuestions: [],
      welcomeMessage: '',
    }
  )
  const [isSaving, setIsSaving] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')

  const updateSetting = <K extends keyof ClanRecruitmentSettings>(
    key: K, 
    value: ClanRecruitmentSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const toggleClass = (classId: string) => {
    const current = settings.requiredClass || []
    if (current.includes(classId)) {
      updateSetting('requiredClass', current.filter(c => c !== classId))
    } else {
      updateSetting('requiredClass', [...current, classId])
    }
  }

  const addQuestion = () => {
    if (newQuestion.trim() && settings.customQuestions.length < 5) {
      updateSetting('customQuestions', [...settings.customQuestions, newQuestion.trim()])
      setNewQuestion('')
    }
  }

  const removeQuestion = (index: number) => {
    updateSetting('customQuestions', settings.customQuestions.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      onSave(settings)
    } finally {
      setIsSaving(false)
    }
  }

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
        className="bg-metal-900 border border-metal-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-metal-800">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-display text-xl font-bold text-white">Rekrutierungs-Einstellungen</h2>
              <p className="text-metal-400 text-sm">{clan.name} [{clan.tag}]</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-metal-800 rounded-lg">
            <X className="w-5 h-5 text-metal-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* Recruitment Toggle */}
          <div className="flex items-center justify-between p-4 bg-metal-800/50 border border-metal-700 rounded-lg">
            <div className="flex items-center gap-3">
              {settings.isOpen ? (
                <Eye className="w-5 h-5 text-green-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-red-400" />
              )}
              <div>
                <p className="text-white font-bold">Rekrutierung</p>
                <p className="text-metal-400 text-sm">
                  {settings.isOpen ? 'Offen für Bewerbungen' : 'Geschlossen'}
                </p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('isOpen', !settings.isOpen)}
              className={`w-14 h-7 rounded-full transition-colors ${settings.isOpen ? 'bg-green-500' : 'bg-metal-600'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.isOpen ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Requirements Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Mindestanforderungen
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Min Level */}
              <div>
                <label className="block text-sm text-metal-400 mb-2">
                  <Star className="w-4 h-4 inline mr-1" />
                  Mindest-Level
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.minLevel}
                  onChange={e => updateSetting('minLevel', parseInt(e.target.value) || 1)}
                  className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Min K/D */}
              <div>
                <label className="block text-sm text-metal-400 mb-2">
                  <Trophy className="w-4 h-4 inline mr-1" />
                  Mindest K/D Ratio
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={settings.minKD}
                  onChange={e => updateSetting('minKD', parseFloat(e.target.value) || 0)}
                  className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Min Playtime */}
              <div>
                <label className="block text-sm text-metal-400 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Mindest-Spielzeit (Stunden)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={settings.minPlaytime}
                  onChange={e => updateSetting('minPlaytime', parseInt(e.target.value) || 0)}
                  className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Min Coins */}
              <div>
                <label className="block text-sm text-metal-400 mb-2">
                  <Coins className="w-4 h-4 inline mr-1" />
                  Mindest-Coins
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000000"
                  step="100"
                  value={settings.minCoins}
                  onChange={e => updateSetting('minCoins', parseInt(e.target.value) || 0)}
                  className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Required Classes */}
            <div>
              <label className="block text-sm text-metal-400 mb-2">
                Bevorzugte Klassen (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {CLASS_OPTIONS.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => toggleClass(cls.id)}
                    className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                      settings.requiredClass?.includes(cls.id)
                        ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                        : 'border-metal-700 bg-metal-800 text-metal-400 hover:border-metal-600'
                    }`}
                  >
                    <span>{cls.icon}</span>
                    <span className="text-sm">{cls.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Communication Requirements */}
          <div className="space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              Kommunikation
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-metal-800/50 border border-metal-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">Discord Pflicht</p>
                  <p className="text-metal-500 text-xs">Bewerber müssen Discord Tag angeben</p>
                </div>
                <button
                  onClick={() => updateSetting('requireDiscord', !settings.requireDiscord)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.requireDiscord ? 'bg-amber-500' : 'bg-metal-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.requireDiscord ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-metal-800/50 border border-metal-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">Mikrofon Pflicht</p>
                  <p className="text-metal-500 text-xs">Für Voice-Chat erforderlich</p>
                </div>
                <button
                  onClick={() => updateSetting('requireMic', !settings.requireMic)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.requireMic ? 'bg-amber-500' : 'bg-metal-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.requireMic ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Auto Accept */}
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-bold">Auto-Akzeptieren</p>
                <p className="text-metal-400 text-sm">
                  Bewerber die alle Anforderungen erfüllen werden automatisch aufgenommen
                </p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('autoAccept', !settings.autoAccept)}
              className={`w-14 h-7 rounded-full transition-colors ${settings.autoAccept ? 'bg-green-500' : 'bg-metal-600'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.autoAccept ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Custom Questions */}
          <div className="space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Eigene Fragen (max. 5)
            </h3>

            <div className="space-y-2">
              {settings.customQuestions.map((q, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-metal-800/50 border border-metal-700 rounded-lg">
                  <span className="text-metal-400 text-sm flex-1">{q}</span>
                  <button
                    onClick={() => removeQuestion(i)}
                    className="p-1 hover:bg-red-500/20 rounded text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {settings.customQuestions.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="Neue Frage hinzufügen..."
                  className="flex-1 bg-metal-800 border border-metal-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  onKeyDown={e => e.key === 'Enter' && addQuestion()}
                />
                <button
                  onClick={addQuestion}
                  disabled={!newQuestion.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Welcome Message */}
          <div>
            <label className="block text-sm text-metal-400 mb-2">
              Willkommensnachricht (optional)
            </label>
            <textarea
              value={settings.welcomeMessage}
              onChange={e => updateSetting('welcomeMessage', e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full bg-metal-800 border border-metal-700 rounded-lg px-4 py-3 text-white resize-none focus:border-amber-500 focus:outline-none"
              placeholder="Diese Nachricht wird neuen Mitgliedern nach der Aufnahme angezeigt..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-metal-800">
          <button
            onClick={onClose}
            className="px-6 py-2 text-metal-400 hover:text-white transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Einstellungen speichern
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
