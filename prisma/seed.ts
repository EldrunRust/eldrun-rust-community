import * as dotenv from 'dotenv'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Clans
  const clans = await Promise.all([
    prisma.clan.upsert({
      where: { tag: 'APEX' },
      update: {},
      create: { tag: 'APEX', name: 'Apex Predators', logo: '🔺', territory: 12 },
    }),
    prisma.clan.upsert({
      where: { tag: 'VOID' },
      update: {},
      create: { tag: 'VOID', name: 'The Void', logo: '⚫', territory: 9 },
    }),
    prisma.clan.upsert({
      where: { tag: 'STORM' },
      update: {},
      create: { tag: 'STORM', name: 'Storm Raiders', logo: '⚡', territory: 8 },
    }),
  ])
  console.log(`✅ Created ${clans.length} clans`)

  // Create Players
  const players = await Promise.all([
    prisma.player.upsert({
      where: { steamId: '76561198000000001' },
      update: {},
      create: {
        name: 'DeathBringer',
        steamId: '76561198000000001',
        kills: 2847,
        deaths: 423,
        playtime: 847,
        clan: { connect: { tag: 'APEX' } },
      },
    }),
    prisma.player.upsert({
      where: { steamId: '76561198000000002' },
      update: {},
      create: {
        name: 'ShadowHunter',
        steamId: '76561198000000002',
        kills: 2341,
        deaths: 512,
        playtime: 723,
        clan: { connect: { tag: 'APEX' } },
      },
    }),
    prisma.player.upsert({
      where: { steamId: '76561198000000003' },
      update: {},
      create: {
        name: 'RustLord',
        steamId: '76561198000000003',
        kills: 2156,
        deaths: 398,
        playtime: 692,
        clan: { connect: { tag: 'VOID' } },
      },
    }),
    prisma.player.upsert({
      where: { steamId: '76561198000000004' },
      update: {},
      create: {
        name: 'NightRaider',
        steamId: '76561198000000004',
        kills: 1987,
        deaths: 567,
        playtime: 634,
        clan: { connect: { tag: 'STORM' } },
      },
    }),
    prisma.player.upsert({
      where: { steamId: '76561198000000005' },
      update: {},
      create: {
        name: 'IronWolf',
        steamId: '76561198000000005',
        kills: 1876,
        deaths: 445,
        playtime: 589,
        clan: { connect: { tag: 'VOID' } },
      },
    }),
    prisma.player.upsert({
      where: { steamId: '76561198000000006' },
      update: {},
      create: {
        name: 'ToxicVenom',
        steamId: '76561198000000006',
        kills: 1754,
        deaths: 623,
        playtime: 567,
      },
    }),
    prisma.player.upsert({
      where: { steamId: '76561198000000007' },
      update: {},
      create: {
        name: 'BloodRaven',
        steamId: '76561198000000007',
        kills: 1698,
        deaths: 489,
        playtime: 534,
        clan: { connect: { tag: 'APEX' } },
      },
    }),
    prisma.player.upsert({
      where: { steamId: '76561198000000008' },
      update: {},
      create: {
        name: 'SteelFist',
        steamId: '76561198000000008',
        kills: 1623,
        deaths: 534,
        playtime: 512,
        clan: { connect: { tag: 'STORM' } },
      },
    }),
    prisma.player.upsert({
      where: { steamId: '76561198000000009' },
      update: {},
      create: {
        name: 'DarkMatter',
        steamId: '76561198000000009',
        kills: 1567,
        deaths: 478,
        playtime: 498,
      },
    }),
    prisma.player.upsert({
      where: { steamId: '76561198000000010' },
      update: {},
      create: {
        name: 'ChaosMaker',
        steamId: '76561198000000010',
        kills: 1489,
        deaths: 567,
        playtime: 476,
        clan: { connect: { tag: 'VOID' } },
      },
    }),
  ])
  console.log(`✅ Created ${players.length} players`)

  // Create News
  const news = await Promise.all([
    prisma.news.upsert({
      where: { slug: 'winter-event-2024' },
      update: {},
      create: {
        title: 'Großes Winter Event startet!',
        slug: 'winter-event-2024',
        excerpt: 'Erlebe das größte Winter Event mit exklusiven Skins, Challenges und mehr...',
        content: 'Das Winter Event 2024 bringt dir exklusive Skins, spannende Challenges und besondere Belohnungen. Vom 15. Dezember bis zum 5. Januar kannst du an täglichen Events teilnehmen und einzigartige Items freischalten.',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
        category: 'Event',
        published: true,
        publishedAt: new Date('2024-12-15'),
      },
    }),
    prisma.news.upsert({
      where: { slug: 'server-wipe-dezember' },
      update: {},
      create: {
        title: 'Server Wipe - Neue Season beginnt',
        slug: 'server-wipe-dezember',
        excerpt: 'Der monatliche Wipe steht bevor. Bereite dich auf einen frischen Start vor...',
        content: 'Am Donnerstag um 19:00 Uhr findet der monatliche Server Wipe statt. Alle Strukturen und Inventare werden zurückgesetzt. Nutze die Zeit um dein Team zu organisieren!',
        image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
        category: 'Ankündigung',
        published: true,
        publishedAt: new Date('2024-12-12'),
      },
    }),
    prisma.news.upsert({
      where: { slug: 'vip-diamond-paket' },
      update: {},
      create: {
        title: 'Neues VIP Paket verfügbar',
        slug: 'vip-diamond-paket',
        excerpt: 'Das neue Diamond VIP Paket ist jetzt mit exklusiven Features erhältlich...',
        content: 'Unser neues Diamond VIP Paket bietet dir Queue Priority, exklusive Skins, erhöhte Stack-Größen und vieles mehr. Unterstütze den Server und genieße Premium-Features!',
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
        category: 'Shop',
        published: true,
        publishedAt: new Date('2024-12-10'),
      },
    }),
  ])
  console.log(`✅ Created ${news.length} news articles`)

  // Create Server Stats
  const serverStats = await prisma.serverStats.upsert({
    where: { id: 'current' },
    update: {
      players: 127,
      maxPlayers: 200,
      status: 'online',
      uptime: 345600,
      fps: 60,
      entities: 245892,
      sleepers: 89,
      queue: 12,
    },
    create: {
      id: 'current',
      players: 127,
      maxPlayers: 200,
      status: 'online',
      uptime: 345600,
      fps: 60,
      entities: 245892,
      sleepers: 89,
      queue: 12,
    },
  })
  console.log('✅ Created server stats')

  // Create Server Config
  const configs = await Promise.all([
    prisma.serverConfig.upsert({
      where: { key: 'server_name' },
      update: {},
      create: { key: 'server_name', value: 'ELDRUN', description: 'Server name' },
    }),
    prisma.serverConfig.upsert({
      where: { key: 'server_ip' },
      update: {},
      create: { key: 'server_ip', value: 'play.eldrun.lol', description: 'Server IP' },
    }),
    prisma.serverConfig.upsert({
      where: { key: 'server_port' },
      update: {},
      create: { key: 'server_port', value: '28015', description: 'Server port' },
    }),
    prisma.serverConfig.upsert({
      where: { key: 'map_size' },
      update: {},
      create: { key: 'map_size', value: '4000', description: 'Map size' },
    }),
    prisma.serverConfig.upsert({
      where: { key: 'team_limit' },
      update: {},
      create: { key: 'team_limit', value: '8', description: 'Max team size' },
    }),
    prisma.serverConfig.upsert({
      where: { key: 'wipe_schedule' },
      update: {},
      create: { key: 'wipe_schedule', value: 'Donnerstag 19:00 (Wöchentlich)', description: 'Wipe schedule' },
    }),
  ])
  console.log(`✅ Created ${configs.length} config entries`)

  // Create Forum Categories & Boards
  const forumCategories = await Promise.all([
    prisma.forumCategory.upsert({
      where: { slug: 'allgemein' },
      update: {},
      create: {
        name: 'Allgemein',
        slug: 'allgemein',
        description: 'Allgemeine Diskussionen',
        icon: '💬',
        color: '#D4AF37',
        order: 1,
      },
    }),
    prisma.forumCategory.upsert({
      where: { slug: 'gameplay' },
      update: {},
      create: {
        name: 'Gameplay',
        slug: 'gameplay',
        description: 'Spielbezogene Themen',
        icon: '🎮',
        color: '#22C55E',
        order: 2,
      },
    }),
    prisma.forumCategory.upsert({
      where: { slug: 'community' },
      update: {},
      create: {
        name: 'Community',
        slug: 'community',
        description: 'Community Events & Clans',
        icon: '👥',
        color: '#3B82F6',
        order: 3,
      },
    }),
    prisma.forumCategory.upsert({
      where: { slug: 'support' },
      update: {},
      create: {
        name: 'Support',
        slug: 'support',
        description: 'Hilfe & Unterstützung',
        icon: '🛠️',
        color: '#EF4444',
        order: 4,
      },
    }),
  ])
  console.log(`✅ Created ${forumCategories.length} forum categories`)

  // Create Forum Boards
  const forumBoards = await Promise.all([
    prisma.forumBoard.upsert({
      where: { slug: 'ankuendigungen' },
      update: {},
      create: {
        categoryId: forumCategories[0].id,
        name: 'Ankündigungen',
        slug: 'ankuendigungen',
        description: 'Offizielle Server Ankündigungen',
        icon: '📢',
        order: 1,
      },
    }),
    prisma.forumBoard.upsert({
      where: { slug: 'vorstellungen' },
      update: {},
      create: {
        categoryId: forumCategories[0].id,
        name: 'Vorstellungen',
        slug: 'vorstellungen',
        description: 'Stelle dich der Community vor',
        icon: '👋',
        order: 2,
      },
    }),
    prisma.forumBoard.upsert({
      where: { slug: 'tipps-tricks' },
      update: {},
      create: {
        categoryId: forumCategories[1].id,
        name: 'Tipps & Tricks',
        slug: 'tipps-tricks',
        description: 'Gameplay Tipps und Guides',
        icon: '💡',
        order: 1,
      },
    }),
    prisma.forumBoard.upsert({
      where: { slug: 'base-building' },
      update: {},
      create: {
        categoryId: forumCategories[1].id,
        name: 'Base Building',
        slug: 'base-building',
        description: 'Basen und Verteidigung',
        icon: '🏰',
        order: 2,
      },
    }),
    prisma.forumBoard.upsert({
      where: { slug: 'clan-rekrutierung' },
      update: {},
      create: {
        categoryId: forumCategories[2].id,
        name: 'Clan Rekrutierung',
        slug: 'clan-rekrutierung',
        description: 'Suche oder biete Clan-Mitgliedschaft',
        icon: '⚔️',
        order: 1,
      },
    }),
    prisma.forumBoard.upsert({
      where: { slug: 'events' },
      update: {},
      create: {
        categoryId: forumCategories[2].id,
        name: 'Events',
        slug: 'events',
        description: 'Community Events',
        icon: '🎉',
        order: 2,
      },
    }),
    prisma.forumBoard.upsert({
      where: { slug: 'hilfe' },
      update: {},
      create: {
        categoryId: forumCategories[3].id,
        name: 'Hilfe',
        slug: 'hilfe',
        description: 'Fragen und Hilfe',
        icon: '❓',
        order: 1,
      },
    }),
    prisma.forumBoard.upsert({
      where: { slug: 'bug-reports' },
      update: {},
      create: {
        categoryId: forumCategories[3].id,
        name: 'Bug Reports',
        slug: 'bug-reports',
        description: 'Fehler melden',
        icon: '🐛',
        order: 2,
      },
    }),
  ])
  console.log(`✅ Created ${forumBoards.length} forum boards`)

  // Create Vote Sites
  const voteSites = await Promise.all([
    prisma.voteSite.upsert({
      where: { siteId: 'rust-servers' },
      update: {},
      create: {
        siteId: 'rust-servers',
        name: 'Rust-Servers.net',
        url: 'https://rust-servers.net/server/12345/vote',
        icon: '🗳️',
        rewardCoins: 150,
        rewardXp: 75,
        cooldownHours: 24,
        order: 1,
      },
    }),
    prisma.voteSite.upsert({
      where: { siteId: 'top-games' },
      update: {},
      create: {
        siteId: 'top-games',
        name: 'TopG',
        url: 'https://topg.org/rust/server/12345',
        icon: '🏆',
        rewardCoins: 100,
        rewardXp: 50,
        cooldownHours: 12,
        order: 2,
      },
    }),
    prisma.voteSite.upsert({
      where: { siteId: 'battlemetrics' },
      update: {},
      create: {
        siteId: 'battlemetrics',
        name: 'BattleMetrics',
        url: 'https://www.battlemetrics.com/servers/rust/12345',
        icon: '📊',
        rewardCoins: 200,
        rewardXp: 100,
        cooldownHours: 24,
        order: 3,
      },
    }),
  ])
  console.log(`✅ Created ${voteSites.length} vote sites`)

  // Create Achievements
  const achievements = await Promise.all([
    prisma.achievement.upsert({
      where: { slug: 'first-kill' },
      update: {},
      create: {
        name: 'Erster Kill',
        slug: 'first-kill',
        description: 'Töte deinen ersten Spieler',
        icon: '⚔️',
        category: 'combat',
        requirements: JSON.stringify({ type: 'kills', target: 1 }),
        rewardXp: 50,
        rewardCoins: 100,
        rarity: 'common',
        points: 10,
      },
    }),
    prisma.achievement.upsert({
      where: { slug: 'killer-100' },
      update: {},
      create: {
        name: 'Hundertfacher Mörder',
        slug: 'killer-100',
        description: 'Töte 100 Spieler',
        icon: '💀',
        category: 'combat',
        requirements: JSON.stringify({ type: 'kills', target: 100 }),
        rewardXp: 500,
        rewardCoins: 1000,
        rarity: 'rare',
        points: 50,
      },
    }),
    prisma.achievement.upsert({
      where: { slug: 'survivor' },
      update: {},
      create: {
        name: 'Überlebenskünstler',
        slug: 'survivor',
        description: 'Überlebe 24 Stunden am Stück',
        icon: '🏕️',
        category: 'survival',
        requirements: JSON.stringify({ type: 'survival_time', target: 1440 }),
        rewardXp: 200,
        rewardCoins: 500,
        rarity: 'uncommon',
        points: 25,
      },
    }),
    prisma.achievement.upsert({
      where: { slug: 'casino-winner' },
      update: {},
      create: {
        name: 'Casino König',
        slug: 'casino-winner',
        description: 'Gewinne 100.000 Coins im Casino',
        icon: '🎰',
        category: 'casino',
        requirements: JSON.stringify({ type: 'casino_winnings', target: 100000 }),
        rewardXp: 300,
        rewardCoins: 5000,
        rarity: 'epic',
        points: 75,
      },
    }),
    prisma.achievement.upsert({
      where: { slug: 'voter' },
      update: {},
      create: {
        name: 'Treuer Voter',
        slug: 'voter',
        description: 'Vote 30 Tage hintereinander',
        icon: '🗳️',
        category: 'social',
        requirements: JSON.stringify({ type: 'vote_streak', target: 30 }),
        rewardXp: 1000,
        rewardCoins: 10000,
        rarity: 'legendary',
        points: 100,
      },
    }),
  ])
  console.log(`✅ Created ${achievements.length} achievements`)

  // Create Shop Products
  const shopProducts = await Promise.all([
    prisma.shopProduct.upsert({
      where: { slug: 'vip-bronze' },
      update: {},
      create: {
        name: 'VIP Bronze',
        slug: 'vip-bronze',
        description: 'VIP Bronze Rang für 30 Tage',
        image: '🥉',
        price: 4.99,
        category: 'vip',
        rarity: 'uncommon',
        deliveryType: 'instant',
        deliveryData: 'oxide.grant user {steamid} vip.bronze',
      },
    }),
    prisma.shopProduct.upsert({
      where: { slug: 'vip-gold' },
      update: {},
      create: {
        name: 'VIP Gold',
        slug: 'vip-gold',
        description: 'VIP Gold Rang für 30 Tage mit allen Features',
        image: '🥇',
        price: 9.99,
        category: 'vip',
        rarity: 'epic',
        isFeatured: true,
        deliveryType: 'instant',
        deliveryData: 'oxide.grant user {steamid} vip.gold',
      },
    }),
    prisma.shopProduct.upsert({
      where: { slug: 'starter-kit' },
      update: {},
      create: {
        name: 'Starter Kit',
        slug: 'starter-kit',
        description: 'Grundausrüstung für den Start',
        image: '🎒',
        price: 2.99,
        category: 'kits',
        rarity: 'common',
        deliveryType: 'instant',
        deliveryData: 'kit give {steamid} starter',
      },
    }),
    prisma.shopProduct.upsert({
      where: { slug: 'coins-10k' },
      update: {},
      create: {
        name: '10.000 Coins',
        slug: 'coins-10k',
        description: '10.000 Casino Coins',
        image: '💰',
        price: 1.99,
        category: 'currency',
        rarity: 'common',
        deliveryType: 'instant',
        deliveryData: 'coins add {steamid} 10000',
      },
    }),
  ])
  console.log(`✅ Created ${shopProducts.length} shop products`)

  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
