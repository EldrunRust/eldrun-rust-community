'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Sword, Target, Wand2, Skull, Shield, Ghost,
  Zap, Heart, Flame, Eye, Crown, Star
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

interface ClassData {
  id: string
  name: string
  nameDE: string
  image: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  description: string
  role: string
  difficulty: 'Einfach' | 'Mittel' | 'Schwer' | 'Experte'
  playstyle: string
  abilities: { name: string; description: string; icon: React.ReactNode }[]
  stats: { name: string; value: number }[]
  lore: string
}

const CLASSES: ClassData[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    nameDE: 'Krieger',
    image: '/images/classes/warrior.png',
    icon: <Sword className="w-6 h-6" />,
    color: 'text-red-400',
    bgGradient: 'from-red-500/20 to-red-900/20',
    description: 'Der unbeugsame Frontkämpfer, der mit roher Gewalt und unerschütterlicher Verteidigung seine Feinde zerschmettert.',
    role: 'Tank / Nahkampf-DPS',
    difficulty: 'Einfach',
    playstyle: 'Direkter Nahkampf mit hoher Überlebensfähigkeit',
    abilities: [
      { name: 'Wirbelsturm', description: 'Fügt allen Feinden im Umkreis massiven Schaden zu', icon: <Zap className="w-4 h-4" /> },
      { name: 'Schildwall', description: 'Blockiert 80% des eingehenden Schadens für 5 Sekunden', icon: <Shield className="w-4 h-4" /> },
      { name: 'Berserker-Rage', description: 'Erhöht Schaden um 50% aber reduziert Rüstung', icon: <Flame className="w-4 h-4" /> },
    ],
    stats: [
      { name: 'Stärke', value: 95 },
      { name: 'Ausdauer', value: 90 },
      { name: 'Rüstung', value: 85 },
      { name: 'Geschwindigkeit', value: 60 },
    ],
    lore: 'Die Krieger von Eldrun sind legendär für ihre Unnachgiebigkeit im Kampf. Geschmiedet in den Feuern des Krieges, führen sie ihre Verbündeten mit eiserner Entschlossenheit an.'
  },
  {
    id: 'archer',
    name: 'Archer',
    nameDE: 'Bogenschütze',
    image: '/images/classes/archer.png',
    icon: <Target className="w-6 h-6" />,
    color: 'text-green-400',
    bgGradient: 'from-green-500/20 to-green-900/20',
    description: 'Der präzise Fernkämpfer, der aus der Distanz tödliche Pfeile auf seine Feinde regnen lässt.',
    role: 'Fernkampf-DPS',
    difficulty: 'Mittel',
    playstyle: 'Positionierung und präzise Angriffe aus der Distanz',
    abilities: [
      { name: 'Pfeilhagel', description: 'Schießt 10 Pfeile in einem Bereich', icon: <Target className="w-4 h-4" /> },
      { name: 'Giftpfeil', description: 'Vergiftet das Ziel für 10 Sekunden', icon: <Skull className="w-4 h-4" /> },
      { name: 'Adlerauge', description: 'Erhöht kritische Trefferchance um 30%', icon: <Eye className="w-4 h-4" /> },
    ],
    stats: [
      { name: 'Präzision', value: 95 },
      { name: 'Geschwindigkeit', value: 85 },
      { name: 'Kritischer Schaden', value: 90 },
      { name: 'Ausdauer', value: 65 },
    ],
    lore: 'Die Bogenschützen der Eldenwälder sind Meister der Jagd. Kein Ziel entgeht ihrem scharfen Blick, und ihre Pfeile finden stets ihr Ziel.'
  },
  {
    id: 'mage',
    name: 'Mage',
    nameDE: 'Magier',
    image: '/images/classes/mage.png',
    icon: <Wand2 className="w-6 h-6" />,
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 to-blue-900/20',
    description: 'Der mächtige Zauberwirker, der die arkanen Künste meistert und verheerende Zauber auf seine Feinde schleudert.',
    role: 'Fernkampf-DPS / Unterstützung',
    difficulty: 'Schwer',
    playstyle: 'Mana-Management und mächtige Flächenzauber',
    abilities: [
      { name: 'Feuerball', description: 'Schleudert einen explodierenden Feuerball', icon: <Flame className="w-4 h-4" /> },
      { name: 'Frostnova', description: 'Friert alle Feinde im Umkreis ein', icon: <Zap className="w-4 h-4" /> },
      { name: 'Arkanschild', description: 'Absorbiert magischen Schaden', icon: <Shield className="w-4 h-4" /> },
    ],
    stats: [
      { name: 'Intelligenz', value: 95 },
      { name: 'Mana', value: 90 },
      { name: 'Zauberschaden', value: 95 },
      { name: 'Rüstung', value: 40 },
    ],
    lore: 'Die Magier studieren in den alten Türmen von Eldrun die verborgenen Geheimnisse der Magie. Ihre Macht ist grenzenlos, doch der Preis des Wissens ist hoch.'
  },
  {
    id: 'rogue',
    name: 'Rogue',
    nameDE: 'Schurke',
    image: '/images/classes/rogue.png',
    icon: <Ghost className="w-6 h-6" />,
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 to-purple-900/20',
    description: 'Der heimtückische Assassine, der aus den Schatten zuschlägt und seine Feinde eliminiert, bevor sie reagieren können.',
    role: 'Nahkampf-DPS / Assassine',
    difficulty: 'Schwer',
    playstyle: 'Tarnung, Hinterhalte und kritische Treffer',
    abilities: [
      { name: 'Schattenschritt', description: 'Teleportiert hinter das Ziel', icon: <Ghost className="w-4 h-4" /> },
      { name: 'Meucheln', description: 'Fügt massiven Schaden aus der Tarnung zu', icon: <Skull className="w-4 h-4" /> },
      { name: 'Rauchbombe', description: 'Betäubt Feinde und ermöglicht Flucht', icon: <Eye className="w-4 h-4" /> },
    ],
    stats: [
      { name: 'Beweglichkeit', value: 95 },
      { name: 'Kritischer Schaden', value: 95 },
      { name: 'Geschwindigkeit', value: 90 },
      { name: 'Rüstung', value: 45 },
    ],
    lore: 'Die Schurken operieren im Verborgenen, ihre Dolche flüstern den Tod. In den dunklen Gassen von Eldrun sind sie Legende und Albtraum zugleich.'
  },
  {
    id: 'paladin',
    name: 'Paladin',
    nameDE: 'Paladin',
    image: '/images/classes/paladin.png',
    icon: <Crown className="w-6 h-6" />,
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/20 to-amber-900/20',
    description: 'Der heilige Krieger, der göttliche Macht mit kriegerischer Stärke verbindet und seine Verbündeten beschützt.',
    role: 'Tank / Heiler / Hybrid',
    difficulty: 'Mittel',
    playstyle: 'Vielseitig einsetzbar als Tank, Heiler oder Damage-Dealer',
    abilities: [
      { name: 'Heiliges Licht', description: 'Heilt Verbündete im Umkreis', icon: <Heart className="w-4 h-4" /> },
      { name: 'Göttlicher Schild', description: 'Wird für 8 Sekunden unverwundbar', icon: <Shield className="w-4 h-4" /> },
      { name: 'Vergeltung', description: 'Reflektiert Schaden an Angreifer', icon: <Flame className="w-4 h-4" /> },
    ],
    stats: [
      { name: 'Stärke', value: 80 },
      { name: 'Heilkraft', value: 85 },
      { name: 'Rüstung', value: 90 },
      { name: 'Mana', value: 70 },
    ],
    lore: 'Die Paladine sind die Wächter des Lichts in Eldrun. Ihr Schwur bindet sie an den Schutz der Unschuldigen und die Vernichtung des Bösen.'
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    nameDE: 'Nekromant',
    image: '/images/classes/necromancer.png',
    icon: <Skull className="w-6 h-6" />,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 to-emerald-900/20',
    description: 'Der dunkle Beschwörer, der die Macht über Leben und Tod besitzt und Armeen aus dem Jenseits ruft.',
    role: 'Beschwörer / DPS',
    difficulty: 'Experte',
    playstyle: 'Untoten-Management und Lebenskraft-Manipulation',
    abilities: [
      { name: 'Skelett beschwören', description: 'Ruft untote Diener herbei', icon: <Skull className="w-4 h-4" /> },
      { name: 'Lebensraub', description: 'Stiehlt Leben vom Feind', icon: <Heart className="w-4 h-4" /> },
      { name: 'Pestilenz', description: 'Verbreitet tödliche Krankheit', icon: <Ghost className="w-4 h-4" /> },
    ],
    stats: [
      { name: 'Dunkle Macht', value: 95 },
      { name: 'Beschwörung', value: 90 },
      { name: 'Intelligenz', value: 85 },
      { name: 'Rüstung', value: 50 },
    ],
    lore: 'Die Nekromanten wandeln auf dem schmalen Grat zwischen Leben und Tod. Ihre verbotene Kunst wird gefürchtet, doch in den dunkelsten Stunden wird sie unverzichtbar.'
  },
]

const DIFFICULTY_COLORS = {
  'Einfach': 'text-green-400 bg-green-400/10 border-green-400/30',
  'Mittel': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  'Schwer': 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  'Experte': 'text-red-400 bg-red-400/10 border-red-400/30',
}

export default function ClassesPage() {
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)

  return (
    <EldrunPageShell
      icon={Sword}
      badge="KLASSEN"
      title="KLASSEN VON ELDRUN"
      subtitle="WÄHLE DEINEN PFAD"
      description="Wähle deinen Pfad und beherrsche die Schlachtfelder. Jede Klasse bietet einen einzigartigen Spielstil und mächtige Fähigkeiten, die das Schicksal von Eldrun prägen werden."
      gradient="from-gold-300 via-gold-400 to-gold-600"
      glowColor="rgba(212,168,83,0.22)"
    >
      <AuthGate>
        {/* Class Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {CLASSES.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedClass(cls)}
              className={`
                relative group cursor-pointer overflow-hidden rounded-2xl
                bg-gradient-to-br ${cls.bgGradient} border border-metal-700/50
                hover:border-${cls.color.replace('text-', '')}/50 transition-all duration-300
                hover:scale-[1.02] hover:shadow-2xl hover:shadow-${cls.color.replace('text-', '')}/20
              `}
            >
              {/* Class Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={cls.image}
                  alt={cls.nameDE}
                  fill
                  className="object-contain object-center transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-metal-950 via-transparent to-transparent" />
              </div>

              {/* Class Info */}
              <div className="p-6 relative">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cls.color}>{cls.icon}</span>
                  <h3 className="text-2xl font-medieval text-white">{cls.nameDE}</h3>
                </div>
                <p className="text-sm text-metal-400 mb-3">{cls.role}</p>
                <p className="text-metal-300 text-sm line-clamp-2 mb-4">{cls.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[cls.difficulty]}`}>
                    {cls.difficulty}
                  </span>
                  <span className="text-xs text-metal-500 group-hover:text-gold-400 transition-colors">
                    Klicken für Details →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Class Detail Modal */}
        <AnimatePresence>
          {selectedClass && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedClass(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`
                  relative max-w-4xl w-full max-h-[90vh] overflow-y-auto
                  bg-gradient-to-br ${selectedClass.bgGradient} bg-metal-900
                  border border-metal-700 rounded-2xl shadow-2xl
                `}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedClass(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-metal-800/80 text-metal-400 hover:text-white transition-colors"
                >
                  ✕
                </button>

                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left: Image & Basic Info */}
                  <div className="relative p-8 flex flex-col items-center justify-center bg-metal-900/50">
                    <div className="relative w-64 h-64 mb-6">
                      <Image
                        src={selectedClass.image}
                        alt={selectedClass.nameDE}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 ${selectedClass.color} mb-2`}>
                        {selectedClass.icon}
                        <h2 className="text-3xl font-medieval">{selectedClass.nameDE}</h2>
                      </div>
                      <p className="text-metal-400">{selectedClass.role}</p>
                      <span className={`inline-block mt-2 px-4 py-1 rounded-full text-sm border ${DIFFICULTY_COLORS[selectedClass.difficulty]}`}>
                        Schwierigkeit: {selectedClass.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Right: Details */}
                  <div className="p-8 space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-bold text-gold-400 mb-2">Beschreibung</h3>
                      <p className="text-metal-300">{selectedClass.description}</p>
                    </div>

                    {/* Playstyle */}
                    <div>
                      <h3 className="text-lg font-bold text-gold-400 mb-2">Spielstil</h3>
                      <p className="text-metal-300">{selectedClass.playstyle}</p>
                    </div>

                    {/* Stats */}
                    <div>
                      <h3 className="text-lg font-bold text-gold-400 mb-3">Attribute</h3>
                      <div className="space-y-2">
                        {selectedClass.stats.map((stat) => (
                          <div key={stat.name} className="flex items-center gap-3">
                            <span className="text-sm text-metal-400 w-32">{stat.name}</span>
                            <div className="flex-1 h-2 bg-metal-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.value}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className={`h-full bg-gradient-to-r ${selectedClass.bgGradient.replace('/20', '')} rounded-full`}
                              />
                            </div>
                            <span className="text-sm text-metal-300 w-8">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Abilities */}
                    <div>
                      <h3 className="text-lg font-bold text-gold-400 mb-3">Fähigkeiten</h3>
                      <div className="space-y-3">
                        {selectedClass.abilities.map((ability) => (
                          <div key={ability.name} className="flex items-start gap-3 p-3 bg-metal-800/50 rounded-lg">
                            <span className={`p-2 rounded-lg ${selectedClass.color} bg-metal-800`}>
                              {ability.icon}
                            </span>
                            <div>
                              <h4 className="font-medium text-white">{ability.name}</h4>
                              <p className="text-sm text-metal-400">{ability.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lore */}
                    <div className="pt-4 border-t border-metal-700">
                      <h3 className="text-lg font-bold text-gold-400 mb-2">Geschichte</h3>
                      <p className="text-metal-300 italic">&quot;{selectedClass.lore}&quot;</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AuthGate>
    </EldrunPageShell>
  )
}
