import { Metadata } from 'next'
import { NewsClient } from '@/components/news/NewsClient'
import { EldrunPageShellServer } from '@/components/layout/EldrunPageShellServer'
import { Newspaper } from 'lucide-react'
import { AuthGate } from '@/components/AuthGate'

export const metadata: Metadata = {
  title: 'Server News & Updates | Eldrun',
  description: 'Aktuelle News, Events, Patches und Updates des Eldrun Servers.',
}

export default function NewsPage() {
  return (
    <EldrunPageShellServer
      icon={Newspaper}
      badge="NEWS"
      title="SERVER NEWS"
      subtitle="UPDATES & EVENTS"
      description="Aktuelle News, Events, Patches und Updates des Eldrun Servers."
      gradient="from-gold-300 via-gold-400 to-gold-600"
      glowColor="rgba(212,168,83,0.28)"
    >
      <AuthGate>
        <NewsClient />
      </AuthGate>
    </EldrunPageShellServer>
  )
}
