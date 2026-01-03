import { Metadata } from 'next'

const SITE_NAME = 'ELDRUN - Pfad des Krieges'
const SITE_URL = 'https://eldrun.lol'
const SITE_DESCRIPTION = 'Das ultimative MMORPG-Rust Erlebnis mit Fraktionen, Klassen, Quests, Casino und mehr!'

interface SEOConfig {
  title: string
  description?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
  pathname?: string
}

export function generateSEO({
  title,
  description = SITE_DESCRIPTION,
  keywords = [],
  image = '/og-image.png',
  noIndex = false,
  pathname = ''
}: SEOConfig): Metadata {
  const fullTitle = title === 'Home' ? SITE_NAME : `${title} | ${SITE_NAME}`
  const url = `${SITE_URL}${pathname}`

  const defaultKeywords = [
    'Rust Server',
    'MMORPG Rust',
    'Eldrun',
    'Rust Community',
    'Rust Server Deutschland',
    'Rust Fraktionen',
    'Rust Casino',
    'Rust PvP',
    'Modded Rust'
  ]

  return {
    title: fullTitle,
    description,
    keywords: [...defaultKeywords, ...keywords],
    authors: [{ name: 'ELDRUN Team' }],
    creator: 'ELDRUN',
    publisher: 'ELDRUN',
    
    metadataBase: new URL(SITE_URL),
    
    alternates: {
      canonical: url,
    },
    
    openGraph: {
      type: 'website',
      locale: 'de_DE',
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@EldrunServer',
    },
    
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    
    manifest: '/manifest.json',
    
    other: {
      'theme-color': '#1a1a1a',
      'msapplication-TileColor': '#c45c2c',
    },
  }
}

// Pre-configured SEO for common pages
export const PAGE_SEO = {
  home: generateSEO({
    title: 'Home',
    pathname: '/'
  }),
  
  forum: generateSEO({
    title: 'Forum',
    description: 'Das ELDRUN Community Forum - Diskutiere, tausche dich aus und finde Mitspieler!',
    keywords: ['Forum', 'Community', 'Diskussion'],
    pathname: '/forum'
  }),
  
  shop: generateSEO({
    title: 'Shop',
    description: 'Der ELDRUN Shop - VIP Pakete, Kits, Skins und mehr für deinen Rust-Erfolg!',
    keywords: ['Shop', 'VIP', 'Kits', 'Skins'],
    pathname: '/shop'
  }),
  
  casino: generateSEO({
    title: 'Casino',
    description: 'Das ELDRUN Casino - Spiele Blackjack, Roulette, Slots und mehr mit deinen Coins!',
    keywords: ['Casino', 'Gambling', 'Coins', 'Jackpot'],
    pathname: '/casino'
  }),
  
  leaderboard: generateSEO({
    title: 'Leaderboard',
    description: 'Die besten Spieler auf ELDRUN - Kills, K/D, Achievements und mehr!',
    keywords: ['Leaderboard', 'Ranking', 'Top Spieler', 'Statistiken'],
    pathname: '/leaderboard'
  }),
  
  news: generateSEO({
    title: 'News',
    description: 'Aktuelle Neuigkeiten, Updates und Events auf ELDRUN.',
    keywords: ['News', 'Updates', 'Events', 'Ankündigungen'],
    pathname: '/news'
  }),
  
  rules: generateSEO({
    title: 'Server Regeln',
    description: 'Die Regeln für ein faires Spielerlebnis auf ELDRUN.',
    keywords: ['Regeln', 'Rules', 'Verhaltensregeln'],
    pathname: '/rules'
  }),
  
  faq: generateSEO({
    title: 'FAQ',
    description: 'Häufig gestellte Fragen zu ELDRUN - Alles was du wissen musst!',
    keywords: ['FAQ', 'Hilfe', 'Fragen', 'Antworten'],
    pathname: '/faq'
  }),
  
  contact: generateSEO({
    title: 'Kontakt',
    description: 'Kontaktiere das ELDRUN Team - Support, Fragen und Feedback.',
    keywords: ['Kontakt', 'Support', 'Hilfe'],
    pathname: '/contact'
  }),
  
  blacklist: generateSEO({
    title: 'Blacklist',
    description: 'Gebannte Cheater auf ELDRUN - Zero Tolerance Policy.',
    keywords: ['Blacklist', 'Cheater', 'Bans', 'Anti-Cheat'],
    pathname: '/blacklist'
  }),
  
  terms: generateSEO({
    title: 'AGB',
    description: 'Allgemeine Geschäftsbedingungen für die Nutzung von ELDRUN.',
    keywords: ['AGB', 'Terms', 'Nutzungsbedingungen'],
    pathname: '/terms'
  }),
  
  privacy: generateSEO({
    title: 'Datenschutz',
    description: 'Datenschutzerklärung - So schützen wir deine Daten auf ELDRUN.',
    keywords: ['Datenschutz', 'Privacy', 'DSGVO'],
    pathname: '/privacy'
  }),
  
  clans: generateSEO({
    title: 'Gilden & Clans',
    description: 'Alle Gilden auf ELDRUN - Finde dein Team oder gründe eine eigene Gilde!',
    keywords: ['Clans', 'Gilden', 'Teams', 'Gruppen'],
    pathname: '/clans'
  }),
  
  achievements: generateSEO({
    title: 'Achievements',
    description: 'Alle Erfolge auf ELDRUN - Sammle Punkte und zeige deine Meisterschaft!',
    keywords: ['Achievements', 'Erfolge', 'Trophäen'],
    pathname: '/achievements'
  }),
  
  changelog: generateSEO({
    title: 'Changelog',
    description: 'Alle Updates und Änderungen auf ELDRUN.',
    keywords: ['Changelog', 'Updates', 'Versionen'],
    pathname: '/changelog'
  }),
}

// JSON-LD structured data helpers
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ELDRUN',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://discord.gg/eldrun',
      'https://twitter.com/EldrunServer',
      'https://youtube.com/@EldrunGaming'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@eldrun.lol',
      contactType: 'customer support'
    }
  }
}

export function generateGameSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'ELDRUN - Pfad des Krieges',
    description: SITE_DESCRIPTION,
    genre: ['MMORPG', 'Survival', 'PvP'],
    gamePlatform: 'PC',
    applicationCategory: 'Game Server',
    operatingSystem: 'Windows',
    url: SITE_URL
  }
}
