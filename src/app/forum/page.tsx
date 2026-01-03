import { ForumClient } from '@/components/forum/ForumClient'
import { EldrunPageShellServer } from '@/components/layout/EldrunPageShellServer'
import { Users } from 'lucide-react'
import { AuthGate } from '@/components/AuthGate'

export const metadata = {
  title: 'Community Forum | ELDRUN',
  description: 'Das offizielle Eldrun Community Forum - Diskutiere, teile und verbinde dich mit anderen Spielern.',
}

export default function ForumPage() {
  return (
    <EldrunPageShellServer
      icon={Users}
      badge="FORUM"
      title="COMMUNITY FORUM"
      subtitle="DISKUSSION & STRATEGIE"
      description="Das offizielle Eldrun Community Forum - Diskutiere, teile und verbinde dich mit anderen Spielern."
      gradient="from-gold-300 via-gold-400 to-gold-600"
      glowColor="rgba(212,168,83,0.22)"
    >
      <AuthGate>
        <ForumClient />
      </AuthGate>
    </EldrunPageShellServer>
  )
}
