// ═══════════════════════════════════════════════════════════════════════════════════════════
// 🗺️ ELDRUN MAP MONUMENTS - Vollständige Datenbank
// Map Size: 4500 | Prefabs: 113k | 40 Monuments (19 Custom + 21 Vanilla)
// ═══════════════════════════════════════════════════════════════════════════════════════════

export interface Monument {
  id: string
  name: string
  type: 'custom' | 'vanilla'
  category: 'puzzle' | 'safezone' | 'pvp' | 'loot' | 'transport' | 'habitable'
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme'
  description: string
  features: string[]
  loot: string[]
  tips: string[]
  images: string[]
  coordinates?: { x: number; y: number }
  count: number
  supportedEvents?: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// CUSTOM MONUMENTS - 19 einzigartige Eldrun-Monumente
// ═══════════════════════════════════════════════════════════════════════════════════════════

export const CUSTOM_MONUMENTS: Monument[] = [
  {
    id: 'west-coast-casino',
    name: 'West Coast Casino',
    type: 'custom',
    category: 'puzzle',
    difficulty: 'extreme',
    description: 'Ein riesiges Casino im Herzen der Stadt mit einem komplexen Puzzle-System. Das ultimative Herausforderungs-Monument!',
    features: [
      '🎰 Kompliziertes Puzzle-System',
      '🔴 Red-Herring Schalter & Sicherungskästen',
      '📹 Umschaltbare Kameras',
      '⏱️ Zeitgesteuerter Aufzug',
      '🤖 Turret-bewachter Tresorraum',
      '💎 Legendärer Vault-Loot'
    ],
    loot: ['Elite Crates', 'Military Crates', 'Casino Chips', 'Rare Skins', 'Legendary Items'],
    tips: [
      'Experimentiere mit den Schaltern - nicht alle sind echt!',
      'Der Aufzug hat ein Zeitlimit - sei schnell!',
      'Schalte die Kameras aus bevor du den Tresor angreifst',
      'Bring genug Meds für den Turret-Bereich mit'
    ],
    images: ['/images/screenshots/screenshot-0001.png', '/images/screenshots/screenshot-0002.png', '/images/screenshots/v120-001.jpg'],
    count: 1,
    supportedEvents: ['Bank Heist', 'Casino Heist']
  },
  {
    id: 'bradley-arena',
    name: 'Bradley Arena',
    type: 'custom',
    category: 'pvp',
    difficulty: 'extreme',
    description: 'Eine massive Arena, bewacht von einem patrouillierenden Bradley Tank. Nur für die Mutigsten!',
    features: [
      '🚀 Patrouillierender Bradley Tank',
      '⚔️ PvP Hot Zone',
      '🎯 Strategische Deckungspunkte',
      '💀 High-Risk, High-Reward',
      '🏆 Elite-Loot im Zentrum'
    ],
    loot: ['Bradley Crate', 'Elite Military Gear', 'Rockets', 'C4', 'Explosives'],
    tips: [
      'Beobachte die Bradley-Route bevor du angreifst',
      'Team-Koordination ist essentiell',
      'Nutze die Deckungen strategisch',
      'Bring Anti-Tank-Waffen mit'
    ],
    images: ['/images/screenshots/screenshot-0003.png', '/images/screenshots/screenshot-0004.png', '/images/screenshots/v120-002.jpg'],
    count: 1,
    supportedEvents: ['BetterNpc', 'Drone Event']
  },
  {
    id: 'skytrain-station',
    name: 'Skytrain Station',
    type: 'custom',
    category: 'transport',
    difficulty: 'easy',
    description: 'Hochmoderne Skytrain-Stationen verteilt über die gesamte Map. Spawn-Punkte für Zugwaggons.',
    features: [
      '🚂 Zugwaggon Spawn-Punkte',
      '🗺️ Strategische Positionen',
      '🔄 Schnelle Map-Traversierung',
      '📦 Basis-Loot verfügbar',
      '🏠 Sichere Rastplätze'
    ],
    loot: ['Basic Crates', 'Food', 'Components', 'Fuel'],
    tips: [
      'Nutze die Stationen für schnelle Map-Bewegung',
      'Guter Ausgangspunkt für neue Spieler',
      'Verbindet alle wichtigen Gebiete'
    ],
    images: ['/images/screenshots/screenshot-0005.png', '/images/screenshots/screenshot-0006.png', '/images/screenshots/v120-003.jpg'],
    count: 6
  },
  {
    id: 'abandoned-apartments',
    name: 'Abandoned Apartments',
    type: 'custom',
    category: 'loot',
    difficulty: 'medium',
    description: 'Vertikales Monument mit durchsuchbaren Wohneinheiten. Erkunde jede Etage für versteckte Schätze!',
    features: [
      '🏢 Mehrstöckiges Gebäude',
      '🚪 Durchsuchbare Apartments',
      '📦 Versteckter Loot in jeder Einheit',
      '🔦 Dunkle Korridore',
      '⬆️ Vertikales Gameplay'
    ],
    loot: ['Residential Loot', 'Components', 'Food', 'Medical Supplies', 'Hidden Stashes'],
    tips: [
      'Durchsuche JEDE Wohnung - versteckter Loot überall',
      'Obere Etagen haben besseren Loot',
      'Vorsicht vor anderen Spielern in den Korridoren'
    ],
    images: ['/images/screenshots/screenshot-0007.png', '/images/screenshots/screenshot-0008.png', '/images/screenshots/v120-004.jpg'],
    count: 2
  },
  {
    id: 'diner',
    name: 'Diner',
    type: 'custom',
    category: 'loot',
    difficulty: 'easy',
    description: 'Kleine, zugängliche Monumente ähnlich der Oxum Tankstelle. Perfekt für Anfänger!',
    features: [
      '🍔 Essbereich mit Loot',
      '🚽 Durchsuchbare Toiletten',
      '📋 Büro mit Dokumenten',
      '👨‍🍳 Küche mit Vorräten',
      '⛽ Einfacher Zugang'
    ],
    loot: ['Food Crates', 'Basic Components', 'Medical Supplies', 'Scrap'],
    tips: [
      'Perfekt für den Start - einfach zu looten',
      'Vergiss nicht die Küche zu durchsuchen',
      'Guter Farm-Spot für Scrap'
    ],
    images: ['/images/screenshots/screenshot-0009.png', '/images/screenshots/screenshot-0010.png', '/images/screenshots/v120-005.jpg'],
    count: 4
  },
  {
    id: 'nodedust-park',
    name: 'Nodedust Park',
    type: 'custom',
    category: 'habitable',
    difficulty: 'easy',
    description: 'Ein verlassener Park mit ausgetrocknetem Fluss und toten Kiefern. Bebaubar!',
    features: [
      '🌳 Verlassener Park',
      '💀 Ausgetrockneter Fluss',
      '🏕️ BEBAUBAR - Base bauen möglich!',
      '🪨 Ressourcen-Nodes in der Nähe',
      '🌲 Tote Vegetation'
    ],
    loot: ['Basic Loot', 'Natural Resources', 'Wood', 'Stone'],
    tips: [
      'Ideal für eine versteckte Base!',
      'Ressourcen-Nodes spawnen regelmäßig',
      'Strategisch gute Position'
    ],
    images: ['/images/screenshots/screenshot-0011.png', '/images/screenshots/screenshot-0012.png', '/images/screenshots/v120-006.jpg'],
    count: 1
  },
  {
    id: 'oil-swamps',
    name: 'Oil Swamps',
    type: 'custom',
    category: 'habitable',
    difficulty: 'medium',
    description: 'Versunkenes Sumpfland gefüllt mit Öl einer kollabierten Fabrik. Bebaubar!',
    features: [
      '🛢️ Öl-gefülltes Sumpfland',
      '🏭 Kollabierte Fabrik-Ruinen',
      '🏕️ BEBAUBAR - Base bauen möglich!',
      '⚠️ Gefährliches Terrain',
      '💰 Crude Oil Spots'
    ],
    loot: ['Crude Oil', 'Industrial Components', 'Scrap', 'Metal Fragments'],
    tips: [
      'Perfekt für Öl-Farming',
      'Versteckte Base-Spots im Sumpf',
      'Vorsicht vor dem Terrain'
    ],
    images: ['/images/screenshots/screenshot-0013.png', '/images/screenshots/screenshot-0014.png', '/images/screenshots/v120-007.jpg'],
    count: 1
  },
  {
    id: 'custom-lighthouse',
    name: 'Custom Abandoned Lighthouse',
    type: 'custom',
    category: 'loot',
    difficulty: 'medium',
    description: 'Leuchtturm auf einer hohen Klippe mit verlassenen Behausungen. Atemberaubende Aussicht!',
    features: [
      '🗼 Hohe Klippen-Position',
      '🏠 Verlassene Wohnungen',
      '🔭 360° Panorama-Aussicht',
      '📦 Versteckter Loot',
      '⚓ Küstennahe Lage'
    ],
    loot: ['Lighthouse Crate', 'Binoculars', 'Flares', 'Components'],
    tips: [
      'Perfekt für Sniping-Positionen',
      'Durchsuche alle Behausungen',
      'Gute Übersicht über das Gebiet'
    ],
    images: ['/images/screenshots/screenshot-0015.png', '/images/screenshots/screenshot-0016.png', '/images/screenshots/v120-008.jpg'],
    count: 2
  },
  {
    id: 'art-gallery',
    name: 'Art Gallery',
    type: 'custom',
    category: 'safezone',
    difficulty: 'easy',
    description: 'Eine Safe Zone für Künstler zum Malen - mit Security! Friedlicher Treffpunkt.',
    features: [
      '🎨 SAFE ZONE - Kein PvP!',
      '🖼️ Kunst-Ausstellung',
      '👮 Security-Personal',
      '🖌️ Mal-Stationen',
      '🤝 Sozialer Treffpunkt'
    ],
    loot: ['Art Supplies', 'Canvas', 'Paint', 'Decorations'],
    tips: [
      'Perfekt zum Entspannen',
      'Triff andere Spieler friedlich',
      'Male deine eigenen Kunstwerke'
    ],
    images: ['/images/screenshots/screenshot-0017.png', '/images/screenshots/screenshot-0018.png', '/images/screenshots/v120-009.jpg'],
    count: 1
  },
  {
    id: 'skatepark',
    name: 'Skatepark',
    type: 'custom',
    category: 'safezone',
    difficulty: 'easy',
    description: 'Eine Safe Zone für Spieler zum Abhängen und die neuen Bikes zu fahren!',
    features: [
      '🛹 SAFE ZONE - Kein PvP!',
      '🚲 Bike-Strecken',
      '🎮 Hangout-Bereich',
      '🏆 Trick-Spots',
      '👥 Sozialer Hub'
    ],
    loot: ['Bikes', 'Sports Equipment', 'Fun Items'],
    tips: [
      'Teste die neuen Bikes!',
      'Perfekt zum Chillen',
      'Community-Treffpunkt'
    ],
    images: ['/images/screenshots/screenshot-0019.png', '/images/screenshots/screenshot-0020.png', '/images/screenshots/v120-010.jpg'],
    count: 1
  },
  {
    id: 'mini-mall',
    name: 'Mini-Mall',
    type: 'custom',
    category: 'loot',
    difficulty: 'medium',
    description: 'Besteht aus 1 Supermarkt und 3 weiteren Geschäften mit Loot.',
    features: [
      '🏬 Supermarkt',
      '🏪 3 zusätzliche Läden',
      '📦 Vielfältiger Loot',
      '🛒 Shopping-Atmosphäre',
      '💰 Guter Scrap-Farm-Spot'
    ],
    loot: ['Food', 'Components', 'Medical Supplies', 'Clothing', 'Scrap'],
    tips: [
      'Durchsuche alle 4 Geschäfte',
      'Guter Anfänger-Spot',
      'Regelmäßig Loot respawn'
    ],
    images: ['/images/screenshots/screenshot-0021.png', '/images/screenshots/screenshot-0022.png', '/images/screenshots/v120-011.jpg'],
    count: 1
  },
  {
    id: 'roadside-fruitstand',
    name: 'Roadside Fruitstand',
    type: 'custom',
    category: 'loot',
    difficulty: 'easy',
    description: 'Mikro-Monument außerhalb vom Junkyard mit wenig Loot.',
    features: [
      '🍎 Frucht-Stand',
      '🛣️ Straßenrand-Position',
      '📦 Schneller Loot',
      '🚗 Drive-by möglich'
    ],
    loot: ['Food', 'Seeds', 'Basic Items'],
    tips: [
      'Schnell looten und weiter',
      'Gut für unterwegs',
      'Nahe Junkyard'
    ],
    images: ['/images/screenshots/screenshot-0023.png', '/images/screenshots/v120-012.jpg'],
    count: 1
  },
  {
    id: 'bus-depot',
    name: 'Bus Depot',
    type: 'custom',
    category: 'loot',
    difficulty: 'medium',
    description: 'Ein Green Card Monument nahe dem südwestlichen Hafen und Skytrain.',
    features: [
      '🚌 Bus-Station',
      '💳 GREEN CARD benötigt',
      '🔐 Puzzle-Bereich',
      '📦 Guter Loot',
      '🚂 Nahe Skytrain'
    ],
    loot: ['Green Card Loot', 'Components', 'Weapons', 'Armor'],
    tips: [
      'Bring eine Green Card mit!',
      'Verbinde mit Skytrain-Route',
      'Mittelhoher Schwierigkeitsgrad'
    ],
    images: ['/images/screenshots/screenshot-0024.png', '/images/screenshots/screenshot-0025.png', '/images/screenshots/v120-014.jpg'],
    count: 1
  }
]

// ═══════════════════════════════════════════════════════════════════════════════════════════
// VANILLA MONUMENTS - 21 Facepunch-Standard-Monumente
// ═══════════════════════════════════════════════════════════════════════════════════════════

export const VANILLA_MONUMENTS: Monument[] = [
  {
    id: 'oxums-gas-station',
    name: "Oxum's Gas Station",
    type: 'vanilla',
    category: 'loot',
    difficulty: 'easy',
    description: 'Klassische Tankstelle mit Basis-Loot. Perfekt für Anfänger!',
    features: ['⛽ Tankstelle', '📦 Basis-Loot', '🔧 Recycler verfügbar'],
    loot: ['Basic Crates', 'Fuel', 'Components'],
    tips: ['Recycler nutzen!', 'Guter Starter-Spot'],
    images: ['/images/screenshots/screenshot-0026.png', '/images/screenshots/v120-015.jpg'],
    count: 4
  },
  {
    id: 'abandoned-supermarket',
    name: 'Abandoned Supermarket',
    type: 'vanilla',
    category: 'loot',
    difficulty: 'easy',
    description: 'Verlassener Supermarkt mit Food und Components.',
    features: ['🏬 Supermarkt', '🍎 Food-Loot', '🔧 Recycler'],
    loot: ['Food', 'Components', 'Medical'],
    tips: ['Alle Regale durchsuchen!'],
    images: ['/images/screenshots/screenshot-0027.png', '/images/screenshots/v120-016.jpg'],
    count: 4
  },
  {
    id: 'bandit-camp',
    name: 'Bandit Camp',
    type: 'vanilla',
    category: 'safezone',
    difficulty: 'easy',
    description: 'Safe Zone mit Gambling, Shop und sozialen Features.',
    features: ['🎰 Casino', '🏪 Shop', '🤝 Safe Zone', '💰 Gambling'],
    loot: ['Shop Items', 'Gambling Rewards'],
    tips: ['Kein PvP möglich', 'Nutze den Shop'],
    images: ['/images/screenshots/screenshot-0028.png', '/images/screenshots/v120-017.jpg'],
    count: 1
  },
  {
    id: 'outpost',
    name: 'Outpost',
    type: 'vanilla',
    category: 'safezone',
    difficulty: 'easy',
    description: 'Sichere Zone mit Shops, Recycler und mehr.',
    features: ['🏪 Shops', '🔧 Recycler', '🤝 Safe Zone', '🛠️ Workbenches'],
    loot: ['Shop Items', 'Recycled Materials'],
    tips: ['24/7 sicher nutzbar', 'Beste Recycler-Position'],
    images: ['/images/screenshots/v120-018.jpg'],
    count: 1
  },
  {
    id: 'power-plant',
    name: 'Power Plant',
    type: 'vanilla',
    category: 'puzzle',
    difficulty: 'hard',
    description: 'Großes Monument mit Green/Blue Card Puzzle.',
    features: ['⚡ Kraftwerk', '💳 Karten-Puzzle', '🔫 Schwere Gegner', '📦 Elite-Loot'],
    loot: ['Elite Crates', 'Military', 'Weapons'],
    tips: ['Bring alle Karten mit!', 'Schwieriges Puzzle'],
    images: ['/images/screenshots/v120-019.jpg'],
    count: 1
  },
  {
    id: 'water-treatment',
    name: 'Water Treatment Plant',
    type: 'vanilla',
    category: 'puzzle',
    difficulty: 'hard',
    description: 'Wasseraufbereitungsanlage mit Puzzle und gutem Loot.',
    features: ['💧 Wasserwerk', '💳 Karten-Puzzle', '📦 Guter Loot'],
    loot: ['Military Crates', 'Components', 'Weapons'],
    tips: ['Blue Card benötigt', 'Viel Deckung nutzen'],
    images: ['/images/screenshots/v120-020.jpg'],
    count: 1
  },
  {
    id: 'train-yard',
    name: 'Train Yard',
    type: 'vanilla',
    category: 'loot',
    difficulty: 'medium',
    description: 'Großer Rangierbahnhof mit vielen Loot-Spots.',
    features: ['🚂 Rangierbahnhof', '📦 Viele Crates', '🔧 Recycler'],
    loot: ['Military', 'Components', 'Scrap'],
    tips: ['Durchsuche alle Waggons!'],
    images: ['/images/screenshots/v120-021.jpg'],
    count: 1
  },
  {
    id: 'large-oil-rig',
    name: 'Large Oil Rig',
    type: 'vanilla',
    category: 'pvp',
    difficulty: 'extreme',
    description: 'Größte Offshore-Plattform mit dem besten Loot im Spiel.',
    features: ['🛢️ Ölplattform', '⚔️ Heavy Scientists', '📦 Elite-Loot', '🚁 Helikopter-Event'],
    loot: ['Elite Crates', 'Locked Crate', 'Military Gear'],
    tips: ['Großes Team empfohlen', 'Beste Waffen nötig'],
    images: ['/images/screenshots/v120-022.jpg'],
    count: 1
  },
  {
    id: 'small-oil-rig',
    name: 'Small Oil Rig',
    type: 'vanilla',
    category: 'pvp',
    difficulty: 'hard',
    description: 'Kleinere Offshore-Plattform mit gutem Loot.',
    features: ['🛢️ Kleine Plattform', '⚔️ Scientists', '📦 Guter Loot'],
    loot: ['Military Crates', 'Locked Crate', 'Weapons'],
    tips: ['Solo/Duo machbar', 'Boot benötigt'],
    images: ['/images/screenshots/monument-01.png'],
    count: 1
  },
  {
    id: 'harbor',
    name: 'Harbor',
    type: 'vanilla',
    category: 'loot',
    difficulty: 'medium',
    description: 'Hafen mit diversen Loot-Spots und Puzzle.',
    features: ['⚓ Hafen', '🚢 Schiffe', '📦 Diverse Crates'],
    loot: ['Military', 'Components', 'Diving Gear'],
    tips: ['Unterwasser-Loot checken!'],
    images: ['/images/screenshots/monument-02.png'],
    count: 2
  },
  {
    id: 'arctic-research-base',
    name: 'Arctic Research Base',
    type: 'vanilla',
    category: 'puzzle',
    difficulty: 'hard',
    description: 'Forschungsbasis in der Arktis mit Kälte-Mechanik.',
    features: ['❄️ Arktis-Lage', '🥶 Kälte-Effekt', '💳 Puzzle', '📦 Elite-Loot'],
    loot: ['Elite Crates', 'Arctic Gear', 'Weapons'],
    tips: ['Warme Kleidung anziehen!', 'Feuer mitnehmen'],
    images: ['/images/screenshots/monument-03.png'],
    count: 1
  },
  {
    id: 'satellite-dish',
    name: 'Satellite Dish',
    type: 'vanilla',
    category: 'loot',
    difficulty: 'medium',
    description: 'Satelliten-Anlage mit Green Card Puzzle.',
    features: ['📡 Satellit', '💳 Green Card', '📦 Guter Loot'],
    loot: ['Military Crates', 'Components', 'Tech'],
    tips: ['Green Card mitbringen!'],
    images: ['/images/screenshots/monument-04.png'],
    count: 1
  },
  {
    id: 'junkyard',
    name: 'Junkyard',
    type: 'vanilla',
    category: 'loot',
    difficulty: 'easy',
    description: 'Schrottplatz mit vielen Komponenten.',
    features: ['♻️ Schrottplatz', '🔧 Komponenten', '📦 Scrap-Farm'],
    loot: ['Components', 'Scrap', 'Basic Items'],
    tips: ['Beste Scrap-Farm!'],
    images: ['/images/screenshots/Sequence01.00_00_13_.png'],
    count: 1
  },
  {
    id: 'fishing-village',
    name: 'Fishing Village',
    type: 'vanilla',
    category: 'safezone',
    difficulty: 'easy',
    description: 'Kleines Fischerdorf als Safe Zone.',
    features: ['🎣 Fischerei', '🤝 Safe Zone', '🚤 Boote'],
    loot: ['Fishing Gear', 'Boats', 'Food'],
    tips: ['Boote kaufen!'],
    images: ['/images/screenshots/Sequence01.00_00_25_.png'],
    count: 3
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse',
    type: 'vanilla',
    category: 'loot',
    difficulty: 'easy',
    description: 'Klassischer Leuchtturm mit Basis-Loot.',
    features: ['🗼 Leuchtturm', '📦 Basis-Loot', '🔭 Aussicht'],
    loot: ['Basic Crates', 'Components'],
    tips: ['Gute Übersicht!'],
    images: ['/images/screenshots/Sequence01.00_00_34_.png'],
    count: 2
  },
  {
    id: 'ranch',
    name: 'Ranch',
    type: 'vanilla',
    category: 'loot',
    difficulty: 'easy',
    description: 'Farm mit Tieren und Basis-Loot.',
    features: ['🏠 Farm', '🐴 Pferde', '🌾 Landwirtschaft'],
    loot: ['Food', 'Horses', 'Farm Tools'],
    tips: ['Pferde zähmen!'],
    images: ['/images/screenshots/v120-001.jpg'],
    count: 1
  },
  {
    id: 'large-barn',
    name: 'Large Barn',
    type: 'vanilla',
    category: 'loot',
    difficulty: 'easy',
    description: 'Große Scheune mit Farm-Loot.',
    features: ['🏚️ Scheune', '🐄 Tiere', '📦 Farm-Loot'],
    loot: ['Food', 'Seeds', 'Tools'],
    tips: ['Tiere spawnen hier!'],
    images: ['/images/screenshots/v120-002.jpg'],
    count: 2
  },
  {
    id: 'train-tunnel',
    name: 'Train Tunnel',
    type: 'vanilla',
    category: 'transport',
    difficulty: 'medium',
    description: 'Unterirdische Tunnel für Züge mit Loot.',
    features: ['🚇 Untergrund', '🚂 Zug-Route', '📦 Tunnel-Loot'],
    loot: ['Components', 'Scrap', 'Diesel'],
    tips: ['Züge fahren hier durch!'],
    images: ['/images/screenshots/v120-003.jpg'],
    count: 13
  }
]

// ═══════════════════════════════════════════════════════════════════════════════════════════
// MAP STATS
// ═══════════════════════════════════════════════════════════════════════════════════════════

export const MAP_STATS = {
  size: 4500,
  prefabCount: 113840,
  buildableArea: 40.5,
  totalMonuments: 40,
  customMonuments: 19,
  vanillaMonuments: 21,
  islands: 4,
  rivers: 3,
  railroads: 63,
  caves: 2,
  lakes: 1,
  buildableRocks: 3,
  biomes: {
    jungle: 33.3,
    arid: 26.7,
    arctic: 20.0,
    temperate: 10.0,
    tundra: 10.0,
    ocean: 48.6
  },
  supportedPlugins: ['Bank Heist', 'BetterNpc', 'Drone Event']
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// COMBINED EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════

export const ALL_MONUMENTS = [...CUSTOM_MONUMENTS, ...VANILLA_MONUMENTS]

export function getMonumentById(id: string): Monument | undefined {
  return ALL_MONUMENTS.find(m => m.id === id)
}

export function getMonumentsByType(type: 'custom' | 'vanilla'): Monument[] {
  return ALL_MONUMENTS.filter(m => m.type === type)
}

export function getMonumentsByDifficulty(difficulty: Monument['difficulty']): Monument[] {
  return ALL_MONUMENTS.filter(m => m.difficulty === difficulty)
}

export function getMonumentsByCategory(category: Monument['category']): Monument[] {
  return ALL_MONUMENTS.filter(m => m.category === category)
}
