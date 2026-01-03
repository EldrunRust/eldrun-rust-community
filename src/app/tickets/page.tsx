'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Ticket, Plus, Search, Filter, Clock, MessageSquare,
  AlertCircle, CheckCircle, XCircle, User, ChevronRight,
  Tag, Calendar, X, Send, Paperclip
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const TICKET_CATEGORIES = [
  { id: 'support', name: 'Allgemeiner Support', icon: '💬', color: 'text-blue-400' },
  { id: 'bug', name: 'Bug Report', icon: '🐛', color: 'text-red-400' },
  { id: 'appeal', name: 'Ban Appeal', icon: '⚖️', color: 'text-amber-400' },
  { id: 'payment', name: 'Zahlungsproblem', icon: '💳', color: 'text-green-400' },
  { id: 'suggestion', name: 'Vorschlag', icon: '💡', color: 'text-purple-400' },
  { id: 'other', name: 'Sonstiges', icon: '📝', color: 'text-metal-400' },
]

const TICKET_STATUS = {
  open: { name: 'Offen', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: AlertCircle },
  pending: { name: 'Wartet auf Antwort', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  resolved: { name: 'Gelöst', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  closed: { name: 'Geschlossen', color: 'bg-metal-500/20 text-metal-400 border-metal-500/30', icon: XCircle },
}

// Ticket type definition
interface Ticket {
  id: string
  title: string
  category: string
  status: string
  priority: string
  createdAt: Date
  updatedAt: Date
  messages: number
  assignee: string | null
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !filterStatus || ticket.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `vor ${minutes}m`
    if (hours < 24) return `vor ${hours}h`
    return `vor ${days}d`
  }

  return (
    <EldrunPageShell
      icon={Ticket}
      badge="TICKETS"
      title="SUPPORT TICKETS"
      subtitle="WIR HELFEN DIR"
      description={`${tickets.length} Tickets, ${tickets.filter(t => t.status === 'open' || t.status === 'pending').length} offen, ${tickets.filter(t => t.status === 'resolved').length} gelöst.`}
      gradient="from-blue-300 via-blue-400 to-blue-600"
      glowColor="rgba(59,130,246,0.22)"
    >
      <AuthGate>
      <div>
        {/* Actions */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
            <input
              type="text"
              placeholder="Ticket suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white placeholder:text-metal-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Neues Ticket
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilterStatus(null)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              !filterStatus
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-metal-800 text-metal-400 border border-metal-700'
            }`}
          >
            Alle
          </button>
          {Object.entries(TICKET_STATUS).map(([key, status]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? null : key)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 ${
                filterStatus === key
                  ? status.color + ' border'
                  : 'bg-metal-800 text-metal-400 border border-metal-700'
              }`}
            >
              <status.icon className="w-3 h-3" />
              {status.name}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.map((ticket, index) => {
            const category = TICKET_CATEGORIES.find(c => c.id === ticket.category)
            const status = TICKET_STATUS[ticket.status as keyof typeof TICKET_STATUS]

            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-metal-900/50 border border-metal-800 rounded-xl p-5 hover:border-blue-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-metal-800 flex items-center justify-center text-2xl">
                    {category?.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-metal-500 font-mono">{ticket.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs border ${status.color}`}>
                        {status.name}
                      </span>
                      {ticket.priority === 'critical' && (
                        <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                          KRITISCH
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white mb-1">{ticket.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-metal-500">
                      <span className={category?.color}>{category?.name}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(ticket.updatedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.messages} Nachrichten
                      </span>
                    </div>
                  </div>

                  {/* Assignee */}
                  <div className="text-right">
                    {ticket.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-metal-800 flex items-center justify-center">
                          <User className="w-4 h-4 text-metal-400" />
                        </div>
                        <span className="text-sm text-metal-400">{ticket.assignee}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-metal-600">Nicht zugewiesen</span>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-metal-600" />
                </div>
              </motion.div>
            )
          })}

          {filteredTickets.length === 0 && (
            <div className="text-center py-12 text-metal-500">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Keine Tickets gefunden</p>
            </div>
          )}
        </div>

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateTicketModal onClose={() => setShowCreateModal(false)} />
          )}
        </AnimatePresence>

        {/* Ticket Detail Modal */}
        <AnimatePresence>
          {selectedTicket && (
            <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
          )}
        </AnimatePresence>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}

function CreateTicketModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'medium',
    description: ''
  })

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
        className="bg-metal-900 border border-metal-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-metal-800 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">Neues Ticket erstellen</h2>
          <button onClick={onClose} className="p-2 text-metal-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-metal-400 mb-2">Kategorie</label>
            <div className="grid grid-cols-3 gap-2">
              {TICKET_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFormData({...formData, category: cat.id})}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    formData.category === cat.id
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                      : 'bg-metal-800 border-metal-700 text-metal-400 hover:border-metal-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs">{cat.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-metal-400 mb-2">Betreff</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Kurze Beschreibung des Problems"
              className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-metal-400 mb-2">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Beschreibe dein Problem so detailliert wie möglich..."
              rows={5}
              className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-metal-800 text-metal-400 rounded-lg hover:text-white">
              <Paperclip className="w-4 h-4" />
              Datei anhängen
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-metal-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Ticket erstellen
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function TicketDetailModal({ ticket, onClose }: { ticket: Ticket, onClose: () => void }) {
  const [message, setMessage] = useState('')
  const category = TICKET_CATEGORIES.find(c => c.id === ticket.category)
  const status = TICKET_STATUS[ticket.status as keyof typeof TICKET_STATUS]

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
        className="bg-metal-900 border border-metal-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-metal-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-metal-500 font-mono">{ticket.id}</span>
                <span className={`px-2 py-0.5 rounded text-xs border ${status.color}`}>
                  {status.name}
                </span>
              </div>
              <h2 className="font-display font-bold text-xl text-white">{ticket.title}</h2>
              <div className="flex items-center gap-2 mt-2 text-sm text-metal-400">
                <span className={category?.color}>{category?.icon} {category?.name}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-metal-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-metal-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="font-medium text-white">Du</span>
                <span className="text-sm text-metal-500 ml-2">vor 2h</span>
              </div>
            </div>
            <p className="text-metal-300">
              Ich kann mich seit heute Morgen nicht mehr auf dem Server einloggen. Es erscheint die Fehlermeldung &quot;Connection Failed&quot;.
            </p>
          </div>

          {ticket.assignee && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <span className="font-medium text-white">{ticket.assignee}</span>
                  <span className="px-2 py-0.5 ml-2 bg-green-500/20 text-green-400 text-xs rounded">Staff</span>
                  <span className="text-sm text-metal-500 ml-2">vor 30m</span>
                </div>
              </div>
              <p className="text-metal-300">
                Hallo! Wir haben das Problem identifiziert. Bitte versuche, deinen Rust-Client neu zu starten und die Steam-Dateien zu verifizieren.
              </p>
            </div>
          )}
        </div>

        {/* Reply */}
        <div className="p-4 border-t border-metal-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nachricht schreiben..."
              className="flex-1 px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-blue-500"
            />
            <button className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
