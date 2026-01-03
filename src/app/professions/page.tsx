'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  Pickaxe, TreePine, Fish, Hammer, Wheat,
  TrendingUp, Clock, Coins, Star, Award
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

interface ProfessionData {
  id: string
  name: string
  image: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  description: string
  benefits: string[]
  skills: { name: string; level: number; description: string }[]
  resources: string[]
  maxLevel: number
  xpPerHour: string
  goldPerHour: string
}

const PROFESSIONS: ProfessionData[] = [
  {
    id: 'mining',
    name: 'Bergbau',
    image: '/images/professions/mining.png',
    icon: <Pickaxe className="w-6 h-6" />,
    color: 'text-stone-400',
    bgGradient: 'from-stone-500/20 to-stone-900/20',
    description: 'Grabe tief in die Berge von Eldrun und fördere wertvolle Erze, seltene Edelsteine und uralte Artefakte.',
    benefits: [
      'Sammle Erze für Schmiedekunst',
      'Finde seltene Edelsteine',
      'Entdecke versteckte Höhlen',
      'Bonus-Schaden gegen Steinkreaturen'
    ],
    skills: [
      { name: 'Erz-Spürsinn', level: 10, description: 'Zeigt nahe Erzvorkommen auf der Karte' },
      { name: 'Effizienter Abbau', level: 25, description: '+25% Erzausbeute' },
      { name: 'Edelstein-Experte', level: 50, description: 'Chance auf doppelte Edelsteine' },
      { name: 'Meister-Bergmann', level: 100, description: 'Zugang zu Mythril und Adamantit' },
    ],
    resources: ['Kupfer', 'Eisen', 'Silber', 'Gold', 'Mythril', 'Adamantit', 'Rubine', 'Saphire', 'Diamanten'],
    maxLevel: 100,
    xpPerHour: '1.500 - 4.000',
    goldPerHour: '500 - 2.500'
  },
  {
    id: 'woodcutting',
    name: 'Holzfällerei',
    image: '/images/professions/woodcutting.png',
    icon: <TreePine className="w-6 h-6" />,
    color: 'text-amber-600',
    bgGradient: 'from-amber-700/20 to-amber-900/20',
    description: 'Fälle die mächtigen Bäume der Eldenwälder und sammle Holz für Konstruktionen und Handwerk.',
    benefits: [
      'Holz für Bauprojekte',
      'Seltene Holzarten entdecken',
      'Harz und Rinde sammeln',
      'Schnelleres Axt-Tempo'
    ],
    skills: [
      { name: 'Waldläufer', level: 10, description: 'Erhöhte Bewegungsgeschwindigkeit im Wald' },
      { name: 'Scharfe Klinge', level: 25, description: '+30% Fällgeschwindigkeit' },
      { name: 'Seltene Hölzer', level: 50, description: 'Kann Elfen- und Drachenhölzer fällen' },
      { name: 'Meister-Holzfäller', level: 100, description: 'Weltbaum-Holz freischalten' },
    ],
    resources: ['Eiche', 'Birke', 'Ahorn', 'Tanne', 'Mahagoni', 'Elfenholz', 'Dracheneiche', 'Weltbaum-Holz'],
    maxLevel: 100,
    xpPerHour: '1.200 - 3.500',
    goldPerHour: '400 - 2.000'
  },
  {
    id: 'fishing',
    name: 'Angeln',
    image: '/images/professions/fishing.png',
    icon: <Fish className="w-6 h-6" />,
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 to-blue-900/20',
    description: 'Wirf deine Angel in die Gewässer Eldruns und fange Fische, Schätze und mysteriöse Kreaturen.',
    benefits: [
      'Nahrung für Buffs',
      'Seltene Schätze fischen',
      'Alchemie-Zutaten finden',
      'Entspannende Aktivität mit AFK-Bonus'
    ],
    skills: [
      { name: 'Köder-Meister', level: 10, description: 'Bessere Köder herstellen' },
      { name: 'Glücklicher Fang', level: 25, description: '+20% Chance auf seltene Fische' },
      { name: 'Tiefseeangler', level: 50, description: 'Kann in tiefen Gewässern angeln' },
      { name: 'Legendärer Fischer', level: 100, description: 'Kann Leviathan-Fische fangen' },
    ],
    resources: ['Forelle', 'Lachs', 'Karpfen', 'Seebarsch', 'Riesenkrake', 'Goldfisch', 'Drachenfisch', 'Leviathan'],
    maxLevel: 100,
    xpPerHour: '800 - 2.500',
    goldPerHour: '300 - 1.800'
  },
  {
    id: 'crafting',
    name: 'Handwerk',
    image: '/images/professions/crafting.png',
    icon: <Hammer className="w-6 h-6" />,
    color: 'text-orange-400',
    bgGradient: 'from-orange-500/20 to-orange-900/20',
    description: 'Schmiedе mächtige Waffen, robuste Rüstungen und nützliche Werkzeuge aus den Materialien Eldruns.',
    benefits: [
      'Eigene Ausrüstung herstellen',
      'Reparatur-Fähigkeit',
      'Verzauberungen anbringen',
      'Handel mit Spielern'
    ],
    skills: [
      { name: 'Lehrling', level: 10, description: 'Grundlegende Gegenstände herstellen' },
      { name: 'Geselle', level: 25, description: 'Seltene Ausrüstung herstellen' },
      { name: 'Meister', level: 50, description: 'Epische Gegenstände mit Bonus-Stats' },
      { name: 'Großmeister', level: 100, description: 'Legendäre und Set-Gegenstände' },
    ],
    resources: ['Waffen', 'Rüstungen', 'Schmuck', 'Werkzeuge', 'Möbel', 'Verzauberungen', 'Set-Teile'],
    maxLevel: 100,
    xpPerHour: '1.000 - 3.000',
    goldPerHour: '600 - 3.500'
  },
  {
    id: 'farming',
    name: 'Landwirtschaft',
    image: '/images/professions/farming.png',
    icon: <Wheat className="w-6 h-6" />,
    color: 'text-lime-400',
    bgGradient: 'from-lime-500/20 to-lime-900/20',
    description: 'Bestelle dein eigenes Land, züchte Pflanzen und Tiere und ernte die Früchte deiner Arbeit.',
    benefits: [
      'Nahrung und Tränke produzieren',
      'Passive Einkommensquelle',
      'Tiere züchten',
      'Eigene Farm gestalten'
    ],
    skills: [
      { name: 'Grüner Daumen', level: 10, description: '+15% Ernteertrag' },
      { name: 'Tierzüchter', level: 25, description: 'Tiere kaufen und züchten' },
      { name: 'Alchemist-Gärtner', level: 50, description: 'Magische Pflanzen anbauen' },
      { name: 'Farm-Baron', level: 100, description: 'Automatische Ernte-Helfer' },
    ],
    resources: ['Weizen', 'Kartoffeln', 'Karotten', 'Kürbisse', 'Trauben', 'Heilkräuter', 'Mandrake', 'Drachenfrucht'],
    maxLevel: 100,
    xpPerHour: '600 - 2.000',
    goldPerHour: '400 - 2.200'
  },
]

export default function ProfessionsPage() {
  const [selectedProfession, setSelectedProfession] = useState<ProfessionData | null>(null)

  return (
    <EldrunPageShell
      icon={Hammer}
      badge="BERUFE"
      title="BERUFE IN ELDRUN"
      subtitle="MEISTERE DEIN HANDWERK"
      description="Meistere einen oder mehrere Berufe und werde zum unverzichtbaren Mitglied der Gemeinschaft. Sammle Ressourcen, stelle Gegenstände her und verdiene Gold!"
      gradient="from-amber-300 via-amber-400 to-amber-600"
      glowColor="rgba(245,158,11,0.22)"
    >
      <AuthGate>
      <div>
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-metal-800/50 border border-metal-700 rounded-xl p-4 text-center">
            <Star className="w-8 h-8 text-gold-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-sm text-metal-400">Berufe verfügbar</p>
          </div>
          <div className="bg-metal-800/50 border border-metal-700 rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">100</p>
            <p className="text-sm text-metal-400">Max. Level</p>
          </div>
          <div className="bg-metal-800/50 border border-metal-700 rounded-xl p-4 text-center">
            <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">20+</p>
            <p className="text-sm text-metal-400">Spezial-Skills</p>
          </div>
          <div className="bg-metal-800/50 border border-metal-700 rounded-xl p-4 text-center">
            <Coins className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">∞</p>
            <p className="text-sm text-metal-400">Verdienstmöglichkeiten</p>
          </div>
        </motion.div>

        {/* Profession Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {PROFESSIONS.map((prof, index) => (
              <motion.div
                key={prof.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative overflow-hidden rounded-2xl
                  bg-gradient-to-br ${prof.bgGradient} bg-metal-900/80
                  border border-metal-700/50 hover:border-metal-600
                  transition-all duration-300 hover:shadow-xl
                `}
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-metal-800/50">
                  <Image
                    src={prof.image}
                    alt={prof.name}
                    fill
                    className="object-contain object-center p-4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-metal-900 via-transparent to-transparent" />
                  
                  {/* Level Badge */}
                  <div className="absolute top-4 right-4 bg-metal-900/90 px-3 py-1 rounded-full border border-metal-700">
                    <span className="text-sm text-metal-300">Max Lv. </span>
                    <span className="text-gold-400 font-bold">{prof.maxLevel}</span>
                  </div>
                </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`p-2 rounded-lg bg-metal-800 ${prof.color}`}>
                    {prof.icon}
                  </span>
                  <h3 className="text-2xl font-medieval text-white">{prof.name}</h3>
                </div>

                <p className="text-metal-300 text-sm mb-4 line-clamp-2">
                  {prof.description}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-metal-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-metal-400 text-xs mb-1">
                      <TrendingUp className="w-3 h-3" />
                      XP/Stunde
                    </div>
                    <p className="text-white font-medium">{prof.xpPerHour}</p>
                  </div>
                  <div className="bg-metal-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-metal-400 text-xs mb-1">
                      <Coins className="w-3 h-3" />
                      Gold/Stunde
                    </div>
                    <p className="text-gold-400 font-medium">{prof.goldPerHour}</p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-metal-400 mb-2">Vorteile:</h4>
                  <ul className="space-y-1">
                    {prof.benefits.slice(0, 3).map((benefit, i) => (
                      <li key={i} className="text-sm text-metal-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills Preview */}
                <div className="border-t border-metal-700 pt-4">
                  <h4 className="text-sm font-medium text-metal-400 mb-3">Skill-Fortschritt:</h4>
                  <div className="space-y-2">
                    {prof.skills.map((skill) => (
                      <div key={skill.name} className="flex items-center gap-2">
                        <span className="text-xs text-metal-500 w-8">Lv.{skill.level}</span>
                        <div className="flex-1 h-1.5 bg-metal-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${prof.bgGradient.replace('/20', '')} rounded-full`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                        <span className="text-xs text-metal-300 truncate max-w-[100px]">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div className="mt-4 pt-4 border-t border-metal-700">
                  <h4 className="text-sm font-medium text-metal-400 mb-2">Ressourcen:</h4>
                  <div className="flex flex-wrap gap-1">
                    {prof.resources.slice(0, 5).map((resource) => (
                      <span key={resource} className="px-2 py-0.5 bg-metal-800 rounded text-xs text-metal-300">
                        {resource}
                      </span>
                    ))}
                    {prof.resources.length > 5 && (
                      <span className="px-2 py-0.5 bg-metal-800 rounded text-xs text-gold-400">
                        +{prof.resources.length - 5} mehr
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-gold-500/10 via-gold-400/20 to-gold-500/10 border border-gold-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-medieval text-gold-400 mb-3">
              Bereit, dein Handwerk zu meistern?
            </h3>
            <p className="text-metal-300 mb-6 max-w-2xl mx-auto">
              Verbinde dich mit dem Server und beginne deine Reise als Meister-Handwerker. 
              Alle Berufe können gleichzeitig erlernt werden!
            </p>
            <button className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-metal-950 font-bold rounded-lg transition-colors">
              Jetzt spielen
            </button>
          </div>
        </motion.div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
