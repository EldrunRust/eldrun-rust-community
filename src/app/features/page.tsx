import { Metadata } from 'next'
import { EldrunFeaturesClient } from '@/components/eldrun/EldrunFeaturesClient'
import { AuthGate } from '@/components/AuthGate'

export const metadata: Metadata = {
  title: 'Realm Features | ELDRUN - Ice & Fire',
  description: 'Entdecke die epischen Features von ELDRUN. Wähle dein Haus, deine Klasse und erobere das Reich.',
}

export default function FeaturesPage() {
  return (
    <AuthGate>
      <EldrunFeaturesClient />
    </AuthGate>
  )
}
