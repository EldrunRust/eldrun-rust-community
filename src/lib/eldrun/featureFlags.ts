/**
 * Eldrun Feature Flags & Demo Mode Configuration
 * 
 * Centralized configuration for feature toggles and simulation mode
 */

export interface FeatureFlags {
  casino: boolean
  auction: boolean
  trading: boolean
  battlepass: boolean
  heatmap: boolean
  chat: boolean
  streams: boolean
}

export interface DemoConfig {
  enabled: boolean
  simulationMode: boolean
  seedMode: boolean
  intensity: number
  modules: string[]
}

// Parse boolean env var
function parseBool(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

// Get feature flags from environment
export function getFeatureFlags(): FeatureFlags {
  return {
    casino: parseBool(process.env.FEATURE_CASINO, true),
    auction: parseBool(process.env.FEATURE_AUCTION, true),
    trading: parseBool(process.env.FEATURE_TRADING, true),
    battlepass: parseBool(process.env.FEATURE_BATTLEPASS, true),
    heatmap: parseBool(process.env.FEATURE_HEATMAP, true),
    chat: parseBool(process.env.FEATURE_CHAT, true),
    streams: parseBool(process.env.FEATURE_STREAMS, true)
  }
}

// Get demo/simulation configuration
export function getDemoConfig(): DemoConfig {
  const modulesStr = process.env.SIMULATION_MODULES || 'server,heatmap,chat'
  const prod = isProduction()
  
  return {
    enabled: prod ? false : parseBool(process.env.DEMO_MODE, false),
    simulationMode: prod ? false : parseBool(process.env.SIMULATION_MODE, false),
    seedMode: prod ? false : parseBool(process.env.SEED_MODE, false),
    intensity: parseInt(process.env.SIMULATION_INTENSITY || '5', 10),
    modules: modulesStr.split(',').map(m => m.trim())
  }
}

// Check if we're in demo/dev mode
export function isDemoMode(): boolean {
  return isProduction() ? false : parseBool(process.env.DEMO_MODE, false)
}

// Check if simulation is active
export function isSimulationActive(): boolean {
  return isProduction() ? false : parseBool(process.env.SIMULATION_MODE, false)
}

// Check if a specific feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags()
  return flags[feature]
}

export function isProductionDeployment(): boolean {
  const deployEnv =
    process.env.NEXT_PUBLIC_DEPLOYMENT || process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
  if (deployEnv) return deployEnv === 'production'
  return process.env.NODE_ENV === 'production'
}

// Check if running in production
export function isProduction(): boolean {
  return isProductionDeployment()
}

// Safe guard - throws if trying to run simulation in production
export function assertNotProduction(action: string): void {
  if (isProduction()) {
    throw new Error(`FORBIDDEN: Cannot ${action} in production environment!`)
  }
}

// Export for client-side usage (safe subset)
export function getPublicConfig() {
  return {
    isDemoMode: isDemoMode(),
    features: getFeatureFlags()
  }
}
