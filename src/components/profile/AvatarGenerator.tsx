'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shuffle, Download, Check, ChevronLeft, ChevronRight,
  Crown, Shield, Sword, Skull, Flame, Snowflake, Moon, Sun
} from 'lucide-react'

// Eldrun Game of Thrones Style Avatar Generator
// Generates unique fantasy avatars with customizable options

interface AvatarPart {
  id: string
  name: string
  options: string[]
}

// Avatar customization options in Eldrun/GoT style
const SKIN_TONES = ['#f5d0c5', '#e8b89a', '#d4a574', '#b8865f', '#8b5a3c', '#5c3d2e']
const HAIR_COLORS = ['#1a1a1a', '#3d2314', '#6b4423', '#8b4513', '#c4a35a', '#e8e8e8', '#8b0000', '#4a0080']
const EYE_COLORS = ['#4a90d9', '#2ecc71', '#8b4513', '#1a1a1a', '#9b59b6', '#e74c3c', '#f39c12']

// House/Faction sigils and colors
const FACTIONS = [
  { id: 'seraphar', name: 'Haus Seraphar', color: '#f59e0b', sigil: '☀️', motto: 'Licht über Allem' },
  { id: 'vorgaroth', name: 'Haus Vorgaroth', color: '#dc2626', sigil: '🐉', motto: 'Feuer und Blut' },
  { id: 'netharis', name: 'Haus Netharis', color: '#8b5cf6', sigil: '🌙', motto: 'Aus den Schatten' },
  { id: 'kaldrim', name: 'Haus Kaldrim', color: '#3b82f6', sigil: '❄️', motto: 'Der Winter naht' },
]

// Character classes
const CLASSES = [
  { id: 'krieger', name: 'Krieger', icon: '⚔️', description: 'Meister des Nahkampfs' },
  { id: 'assassine', name: 'Assassine', icon: '🗡️', description: 'Schnell und tödlich' },
  { id: 'magier', name: 'Magier', icon: '🔮', description: 'Beherrscher der Arkanen' },
  { id: 'heiler', name: 'Heiler', icon: '💚', description: 'Beschützer des Lebens' },
  { id: 'tank', name: 'Wächter', icon: '🛡️', description: 'Unerschütterliche Verteidigung' },
]

// Face shapes and features
const FACE_SHAPES = ['oval', 'round', 'square', 'diamond', 'heart']
const HAIR_STYLES = [
  'kurz', 'mittel', 'lang', 'geflochten', 'hochgesteckt', 
  'krieger', 'nordisch', 'kahl', 'mohawk', 'dreadlocks'
]
const FACIAL_HAIR = ['none', 'stubble', 'beard', 'goatee', 'braided', 'viking', 'mustache']
const ARMOR_STYLES = ['leather', 'chainmail', 'plate', 'royal', 'assassin', 'mage_robes', 'fur']
const ACCESSORIES = ['none', 'scar', 'eyepatch', 'crown', 'circlet', 'war_paint', 'tattoo', 'hood']

interface AvatarConfig {
  skinTone: number
  hairColor: number
  eyeColor: number
  faceShape: number
  hairStyle: number
  facialHair: number
  armor: number
  accessory: number
  faction: number
  playerClass: number
  background: number
}

const BACKGROUNDS = [
  { id: 'castle', name: 'Burg', gradient: 'from-stone-800 to-stone-900' },
  { id: 'forest', name: 'Wald', gradient: 'from-green-900 to-emerald-950' },
  { id: 'fire', name: 'Feuer', gradient: 'from-orange-900 to-red-950' },
  { id: 'ice', name: 'Eis', gradient: 'from-cyan-800 to-blue-950' },
  { id: 'night', name: 'Nacht', gradient: 'from-indigo-900 to-slate-950' },
  { id: 'gold', name: 'Gold', gradient: 'from-amber-700 to-yellow-900' },
]

interface AvatarGeneratorProps {
  onSelect: (avatarData: string) => void
  onClose: () => void
  currentFaction?: string
  currentClass?: string
}

export function AvatarGenerator({ onSelect, onClose, currentFaction, currentClass }: AvatarGeneratorProps) {
  const [config, setConfig] = useState<AvatarConfig>({
    skinTone: 0,
    hairColor: 0,
    eyeColor: 0,
    faceShape: 0,
    hairStyle: 0,
    facialHair: 0,
    armor: 0,
    accessory: 0,
    faction: currentFaction ? FACTIONS.findIndex(f => f.id === currentFaction) : 0,
    playerClass: currentClass ? CLASSES.findIndex(c => c.id === currentClass) : 0,
    background: 0,
  })

  const [activeCategory, setActiveCategory] = useState<keyof AvatarConfig>('skinTone')

  const categories: { key: keyof AvatarConfig; label: string; icon: React.ReactNode; options: number }[] = [
    { key: 'skinTone', label: 'Hautton', icon: <div className="w-4 h-4 rounded-full bg-amber-200" />, options: SKIN_TONES.length },
    { key: 'hairColor', label: 'Haarfarbe', icon: <div className="w-4 h-4 rounded-full bg-amber-900" />, options: HAIR_COLORS.length },
    { key: 'eyeColor', label: 'Augenfarbe', icon: <div className="w-4 h-4 rounded-full bg-blue-500" />, options: EYE_COLORS.length },
    { key: 'faceShape', label: 'Gesichtsform', icon: <Moon className="w-4 h-4" />, options: FACE_SHAPES.length },
    { key: 'hairStyle', label: 'Frisur', icon: <Crown className="w-4 h-4" />, options: HAIR_STYLES.length },
    { key: 'facialHair', label: 'Bart', icon: <Skull className="w-4 h-4" />, options: FACIAL_HAIR.length },
    { key: 'armor', label: 'Rüstung', icon: <Shield className="w-4 h-4" />, options: ARMOR_STYLES.length },
    { key: 'accessory', label: 'Accessoire', icon: <Sword className="w-4 h-4" />, options: ACCESSORIES.length },
    { key: 'faction', label: 'Fraktion', icon: <Flame className="w-4 h-4" />, options: FACTIONS.length },
    { key: 'playerClass', label: 'Klasse', icon: <Sword className="w-4 h-4" />, options: CLASSES.length },
    { key: 'background', label: 'Hintergrund', icon: <Sun className="w-4 h-4" />, options: BACKGROUNDS.length },
  ]

  const updateConfig = (key: keyof AvatarConfig, delta: number) => {
    const category = categories.find(c => c.key === key)
    if (!category) return

    setConfig(prev => ({
      ...prev,
      [key]: (prev[key] + delta + category.options) % category.options
    }))
  }

  const randomize = () => {
    setConfig({
      skinTone: Math.floor(Math.random() * SKIN_TONES.length),
      hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
      eyeColor: Math.floor(Math.random() * EYE_COLORS.length),
      faceShape: Math.floor(Math.random() * FACE_SHAPES.length),
      hairStyle: Math.floor(Math.random() * HAIR_STYLES.length),
      facialHair: Math.floor(Math.random() * FACIAL_HAIR.length),
      armor: Math.floor(Math.random() * ARMOR_STYLES.length),
      accessory: Math.floor(Math.random() * ACCESSORIES.length),
      faction: Math.floor(Math.random() * FACTIONS.length),
      playerClass: Math.floor(Math.random() * CLASSES.length),
      background: Math.floor(Math.random() * BACKGROUNDS.length),
    })
  }

  const generateAvatarSVG = useCallback(() => {
    const faction = FACTIONS[config.faction]
    const playerClass = CLASSES[config.playerClass]
    const background = BACKGROUNDS[config.background]
    const skinColor = SKIN_TONES[config.skinTone]
    const hairColor = HAIR_COLORS[config.hairColor]
    const eyeColor = EYE_COLORS[config.eyeColor]

    // Generate a unique avatar SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${faction.color}22"/>
            <stop offset="100%" style="stop-color:#1a1a1a"/>
          </linearGradient>
          <linearGradient id="armor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#555"/>
            <stop offset="100%" style="stop-color:#222"/>
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="200" height="200" fill="url(#bg)"/>
        <circle cx="100" cy="200" r="120" fill="${faction.color}11"/>
        
        <!-- Body/Armor -->
        <ellipse cx="100" cy="190" rx="60" ry="40" fill="url(#armor)"/>
        <rect x="60" y="150" width="80" height="50" fill="#333" rx="5"/>
        
        <!-- Neck -->
        <rect x="85" y="120" width="30" height="35" fill="${skinColor}"/>
        
        <!-- Head -->
        <ellipse cx="100" cy="90" rx="45" ry="50" fill="${skinColor}"/>
        
        <!-- Hair -->
        <ellipse cx="100" cy="55" rx="48" ry="35" fill="${hairColor}"/>
        <ellipse cx="60" cy="70" rx="15" ry="25" fill="${hairColor}"/>
        <ellipse cx="140" cy="70" rx="15" ry="25" fill="${hairColor}"/>
        
        <!-- Eyes -->
        <ellipse cx="80" cy="85" rx="10" ry="7" fill="white"/>
        <ellipse cx="120" cy="85" rx="10" ry="7" fill="white"/>
        <circle cx="80" cy="85" r="5" fill="${eyeColor}"/>
        <circle cx="120" cy="85" r="5" fill="${eyeColor}"/>
        <circle cx="80" cy="85" r="2" fill="#000"/>
        <circle cx="120" cy="85" r="2" fill="#000"/>
        
        <!-- Eyebrows -->
        <path d="M 68 75 Q 80 70 92 75" stroke="${hairColor}" stroke-width="3" fill="none"/>
        <path d="M 108 75 Q 120 70 132 75" stroke="${hairColor}" stroke-width="3" fill="none"/>
        
        <!-- Nose -->
        <path d="M 100 85 L 100 100 L 95 105" stroke="${skinColor}" stroke-width="2" fill="none" style="filter:brightness(0.9)"/>
        
        <!-- Mouth -->
        <path d="M 85 115 Q 100 122 115 115" stroke="#8b4513" stroke-width="2" fill="none"/>
        
        <!-- Facial Hair (if applicable) -->
        ${config.facialHair > 0 ? `<ellipse cx="100" cy="125" rx="20" ry="15" fill="${hairColor}" opacity="0.8"/>` : ''}
        
        <!-- Accessory -->
        ${config.accessory === 3 ? `<path d="M 60 40 L 100 25 L 140 40 L 130 50 L 100 40 L 70 50 Z" fill="${faction.color}"/>` : ''}
        ${config.accessory === 4 ? `<ellipse cx="100" cy="45" rx="35" ry="5" fill="${faction.color}" opacity="0.8"/>` : ''}
        ${config.accessory === 1 ? `<path d="M 70 80 L 85 95" stroke="#8b0000" stroke-width="3"/>` : ''}
        
        <!-- Faction Emblem -->
        <circle cx="100" cy="165" r="15" fill="${faction.color}33" stroke="${faction.color}" stroke-width="2"/>
        <text x="100" y="172" text-anchor="middle" font-size="16">${faction.sigil}</text>
        
        <!-- Class Icon -->
        <circle cx="170" cy="30" r="20" fill="#00000066"/>
        <text x="170" y="38" text-anchor="middle" font-size="20">${playerClass.icon}</text>
      </svg>
    `

    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
  }, [config])

  const handleSelect = () => {
    const avatarData = generateAvatarSVG()
    onSelect(avatarData)
  }

  const currentFactionData = FACTIONS[config.faction]
  const currentClassData = CLASSES[config.playerClass]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-metal-900 border border-metal-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-metal-800 bg-gradient-to-r from-rust-900/50 to-metal-900">
          <h2 className="font-display font-black text-2xl text-white flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-400" />
            Eldrun Avatar Generator
          </h2>
          <p className="text-metal-400 mt-1">Erstelle deinen einzigartigen Charakter im Stil der Eldrun-Häuser</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Preview */}
          <div className="space-y-4">
            <div className={`relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${BACKGROUNDS[config.background].gradient} border-4 border-metal-700`}>
              {/* Avatar Preview */}
              <img 
                src={generateAvatarSVG()} 
                alt="Avatar Preview" 
                className="w-full h-full object-cover"
              />
              
              {/* Faction Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{currentFactionData.sigil}</span>
                  <div>
                    <p className="font-display font-bold text-white">{currentFactionData.name}</p>
                    <p className="text-xs italic" style={{ color: currentFactionData.color }}>
                      &quot;{currentFactionData.motto}&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Info */}
            <div className="bg-metal-800/50 border border-metal-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentClassData.icon}</span>
                <div>
                  <p className="font-display font-bold text-white">{currentClassData.name}</p>
                  <p className="text-metal-400 text-sm">{currentClassData.description}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={randomize}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-metal-800 hover:bg-metal-700 border border-metal-600 text-white font-bold rounded-lg transition-colors"
              >
                <Shuffle className="w-5 h-5" />
                Zufällig
              </button>
              <button
                onClick={handleSelect}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rust-600 hover:bg-rust-500 text-white font-bold rounded-lg transition-colors"
              >
                <Check className="w-5 h-5" />
                Übernehmen
              </button>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {categories.map((category) => (
              <div 
                key={category.key}
                className={`bg-metal-800/50 border rounded-lg p-4 transition-colors ${
                  activeCategory === category.key 
                    ? 'border-rust-500' 
                    : 'border-metal-700 hover:border-metal-600'
                }`}
                onClick={() => setActiveCategory(category.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-metal-700 rounded-lg flex items-center justify-center text-metal-300">
                      {category.icon}
                    </div>
                    <div>
                      <p className="font-medium text-white">{category.label}</p>
                      <p className="text-xs text-metal-500">
                        {category.key === 'faction' && FACTIONS[config.faction].name}
                        {category.key === 'playerClass' && CLASSES[config.playerClass].name}
                        {category.key === 'background' && BACKGROUNDS[config.background].name}
                        {category.key === 'hairStyle' && HAIR_STYLES[config.hairStyle]}
                        {category.key === 'facialHair' && FACIAL_HAIR[config.facialHair]}
                        {category.key === 'armor' && ARMOR_STYLES[config.armor]}
                        {category.key === 'accessory' && ACCESSORIES[config.accessory]}
                        {category.key === 'faceShape' && FACE_SHAPES[config.faceShape]}
                        {!['faction', 'playerClass', 'background', 'hairStyle', 'facialHair', 'armor', 'accessory', 'faceShape'].includes(category.key) && `${config[category.key] + 1}/${category.options}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); updateConfig(category.key, -1) }}
                      className="p-2 bg-metal-700 hover:bg-metal-600 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    
                    {/* Color Preview for color options */}
                    {category.key === 'skinTone' && (
                      <div className="w-8 h-8 rounded-lg border-2 border-metal-600" style={{ backgroundColor: SKIN_TONES[config.skinTone] }} />
                    )}
                    {category.key === 'hairColor' && (
                      <div className="w-8 h-8 rounded-lg border-2 border-metal-600" style={{ backgroundColor: HAIR_COLORS[config.hairColor] }} />
                    )}
                    {category.key === 'eyeColor' && (
                      <div className="w-8 h-8 rounded-lg border-2 border-metal-600" style={{ backgroundColor: EYE_COLORS[config.eyeColor] }} />
                    )}
                    {category.key === 'faction' && (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: FACTIONS[config.faction].color + '33' }}>
                        {FACTIONS[config.faction].sigil}
                      </div>
                    )}
                    {category.key === 'playerClass' && (
                      <div className="w-8 h-8 rounded-lg bg-metal-600 flex items-center justify-center text-lg">
                        {CLASSES[config.playerClass].icon}
                      </div>
                    )}
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); updateConfig(category.key, 1) }}
                      className="p-2 bg-metal-700 hover:bg-metal-600 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-metal-800 bg-metal-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-metal-400 hover:text-white transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
