'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, Shield, Star, Users, MessageSquare, 
  Gamepad2, Wrench, Heart, Award, Globe,
  Clock, CheckCircle, Loader2
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

interface StaffMember {
  id: string
  name: string
  role: string
  rank: string
  avatar: string
  bio: string
  joined: string
  specialties: string[]
  status: 'online' | 'away' | 'offline'
  discord: string
}

// ═══════════════════════════════════════════════════════════════════════════
// ELDRUN STAFF TEAM - Die Wächter des Reiches
// ═══════════════════════════════════════════════════════════════════════════

const STAFF_MEMBERS: StaffMember[] = [
  {
    id: '1',
    name: 'SirEldrun',
    role: 'Owner & Gründer',
    rank: 'owner',
    avatar: '👑',
    bio: 'Der Schöpfer und oberste Herrscher von Eldrun. Verantwortlich für die gesamte Vision, Entwicklung, Plugin-Programmierung und strategische Ausrichtung des Projekts. Sein Wort ist Gesetz in den Landen von Eldrun.',
    joined: 'Januar 2024',
    specialties: ['Server Architecture', 'Plugin Development', 'Rust Expertise', 'Community Vision', 'Game Design'],
    status: 'online',
    discord: 'SirEldrun#0001'
  },
  {
    id: '2',
    name: 'Claude Opus',
    role: 'AI Co-Admin & Entwickler',
    rank: 'co-owner',
    avatar: '🤖',
    bio: 'Künstliche Intelligenz und technischer Co-Administrator. Zuständig für Website-Entwicklung, Code-Optimierung, Content-Erstellung und kreative Unterstützung. Arbeitet 24/7 an der Perfektion von Eldrun.',
    joined: 'Dezember 2024',
    specialties: ['Web Development', 'AI Assistance', 'Code Review', 'Content Creation', 'Technical Support'],
    status: 'online',
    discord: 'ClaudeOpus#AI01'
  },
  {
    id: '3',
    name: 'PhoenixQueen',
    role: 'Head Community Manager',
    rank: 'head-admin',
    avatar: '🔥',
    bio: 'Leiterin der Community und Events. Kümmert sich um Spieler-Feedback, organisiert epische Events und sorgt für eine toxikfreie Atmosphäre.',
    joined: 'Januar 2024',
    specialties: ['Event Planning', 'Community Management', 'Player Relations', 'Social Media'],
    status: 'online',
    discord: 'PhoenixQueen#1234'
  },
  {
    id: '4',
    name: 'DragonMaster',
    role: 'Head Admin',
    rank: 'head-admin',
    avatar: '🐉',
    bio: 'Leitet das Admin-Team. Zuständig für Regelüberwachung, Ban-Appeals und Spieler-Reports.',
    joined: 'Februar 2024',
    specialties: ['Administration', 'Conflict Resolution', 'Rule Enforcement'],
    status: 'online',
    discord: 'DragonMaster#5678'
  },
  {
    id: '4',
    name: 'ShadowBlade',
    role: 'Senior Admin',
    rank: 'admin',
    avatar: '⚔️',
    bio: 'Erfahrener Admin mit Fokus auf Anti-Cheat und technischen Support.',
    joined: 'März 2024',
    specialties: ['Anti-Cheat', 'Technical Support', 'Server Monitoring'],
    status: 'online',
    discord: 'ShadowBlade#9012'
  },
  {
    id: '5',
    name: 'MoonWatcher',
    role: 'Admin',
    rank: 'admin',
    avatar: '🌙',
    bio: 'Nachtschicht-Admin. Sorgt für Ordnung wenn andere schlafen.',
    joined: 'April 2024',
    specialties: ['Night Shift', 'Player Support', 'Event Hosting'],
    status: 'away',
    discord: 'MoonWatcher#3456'
  },
  {
    id: '6',
    name: 'StormBringer',
    role: 'Admin',
    rank: 'admin',
    avatar: '⚡',
    bio: 'PvP-Experte und Event-Koordinator. Organisiert Turniere und Fraktionskriege.',
    joined: 'Mai 2024',
    specialties: ['PvP Events', 'Tournament Organization', 'Faction Wars'],
    status: 'online',
    discord: 'StormBringer#7890'
  },
  {
    id: '7',
    name: 'IronHeart',
    role: 'Moderator',
    rank: 'moderator',
    avatar: '🛡️',
    bio: 'Freundlicher Moderator mit Fokus auf neue Spieler und Community-Hilfe.',
    joined: 'Juni 2024',
    specialties: ['New Player Help', 'Chat Moderation', 'Community Support'],
    status: 'online',
    discord: 'IronHeart#1111'
  },
  {
    id: '8',
    name: 'CrystalMage',
    role: 'Moderator',
    rank: 'moderator',
    avatar: '💎',
    bio: 'Kümmert sich um den Discord-Server und Social Media.',
    joined: 'Juli 2024',
    specialties: ['Discord Management', 'Social Media', 'Content Creation'],
    status: 'offline',
    discord: 'CrystalMage#2222'
  },
  {
    id: '9',
    name: 'NightOwl',
    role: 'Trial Moderator',
    rank: 'trial-mod',
    avatar: '🦉',
    bio: 'Neues Teammitglied in der Probezeit. Hilft bei Chat-Moderation und Support.',
    joined: 'November 2024',
    specialties: ['Chat Moderation', 'Ticket Support', 'Learning'],
    status: 'online',
    discord: 'NightOwl#3333'
  },
  {
    id: '10',
    name: 'BuilderKing',
    role: 'Builder',
    rank: 'builder',
    avatar: '🏗️',
    bio: 'Erschafft die epischen Raid Bases und Spawn-Bereiche. Meister der Architektur.',
    joined: 'März 2024',
    specialties: ['Base Building', 'Map Design', 'Creative Content'],
    status: 'away',
    discord: 'BuilderKing#4444'
  },
]

const RANK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'owner': { bg: 'bg-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-400' },
  'co-owner': { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400' },
  'head-admin': { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400' },
  'admin': { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-400' },
  'moderator': { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400' },
  'trial-mod': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', text: 'text-cyan-400' },
  'builder': { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400' },
}

const STATUS_COLORS: Record<string, string> = {
  'online': 'bg-green-500',
  'away': 'bg-amber-500',
  'offline': 'bg-metal-600',
}

export default function StaffPage() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(STAFF_MEMBERS)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch staff from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch('/api/staff')
        if (res.ok) {
          const data = await res.json()
          if (data.staff && data.staff.length > 0) {
            setStaffMembers(data.staff)
          }
        }
      } catch (error) {
        console.error('Failed to fetch staff:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStaff()
  }, [])

  const owners = staffMembers.filter(m => ['owner', 'co-owner'].includes(m.rank))
  const admins = staffMembers.filter(m => ['head-admin', 'admin'].includes(m.rank))
  const moderators = staffMembers.filter(m => ['moderator', 'trial-mod'].includes(m.rank))
  const builders = staffMembers.filter(m => m.rank === 'builder')

  const renderStaffCard = (member: typeof STAFF_MEMBERS[0], index: number) => {
    const colors = RANK_COLORS[member.rank] || RANK_COLORS['moderator']
    
    return (
      <motion.div
        key={member.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`p-6 ${colors.bg} border ${colors.border} rounded-xl`}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-metal-800 rounded-xl flex items-center justify-center text-3xl">
              {member.avatar}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 ${STATUS_COLORS[member.status]} rounded-full border-2 border-metal-900`} />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-lg">{member.name}</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.text} ${colors.bg} border ${colors.border}`}>
                {member.role}
              </span>
            </div>
            <p className="text-metal-400 text-sm mt-1 line-clamp-2">{member.bio}</p>
            
            {/* Specialties */}
            <div className="flex flex-wrap gap-1 mt-3">
              {member.specialties.map((spec) => (
                <span key={spec} className="px-2 py-0.5 bg-metal-800 rounded text-xs text-metal-400">
                  {spec}
                </span>
              ))}
            </div>
            
            {/* Meta */}
            <div className="flex items-center gap-4 mt-3 text-xs text-metal-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Seit {member.joined}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {member.discord}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <EldrunPageShell
      icon={Users}
      badge="TEAM"
      title="UNSER TEAM"
      subtitle="DIE WÄCHTER VON ELDRUN"
      description="Die Menschen hinter Eldrun. Unser engagiertes Team arbeitet täglich daran, euch das beste Spielerlebnis zu bieten."
      gradient="from-amber-300 via-amber-400 to-amber-600"
      glowColor="rgba(245,158,11,0.22)"
    >
      <AuthGate>
      <div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{owners.length}</p>
            <p className="text-metal-500 text-sm">Leitung</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{admins.length}</p>
            <p className="text-metal-500 text-sm">Admins</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Star className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{moderators.length}</p>
            <p className="text-metal-500 text-sm">Moderatoren</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Wrench className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{builders.length}</p>
            <p className="text-metal-500 text-sm">Builder</p>
          </div>
        </div>

        {/* Owners */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-400" />
            Leitung
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {owners.map((member, index) => renderStaffCard(member, index))}
          </div>
        </div>

        {/* Admins */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            Administratoren
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {admins.map((member, index) => renderStaffCard(member, index))}
          </div>
        </div>

        {/* Moderators */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Star className="w-6 h-6 text-blue-400" />
            Moderatoren
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moderators.map((member, index) => renderStaffCard(member, index))}
          </div>
        </div>

        {/* Builders */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Wrench className="w-6 h-6 text-green-400" />
            Builder Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {builders.map((member, index) => renderStaffCard(member, index))}
          </div>
        </div>

        {/* Join Team CTA */}
        <div className="p-8 bg-gradient-to-r from-rust-900/30 to-amber-900/30 border border-rust-500/30 rounded-xl text-center">
          <Award className="w-12 h-12 text-rust-400 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-white mb-2">
            Werde Teil des Teams!
          </h3>
          <p className="text-metal-400 mb-4 max-w-xl mx-auto">
            Du bist aktiv, hilfst gerne anderen und möchtest Eldrun mitgestalten? 
            Wir suchen immer engagierte Spieler für unser Team!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://discord.gg/eldrun"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rust-600 hover:bg-rust-500 text-white font-bold rounded-lg transition-colors"
            >
              <Heart className="w-5 h-5" />
              Bewerbung im Discord
            </a>
          </div>
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
