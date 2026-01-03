'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ScrollText, Calendar, Sparkles, Bug, Shield, Scale,
  ChevronDown, ChevronUp, Star, Zap, Wrench, Filter
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'
import { CHANGELOG_ENTRIES, ChangelogEntry } from '@/data/changelogEntries'

const TYPE_CONFIG = {
  major: { label: 'Major', color: 'text-gold-400', bg: 'bg-gold-500/20', border: 'border-gold-500/50', icon: Star },
  minor: { label: 'Minor', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50', icon: Zap },
  patch: { label: 'Patch', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50', icon: Wrench },
  hotfix: { label: 'Hotfix', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', icon: Bug },
}

const CATEGORY_CONFIG = {
  feature: { label: 'Features', color: 'text-emerald-400', icon: Sparkles },
  improvement: { label: 'Verbesserungen', color: 'text-blue-400', icon: Zap },
  bugfix: { label: 'Bugfixes', color: 'text-orange-400', icon: Bug },
  security: { label: 'Sicherheit', color: 'text-red-400', icon: Shield },
  balance: { label: 'Balance', color: 'text-purple-400', icon: Scale },
}

function ChangelogCard({ entry, isExpanded, onToggle }: { 
  entry: ChangelogEntry
  isExpanded: boolean
  onToggle: () => void 
}) {
  const typeConfig = TYPE_CONFIG[entry.type]
  const TypeIcon = typeConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-metal-900/50 border rounded-xl overflow-hidden transition-all ${
        entry.type === 'major' ? 'border-gold-500/50' : 'border-metal-800'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-metal-800/30 transition-colors"
      >
        <div className={`p-3 rounded-xl ${typeConfig.bg} ${typeConfig.border} border`}>
          <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className={`text-sm font-bold ${typeConfig.color}`}>v{entry.version}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.bg} ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
            <span className="text-xs text-metal-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(entry.date).toLocaleDateString('de-DE', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              })}
            </span>
          </div>
          <h3 className="font-medieval font-bold text-white truncate">{entry.title}</h3>
          {entry.highlights && (
            <div className="flex flex-wrap gap-2 mt-2">
              {entry.highlights.slice(0, 3).map((highlight, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-metal-800 text-metal-400 rounded">
                  {highlight}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-metal-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-metal-500" />
          )}
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-metal-800 pt-4">
              {entry.changes.map((change, i) => {
                const catConfig = CATEGORY_CONFIG[change.category]
                const CatIcon = catConfig.icon
                
                return (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <CatIcon className={`w-4 h-4 ${catConfig.color}`} />
                      <span className={`font-medium ${catConfig.color}`}>{catConfig.label}</span>
                    </div>
                    <ul className="space-y-1 pl-6">
                      {change.items.map((item, j) => (
                        <li key={j} className="text-sm text-metal-400">
                          {item || <span className="text-metal-600">—</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ChangelogPage() {
  const [expandedIds, setExpandedIds] = useState<string[]>([CHANGELOG_ENTRIES[0]?.version || ''])
  const [filterType, setFilterType] = useState<'all' | 'major' | 'minor' | 'patch' | 'hotfix'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const toggleExpand = (version: string) => {
    setExpandedIds(prev => 
      prev.includes(version) 
        ? prev.filter(id => id !== version)
        : [...prev, version]
    )
  }

  const filteredEntries = CHANGELOG_ENTRIES.filter(entry => {
    const matchesType = filterType === 'all' || entry.type === filterType
    const matchesSearch = searchQuery === '' || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.version.includes(searchQuery) ||
      entry.changes.some(c => c.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesType && matchesSearch
  })

  const stats = {
    total: CHANGELOG_ENTRIES.length,
    major: CHANGELOG_ENTRIES.filter(e => e.type === 'major').length,
    minor: CHANGELOG_ENTRIES.filter(e => e.type === 'minor').length,
    patch: CHANGELOG_ENTRIES.filter(e => e.type === 'patch').length,
    hotfix: CHANGELOG_ENTRIES.filter(e => e.type === 'hotfix').length,
  }

  return (
    <EldrunPageShell
      icon={ScrollText}
      badge="CHANGELOG"
      title="CHANGELOG"
      subtitle="VERSIONSHISTORIE"
      description={`${stats.total} Updates. ${stats.major} Major Releases, ${stats.minor} Minor Updates, ${stats.patch} Patches.`}
      gradient="from-gold-300 via-gold-400 to-gold-600"
      glowColor="rgba(212,168,83,0.22)"
    >
      <AuthGate>
      <div>
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
            <input
              type="text"
              placeholder="Version oder Feature suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white placeholder:text-metal-500 focus:outline-none focus:border-gold-500/50"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {(['all', 'major', 'minor', 'patch', 'hotfix'] as const).map(type => {
              const config = type === 'all' 
                ? { label: 'Alle', color: 'text-white', bg: 'bg-metal-700' }
                : TYPE_CONFIG[type]
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterType === type
                      ? `${config.bg} ${config.color}`
                      : 'bg-metal-800 text-metal-400 hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'Alle' : config.label}
                  <span className="ml-2 text-xs opacity-70">
                    ({type === 'all' ? stats.total : stats[type]})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Changelog List */}
        <div className="space-y-4">
          {filteredEntries.map(entry => (
            <ChangelogCard
              key={entry.version}
              entry={entry}
              isExpanded={expandedIds.includes(entry.version)}
              onToggle={() => toggleExpand(entry.version)}
            />
          ))}
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-16">
              <ScrollText className="w-16 h-16 text-metal-700 mx-auto mb-4" />
              <h3 className="text-xl font-medieval text-metal-500">Keine Einträge gefunden</h3>
              <p className="text-metal-600">Versuche andere Filter</p>
            </div>
          )}
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
