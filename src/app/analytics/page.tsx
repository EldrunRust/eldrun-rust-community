'use client'

import { AnalyticsDashboard } from '@/features/analytics/dashboard'
import { BarChart3 } from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

export default function AnalyticsPage() {
  return (
    <EldrunPageShell
      icon={BarChart3}
      badge="ANALYTICS"
      title="ANALYTICS"
      subtitle="LIVE TELEMETRY"
      description="Echtzeit-Server-Metriken und Event-Überwachung"
      gradient="from-rust-300 via-rust-400 to-amber-400"
      glowColor="rgba(237,118,32,0.18)"
    >
      <AuthGate>
        <AnalyticsDashboard embedded />
      </AuthGate>
    </EldrunPageShell>
  )
}
