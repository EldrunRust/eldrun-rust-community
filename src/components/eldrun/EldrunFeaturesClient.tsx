'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, Shield, Sword, Skull, Flame, Sparkles, 
  Castle, Users, Scroll, Map, Zap, Trophy,
  ChevronRight, Star, Target, Layers, Bot, Video, Play, BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { 
  FACTIONS, 
  PLAYER_CLASSES, 
  GUILD_PERKS, 
  GUILD_ACHIEVEMENTS,
  CASTLE_UPGRADES,
  SKILL_CATEGORIES,
  GAME_FEATURES,
  WORLD_EVENTS,
  SERVER_STATS,
  BOUNTY_SYSTEM,
  KITS,
  CURRENCIES,
  BACKPACKS,
  TRAVEL_POINTS,
  ENEMY_NPCS,
  ARTIFACT_ISLAND,
  GAMBLING_GAMES,
  HUD_ELEMENTS,
  CHAT_COMMANDS,
  ACHIEVEMENTS,
  LOOT_RARITIES
} from '@/data/eldrunFeatures'

type TabType = 'factions' | 'classes' | 'guilds' | 'castles' | 'skills' | 'features' | 'events' | 'economy' | 'commands' | 'aaa' | 'more'

export function EldrunFeaturesClient() {
  const [activeTab, setActiveTab] = useState<TabType>('factions')
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'factions', label: 'Häuser', icon: <Crown className="w-4 h-4" /> },
    { id: 'classes', label: 'Klassen', icon: <Sword className="w-4 h-4" /> },
    { id: 'guilds', label: 'Gilden', icon: <Shield className="w-4 h-4" /> },
    { id: 'castles', label: 'Burgen', icon: <Castle className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <Zap className="w-4 h-4" /> },
    { id: 'economy', label: 'Wirtschaft', icon: <Target className="w-4 h-4" /> },
    { id: 'commands', label: 'Befehle', icon: <Scroll className="w-4 h-4" /> },
    { id: 'features', label: 'Features', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'aaa', label: 'AAA', icon: <Star className="w-4 h-4" /> },
    { id: 'events', label: 'Events', icon: <Flame className="w-4 h-4" /> },
    { id: 'more', label: 'Mehr', icon: <Layers className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-metal-950">
      {/* Epic Header */}
      <div className="relative overflow-hidden border-b border-metal-800">
        <div className="absolute inset-0 bg-gradient-to-b from-rust-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('/hero-bg.svg')] opacity-10" />
        
        <div className="container-rust pt-32 pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-metal-900/50 border border-rust-500/30 mb-6">
              <Crown className="w-5 h-5 text-rust-400" />
              <span className="font-mono text-sm text-rust-400 uppercase tracking-widest">
                Das Reich erwartet dich
              </span>
            </div>
            
            <h1 className="font-medieval-decorative font-black text-6xl md:text-8xl text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 drop-shadow-[0_0_30px_rgba(212,168,83,0.5)]">
                ELDRUN
              </span>
            </h1>
            <p className="font-medieval text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 mb-2 tracking-[0.25em] uppercase">
              Pfad des Krieges!
            </p>
            <p className="text-metal-400 max-w-2xl mx-auto font-body">
              Wähle dein Haus. Beherrsche deine Klasse. Erobere das Reich.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              <StatBadge icon="⚔️" value={SERVER_STATS.plugins} label="Plugins" />
              <StatBadge icon="✨" value={SERVER_STATS.features} label="Features" />
              <StatBadge icon="💬" value={SERVER_STATS.commands} label="Commands" />
              <StatBadge icon="🗺️" value={SERVER_STATS.mapSize} label="Map Size" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-20 z-40 bg-metal-950/95 backdrop-blur-xl border-b border-metal-800">
        <div className="container-rust">
          <div className="flex overflow-x-auto py-2 gap-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medieval text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gold-900/30 text-gold-400 border-b-2 border-gold-500'
                    : 'text-metal-400 hover:text-gold-300 hover:bg-gold-900/20'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container-rust py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'factions' && (
            <motion.div
              key="factions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FactionsSection selectedFaction={selectedFaction} onSelectFaction={setSelectedFaction} />
            </motion.div>
          )}
          
          {activeTab === 'classes' && (
            <motion.div
              key="classes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ClassesSection selectedClass={selectedClass} onSelectClass={setSelectedClass} />
            </motion.div>
          )}
          
          {activeTab === 'guilds' && (
            <motion.div
              key="guilds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GuildsSection />
            </motion.div>
          )}
          
          {activeTab === 'castles' && (
            <motion.div
              key="castles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CastlesSection />
            </motion.div>
          )}
          
          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SkillsSection />
            </motion.div>
          )}
          
          {activeTab === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FeaturesSection />
            </motion.div>
          )}
          
          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EventsSection />
            </motion.div>
          )}
          
          {activeTab === 'economy' && (
            <motion.div
              key="economy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EconomySection />
            </motion.div>
          )}
          
          {activeTab === 'commands' && (
            <motion.div
              key="commands"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CommandsSection />
            </motion.div>
          )}
          
          {activeTab === 'aaa' && (
            <motion.div
              key="aaa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AAASection />
            </motion.div>
          )}
          
          {activeTab === 'more' && (
            <motion.div
              key="more"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MoreSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function StatBadge({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div className="text-center">
      <span className="text-2xl">{icon}</span>
      <p className="font-mono text-2xl text-white font-bold">{value}</p>
      <p className="text-xs text-metal-500 uppercase">{label}</p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTIONS SECTION - SERAPHAR VS VORGAROTH
// ═══════════════════════════════════════════════════════════════════════════

function FactionsSection({ selectedFaction, onSelectFaction }: { selectedFaction: string | null; onSelectFaction: (id: string | null) => void }) {
  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl text-white mb-4">
          ⚔️ WÄHLE DEIN HAUS ⚔️
        </h2>
        <p className="text-metal-400 max-w-2xl mx-auto">
          Zwei große Häuser kämpfen um die Vorherrschaft über Eldrun. 
          Deine Wahl bestimmt dein Schicksal, deine Verbündeten und deine Feinde.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {FACTIONS.map((faction) => (
          <motion.div
            key={faction.id}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => onSelectFaction(selectedFaction === faction.id ? null : faction.id)}
            className={`relative cursor-pointer overflow-hidden border-2 transition-all duration-500 ${
              selectedFaction === faction.id 
                ? 'border-opacity-100' 
                : 'border-opacity-30 hover:border-opacity-60'
            }`}
            style={{ 
              borderColor: faction.color,
              clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
            }}
          >
            {/* Background Banner */}
            <div className="absolute inset-0 opacity-30">
              <Image
                src={faction.id === 'seraphar' ? '/images/factions/seraphar-banner.png' : '/images/factions/vorgaroth-banner.png'}
                alt={faction.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            <div 
              className="absolute inset-0 opacity-40"
              style={{ background: `linear-gradient(135deg, ${faction.color}60, transparent, ${faction.color}20)` }}
            />
            
            <div className="relative p-8">
              {/* Official Logo & Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-24 h-24 flex items-center justify-center">
                  <Image
                    src={faction.id === 'seraphar' ? '/images/factions/seraphar-logo.png' : '/images/factions/vorgaroth-logo.png'}
                    alt={`${faction.name} Logo`}
                    width={96}
                    height={96}
                    className="w-full h-full object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
                <div>
                  <h3 className="font-display font-black text-3xl" style={{ color: faction.color }}>
                    {faction.name}
                  </h3>
                  <p className="text-metal-500 text-sm">{faction.fullName}</p>
                </div>
              </div>
              
              {/* Motto */}
              <p className="font-display italic text-xl text-metal-300 mb-4 border-l-4 pl-4" style={{ borderColor: faction.color }}>
                &quot;{faction.motto}&quot;
              </p>
              
              {/* Description */}
              <p className="text-metal-400 mb-6">{faction.description}</p>
              
              {/* Territory */}
              <div className="flex items-center gap-2 text-sm mb-4">
                <Map className="w-4 h-4" style={{ color: faction.color }} />
                <span className="text-metal-500">Territorium:</span>
                <span className="text-white">{faction.territory}</span>
              </div>
              
              {/* Bonuses */}
              <div className="space-y-2 mb-6">
                <h4 className="font-display font-bold text-sm uppercase" style={{ color: faction.color }}>
                  Fraktions-Boni:
                </h4>
                {faction.bonuses.map((bonus, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <ChevronRight className="w-4 h-4" style={{ color: faction.color }} />
                    <span className="text-metal-300">{bonus}</span>
                  </div>
                ))}
              </div>
              
              {/* Expanded Lore */}
              <AnimatePresence>
                {selectedFaction === faction.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-metal-700">
                      <h4 className="font-display font-bold text-sm uppercase mb-2" style={{ color: faction.color }}>
                        Die Geschichte:
                      </h4>
                      <p className="text-metal-400 text-sm leading-relaxed">{faction.lore}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Join Button */}
              <button 
                className="w-full mt-4 py-3 font-display font-bold uppercase tracking-wider transition-all"
                style={{ 
                  backgroundColor: `${faction.color}20`,
                  borderColor: faction.color,
                  color: faction.color,
                  border: '2px solid'
                }}
              >
                {faction.id === 'seraphar' ? '☀️ FÜR DAS LICHT!' : '🌑 FÜR DIE SCHATTEN!'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* VS Divider */}
      <div className="flex items-center justify-center py-8">
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        <div className="px-6 font-display font-black text-4xl text-metal-600">VS</div>
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-red-900 to-transparent" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CLASSES SECTION - THE SIX PATHS
// ═══════════════════════════════════════════════════════════════════════════

function ClassesSection({ selectedClass, onSelectClass }: { selectedClass: string | null; onSelectClass: (id: string | null) => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl text-white mb-4">
          🎭 WÄHLE DEINEN PFAD 🎭
        </h2>
        <p className="text-metal-400 max-w-2xl mx-auto">
          Sechs Klassen, sechs Schicksale. Jede mit einzigartigen Fähigkeiten und Spielstilen.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLAYER_CLASSES.map((cls) => (
          <motion.div
            key={cls.id}
            whileHover={{ y: -5 }}
            onClick={() => onSelectClass(selectedClass === cls.id ? null : cls.id)}
            className={`relative cursor-pointer bg-metal-900/50 border transition-all duration-300 ${
              selectedClass === cls.id 
                ? 'border-opacity-100 scale-105' 
                : 'border-metal-800 hover:border-opacity-50'
            }`}
            style={{ 
              borderColor: selectedClass === cls.id ? cls.color : undefined,
              clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'
            }}
          >
            <div className="p-6">
              {/* Class Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{cls.icon}</span>
                <div>
                  <h3 className="font-display font-bold text-xl" style={{ color: cls.color }}>
                    {cls.name}
                  </h3>
                  <p className="text-metal-500 text-xs">{cls.playstyle}</p>
                </div>
              </div>
              
              <p className="text-metal-400 text-sm mb-4">{cls.description}</p>
              
              {/* Bonuses */}
              <div className="space-y-1 mb-4">
                {cls.bonuses.map((bonus, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-metal-500">{bonus.stat}</span>
                    <span className="font-mono" style={{ color: cls.color }}>{bonus.value}</span>
                  </div>
                ))}
              </div>
              
              {/* Skills Preview */}
              <AnimatePresence>
                {selectedClass === cls.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-metal-700">
                      <h4 className="font-display text-xs uppercase mb-2" style={{ color: cls.color }}>
                        Fähigkeiten:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {cls.skills.map((skill, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 text-xs bg-metal-800 text-metal-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// GUILDS SECTION
// ═══════════════════════════════════════════════════════════════════════════

function GuildsSection() {
  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl text-white mb-4">
          🛡️ GILDEN-SYSTEM 🛡️
        </h2>
        <p className="text-metal-400 max-w-2xl mx-auto">
          Verbünde dich mit anderen Kriegern. Stärke durch Einheit.
        </p>
      </div>

      {/* Guild Perks */}
      <div>
        <h3 className="font-display font-bold text-2xl text-rust-400 mb-6">Gilden-Perks</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {GUILD_PERKS.map((perk) => (
            <div key={perk.id} className="bg-metal-900/50 border border-metal-800 p-4 text-center">
              <span className="text-3xl">{perk.icon}</span>
              <h4 className="font-display font-bold text-white mt-2">{perk.name}</h4>
              <p className="text-metal-500 text-xs mt-1">{perk.description}</p>
              <p className="text-rust-400 text-xs mt-2 font-mono">Max Level: {perk.maxLevel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guild Achievements */}
      <div>
        <h3 className="font-display font-bold text-2xl text-rust-400 mb-6">Achievements</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {GUILD_ACHIEVEMENTS.map((ach) => (
            <div key={ach.id} className="bg-metal-900/50 border border-metal-800 p-4 flex items-start gap-3">
              <span className="text-2xl">{ach.icon}</span>
              <div>
                <h4 className="font-display font-bold text-white text-sm">{ach.name}</h4>
                <p className="text-metal-500 text-xs">{ach.requirement}</p>
                <p className="text-radiation-400 text-xs font-mono mt-1">{ach.reward}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CASTLES SECTION
// ═══════════════════════════════════════════════════════════════════════════

function CastlesSection() {
  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl text-white mb-4">
          🏰 BURGEN-SYSTEM 🏰
        </h2>
        <p className="text-metal-400 max-w-2xl mx-auto">
          Errichte deine Festung. Verteidige dein Reich. Belagere deine Feinde.
        </p>
      </div>

      {/* Castle Upgrades */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {CASTLE_UPGRADES.map((upgrade) => (
          <motion.div 
            key={upgrade.id}
            whileHover={{ scale: 1.05 }}
            className="bg-metal-900/50 border border-metal-800 p-4 hover:border-rust-500/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{upgrade.icon}</span>
              <div>
                <h4 className="font-display font-bold text-white text-sm">{upgrade.name}</h4>
                <p className="text-metal-600 text-xs">Level 1-{upgrade.maxLevel}</p>
              </div>
            </div>
            <p className="text-metal-500 text-xs mb-2">{upgrade.description}</p>
            <div className="flex flex-wrap gap-1">
              {upgrade.benefits.map((b, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-rust-500/20 text-rust-400">{b}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILLS SECTION
// ═══════════════════════════════════════════════════════════════════════════

function SkillsSection() {
  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl text-white mb-4">
          ⚡ SKILL-SYSTEM ⚡
        </h2>
        <p className="text-metal-400 max-w-2xl mx-auto">
          20 Skills in 6 Kategorien. Meistere jeden Aspekt des Überlebens.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SKILL_CATEGORIES.map((category) => (
          <div 
            key={category.id} 
            className="bg-metal-900/50 border border-metal-800 p-6"
            style={{ borderTopColor: category.color, borderTopWidth: '3px' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{category.icon}</span>
              <h3 className="font-display font-bold text-xl" style={{ color: category.color }}>
                {category.name}
              </h3>
            </div>
            <div className="space-y-2">
              {category.skills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-2 text-sm">
                  <span>{skill.icon}</span>
                  <span className="text-white">{skill.name}</span>
                  <span className="text-metal-600 text-xs ml-auto">Lv. 1-100</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURES SECTION
// ═══════════════════════════════════════════════════════════════════════════

function FeaturesSection() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl text-white mb-4">
          ✨ ALLE FEATURES ✨
        </h2>
        <p className="text-metal-400 max-w-2xl mx-auto">
          65 Custom-Plugins. 150+ Features. Unendliche Möglichkeiten.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {GAME_FEATURES.map((section, i) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-metal-900/50 border border-metal-800 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{section.icon}</span>
              <h3 className="font-display font-bold text-xl text-rust-400">{section.category}</h3>
            </div>
            <ul className="space-y-2">
              {section.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-metal-300">
                  <ChevronRight className="w-4 h-4 text-rust-500 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENTS SECTION
// ═══════════════════════════════════════════════════════════════════════════

function EventsSection() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl text-white mb-4">
          🔥 WELT-EVENTS 🔥
        </h2>
        <p className="text-metal-400 max-w-2xl mx-auto">
          Dynamische Events, die das Reich erschüttern.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {WORLD_EVENTS.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ scale: 1.05 }}
            className="bg-metal-900/50 border border-metal-800 p-4 text-center hover:border-rust-500/50 transition-colors"
          >
            <span className="text-4xl">{event.icon}</span>
            <h4 className="font-display font-bold text-white mt-2">{event.name}</h4>
            <p className="text-metal-500 text-xs mt-1">{event.description}</p>
            <p className="text-rust-400 text-xs mt-2 font-mono">{event.frequency}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ECONOMY SECTION - CURRENCIES, KITS, BOUNTY
// ═══════════════════════════════════════════════════════════════════════════

function EconomySection() {
  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl text-white mb-4">
          💎 WIRTSCHAFTSSYSTEM 💎
        </h2>
        <p className="text-metal-400 max-w-2xl mx-auto">
          Verdiene, handle und werde zum reichsten Krieger von Eldrun.
        </p>
      </div>

      {/* Currencies */}
      <div>
        <h3 className="font-display font-bold text-2xl text-amber-400 mb-6 flex items-center gap-2">
          🪙 Währungen
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CURRENCIES.map((currency) => (
            <motion.div
              key={currency.id}
              whileHover={{ scale: 1.02 }}
              className="bg-metal-900/50 border border-metal-800 p-5 hover:border-opacity-60 transition-all"
              style={{ borderColor: currency.color }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{currency.icon}</span>
                <h4 className="font-display font-bold text-xl" style={{ color: currency.color }}>
                  {currency.name}
                </h4>
              </div>
              <p className="text-metal-400 text-sm mb-3">{currency.description}</p>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-metal-500">Erhalten durch: </span>
                  <span className="text-metal-300">{currency.obtainedBy.join(', ')}</span>
                </div>
                <div>
                  <span className="text-metal-500">Verwendet für: </span>
                  <span className="text-metal-300">{currency.usedFor.join(', ')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Kits */}
      <div>
        <h3 className="font-display font-bold text-2xl text-purple-400 mb-6 flex items-center gap-2">
          🎁 Kits
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {KITS.map((kit) => (
            <motion.div
              key={kit.id}
              whileHover={{ scale: 1.02 }}
              className={`bg-metal-900/50 border p-5 ${
                kit.tier === 'legendary' ? 'border-amber-500/50' :
                kit.tier === 'vip' ? 'border-purple-500/50' :
                kit.tier === 'premium' ? 'border-blue-500/50' :
                'border-metal-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{kit.icon}</span>
                <div>
                  <h4 className="font-display font-bold text-white">{kit.name}</h4>
                  <span className={`text-xs uppercase ${
                    kit.tier === 'legendary' ? 'text-amber-400' :
                    kit.tier === 'vip' ? 'text-purple-400' :
                    kit.tier === 'premium' ? 'text-blue-400' :
                    'text-metal-500'
                  }`}>{kit.tier}</span>
                </div>
                <span className="ml-auto text-xs text-metal-500 font-mono">{kit.cooldown}</span>
              </div>
              <p className="text-metal-400 text-sm mb-3">{kit.description}</p>
              <div className="flex flex-wrap gap-1">
                {kit.items.map((item, i) => (
                  <span key={i} className="text-xs bg-metal-800 px-2 py-1 text-metal-300">{item}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bounty System */}
      <div>
        <h3 className="font-display font-bold text-2xl text-red-400 mb-6 flex items-center gap-2">
          💀 Kopfgeld-System
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOUNTY_SYSTEM.map((bounty) => (
            <div key={bounty.id} className="bg-metal-900/50 border border-metal-800 p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{bounty.icon}</span>
                <h4 className="font-display font-bold text-white">{bounty.name}</h4>
              </div>
              <p className="text-metal-400 text-sm">{bounty.description}</p>
              <p className="text-rust-400 text-xs mt-2">Belohnung: {bounty.reward}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Backpacks */}
      <div>
        <h3 className="font-display font-bold text-2xl text-green-400 mb-6 flex items-center gap-2">
          🎒 Rucksack-System
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BACKPACKS.map((bp) => (
            <div key={bp.id} className="bg-metal-900/50 border border-metal-800 p-4 text-center">
              <span className="text-3xl">{bp.icon}</span>
              <h4 className="font-display font-bold text-white mt-2">{bp.name}</h4>
              <p className="text-2xl font-mono text-green-400">{bp.slots} Slots</p>
              <p className="text-xs text-metal-500 mt-1">{bp.permission}</p>
              <div className="mt-2 space-y-1">
                {bp.features.map((f, i) => (
                  <p key={i} className="text-xs text-metal-400">{f}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Points */}
      <div>
        <h3 className="font-display font-bold text-2xl text-cyan-400 mb-6 flex items-center gap-2">
          🚀 Schnellreise-Netzwerk
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRAVEL_POINTS.map((tp) => (
            <div key={tp.id} className="bg-metal-900/50 border border-metal-800 p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{tp.icon}</span>
                <h4 className="font-display font-bold text-white">{tp.name}</h4>
              </div>
              <p className="text-metal-400 text-sm mb-2">{tp.description}</p>
              <div className="flex justify-between text-xs">
                <span className="text-amber-400">{tp.cost} Scrap</span>
                <span className="text-metal-500">CD: {tp.cooldown}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS SECTION - CHAT COMMANDS REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

function CommandsSection() {
  const categories = Array.from(new Set(CHAT_COMMANDS.map(c => c.category)))
  
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl text-white mb-4">
          📜 BEFEHLS-REFERENZ 📜
        </h2>
        <p className="text-metal-400 max-w-2xl mx-auto">
          Alle wichtigen Chat-Befehle auf einen Blick.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div key={category} className="bg-metal-900/50 border border-metal-800 p-5">
            <h3 className="font-display font-bold text-lg text-rust-400 mb-4 pb-2 border-b border-metal-700">
              {category}
            </h3>
            <div className="space-y-2">
              {CHAT_COMMANDS.filter(c => c.category === category).map((cmd, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <code className="bg-metal-800 px-2 py-1 text-amber-400 font-mono text-xs whitespace-nowrap">
                    {cmd.command}
                  </code>
                  <span className="text-metal-400 flex-1">{cmd.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MORE SECTION - NPCS, ACHIEVEMENTS, LOOT, ARTIFACT ISLAND
// ═══════════════════════════════════════════════════════════════════════════

function MoreSection() {
  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl text-white mb-4">
          🎮 WEITERE SYSTEME 🎮
        </h2>
        <p className="text-metal-400 max-w-2xl mx-auto">
          NPCs, Achievements, Loot-Rarität und mehr.
        </p>
      </div>

      {/* Artifact Island */}
      <div className="bg-gradient-to-r from-red-900/20 via-metal-900/50 to-red-900/20 border border-red-500/30 p-8">
        <div className="text-center mb-6">
          <span className="text-5xl">{ARTIFACT_ISLAND.icon}</span>
          <h3 className="font-display font-black text-3xl text-red-400 mt-2">{ARTIFACT_ISLAND.name}</h3>
          <p className="text-metal-400">{ARTIFACT_ISLAND.description}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-display font-bold text-green-400 mb-2">✅ Features</h4>
            {ARTIFACT_ISLAND.features.map((f, i) => (
              <p key={i} className="text-sm text-metal-300 mb-1">• {f}</p>
            ))}
          </div>
          <div>
            <h4 className="font-display font-bold text-red-400 mb-2">⚠️ Gefahren</h4>
            {ARTIFACT_ISLAND.dangers.map((d, i) => (
              <p key={i} className="text-sm text-metal-300 mb-1">• {d}</p>
            ))}
          </div>
          <div>
            <h4 className="font-display font-bold text-amber-400 mb-2">🏆 Belohnungen</h4>
            {ARTIFACT_ISLAND.rewards.map((r, i) => (
              <p key={i} className="text-sm text-metal-300 mb-1">• {r}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Enemy NPCs */}
      <div>
        <h3 className="font-display font-bold text-2xl text-red-400 mb-6">🤖 Feindliche NPCs</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENEMY_NPCS.map((npc) => (
            <div key={npc.id} className={`bg-metal-900/50 border p-4 ${
              npc.difficulty === 'boss' ? 'border-red-500/50' :
              npc.difficulty === 'hard' ? 'border-orange-500/50' :
              npc.difficulty === 'medium' ? 'border-yellow-500/50' :
              'border-metal-700'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{npc.icon}</span>
                <div>
                  <h4 className="font-display font-bold text-white">{npc.name}</h4>
                  <span className={`text-xs uppercase ${
                    npc.difficulty === 'boss' ? 'text-red-400' :
                    npc.difficulty === 'hard' ? 'text-orange-400' :
                    npc.difficulty === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>{npc.difficulty}</span>
                </div>
              </div>
              <div className="text-xs space-y-1 text-metal-400">
                <p>❤️ HP: {npc.health} | ⚔️ Schaden: {npc.damage}</p>
                <p>📍 {npc.location}</p>
                <p>💎 Loot: {npc.loot.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="font-display font-bold text-2xl text-amber-400 mb-6">🏆 Achievements</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map((ach) => (
            <div key={ach.id} className={`bg-metal-900/50 border p-4 text-center ${
              ach.rarity === 'legendary' ? 'border-amber-500/50' :
              ach.rarity === 'epic' ? 'border-purple-500/50' :
              ach.rarity === 'rare' ? 'border-blue-500/50' :
              'border-metal-700'
            }`}>
              <span className="text-3xl">{ach.icon}</span>
              <h4 className="font-display font-bold text-white mt-2">{ach.name}</h4>
              <p className="text-metal-500 text-xs mt-1">{ach.description}</p>
              <p className={`text-xs mt-2 ${
                ach.rarity === 'legendary' ? 'text-amber-400' :
                ach.rarity === 'epic' ? 'text-purple-400' :
                ach.rarity === 'rare' ? 'text-blue-400' :
                'text-metal-400'
              }`}>🎁 {ach.reward}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Loot Rarities */}
      <div>
        <h3 className="font-display font-bold text-2xl text-purple-400 mb-6">🎨 Loot-Seltenheit</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {LOOT_RARITIES.map((rarity) => (
            <div 
              key={rarity.id} 
              className="bg-metal-900/50 border p-4 text-center"
              style={{ borderColor: rarity.color }}
            >
              <span className="text-2xl">{rarity.icon}</span>
              <h4 className="font-display font-bold text-sm mt-2" style={{ color: rarity.color }}>
                {rarity.name}
              </h4>
              <p className="text-metal-500 text-xs mt-1">{rarity.dropChance}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gambling Games */}
      <div>
        <h3 className="font-display font-bold text-2xl text-green-400 mb-6">🎰 Glücksspiele</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAMBLING_GAMES.map((game) => (
            <div key={game.id} className="bg-metal-900/50 border border-metal-800 p-4 text-center">
              <span className="text-3xl">{game.icon}</span>
              <h4 className="font-display font-bold text-white mt-2">{game.name}</h4>
              <p className="text-metal-500 text-xs mt-1">{game.description}</p>
              <div className="mt-3 text-xs space-y-1">
                <p className="text-metal-400">Min: {game.minBet} | Max: {game.maxWin}</p>
                <p className="text-green-400">House Edge: {game.houseEdge}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HUD Elements */}
      <div>
        <h3 className="font-display font-bold text-2xl text-cyan-400 mb-6">📊 HUD-Elemente</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {HUD_ELEMENTS.map((hud) => (
            <div key={hud.id} className="bg-metal-900/50 border border-metal-800 p-3 flex items-center gap-3">
              <span className="text-xl">{hud.icon}</span>
              <div>
                <h4 className="font-display font-bold text-white text-sm">{hud.name}</h4>
                <p className="text-metal-500 text-xs">{hud.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// AAA FEATURES SECTION - AI-POWERED TOOLS
// ═══════════════════════════════════════════════════════════════════════════

function AAASection() {
  const aaaFeatures = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'AI Content Moderation',
      description: 'Intelligente Inhaltsmoderation mit OpenAI GPT-4',
      status: '✅ Aktiv',
      color: 'text-blue-400',
      link: '/features#ai-moderation',
      features: ['Echtzeit-Analyse', 'Toxizitätserkennung', 'Auto-Filter', 'Confidence Scoring']
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'GPT-4 Assistant',
      description: 'Intelligenter Chat-Bot für Support & Fragen',
      status: '✅ Aktiv',
      color: 'text-purple-400',
      link: '/features#ai-assistant',
      features: ['24/7 Verfügbar', 'Kontextbewusst', 'Eldrun-Wissen', 'Personalisiert']
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: 'UGC Map Editor',
      description: 'Erstelle eigene Rust-Maps mit professionellen Tools',
      status: '✅ Aktiv',
      color: 'text-green-400',
      link: '/features/map-editor',
      features: ['3D Vorschau', 'Terrain Tools', 'Building System', 'Export/Import']
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: 'TikTok Clip Generator',
      description: 'Auto-generiere epische Gaming-Clips für Social Media',
      status: '✅ Aktiv',
      color: 'text-pink-400',
      link: '/features/clip-generator',
      features: ['Auto Highlights', 'Effekte & Musik', '1080p/60fps', '1-Klick Export']
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Progressive Web App',
      description: 'Installierbare App mit Offline-Fähigkeiten',
      status: '✅ Aktiv',
      color: 'text-yellow-400',
      link: '/features#pwa',
      features: ['Offline Support', 'Push Notifications', 'Home Screen', 'Cloud Sync']
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: 'Spatial Voice Chat',
      description: '3D-Raumklang für immersives Gaming',
      status: '✅ Aktiv',
      color: 'text-indigo-400',
      link: '/features#voice-chat',
      features: ['Proximity Audio', 'Noise Reduction', '3D Positioning', 'Low Latency']
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics Dashboard',
      description: 'Echtzeit-Server-Metriken und Benutzerstatistiken',
      status: '✅ Aktiv',
      color: 'text-blue-400',
      link: '/features/analytics',
      features: ['Live Monitoring', 'Performance Metrics', 'User Tracking', 'Custom Reports']
    }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="font-display font-black text-4xl text-white mb-4">
          🌟 AAA FEATURES
        </h2>
        <p className="text-metal-400 max-w-2xl mx-auto">
          NASA-Level Innovation für die Eldrun Community. KI-gestützte Tools und next-gen Features.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <span className="text-green-400">6 Features Live</span>
          </div>
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <span className="text-blue-400">Mehr in Entwicklung</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aaaFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6 h-full hover:border-gold-500/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-metal-800 rounded-lg ${feature.color}`}>
                  {feature.icon}
                </div>
                <span className="text-sm font-mono">{feature.status}</span>
              </div>
              
              <h3 className="font-display font-bold text-xl text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-metal-400 mb-4">{feature.description}</p>
              
              <div className="space-y-2 mb-4">
                {feature.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-sm text-metal-300">{f}</span>
                  </div>
                ))}
              </div>
              
              <Link 
                href={feature.link}
                className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors font-medium"
              >
                {feature.status === '✅ Aktiv' ? 'Jetzt testen' : 'Mehr erfahren'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-800/30 rounded-2xl p-8 text-center">
        <Crown className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h3 className="font-display font-black text-2xl text-white mb-4">
          Bereit für das nächste Level?
        </h3>
        <p className="text-metal-300 mb-6 max-w-2xl mx-auto">
          Erlebe die Zukunft der Gaming-Community mit AAA-Features, 
          die sonst nur bei großen Studios zu finden sind.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/features/map-editor"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Features ausprobieren
          </Link>
          <Link
            href="/forum"
            className="px-6 py-3 bg-metal-800 text-white rounded-lg font-medium hover:bg-metal-700 transition-all border border-metal-600"
          >
            Zur Community
          </Link>
        </div>
      </div>
    </div>
  )
}
