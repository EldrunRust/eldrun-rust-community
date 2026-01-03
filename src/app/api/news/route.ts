import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Simulated news articles for fallback
const SIMULATED_NEWS = [
  {
    id: 'news_1',
    title: '🔥 Wipe Day: Neuer Eldrun Wipe ist live!',
    slug: 'wipe-day-neuer-eldrun-wipe',
    excerpt: 'Der Server wurde frisch gewiped! Alle Spieler starten mit neuen Ressourcen in den Kampf um die Vorherrschaft.',
    content: 'Der monatliche Wipe ist da! Alle Basen wurden zurückgesetzt und die Map ist neu generiert. Seraphar und Vorgaroth kämpfen erneut um die Kontrolle über Eldrun. Neue Features: Verbesserte Monument-Loot-Tabellen, neue Custom-Items und optimierte Raid-Mechaniken.',
    category: 'update',
    imageUrl: '/images/news/wipe-day.jpg',
    author: { name: 'AdminSavant', avatar: '/images/avatars/admin.jpg' },
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    views: 2847,
    featured: true
  },
  {
    id: 'news_2',
    title: '⚔️ Faction War: Seraphar führt mit 3 Territorien',
    slug: 'faction-war-seraphar-fuehrt',
    excerpt: 'Die Seraphar-Fraktion hat drei wichtige Gebiete erobert. Vorgaroth plant einen Gegenangriff.',
    content: 'Nach intensiven Kämpfen am Wochenende hat die Seraphar-Fraktion die Kontrolle über Launch Site, Airfield und Water Treatment übernommen. Die Vorgaroth-Truppen sammeln sich für einen koordinierten Gegenangriff.',
    category: 'event',
    imageUrl: '/images/news/faction-war.jpg',
    author: { name: 'EventCaster', avatar: '/images/avatars/event.jpg' },
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    views: 1923,
    featured: false
  },
  {
    id: 'news_3',
    title: '🎰 Casino Update: Neue Dragon\'s Throne Minigame',
    slug: 'casino-update-dragons-throne',
    excerpt: 'Das Eldrun Casino erweitert sein Angebot mit dem neuen Dragon\'s Throne Spiel!',
    content: 'Ab sofort könnt ihr im Casino das brandneue Dragon\'s Throne Minigame spielen. Erobert den Thron und gewinnt massive Jackpots! Außerdem: Verbesserte Crash-Mechanik und neue Skin-Cases.',
    category: 'feature',
    imageUrl: '/images/news/casino-update.jpg',
    author: { name: 'AdminSavant', avatar: '/images/avatars/admin.jpg' },
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    views: 3156,
    featured: true
  },
  {
    id: 'news_4',
    title: '🛡️ Neue Anti-Cheat Maßnahmen aktiv',
    slug: 'neue-anti-cheat-massnahmen',
    excerpt: 'Wir haben unsere Anti-Cheat Systeme massiv verbessert. Cheater werden sofort gebannt.',
    content: 'Um ein faires Spielerlebnis zu gewährleisten, haben wir unsere Anti-Cheat Maßnahmen verstärkt. Neue Erkennungsmethoden für ESP, Aimbot und Speedhacks sind jetzt aktiv. Bereits 47 Accounts wurden diese Woche gebannt.',
    category: 'announcement',
    imageUrl: '/images/news/anti-cheat.jpg',
    author: { name: 'ShadowOps', avatar: '/images/avatars/mod.jpg' },
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    views: 4521,
    featured: false
  },
  {
    id: 'news_5',
    title: '🏆 Clan-Turnier: Anmeldung offen!',
    slug: 'clan-turnier-anmeldung-offen',
    excerpt: 'Das große Eldrun Clan-Turnier steht bevor! Meldet euren Clan jetzt an.',
    content: 'Am kommenden Samstag findet das monatliche Clan-Turnier statt. 5v5 Kämpfe, massive Preise und ewiger Ruhm warten auf die Gewinner. Anmeldeschluss ist Freitag 18:00 Uhr. Preisgeld: 500.000 Eldrun Coins!',
    category: 'event',
    imageUrl: '/images/news/tournament.jpg',
    author: { name: 'EventCaster', avatar: '/images/avatars/event.jpg' },
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    views: 2134,
    featured: true
  }
]

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    })

    if (news.length === 0) {
      return NextResponse.json(SIMULATED_NEWS)
    }

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    // Return simulated news on error
    return NextResponse.json(SIMULATED_NEWS)
  }
}
