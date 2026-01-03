'use client'

import { CodexDrawer } from '@/components/overlay/CodexDrawer'
import { BookOpen } from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

export default function CodexPage() {
  return (
    <EldrunPageShell
      icon={BookOpen}
      badge="CODEX"
      title="ELDRUN CODEX"
      subtitle="WIKI & WISSEN"
      description="Das offizielle Eldrun-Wiki: Klassen, Artefakte, Events und Zonen"
      gradient="from-gold-300 via-gold-400 to-gold-600"
      glowColor="rgba(212,168,83,0.22)"
    >
      <AuthGate>
        <CodexDrawer embedded />
      </AuthGate>
    </EldrunPageShell>
  )
}
