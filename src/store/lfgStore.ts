import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LFGStatus = 'active' | 'filled' | 'expired' | 'cancelled'
export type PlayStyle = 'casual' | 'competitive' | 'roleplay' | 'pvp' | 'pve' | 'farming' | 'raiding'
export type Experience = 'beginner' | 'intermediate' | 'experienced' | 'veteran'
export type Region = 'eu' | 'na' | 'asia' | 'oceania' | 'sa'

export interface LFGPost {
  id: string
  
  // Author info
  authorId: string
  authorName: string
  authorAvatar?: string
  authorHours?: number
  authorRating?: number
  
  // Post details
  title: string
  description: string
  playStyle: PlayStyle
  experience: Experience
  region: Region
  
  // Group requirements
  currentSize: number
  maxSize: number
  minHours?: number
  languages?: string[]
  
  // Availability
  availableNow: boolean
  availableFrom?: string
  availableTo?: string
  timezone?: string
  
  // Status
  status: LFGStatus
  applicants: LFGApplicant[]
  members: LFGMember[]
  
  // Timestamps
  createdAt: string
  updatedAt: string
  expiresAt: string
  
  // Tags
  tags?: string[]
  discordLink?: string
}

export interface LFGApplicant {
  id: string
  postId: string
  userId: string
  userName: string
  userAvatar?: string
  userHours?: number
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedAt: string
}

export interface LFGMember {
  userId: string
  userName: string
  userAvatar?: string
  joinedAt: string
  role?: string
}

interface LFGState {
  posts: LFGPost[]
  
  // Actions
  createPost: (post: Omit<LFGPost, 'id' | 'status' | 'applicants' | 'members' | 'createdAt' | 'updatedAt' | 'expiresAt'>) => LFGPost
  updatePost: (id: string, updates: Partial<LFGPost>) => void
  deletePost: (id: string) => void
  applyToPost: (postId: string, applicant: Omit<LFGApplicant, 'id' | 'postId' | 'status' | 'appliedAt'>) => void
  acceptApplicant: (postId: string, applicantId: string) => void
  rejectApplicant: (postId: string, applicantId: string) => void
  leavePost: (postId: string, userId: string) => void
  closePost: (id: string) => void
  
  // Getters
  getPostById: (id: string) => LFGPost | undefined
  getPostsByAuthor: (authorId: string) => LFGPost[]
  getActivePosts: () => LFGPost[]
  getPostsByPlayStyle: (playStyle: PlayStyle) => LFGPost[]
  getPostsByRegion: (region: Region) => LFGPost[]
  getActivePostsCount: () => number
}

export const useLFGStore = create<LFGState>()(
  persist(
    (set, get) => ({
      posts: [],

      createPost: (postData) => {
        const now = new Date()
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
        
        const newPost: LFGPost = {
          ...postData,
          id: `lfg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'active',
          applicants: [],
          members: [{
            userId: postData.authorId,
            userName: postData.authorName,
            userAvatar: postData.authorAvatar,
            joinedAt: now.toISOString(),
            role: 'Leader',
          }],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
        }
        
        set((state) => ({
          posts: [newPost, ...state.posts]
        }))
        
        return newPost
      },

      updatePost: (id, updates) => {
        set((state) => ({
          posts: state.posts.map(p => 
            p.id === id 
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          )
        }))
      },

      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter(p => p.id !== id)
        }))
      },

      applyToPost: (postId, applicantData) => {
        const newApplicant: LFGApplicant = {
          ...applicantData,
          id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          postId,
          status: 'pending',
          appliedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          posts: state.posts.map(p => 
            p.id === postId 
              ? { 
                  ...p, 
                  applicants: [...p.applicants, newApplicant],
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        }))
      },

      acceptApplicant: (postId, applicantId) => {
        set((state) => {
          const post = state.posts.find(p => p.id === postId)
          if (!post) return state
          
          const applicant = post.applicants.find(a => a.id === applicantId)
          if (!applicant) return state
          
          const newMember: LFGMember = {
            userId: applicant.userId,
            userName: applicant.userName,
            userAvatar: applicant.userAvatar,
            joinedAt: new Date().toISOString(),
          }
          
          const newCurrentSize = post.currentSize + 1
          const isFilled = newCurrentSize >= post.maxSize
          
          return {
            posts: state.posts.map(p => 
              p.id === postId 
                ? { 
                    ...p, 
                    applicants: p.applicants.map(a => 
                      a.id === applicantId 
                        ? { ...a, status: 'accepted' as const }
                        : a
                    ),
                    members: [...p.members, newMember],
                    currentSize: newCurrentSize,
                    status: isFilled ? 'filled' as LFGStatus : p.status,
                    updatedAt: new Date().toISOString()
                  }
                : p
            )
          }
        })
      },

      rejectApplicant: (postId, applicantId) => {
        set((state) => ({
          posts: state.posts.map(p => 
            p.id === postId 
              ? { 
                  ...p, 
                  applicants: p.applicants.map(a => 
                    a.id === applicantId 
                      ? { ...a, status: 'rejected' as const }
                      : a
                  ),
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        }))
      },

      leavePost: (postId, userId) => {
        set((state) => ({
          posts: state.posts.map(p => 
            p.id === postId 
              ? { 
                  ...p, 
                  members: p.members.filter(m => m.userId !== userId),
                  currentSize: Math.max(1, p.currentSize - 1),
                  status: p.status === 'filled' ? 'active' as LFGStatus : p.status,
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        }))
      },

      closePost: (id) => {
        set((state) => ({
          posts: state.posts.map(p => 
            p.id === id 
              ? { 
                  ...p, 
                  status: 'cancelled' as LFGStatus,
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        }))
      },

      getPostById: (id) => get().posts.find(p => p.id === id),
      
      getPostsByAuthor: (authorId) => get().posts.filter(p => p.authorId === authorId),
      
      getActivePosts: () => get().posts.filter(p => 
        p.status === 'active' && new Date(p.expiresAt) > new Date()
      ),
      
      getPostsByPlayStyle: (playStyle) => get().posts.filter(p => 
        p.status === 'active' && p.playStyle === playStyle
      ),
      
      getPostsByRegion: (region) => get().posts.filter(p => 
        p.status === 'active' && p.region === region
      ),
      
      getActivePostsCount: () => get().posts.filter(p => p.status === 'active').length,
    }),
    {
      name: 'eldrun-lfg-storage',
    }
  )
)

export default useLFGStore
