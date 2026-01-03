// Rust Skins Data für Casino und Shop
// Realistische Rust Skins mit Preisen und Raritäten

export type SkinRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'contraband'
export type SkinCategory = 'weapon' | 'armor' | 'tool' | 'door' | 'misc'

export interface RustSkin {
  id: string
  name: string
  category: SkinCategory
  rarity: SkinRarity
  price: number // In Coins
  image: string // Emoji for now, could be URL later
  color: string // Rarity color
  description?: string
}

export const RARITY_CONFIG = {
  common: { color: '#9CA3AF', name: 'Gewöhnlich', multiplier: 1 },
  uncommon: { color: '#22C55E', name: 'Ungewöhnlich', multiplier: 1.5 },
  rare: { color: '#3B82F6', name: 'Selten', multiplier: 2.5 },
  epic: { color: '#A855F7', name: 'Episch', multiplier: 5 },
  legendary: { color: '#F59E0B', name: 'Legendär', multiplier: 10 },
  contraband: { color: '#EF4444', name: 'Contraband', multiplier: 25 }
}

export const RUST_SKINS: RustSkin[] = [
  // WEAPONS - AK-47
  { id: 'ak_glory', name: 'Glory AK47', category: 'weapon', rarity: 'legendary', price: 25000, image: '🔫', color: '#F59E0B', description: 'Goldenes Finish mit Drachengravur' },
  { id: 'ak_tempered', name: 'Tempered AK47', category: 'weapon', rarity: 'epic', price: 12000, image: '🔫', color: '#A855F7', description: 'Feuerrot mit schwarzen Akzenten' },
  { id: 'ak_blackout', name: 'Blackout AK47', category: 'weapon', rarity: 'rare', price: 5500, image: '🔫', color: '#3B82F6', description: 'Komplett mattschwarz' },
  { id: 'ak_alien', name: 'Alien Red AK47', category: 'weapon', rarity: 'epic', price: 15000, image: '🔫', color: '#A855F7', description: 'Außerirdisches rotes Design' },
  { id: 'ak_military', name: 'Military Camo AK47', category: 'weapon', rarity: 'uncommon', price: 2500, image: '🔫', color: '#22C55E', description: 'Standard Militär-Tarnung' },
  
  // WEAPONS - LR-300
  { id: 'lr_whiteout', name: 'Whiteout LR-300', category: 'weapon', rarity: 'legendary', price: 22000, image: '🔫', color: '#F59E0B', description: 'Schneeweiß mit Eiseffekt' },
  { id: 'lr_industrial', name: 'Industrial LR-300', category: 'weapon', rarity: 'rare', price: 4500, image: '🔫', color: '#3B82F6', description: 'Industrielles rostiges Design' },
  { id: 'lr_digital', name: 'Digital Camo LR-300', category: 'weapon', rarity: 'uncommon', price: 2000, image: '🔫', color: '#22C55E', description: 'Digitale Camouflage' },
  
  // WEAPONS - MP5
  { id: 'mp5_nightmare', name: 'Nightmare MP5', category: 'weapon', rarity: 'epic', price: 8500, image: '🔫', color: '#A855F7', description: 'Dunkles Horror-Design' },
  { id: 'mp5_copper', name: 'Copper MP5', category: 'weapon', rarity: 'rare', price: 3500, image: '🔫', color: '#3B82F6', description: 'Kupfer-Finish' },
  { id: 'mp5_forest', name: 'Forest MP5', category: 'weapon', rarity: 'uncommon', price: 1800, image: '🔫', color: '#22C55E', description: 'Wald-Tarnung' },
  
  // WEAPONS - Thompson
  { id: 'tommy_dragon', name: 'Dragon Thompson', category: 'weapon', rarity: 'legendary', price: 18000, image: '🔫', color: '#F59E0B', description: 'Chinesischer Drache' },
  { id: 'tommy_punk', name: 'Punk Thompson', category: 'weapon', rarity: 'epic', price: 9000, image: '🔫', color: '#A855F7', description: 'Punk-Rock Style' },
  { id: 'tommy_rust', name: 'Rusty Thompson', category: 'weapon', rarity: 'common', price: 800, image: '🔫', color: '#9CA3AF', description: 'Abgenutztes rostiges Finish' },
  
  // WEAPONS - Bolt Action
  { id: 'bolt_arctic', name: 'Arctic Bolt', category: 'weapon', rarity: 'legendary', price: 30000, image: '🎯', color: '#F59E0B', description: 'Arktisches Scharfschützengewehr' },
  { id: 'bolt_poison', name: 'Poison Bolt', category: 'weapon', rarity: 'epic', price: 14000, image: '🎯', color: '#A855F7', description: 'Giftgrünes Design' },
  { id: 'bolt_hunter', name: 'Hunter Bolt', category: 'weapon', rarity: 'rare', price: 6000, image: '🎯', color: '#3B82F6', description: 'Jäger-Tarnung' },
  
  // ARMOR - Metal Chest
  { id: 'chest_heavy', name: 'Heavy Metal Plate', category: 'armor', rarity: 'epic', price: 11000, image: '🛡️', color: '#A855F7', description: 'Verstärkte Metallplatte' },
  { id: 'chest_nomad', name: 'Nomad Chest', category: 'armor', rarity: 'rare', price: 4000, image: '🛡️', color: '#3B82F6', description: 'Wüsten-Nomaden Style' },
  { id: 'chest_tribal', name: 'Tribal Chest', category: 'armor', rarity: 'uncommon', price: 1500, image: '🛡️', color: '#22C55E', description: 'Stammes-Design' },
  
  // ARMOR - Facemask
  { id: 'mask_death', name: 'Death Mask', category: 'armor', rarity: 'legendary', price: 20000, image: '👹', color: '#F59E0B', description: 'Totenkopf-Maske' },
  { id: 'mask_neon', name: 'Neon Mask', category: 'armor', rarity: 'epic', price: 8000, image: '👹', color: '#A855F7', description: 'Neon-leuchtende Maske' },
  { id: 'mask_bandana', name: 'Skull Bandana', category: 'armor', rarity: 'rare', price: 3000, image: '👹', color: '#3B82F6', description: 'Totenkopf Bandana' },
  
  // TOOLS - Hatchet
  { id: 'hatchet_bone', name: 'Bone Hatchet', category: 'tool', rarity: 'epic', price: 7000, image: '🪓', color: '#A855F7', description: 'Aus Knochen gefertigt' },
  { id: 'hatchet_salvaged', name: 'Salvaged Hatchet', category: 'tool', rarity: 'rare', price: 2500, image: '🪓', color: '#3B82F6', description: 'Zusammengebasteltes Design' },
  { id: 'hatchet_stone', name: 'Stone Hatchet', category: 'tool', rarity: 'common', price: 500, image: '🪓', color: '#9CA3AF', description: 'Primitive Steinaxt' },
  
  // TOOLS - Pickaxe
  { id: 'pick_meteor', name: 'Meteor Pick', category: 'tool', rarity: 'legendary', price: 16000, image: '⛏️', color: '#F59E0B', description: 'Aus Meteoritengestein' },
  { id: 'pick_ice', name: 'Icebreaker Pick', category: 'tool', rarity: 'epic', price: 6500, image: '⛏️', color: '#A855F7', description: 'Eisbrecherspitze' },
  { id: 'pick_miner', name: 'Miner Pick', category: 'tool', rarity: 'uncommon', price: 1200, image: '⛏️', color: '#22C55E', description: 'Klassische Bergbau-Spitzhacke' },
  
  // DOORS
  { id: 'door_armored', name: 'Dragon Door', category: 'door', rarity: 'legendary', price: 35000, image: '🚪', color: '#F59E0B', description: 'Gepanzerte Drachentür' },
  { id: 'door_vault', name: 'Vault Door', category: 'door', rarity: 'epic', price: 12000, image: '🚪', color: '#A855F7', description: 'Tresor-Tür Design' },
  { id: 'door_metal', name: 'Reinforced Door', category: 'door', rarity: 'rare', price: 4500, image: '🚪', color: '#3B82F6', description: 'Verstärkte Metalltür' },
  
  // MISC - Sleeping Bags
  { id: 'bag_luxury', name: 'Luxury Bag', category: 'misc', rarity: 'epic', price: 5000, image: '🛏️', color: '#A855F7', description: 'Luxuriöser Schlafsack' },
  { id: 'bag_military', name: 'Military Bag', category: 'misc', rarity: 'rare', price: 2000, image: '🛏️', color: '#3B82F6', description: 'Militär-Schlafsack' },
  { id: 'bag_basic', name: 'Basic Bag', category: 'misc', rarity: 'common', price: 400, image: '🛏️', color: '#9CA3AF', description: 'Einfacher Schlafsack' },
  
  // CONTRABAND - Ultra rare
  { id: 'ak_fade', name: 'Fade AK47', category: 'weapon', rarity: 'contraband', price: 150000, image: '🔫', color: '#EF4444', description: 'Extrem seltenes Fade-Muster' },
  { id: 'bolt_howl', name: 'Howl Bolt', category: 'weapon', rarity: 'contraband', price: 200000, image: '🎯', color: '#EF4444', description: 'Legendäres Wolf-Design' },
  { id: 'mask_demon', name: 'Demon Lord Mask', category: 'armor', rarity: 'contraband', price: 175000, image: '👹', color: '#EF4444', description: 'Dämonenlord-Maske' },
]

// Helper functions
export function getSkinById(id: string): RustSkin | undefined {
  return RUST_SKINS.find(s => s.id === id)
}

export function getSkinsByRarity(rarity: SkinRarity): RustSkin[] {
  return RUST_SKINS.filter(s => s.rarity === rarity)
}

export function getSkinsByCategory(category: SkinCategory): RustSkin[] {
  return RUST_SKINS.filter(s => s.category === category)
}

export function getRandomSkin(minPrice?: number, maxPrice?: number): RustSkin {
  let filtered = RUST_SKINS
  if (minPrice !== undefined) filtered = filtered.filter(s => s.price >= minPrice)
  if (maxPrice !== undefined) filtered = filtered.filter(s => s.price <= maxPrice)
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export function getRandomSkinByRarity(rarity: SkinRarity): RustSkin {
  const skins = getSkinsByRarity(rarity)
  return skins[Math.floor(Math.random() * skins.length)]
}

// Get rarity probabilities for case openings
export const CASE_RARITIES = {
  standard: {
    common: 0.50,
    uncommon: 0.30,
    rare: 0.15,
    epic: 0.04,
    legendary: 0.009,
    contraband: 0.001
  },
  premium: {
    common: 0.30,
    uncommon: 0.35,
    rare: 0.25,
    epic: 0.07,
    legendary: 0.025,
    contraband: 0.005
  },
  elite: {
    common: 0.10,
    uncommon: 0.25,
    rare: 0.40,
    epic: 0.18,
    legendary: 0.065,
    contraband: 0.005
  }
}
