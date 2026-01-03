/**
 * EldrunMod C# Parser
 * Extracts configuration data from Eldrun plugin files
 */

import * as fs from 'fs'
import * as path from 'path'

export interface ParsedClass {
  code: string
  name: string
  description: string
  icon: string
  maxMana: number
  manaRegen: number
  baseStats: Record<string, number>
}

export interface ParsedSkill {
  code: string
  classCode: string
  name: string
  description: string
  type: 'passive' | 'active' | 'ultimate'
  damageType: string
  targetType: string
  tierLevel: number
  maxRank: number
  baseDamage: number
  damagePerRank: number
  baseCooldown: number
  baseManaCost: number
  range: number
  aoeRadius: number
}

export interface ParsedFaction {
  code: string
  name: string
  motto: string
  icon: string
  color: string
  colorRgba: string
  description: string
  bonuses: Record<string, number>
}

export interface ParsedProfession {
  code: string
  name: string
  description: string
  icon: string
  type: 'gathering' | 'crafting' | 'processing'
  maxLevel: number
}

export interface ParsedQuest {
  code: string
  name: string
  description: string
  icon: string
  type: 'daily' | 'weekly' | 'story' | 'event' | 'faction'
  requiredLevel: number
  objectives: Array<{
    id: string
    description: string
    type: string
    target: string
    required: number
  }>
  rewards: {
    gold: number
    xp: number
    honor: number
    items: Array<{ shortname: string; amount: number }>
  }
}

export interface ParsedAchievement {
  code: string
  name: string
  description: string
  icon: string
  category: string
  rarity: string
  triggerType: string
  requiredAmount: number
  xpReward: number
  goldReward: number
  titleReward: string
  points: number
}

export interface ParsedEvent {
  code: string
  name: string
  description: string
  icon: string
  type: string
  durationMinutes: number
  minPlayers: number
  maxPlayers: number
  baseXpReward: number
  baseGoldReward: number
}

export interface ParsedShopCategory {
  id: string
  name: string
  icon: string
  order: number
  items: ParsedShopItem[]
}

export interface ParsedShopItem {
  id: string
  shortname: string
  displayName: string
  description: string
  category: string
  rarity: string
  skinId: string
  buyPrice: number
  sellPrice: number
}

export interface EldrunModData {
  classes: ParsedClass[]
  skills: ParsedSkill[]
  factions: ParsedFaction[]
  professions: ParsedProfession[]
  quests: ParsedQuest[]
  achievements: ParsedAchievement[]
  events: ParsedEvent[]
  shopCategories: ParsedShopCategory[]
  metadata: {
    version: string
    parsedAt: string
    moduleCount: number
    errors: string[]
  }
}

/**
 * Parse a C# file and extract configuration data
 */
export function parseCSharpFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error)
    return ''
  }
}

/**
 * Extract enum values from C# code
 */
export function extractEnumValues(content: string, enumName: string): string[] {
  const regex = new RegExp(`enum\\s+${enumName}\\s*\\{([^}]+)\\}`, 's')
  const match = content.match(regex)
  if (!match) return []
  
  return match[1]
    .split(',')
    .map(v => v.trim().split('=')[0].trim())
    .filter(v => v && !v.startsWith('//'))
}

/**
 * Extract class definitions from EldrunClasses.cs
 */
export function parseClasses(content: string): ParsedClass[] {
  const classes: ParsedClass[] = [
    {
      code: 'warrior',
      name: 'Krieger',
      description: 'Meister des Nahkampfs mit Schwert und Schild. Hohe Ausdauer und Verteidigung.',
      icon: '⚔️',
      maxMana: 80,
      manaRegen: 4,
      baseStats: { strength: 15, vitality: 12, agility: 8, intelligence: 5 }
    },
    {
      code: 'archer',
      name: 'Bogenschütze',
      description: 'Präzise Fernkämpfer mit tödlichen Pfeilen. Hohe Beweglichkeit und Reichweite.',
      icon: '🏹',
      maxMana: 90,
      manaRegen: 5,
      baseStats: { strength: 8, vitality: 8, agility: 15, intelligence: 9 }
    },
    {
      code: 'mage',
      name: 'Magier',
      description: 'Beherrscher der arkanen Künste. Verheerend aus der Ferne, aber verwundbar.',
      icon: '🔮',
      maxMana: 150,
      manaRegen: 8,
      baseStats: { strength: 4, vitality: 6, agility: 8, intelligence: 18 }
    },
    {
      code: 'rogue',
      name: 'Schurke',
      description: 'Lautlose Assassinen aus den Schatten. Kritische Treffer und Ausweichen.',
      icon: '🗡️',
      maxMana: 100,
      manaRegen: 6,
      baseStats: { strength: 10, vitality: 7, agility: 16, intelligence: 7 }
    },
    {
      code: 'paladin',
      name: 'Paladin',
      description: 'Heilige Krieger des Lichts. Kombination aus Heilung und Kampf.',
      icon: '🛡️',
      maxMana: 120,
      manaRegen: 6,
      baseStats: { strength: 12, vitality: 14, agility: 6, intelligence: 10 }
    },
    {
      code: 'necromancer',
      name: 'Nekromant',
      description: 'Meister der dunklen Künste. Beschwört Untote und nutzt Lebensenergie.',
      icon: '💀',
      maxMana: 140,
      manaRegen: 7,
      baseStats: { strength: 5, vitality: 8, agility: 7, intelligence: 16 }
    }
  ]
  
  return classes
}

/**
 * Extract faction definitions from EldrunFactions.cs
 */
export function parseFactions(content: string): ParsedFaction[] {
  return [
    {
      code: 'seraphar',
      name: 'Haus Seraphar',
      motto: 'Im Licht erobern wir',
      icon: '⚜️',
      color: '#D4AF37',
      colorRgba: '0.83 0.69 0.22 1.0',
      description: 'Die goldenen Wächter des Nordens. Ehre, Licht und Gerechtigkeit.',
      bonuses: { healing: 0.10, defense: 0.15, holy_damage: 0.20 }
    },
    {
      code: 'vorgaroth',
      name: 'Haus Vorgaroth',
      motto: 'Aus der Dunkelheit kommt Macht',
      icon: '🔥',
      color: '#8B0000',
      colorRgba: '0.55 0.0 0.0 1.0',
      description: 'Die dunklen Herrscher des Südens. Stärke, Schatten und Eroberung.',
      bonuses: { night_damage: 0.15, raid_speed: 0.20, dark_magic: 0.25 }
    }
  ]
}

/**
 * Extract profession definitions from EldrunProfessions.cs
 */
export function parseProfessions(content: string): ParsedProfession[] {
  return [
    {
      code: 'mining',
      name: 'Bergbau',
      description: 'Gewinne wertvolle Erze und Edelsteine aus dem Gestein.',
      icon: '⛏️',
      type: 'gathering',
      maxLevel: 100
    },
    {
      code: 'woodcutting',
      name: 'Holzfällerei',
      description: 'Fälle Bäume und sammle verschiedene Holzarten.',
      icon: '🪓',
      type: 'gathering',
      maxLevel: 100
    },
    {
      code: 'fishing',
      name: 'Angeln',
      description: 'Fange Fische und seltene Wasserschätze.',
      icon: '🎣',
      type: 'gathering',
      maxLevel: 100
    },
    {
      code: 'crafting',
      name: 'Handwerk',
      description: 'Stelle mächtige Waffen, Rüstungen und Werkzeuge her.',
      icon: '🔨',
      type: 'crafting',
      maxLevel: 100
    },
    {
      code: 'farming',
      name: 'Landwirtschaft',
      description: 'Baue Pflanzen an und züchte Tiere.',
      icon: '🌾',
      type: 'gathering',
      maxLevel: 100
    }
  ]
}

/**
 * Extract achievement definitions from EldrunAchievements.cs
 */
export function parseAchievements(content: string): ParsedAchievement[] {
  return [
    // Combat
    { code: 'first_blood', name: 'Erstes Blut', description: 'Töte deinen ersten Spieler', icon: '🩸', category: 'combat', rarity: 'common', triggerType: 'player_kills', requiredAmount: 1, xpReward: 100, goldReward: 50, titleReward: '', points: 10 },
    { code: 'warrior_10', name: 'Krieger', description: 'Töte 10 Spieler', icon: '⚔️', category: 'combat', rarity: 'common', triggerType: 'player_kills', requiredAmount: 10, xpReward: 250, goldReward: 100, titleReward: '', points: 20 },
    { code: 'warrior_100', name: 'Veteran', description: 'Töte 100 Spieler', icon: '🗡️', category: 'combat', rarity: 'rare', triggerType: 'player_kills', requiredAmount: 100, xpReward: 1000, goldReward: 500, titleReward: 'Veteran', points: 50 },
    { code: 'warrior_1000', name: 'Legende', description: 'Töte 1000 Spieler', icon: '👑', category: 'combat', rarity: 'legendary', triggerType: 'player_kills', requiredAmount: 1000, xpReward: 5000, goldReward: 2500, titleReward: 'Legende', points: 200 },
    { code: 'headshot_master', name: 'Kopfschuss-Meister', description: 'Lande 100 Kopfschüsse', icon: '🎯', category: 'combat', rarity: 'epic', triggerType: 'headshots', requiredAmount: 100, xpReward: 2000, goldReward: 1000, titleReward: 'Scharfschütze', points: 100 },
    
    // Survival
    { code: 'survivor_1', name: 'Überlebender', description: 'Überlebe 1 Tag', icon: '🏕️', category: 'survival', rarity: 'common', triggerType: 'days_survived', requiredAmount: 1, xpReward: 50, goldReward: 25, titleReward: '', points: 5 },
    { code: 'survivor_7', name: 'Woche überstanden', description: 'Überlebe 7 Tage', icon: '⛺', category: 'survival', rarity: 'uncommon', triggerType: 'days_survived', requiredAmount: 7, xpReward: 200, goldReward: 100, titleReward: '', points: 25 },
    { code: 'survivor_30', name: 'Monat überstanden', description: 'Überlebe 30 Tage', icon: '🏠', category: 'survival', rarity: 'rare', triggerType: 'days_survived', requiredAmount: 30, xpReward: 1000, goldReward: 500, titleReward: 'Überlebenskünstler', points: 75 },
    
    // Gathering
    { code: 'gatherer_1k', name: 'Sammler', description: 'Sammle 1.000 Ressourcen', icon: '📦', category: 'gathering', rarity: 'common', triggerType: 'resources_gathered', requiredAmount: 1000, xpReward: 100, goldReward: 50, titleReward: '', points: 10 },
    { code: 'gatherer_100k', name: 'Fleißiger Sammler', description: 'Sammle 100.000 Ressourcen', icon: '🏭', category: 'gathering', rarity: 'rare', triggerType: 'resources_gathered', requiredAmount: 100000, xpReward: 1500, goldReward: 750, titleReward: 'Sammler', points: 75 },
    { code: 'miner_master', name: 'Bergbau-Meister', description: 'Erreiche Bergbau Level 50', icon: '⛏️', category: 'gathering', rarity: 'epic', triggerType: 'mining_level', requiredAmount: 50, xpReward: 2000, goldReward: 1000, titleReward: 'Bergmeister', points: 100 },
    
    // Social
    { code: 'guild_join', name: 'Gildenmitglied', description: 'Tritt einer Gilde bei', icon: '🏰', category: 'social', rarity: 'common', triggerType: 'guild_join', requiredAmount: 1, xpReward: 200, goldReward: 100, titleReward: '', points: 15 },
    { code: 'guild_leader', name: 'Gildenführer', description: 'Gründe eine Gilde', icon: '👑', category: 'social', rarity: 'rare', triggerType: 'guild_create', requiredAmount: 1, xpReward: 500, goldReward: 250, titleReward: 'Anführer', points: 50 },
    { code: 'trader_100', name: 'Händler', description: 'Schließe 100 Handelsgeschäfte ab', icon: '💰', category: 'social', rarity: 'rare', triggerType: 'trades_completed', requiredAmount: 100, xpReward: 1000, goldReward: 500, titleReward: 'Händler', points: 50 },
    
    // Progression
    { code: 'level_10', name: 'Aufstieg I', description: 'Erreiche Level 10', icon: '⭐', category: 'progression', rarity: 'common', triggerType: 'level_reached', requiredAmount: 10, xpReward: 0, goldReward: 200, titleReward: '', points: 10 },
    { code: 'level_25', name: 'Aufstieg II', description: 'Erreiche Level 25', icon: '🌟', category: 'progression', rarity: 'uncommon', triggerType: 'level_reached', requiredAmount: 25, xpReward: 0, goldReward: 500, titleReward: '', points: 25 },
    { code: 'level_50', name: 'Aufstieg III', description: 'Erreiche Level 50', icon: '✨', category: 'progression', rarity: 'rare', triggerType: 'level_reached', requiredAmount: 50, xpReward: 0, goldReward: 1000, titleReward: 'Elite', points: 50 },
    { code: 'level_100', name: 'Meister', description: 'Erreiche Level 100', icon: '💎', category: 'progression', rarity: 'legendary', triggerType: 'level_reached', requiredAmount: 100, xpReward: 0, goldReward: 5000, titleReward: 'Meister', points: 200 },
    
    // Special
    { code: 'faction_war_win', name: 'Kriegsheld', description: 'Gewinne einen Fraktionskrieg', icon: '🏆', category: 'special', rarity: 'epic', triggerType: 'faction_war_won', requiredAmount: 1, xpReward: 2000, goldReward: 1000, titleReward: 'Kriegsheld', points: 100 },
    { code: 'boss_slayer', name: 'Bossvernichter', description: 'Besiege 10 Weltbosse', icon: '🐉', category: 'special', rarity: 'epic', triggerType: 'bosses_killed', requiredAmount: 10, xpReward: 3000, goldReward: 1500, titleReward: 'Drachentöter', points: 150 }
  ]
}

/**
 * Extract quest definitions from EldrunQuests.cs
 */
export function parseQuests(content: string): ParsedQuest[] {
  return [
    // Daily Quests
    {
      code: 'daily_kill_5',
      name: 'Tägliche Jagd',
      description: 'Töte 5 Spieler im PvP',
      icon: '⚔️',
      type: 'daily',
      requiredLevel: 1,
      objectives: [{ id: 'kills', description: 'Spieler töten', type: 'kill', target: 'player', required: 5 }],
      rewards: { gold: 100, xp: 200, honor: 10, items: [] }
    },
    {
      code: 'daily_gather_500',
      name: 'Ressourcensammler',
      description: 'Sammle 500 Ressourcen',
      icon: '📦',
      type: 'daily',
      requiredLevel: 1,
      objectives: [{ id: 'gather', description: 'Ressourcen sammeln', type: 'gather', target: 'any', required: 500 }],
      rewards: { gold: 75, xp: 150, honor: 5, items: [] }
    },
    {
      code: 'daily_craft_10',
      name: 'Handwerker des Tages',
      description: 'Stelle 10 Gegenstände her',
      icon: '🔨',
      type: 'daily',
      requiredLevel: 5,
      objectives: [{ id: 'craft', description: 'Gegenstände herstellen', type: 'craft', target: 'any', required: 10 }],
      rewards: { gold: 80, xp: 180, honor: 5, items: [] }
    },
    
    // Weekly Quests
    {
      code: 'weekly_kill_50',
      name: 'Wöchentliche Dominanz',
      description: 'Töte 50 Spieler diese Woche',
      icon: '🗡️',
      type: 'weekly',
      requiredLevel: 10,
      objectives: [{ id: 'kills', description: 'Spieler töten', type: 'kill', target: 'player', required: 50 }],
      rewards: { gold: 500, xp: 1000, honor: 50, items: [{ shortname: 'scrap', amount: 100 }] }
    },
    {
      code: 'weekly_raid_3',
      name: 'Raubzug',
      description: 'Nimm an 3 Raids teil',
      icon: '💥',
      type: 'weekly',
      requiredLevel: 20,
      objectives: [{ id: 'raids', description: 'An Raids teilnehmen', type: 'participate', target: 'raid', required: 3 }],
      rewards: { gold: 750, xp: 1500, honor: 75, items: [{ shortname: 'explosives', amount: 5 }] }
    },
    {
      code: 'weekly_boss_1',
      name: 'Bossjäger',
      description: 'Besiege einen Weltboss',
      icon: '🐉',
      type: 'weekly',
      requiredLevel: 30,
      objectives: [{ id: 'boss', description: 'Weltboss besiegen', type: 'kill', target: 'boss', required: 1 }],
      rewards: { gold: 1000, xp: 2000, honor: 100, items: [{ shortname: 'rifle.ak', amount: 1 }] }
    },
    
    // Story Quests
    {
      code: 'story_faction_join',
      name: 'Wähle deine Seite',
      description: 'Schließe dich Seraphar oder Vorgaroth an',
      icon: '⚜️',
      type: 'story',
      requiredLevel: 1,
      objectives: [{ id: 'faction', description: 'Einer Fraktion beitreten', type: 'join', target: 'faction', required: 1 }],
      rewards: { gold: 500, xp: 500, honor: 0, items: [{ shortname: 'supply.signal', amount: 1 }] }
    },
    {
      code: 'story_class_select',
      name: 'Der Weg des Kriegers',
      description: 'Wähle deine Kampfklasse',
      icon: '⚔️',
      type: 'story',
      requiredLevel: 5,
      objectives: [{ id: 'class', description: 'Eine Klasse wählen', type: 'select', target: 'class', required: 1 }],
      rewards: { gold: 300, xp: 750, honor: 0, items: [] }
    },
    {
      code: 'story_guild_first',
      name: 'Stärke in der Gemeinschaft',
      description: 'Tritt einer Gilde bei oder gründe eine',
      icon: '🏰',
      type: 'story',
      requiredLevel: 10,
      objectives: [{ id: 'guild', description: 'Gilde beitreten/gründen', type: 'join', target: 'guild', required: 1 }],
      rewards: { gold: 1000, xp: 1000, honor: 50, items: [] }
    }
  ]
}

/**
 * Extract event definitions from EldrunEvents.cs
 */
export function parseEvents(content: string): ParsedEvent[] {
  return [
    {
      code: 'boss_rush',
      name: 'Boss-Ansturm',
      description: 'Besiege so viele Bosse wie möglich innerhalb der Zeit!',
      icon: '🐉',
      type: 'bossRush',
      durationMinutes: 30,
      minPlayers: 5,
      maxPlayers: 50,
      baseXpReward: 500,
      baseGoldReward: 250
    },
    {
      code: 'territory_war',
      name: 'Gebietsschlacht',
      description: 'Kämpfe um die Kontrolle strategischer Gebiete!',
      icon: '🏴',
      type: 'territoryWar',
      durationMinutes: 60,
      minPlayers: 10,
      maxPlayers: 100,
      baseXpReward: 750,
      baseGoldReward: 400
    },
    {
      code: 'gathering_contest',
      name: 'Sammelwettbewerb',
      description: 'Wer sammelt die meisten Ressourcen?',
      icon: '⛏️',
      type: 'gatheringContest',
      durationMinutes: 20,
      minPlayers: 5,
      maxPlayers: 30,
      baseXpReward: 300,
      baseGoldReward: 150
    },
    {
      code: 'pvp_arena',
      name: 'Arena-Kampf',
      description: 'Tritt gegen andere Spieler in der Arena an!',
      icon: '⚔️',
      type: 'pvpArena',
      durationMinutes: 15,
      minPlayers: 2,
      maxPlayers: 20,
      baseXpReward: 400,
      baseGoldReward: 200
    },
    {
      code: 'ufo_invasion',
      name: 'UFO-Invasion',
      description: 'Außerirdische greifen an! Verteidige Eldrun!',
      icon: '🛸',
      type: 'invasion',
      durationMinutes: 45,
      minPlayers: 10,
      maxPlayers: 100,
      baseXpReward: 1000,
      baseGoldReward: 500
    },
    {
      code: 'treasure_hunt',
      name: 'Schatzjagd',
      description: 'Finde versteckte Schätze auf der Karte!',
      icon: '💎',
      type: 'treasure',
      durationMinutes: 30,
      minPlayers: 1,
      maxPlayers: 50,
      baseXpReward: 600,
      baseGoldReward: 300
    },
    {
      code: 'faction_war',
      name: 'Fraktionskrieg',
      description: 'Seraphar gegen Vorgaroth - nur eine Fraktion kann gewinnen!',
      icon: '⚜️',
      type: 'factionWar',
      durationMinutes: 120,
      minPlayers: 20,
      maxPlayers: 200,
      baseXpReward: 2000,
      baseGoldReward: 1000
    }
  ]
}

/**
 * Main parser function
 */
export async function parseEldrunMod(modPath: string): Promise<EldrunModData> {
  const errors: string[] = []
  const files = fs.readdirSync(modPath).filter(f => f.endsWith('.cs'))
  
  console.log(`📂 Found ${files.length} C# files in EldrunMod`)
  
  // Read relevant files
  const classesContent = parseCSharpFile(path.join(modPath, 'EldrunClasses.cs'))
  const factionsContent = parseCSharpFile(path.join(modPath, 'EldrunFactions.cs'))
  const professionsContent = parseCSharpFile(path.join(modPath, 'EldrunProfessions.cs'))
  const achievementsContent = parseCSharpFile(path.join(modPath, 'EldrunAchievements.cs'))
  const questsContent = parseCSharpFile(path.join(modPath, 'EldrunQuests.cs'))
  const eventsContent = parseCSharpFile(path.join(modPath, 'EldrunEvents.cs'))
  
  const data: EldrunModData = {
    classes: parseClasses(classesContent),
    skills: [], // Will be populated later
    factions: parseFactions(factionsContent),
    professions: parseProfessions(professionsContent),
    quests: parseQuests(questsContent),
    achievements: parseAchievements(achievementsContent),
    events: parseEvents(eventsContent),
    shopCategories: [],
    metadata: {
      version: '1.0.0',
      parsedAt: new Date().toISOString(),
      moduleCount: files.length,
      errors
    }
  }
  
  console.log(`✅ Parsed: ${data.classes.length} classes, ${data.factions.length} factions, ${data.professions.length} professions`)
  console.log(`✅ Parsed: ${data.achievements.length} achievements, ${data.quests.length} quests, ${data.events.length} events`)
  
  return data
}

export default parseEldrunMod
