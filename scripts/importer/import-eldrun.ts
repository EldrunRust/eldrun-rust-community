#!/usr/bin/env ts-node
/**
 * EldrunMod Importer CLI
 * Imports data from EldrunMod C# files into the database
 * 
 * Usage: pnpm import:eldrun [--dry-run] [--verbose]
 */

import { PrismaClient } from '@prisma/client'
import parseEldrunMod, { EldrunModData } from './eldrun-parser'
import * as path from 'path'

const prisma = new PrismaClient()

interface ImportOptions {
  dryRun: boolean
  verbose: boolean
  modPath: string
}

async function importFactions(data: EldrunModData, options: ImportOptions) {
  console.log('\n🏰 Importing Factions...')
  
  for (const faction of data.factions) {
    if (options.verbose) console.log(`  → ${faction.name} (${faction.code})`)
    
    if (!options.dryRun) {
      await prisma.faction.upsert({
        where: { code: faction.code },
        update: {
          name: faction.name,
          motto: faction.motto,
          description: faction.description,
          icon: faction.icon,
          color: faction.color,
          colorRgba: faction.colorRgba,
          bonuses: JSON.stringify(faction.bonuses)
        },
        create: {
          code: faction.code,
          name: faction.name,
          motto: faction.motto,
          description: faction.description,
          icon: faction.icon,
          color: faction.color,
          colorRgba: faction.colorRgba,
          bonuses: JSON.stringify(faction.bonuses)
        }
      })
    }
  }
  
  console.log(`  ✅ ${data.factions.length} factions imported`)
}

async function importClasses(data: EldrunModData, options: ImportOptions) {
  console.log('\n⚔️ Importing Classes...')
  
  for (const cls of data.classes) {
    if (options.verbose) console.log(`  → ${cls.name} (${cls.code})`)
    
    if (!options.dryRun) {
      await prisma.gameClass.upsert({
        where: { code: cls.code },
        update: {
          name: cls.name,
          description: cls.description,
          icon: cls.icon,
          maxMana: cls.maxMana,
          manaRegen: cls.manaRegen,
          baseStats: JSON.stringify(cls.baseStats)
        },
        create: {
          code: cls.code,
          name: cls.name,
          description: cls.description,
          icon: cls.icon,
          maxMana: cls.maxMana,
          manaRegen: cls.manaRegen,
          baseStats: JSON.stringify(cls.baseStats)
        }
      })
    }
  }
  
  console.log(`  ✅ ${data.classes.length} classes imported`)
}

async function importProfessions(data: EldrunModData, options: ImportOptions) {
  console.log('\n🔨 Importing Professions...')
  
  for (const prof of data.professions) {
    if (options.verbose) console.log(`  → ${prof.name} (${prof.code})`)
    
    if (!options.dryRun) {
      await prisma.profession.upsert({
        where: { code: prof.code },
        update: {
          name: prof.name,
          description: prof.description,
          icon: prof.icon,
          type: prof.type,
          maxLevel: prof.maxLevel
        },
        create: {
          code: prof.code,
          name: prof.name,
          description: prof.description,
          icon: prof.icon,
          type: prof.type,
          maxLevel: prof.maxLevel
        }
      })
    }
  }
  
  console.log(`  ✅ ${data.professions.length} professions imported`)
}

async function importAchievements(data: EldrunModData, options: ImportOptions) {
  console.log('\n🏆 Importing Achievements...')
  
  for (const ach of data.achievements) {
    if (options.verbose) console.log(`  → ${ach.name} (${ach.code})`)
    
    if (!options.dryRun) {
      await prisma.achievement.upsert({
        where: { slug: ach.code },
        update: {
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          category: ach.category,
          rarity: ach.rarity,
          requirements: JSON.stringify({ type: ach.triggerType, target: ach.requiredAmount }),
          rewardXp: ach.xpReward,
          rewardCoins: ach.goldReward,
          rewardTitle: ach.titleReward || null,
          points: ach.points
        },
        create: {
          slug: ach.code,
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          category: ach.category,
          rarity: ach.rarity,
          requirements: JSON.stringify({ type: ach.triggerType, target: ach.requiredAmount }),
          rewardXp: ach.xpReward,
          rewardCoins: ach.goldReward,
          rewardTitle: ach.titleReward || null,
          points: ach.points
        }
      })
    }
  }
  
  console.log(`  ✅ ${data.achievements.length} achievements imported`)
}

async function importQuests(data: EldrunModData, options: ImportOptions) {
  console.log('\n📜 Importing Quests...')
  
  for (const quest of data.quests) {
    if (options.verbose) console.log(`  → ${quest.name} (${quest.code})`)
    
    if (!options.dryRun) {
      await prisma.quest.upsert({
        where: { code: quest.code },
        update: {
          name: quest.name,
          description: quest.description,
          icon: quest.icon,
          type: quest.type,
          requiredLevel: quest.requiredLevel,
          objectives: JSON.stringify(quest.objectives),
          rewards: JSON.stringify(quest.rewards),
          isRepeatable: quest.type === 'daily' || quest.type === 'weekly',
          cooldownHours: quest.type === 'daily' ? 24 : quest.type === 'weekly' ? 168 : 0
        },
        create: {
          code: quest.code,
          name: quest.name,
          description: quest.description,
          icon: quest.icon,
          type: quest.type,
          requiredLevel: quest.requiredLevel,
          objectives: JSON.stringify(quest.objectives),
          rewards: JSON.stringify(quest.rewards),
          isRepeatable: quest.type === 'daily' || quest.type === 'weekly',
          cooldownHours: quest.type === 'daily' ? 24 : quest.type === 'weekly' ? 168 : 0
        }
      })
    }
  }
  
  console.log(`  ✅ ${data.quests.length} quests imported`)
}

async function importEvents(data: EldrunModData, options: ImportOptions) {
  console.log('\n🎉 Importing Events...')
  
  for (const event of data.events) {
    if (options.verbose) console.log(`  → ${event.name} (${event.code})`)
    
    if (!options.dryRun) {
      await prisma.gameEvent.upsert({
        where: { code: event.code },
        update: {
          name: event.name,
          description: event.description,
          icon: event.icon,
          type: event.type,
          durationMinutes: event.durationMinutes,
          minPlayers: event.minPlayers,
          maxPlayers: event.maxPlayers,
          baseXpReward: event.baseXpReward,
          baseGoldReward: event.baseGoldReward
        },
        create: {
          code: event.code,
          name: event.name,
          description: event.description,
          icon: event.icon,
          type: event.type,
          durationMinutes: event.durationMinutes,
          minPlayers: event.minPlayers,
          maxPlayers: event.maxPlayers,
          baseXpReward: event.baseXpReward,
          baseGoldReward: event.baseGoldReward
        }
      })
    }
  }
  
  console.log(`  ✅ ${data.events.length} events imported`)
}

async function importLoreEntries(options: ImportOptions) {
  console.log('\n📚 Importing Lore Entries...')
  
  const loreEntries = [
    {
      code: 'history_eldrun',
      title: 'Die Geschichte von Eldrun',
      content: `Vor Jahrhunderten war Eldrun ein vereintes Königreich unter der Herrschaft von König Aldric dem Weisen. Nach seinem Tod zerbrach das Reich in zwei rivalisierende Häuser: Haus Seraphar im Norden und Haus Vorgaroth im Süden.

Die Königsbrücke, einst Symbol der Einheit, wurde zum Schauplatz endloser Schlachten. Beide Fraktionen kämpfen bis heute um die Kontrolle dieses strategischen Punktes.

Die alten Legenden sprechen von einem Artefakt - dem Herz von Eldrun - das die Macht besitzt, das Reich wieder zu einen. Doch niemand weiß, wo es verborgen liegt...`,
      category: 'history'
    },
    {
      code: 'faction_seraphar',
      title: 'Haus Seraphar - Die goldenen Wächter',
      content: `Haus Seraphar herrscht über die nördlichen Lande von Eldrun. Ihre Fahnen tragen den goldenen Löwen auf weißem Grund, Symbol für Stärke und Reinheit.

Die Seraphar glauben an Ehre, Gerechtigkeit und das Licht. Ihre Krieger sind bekannt für ihre defensive Kampfkunst und ihre Fähigkeit, Verbündete zu heilen und zu schützen.

Das Motto des Hauses lautet: "Im Licht erobern wir"`,
      category: 'factions'
    },
    {
      code: 'faction_vorgaroth',
      title: 'Haus Vorgaroth - Die Herren der Schatten',
      content: `Haus Vorgaroth kontrolliert die südlichen Territorien von Eldrun. Ihre Banner zeigen den roten Drachen auf schwarzem Grund, ein Zeichen ihrer unbändigen Macht.

Die Vorgaroth schöpfen ihre Kraft aus der Dunkelheit. Ihre Krieger sind gefürchtet für ihre aggressive Kampfweise und ihre Fähigkeit, dunkle Magie zu nutzen.

Das Motto des Hauses lautet: "Aus der Dunkelheit kommt Macht"`,
      category: 'factions'
    },
    {
      code: 'location_kingsbridge',
      title: 'Die Königsbrücke',
      content: `Die Königsbrücke ist das strategische Herz von Eldrun. Diese massive Steinbrücke überspannt den Großen Fluss und verbindet Nord und Süd.

In Friedenszeiten war sie eine wichtige Handelsroute. Heute ist sie ein ständiger Brennpunkt der Kämpfe zwischen Seraphar und Vorgaroth.

Wer die Brücke kontrolliert, kontrolliert den Handel - und damit die Macht über ganz Eldrun.`,
      category: 'locations'
    },
    {
      code: 'creature_stormwall',
      title: 'Die Sturmwand',
      content: `Am Rande der bekannten Welt erhebt sich die Sturmwand - eine mysteriöse Barriere aus ewigem Sturm und Blitzen.

Niemand weiß, was jenseits der Sturmwand liegt. Manche glauben, es sei das Reich der alten Götter. Andere vermuten dort das verlorene Herz von Eldrun.

Mutige Abenteurer, die versuchten, die Sturmwand zu durchqueren, kehrten nie zurück - oder kamen verändert zurück, mit seltsamen Kräften und wirren Geschichten.`,
      category: 'locations'
    }
  ]
  
  for (const entry of loreEntries) {
    if (options.verbose) console.log(`  → ${entry.title}`)
    
    if (!options.dryRun) {
      await prisma.loreEntry.upsert({
        where: { code: entry.code },
        update: {
          title: entry.title,
          content: entry.content,
          category: entry.category
        },
        create: {
          code: entry.code,
          title: entry.title,
          content: entry.content,
          category: entry.category
        }
      })
    }
  }
  
  console.log(`  ✅ ${loreEntries.length} lore entries imported`)
}

async function main() {
  const args = process.argv.slice(2)
  
  const options: ImportOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    modPath: process.env.ELDRUN_MOD_PATH || 'C:/Users/Shadow/Documents/EldrunMod'
  }
  
  console.log('═══════════════════════════════════════════════════════════')
  console.log('       ELDRUN MOD IMPORTER')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`📂 Mod Path: ${options.modPath}`)
  console.log(`🔧 Dry Run: ${options.dryRun}`)
  console.log(`📝 Verbose: ${options.verbose}`)
  console.log('═══════════════════════════════════════════════════════════')
  
  try {
    // Parse EldrunMod files
    const data = await parseEldrunMod(options.modPath)
    
    // Import all data
    await importFactions(data, options)
    await importClasses(data, options)
    await importProfessions(data, options)
    await importAchievements(data, options)
    await importQuests(data, options)
    await importEvents(data, options)
    await importLoreEntries(options)
    
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('✅ IMPORT COMPLETED SUCCESSFULLY')
    if (options.dryRun) {
      console.log('⚠️  This was a dry run - no changes were made to the database')
    }
    console.log('═══════════════════════════════════════════════════════════')
    
  } catch (error) {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
