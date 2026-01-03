import { NextRequest, NextResponse } from 'next/server'
import { 
  getGuildMember, 
  getGuildRoles, 
  syncUserRoles, 
  addRoleToMember, 
  removeRoleFromMember,
  ROLE_MAPPING 
} from '@/lib/discord'
import prisma from '@/lib/db'

// GET /api/discord/roles - Get all Discord roles and sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Get guild roles
    const roles = await getGuildRoles()

    if (!roles) {
      return NextResponse.json(
        { error: 'Discord Bot nicht verbunden oder Guild nicht gefunden' },
        { status: 503 }
      )
    }

    // If userId provided, get member's roles
    let memberRoles: string[] = []
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { discordId: true }
      })

      if (user?.discordId) {
        const member = await getGuildMember(user.discordId)
        memberRoles = member?.roles || []
      }
    }

    return NextResponse.json({
      roles: roles.map(r => ({
        id: r.id,
        name: r.name,
        color: r.color,
        position: r.position
      })).sort((a, b) => b.position - a.position),
      memberRoles,
      roleMapping: ROLE_MAPPING
    })

  } catch (error) {
    console.error('Discord roles error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Rollen' },
      { status: 500 }
    )
  }
}

// POST /api/discord/roles - Sync user roles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, roleId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID erforderlich' },
        { status: 400 }
      )
    }

    // Get user's Discord ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { discordId: true, role: true }
    })

    if (!user?.discordId) {
      return NextResponse.json(
        { error: 'Benutzer hat kein verknüpftes Discord-Konto' },
        { status: 400 }
      )
    }

    // Specific role action
    if (action === 'add' && roleId) {
      const success = await addRoleToMember(user.discordId, roleId)
      return NextResponse.json({
        success,
        message: success ? 'Rolle hinzugefügt' : 'Fehler beim Hinzufügen der Rolle'
      })
    }

    if (action === 'remove' && roleId) {
      const success = await removeRoleFromMember(user.discordId, roleId)
      return NextResponse.json({
        success,
        message: success ? 'Rolle entfernt' : 'Fehler beim Entfernen der Rolle'
      })
    }

    // Full role sync based on website role
    const websiteRoles = [user.role]
    
    // Add verified role if email is verified
    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true }
    })
    
    if (fullUser?.emailVerified) {
      websiteRoles.push('verified')
    }

    const result = await syncUserRoles(user.discordId, websiteRoles)

    return NextResponse.json({
      success: true,
      synced: result,
      message: `Rollen synchronisiert: ${result.added.length} hinzugefügt, ${result.removed.length} entfernt`
    })

  } catch (error) {
    console.error('Discord role sync error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Synchronisieren der Rollen' },
      { status: 500 }
    )
  }
}
