import { Metadata } from 'next'
import { CasinoClient } from '@/components/casino/CasinoClient'
import { EldrunPageShellServer } from '@/components/layout/EldrunPageShellServer'
import { Dices } from 'lucide-react'
import { AuthGate } from '@/components/AuthGate'

export const metadata: Metadata = {
  title: 'ELDRUN Casino | Gamble & Win',
  description: 'Das ultimative Eldrun Casino. Coinflip, Jackpot, Roulette, Cases, Crash und mehr!',
}

export default function CasinoPage() {
  return (
    <EldrunPageShellServer
      icon={Dices}
      badge="CASINO"
      title="ELDRUN CASINO"
      subtitle="GAMBLE & WIN"
      description="Das ultimative Eldrun Casino. Coinflip, Jackpot, Roulette, Cases, Crash und mehr!"
      gradient="from-rust-300 via-rust-400 to-amber-400"
      glowColor="rgba(237,118,32,0.18)"
    >
      <AuthGate>
        <CasinoClient />
      </AuthGate>
    </EldrunPageShellServer>
  )
}
