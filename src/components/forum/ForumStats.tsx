'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  BarChart3, MessageSquare, Hash, Users, TrendingUp, 
  Calendar, Award, Clock, Flame, Swords
} from 'lucide-react'
import { useForumStore } from '@/store/forumStore'
import { useStore } from '@/store/useStore'

export function ForumStats() {
  const { stats } = useForumStore()
  const { factionScore } = useStore()
  const totalScore = Math.max(1, factionScore.seraphar + factionScore.vorgaroth)
  const serapharPct = Math.round((factionScore.seraphar / totalScore) * 100)
  const vorgarothPct = 100 - serapharPct

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-metal-900/50 border border-metal-800 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-metal-800 bg-gradient-to-r from-metal-900 to-metal-900/50">
        <h3 className="font-display font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-rust-400" />
          Forum Statistiken
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="p-4 space-y-4">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Hash className="w-4 h-4" />}
            label="Themen"
            value={stats.totalThreads.toLocaleString()}
            color="text-blue-400"
          />
          <StatCard
            icon={<MessageSquare className="w-4 h-4" />}
            label="Beiträge"
            value={stats.totalPosts.toLocaleString()}
            color="text-green-400"
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Mitglieder"
            value={stats.totalMembers.toLocaleString()}
            color="text-purple-400"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Posts/Tag"
            value={Math.round(stats.totalPosts / 365).toLocaleString()}
            color="text-amber-400"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-metal-800" />

        {/* Today Stats */}
        <div className="space-y-2">
          <h4 className="text-metal-500 text-xs font-medium uppercase tracking-wider">Heute</h4>
          <div className="flex items-center justify-between text-sm">
            <span className="text-metal-400 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Neue Beiträge
            </span>
            <span className="text-white font-bold">{stats.postsToday}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-metal-400 flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-400" />
              Neue Themen
            </span>
            <span className="text-white font-bold">{stats.threadsToday}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-metal-800" />

        {/* Faction War Snapshot */}
        <div className="space-y-2">
          <h4 className="text-metal-500 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
            <Swords className="w-4 h-4 text-rust-400" />
            Fraktionskrieg – Global
          </h4>
          <div className="h-2.5 bg-metal-800 rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500/80 to-amber-400/60 transition-all"
              style={{ width: `${serapharPct}%` }}
            />
            <div
              className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-600/70 to-red-500/60 transition-all"
              style={{ width: `${vorgarothPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-metal-400">
            <span className="text-amber-400">Seraphar {serapharPct}%</span>
            <span className="text-red-400">Vorgaroth {vorgarothPct}%</span>
          </div>
          <p className="text-[11px] text-metal-500">
            Werte basieren auf globalem Store-Status – ändere die Balance über das Faction-Widget.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-metal-800" />

        {/* Newest Member */}
        <div className="space-y-2">
          <h4 className="text-metal-500 text-xs font-medium uppercase tracking-wider">Neustes Mitglied</h4>
          {stats.newestMember ? (
            <Link 
              href={`/profile/${stats.newestMember.id}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-metal-800/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rust-500 to-amber-600 flex items-center justify-center text-white font-bold">
                {stats.newestMember.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{stats.newestMember.name}</p>
                <p className="text-metal-500 text-xs">
                  Beigetreten: {formatDate(stats.newestMember.joinedAt)}
                </p>
              </div>
            </Link>
          ) : (
            <p className="text-metal-500 text-sm">Noch keine Mitglieder</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-metal-800" />

        {/* Online Record */}
        <div className="space-y-2">
          <h4 className="text-metal-500 text-xs font-medium uppercase tracking-wider">Online-Rekord</h4>
          <div className="p-3 bg-gradient-to-r from-rust-500/10 to-amber-500/10 border border-rust-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-metal-300 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Max. gleichzeitig
              </span>
              <span className="text-amber-400 font-display font-bold text-lg">
                {stats.recordOnline.toLocaleString()}
              </span>
            </div>
            <p className="text-metal-500 text-xs mt-1">
              am {formatDate(stats.recordOnlineDate)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="p-3 bg-metal-800/50 rounded-lg">
      <div className={`${color} mb-1`}>{icon}</div>
      <p className="text-white font-display font-bold text-lg">{value}</p>
      <p className="text-metal-500 text-xs">{label}</p>
    </div>
  )
}
