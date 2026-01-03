import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketCategory = 'bug' | 'support' | 'billing' | 'appeal' | 'suggestion' | 'other'

export interface TicketMessage {
  id: string
  ticketId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  isStaff: boolean
  content: string
  attachments?: string[]
  createdAt: string
}

export interface Ticket {
  id: string
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  userId: string
  userName: string
  userAvatar?: string
  assignedTo?: string
  assignedName?: string
  messages: TicketMessage[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  tags?: string[]
}

interface TicketState {
  tickets: Ticket[]
  
  // Actions
  createTicket: (ticket: Omit<Ticket, 'id' | 'messages' | 'createdAt' | 'updatedAt' | 'status'>) => Ticket
  updateTicket: (id: string, updates: Partial<Ticket>) => void
  deleteTicket: (id: string) => void
  addMessage: (ticketId: string, message: Omit<TicketMessage, 'id' | 'ticketId' | 'createdAt'>) => void
  changeStatus: (id: string, status: TicketStatus) => void
  assignTicket: (id: string, staffId: string, staffName: string) => void
  
  // Getters
  getTicketById: (id: string) => Ticket | undefined
  getTicketsByUser: (userId: string) => Ticket[]
  getTicketsByStatus: (status: TicketStatus) => Ticket[]
  getOpenTicketsCount: () => number
}

export const useTicketStore = create<TicketState>()(
  persist(
    (set, get) => ({
      tickets: [],

      createTicket: (ticketData) => {
        const newTicket: Ticket = {
          ...ticketData,
          id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'open',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          tickets: [newTicket, ...state.tickets]
        }))
        
        return newTicket
      },

      updateTicket: (id, updates) => {
        set((state) => ({
          tickets: state.tickets.map(t => 
            t.id === id 
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          )
        }))
      },

      deleteTicket: (id) => {
        set((state) => ({
          tickets: state.tickets.filter(t => t.id !== id)
        }))
      },

      addMessage: (ticketId, messageData) => {
        const newMessage: TicketMessage = {
          ...messageData,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ticketId,
          createdAt: new Date().toISOString(),
        }
        
        set((state) => ({
          tickets: state.tickets.map(t => 
            t.id === ticketId 
              ? { 
                  ...t, 
                  messages: [...t.messages, newMessage],
                  updatedAt: new Date().toISOString()
                }
              : t
          )
        }))
      },

      changeStatus: (id, status) => {
        set((state) => ({
          tickets: state.tickets.map(t => 
            t.id === id 
              ? { 
                  ...t, 
                  status,
                  updatedAt: new Date().toISOString(),
                  resolvedAt: status === 'resolved' || status === 'closed' 
                    ? new Date().toISOString() 
                    : t.resolvedAt
                }
              : t
          )
        }))
      },

      assignTicket: (id, staffId, staffName) => {
        set((state) => ({
          tickets: state.tickets.map(t => 
            t.id === id 
              ? { 
                  ...t, 
                  assignedTo: staffId,
                  assignedName: staffName,
                  status: t.status === 'open' ? 'in_progress' : t.status,
                  updatedAt: new Date().toISOString()
                }
              : t
          )
        }))
      },

      getTicketById: (id) => get().tickets.find(t => t.id === id),
      
      getTicketsByUser: (userId) => get().tickets.filter(t => t.userId === userId),
      
      getTicketsByStatus: (status) => get().tickets.filter(t => t.status === status),
      
      getOpenTicketsCount: () => get().tickets.filter(t => 
        t.status === 'open' || t.status === 'in_progress' || t.status === 'waiting'
      ).length,
    }),
    {
      name: 'eldrun-tickets-storage',
    }
  )
)

export default useTicketStore
