import { Metadata } from 'next'
import { LeaderboardClient } from '@/components/leaderboard/LeaderboardClient'
import { EldrunPageShellServer } from '@/components/layout/EldrunPageShellServer'
import { Trophy } from 'lucide-react'
import { AuthGate } from '@/components/AuthGate'

export const metadata: Metadata = {
  title: 'Leaderboard | Eldrun',
  description: 'Ranglisten und Spielerstatistiken des Eldrun Servers. Top Kills, K/D Ratio, Fraktionskrieg und Achievements.',
}

export default function LeaderboardPage() {
  return (
    <EldrunPageShellServer
      icon={Trophy}
      badge="LEADERBOARD"
      title="RANGLISTE"
      subtitle="TOP ELITE"
      description="Ranglisten und Spielerstatistiken des Eldrun Servers. Top Kills, K/D Ratio, Fraktionskrieg und Achievements."
      gradient="from-gold-300 via-gold-400 to-gold-600"
      glowColor="rgba(212,168,83,0.22)"
    >
      <AuthGate>
        <LeaderboardClient />
      </AuthGate>
    </EldrunPageShellServer>
  )
}
