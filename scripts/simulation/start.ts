#!/usr/bin/env ts-node
/**
 * Eldrun Simulation Engine - Start
 * Starts the simulation of live server activity
 * 
 * CRITICAL: Only for development/staging environments!
 * Never run in production!
 * 
 * Usage: pnpm sim:start
 */

import { PrismaClient } from '@prisma/client'
import {
  DEMO_CHAT_CHANNELS,
  DEMO_CHAT_CHANNEL_SEED_MESSAGES,
  type DemoChannelDefinition,
} from '../../src/data/demoChatChannels'

const prisma = new PrismaClient()

// Check environment
function checkEnvironment(): boolean {
  const isDev = process.env.NODE_ENV !== 'production'
  const simEnabled = process.env.SIMULATION_MODE === 'true'
  const demoMode = process.env.DEMO_MODE === 'true'
  
  if (!isDev) {
    console.error('❌ FATAL: Cannot run simulation in production!')
    return false
  }
  
  if (!simEnabled && !demoMode) {
    console.warn('⚠️  SIMULATION_MODE or DEMO_MODE not enabled in .env')
    console.warn('   Set SIMULATION_MODE="true" to enable simulation')
    return false
  }
  
  return true
}

// Simulated player names
const PLAYER_NAMES = [
  'DragonSlayer', 'ShadowHunter', 'CrystalMage', 'IronForge', 'StormBringer',
  'NightWolf', 'FirePhoenix', 'FrostQueen', 'ThunderGod', 'DarkKnight',
  'LightBringer', 'SilverArrow', 'GoldenHeart', 'BloodRaven', 'SoulReaper',
  'WildHeart', 'DeathBringer', 'LifeGuard', 'SkyWalker', 'EarthShaker',
  'VoidMaster', 'StarDust', 'MoonChild', 'SunWarrior', 'WindRunner',
  'FlameKeeper', 'IceBreaker', 'SteelFist', 'StoneWall', 'SwiftBlade',
  'SilentStrike', 'RagingBull', 'WiseOwl', 'CunningFox', 'MightyBear'
]

const FACTIONS = ['seraphar', 'vorgaroth']
const CLASSES = ['warrior', 'archer', 'mage', 'rogue', 'paladin', 'necromancer']
const EVENT_TYPES = ['kill', 'death', 'loot', 'craft', 'quest', 'achievement', 'levelup']

type EventCategory = 'combat' | 'activity' | 'resource'

interface SimulatedEvent {
  type: string
  category: EventCategory
  faction: string
  x: number
  y: number
  value: number
  monument?: string
  actor?: string
  target?: string
}

interface Monument {
  name: string
  x: number
  y: number
  radius: number
  tier: number
}

const MONUMENTS: Monument[] = [
  { name: 'Launch Site', x: 6400, y: 1600, radius: 400, tier: 3 },
  { name: 'Military Tunnels', x: 1200, y: 2400, radius: 300, tier: 3 },
  { name: 'Airfield', x: 4000, y: 1200, radius: 360, tier: 2 },
  { name: 'The Dome', x: 2800, y: 5600, radius: 200, tier: 2 },
  { name: 'Train Yard', x: 5600, y: 4400, radius: 320, tier: 2 },
  { name: 'Water Treatment', x: 1600, y: 6400, radius: 280, tier: 2 },
  { name: 'Harbor', x: 7200, y: 4000, radius: 240, tier: 2 },
  { name: 'Large Oil Rig', x: 7600, y: 7600, radius: 160, tier: 3 },
  { name: 'Small Oil Rig', x: 400, y: 7600, radius: 120, tier: 2 },
  { name: 'Outpost', x: 4000, y: 4000, radius: 200, tier: 1 },
  { name: 'Bandit Camp', x: 2000, y: 4000, radius: 200, tier: 1 }
]

const RESOURCE_TYPES = ['Sulfur Vein', 'HQM Node', 'Stone Quarry', 'Fiber Grove', 'Ancient Timber']
const LOOT_TABLE = ['Mythic Cache', 'Phoenix Crate', 'Storm Relic', 'Dragon-Sigil Chest', 'Aether Capsule']

const EVENT_BLUEPRINTS = [
  { type: 'raid', category: 'combat' as const, weight: 5, monumentTier: 3, valueRange: [6, 10], details: ['Sprengstoff-Einsatz', 'Belagerung', 'Counter-Raid'] },
  { type: 'faction_fight', category: 'combat' as const, weight: 4, monumentTier: 2, valueRange: [4, 8], details: ['Brückenschlacht', 'Skirmish', 'Ambush'] },
  { type: 'farm_run', category: 'resource' as const, weight: 3, monumentTier: 1, valueRange: [2, 5], details: ['Farm-Route', 'Luxus-Ernte', 'Sammler-Konvoi'] },
  { type: 'loot_drop', category: 'activity' as const, weight: 2, monumentTier: 2, valueRange: [3, 7], details: ['Airdrop', 'Cargo-Crate', 'Geheime Lieferung'] },
  { type: 'event_boss', category: 'combat' as const, weight: 1, monumentTier: 3, valueRange: [7, 10], details: ['Boss Rush', 'World Event', 'Stormwall-Erupt'] }
]

function mapChannelDefinitionToData(definition: DemoChannelDefinition) {
  return {
    name: definition.name,
    description: definition.description,
    type: definition.type,
    icon: definition.icon,
    color: definition.color,
    isLocked: definition.isLocked,
    slowMode: definition.slowMode,
    maxMembers: definition.maxUsers,
    memberCount: definition.userCount,
    messageCount: definition.messageCount,
  }
}

async function seedSimulatedMessagesForChannel(channelId: string, definition: DemoChannelDefinition) {
  const existingSimMessages = await prisma.chatMessage.count({
    where: { channelId, isSimulated: true },
  })
  if (existingSimMessages > 0) {
    return 0
  }

  const now = Date.now()
  const defaultAuthorId = 'bot_admin'
  const seeds = DEMO_CHAT_CHANNEL_SEED_MESSAGES[definition.id] || []
  const seedRecords = [
    {
      channelId,
      authorId: 'system',
      content: `Willkommen in ${definition.name}! Melde dich und bringe deine Fraktion voran.`,
      type: 'system',
      isPinned: true,
      isSimulated: true,
      createdAt: new Date(now - 5 * 60_000),
    },
  ]

  seeds.forEach((seed, index) => {
    const offsetMinutes = seed.createdOffsetMinutes ?? (index + 1) * 3
    seedRecords.push({
      channelId,
      authorId: seed.userId ?? defaultAuthorId,
      content: seed.content,
      type: seed.type ?? 'text',
      isPinned: Boolean(seed.highlight),
      isSimulated: true,
      createdAt: new Date(now - offsetMinutes * 60_000),
    })
  })

  await prisma.chatMessage.createMany({ data: seedRecords })
  return seedRecords.length
}

async function syncDemoChannelsWithDatabase() {
  let createdChannels = 0
  let seededMessages = 0

  for (const definition of DEMO_CHAT_CHANNELS) {
    const existing = await prisma.chatChannel.findUnique({
      where: { slug: definition.slug },
    })

    const channelData = mapChannelDefinitionToData(definition)
    let channel = existing
      ? await prisma.chatChannel.update({
          where: { id: existing.id },
          data: channelData,
        })
      : await prisma.chatChannel.create({
          data: {
            ...channelData,
            slug: definition.slug,
          },
        })

    if (!existing) {
      createdChannels += 1
    }

    const messagesSeeded = await seedSimulatedMessagesForChannel(channel.id, definition)
    seededMessages += messagesSeeded

    if (messagesSeeded > 0) {
      const totalMessages = await prisma.chatMessage.count({
        where: { channelId: channel.id },
      })
      channel = await prisma.chatChannel.update({
        where: { id: channel.id },
        data: { messageCount: totalMessages },
      })
    }
  }

  return { createdChannels, seededMessages }
}

// Random helpers
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomElement<T>(arr: T[]): T {
  if (!arr.length) {
    throw new Error('randomElement called with empty array')
  }
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomPosition(): { x: number; y: number; z: number } {
  return {
    x: randomInt(0, 8000),
    y: randomInt(0, 120),
    z: randomInt(0, 8000)
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function randomMonument(minTier = 1): Monument {
  const candidates = MONUMENTS.filter(m => m.tier >= minTier)
  return candidates.length ? randomElement(candidates) : randomElement(MONUMENTS)
}

function randomPointNear(monument: Monument) {
  const angle = Math.random() * Math.PI * 2
  const distance = Math.random() * monument.radius
  return {
    x: clamp(monument.x + Math.cos(angle) * distance, 0, 8000),
    y: randomInt(0, 120),
    z: clamp(monument.y + Math.sin(angle) * distance, 0, 8000)
  }
}

function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * totalWeight
  for (const item of items) {
    roll -= item.weight
    if (roll <= 0) {
      return item
    }
  }
  return items[items.length - 1]
}

// Generate simulated heatmap events
async function generateHeatmapEvents(intensity: number) {
  console.log(`  🗺️  Generating heatmap events (intensity ${intensity})...`)
  
  const events: SimulatedEvent[] = []
  const eventCount = intensity * 40
  
  for (let i = 0; i < eventCount; i++) {
    const blueprint = weightedRandom(EVENT_BLUEPRINTS)
    const monument = randomMonument(blueprint.monumentTier)
    const position = monument ? randomPointNear(monument) : randomPosition()
    const faction = randomElement(FACTIONS)
    const playerName = randomElement(PLAYER_NAMES)
    const targetName = randomElement(PLAYER_NAMES.filter(name => name !== playerName))
    
    const event: SimulatedEvent = {
      type: blueprint.type,
      category: blueprint.category,
      faction,
      x: position.x,
      y: position.z,
      value: randomInt(blueprint.valueRange[0], blueprint.valueRange[1]),
      monument: monument?.name,
      actor: playerName,
      target: targetName
    }
    
    events.push(event)
  }
  
  const heatmapRecords = events.map(event => ({
    type: event.type,
    playerId: `sim_${randomInt(1000, 9999)}`,
    playerName: event.actor,
    targetName: event.target,
    x: event.x,
    y: event.y,
    value: event.value,
    metadata: JSON.stringify({
      simulated: true,
      faction: event.faction,
      monument: event.monument,
      category: event.category,
      detail: randomElement(EVENT_BLUEPRINTS.find(b => b.type === event.type)?.details || []),
      loot: event.category === 'resource' ? randomElement(LOOT_TABLE) : undefined,
      resource: event.category === 'resource' ? randomElement(RESOURCE_TYPES) : undefined
    }),
    createdAt: new Date(Date.now() - randomInt(0, 15 * 60 * 1000))
  }))
  
  await prisma.heatmapEvent.createMany({ data: heatmapRecords })
  return events.length
}

// Generate simulated chat messages
async function generateChatMessages(count: number) {
  console.log(`  💬 Generating ${count} chat messages across active channels...`)
  
  const messages = [
    'Wer hat Lust auf einen Raid?',
    'Suche Gilde für Season 3!',
    'GG an alle beim Boss-Event!',
    'Verkaufe AK für 500 Eldruns',
    'Hat jemand Sulfur zu tauschen?',
    'Wo ist der nächste Event?',
    'Brauche Hilfe bei Quest',
    'LFG Dungeon Run',
    'Nice fight! Respekt!',
    'Wer kontrolliert gerade die Brücke?',
    'Seraphar regiert!',
    'Vorgaroth wird siegen!',
    'Suche Crafter für Rüstung',
    'Tausche HQM gegen Scrap',
    'Event in 10 Minuten!',
    'Neuer Spieler hier, Tipps?',
    'Willkommen auf Eldrun!',
    'Geile Base, Respekt!',
    'Wer raided heute Nacht?',
    'Guild Wars morgen um 20 Uhr',
  ]
  
  const channels = await prisma.chatChannel.findMany({
    select: { id: true, slug: true },
    where: { type: { in: ['public', 'group', 'clan', 'vip', 'game', 'event'] } },
  })
  
  if (channels.length === 0) {
    console.warn('  ⚠️  No chat channels available, skipping chat simulation')
    return 0
  }

  const authors = await prisma.user.findMany({
    select: { id: true },
    take: 25,
  })

  const authorPool = authors.length
    ? authors.map((author) => author.id)
    : ['bot_admin', 'bot_strat', 'bot_market', 'bot_mech', 'bot_caster']
  
  const channelMessageCounts: Record<string, number> = {}
  const chatMessages = []

  for (let i = 0; i < count; i++) {
    const channel = randomElement(channels)
    const authorId = randomElement(authorPool)
    channelMessageCounts[channel.id] = (channelMessageCounts[channel.id] ?? 0) + 1

    chatMessages.push({
      channelId: channel.id,
      authorId,
      content: randomElement(messages),
      type: 'text',
      isSimulated: true,
      createdAt: new Date(Date.now() - randomInt(0, 7_200_000)),
    })
  }
  
  await prisma.chatMessage.createMany({ data: chatMessages })

  await Promise.all(
    Object.entries(channelMessageCounts).map(([channelId, increment]) =>
      prisma.chatChannel.update({
        where: { id: channelId },
        data: { messageCount: { increment } },
      })
    )
  )

  return chatMessages.length
}

// Generate simulated server stats
async function updateServerStats() {
  console.log('  📊 Updating server stats...')
  
  const playerCount = randomInt(45, 120)
  const queueCount = playerCount > 100 ? randomInt(0, 15) : 0
  
  // Update or create simulation config
  await prisma.simulationConfig.upsert({
    where: { key: 'server_stats' },
    update: {
      value: JSON.stringify({
        playersOnline: playerCount,
        playersQueued: queueCount,
        maxPlayers: 150,
        fps: randomInt(55, 60),
        entities: randomInt(180000, 220000),
        uptime: randomInt(0, 604800),
        lastWipe: new Date(Date.now() - randomInt(0, 2592000000)).toISOString(),
        serapharOnline: Math.floor(playerCount * 0.48),
        vorgarothOnline: Math.floor(playerCount * 0.52)
      })
    },
    create: {
      key: 'server_stats',
      value: JSON.stringify({
        playersOnline: playerCount,
        playersQueued: queueCount,
        maxPlayers: 150
      })
    }
  })
  
  return playerCount
}

// Generate active events
async function generateActiveEvents() {
  console.log('  🎉 Generating active events...')
  
  const events = await prisma.gameEvent.findMany({ take: 3 })
  
  if (events.length === 0) {
    console.warn('  ⚠️  No game events found, run import:eldrun first')
    return 0
  }

  const activeCount = randomInt(1, Math.min(2, events.length))
  const activeEvents = []
  for (let i = 0; i < activeCount && i < events.length; i++) {
    const event = events[i]
    const startTime = new Date(Date.now() - randomInt(0, event.durationMinutes * 30000))
    activeEvents.push({
      eventId: event.id,
      state: 'active',
      startTime: startTime.toISOString(),
      endTime: new Date(startTime.getTime() + event.durationMinutes * 60000).toISOString(),
    })
  }

  await prisma.simulationConfig.upsert({
    where: { key: 'active_events' },
    update: { value: JSON.stringify(activeEvents) },
    create: { key: 'active_events', value: JSON.stringify(activeEvents) },
  })

  return activeEvents.length
}

// Log simulation activity
async function logSimulation(
  type: string,
  module: string,
  message: string,
  payload: Record<string, unknown>
) {
  await prisma.simulationLog.create({
    data: {
      type,
      module,
      message,
      data: JSON.stringify(payload)
    }
  })
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('       ELDRUN SIMULATION ENGINE - START')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`⚠️  SIMULATION MODE - Data is not real!`)
  console.log('═══════════════════════════════════════════════════════════')
  
  if (!checkEnvironment()) {
    process.exit(1)
  }
  
  const intensity = parseInt(process.env.SIMULATION_INTENSITY || '5', 10)
  console.log(`\n📊 Simulation intensity: ${intensity}/10`)
  
  try {
    const { createdChannels, seededMessages } = await syncDemoChannelsWithDatabase()
    console.log(`\n🏗️  Chat channel sync complete: +${createdChannels} new / ${seededMessages} seeded messages`)

    // Generate initial data
    const heatmapCount = await generateHeatmapEvents(intensity * 20)
    const chatCount = await generateChatMessages(intensity * 10)
    const playerCount = await updateServerStats()
    const eventCount = await generateActiveEvents()
    
    // Log simulation start
    await logSimulation('start', 'simulation', 'Simulation started via CLI', {
      intensity,
      heatmapEvents: heatmapCount,
      chatMessages: chatCount,
      playersOnline: playerCount,
      activeEvents: eventCount,
      startedAt: new Date().toISOString()
    })
    
    // Mark simulation as active
    await prisma.simulationConfig.upsert({
      where: { key: 'simulation_active' },
      update: { value: 'true' },
      create: { key: 'simulation_active', value: 'true' }
    })
    
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('✅ SIMULATION STARTED')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`   📍 Heatmap Events: ${heatmapCount}`)
    console.log(`   💬 Chat Messages: ${chatCount}`)
    console.log(`   👥 Players Online: ${playerCount}`)
    console.log(`   🎉 Active Events: ${eventCount}`)
    console.log('═══════════════════════════════════════════════════════════')
    console.log('\n⚠️  Remember: All data is simulated!')
    console.log('   Run "pnpm sim:stop" to stop simulation')
    console.log('   Run "pnpm sim:reset" to clear all simulated data')

    setInterval(async () => {
      try {
        const generated = await generateHeatmapEvents(intensity * 10)
        await logSimulation('update', 'heatmap', 'Periodic heatmap tick', {
          generated,
          intensity,
          at: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Heatmap tick failed:', error)
      }
    }, 15_000)

    setInterval(async () => {
      try {
        const generated = await generateChatMessages(intensity * 5)
        await logSimulation('update', 'chat', 'Periodic chat tick', {
          generated,
          intensity,
          at: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Chat tick failed:', error)
      }
    }, 20_000)

    setInterval(async () => {
      try {
        const playersOnline = await updateServerStats()
        await logSimulation('update', 'server', 'Periodic server stats tick', {
          playersOnline,
          intensity,
          at: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Server stats tick failed:', error)
      }
    }, 30_000)

    setInterval(async () => {
      try {
        const activeEvents = await generateActiveEvents()
        await logSimulation('update', 'events', 'Periodic active events tick', {
          activeEvents,
          intensity,
          at: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Active events tick failed:', error)
      }
    }, 60_000)

    const shutdown = async (signal: string) => {
      try {
        await prisma.simulationConfig.upsert({
          where: { key: 'simulation_active' },
          update: { value: 'false' },
          create: { key: 'simulation_active', value: 'false' },
        })
        await logSimulation('stop', 'simulation', `Simulation stopped via ${signal}`, {
          stoppedAt: new Date().toISOString(),
          stoppedBy: signal,
        })
      } catch {
      } finally {
        await prisma.$disconnect()
        process.exit(0)
      }
    }

    process.once('SIGINT', () => void shutdown('SIGINT'))
    process.once('SIGTERM', () => void shutdown('SIGTERM'))

  } catch (error) {
    console.error('\n❌ Simulation failed:', error)
    process.exit(1)
  }
}

main()
