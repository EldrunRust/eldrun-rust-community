import type { Metadata } from 'next'
import { Cinzel, Cinzel_Decorative, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AuthModal } from '@/components/ui/AuthModal'
import { StoreProvider } from '@/components/providers/StoreProvider'
import { AtmosProvider } from '@/components/providers/AtmosProvider'
import { SoundProvider } from '@/components/providers/SoundProvider'
import { TransitionProvider } from '@/components/providers/TransitionProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { ServiceWorkerDevGuard } from '@/components/providers/ServiceWorkerDevGuard'
import { FeatureErrorBoundary } from '@/components/features/FeatureErrorBoundary'
import { initializeFeatures } from '@/features'

// Medieval Display Font - Game of Thrones Style
const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-medieval',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

// Decorative Medieval Font for Special Headers
const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  variable: '--font-medieval-decorative',
  display: 'swap',
  weight: ['400', '700', '900'],
})

// Body Font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

// Mono Font
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ELDRUN | Pfad des Krieges',
  description: 'Das ultimative MMORPG-Rust Erlebnis. Wähle dein Haus, meistere deine Klasse und erobere das Reich von Eldrun.',
  keywords: ['Eldrun', 'Rust Server', 'MMORPG', 'Fraktionen', 'PvP', 'Gaming', 'Gilden', 'Survival'],
  authors: [{ name: 'Eldrun' }],
  metadataBase: new URL('https://eldrun.lol'),
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'ELDRUN | Pfad des Krieges',
    description: 'Das ultimative MMORPG-Rust Erlebnis. Wähle dein Haus, meistere deine Klasse und erobere das Reich.',
    type: 'website',
    locale: 'de_DE',
    url: 'https://eldrun.lol',
    siteName: 'Eldrun',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ELDRUN | Pfad des Krieges',
    description: 'Das ultimative MMORPG-Rust Erlebnis. Erobere das Reich von Eldrun.',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Initialize AAA Features
  if (typeof window !== 'undefined') {
    initializeFeatures().catch(console.error);
  }

  return (
    <html lang="de" className={`dark ${cinzel.variable} ${cinzelDecorative.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0a0a0a" />
      </head>
      <body className="antialiased font-body bg-metal-950 text-metal-100 min-h-screen flex flex-col">
        <StoreProvider>
          <ToastProvider>
            <AtmosProvider>
              <SoundProvider>
                <TransitionProvider>
                  <ServiceWorkerDevGuard />
                  <Header />
                  <main className="flex-1 min-h-0">{children}</main>
                  <Footer />
                </TransitionProvider>
                {/* AuthModal MUST be outside TransitionProvider to avoid filter stacking context bug */}
                <AuthModal />
              </SoundProvider>
            </AtmosProvider>
          </ToastProvider>
        </StoreProvider>
        {/* Portal root for modals - outside all transforms */}
        <div id="modal-root" />
      </body>
    </html>
  )
}
