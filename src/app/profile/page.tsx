import { Metadata } from 'next'
import { ProfileClient } from '@/components/profile/ProfileClient'
import { AuthGate } from '@/components/AuthGate'

export const metadata: Metadata = {
  title: 'Mein Profil | ELDRUN',
  description: 'Verwalte dein ELDRUN Profil, Einstellungen und Statistiken.',
}

export default function ProfilePage() {
  return (
    <AuthGate>
      <ProfileClient />
    </AuthGate>
  )
}
