import { Metadata } from 'next'
import { ShopClient } from '@/components/shop/ShopClient'
import { PageUpdateBadge } from '@/components/ui/PageUpdateBadge'
import { EldrunPageShellServer } from '@/components/layout/EldrunPageShellServer'
import { ShoppingBag } from 'lucide-react'
import { AuthGate } from '@/components/AuthGate'

export const metadata: Metadata = {
  title: 'Shop | Eldrun',
  description: 'Eldrun Community Shop - VIP Ränge, Kits, Skins, Items und mehr. Sichere Zahlung mit PayPal, Kreditkarte und Crypto.',
}

export default function ShopPage() {
  return (
    <EldrunPageShellServer
      icon={ShoppingBag}
      badge="SHOP"
      title="ELDRUN SHOP"
      subtitle="VIP & ITEMS"
      description="Eldrun Community Shop - VIP Ränge, Kits, Skins, Items und mehr. Sichere Zahlung mit PayPal, Kreditkarte und Crypto."
      gradient="from-rust-300 via-rust-400 to-amber-400"
      glowColor="rgba(237,118,32,0.18)"
    >
      <div className="mb-6">
        <PageUpdateBadge version="6.2.0" label="Aurora Cascade Shop Refresh" />
      </div>
      <AuthGate>
        <ShopClient />
      </AuthGate>
    </EldrunPageShellServer>
  )
}
