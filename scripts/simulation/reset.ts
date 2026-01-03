#!/usr/bin/env ts-node
/**
 * Eldrun Simulation Engine - Reset
 * Clears all simulated data from the database
 * 
 * Usage: pnpm sim:reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('       ELDRUN SIMULATION ENGINE - RESET')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('⚠️  This will DELETE all simulated data!')
  console.log('═══════════════════════════════════════════════════════════')
  
  // Check for --force flag
  const forceReset = process.argv.includes('--force')
  
  if (!forceReset) {
    console.log('\n❌ Safety check: Add --force flag to confirm reset')
    console.log('   Example: pnpm sim:reset --force')
    process.exit(1)
  }
  
  try {
    console.log('\n🗑️  Clearing simulated data...')
    
    // Clear simulated heatmap events
    const heatmapDeleted = await prisma.heatmapEvent.deleteMany({
      where: {
        metadata: { contains: '"simulated":true' }
      }
    })
    console.log(`   📍 Heatmap events: ${heatmapDeleted.count} deleted`)
    
    // Clear chat messages
    const chatDeleted = await prisma.chatMessage.deleteMany({
      where: { isSimulated: true }
    })
    console.log(`   💬 Chat messages: ${chatDeleted.count} deleted`)
    
    // Clear simulation logs
    const logsDeleted = await prisma.simulationLog.deleteMany({})
    console.log(`   📋 Simulation logs: ${logsDeleted.count} deleted`)
    
    // Reset simulation config
    await prisma.simulationConfig.deleteMany({})
    console.log(`   ⚙️  Simulation config: cleared`)
    
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('✅ SIMULATION DATA RESET COMPLETE')
    console.log('═══════════════════════════════════════════════════════════')
    
  } catch (error) {
    console.error('\n❌ Reset failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
