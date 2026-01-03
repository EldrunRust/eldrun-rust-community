import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Simulated clans for fallback
const SIMULATED_CLANS = [
  { name: 'ELDRUN', fullName: 'Eldrun Elite', members: 24, territory: 8, totalKills: 4523, logo: '/images/clans/eldrun.png', faction: 'seraphar' },
  { name: 'RAID', fullName: 'Raid Masters', members: 18, territory: 6, totalKills: 3847, logo: '/images/clans/raid.png', faction: 'vorgaroth' },
  { name: 'STORM', fullName: 'Stormwall Defenders', members: 15, territory: 5, totalKills: 2956, logo: '/images/clans/storm.png', faction: 'seraphar' },
  { name: 'DARK', fullName: 'Dark Legion', members: 21, territory: 7, totalKills: 4102, logo: '/images/clans/dark.png', faction: 'vorgaroth' },
  { name: 'FARM', fullName: 'Peaceful Farmers', members: 12, territory: 3, totalKills: 892, logo: '/images/clans/farm.png', faction: 'neutral' },
  { name: 'PVP', fullName: 'PVP Gods', members: 16, territory: 4, totalKills: 5234, logo: '/images/clans/pvp.png', faction: 'vorgaroth' },
  { name: 'SOLO', fullName: 'Solo Warriors', members: 8, territory: 2, totalKills: 1456, logo: '/images/clans/solo.png', faction: 'neutral' },
  { name: 'RUST', fullName: 'Rust Veterans', members: 19, territory: 5, totalKills: 3678, logo: '/images/clans/rust.png', faction: 'seraphar' },
  { name: 'WOLF', fullName: 'Wolf Pack', members: 14, territory: 4, totalKills: 2345, logo: '/images/clans/wolf.png', faction: 'vorgaroth' },
  { name: 'NOVA', fullName: 'Nova Squad', members: 11, territory: 3, totalKills: 1876, logo: '/images/clans/nova.png', faction: 'seraphar' },
]

export async function GET() {
  try {
    const clans = await prisma.clan.findMany({
      include: {
        _count: {
          select: { members: true },
        },
        members: {
          select: { kills: true },
        },
      },
      orderBy: { territory: 'desc' },
    })

    if (clans.length === 0) {
      return NextResponse.json(SIMULATED_CLANS)
    }

    const formattedClans = clans.map((clan) => ({
      name: clan.tag,
      fullName: clan.name,
      members: clan._count.members,
      territory: clan.territory,
      totalKills: clan.members.reduce((sum, member) => sum + member.kills, 0),
      logo: clan.logo,
    }))

    return NextResponse.json(formattedClans)
  } catch (error) {
    console.error('Error fetching clans:', error)
    // Return simulated clans on error
    return NextResponse.json(SIMULATED_CLANS)
  }
}
