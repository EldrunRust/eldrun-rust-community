'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, X, Tag, Search, Sparkles } from 'lucide-react'
import { CODEX_ENTRIES, CodexEntry } from '@/data/codex'
import { cn } from '@/lib/utils'

interface CodexDrawerProps {
  embedded?: boolean
}

export function CodexDrawer({ embedded = false }: CodexDrawerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<CodexEntry['category'] | 'Alle'>('Alle')

  const filtered = useMemo(() => {
    return CODEX_ENTRIES.filter((e) => {
      const matchQuery =
        !query ||
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.summary.toLowerCase().includes(query.toLowerCase()) ||
        e.details.toLowerCase().includes(query.toLowerCase())
      const matchCategory = filter === 'Alle' || e.category === filter
      return matchQuery && matchCategory
    })
  }, [query, filter])

  const content = (
    <div className={embedded ? 'w-full bg-metal-950/60 border border-metal-800 rounded-2xl overflow-hidden' : 'relative w-full max-w-2xl h-full bg-metal-950/95 border-l border-metal-800 shadow-[0_20px_60px_rgba(0,0,0,0.6)]'}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-metal-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-rust-400" />
          <span className="text-sm font-mono uppercase tracking-wider text-metal-200">Eldrun Codex</span>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
        {!embedded && (
          <button onClick={() => setOpen(false)} className="text-metal-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-metal-800 bg-metal-900/60 rounded-lg">
            <Search className="w-4 h-4 text-metal-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suche Klassen, Artefakte, Events..."
              className="bg-transparent outline-none text-sm text-metal-100 w-full placeholder:text-metal-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['Alle', 'Klassen', 'Artefakte', 'Events', 'Zonen'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  'px-3 py-2 rounded-lg border text-xs font-mono tracking-wide transition-all',
                  filter === cat
                    ? 'border-rust-500 text-white bg-rust-900/30'
                    : 'border-metal-800 text-metal-400 hover:border-metal-700'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={embedded ? 'space-y-3 max-h-[70vh] overflow-auto pr-1' : 'space-y-3 max-h-[70vh] overflow-auto pr-1'}>
          {filtered.map((entry) => (
            <CodexCard key={entry.id} entry={entry} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-metal-500 text-sm py-6 border border-dashed border-metal-800 rounded-lg">
              Nichts gefunden. Passe Filter oder Suche an.
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (!embedded) {
    return null
  }

  return content
}

function CodexCard({ entry }: { entry: CodexEntry }) {
  return (
    <div className="p-4 border border-metal-800 rounded-xl bg-metal-900/40 hover:border-rust-500/60 transition-colors">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-xs font-mono text-metal-500 uppercase tracking-wider">{entry.category}</p>
          <h3 className="font-display font-bold text-lg text-white">{entry.title}</h3>
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {entry.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-metal-800 text-[11px] text-metal-300">
              <Tag className="w-3 h-3 text-rust-400" />
              {tag}
            </span>
          ))}
        </div>
      </div>
      <p className="text-sm text-metal-300 mb-2">{entry.summary}</p>
      <pre className="text-xs text-metal-400 whitespace-pre-wrap font-mono leading-relaxed">{entry.details}</pre>
    </div>
  )
}
