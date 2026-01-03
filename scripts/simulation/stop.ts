#!/usr/bin/env ts-node
/**
 * Eldrun Simulation Engine - Stop
 * Stops the simulation and marks it as inactive
 * 
 * Usage: pnpm sim:stop
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('       ELDRUN SIMULATION ENGINE - STOP')
  console.log('═══════════════════════════════════════════════════════════')
  
  try {
    // Mark simulation as inactive
    await prisma.simulationConfig.upsert({
      where: { key: 'simulation_active' },
      update: { value: 'false' },
      create: { key: 'simulation_active', value: 'false' }
    })
    
    // Log stop action
    await prisma.simulationLog.create({
      data: {
        type: 'stop',
        module: 'simulation',
        message: 'Simulation stopped via CLI',
        data: JSON.stringify({
          stoppedAt: new Date().toISOString(),
          stoppedBy: 'cli'
        })
      }
    })
    
    console.log('\n✅ SIMULATION STOPPED')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('   Simulated data remains in database.')
    console.log('   Run "pnpm sim:reset" to clear all simulated data.')
    console.log('═══════════════════════════════════════════════════════════')
    
  } catch (error) {
    console.error('\n❌ Failed to stop simulation:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
