'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Search, X, Hash, MessageSquare, User, Clock, 
  ArrowRight, Loader2, Filter, SlidersHorizontal
} from 'lucide-react'
import { useForumStore, SearchResult } from '@/store/forumStore'

export function ForumSearch() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchType, setSearchType] = useState<'all' | 'threads' | 'posts' | 'users'>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { searchResults, isSearching, searchAPI, clearSearch } = useForumStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchAPI(query)
      } else {
        clearSearch()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchAPI, clearSearch])

  const handleClear = () => {
    setQuery('')
    clearSearch()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
      setIsFocused(false)
    }
  }

  return (
    <div className="relative flex-1 max-w-md">
      {/* Search Input */}
      <div className={`relative flex items-center transition-all ${
        isFocused ? 'ring-2 ring-rust-500/50' : ''
      }`}>
        <div className="absolute left-3 text-metal-500">
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Forum durchsuchen..."
          className="w-full pl-10 pr-20 py-2.5 bg-metal-800 border border-metal-700 rounded-xl text-white placeholder-metal-500 focus:outline-none focus:border-rust-500 text-sm"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-metal-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-metal-500" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg transition-colors ${
              showFilters ? 'bg-rust-500 text-white' : 'hover:bg-metal-700 text-metal-500'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Dropdown */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-metal-800 border border-metal-700 rounded-xl shadow-xl z-20"
          >
            <p className="text-metal-500 text-xs font-medium mb-2">Suchen in:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Alles' },
                { value: 'threads', label: 'Themen' },
                { value: 'posts', label: 'Beiträge' },
                { value: 'users', label: 'Mitglieder' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSearchType(option.value as any)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    searchType === option.value
                      ? 'bg-rust-500 text-white'
                      : 'bg-metal-700 text-metal-400 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isFocused && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-metal-800 border border-metal-700 rounded-xl shadow-xl z-20 overflow-hidden"
          >
            {isSearching ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-rust-400 mx-auto mb-2" />
                <p className="text-metal-500 text-sm">Suche läuft...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <SearchResultItem key={`${result.type}-${result.id}`} result={result} />
                ))}
                <Link
                  href={`/forum/search?q=${encodeURIComponent(query)}`}
                  className="flex items-center justify-center gap-2 p-3 text-rust-400 hover:bg-metal-700 border-t border-metal-700 text-sm transition-colors"
                >
                  Alle Ergebnisse anzeigen
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="w-8 h-8 text-metal-600 mx-auto mb-2" />
                <p className="text-metal-500 text-sm">Keine Ergebnisse für &quot;{query}&quot;</p>
                <p className="text-metal-600 text-xs mt-1">Versuche andere Suchbegriffe</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Search Hints */}
      <AnimatePresence>
        {isFocused && query.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-metal-800 border border-metal-700 rounded-xl shadow-xl z-20"
          >
            <p className="text-metal-500 text-xs font-medium mb-3">Schnellsuche:</p>
            <div className="space-y-2">
              <QuickSearchItem 
                icon={<Hash className="w-4 h-4" />}
                label="Beliebte Themen"
                query="beliebt"
                onClick={(q) => setQuery(q)}
              />
              <QuickSearchItem 
                icon={<MessageSquare className="w-4 h-4" />}
                label="Neueste Beiträge"
                query="neu"
                onClick={(q) => setQuery(q)}
              />
              <QuickSearchItem 
                icon={<User className="w-4 h-4" />}
                label="Aktive Mitglieder"
                query="@aktiv"
                onClick={(q) => setQuery(q)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SearchResultItem({ result }: { result: SearchResult }) {
  const getIcon = () => {
    switch (result.type) {
      case 'thread': return <Hash className="w-4 h-4 text-blue-400" />
      case 'post': return <MessageSquare className="w-4 h-4 text-green-400" />
      case 'user': return <User className="w-4 h-4 text-purple-400" />
    }
  }

  const getLink = () => {
    switch (result.type) {
      case 'thread': return `/forum/thread/${result.id}`
      case 'post': return `/forum/thread/${result.id}#post`
      case 'user': return `/profile/${result.id}`
    }
  }

  return (
    <Link
      href={getLink()}
      className="flex items-start gap-3 p-3 hover:bg-metal-700 transition-colors"
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{result.title}</p>
        <p className="text-metal-500 text-xs line-clamp-2 mt-0.5">{result.excerpt}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-metal-600">
          <span>{result.authorName}</span>
          {result.boardName && <span>in {result.boardName}</span>}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(result.createdAt).toLocaleDateString('de-DE')}
          </span>
        </div>
      </div>
    </Link>
  )
}

function QuickSearchItem({ 
  icon, 
  label, 
  query, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  query: string;
  onClick: (query: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(query)}
      className="flex items-center gap-3 w-full p-2 hover:bg-metal-700 rounded-lg transition-colors text-left"
    >
      <span className="text-metal-500">{icon}</span>
      <span className="text-metal-300 text-sm">{label}</span>
    </button>
  )
}
