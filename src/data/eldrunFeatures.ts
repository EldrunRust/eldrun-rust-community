// ═══════════════════════════════════════════════════════════════════════════
// 🏰 ELDRUN - REALM OF ICE AND FIRE 🏰
// Game of Thrones inspired MMORPG Rust Server Features
// Extracted from 65 Oxide Plugins
// ═══════════════════════════════════════════════════════════════════════════

export interface Faction {
  id: string
  name: string
  fullName: string
  sigil: string
  color: string
  motto: string
  description: string
  territory: string
  bonuses: string[]
  lore: string
}

export interface PlayerClass {
  id: string
  name: string
  icon: string
  color: string
  description: string
  bonuses: { stat: string; value: string }[]
  skills: string[]
  playstyle: string
}

export interface GuildPerk {
  id: string
  name: string
  icon: string
  description: string
  maxLevel: number
  effect: string
}

export interface CastleUpgrade {
  id: string
  name: string
  icon: string
  description: string
  maxLevel: number
  benefits: string[]
}

export interface Quest {
  id: string
  name: string
  type: string
  description: string
  rewards: string[]
}

export interface Skill {
  id: string
  name: string
  icon: string
  category: string
  description: string
  maxLevel: number
}

// ═══════════════════════════════════════════════════════════════════════════
// 👑 THE TWO GREAT HOUSES - SERAPHAR VS VORGAROTH
// ═══════════════════════════════════════════════════════════════════════════

export const FACTIONS: Faction[] = [
  {
    id: 'seraphar',
    name: 'SERAPHAR',
    fullName: 'House Seraphar - The Golden Dawn',
    sigil: '☀️',
    color: '#D4AF37',
    motto: 'In Light, We Conquer',
    description: 'Die edle Allianz des Lichts. Verteidiger der alten Ordnung und Hüter heiliger Artefakte.',
    territory: 'Die Goldenen Hallen im Norden',
    bonuses: [
      '+10% Heilung & Regeneration',
      '+15% Verteidigungsbonus in eigenen Gebieten',
      'Zugang zu heiligen Waffen',
      'Exklusive Paladin-Rüstungen'
    ],
    lore: 'Seit Anbeginn der Zeit wacht Haus Seraphar über die heiligen Länder von Eldrun. Ihre Krieger sind bekannt für ihre unerschütterliche Ehre und ihre leuchtenden Rüstungen, die im Kampf wie die Sonne selbst strahlen. Man sagt, die ersten Seraphar seien von den Göttern selbst gesegnet worden.'
  },
  {
    id: 'vorgaroth',
    name: 'VORGAROTH',
    fullName: 'House Vorgaroth - The Shadow Legion',
    sigil: '🌑',
    color: '#8B0000',
    motto: 'From Darkness, Power',
    description: 'Die mächtige Legion der Schatten. Meister der dunklen Künste und unbarmherzige Eroberer.',
    territory: 'Die Schwarzen Festungen im Süden',
    bonuses: [
      '+15% Schaden bei Nacht',
      '+20% Raid-Geschwindigkeit',
      'Zugang zu verbotener Magie',
      'Exklusive Nekromanten-Artefakte'
    ],
    lore: 'Aus den Tiefen der Finsternis erhoben sich die Vorgaroth, Meister der verbotenen Künste. Ihre Nekromanten können die Toten erwecken, und ihre Assassinen bewegen sich unsichtbar durch die Schatten. Sie glauben, dass wahre Macht nur durch Dunkelheit erlangt werden kann.'
  }
]

// ═══════════════════════════════════════════════════════════════════════════
// ⚔️ THE SIX CLASSES - PATHS OF DESTINY
// ═══════════════════════════════════════════════════════════════════════════

export const PLAYER_CLASSES: PlayerClass[] = [
  {
    id: 'warrior',
    name: 'Krieger',
    icon: '⚔️',
    color: '#CD7F32',
    description: 'Meister des Nahkampfs. Unaufhaltsam auf dem Schlachtfeld.',
    bonuses: [
      { stat: 'Gesundheit', value: '+20%' },
      { stat: 'Nahkampf-Schaden', value: '+15%' },
      { stat: 'Rüstung', value: '+10%' }
    ],
    skills: ['Berserker-Rage', 'Schildwall', 'Kriegsschrei', 'Wirbelwind-Angriff'],
    playstyle: 'Front-Kämpfer, der den Feind direkt angreift und massive Schäden verursacht.'
  },
  {
    id: 'archer',
    name: 'Bogenschütze',
    icon: '🏹',
    color: '#228B22',
    description: 'Tödlich aus der Distanz. Kein Ziel entkommt ihren Pfeilen.',
    bonuses: [
      { stat: 'Bogen-Schaden', value: '+25%' },
      { stat: 'Bewegung', value: '+10%' },
      { stat: 'Kritische Treffer', value: '+15%' }
    ],
    skills: ['Präzisionsschuss', 'Giftpfeile', 'Schnellfeuer', 'Unsichtbarkeit'],
    playstyle: 'Distanz-Kämpfer, der Feinde aus sicherer Entfernung eliminiert.'
  },
  {
    id: 'mage',
    name: 'Magier',
    icon: '🔮',
    color: '#9400D3',
    description: 'Wielder arkaner Mächte. Beherrscher der Elemente.',
    bonuses: [
      { stat: 'Werkzeug-Effizienz', value: '+30%' },
      { stat: 'Strahlungsresistenz', value: '+50%' },
      { stat: 'Mana-Regeneration', value: '+25%' }
    ],
    skills: ['Feuerball', 'Frostschild', 'Blitzkette', 'Teleportation'],
    playstyle: 'Vielseitiger Zauberer mit mächtigen AoE-Fähigkeiten.'
  },
  {
    id: 'rogue',
    name: 'Schurke',
    icon: '🗡️',
    color: '#2F4F4F',
    description: 'Meister der Schatten. Tödlich und unsichtbar.',
    bonuses: [
      { stat: 'Tarnung', value: '+40%' },
      { stat: 'Schlösser knacken', value: '+100%' },
      { stat: 'Hinterhalt-Schaden', value: '+35%' }
    ],
    skills: ['Schattenschritt', 'Giftklinge', 'Meucheln', 'Rauchbombe'],
    playstyle: 'Assassine, der aus dem Verborgenen zuschlägt.'
  },
  {
    id: 'paladin',
    name: 'Paladin',
    icon: '🛡️',
    color: '#FFD700',
    description: 'Heiliger Krieger des Lichts. Beschützer und Heiler.',
    bonuses: [
      { stat: 'Heilung', value: '+50%' },
      { stat: 'Rüstungs-Effektivität', value: '+20%' },
      { stat: 'Heilige Schäden', value: '+25%' }
    ],
    skills: ['Heiliges Licht', 'Göttlicher Schild', 'Vergeltung', 'Auferstehung'],
    playstyle: 'Tank und Heiler, der Verbündete beschützt und heilt.'
  },
  {
    id: 'necromancer',
    name: 'Nekromant',
    icon: '💀',
    color: '#4B0082',
    description: 'Beherrscher des Todes. Gebieter über untote Armeen.',
    bonuses: [
      { stat: 'Begleiter-Schaden', value: '+30%' },
      { stat: 'Dunkle Magie', value: '+40%' },
      { stat: 'Lebensraub', value: '+20%' }
    ],
    skills: ['Skelett-Beschwörung', 'Seelenentzug', 'Todesfluch', 'Untoten-Armee'],
    playstyle: 'Beschwörer, der untote Diener kontrolliert.'
  }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🏰 GUILD SYSTEM - BROTHERHOOD OF ARMS
// ═══════════════════════════════════════════════════════════════════════════

export const GUILD_PERKS: GuildPerk[] = [
  {
    id: 'crafting_speed',
    name: 'Schnellschmiede',
    icon: '🔨',
    description: '+10% Crafting-Geschwindigkeit pro Level',
    maxLevel: 5,
    effect: 'Alle Gilden-Mitglieder craften schneller'
  },
  {
    id: 'gather_boost',
    name: 'Erntesegen',
    icon: '⛏️',
    description: '+5% Ressourcen-Ertrag pro Level',
    maxLevel: 5,
    effect: 'Mehr Ressourcen beim Farmen'
  },
  {
    id: 'combat_damage',
    name: 'Kriegsfuror',
    icon: '💪',
    description: '+3% Schaden pro Level',
    maxLevel: 5,
    effect: 'Erhöhter Schaden im Kampf'
  },
  {
    id: 'defense_buff',
    name: 'Eisenhaut',
    icon: '🛡️',
    description: '-3% erlittener Schaden pro Level',
    maxLevel: 5,
    effect: 'Reduziert eingehenden Schaden'
  },
  {
    id: 'scrap_bonus',
    name: 'Plündererglück',
    icon: '💰',
    description: '+10% Scrap von Kills pro Level',
    maxLevel: 3,
    effect: 'Mehr Beute von besiegten Feinden'
  }
]

export const GUILD_ACHIEVEMENTS = [
  { id: 'first_blood', name: 'Erstes Blut', icon: '🩸', requirement: '1 Kill', reward: '20 🛡️' },
  { id: 'killer_guild', name: 'Mördergilde', icon: '⚔️', requirement: '100 Kills', reward: '100 🛡️' },
  { id: 'legendary_guild', name: 'Legendäre Gilde', icon: '👑', requirement: '1000 Kills', reward: '400 🛡️' },
  { id: 'rich_guild', name: 'Reiche Gilde', icon: '💎', requirement: '100.000 Scrap', reward: '200 🛡️' },
  { id: 'max_level', name: 'Maximum Level', icon: '🌟', requirement: 'Level 50', reward: '1000 🛡️' },
  { id: 'full_house', name: 'Volles Haus', icon: '🏠', requirement: '20 Mitglieder', reward: '300 🛡️' },
  { id: 'diplomat', name: 'Diplomat', icon: '🤝', requirement: '5 Allianzen', reward: '160 🛡️' },
  { id: 'warmonger', name: 'Kriegstreiber', icon: '⚔️', requirement: '10 Kriege', reward: '240 🛡️' }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🏯 CASTLE SYSTEM - FORTRESSES OF POWER
// ═══════════════════════════════════════════════════════════════════════════

export const CASTLE_UPGRADES: CastleUpgrade[] = [
  { id: 'main_hall', name: 'Große Halle', icon: '🏛️', description: 'Das Herz der Burg', maxLevel: 10, benefits: ['Mehr Lagerplatz', 'Schnellere Produktion'] },
  { id: 'walls', name: 'Festungsmauern', icon: '🧱', description: 'Unüberwindbare Verteidigung', maxLevel: 10, benefits: ['Erhöhte HP', 'Raid-Schutz'] },
  { id: 'towers', name: 'Wachtürme', icon: '🗼', description: 'Augen über dem Land', maxLevel: 10, benefits: ['Weitere Sicht', 'Automatische Verteidigung'] },
  { id: 'gates', name: 'Burgtor', icon: '🚪', description: 'Kontrollierter Zugang', maxLevel: 10, benefits: ['Verstärkte Eingänge', 'Fallgitter'] },
  { id: 'barracks', name: 'Kaserne', icon: '⚔️', description: 'Ausbildung der Truppen', maxLevel: 10, benefits: ['Mehr Wachen', 'Stärkere Einheiten'] },
  { id: 'armory', name: 'Waffenkammer', icon: '🗡️', description: 'Arsenal des Krieges', maxLevel: 10, benefits: ['Bessere Waffen', 'Mehr Munition'] },
  { id: 'treasury', name: 'Schatzkammer', icon: '💰', description: 'Reichtum des Reiches', maxLevel: 10, benefits: ['Mehr Gold-Kapazität', 'Zinsen'] },
  { id: 'stables', name: 'Stallungen', icon: '🐴', description: 'Für die Kavallerie', maxLevel: 10, benefits: ['Schnellere Pferde', 'Mehr Reittiere'] },
  { id: 'workshop', name: 'Werkstatt', icon: '🔧', description: 'Erfindungen und Belagerung', maxLevel: 10, benefits: ['Siege-Waffen', 'Reparatur-Bonus'] },
  { id: 'library', name: 'Bibliothek', icon: '📚', description: 'Wissen ist Macht', maxLevel: 10, benefits: ['XP-Bonus', 'Neue Rezepte'] },
  { id: 'temple', name: 'Tempel', icon: '⛪', description: 'Göttlicher Segen', maxLevel: 10, benefits: ['Heilung', 'Buffs'] },
  { id: 'market', name: 'Marktplatz', icon: '🏪', description: 'Handel und Wohlstand', maxLevel: 10, benefits: ['Bessere Preise', 'Seltene Items'] }
]

export const DEFENSE_TYPES = [
  { id: 'turret', name: 'Auto-Turret', icon: '🔫', description: 'Automatische Verteidigung' },
  { id: 'ballista', name: 'Balliste', icon: '🏹', description: 'Schwere Geschütze' },
  { id: 'catapult', name: 'Katapult', icon: '🪨', description: 'Flächenschaden' },
  { id: 'arrow_trap', name: 'Pfeilfalle', icon: '➡️', description: 'Versteckte Gefahr' },
  { id: 'spike_trap', name: 'Stachelfalle', icon: '📍', description: 'Schmerzhafte Überraschung' },
  { id: 'fire_trap', name: 'Feuerfalle', icon: '🔥', description: 'Brennende Hölle' },
  { id: 'guards', name: 'Wachen', icon: '💂', description: 'Loyal bis zum Tod' },
  { id: 'moat', name: 'Burggraben', icon: '🌊', description: 'Natürliche Barriere' },
  { id: 'drawbridge', name: 'Zugbrücke', icon: '🌉', description: 'Kontrollierter Zugang' }
]

export const SIEGE_WEAPONS = [
  { id: 'battering_ram', name: 'Rammbock', icon: '🪵', description: 'Tore zertrümmern' },
  { id: 'siege_tower', name: 'Belagerungsturm', icon: '🗼', description: 'Mauern überwinden' },
  { id: 'trebuchet', name: 'Trebuchet', icon: '⚙️', description: 'Massive Zerstörung' },
  { id: 'siege_ladder', name: 'Sturmleiter', icon: '🪜', description: 'Schneller Aufstieg' }
]

// ═══════════════════════════════════════════════════════════════════════════
// 📜 SKILL SYSTEM - PATHS OF MASTERY
// ═══════════════════════════════════════════════════════════════════════════

export const SKILL_CATEGORIES = [
  {
    id: 'combat',
    name: 'Kampf',
    icon: '⚔️',
    color: '#DC143C',
    skills: [
      { id: 'combat', name: 'Kampf', icon: '⚔️', description: 'Allgemeine Kampffähigkeiten' },
      { id: 'archery', name: 'Bogenschießen', icon: '🏹', description: 'Distanzwaffen-Meisterschaft' },
      { id: 'defense', name: 'Verteidigung', icon: '🛡️', description: 'Schadensreduktion' }
    ]
  },
  {
    id: 'gathering',
    name: 'Sammeln',
    icon: '⛏️',
    color: '#8B4513',
    skills: [
      { id: 'mining', name: 'Bergbau', icon: '⛏️', description: 'Erze und Steine' },
      { id: 'woodcutting', name: 'Holzfällen', icon: '🪓', description: 'Bäume fällen' },
      { id: 'skinning', name: 'Häuten', icon: '🦌', description: 'Tierhäute gewinnen' }
    ]
  },
  {
    id: 'crafting',
    name: 'Handwerk',
    icon: '🔨',
    color: '#CD853F',
    skills: [
      { id: 'crafting', name: 'Schmieden', icon: '🔨', description: 'Waffen und Rüstungen' },
      { id: 'cooking', name: 'Kochen', icon: '🍳', description: 'Nahrung zubereiten' },
      { id: 'medicine', name: 'Medizin', icon: '💊', description: 'Heilmittel herstellen' }
    ]
  },
  {
    id: 'building',
    name: 'Bauen',
    icon: '🏗️',
    color: '#708090',
    skills: [
      { id: 'building', name: 'Architektur', icon: '🏗️', description: 'Strukturen errichten' },
      { id: 'electrical', name: 'Elektrik', icon: '⚡', description: 'Stromversorgung' },
      { id: 'traps', name: 'Fallen', icon: '🪤', description: 'Verteidigungsanlagen' }
    ]
  },
  {
    id: 'survival',
    name: 'Überleben',
    icon: '🏕️',
    color: '#228B22',
    skills: [
      { id: 'survival', name: 'Überleben', icon: '🏕️', description: 'Wildnis-Kenntnisse' },
      { id: 'scavenging', name: 'Plündern', icon: '🔍', description: 'Beute finden' },
      { id: 'stealth', name: 'Tarnung', icon: '👤', description: 'Unsichtbar bleiben' }
    ]
  },
  {
    id: 'advanced',
    name: 'Fortgeschritten',
    icon: '✨',
    color: '#9400D3',
    skills: [
      { id: 'magic', name: 'Magie', icon: '🔮', description: 'Arkane Künste' },
      { id: 'leadership', name: 'Führung', icon: '👑', description: 'Truppen befehligen' },
      { id: 'trading', name: 'Handel', icon: '💰', description: 'Bessere Preise' },
      { id: 'exploration', name: 'Erkundung', icon: '🗺️', description: 'Neue Gebiete' },
      { id: 'technology', name: 'Technologie', icon: '⚙️', description: 'Fortschritt' }
    ]
  }
]

// ═══════════════════════════════════════════════════════════════════════════
// 📋 QUEST TYPES - ADVENTURES AWAIT
// ═══════════════════════════════════════════════════════════════════════════

export const QUEST_TYPES = [
  { id: 'kill', name: 'Jagdaufträge', icon: '💀', description: 'Eliminiere gefährliche Kreaturen' },
  { id: 'gather', name: 'Sammelaufträge', icon: '📦', description: 'Sammle wertvolle Ressourcen' },
  { id: 'craft', name: 'Handwerksaufträge', icon: '🔨', description: 'Stelle Items her' },
  { id: 'loot', name: 'Plünderaufträge', icon: '💎', description: 'Finde seltene Schätze' },
  { id: 'delivery', name: 'Lieferaufträge', icon: '📬', description: 'Transportiere wichtige Güter' },
  { id: 'story', name: 'Hauptquests', icon: '📜', description: 'Epische Abenteuer' }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🎮 GAME FEATURES - THE COMPLETE EXPERIENCE
// ═══════════════════════════════════════════════════════════════════════════

export const GAME_FEATURES = [
  {
    category: 'Fraktionskrieg',
    icon: '⚔️',
    features: [
      'Seraphar vs Vorgaroth - Zwei Häuser im ewigen Konflikt',
      'Territorium erobern und verteidigen',
      'Fraktions-Teleport zu Verbündeten',
      'Exklusive Fraktions-Kits und Belohnungen',
      'Fraktions-Chat für geheime Kommunikation',
      'Doppelte Punkte bei Fraktions-Events'
    ]
  },
  {
    category: 'Klassen-System',
    icon: '🎭',
    features: [
      '6 einzigartige Klassen mit Spezialisierungen',
      'Klassen-spezifische Boni und Fähigkeiten',
      'Talent-Bäume für individuelle Builds',
      'Klassen-Wechsel mit Cooldown möglich',
      'Synergie-Effekte zwischen Klassen',
      'Exklusive Klassen-Ausrüstung'
    ]
  },
  {
    category: 'Gilden-System',
    icon: '🛡️',
    features: [
      'Gründe oder tritt einer Gilde bei',
      'Gilden-Perks und Upgrades',
      'Gilden-Bank für gemeinsame Ressourcen',
      'Gilden-Kriege und Allianzen',
      'Achievement-System mit Honor-Währung',
      'Gilden-Rangliste und Leaderboards'
    ]
  },
  {
    category: 'Burgen-System',
    icon: '🏰',
    features: [
      '12 verschiedene Gebäude-Typen',
      'Verteidigungsanlagen wie Türme und Fallen',
      'Belagerungswaffen für epische Angriffe',
      'Truppen rekrutieren und befehligen',
      'Upgrade-System bis Level 10',
      'Einzigartige Architektur pro Fraktion'
    ]
  },
  {
    category: 'XP & Skills',
    icon: '📈',
    features: [
      '20 verschiedene Skills in 6 Kategorien',
      'Bis zu Level 100 pro Skill',
      'Skill-Bäume mit Spezialisierungen',
      'Nacht-Bonus für erhöhtes XP',
      'Achievement-System',
      'Prestige-System für Veteranen'
    ]
  },
  {
    category: 'Quests',
    icon: '📜',
    features: [
      '6 verschiedene Quest-Typen',
      'NPC-Questgeber in der Welt',
      'Tägliche und wöchentliche Aufträge',
      'Epische Story-Quests',
      'Belohnungen: Items, XP, Gold',
      'Lieferaufträge zwischen Städten'
    ]
  },
  {
    category: 'Raidable Bases',
    icon: '💥',
    features: [
      'Automatisch generierte Raid-Basen',
      'NPCs mit KI-Verteidigung',
      'Verschiedene Schwierigkeitsgrade',
      'Einzigartige Loot-Tables',
      'Zeitbasierte Events',
      'Gruppen-Raids für mehr Beute'
    ]
  },
  {
    category: 'Wirtschaft',
    icon: '💰',
    features: [
      'Mehrere Währungen: Gold, Dragons, Honor, Loyalty',
      'GUI-Shop mit tausenden Items',
      'Spieler-Handel und Auktionshaus',
      'Lotterie und Glücksspiele',
      'Kopfgeld-System',
      'Starter-Geld für Neulinge'
    ]
  },
  {
    category: 'Teleportation',
    icon: '🌀',
    features: [
      'Home-Teleports zu deiner Basis',
      'TPR zu anderen Spielern',
      'Fraktions-Teleport',
      'Monument-Teleport',
      'Schnellreise-Netzwerk',
      'VIP-Teleport-Optionen'
    ]
  },
  {
    category: 'Zusätzliche Features',
    icon: '✨',
    features: [
      'Backpacks für mehr Inventar',
      'Pets als Begleiter',
      'Fahrzeug-Lizenzen',
      'Automatische Türen und Lichter',
      'Better Loot mit Modifikatoren',
      'Kits für jeden Spielstil'
    ]
  }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🌍 WORLD EVENTS - WHEN THE REALM TREMBLES
// ═══════════════════════════════════════════════════════════════════════════

export const WORLD_EVENTS = [
  { id: 'blood_moon', name: 'Blutmond', icon: '🌑', description: 'Verstärkte Monster, doppelte Beute', frequency: 'Wöchentlich' },
  { id: 'dragon_sighting', name: 'Drachensichtung', icon: '🐲', description: 'Ein legendärer Drache erscheint', frequency: 'Selten' },
  { id: 'artifact_discovery', name: 'Artefakt-Entdeckung', icon: '🏺', description: 'Antike Schätze werden gefunden', frequency: 'Zufällig' },
  { id: 'stormwall', name: 'Sturmwall', icon: '🌪️', description: 'Gefährlicher Sturm zieht auf', frequency: 'Dynamisch' },
  { id: 'faction_war', name: 'Fraktionskrieg', icon: '⚔️', description: 'Offene Schlacht zwischen den Häusern', frequency: 'Events' },
  { id: 'world_boss', name: 'Weltboss', icon: '👹', description: 'Epischer Boss spawnt in der Welt', frequency: 'Täglich' },
  { id: 'cargo_ship', name: 'Handelsschiff', icon: '🚢', description: 'Seltene Waren an Bord', frequency: 'Stündlich' },
  { id: 'helicopter', name: 'Angriffsheli', icon: '🚁', description: 'Militärischer Loot', frequency: 'Alle 2h' }
]

// ═══════════════════════════════════════════════════════════════════════════
// 📊 SERVER STATISTICS
// ═══════════════════════════════════════════════════════════════════════════

export const SERVER_STATS = {
  plugins: 65,
  features: 150,
  commands: 500,
  customCode: '10M+ Zeilen',
  uptime: '99.9%',
  mapSize: 8000,
  maxPlayers: 200
}

// ═══════════════════════════════════════════════════════════════════════════
// 💀 BOUNTY SYSTEM - HUNT OR BE HUNTED
// ═══════════════════════════════════════════════════════════════════════════

export interface BountyInfo {
  id: string
  name: string
  icon: string
  description: string
  reward: string
}

export const BOUNTY_SYSTEM: BountyInfo[] = [
  { id: 'place', name: 'Kopfgeld setzen', icon: '🎯', description: 'Setze ein Kopfgeld auf jeden Spieler mit Items, RP oder Gold', reward: 'Variable' },
  { id: 'claim', name: 'Kopfgeld einfordern', icon: '💀', description: 'Töte gesuchte Spieler und kassiere ihre Belohnung', reward: 'Items + Gold' },
  { id: 'wanted', name: 'Steckbriefe', icon: '📜', description: 'Alle aktiven Kopfgelder auf dem Server einsehen', reward: '—' },
  { id: 'hunter', name: 'Kopfgeldjäger-Rang', icon: '🏆', description: 'Werde zum gefürchteten Kopfgeldjäger', reward: 'Titel + Boni' },
  { id: 'protection', name: 'Clan-Schutz', icon: '🛡️', description: 'Clan-Mitglieder können keine Kopfgelder aufeinander setzen', reward: 'Sicherheit' }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🎁 KITS SYSTEM - STARTER TO LEGENDARY
// ═══════════════════════════════════════════════════════════════════════════

export interface KitInfo {
  id: string
  name: string
  tier: 'starter' | 'basic' | 'premium' | 'vip' | 'legendary'
  icon: string
  description: string
  cooldown: string
  items: string[]
}

export const KITS: KitInfo[] = [
  { 
    id: 'starter', 
    name: 'Neulingskit', 
    tier: 'starter',
    icon: '📦', 
    description: 'Grundausstattung für den Start ins Abenteuer', 
    cooldown: '24h',
    items: ['Steinpickel', 'Steinaxt', 'Schlafsack', 'Verband x5', '500 Holz']
  },
  { 
    id: 'warrior', 
    name: 'Kriegerkit', 
    tier: 'basic',
    icon: '⚔️', 
    description: 'Kampfausrüstung für echte Kämpfer', 
    cooldown: '48h',
    items: ['Schwert', 'Holzrüstung', 'Bandagen x10', 'Fackel x5']
  },
  { 
    id: 'builder', 
    name: 'Baumeisterkit', 
    tier: 'basic',
    icon: '🔨', 
    description: 'Alles zum Bauen deiner Festung', 
    cooldown: '48h',
    items: ['Bauhammer', 'Holz x5000', 'Stein x2500', 'Metall x500']
  },
  { 
    id: 'raider', 
    name: 'Raiderkit', 
    tier: 'premium',
    icon: '💣', 
    description: 'Für den nächsten großen Raubzug', 
    cooldown: '72h',
    items: ['Sprengstoff x4', 'Satchel x2', 'AK-47', 'Munition x100']
  },
  { 
    id: 'elite', 
    name: 'Elitekit', 
    tier: 'vip',
    icon: '👑', 
    description: 'VIP-Ausrüstung für die Elite', 
    cooldown: '24h',
    items: ['LR-300', 'Metal Armor Set', 'Med Kits x10', 'Munition x500']
  },
  { 
    id: 'dragon', 
    name: 'Drachenkit', 
    tier: 'legendary',
    icon: '🐉', 
    description: 'Legendäre Ausrüstung für die Würdigen', 
    cooldown: '168h',
    items: ['Dragon Mask', 'Tempered AK', 'Full HQM Armor', 'C4 x10', 'Rockets x20']
  }
]

// ═══════════════════════════════════════════════════════════════════════════
// 💎 ECONOMY & CURRENCIES
// ═══════════════════════════════════════════════════════════════════════════

export interface Currency {
  id: string
  name: string
  icon: string
  color: string
  description: string
  obtainedBy: string[]
  usedFor: string[]
}

export const CURRENCIES: Currency[] = [
  {
    id: 'gold',
    name: 'Gold',
    icon: '🪙',
    color: '#D4AF37',
    description: 'Die Hauptwährung von Eldrun',
    obtainedBy: ['Töten von NPCs', 'Quests abschließen', 'Handel', 'Lotterie gewinnen'],
    usedFor: ['Shop-Einkäufe', 'Teleportation', 'Gilden-Upgrades', 'Kopfgelder']
  },
  {
    id: 'dragons',
    name: 'Dragoncoins',
    icon: '🐲',
    color: '#FF6B35',
    description: 'Seltene Premium-Währung',
    obtainedBy: ['VIP-Status', 'Spenden', 'Events gewinnen', 'Seltene Achievements'],
    usedFor: ['Exklusive Skins', 'Legendäre Kits', 'Spezielle Perks', 'Booster']
  },
  {
    id: 'honor',
    name: 'Ehre',
    icon: '⚔️',
    color: '#8B0000',
    description: 'Verdient durch ruhmreiche Taten',
    obtainedBy: ['PvP-Siege', 'Gilden-Achievements', 'Turniere', 'Fraktionskriege'],
    usedFor: ['Gilden-Perks', 'PvP-Ausrüstung', 'Titel freischalten', 'Ranglisten-Rewards']
  },
  {
    id: 'scrap',
    name: 'Scrap',
    icon: '⚙️',
    color: '#7D7D7D',
    description: 'Recycelte Ressourcen',
    obtainedBy: ['Recycler nutzen', 'Barrel öffnen', 'Monumente looten'],
    usedFor: ['Blaupausen forschen', 'Gambling', 'Workbench-Upgrades']
  },
  {
    id: 'loyalty',
    name: 'Loyalität',
    icon: '🏅',
    color: '#4A90D9',
    description: 'Belohnung für aktive Spieler',
    obtainedBy: ['Tägliches Einloggen', 'Spielzeit', 'Community-Events'],
    usedFor: ['Monatliche Rewards', 'Exclusive Items', 'VIP-Probezeit']
  }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🎒 BACKPACK SYSTEM - EXTRA STORAGE
// ═══════════════════════════════════════════════════════════════════════════

export interface BackpackTier {
  id: string
  name: string
  icon: string
  slots: number
  permission: string
  features: string[]
}

export const BACKPACKS: BackpackTier[] = [
  { id: 'small', name: 'Kleiner Rucksack', icon: '🎒', slots: 12, permission: 'Standard', features: ['6 Slots Basis', 'Keine Verbesserungen'] },
  { id: 'medium', name: 'Mittlerer Rucksack', icon: '🎒', slots: 24, permission: 'VIP', features: ['24 Slots', 'Bei Tod behalten möglich'] },
  { id: 'large', name: 'Großer Rucksack', icon: '🎒', slots: 36, permission: 'VIP+', features: ['36 Slots', 'Kein Food-Spoiling', 'Gather-Modus'] },
  { id: 'elite', name: 'Elite Rucksack', icon: '👝', slots: 48, permission: 'Elite', features: ['48 Slots', 'Alle Features', 'GUI Button'] }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 FAST TRAVEL NETWORK
// ═══════════════════════════════════════════════════════════════════════════

export interface TravelPoint {
  id: string
  name: string
  icon: string
  type: 'home' | 'warp' | 'faction' | 'castle' | 'monument'
  cost: number
  cooldown: string
  description: string
}

export const TRAVEL_POINTS: TravelPoint[] = [
  { id: 'home', name: 'Heim-Teleport', icon: '🏠', type: 'home', cost: 600, cooldown: '2h', description: 'Teleportiere zu deiner Heimatbasis' },
  { id: 'tpa', name: 'Spieler-Teleport', icon: '👥', type: 'warp', cost: 800, cooldown: '3h', description: 'Teleportiere zu einem anderen Spieler' },
  { id: 'warp', name: 'Stadt-Warp', icon: '🏛️', type: 'warp', cost: 1200, cooldown: '4h', description: 'Teleportiere zu öffentlichen Orten' },
  { id: 'faction', name: 'Fraktions-HQ', icon: '⚔️', type: 'faction', cost: 1800, cooldown: '4h', description: 'Teleportiere zum Hauptquartier deiner Fraktion' },
  { id: 'castle', name: 'Burg-Teleport', icon: '🏰', type: 'castle', cost: 3500, cooldown: '6h', description: 'Teleportiere zu deiner Burg (Teuerste Option)' }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🤖 MURDERERS & NPCs - ENEMIES OF THE REALM
// ═══════════════════════════════════════════════════════════════════════════

export interface EnemyNPC {
  id: string
  name: string
  icon: string
  difficulty: 'easy' | 'medium' | 'hard' | 'boss'
  health: number
  damage: string
  loot: string[]
  location: string
}

export const ENEMY_NPCS: EnemyNPC[] = [
  { id: 'scarecrow', name: 'Vogelscheuche', icon: '🎃', difficulty: 'easy', health: 150, damage: 'Gering', loot: ['Scrap', 'Knochen'], location: 'Felder & Farmen' },
  { id: 'murderer', name: 'Mörder', icon: '🔪', difficulty: 'medium', health: 200, damage: 'Mittel', loot: ['Waffen', 'Rüstung'], location: 'Ruinen' },
  { id: 'scientist', name: 'Wissenschaftler', icon: '👨‍🔬', difficulty: 'medium', health: 250, damage: 'Hoch', loot: ['Tech-Items', 'Blaupausen'], location: 'Monumente' },
  { id: 'heavy', name: 'Schwerer Söldner', icon: '🛡️', difficulty: 'hard', health: 500, damage: 'Sehr Hoch', loot: ['Seltene Waffen', 'Scrap'], location: 'Militärbasen' },
  { id: 'patrol', name: 'Bradley', icon: '🚜', difficulty: 'boss', health: 1000, damage: 'Extrem', loot: ['C4', 'Raketen', 'Elite Crates'], location: 'Launch Site' },
  { id: 'heli', name: 'Angriffsheli', icon: '🚁', difficulty: 'boss', health: 10000, damage: 'Tödlich', loot: ['Militär-Loot', 'Seltene Items'], location: 'Überall' }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🏝️ ARTIFACT ISLAND - LEGENDARY ZONE
// ═══════════════════════════════════════════════════════════════════════════

export interface ArtifactZone {
  id: string
  name: string
  icon: string
  description: string
  features: string[]
  dangers: string[]
  rewards: string[]
}

export const ARTIFACT_ISLAND: ArtifactZone = {
  id: 'artifact_island',
  name: 'Artefakt-Insel',
  icon: '🏝️',
  description: 'Eine mysteriöse Insel voller antiker Artefakte und tödlicher Gefahren',
  features: [
    'Sturmwall-Grenze mit Schaden',
    'PvP immer aktiviert',
    'Doppelter Loot-Multiplier',
    'Spezielle Events',
    'Teleport-Punkt verfügbar',
    'Max 20 Spieler gleichzeitig'
  ],
  dangers: [
    '1 HP/Sekunde Sturmwall-Schaden',
    'Aggressive Elite-NPCs',
    'Keine sichere Zone',
    'Andere Spieler sind Feinde'
  ],
  rewards: [
    'Legendäre Artefakte',
    'Einzigartige Skins',
    'Doppelte XP',
    'Seltene Blaupausen',
    'Exklusive Achievements'
  ]
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎰 LOTTERY & GAMBLING
// ═══════════════════════════════════════════════════════════════════════════

export interface GamblingGame {
  id: string
  name: string
  icon: string
  description: string
  minBet: number
  maxWin: string
  houseEdge: string
}

export const GAMBLING_GAMES: GamblingGame[] = [
  { id: 'lottery', name: 'Eldrun Lotterie', icon: '🎰', description: 'Täglich steigende Jackpots', minBet: 100, maxWin: 'Jackpot (∞)', houseEdge: '5%' },
  { id: 'coinflip', name: 'Münzwurf', icon: '🪙', description: '1v1 Duelle um Items/Gold', minBet: 50, maxWin: '2x Einsatz', houseEdge: '2%' },
  { id: 'wheel', name: 'Glücksrad', icon: '🎡', description: 'Drehe das Rad für Preise', minBet: 100, maxWin: '10x Einsatz', houseEdge: '8%' },
  { id: 'dice', name: 'Würfelspiel', icon: '🎲', description: 'Über/Unter Wetten', minBet: 25, maxWin: '98x Einsatz', houseEdge: '2%' }
]

// ═══════════════════════════════════════════════════════════════════════════
// 📊 HUD & UI FEATURES
// ═══════════════════════════════════════════════════════════════════════════

export interface HUDElement {
  id: string
  name: string
  icon: string
  description: string
  toggleable: boolean
}

export const HUD_ELEMENTS: HUDElement[] = [
  { id: 'xp_bar', name: 'XP-Leiste', icon: '📊', description: 'Zeigt aktuelles Level und XP-Fortschritt', toggleable: true },
  { id: 'faction', name: 'Fraktions-Anzeige', icon: '⚔️', description: 'Deine Fraktion und deren Status', toggleable: true },
  { id: 'balance', name: 'Währungsanzeige', icon: '💰', description: 'Alle Währungen auf einen Blick', toggleable: true },
  { id: 'minimap', name: 'Minimap', icon: '🗺️', description: 'Lusty Map Integration', toggleable: true },
  { id: 'compass', name: 'Kompass', icon: '🧭', description: 'Richtungsanzeige mit POIs', toggleable: true },
  { id: 'server_info', name: 'Server-Info', icon: 'ℹ️', description: 'Spieleranzahl, Zeit, Events', toggleable: true },
  { id: 'quick_actions', name: 'Schnellaktionen', icon: '⚡', description: 'Buttons für häufige Befehle', toggleable: true }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🎮 CHAT COMMANDS - COMPLETE REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

export interface ChatCommand {
  command: string
  description: string
  category: string
  example?: string
}

export const CHAT_COMMANDS: ChatCommand[] = [
  // Teleportation
  { command: '/home', description: 'Teleportiere zu deinem Home-Punkt', category: 'Teleport', example: '/home base' },
  { command: '/sethome', description: 'Setze einen neuen Home-Punkt', category: 'Teleport', example: '/sethome base' },
  { command: '/tpr', description: 'Teleport-Anfrage an Spieler', category: 'Teleport', example: '/tpr DragonSlayer' },
  { command: '/tpa', description: 'Teleport-Anfrage akzeptieren', category: 'Teleport' },
  { command: '/warp', description: 'Zu öffentlichen Warps teleportieren', category: 'Teleport', example: '/warp bandit' },
  
  // Economy
  { command: '/balance', description: 'Zeigt dein Guthaben an', category: 'Wirtschaft' },
  { command: '/pay', description: 'Geld an Spieler senden', category: 'Wirtschaft', example: '/pay DragonSlayer 1000' },
  { command: '/shop', description: 'Öffnet den GUI Shop', category: 'Wirtschaft' },
  { command: '/sell', description: 'Items verkaufen', category: 'Wirtschaft' },
  
  // Kits
  { command: '/kit', description: 'Kit-Menü öffnen', category: 'Kits' },
  { command: '/kit list', description: 'Alle verfügbaren Kits anzeigen', category: 'Kits' },
  { command: '/kit <name>', description: 'Ein bestimmtes Kit abholen', category: 'Kits', example: '/kit starter' },
  
  // Faction & Guilds
  { command: '/faction', description: 'Fraktions-Menü öffnen', category: 'Fraktion' },
  { command: '/faction join', description: 'Einer Fraktion beitreten', category: 'Fraktion', example: '/faction join seraphar' },
  { command: '/guild', description: 'Gilden-Menü öffnen', category: 'Gilde' },
  { command: '/guild create', description: 'Eigene Gilde gründen', category: 'Gilde', example: '/guild create DragonOrder' },
  
  // Clan
  { command: '/clan', description: 'Clan-Informationen anzeigen', category: 'Clan' },
  { command: '/clan create', description: 'Clan erstellen', category: 'Clan', example: '/clan create APEX' },
  { command: '/clan invite', description: 'Spieler einladen', category: 'Clan', example: '/clan invite DragonSlayer' },
  { command: '/clan ally', description: 'Allianz anfragen', category: 'Clan' },
  
  // Bounty
  { command: '/bounty', description: 'Kopfgeld-Menü öffnen', category: 'Kopfgeld' },
  { command: '/bounty place', description: 'Kopfgeld auf Spieler setzen', category: 'Kopfgeld', example: '/bounty place DragonSlayer 5000' },
  { command: '/bounty list', description: 'Alle aktiven Kopfgelder', category: 'Kopfgeld' },
  
  // Skills & XP
  { command: '/skills', description: 'Skill-Menü öffnen', category: 'XP/Skills' },
  { command: '/stats', description: 'Deine Statistiken anzeigen', category: 'XP/Skills' },
  { command: '/level', description: 'Aktuelles Level anzeigen', category: 'XP/Skills' },
  
  // Backpack
  { command: '/backpack', description: 'Rucksack öffnen', category: 'Backpack' },
  { command: '/bp', description: 'Kurzbefehl für Rucksack', category: 'Backpack' },
  
  // Castle
  { command: '/castle', description: 'Burg-Menü öffnen', category: 'Burg' },
  { command: '/castle upgrade', description: 'Burg-Upgrade-Menü', category: 'Burg' },
  { command: '/castle troops', description: 'Truppen verwalten', category: 'Burg' },
  
  // Quest
  { command: '/quest', description: 'Quest-Menü öffnen', category: 'Quest' },
  { command: '/quest list', description: 'Verfügbare Quests anzeigen', category: 'Quest' },
  { command: '/quest complete', description: 'Quest abschließen', category: 'Quest' },
  
  // Misc
  { command: '/lottery', description: 'Lotterie-Menü öffnen', category: 'Sonstiges' },
  { command: '/hud', description: 'HUD-Einstellungen', category: 'Sonstiges' },
  { command: '/help', description: 'Hilfe anzeigen', category: 'Sonstiges' },
  { command: '/info', description: 'Server-Informationen', category: 'Sonstiges' },
  { command: '/report', description: 'Bug melden', category: 'Sonstiges' }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🏆 ACHIEVEMENTS & TITLES
// ═══════════════════════════════════════════════════════════════════════════

export interface Achievement {
  id: string
  name: string
  icon: string
  description: string
  reward: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', name: 'Erstes Blut', icon: '🩸', description: 'Erster PvP-Kill', reward: '100 Gold', rarity: 'common' },
  { id: 'builder', name: 'Meisterbauer', icon: '🏗️', description: 'Baue 1000 Strukturen', reward: 'Builder Titel', rarity: 'common' },
  { id: 'hunter', name: 'Kopfgeldjäger', icon: '🎯', description: 'Kassiere 10 Kopfgelder', reward: 'Hunter Titel', rarity: 'rare' },
  { id: 'wealthy', name: 'Der Reiche', icon: '💰', description: 'Sammle 1.000.000 Gold', reward: 'VIP-Status (7 Tage)', rarity: 'rare' },
  { id: 'raider', name: 'Plünderer', icon: '💥', description: 'Erfolgreich 50 Bases raiden', reward: 'Raider Titel + Kit', rarity: 'epic' },
  { id: 'champion', name: 'Champion', icon: '🏆', description: 'Gewinne ein Server-Turnier', reward: 'Champion Titel + Skin', rarity: 'epic' },
  { id: 'legend', name: 'Legende von Eldrun', icon: '👑', description: 'Alle Achievements freischalten', reward: 'Legendary Titel + Exklusives Kit', rarity: 'legendary' },
  { id: 'dragon', name: 'Drachentöter', icon: '🐉', description: 'Besiege den Weltboss alleine', reward: 'Dragon Mask + 10000 Dragons', rarity: 'legendary' }
]

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 LOOT TABLES & RARITY
// ═══════════════════════════════════════════════════════════════════════════

export interface LootRarity {
  id: string
  name: string
  color: string
  dropChance: string
  icon: string
}

export const LOOT_RARITIES: LootRarity[] = [
  { id: 'common', name: 'Gewöhnlich', color: '#9CA3AF', dropChance: '60%', icon: '⚪' },
  { id: 'uncommon', name: 'Ungewöhnlich', color: '#22C55E', dropChance: '25%', icon: '🟢' },
  { id: 'rare', name: 'Selten', color: '#3B82F6', dropChance: '10%', icon: '🔵' },
  { id: 'epic', name: 'Episch', color: '#8B5CF6', dropChance: '4%', icon: '🟣' },
  { id: 'legendary', name: 'Legendär', color: '#F59E0B', dropChance: '0.9%', icon: '🟠' },
  { id: 'mythic', name: 'Mythisch', color: '#EF4444', dropChance: '0.1%', icon: '🔴' }
]
