// Rust RCON (Remote Console) Service
// ═══════════════════════════════════════════════════════════════════════════
// This module connects to your Rust server via WebSocket RCON.
// Set RCON_ENABLED=true and configure RCON_HOST, RCON_PORT, RCON_PASSWORD

import WebSocket from 'ws'

// Environment variables
const RCON_ENABLED = process.env.RCON_ENABLED === 'true'
const RCON_HOST = process.env.RCON_HOST || 'localhost'
const RCON_PORT = process.env.RCON_PORT || '28016'
const RCON_PASSWORD = process.env.RCON_PASSWORD || ''

// ═══════════════════════════════════════════════════════════════════════════
// RCON CLIENT
// ═══════════════════════════════════════════════════════════════════════════

interface RconResponse {
  Identifier: number
  Message: string
  Type: string
  Stacktrace?: string
}

class RustRconClient {
  private ws: WebSocket | null = null
  private messageId = 1
  private pendingRequests = new Map<number, { resolve: (data: string) => void; reject: (err: Error) => void }>()
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  async connect(): Promise<boolean> {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      return true
    }

    return new Promise((resolve) => {
      try {
        const url = `ws://${RCON_HOST}:${RCON_PORT}/${RCON_PASSWORD}`
        this.ws = new WebSocket(url)

        this.ws.on('open', () => {
          // console.log('[RCON] Connected to Rust server')
          this.isConnected = true
          this.reconnectAttempts = 0
          resolve(true)
        })

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const response: RconResponse = JSON.parse(data.toString())
            const pending = this.pendingRequests.get(response.Identifier)
            if (pending) {
              pending.resolve(response.Message)
              this.pendingRequests.delete(response.Identifier)
            }
          } catch (e) {
            console.error('[RCON] Failed to parse message:', e)
          }
        })

        this.ws.on('error', (error: Error) => {
          console.error('[RCON] WebSocket error:', error.message)
          this.isConnected = false
          resolve(false)
        })

        this.ws.on('close', () => {
          // console.log('[RCON] Connection closed')
          this.isConnected = false
          // Reject all pending requests
          this.pendingRequests.forEach((pending) => {
            pending.reject(new Error('Connection closed'))
          })
          this.pendingRequests.clear()
        })

        // Timeout for connection
        setTimeout(() => {
          if (!this.isConnected) {
            this.ws?.close()
            resolve(false)
          }
        }, 5000)
      } catch (error) {
        console.error('RCON connection failed:', error)
        resolve(false)
      }
    })
  }

  async sendCommand(command: string, timeout = 10000): Promise<string> {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const connected = await this.connect()
      if (!connected) {
        throw new Error('RCON not connected')
      }
    }

    return new Promise((resolve, reject) => {
      const id = this.messageId++
      const packet = {
        Identifier: id,
        Message: command,
        Name: 'WebRcon'
      }

      const timer = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error('RCON command timeout'))
      }, timeout)

      this.pendingRequests.set(id, {
        resolve: (data) => {
          clearTimeout(timer)
          resolve(data)
        },
        reject: (err) => {
          clearTimeout(timer)
          reject(err)
        }
      })

      this.ws!.send(JSON.stringify(packet))
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.isConnected = false
    }
  }
}

// Singleton RCON client
let rconClient: RustRconClient | null = null

function getRconClient(): RustRconClient {
  if (!rconClient) {
    rconClient = new RustRconClient()
  }
  return rconClient
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ServerInfo {
  Hostname: string
  MaxPlayers: number
  Players: number
  Queued: number
  Joining: number
  EntityCount: number
  GameTime: string
  Uptime: number
  Map: string
  Framerate: number
  Memory: number
  Collections: number
  NetworkIn: number
  NetworkOut: number
  Restarting: boolean
  SaveCreatedTime: string
  Version: number
  Protocol: string
}

export interface PlayerInfo {
  SteamID: string
  OwnerSteamID: string
  DisplayName: string
  Ping: number
  Address: string
  ConnectedSeconds: number
  VoiationLevel: number
  CurrentLevel: number
  UnspentXp: number
  Health: number
}

// ═══════════════════════════════════════════════════════════════════════════
// RCON COMMANDS (Returns null when RCON is disabled - use external APIs)
// ═══════════════════════════════════════════════════════════════════════════

export async function getServerInfo(): Promise<ServerInfo | null> {
  if (!RCON_ENABLED) {
    // RCON disabled - use querySteamServer or external API instead
    console.log('[RCON] RCON is disabled. Use querySteamServer() or external API for server info.')
    return null
  }

  try {
    const client = getRconClient()
    const response = await client.sendCommand('serverinfo')
    const data = JSON.parse(response)
    return data as ServerInfo
  } catch (error) {
    console.error('[RCON] Failed to get server info:', error)
    return null
  }
}

export async function getPlayers(): Promise<PlayerInfo[]> {
  if (!RCON_ENABLED) {
    // RCON disabled - no player data available without RCON
    console.log('[RCON] RCON is disabled. Player data requires RCON connection.')
    return []
  }

  try {
    const client = getRconClient()
    const response = await client.sendCommand('playerlist')
    const data = JSON.parse(response)
    return data as PlayerInfo[]
  } catch (error) {
    console.error('[RCON] Failed to get players:', error)
    return []
  }
}

export async function getPlayerInfo(steamId: string): Promise<PlayerInfo | null> {
  const players = await getPlayers()
  return players.find(p => p.SteamID === steamId) || null
}

export async function kickPlayer(steamId: string, reason: string): Promise<boolean> {
  if (!RCON_ENABLED) {
    console.warn('[RCON] Cannot kick player - RCON is disabled')
    return false
  }
  try {
    const client = getRconClient()
    await client.sendCommand(`kick ${steamId} "${reason}"`)
    return true
  } catch (error) {
    console.error('[RCON] Failed to kick player:', error)
    return false
  }
}

export async function banPlayer(steamId: string, reason: string): Promise<boolean> {
  if (!RCON_ENABLED) {
    console.warn('[RCON] Cannot ban player - RCON is disabled')
    return false
  }
  try {
    const client = getRconClient()
    await client.sendCommand(`ban ${steamId} "${reason}"`)
    return true
  } catch (error) {
    console.error('[RCON] Failed to ban player:', error)
    return false
  }
}

export async function unbanPlayer(steamId: string): Promise<boolean> {
  if (!RCON_ENABLED) {
    console.warn('[RCON] Cannot unban player - RCON is disabled')
    return false
  }
  try {
    const client = getRconClient()
    await client.sendCommand(`unban ${steamId}`)
    return true
  } catch (error) {
    console.error('[RCON] Failed to unban player:', error)
    return false
  }
}

export async function sendGlobalMessage(message: string): Promise<boolean> {
  if (!RCON_ENABLED) {
    console.warn('[RCON] Cannot send message - RCON is disabled')
    return false
  }
  try {
    const client = getRconClient()
    await client.sendCommand(`say "${message}"`)
    return true
  } catch (error) {
    console.error('[RCON] Failed to send message:', error)
    return false
  }
}

export async function giveItem(steamId: string, itemId: string, amount = 1): Promise<boolean> {
  if (!RCON_ENABLED) {
    console.warn('[RCON] Cannot give item - RCON is disabled')
    return false
  }
  try {
    const client = getRconClient()
    await client.sendCommand(`inventory.giveto ${steamId} ${itemId} ${amount}`)
    return true
  } catch (error) {
    console.error('[RCON] Failed to give item:', error)
    return false
  }
}

export async function executeCommand(command: string): Promise<string> {
  if (!RCON_ENABLED) {
    console.warn('[RCON] Cannot execute command - RCON is disabled')
    return 'RCON disabled'
  }
  try {
    const client = getRconClient()
    return await client.sendCommand(command)
  } catch (error) {
    console.error('[RCON] Failed to execute command:', error)
    return 'Command failed'
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVER STATUS (Without RCON - Steam Query)
// ═══════════════════════════════════════════════════════════════════════════

export interface SteamServerInfo {
  name: string
  map: string
  players: number
  maxPlayers: number
  bots: number
  serverType: string
  environment: string
  visibility: boolean
  vac: boolean
  version: string
  ping: number
}

// Query server using Steam Server Query protocol (A2S_INFO)
export async function querySteamServer(
  host = process.env.SERVER_HOST || 'localhost',
  port = parseInt(process.env.SERVER_QUERY_PORT || '28015')
): Promise<SteamServerInfo | null> {
  // Note: This would require a UDP socket implementation
  // For simplicity, we'll use a mock or external service
  
  try {
    // Try using an external API like steam-server-query or battlemetrics
    const response = await fetch(
      `https://api.battlemetrics.com/servers?filter[search]=${encodeURIComponent(host)}`,
      { next: { revalidate: 30 } }
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    const server = data.data?.[0]
    
    if (!server) return null
    
    return {
      name: server.attributes.name,
      map: server.attributes.details?.map || 'Unknown',
      players: server.attributes.players,
      maxPlayers: server.attributes.maxPlayers,
      bots: 0,
      serverType: 'dedicated',
      environment: 'linux',
      visibility: true,
      vac: true,
      version: server.attributes.details?.version || 'Unknown',
      ping: server.attributes.details?.ping || 0
    }
  } catch (error) {
    console.error('Steam server query error:', error)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RCON STATUS
// ═══════════════════════════════════════════════════════════════════════════

export function isRconEnabled(): boolean {
  return RCON_ENABLED
}
