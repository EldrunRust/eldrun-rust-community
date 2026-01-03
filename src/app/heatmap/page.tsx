import { Metadata } from 'next'
import { HeatmapClient } from '@/components/heatmap/HeatmapClient'
import { AuthGate } from '@/components/AuthGate'

export const metadata: Metadata = {
  title: 'Live Server Heatmap | Eldrun',
  description: 'Echtzeit-Heatmap des Eldrun Servers. Verfolge Spieler, Events und Aktivitäten live.',
}

export default function HeatmapPage() {
  return (
    <AuthGate>
      <HeatmapClient />
    </AuthGate>
  )
}
