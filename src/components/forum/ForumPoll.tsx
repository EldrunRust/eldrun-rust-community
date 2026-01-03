'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart2, Check, Clock, Users, Lock, ChevronDown,
  Eye, EyeOff, AlertCircle
} from 'lucide-react'
import { ForumPoll as ForumPollType, PollOption } from '@/store/forumStore'
import { useStore } from '@/store/useStore'

interface ForumPollProps {
  poll: ForumPollType
  onVote?: (optionIds: string[]) => void
}

export function ForumPoll({ poll, onVote }: ForumPollProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [showResults, setShowResults] = useState(poll.showResults)
  const { currentUser } = useStore()

  const isExpired = poll.endsAt && new Date(poll.endsAt) < new Date()
  const canVote = currentUser && !hasVoted && !isExpired && !poll.voters.includes(currentUser.id)

  const handleOptionClick = (optionId: string) => {
    if (!canVote) return

    if (poll.allowMultiple) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  const handleVote = () => {
    if (selectedOptions.length === 0) return
    
    onVote?.(selectedOptions)
    setHasVoted(true)
    setShowResults(true)
  }

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0
    return Math.round((votes / poll.totalVotes) * 100)
  }

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date()
    const diff = new Date(endDate).getTime() - now.getTime()
    
    if (diff <= 0) return 'Beendet'
    
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    
    if (days > 0) return `${days}d ${hours}h verbleibend`
    return `${hours}h verbleibend`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-metal-800/50 border border-metal-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-metal-700 bg-gradient-to-r from-metal-800 to-metal-800/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rust-500/20 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-rust-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">{poll.question}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-metal-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {poll.totalVotes} Stimmen
                </span>
                {poll.allowMultiple && (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Mehrfachauswahl
                  </span>
                )}
                {poll.endsAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeRemaining(poll.endsAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Toggle Results */}
          {(hasVoted || isExpired) && (
            <button
              onClick={() => setShowResults(!showResults)}
              className="p-2 hover:bg-metal-700 rounded-lg transition-colors"
            >
              {showResults ? (
                <EyeOff className="w-4 h-4 text-metal-400" />
              ) : (
                <Eye className="w-4 h-4 text-metal-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="p-4 space-y-2">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes)
          const isSelected = selectedOptions.includes(option.id)
          const isWinner = showResults && option.votes === Math.max(...poll.options.map(o => o.votes)) && option.votes > 0

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={!canVote}
              className={`w-full relative overflow-hidden rounded-lg transition-all ${
                canVote 
                  ? 'hover:bg-metal-700/50 cursor-pointer' 
                  : 'cursor-default'
              } ${isSelected ? 'ring-2 ring-rust-500' : ''}`}
            >
              {/* Background Progress Bar */}
              {showResults && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`absolute inset-y-0 left-0 ${
                    isWinner ? 'bg-rust-500/30' : 'bg-metal-700/50'
                  }`}
                />
              )}

              <div className="relative flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {/* Checkbox/Radio */}
                  <div className={`w-5 h-5 rounded-${poll.allowMultiple ? 'md' : 'full'} border-2 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-rust-500 border-rust-500' 
                      : 'border-metal-600'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Option Text */}
                  <span className={`text-sm ${isWinner ? 'font-bold text-rust-400' : 'text-white'}`}>
                    {option.text}
                  </span>

                  {isWinner && (
                    <span className="px-2 py-0.5 bg-rust-500/20 text-rust-400 text-xs rounded-full">
                      Führend
                    </span>
                  )}
                </div>

                {/* Results */}
                {showResults && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{percentage}%</span>
                    <span className="text-xs text-metal-500">({option.votes})</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-metal-700 bg-metal-800/30">
        {canVote ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-metal-500">
              {poll.allowMultiple 
                ? `${selectedOptions.length} Option(en) ausgewählt`
                : selectedOptions.length === 1 ? '1 Option ausgewählt' : 'Wähle eine Option'
              }
            </p>
            <button
              onClick={handleVote}
              disabled={selectedOptions.length === 0}
              className="px-4 py-2 bg-rust-500 hover:bg-rust-400 disabled:bg-metal-700 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors"
            >
              Abstimmen
            </button>
          </div>
        ) : !currentUser ? (
          <p className="text-xs text-metal-500 text-center">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Melde dich an, um abzustimmen
          </p>
        ) : isExpired ? (
          <p className="text-xs text-metal-500 text-center">
            <Lock className="w-4 h-4 inline mr-1" />
            Diese Umfrage ist beendet
          </p>
        ) : (
          <p className="text-xs text-metal-500 text-center">
            <Check className="w-4 h-4 inline mr-1" />
            Du hast bereits abgestimmt
          </p>
        )}
      </div>
    </motion.div>
  )
}

// Demo Poll for testing
export const DEMO_POLL: ForumPollType = {
  id: 'poll-1',
  question: 'Welches Update wollt ihr als nächstes sehen?',
  options: [
    { id: 'opt-1', text: 'Neue Waffen & Items', votes: 45, voterIds: [] },
    { id: 'opt-2', text: 'Verbesserte Basis-Mechaniken', votes: 32, voterIds: [] },
    { id: 'opt-3', text: 'Neue Karte / Biome', votes: 28, voterIds: [] },
    { id: 'opt-4', text: 'Performance Optimierungen', votes: 67, voterIds: [] },
    { id: 'opt-5', text: 'Mehr Events & Quests', votes: 23, voterIds: [] },
  ],
  allowMultiple: false,
  showResults: true,
  endsAt: new Date(Date.now() + 86400000 * 3), // 3 days from now
  totalVotes: 195,
  voters: []
}
