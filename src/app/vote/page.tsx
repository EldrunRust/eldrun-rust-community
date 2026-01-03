'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Vote, Gift, Trophy, Star, ExternalLink, Clock, 
  CheckCircle, Coins, Zap, Crown, Award, Heart
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const VOTE_SITES = [
  {
    id: 'rust-servers',
    name: 'Rust-Servers.net',
    url: 'https://rust-servers.net/server/12345/vote/',
    icon: '🎮',
    reward: 500,
    cooldown: '12 Stunden',
    bonus: 'Top 10 = 2x Rewards'
  },
  {
    id: 'top-rust',
    name: 'TopRustServers.com',
    url: 'https://toprustservers.com/vote/eldrun',
    icon: '🏆',
    reward: 500,
    cooldown: '12 Stunden',
    bonus: 'Wochenend-Bonus +50%'
  },
  {
    id: 'trackyserver',
    name: 'TrackyServer.com',
    url: 'https://trackyserver.com/server/eldrun/vote',
    icon: '📊',
    reward: 400,
    cooldown: '24 Stunden',
    bonus: 'Streak-Bonus verfügbar'
  },
  {
    id: 'battlemetrics',
    name: 'BattleMetrics',
    url: 'https://battlemetrics.com/servers/rust/12345',
    icon: '⚔️',
    reward: 300,
    cooldown: '24 Stunden',
    bonus: 'Favorisieren zählt!'
  },
]

const VOTE_REWARDS = [
  { votes: 1, reward: 'Starter Vote Crate', icon: Gift, color: 'text-green-400' },
  { votes: 5, reward: '2.500 Coins + Random Kit', icon: Coins, color: 'text-amber-400' },
  { votes: 10, reward: 'Premium Vote Crate', icon: Star, color: 'text-blue-400' },
  { votes: 25, reward: 'VIP Bronze (24h) + 10.000 Coins', icon: Crown, color: 'text-purple-400' },
  { votes: 50, reward: 'Legendary Vote Crate + Exclusive Skin', icon: Trophy, color: 'text-amber-400' },
  { votes: 100, reward: 'VIP Gold (7 Tage) + 50.000 Coins', icon: Award, color: 'text-yellow-400' },
]

export default function VotePage() {
  const [votedSites, setVotedSites] = useState<string[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [monthlyVotes, setMonthlyVotes] = useState(0)
  const [serverRank, setServerRank] = useState<string>('-')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVoteStats = async () => {
      try {
        const res = await fetch('/api/vote')
        if (res.ok) {
          const data = await res.json()
          setTotalVotes(data.totalVotes || 0)
          setMonthlyVotes(data.monthlyVotes || 0)
          setServerRank(data.serverRank ? `#${data.serverRank}` : '-')
          setVotedSites(data.votedSites || [])
        }
      } catch (error) {
        console.error('Failed to fetch vote stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVoteStats()
  }, [])

  const handleVote = (siteId: string, url: string) => {
    window.open(url, '_blank')
    if (!votedSites.includes(siteId)) {
      setVotedSites([...votedSites, siteId])
    }
  }

  return (
    <EldrunPageShell
      icon={Vote}
      badge="VOTE"
      title="VOTE FOR ELDRUN"
      subtitle="UNTERSTÜTZE UNS"
      description={`Unterstütze unseren Server mit deiner Stimme! Du hast ${totalVotes} Votes, ${monthlyVotes} diesen Monat. Server Ranking: ${serverRank}`}
      gradient="from-amber-300 via-amber-400 to-amber-600"
      glowColor="rgba(245,158,11,0.22)"
    >
      <div>
        <AuthGate>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Vote Sites */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ExternalLink className="w-6 h-6 text-amber-400" />
                Vote-Seiten
              </h2>
              
              {VOTE_SITES.map((site, index) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{site.icon}</span>
                      <div>
                        <h3 className="font-bold text-white text-lg">{site.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-metal-400">
                          <span className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-amber-400" />
                            {site.reward} Coins
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {site.cooldown}
                          </span>
                        </div>
                        <p className="text-xs text-green-400 mt-1">{site.bonus}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleVote(site.id, site.url)}
                      className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                        votedSites.includes(site.id)
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
                      }`}
                    >
                      {votedSites.includes(site.id) ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Voted!
                        </>
                      ) : (
                        <>
                          <Vote className="w-5 h-5" />
                          Jetzt Voten
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Daily Bonus */}
              <div className="p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Täglicher Vote-Bonus</h3>
                    <p className="text-metal-400">
                      Vote auf allen 4 Seiten für einen Bonus von <span className="text-amber-400 font-bold">+500 Coins</span>!
                    </p>
                  </div>
                  <div className="ml-auto text-center">
                    <p className="text-3xl font-bold text-purple-400">{votedSites.length}/4</p>
                    <p className="text-xs text-metal-500">Heute gevotet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards Sidebar */}
            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Gift className="w-6 h-6 text-green-400" />
                Vote-Belohnungen
              </h2>
              
              <div className="space-y-3">
                {VOTE_REWARDS.map((reward, index) => (
                  <motion.div
                    key={reward.votes}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 bg-metal-900/50 border rounded-lg ${
                      totalVotes >= reward.votes
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-metal-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        totalVotes >= reward.votes ? 'bg-green-500/20' : 'bg-metal-800'
                      }`}>
                        <reward.icon className={`w-5 h-5 ${totalVotes >= reward.votes ? 'text-green-400' : reward.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{reward.reward}</p>
                        <p className="text-metal-500 text-xs">{reward.votes} Votes</p>
                      </div>
                      {totalVotes >= reward.votes && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Support Note */}
              <div className="mt-6 p-4 bg-rust-500/10 border border-rust-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-rust-400 mb-2">
                  <Heart className="w-5 h-5" />
                  <span className="font-bold">Danke!</span>
                </div>
                <p className="text-metal-400 text-sm">
                  Jeder Vote hilft uns, mehr Spieler zu erreichen und den Server zu verbessern!
                </p>
              </div>
            </div>
          </div>
        </AuthGate>
      </div>
    </EldrunPageShell>
  )
}
