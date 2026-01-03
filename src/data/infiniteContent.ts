// All content types for infinite scroll
export type ContentType = 
  | 'news'
  | 'leaderboard' 
  | 'tutorial'
  | 'tip'
  | 'forum_thread'
  | 'clan_spotlight'
  | 'player_spotlight'
  | 'server_event'
  | 'gallery'
  | 'poll'
  | 'stats_highlight'
  | 'guide'
  | 'update_log'
  | 'community_post'
  | 'faction_war'

export interface ContentItem {
  id: string
  type: ContentType
  data: unknown
  priority: number // Higher = shown earlier
}

// News Articles
export const NEWS_ITEMS: ContentItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ✨ JANUAR 2025 - CHRONICLES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'news-aurora-cascade-620',
    type: 'news',
    priority: 1200,
    data: {
      title: '✨ Version 6.2.0 – Aurora Cascade Live!',
      excerpt: 'Parallax-Heroes, Accessibility Deck, Plugin Heartbeat Overlay & Live Deployment Timeline – die UI leuchtet in neuer Aurora-Pracht.',
      image: '/images/backgrounds/hero-dark-castle.svg',
      category: 'Release',
      date: '2025-01-05',
      link: '/changelog',
      featured: true
    }
  },
  {
    id: 'news-plugin-pulse-612',
    type: 'news',
    priority: 1195,
    data: {
      title: '🛰️ 6.1.2 Plugin Pulse & Micro-Update Storm',
      excerpt: 'WeatherSynth Presets, Reactivity Broadcasts, AI Patch Notes plus zehn Quality-of-Life Tweaks rollen site-wide aus.',
      image: '/images/icons/icon_settings.svg',
      category: 'Update',
      date: '2025-01-04',
      link: '/changelog'
    }
  },
  {
    id: 'news-velvet-threads-611',
    type: 'news',
    priority: 1190,
    data: {
      title: '🧵 6.1.1 Velvet Threads – Copy Polish Pass',
      excerpt: 'Hero-Subtitles, Tooltip-Prosa und Battle-Pass-Microtimestamps machen jede Seite erzählerischer als zuvor.',
      image: '/images/icons/icon_news.svg',
      category: 'Patch',
      date: '2025-01-03',
      link: '/changelog'
    }
  },
  {
    id: 'news-nebula-threading-610',
    type: 'news',
    priority: 1185,
    data: {
      title: '🌌 6.1.0 Nebula Threading & Forum Cinematics',
      excerpt: 'Thread-Cinematic-Mode, 3D VIP Badges und Jump-to-Update Timelines katapultieren das Forum auf NASA-Level.',
      image: '/images/backgrounds/ui-background.svg',
      category: 'Forum',
      date: '2025-01-02',
      link: '/changelog'
    }
  },
  {
    id: 'news-frostglass-601',
    type: 'news',
    priority: 1180,
    data: {
      title: '❄️ 6.0.1 Frostglass Content Sweep',
      excerpt: 'SVG-Austausch, Frostglass-Filter und neue Stat-Bubbles lassen Professions, Classes & Trading glänzen.',
      image: '/images/backgrounds/fortress-night.svg',
      category: 'Design',
      date: '2024-12-26',
      link: '/changelog'
    }
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 🗺️ ELDRUN MAP RELEASE - MEILENSTEIN!
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'news-map-release',
    type: 'news',
    priority: 999,
    data: {
      title: '🗺️ MEILENSTEIN: ELDRUN MAP IST FERTIG!',
      excerpt: 'Die offizielle ELDRUN Rust Map ist vollständig! 4500 Größe, 113.840 Prefabs, 19 Custom Monuments, 4 Inseln - jetzt spielbar!',
      image: '/images/eldrun-map.jpg',
      category: 'MEILENSTEIN',
      date: '2024-12-24',
      link: '/news',
      featured: true
    }
  },
  {
    id: 'news-map-monuments',
    type: 'news',
    priority: 998,
    data: {
      title: '🏛️ 19 CUSTOM MONUMENTS - West Coast Casino, Bradley Arena & mehr!',
      excerpt: 'Entdecke exklusive Monumente: Skytrain Stationen, Art Gallery, Bus Depot, Diner und das legendäre West Coast Casino!',
      image: '/images/eldrun-map.jpg',
      category: 'Map Feature',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-map-biomes',
    type: 'news',
    priority: 997,
    data: {
      title: '🌍 5 BIOME: Jungle, Arctic, Arid, Temperate & Tundra!',
      excerpt: '33% Jungle, 26% Arid, 20% Arctic - erkunde vielfältige Landschaften auf 4 einzigartigen Inseln!',
      image: '/images/eldrun-map.jpg',
      category: 'Map Feature',
      date: '2024-12-24',
      link: '/news'
    }
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 🏛️ MONUMENT SHOWCASE - Alle Custom Monuments mit Screenshots!
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'news-west-coast-casino',
    type: 'news',
    priority: 990,
    data: {
      title: '🎰 WEST COAST CASINO - Das ultimative Puzzle-Monument!',
      excerpt: 'Komplexes Puzzle mit Red-Herring-Schaltern, zeitgesteuertem Aufzug und Turret-bewachtem Tresor. Nur für die Cleversten!',
      image: '/images/screenshots/screenshot-0001.png',
      category: 'Monument',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-bradley-arena',
    type: 'news',
    priority: 989,
    data: {
      title: '⚔️ BRADLEY ARENA - Kämpfe gegen den Tank!',
      excerpt: 'Massive Arena mit patrouillierendem Bradley Tank. High-Risk, High-Reward! Nur die Stärksten überleben.',
      image: '/images/screenshots/screenshot-0003.png',
      category: 'Monument',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-skytrain-network',
    type: 'news',
    priority: 988,
    data: {
      title: '🚂 SKYTRAIN NETZWERK - 6 Stationen, 63 Railroads!',
      excerpt: 'Das größte Schienennetz aller Zeiten! Reise blitzschnell über die gesamte Map mit dem Skytrain-System.',
      image: '/images/screenshots/screenshot-0005.png',
      category: 'Monument',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-abandoned-apartments',
    type: 'news',
    priority: 987,
    data: {
      title: '🏢 ABANDONED APARTMENTS - Vertikales Looting!',
      excerpt: 'Durchsuche jedes Apartment! Versteckter Loot in jeder Wohnung. Das erste vertikale Monument auf ELDRUN!',
      image: '/images/screenshots/screenshot-0007.png',
      category: 'Monument',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-diner-spots',
    type: 'news',
    priority: 986,
    data: {
      title: '🍔 4x DINER - Perfekt für Anfänger!',
      excerpt: 'Kleine Monumente mit Küche, Büro und Essbereich. Ideal zum Farmen von Scrap und Basic-Loot!',
      image: '/images/screenshots/screenshot-0009.png',
      category: 'Monument',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-habitable-zones',
    type: 'news',
    priority: 985,
    data: {
      title: '🏕️ BEBAUBARE ZONEN - Nodedust Park & Oil Swamps!',
      excerpt: 'Baue deine Base IN Monumenten! Nodedust Park und Oil Swamps sind vollständig bebaubar!',
      image: '/images/screenshots/screenshot-0011.png',
      category: 'Monument',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-safezones',
    type: 'news',
    priority: 984,
    data: {
      title: '🎨 SAFE ZONES - Art Gallery & Skatepark!',
      excerpt: 'Friedliche Treffpunkte ohne PvP! Male Kunstwerke oder teste die neuen Bikes im Skatepark.',
      image: '/images/screenshots/screenshot-0017.png',
      category: 'Monument',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-mini-mall',
    type: 'news',
    priority: 983,
    data: {
      title: '🏬 MINI-MALL - Shopping-Center mit 4 Läden!',
      excerpt: '1 Supermarkt + 3 Geschäfte voller Loot. Der beste Spot für Komponenten und Scrap!',
      image: '/images/screenshots/screenshot-0021.png',
      category: 'Monument',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-bus-depot',
    type: 'news',
    priority: 982,
    data: {
      title: '🚌 BUS DEPOT - Green Card Monument!',
      excerpt: 'Neues Puzzle-Monument mit Green Card Zugang. Strategisch gelegen nahe Hafen und Skytrain.',
      image: '/images/screenshots/screenshot-0024.png',
      category: 'Monument',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-custom-lighthouses',
    type: 'news',
    priority: 981,
    data: {
      title: '🗼 CUSTOM LIGHTHOUSES - Klippen-Aussichtspunkte!',
      excerpt: '2 einzigartige Leuchttürme auf hohen Klippen mit verlassenen Behausungen und 360° Panorama!',
      image: '/images/screenshots/screenshot-0015.png',
      category: 'Monument',
      date: '2024-12-24',
      link: '/news'
    }
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 🌍 BIOME FEATURES - Landschaften & Inseln
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'news-jungle-biome',
    type: 'news',
    priority: 970,
    data: {
      title: '🌴 JUNGLE BIOM - 33% der Map!',
      excerpt: 'Dichte Vegetation, versteckte Pfade und tropisches Klima. Das größte Biom auf ELDRUN!',
      image: '/images/screenshots/v120-001.jpg',
      category: 'Biome',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-arctic-biome',
    type: 'news',
    priority: 969,
    data: {
      title: '❄️ ARCTIC ZONE - Eisige 20% der Map!',
      excerpt: 'Gefrorene Landschaften, Schneestürme und die Arctic Research Base. Bring warme Kleidung!',
      image: '/images/screenshots/v120-005.jpg',
      category: 'Biome',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-arid-desert',
    type: 'news',
    priority: 968,
    data: {
      title: '🏜️ ARID DESERT - 26% trockene Wüste!',
      excerpt: 'Heiße Wüstenlandschaft mit Kakteen, Sand und gefährlicher Hitze. Wasser ist Gold wert!',
      image: '/images/screenshots/v120-008.jpg',
      category: 'Biome',
      date: '2024-12-24',
      link: '/news'
    }
  },
  {
    id: 'news-4-islands',
    type: 'news',
    priority: 967,
    data: {
      title: '🏝️ 4 EINZIGARTIGE INSELN - Erkunde sie alle!',
      excerpt: 'Jede Insel hat ihren eigenen Charakter, Biome und Monumente. Entdecke alle Geheimnisse!',
      image: '/images/screenshots/v120-010.jpg',
      category: 'Map Feature',
      date: '2024-12-24',
      link: '/news'
    }
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 📸 SCREENSHOT GALLERY - Impressionen der Map
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'news-map-beauty-1',
    type: 'news',
    priority: 950,
    data: {
      title: '📸 ELDRUN MAP - Atemberaubende Landschaften!',
      excerpt: 'Die schönsten Aussichtspunkte und Panoramen der neuen Map. Screenshot-Galerie Teil 1!',
      image: '/images/screenshots/screenshot-0016.png',
      category: 'Gallery',
      date: '2024-12-24',
      link: '/gallery'
    }
  },
  {
    id: 'news-map-beauty-2',
    type: 'news',
    priority: 949,
    data: {
      title: '📸 SONNENUNTERGÄNGE auf ELDRUN!',
      excerpt: 'Goldene Stunde auf der ELDRUN Map. Die besten Locations für epische Screenshots!',
      image: '/images/screenshots/screenshot-0019.png',
      category: 'Gallery',
      date: '2024-12-24',
      link: '/gallery'
    }
  },
  {
    id: 'news-map-beauty-3',
    type: 'news',
    priority: 948,
    data: {
      title: '📸 NACHTAUFNAHMEN - ELDRUN bei Dunkelheit!',
      excerpt: 'Die Map erwacht nachts zum Leben. Lichter, Schatten und mysteriöse Atmosphäre!',
      image: '/images/screenshots/screenshot-0026.png',
      category: 'Gallery',
      date: '2024-12-24',
      link: '/gallery'
    }
  },
  {
    id: 'news-fraktionskrieg',
    type: 'news',
    priority: 120,
    data: {
      title: '⚔️ FRAKTIONSKRIEG: Seraphar vs Vorgaroth!',
      excerpt: 'Der epische Fraktionskrieg beginnt am Samstag um 20:00 Uhr! 50.000 Coins pro Teilnehmer!',
      image: '/images/gameplay/battle-scene.png',
      category: 'Event',
      date: '2024-12-17',
      link: '/news'
    }
  },
  {
    id: 'news-castle-2',
    type: 'news',
    priority: 118,
    data: {
      title: '🏰 CASTLE SYSTEM 2.0 - Massive Erweiterung!',
      excerpt: 'Automatische Verteidigungstürme, Ballisten, Katapulte und NPC-Wachen jetzt verfügbar!',
      image: '/images/gameplay/castle-siege.png',
      category: 'Update',
      date: '2024-12-16',
      link: '/news'
    }
  },
  {
    id: 'news-pets-system',
    type: 'news',
    priority: 115,
    data: {
      title: '🐉 NEUE PETS: Drachen, Löwen & Mehr!',
      excerpt: 'Zähme legendäre Begleiter mit einzigartigen Fähigkeiten! Drache exklusiv für Mythic Kit!',
      image: '/images/bosses/toxic-golem.png',
      category: 'Feature',
      date: '2024-12-15',
      link: '/news'
    }
  },
  {
    id: 'news-casino-jackpot',
    type: 'news',
    priority: 112,
    data: {
      title: '🎰 CASINO JACKPOT: 500.000 Chips warten!',
      excerpt: 'Allzeithoch im Casino! Spielt Slots, Roulette oder Crash für den Mega-Gewinn!',
      image: '/images/icons/icon_gambling.svg',
      category: 'Event',
      date: '2024-12-14',
      link: '/casino'
    }
  },
  {
    id: 'news-vip-kits',
    type: 'news',
    priority: 110,
    data: {
      title: '⚡ SPEZIAL VIP KITS - Elite-Pakete!',
      excerpt: '5 einmalige VIP Kits mit allen Währungen, Pets und exklusiven Vorteilen im Shop!',
      image: '/images/icons/icon_shop.svg',
      category: 'Shop',
      date: '2024-12-13',
      link: '/shop'
    }
  },
  {
    id: 'news-patch-321',
    type: 'news',
    priority: 105,
    data: {
      title: '🔧 PATCH 3.2.1 - Balancing & Bugfixes',
      excerpt: 'XP-Rate +15%, Casino House Edge reduziert, Performance-Verbesserungen!',
      image: '/images/icons/icon_settings.svg',
      category: 'Patch',
      date: '2024-12-12',
      link: '/changelog'
    }
  },
  {
    id: 'news-season-4',
    type: 'news',
    priority: 102,
    data: {
      title: '🏆 SEASON 4: Leaderboard Reset!',
      excerpt: 'Alle Spieler starten bei 0 - Top 10 erhalten legendäre Skins und bis zu 100.000 Coins!',
      image: '/images/gameplay/arena-battle.png',
      category: 'Event',
      date: '2024-12-11',
      link: '/leaderboard'
    }
  },
  {
    id: 'news-gilden-upgrade',
    type: 'news',
    priority: 100,
    data: {
      title: '🛡️ GILDEN-SYSTEM: Neue Perks!',
      excerpt: 'Crafting Speed +25%, Gather Boost +20%, Combat Damage +10% - Schließt euch zusammen!',
      image: '/images/gameplay/siege-battle.png',
      category: 'Update',
      date: '2024-12-10',
      link: '/clans'
    }
  },
  {
    id: 'news-winter-event',
    type: 'news',
    priority: 98,
    data: {
      title: '🎄 WINTER-EVENT: Frost & Feuer Festival!',
      excerpt: 'Schneelandschaft, Frost-Monster, Feuerdämon-Boss! Exklusive Frost-Rüstung & Eisbär-Pet!',
      image: '/images/backgrounds/war-scene.svg',
      category: 'Event',
      date: '2024-12-09',
      link: '/news'
    }
  },
  {
    id: 'news-support-page',
    type: 'news',
    priority: 95,
    data: {
      title: '💰 SUPPORT-SEITE: Unterstütze uns!',
      excerpt: 'Neue Spenden-Seite mit exklusiven Belohnungen! Monatliches Ziel: €1.500 für Server!',
      image: '/images/currency/gold.svg',
      category: 'Community',
      date: '2024-12-08',
      link: '/support'
    }
  },
  {
    id: 'news-server-wartung',
    type: 'news',
    priority: 92,
    data: {
      title: '⚠️ WARTUNG: Server-Upgrade Donnerstag',
      excerpt: 'Hardware-Upgrade für 50% schnellere Ladezeiten! 04:00 - 08:00 Uhr geplant.',
      image: '/images/backgrounds/fortress-night.svg',
      category: 'Wartung',
      date: '2024-12-07',
      link: '/news'
    }
  },
  {
    id: 'news-quest-system',
    type: 'news',
    priority: 90,
    data: {
      title: '🎮 QUEST-SYSTEM: 50+ Neue Quests!',
      excerpt: 'Story-Quests, Daily Quests, Clan-Quests! Rare Skins und bis zu 10.000 Coins pro Quest!',
      image: '/images/gameplay/arena-battle.png',
      category: 'Feature',
      date: '2024-12-06',
      link: '/news'
    }
  },
  {
    id: 'news-raidbases',
    type: 'news',
    priority: 88,
    data: {
      title: '🏰 Raid Bases - Automatische PvE Raids!',
      excerpt: 'Herausfordernde Raid-Basen mit NPCs spawnen automatisch. Stell dich der Challenge!',
      image: '/images/gameplay/night-assault.png',
      category: 'Feature',
      date: '2024-12-05',
      link: '/features'
    }
  },
  {
    id: 'news-vip-package',
    type: 'news',
    priority: 85,
    data: {
      title: 'Neues VIP Paket verfügbar',
      excerpt: 'Das neue Diamond VIP Paket ist jetzt mit exklusiven Features erhältlich...',
      image: '/images/gameplay/arena-battle.png',
      category: 'Shop',
      date: '2024-12-10',
    }
  },
  {
    id: 'news-raid-weekend',
    type: 'news',
    priority: 70,
    data: {
      title: 'Raid Weekend Special',
      excerpt: 'Dieses Wochenende: Doppelte Loot-Chancen bei allen Raids!',
      image: '/images/gameplay/siege-battle.png',
      category: 'Event',
      date: '2024-12-08',
    }
  },
  {
    id: 'news-vehicle-update',
    type: 'news',
    priority: 97,
    data: {
      title: '🚁 50+ Custom Vehicles verfügbar!',
      excerpt: 'Von Motorrädern bis Kampfhubschraubern - entdecke unsere riesige Fahrzeugauswahl!',
      image: '/images/icons/icon_vehicle.svg',
      category: 'Feature',
      date: '2024-12-14',
    }
  },
  {
    id: 'news-castle-system',
    type: 'news',
    priority: 94,
    data: {
      title: '🏰 Castle System - Baue dein Königreich!',
      excerpt: 'Upgrade deine Burg mit 12 verschiedenen Gebäuden und verteidige sie mit Ballisten!',
      image: '/images/gameplay/castle-siege.png',
      category: 'Feature',
      date: '2024-12-13',
    }
  },
  {
    id: 'news-bounty-system',
    type: 'news',
    priority: 89,
    data: {
      title: '💰 Kopfgeld-System aktiviert!',
      excerpt: 'Setze Kopfgelder auf andere Spieler und werde zum Kopfgeldje ger!',
      image: '/images/gameplay/night-assault.png',
      category: 'Feature',
      date: '2024-12-11',
    }
  },
  {
    id: 'news-auction-house',
    type: 'news',
    priority: 87,
    data: {
      title: '🏛️ Auction House & Black Market!',
      excerpt: 'Handel Items im Auktionshaus oder entdecke seltene Gegenstände auf dem Schwarzmarkt!',
      image: '/images/icons/icon_trade.svg',
      category: 'Economy',
      date: '2024-12-09',
    }
  },
  {
    id: 'news-quest-npc-vendors',
    type: 'news',
    priority: 83,
    data: {
      title: '📜 Quest System mit NPC Vendors!',
      excerpt: 'Erfülle Quests, sammle Belohnungen und steige im Level auf!',
      image: '/images/icons/icon_quest.svg',
      category: 'Feature',
      date: '2024-12-07',
    }
  },
]

// Tutorials
export const TUTORIAL_ITEMS: ContentItem[] = [
  {
    id: 'tutorial-base-building',
    type: 'tutorial',
    priority: 80,
    data: {
      title: 'Base Building Guide für Anfänger',
      description: 'Lerne die Grundlagen des Base Buildings und schütze deine Ressourcen effektiv.',
      difficulty: 'Anfänger',
      duration: '15 min',
      icon: '🏠',
    }
  },
  {
    id: 'tutorial-raiding',
    type: 'tutorial',
    priority: 75,
    data: {
      title: 'Raiding 101 - Explosive Entrance',
      description: 'Alles über C4, Raketen und die effizientesten Raid-Methoden.',
      difficulty: 'Fortgeschritten',
      duration: '20 min',
      icon: '💥',
    }
  },
  {
    id: 'tutorial-pvp',
    type: 'tutorial',
    priority: 72,
    data: {
      title: 'PvP Masterclass',
      description: 'Verbessere deine Aim-Skills und lerne die besten Combat-Strategien.',
      difficulty: 'Experte',
      duration: '30 min',
      icon: '🎯',
    }
  },
  {
    id: 'tutorial-farming',
    type: 'tutorial',
    priority: 65,
    data: {
      title: 'Effizientes Farming',
      description: 'Maximiere deine Ressourcen-Ausbeute mit diesen Pro-Tipps.',
      difficulty: 'Anfänger',
      duration: '10 min',
      icon: '⛏️',
    }
  },
]

// Tips & Tricks
export const TIP_ITEMS: ContentItem[] = [
  {
    id: 'tip-airdrops',
    type: 'tip',
    priority: 60,
    data: {
      title: 'Airdrop Timing',
      content: 'Airdrops spawnen alle 2 Stunden. Sei 5 Minuten vorher am Fallschirm-Gebiet!',
      icon: '📦',
    }
  },
  {
    id: 'tip-recycler',
    type: 'tip',
    priority: 58,
    data: {
      title: 'Recycler Locations',
      content: 'Die Recycler in Outpost und Bandit Camp sind 24/7 sicher nutzbar.',
      icon: '♻️',
    }
  },
  {
    id: 'tip-horses',
    type: 'tip',
    priority: 55,
    data: {
      title: 'Pferde-Tipp',
      content: 'Pferde regenerieren HP wenn du sie mit Kürbissen oder Mais fütterst.',
      icon: '🐴',
    }
  },
  {
    id: 'tip-workbench',
    type: 'tip',
    priority: 52,
    data: {
      title: 'Workbench Placement',
      content: 'Platziere Workbenches in der Nähe von Türen für schnellen Zugang beim Crafting.',
      icon: '🔧',
    }
  },
  {
    id: 'tip-night-vision',
    type: 'tip',
    priority: 48,
    data: {
      title: 'Nacht-Sicht',
      content: 'Erhöhe die Gamma-Einstellung nachts leicht für bessere Sicht ohne NVG.',
      icon: '🌙',
    }
  },
]

// Forum Threads
export const FORUM_ITEMS: ContentItem[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🗺️ ELDRUN MAP RELEASE - CELEBRATION THREADS!
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'forum-map-release-official',
    type: 'forum_thread',
    priority: 999,
    data: {
      title: '🗺️ [OFFIZIELL] ELDRUN MAP v1.0 IST FERTIG! 🎉🎄',
      author: 'SirEldrun',
      replies: 1247,
      views: 89432,
      lastActive: 'Gerade eben',
      category: 'Ankündigung',
      pinned: true,
      hot: true,
      excerpt: 'MEILENSTEIN ERREICHT! Die offizielle ELDRUN Rust Map ist vollständig fertig! 4500 Map Size, 113.840 Prefabs, 19 Custom Monuments, 4 Inseln - JETZT SPIELBAR!'
    }
  },
  {
    id: 'forum-map-screenshots',
    type: 'forum_thread',
    priority: 998,
    data: {
      title: '📸 [GALERIE] Teilt eure besten Map Screenshots!',
      author: 'ScreenshotKing',
      replies: 423,
      views: 15678,
      lastActive: '2 Minuten',
      category: 'Community',
      pinned: true,
      hot: true,
      excerpt: 'Die Map ist wunderschön! Postet hier eure besten Screenshots von den neuen Monumenten, Biomen und geheimen Orten!'
    }
  },
  {
    id: 'forum-map-west-coast-casino',
    type: 'forum_thread',
    priority: 997,
    data: {
      title: '🎰 West Coast Casino - Der BESTE Custom Monument?!',
      author: 'CasinoHunter',
      replies: 312,
      views: 8934,
      lastActive: '8 Minuten',
      category: 'Diskussion',
      hot: true,
      excerpt: 'Hat jemand schon das West Coast Casino erkundet? Die Loot-Tables sind INSANE! Hab dort einen Mythic Crate gefunden!'
    }
  },
  {
    id: 'forum-map-bradley-arena',
    type: 'forum_thread',
    priority: 996,
    data: {
      title: '⚔️ Bradley Arena Guide - Alle Spawns & Taktiken',
      author: 'TacticalMaster',
      replies: 156,
      views: 5432,
      lastActive: '15 Minuten',
      category: 'Guide',
      hot: true,
      excerpt: 'Vollständiger Guide zur Bradley Arena! Beste Positionen, Spawn-Zeiten und wie ihr den Bradley Tank am effektivsten besiegt.'
    }
  },
  {
    id: 'forum-map-skytrain',
    type: 'forum_thread',
    priority: 995,
    data: {
      title: '🚂 6 Skytrain Stationen - Das Schienennetz erklärt!',
      author: 'TrainEngineer',
      replies: 89,
      views: 3456,
      lastActive: '23 Minuten',
      category: 'Guide',
      excerpt: 'Alle 6 Skytrain Stationen und wie das 63 Railroad-Netzwerk funktioniert. Plus: Geheime Tunnel-Abkürzungen!'
    }
  },
  {
    id: 'forum-map-base-spots',
    type: 'forum_thread',
    priority: 994,
    data: {
      title: '🏠 BESTE Base-Spots auf der neuen Map? (40.5% bebaubar!)',
      author: 'BaseBuilder99',
      replies: 567,
      views: 21345,
      lastActive: '3 Minuten',
      category: 'Diskussion',
      hot: true,
      excerpt: 'Mit 40.5% bebaubarer Fläche gibt es SO viele Optionen! Wo baut ihr eure Bases? Jungle-Insel oder Arctic-Zone?'
    }
  },
  {
    id: 'forum-map-mod-integration',
    type: 'forum_thread',
    priority: 993,
    data: {
      title: '🔧 [COMING SOON] ELDRUN Mod Integration - Was kommt als nächstes?',
      author: 'SirEldrun',
      replies: 234,
      views: 12567,
      lastActive: '12 Minuten',
      category: 'Ankündigung',
      pinned: true,
      excerpt: 'Die Map ist fertig, jetzt wird der ELDRUN Mod angepasst! Fraktionsterritorien, Castle-Spots, Custom NPCs und mehr - Updates folgen!'
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // HOT DISCUSSIONS - Intensive Debatten
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'forum-faction-war-debate',
    type: 'forum_thread',
    priority: 150,
    data: {
      title: '🔥 [HEISSE DEBATTE] Seraphar vs Vorgaroth - Wer ist WIRKLICH stärker?',
      author: 'WarAnalyst',
      replies: 847,
      views: 24567,
      lastActive: '5 Minuten',
      category: 'Diskussion',
      pinned: true,
      hot: true,
      excerpt: 'Die ewige Debatte geht weiter! Nach dem letzten Fraktionskrieg haben die Vorgaroth gewonnen, aber Seraphar behauptet, sie waren unterlegen...'
    }
  },
  {
    id: 'forum-pvp-meta-discussion',
    type: 'forum_thread',
    priority: 145,
    data: {
      title: '⚔️ [META] Aktuelle PvP Meta - AK vs LR vs MP5 - Was ist King?',
      author: 'PvPLegend',
      replies: 523,
      views: 18934,
      lastActive: '12 Minuten',
      category: 'PvP',
      pinned: true,
      hot: true,
      excerpt: 'Nach dem letzten Balancing-Patch hat sich die Meta komplett geändert. Hier analysiere ich alle Waffen...'
    }
  },
  {
    id: 'forum-casino-strategies',
    type: 'forum_thread',
    priority: 140,
    data: {
      title: '🎰 [STRATEGIE] Casino Gewinn-Strategien - 500k Chips in 1 Woche!',
      author: 'CasinoKing',
      replies: 389,
      views: 15678,
      lastActive: '20 Minuten',
      category: 'Casino',
      hot: true,
      excerpt: 'Ich habe in einer Woche 500.000 Chips gewonnen! Hier sind meine Strategien für Crash, Blackjack und Slots...'
    }
  },
  {
    id: 'forum-raid-base-tactics',
    type: 'forum_thread',
    priority: 135,
    data: {
      title: '🏰 [GUIDE] Raid Base Solo Clear - Alle Schwierigkeiten!',
      author: 'RaidMaster',
      replies: 267,
      views: 12456,
      lastActive: '35 Minuten',
      category: 'Guides',
      hot: true,
      excerpt: 'Kompletter Guide zum Solo-Clearen aller Raid Bases. Von Easy bis Nightmare - mit Video-Beweis!'
    }
  },
  {
    id: 'forum-economy-analysis',
    type: 'forum_thread',
    priority: 130,
    data: {
      title: '💰 [WIRTSCHAFT] Coin-Inflation auf Eldrun - Ein Problem?',
      author: 'EconomyExpert',
      replies: 456,
      views: 11234,
      lastActive: '1 Stunde',
      category: 'Diskussion',
      hot: true,
      excerpt: 'Die Coin-Preise im Auktionshaus sind in den letzten Wochen explodiert. Ist das Wirtschaftssystem kaputt?'
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // GUIDES & TUTORIALS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'forum-skill-tree-guide',
    type: 'forum_thread',
    priority: 125,
    data: {
      title: '🎯 [MEGA-GUIDE] Alle 20 Skills & 10 Talent Trees erklärt!',
      author: 'SkillMaster',
      replies: 234,
      views: 8945,
      lastActive: '30 Minuten',
      category: 'Guides',
      pinned: true,
      excerpt: 'Der ultimative Guide zu allen Skills! Combat, Gathering, Crafting, Building, Survival und Advanced Skills...'
    }
  },
  {
    id: 'forum-vehicle-showcase',
    type: 'forum_thread',
    priority: 120,
    data: {
      title: '🚁 [SHOWCASE] Alle 50+ Fahrzeuge mit Preisen & Stats!',
      author: 'VehicleKing',
      replies: 156,
      views: 5678,
      lastActive: '1 Stunde',
      category: 'Guides',
      excerpt: 'Von der Pedalbike bis zum Kampfheli - alle Fahrzeuge im Detail mit Kaufpreisen und Fuel-Verbrauch!'
    }
  },
  {
    id: 'forum-castle-defense-ultimate',
    type: 'forum_thread',
    priority: 115,
    data: {
      title: '🏰 [MASTERCLASS] Castle Defense 2.0 - Der komplette Guide!',
      author: 'CastleLord',
      replies: 189,
      views: 7456,
      lastActive: '45 Minuten',
      category: 'Guides',
      excerpt: 'Alle 12 Upgrade-Typen, 6 Verteidigungsarten und die optimale Platzierung für maximalen Schutz!'
    }
  },
  {
    id: 'forum-pet-tier-list',
    type: 'forum_thread',
    priority: 110,
    data: {
      title: '🐉 [TIER LIST] Alle Pets Ranked - S-Tier bis D-Tier!',
      author: 'PetWhisperer',
      replies: 312,
      views: 9890,
      lastActive: '25 Minuten',
      category: 'Guides',
      hot: true,
      excerpt: 'Nach 200+ Stunden Testing: Die definitive Pet Tier List! Drache ist S-Tier, aber der Wolf überrascht...'
    }
  },
  {
    id: 'forum-quest-completion-guide',
    type: 'forum_thread',
    priority: 105,
    data: {
      title: '📜 [100%] Alle 50+ Quests - Kompletter Walkthrough!',
      author: 'QuestHunter',
      replies: 178,
      views: 6234,
      lastActive: '1 Stunde',
      category: 'Guides',
      excerpt: 'Story-Quests, Daily Quests, Clan-Quests - alle Lösungen mit optimalen Routen und Belohnungen!'
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // CLAN & FACTION DISCUSSIONS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'forum-seraphar-recruitment',
    type: 'forum_thread',
    priority: 100,
    data: {
      title: '⚔️ [SERAPHAR] Haus Seraphar rekrutiert Elite-Krieger!',
      author: 'SerapharGeneral',
      replies: 145,
      views: 4567,
      lastActive: '2 Stunden',
      category: 'Clan Recruitment',
      excerpt: 'Die Lichtkrieger suchen Verstärkung! Min. Level 30, K/D 2.0+, Discord Pflicht. Wir bieten...'
    }
  },
  {
    id: 'forum-vorgaroth-dominance',
    type: 'forum_thread',
    priority: 98,
    data: {
      title: '🔥 [VORGAROTH] Die dunkle Legion ist unaufhaltbar!',
      author: 'VorgarothWarlord',
      replies: 234,
      views: 5890,
      lastActive: '1 Stunde',
      category: 'Clan Recruitment',
      excerpt: 'Nach 5 gewonnenen Fraktionskriegen in Folge: Schließt euch den Siegern an! Level 25+ erwünscht...'
    }
  },
  {
    id: 'forum-guild-alliance-proposal',
    type: 'forum_thread',
    priority: 95,
    data: {
      title: '🤝 [ALLIANZ] Vorschlag: Gilden-Allianz gegen Mega-Raids!',
      author: 'DiplomatPrime',
      replies: 189,
      views: 4234,
      lastActive: '3 Stunden',
      category: 'Gilden',
      excerpt: 'Die neuen Nightmare Raid Bases sind zu schwer für einzelne Gilden. Wir brauchen Allianzen!'
    }
  },
  {
    id: 'forum-guild-perks',
    type: 'forum_thread',
    priority: 92,
    data: {
      title: '🛡️ [INFO] Guild Perks & Upgrades - Alle Boni im Überblick',
      author: 'GuildMaster',
      replies: 45,
      views: 1567,
      lastActive: '4 Stunden',
      category: 'Gilden',
      excerpt: 'Crafting Speed +25%, Gather Boost +20%, Combat Damage +10% - So maximiert ihr eure Gilden-Boni!'
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // PVP & COMBAT
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'forum-1v1-tournament',
    type: 'forum_thread',
    priority: 88,
    data: {
      title: '🏆 [TURNIER] 1v1 Tournament - 100.000 Coins Preisgeld!',
      author: 'TournamentHost',
      replies: 278,
      views: 8567,
      lastActive: '15 Minuten',
      category: 'Events',
      hot: true,
      excerpt: 'Anmeldung offen! 32-Spieler Bracket, Double Elimination. Samstag 18:00 Uhr. Regeln im Post...'
    }
  },
  {
    id: 'forum-aim-training',
    type: 'forum_thread',
    priority: 85,
    data: {
      title: '🎯 [TRAINING] Aim verbessern - Meine Routine nach 1000h!',
      author: 'AimGod',
      replies: 167,
      views: 5678,
      lastActive: '2 Stunden',
      category: 'PvP',
      excerpt: 'Von 0.8 K/D auf 3.5 K/D - Hier ist meine tägliche 30-Minuten Aim-Training Routine!'
    }
  },
  {
    id: 'forum-spray-patterns',
    type: 'forum_thread',
    priority: 82,
    data: {
      title: '🔫 [GUIDE] Alle Spray Patterns + Recoil Control Tips!',
      author: 'SprayMaster',
      replies: 145,
      views: 4890,
      lastActive: '1 Stunde',
      category: 'PvP',
      excerpt: 'AK, LR, MP5, Thompson - Alle Spray Patterns mit GIFs und Übungstipps!'
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // TRADING & ECONOMY
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'forum-auction-house-flipping',
    type: 'forum_thread',
    priority: 78,
    data: {
      title: '💎 [REICH WERDEN] Auction House Flipping - 1M Coins/Woche!',
      author: 'MarketMogul',
      replies: 234,
      views: 7890,
      lastActive: '45 Minuten',
      category: 'Economy',
      hot: true,
      excerpt: 'Ich habe in einem Monat 4 Millionen Coins nur durch Auction House Trading gemacht. Hier ist wie...'
    }
  },
  {
    id: 'forum-trading-post',
    type: 'forum_thread',
    priority: 75,
    data: {
      title: '🔄 [TRADING] Megathread - Kaufen/Verkaufen/Tauschen!',
      author: 'TraderJoe',
      replies: 567,
      views: 12345,
      lastActive: '10 Minuten',
      category: 'Trading',
      pinned: true,
      excerpt: 'Der offizielle Trading Thread! Postet eure Angebote im Format: [H] Habe [W] Will'
    }
  },
  {
    id: 'forum-black-market-finds',
    type: 'forum_thread',
    priority: 72,
    data: {
      title: '🖤 [SCHWARZMARKT] Beste Finds dieser Woche!',
      author: 'BlackMarketHunter',
      replies: 89,
      views: 3456,
      lastActive: '3 Stunden',
      category: 'Economy',
      excerpt: 'Der Schwarzmarkt hatte diese Woche krasse Items! Legendary Skin für nur 50k Coins gesehen...'
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // BUILDING & BASE DESIGN
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'forum-base-designs-2024',
    type: 'forum_thread',
    priority: 68,
    data: {
      title: '🏠 [2024] Beste Base Designs - Solo, Duo, Trio, Gruppe!',
      author: 'ArchitectPro',
      replies: 234,
      views: 8567,
      lastActive: '1 Stunde',
      category: 'Building',
      excerpt: 'Meine Top 10 Base Designs für jede Teamgröße. Mit Baukosten, Raid-Kosten und Build-Videos!'
    }
  },
  {
    id: 'forum-anti-raid-designs',
    type: 'forum_thread',
    priority: 65,
    data: {
      title: '🛡️ [ANTI-RAID] Unraidbare Base? Meine Erfahrungen!',
      author: 'DefenseKing',
      replies: 178,
      views: 5678,
      lastActive: '2 Stunden',
      category: 'Building',
      excerpt: 'Nach 50+ überlebten Raids: Diese Design-Prinzipien machen eure Base fast unraidbar!'
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // BUGS & SUPPORT
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'forum-known-bugs',
    type: 'forum_thread',
    priority: 60,
    data: {
      title: '🐛 [STICKY] Bekannte Bugs - Aktueller Stand!',
      author: 'BugTracker',
      replies: 145,
      views: 4567,
      lastActive: '30 Minuten',
      category: 'Bug Reports',
      pinned: true,
      excerpt: 'Offizielle Liste aller bekannten Bugs mit Status: Fixed, In Progress, Investigating...'
    }
  },
  {
    id: 'forum-performance-tips',
    type: 'forum_thread',
    priority: 58,
    data: {
      title: '⚡ [FPS] Performance optimieren - Von 30 auf 120 FPS!',
      author: 'TechGuru',
      replies: 267,
      views: 9876,
      lastActive: '1 Stunde',
      category: 'Support',
      excerpt: 'Kompletter Guide zur FPS-Optimierung. Grafik-Settings, Config-Tweaks, Hardware-Tipps!'
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // SUGGESTIONS & FEEDBACK
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'forum-feature-requests',
    type: 'forum_thread',
    priority: 55,
    data: {
      title: '💡 [VORSCHLÄGE] Feature Request Megathread!',
      author: 'CommunityVoice',
      replies: 456,
      views: 7890,
      lastActive: '20 Minuten',
      category: 'Feedback',
      pinned: true,
      excerpt: 'Eure Ideen für Eldrun! Die Devs lesen hier mit. Top-Vorschläge werden umgesetzt!'
    }
  },
  {
    id: 'forum-balance-feedback',
    type: 'forum_thread',
    priority: 52,
    data: {
      title: '⚖️ [BALANCE] Patch 3.2.1 Feedback - Was muss geändert werden?',
      author: 'BalanceWatcher',
      replies: 345,
      views: 6789,
      lastActive: '45 Minuten',
      category: 'Feedback',
      hot: true,
      excerpt: 'Der neue Patch hat einiges verändert. Hier sammeln wir konstruktives Feedback!'
    }
  },
  // ═══════════════════════════════════════════════════════════════
  // OFF-TOPIC & COMMUNITY
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'forum-introduce-yourself',
    type: 'forum_thread',
    priority: 48,
    data: {
      title: '👋 [VORSTELLUNG] Stellt euch vor!',
      author: 'CommunityManager',
      replies: 678,
      views: 12345,
      lastActive: '5 Minuten',
      category: 'Community',
      pinned: true,
      excerpt: 'Neu auf Eldrun? Stellt euch hier vor! Woher kommt ihr, was spielt ihr sonst?'
    }
  },
  {
    id: 'forum-memes',
    type: 'forum_thread',
    priority: 45,
    data: {
      title: '😂 [MEMES] Eldrun Meme Thread - Nur das Beste!',
      author: 'MemeLord',
      replies: 1234,
      views: 34567,
      lastActive: '2 Minuten',
      category: 'Off-Topic',
      hot: true,
      excerpt: 'Die besten Eldrun Memes! Regel: Keine Reposts, muss Eldrun-bezogen sein!'
    }
  },
  {
    id: 'forum-screenshots',
    type: 'forum_thread',
    priority: 42,
    data: {
      title: '📸 [GALERIE] Eure besten Screenshots!',
      author: 'Photographer',
      replies: 567,
      views: 15678,
      lastActive: '30 Minuten',
      category: 'Community',
      excerpt: 'Teilt eure epischsten Momente! Sonnenuntergänge, Raids, PvP-Kills, Base-Designs...'
    }
  },
]

// Clan Spotlights
export const CLAN_SPOTLIGHTS: ContentItem[] = [
  {
    id: 'clan-dragons',
    type: 'clan_spotlight',
    priority: 78,
    data: {
      name: 'DoC',
      fullName: 'Dragons of Chaos',
      members: 24,
      territory: 5,
      totalKills: 15847,
      description: 'Die älteste und mächtigste Gilde auf ELDRUN. Vorgaroth-Fraktion.',
      achievements: ['First Blood', 'Territory King', 'Legendary Guild'],
      faction: 'vorgaroth'
    }
  },
  {
    id: 'clan-knights',
    type: 'clan_spotlight',
    priority: 74,
    data: {
      name: 'KoL',
      fullName: 'Knights of Light',
      members: 28,
      territory: 4,
      totalKills: 14523,
      description: 'Für Ehre und Ruhm! Die Elite der Seraphar Fraktion.',
      achievements: ['Honor Guard', 'Castle Defender', 'Full House'],
      faction: 'seraphar'
    }
  },
  {
    id: 'clan-shadow',
    type: 'clan_spotlight',
    priority: 66,
    data: {
      name: 'SHA',
      fullName: 'Shadow Assassins',
      members: 18,
      territory: 3,
      totalKills: 12456,
      description: 'Lautlos, tödlich, effektiv. Vorgaroth Stealth-Experten.',
      achievements: ['Silent Killers', 'Night Owls', 'Killer Guild'],
      faction: 'vorgaroth'
    }
  },
]

// Player Spotlights
export const PLAYER_SPOTLIGHTS: ContentItem[] = [
  {
    id: 'player-deathbringer',
    type: 'player_spotlight',
    priority: 74,
    data: {
      name: 'DeathBringer',
      clan: 'APEX',
      kills: 2847,
      kd: 6.73,
      playtime: 847,
      achievement: 'Kill King Season 12',
      quote: 'In Rust vertraue niemandem - außer deiner AK.',
    }
  },
  {
    id: 'player-rustlord',
    type: 'player_spotlight',
    priority: 64,
    data: {
      name: 'RustLord',
      clan: 'VOID',
      kills: 2156,
      kd: 5.42,
      playtime: 692,
      achievement: 'Base Architect',
      quote: 'Jede Base hat eine Schwachstelle.',
    }
  },
]

// Server Events
export const EVENT_ITEMS: ContentItem[] = [
  {
    id: 'event-helicopter',
    type: 'server_event',
    priority: 88,
    data: {
      title: 'Helicopter Event',
      description: 'Der Attack Helicopter spawnt in 30 Minuten!',
      type: 'helicopter',
      countdown: true,
      reward: 'Military Grade Loot',
    }
  },
  {
    id: 'event-cargo',
    type: 'server_event',
    priority: 82,
    data: {
      title: 'Cargo Ship Incoming',
      description: 'Das Cargo Ship nähert sich der Küste!',
      type: 'cargo',
      countdown: false,
      reward: 'Elite Crates',
    }
  },
]

// Gallery Items
export const GALLERY_ITEMS: ContentItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 🗺️ ELDRUN MAP GALLERY - Alle Screenshots!
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'gallery-map-overview',
    type: 'gallery',
    priority: 999,
    data: {
      title: '🗺️ ELDRUN MAP - Die komplette Übersicht!',
      images: [
        '/images/eldrun-map.jpg',
        '/images/screenshots/screenshot-0001.png',
        '/images/screenshots/screenshot-0002.png',
      ],
      author: 'SirEldrun',
      likes: 8934,
      description: 'Die offizielle ELDRUN Rust Map aus der Vogelperspektive! 4500 Size, 113k Prefabs.',
    }
  },
  {
    id: 'gallery-west-coast-casino',
    type: 'gallery',
    priority: 998,
    data: {
      title: '🎰 West Coast Casino - Innen & Außen!',
      images: [
        '/images/screenshots/screenshot-0001.png',
        '/images/screenshots/screenshot-0002.png',
        '/images/screenshots/v120-001.jpg',
      ],
      author: 'CasinoExplorer',
      likes: 5678,
      description: 'Das legendäre West Coast Casino mit seinem komplexen Puzzle-System!',
    }
  },
  {
    id: 'gallery-bradley-arena',
    type: 'gallery',
    priority: 997,
    data: {
      title: '⚔️ Bradley Arena - Die ultimative Challenge!',
      images: [
        '/images/screenshots/screenshot-0003.png',
        '/images/screenshots/screenshot-0004.png',
        '/images/screenshots/v120-002.jpg',
      ],
      author: 'TankSlayer',
      likes: 4567,
      description: 'Die massive Bradley Arena mit patrouillierendem Tank!',
    }
  },
  {
    id: 'gallery-skytrain-network',
    type: 'gallery',
    priority: 996,
    data: {
      title: '🚂 Skytrain Netzwerk - 6 Stationen!',
      images: [
        '/images/screenshots/screenshot-0005.png',
        '/images/screenshots/screenshot-0006.png',
        '/images/screenshots/v120-003.jpg',
      ],
      author: 'TrainEngineer',
      likes: 3456,
      description: 'Das Skytrain-System mit 63 Railroads verbindet die gesamte Map!',
    }
  },
  {
    id: 'gallery-apartments',
    type: 'gallery',
    priority: 995,
    data: {
      title: '🏢 Abandoned Apartments - Vertikales Looting!',
      images: [
        '/images/screenshots/screenshot-0007.png',
        '/images/screenshots/screenshot-0008.png',
        '/images/screenshots/v120-004.jpg',
      ],
      author: 'UrbanExplorer',
      likes: 2890,
      description: 'Mehrstöckige Apartment-Gebäude mit durchsuchbaren Wohneinheiten!',
    }
  },
  {
    id: 'gallery-diners',
    type: 'gallery',
    priority: 994,
    data: {
      title: '🍔 Die 4 Diner - Anfänger-Paradiese!',
      images: [
        '/images/screenshots/screenshot-0009.png',
        '/images/screenshots/screenshot-0010.png',
        '/images/screenshots/v120-005.jpg',
      ],
      author: 'FoodRunner',
      likes: 2345,
      description: 'Kleine Monumente perfekt für Anfänger mit Food, Components und Scrap!',
    }
  },
  {
    id: 'gallery-habitable-zones',
    type: 'gallery',
    priority: 993,
    data: {
      title: '🏕️ Bebaubare Zonen - Base bauen im Monument!',
      images: [
        '/images/screenshots/screenshot-0011.png',
        '/images/screenshots/screenshot-0012.png',
        '/images/screenshots/v120-006.jpg',
      ],
      author: 'BaseBuilder',
      likes: 3789,
      description: 'Nodedust Park und Oil Swamps - die einzigen bebaubaren Monumente!',
    }
  },
  {
    id: 'gallery-oil-swamps',
    type: 'gallery',
    priority: 992,
    data: {
      title: '🛢️ Oil Swamps - Öl-Farm Paradise!',
      images: [
        '/images/screenshots/screenshot-0013.png',
        '/images/screenshots/screenshot-0014.png',
        '/images/screenshots/v120-007.jpg',
      ],
      author: 'OilBaron',
      likes: 2456,
      description: 'Versunkenes Sumpfland mit Crude Oil aus einer kollabierten Fabrik!',
    }
  },
  {
    id: 'gallery-lighthouses',
    type: 'gallery',
    priority: 991,
    data: {
      title: '🗼 Custom Lighthouses - Klippen-Aussichten!',
      images: [
        '/images/screenshots/screenshot-0015.png',
        '/images/screenshots/screenshot-0016.png',
        '/images/screenshots/v120-008.jpg',
      ],
      author: 'CliffWatcher',
      likes: 2123,
      description: 'Einzigartige Leuchttürme auf hohen Klippen mit 360° Panorama!',
    }
  },
  {
    id: 'gallery-safezones',
    type: 'gallery',
    priority: 990,
    data: {
      title: '🎨 Safe Zones - Art Gallery & Skatepark!',
      images: [
        '/images/screenshots/screenshot-0017.png',
        '/images/screenshots/screenshot-0018.png',
        '/images/screenshots/v120-009.jpg',
      ],
      author: 'PeaceLover',
      likes: 1890,
      description: 'Friedliche Zonen ohne PvP - male Kunst oder fahre Bikes!',
    }
  },
  {
    id: 'gallery-skatepark',
    type: 'gallery',
    priority: 989,
    data: {
      title: '🛹 Skatepark - Bike & Chill Zone!',
      images: [
        '/images/screenshots/screenshot-0019.png',
        '/images/screenshots/screenshot-0020.png',
        '/images/screenshots/v120-010.jpg',
      ],
      author: 'BikeRider',
      likes: 1678,
      description: 'Der perfekte Ort zum Entspannen und die neuen Bikes zu testen!',
    }
  },
  {
    id: 'gallery-mini-mall',
    type: 'gallery',
    priority: 988,
    data: {
      title: '🏬 Mini-Mall - 4 Läden voller Loot!',
      images: [
        '/images/screenshots/screenshot-0021.png',
        '/images/screenshots/screenshot-0022.png',
        '/images/screenshots/v120-011.jpg',
      ],
      author: 'ShopRaider',
      likes: 2234,
      description: 'Shopping-Center mit Supermarkt und 3 weiteren Geschäften!',
    }
  },
  {
    id: 'gallery-fruitstand',
    type: 'gallery',
    priority: 987,
    data: {
      title: '🍎 Roadside Fruitstand - Mikro-Monument!',
      images: [
        '/images/screenshots/screenshot-0023.png',
        '/images/screenshots/v120-012.jpg',
      ],
      author: 'FruitFarmer',
      likes: 987,
      description: 'Kleiner Fruchtstand am Straßenrand nahe Junkyard!',
    }
  },
  {
    id: 'gallery-bus-depot',
    type: 'gallery',
    priority: 986,
    data: {
      title: '🚌 Bus Depot - Green Card Puzzle!',
      images: [
        '/images/screenshots/screenshot-0024.png',
        '/images/screenshots/screenshot-0025.png',
        '/images/screenshots/v120-014.jpg',
      ],
      author: 'PuzzleMaster',
      likes: 1567,
      description: 'Neues Green Card Monument nahe Hafen und Skytrain!',
    }
  },
  {
    id: 'gallery-landscapes',
    type: 'gallery',
    priority: 985,
    data: {
      title: '🌄 ELDRUN Landschaften - Atemberaubend!',
      images: [
        '/images/screenshots/screenshot-0026.png',
        '/images/screenshots/screenshot-0027.png',
        '/images/screenshots/screenshot-0028.png',
      ],
      author: 'LandscapePhoto',
      likes: 4567,
      description: 'Die schönsten Panoramen und Aussichtspunkte der Map!',
    }
  },
  {
    id: 'gallery-vanilla-monuments',
    type: 'gallery',
    priority: 984,
    data: {
      title: '🏛️ Vanilla Monuments - Klassiker neu entdeckt!',
      images: [
        '/images/screenshots/v120-015.jpg',
        '/images/screenshots/v120-016.jpg',
        '/images/screenshots/v120-017.jpg',
      ],
      author: 'MonumentHunter',
      likes: 2345,
      description: 'Die klassischen Facepunch Monumente auf ELDRUN!',
    }
  },
  {
    id: 'gallery-oil-rigs',
    type: 'gallery',
    priority: 983,
    data: {
      title: '🛢️ Oil Rigs - Large & Small!',
      images: [
        '/images/screenshots/v120-018.jpg',
        '/images/screenshots/v120-019.jpg',
        '/images/screenshots/v120-020.jpg',
      ],
      author: 'RigRunner',
      likes: 3456,
      description: 'Beide Ölplattformen mit Elite-Loot und Heavy Scientists!',
    }
  },
  {
    id: 'gallery-harbors',
    type: 'gallery',
    priority: 982,
    data: {
      title: '⚓ Häfen - Large & Small Harbor!',
      images: [
        '/images/screenshots/v120-021.jpg',
        '/images/screenshots/v120-022.jpg',
        '/images/screenshots/monument-01.png',
      ],
      author: 'PortMaster',
      likes: 1890,
      description: 'Die Häfen der ELDRUN Map mit Puzzle-Bereichen und Diving Loot!',
    }
  },
  {
    id: 'gallery-arctic-zone',
    type: 'gallery',
    priority: 981,
    data: {
      title: '❄️ Arctic Zone - Eisige Schönheit!',
      images: [
        '/images/screenshots/monument-02.png',
        '/images/screenshots/monument-03.png',
        '/images/screenshots/monument-04.png',
      ],
      author: 'IceWalker',
      likes: 2678,
      description: '20% der Map ist Arctic - gefrorene Landschaften und die Research Base!',
    }
  },
  {
    id: 'gallery-cinematic-shots',
    type: 'gallery',
    priority: 980,
    data: {
      title: '🎬 Cinematic Shots - Film-Qualität!',
      images: [
        '/images/screenshots/Sequence01.00_00_13_.png',
        '/images/screenshots/Sequence01.00_00_25_.png',
        '/images/screenshots/Sequence01.00_00_34_.png',
      ],
      author: 'CinematicPro',
      likes: 5678,
      description: 'Professionelle Videoaufnahmen von der ELDRUN Map!',
    }
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 EXTRA SCREENSHOTS - Community Highlights
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'gallery-community-extra-1',
    type: 'gallery',
    priority: 975,
    data: {
      title: '🎯 Community Highlights - Versteckte Orte!',
      images: [
        '/images/screenshots/extra-01.jpg',
        '/images/screenshots/extra-02.png',
        '/images/screenshots/extra-03.jpg',
      ],
      author: 'CommunityHunter',
      likes: 1456,
      description: 'Von der Community entdeckte geheime Locations auf der ELDRUN Map!',
    }
  },
  {
    id: 'gallery-community-extra-2',
    type: 'gallery',
    priority: 974,
    data: {
      title: '📸 Spieler-Screenshots - Beste Momente!',
      images: [
        '/images/screenshots/extra-04.jpg',
        '/images/screenshots/extra-05.jpg',
        '/images/screenshots/extra-06.jpg',
      ],
      author: 'ScreenshotMaster',
      likes: 1234,
      description: 'Die besten Momentaufnahmen unserer Community auf der neuen Map!',
    }
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // CLASSIC GALLERY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'gallery-faction-war-epic',
    type: 'gallery',
    priority: 156,
    data: {
      title: '⚔️ Fraktionskrieg - Die epischsten Momente!',
      images: [
        '/images/gameplay/battle-scene.png',
        '/images/backgrounds/war-scene.png',
        '/images/gameplay/siege-battle.png',
      ],
      author: 'WarPhotographer',
      likes: 2456,
      description: 'Die besten Screenshots vom Kampf um Himmelstor Citadel',
    }
  },
  {
    id: 'gallery-castle-designs',
    type: 'gallery',
    priority: 135,
    data: {
      title: '🏰 Top 10 Castle Designs der Woche',
      images: [
        '/images/gameplay/castle-siege.png',
        '/images/gameplay/night-assault.png',
      ],
      author: 'ArchitectPro',
      likes: 1892,
      description: 'Von der Community gewählt - die beeindruckendsten Burgen',
    }
  },
  {
    id: 'gallery-dragon-boss-kill',
    type: 'gallery',
    priority: 128,
    data: {
      title: '🐉 WORLD FIRST: Frost Dragon Kill!',
      images: [
        '/images/bosses/toxic-golem.png',
        '/images/gameplay/arena-battle.png',
      ],
      author: 'DragonSlayers',
      likes: 3421,
      description: 'Phoenix Rising vs Frost Dragon - Der epische Kampf',
    }
  },
  {
    id: 'gallery-casino-jackpot',
    type: 'gallery',
    priority: 118,
    data: {
      title: '🎰 Casino Jackpot Hall of Fame',
      images: [
        '/images/icons/icon_gambling.svg',
      ],
      author: 'CasinoMaster',
      likes: 1567,
      description: 'Die größten Gewinne in der Geschichte von Eldrun Casino',
    }
  },
  {
    id: 'gallery-pvp-highlights',
    type: 'gallery',
    priority: 105,
    data: {
      title: '🎯 PvP Highlights - Best Clips Dezember',
      images: [
        '/images/gameplay/epic-duel.png',
        '/images/backgrounds/kings-bridge.svg',
      ],
      author: 'PvPLegend',
      likes: 2134,
      description: '1v5 Clutches, Headshots & mehr',
    }
  },
  {
    id: 'gallery-base-showcase',
    type: 'gallery',
    priority: 94,
    data: {
      title: 'Community Base Showcase',
      images: [
        '/images/gameplay/night-assault.png',
        '/images/gameplay/epic-duel.png',
      ],
      author: 'BaseBuilder',
      likes: 834,
    }
  },
  {
    id: 'gallery-sunset-screenshots',
    type: 'gallery',
    priority: 85,
    data: {
      title: '🌅 Sonnenuntergänge auf Eldrun',
      images: [
        '/images/backgrounds/epic-landscape.png',
        '/images/backgrounds/castle-storm.svg',
      ],
      author: 'Photographer',
      likes: 1234,
      description: 'Die Custom Map ist einfach wunderschön',
    }
  },
  {
    id: 'gallery-raid-moments',
    type: 'gallery',
    priority: 76,
    data: {
      title: 'Epic Raid Moments',
      images: [
        '/images/gameplay/siege-battle.png',
      ],
      author: 'RaidMaster',
      likes: 967,
    }
  },
  {
    id: 'gallery-pet-collection',
    type: 'gallery',
    priority: 68,
    data: {
      title: '🐺 Legendäre Pet Collection',
      images: [
        '/images/bosses/toxic-golem.png',
      ],
      author: 'PetWhisperer',
      likes: 756,
      description: 'Alle seltenen Pets in einem Showcase',
    }
  },
]

// Polls
export const POLL_ITEMS: ContentItem[] = [
  {
    id: 'poll-map-size',
    type: 'poll',
    priority: 58,
    data: {
      question: 'Welche Map-Größe bevorzugst du?',
      options: [
        { text: '3000 (Klein)', votes: 23 },
        { text: '4000 (Medium)', votes: 67 },
        { text: '5000 (Groß)', votes: 45 },
      ],
      totalVotes: 135,
      endsIn: '2 Tage',
    }
  },
  {
    id: 'poll-wipe-schedule',
    type: 'poll',
    priority: 44,
    data: {
      question: 'Wann sollte der Wipe stattfinden?',
      options: [
        { text: 'Donnerstag 18:00', votes: 89 },
        { text: 'Freitag 18:00', votes: 56 },
        { text: 'Samstag 12:00', votes: 34 },
      ],
      totalVotes: 179,
      endsIn: '5 Tage',
    }
  },
]

// Stats Highlights
export const STATS_ITEMS: ContentItem[] = [
  {
    id: 'stats-weekly',
    type: 'stats_highlight',
    priority: 76,
    data: {
      title: 'Diese Woche auf Eldrun',
      stats: [
        { label: 'Kills insgesamt', value: 24567 },
        { label: 'Raids durchgeführt', value: 1234 },
        { label: 'Basen gebaut', value: 567 },
        { label: 'Spielstunden', value: 8901 },
      ],
    }
  },
  {
    id: 'stats-records',
    type: 'stats_highlight',
    priority: 42,
    data: {
      title: 'Server Rekorde',
      stats: [
        { label: 'Höchste Killstreak', value: 47, holder: 'DeathBringer' },
        { label: 'Größte Base', value: '142 Foundations', holder: 'MegaBuilder' },
        { label: 'Längster Überlebenszeit', value: '72h', holder: 'Survivor' },
      ],
    }
  },
]

// Guides
export const GUIDE_ITEMS: ContentItem[] = [
  {
    id: 'guide-electricity',
    type: 'guide',
    priority: 67,
    data: {
      title: 'Elektrizitäts-Guide',
      description: 'Alles über Solarpanels, Batterien und automatische Türen.',
      chapters: 5,
      readTime: '25 min',
      difficulty: 'Fortgeschritten',
    }
  },
  {
    id: 'guide-monuments',
    type: 'guide',
    priority: 59,
    data: {
      title: 'Monument Guide',
      description: 'Alle Monuments erklärt: Loot, Gefahren und Strategien.',
      chapters: 12,
      readTime: '45 min',
      difficulty: 'Alle Level',
    }
  },
]

// Update Logs
export const UPDATE_ITEMS: ContentItem[] = [
  {
    id: 'update-v3-2-1',
    type: 'update_log',
    priority: 155,
    data: {
      version: '3.2.1',
      date: '2024-12-22',
      changes: [
        '🎰 Dragon\'s Throne Casino-Spiel hinzugefügt',
        '⚔️ Fraktionskrieg-Mechaniken überarbeitet',
        '🛡️ Castle Defense 2.0 mit neuen Türmen',
        '🐉 5 neue legendäre Pets verfügbar',
        '💰 Wirtschaftssystem balanciert',
        '🔧 Über 50 Bugfixes',
      ],
    }
  },
  {
    id: 'update-v3-2-0',
    type: 'update_log',
    priority: 140,
    data: {
      version: '3.2.0',
      date: '2024-12-18',
      changes: [
        '🏰 Neues Territory Control System',
        '📜 50+ neue Quests hinzugefügt',
        '🎨 Custom Skin Creator für VIPs',
        '⚡ XP-System komplett überarbeitet',
        '🔊 Neues Sound-Design',
      ],
    }
  },
  {
    id: 'update-v3-1-5',
    type: 'update_log',
    priority: 120,
    data: {
      version: '3.1.5',
      date: '2024-12-15',
      changes: [
        '🚁 10 neue Custom Vehicles',
        '💎 Auction House Redesign',
        '🎯 PvP Balancing Update',
        '🏠 Neue Base-Komponenten',
      ],
    }
  },
  {
    id: 'update-v3-1-0',
    type: 'update_log',
    priority: 100,
    data: {
      version: '3.1.0',
      date: '2024-12-10',
      changes: [
        '🎰 Casino komplett überarbeitet',
        '👑 VIP Diamond Tier eingeführt',
        '⚔️ Clan Wars System',
        '📊 Neue Leaderboards',
      ],
    }
  },
  {
    id: 'update-v3-0-5',
    type: 'update_log',
    priority: 80,
    data: {
      version: '3.0.5',
      date: '2024-12-05',
      changes: [
        '🐺 Pet-System eingeführt',
        '🏆 Achievement-System erweitert',
        '🔐 Anti-Cheat verbessert',
      ],
    }
  },
  {
    id: 'update-v3-0-0',
    type: 'update_log',
    priority: 60,
    data: {
      version: '3.0.0',
      date: '2024-12-01',
      changes: [
        '🎉 ELDRUN SEASON 4 START!',
        '🗺️ Neue Custom Map',
        '⚔️ Seraphar vs Vorgaroth Fraktionen',
        '🏰 Castle-System Einführung',
        '💰 Neue Wirtschaft',
      ],
    }
  },
  {
    id: 'update-v1-5',
    type: 'update_log',
    priority: 40,
    data: {
      version: '1.5.0',
      date: '2024-11-14',
      changes: [
        'Neues VIP-System hinzugefügt',
        'Performance-Verbesserungen',
        'Bug fixes für Türen',
        'Neue Custom-Skins verfügbar',
      ],
    }
  },
  {
    id: 'update-v1-4',
    type: 'update_log',
    priority: 30,
    data: {
      version: '1.4.2',
      date: '2024-11-07',
      changes: [
        'Anti-Cheat Update',
        'Clan-System verbessert',
        'Neue Events hinzugefügt',
      ],
    }
  },
]

// Community Posts
export const COMMUNITY_ITEMS: ContentItem[] = [
  // === LORE & FACTION DISCUSSIONS ===
  {
    id: 'community-lore-discovery',
    type: 'community_post',
    priority: 148,
    data: {
      author: 'LoreMaster',
      content: '📜 ENTDECKUNG! In den alten Ruinen unter dem Schlachtfeld habe ich Schriften gefunden, die von einer DRITTEN Macht sprechen - den "Erbauern". Weder Seraphar noch Vorgaroth... Wer waren sie? Thread folgt im Forum! 🔮',
      likes: 1247,
      comments: 342,
      timeAgo: '15 Minuten',
    }
  },
  {
    id: 'community-faction-debate',
    type: 'community_post',
    priority: 142,
    data: {
      author: 'VorgarothShade',
      content: '⚔️ Die Seraphar behaupten, sie kämpfen für das "Licht"? Ha! Wer hat denn die neutralen Völker unterworfen? Wer hat Dörfer niedergebrannt? Die Geschichte wird von den Siegern geschrieben - und wir werden diese Geschichte umschreiben! 🔥',
      likes: 892,
      comments: 567,
      timeAgo: '32 Minuten',
    }
  },
  {
    id: 'community-seraphar-response',
    type: 'community_post',
    priority: 138,
    data: {
      author: 'SerapharCaptain',
      content: '@VorgarothShade Propaganda der Dunkelheit! Eure "verbotenen Glyphen" haben DÖRFER zerstört! Die Seraphar haben das Land BESCHÜTZT. Die alten Chroniken sind eindeutig. Aber ich erwarte nicht, dass jemand der die Dunkelheit anbetet, die Wahrheit akzeptiert... 🪽',
      likes: 756,
      comments: 423,
      timeAgo: '28 Minuten',
    }
  },
  {
    id: 'community-neutral-perspective',
    type: 'community_post',
    priority: 130,
    data: {
      author: 'TradeBaron',
      content: '💰 Als Neutraler sage ich nur: Beide Seiten haben Dreck am Stecken. Ich habe Handelsdokumente aus der Vorkriegszeit - BEIDE Fraktionen haben die Neutralen ausgebeutet. Übrigens, Runenstahl +35% heute! 📈',
      likes: 567,
      comments: 234,
      timeAgo: '45 Minuten',
    }
  },
  
  // === CASINO & WINS ===
  {
    id: 'community-mega-jackpot',
    type: 'community_post',
    priority: 165,
    data: {
      author: 'LuckyLuke777',
      content: '🎰💰 2.347.890 COINS JACKPOT IM CRASH!!! 147x MULTIPLIKATOR!!! ICH ZITTERE NOCH!!! Das ist der 3. größte Win in der Eldrun Geschichte! VIP hier ich komme! 🚀🚀🚀',
      image: '/images/icons/icon_gambling.svg',
      likes: 2456,
      comments: 892,
      timeAgo: '1 Stunde',
    }
  },
  {
    id: 'community-casino-strategy',
    type: 'community_post',
    priority: 125,
    data: {
      author: 'CasinoKing',
      content: '🧠 Pro-Tipp für Dragon\'s Throne: Setzt NIE alles auf einen Drachen. Splittet 60/30/10 auf die drei Drachen. Meine Winrate ist von 35% auf 52% gestiegen! Ausführlicher Guide im Forum. 🐉',
      likes: 789,
      comments: 234,
      timeAgo: '2 Stunden',
    }
  },
  {
    id: 'community-casino-loss',
    type: 'community_post',
    priority: 98,
    data: {
      author: 'SadGambler',
      content: '😭 500k im Crash verloren... bin bei 1.8x ausgestiegen und es ging auf 87x. Wann lerne ich es endlich? Trotzdem: Das Casino hier ist fair, keine Beschwerden. Morgen neuer Versuch! 💪',
      likes: 345,
      comments: 156,
      timeAgo: '3 Stunden',
    }
  },
  
  // === PVP & RAIDS ===
  {
    id: 'community-epic-raid',
    type: 'community_post',
    priority: 136,
    data: {
      author: 'RaidMaster',
      content: '🏰 EPIC RAID ALERT! Wir haben gerade die "Unraidbare" Base von MegaBuilder geknackt! 48 Raketen, 3 Stunden, 15 Mann Squad. Der Loot war... enttäuschend. Aber die EHRE! 💥 Video kommt heute Abend!',
      image: '/images/gameplay/siege-battle.png',
      likes: 1123,
      comments: 345,
      timeAgo: '1.5 Stunden',
    }
  },
  {
    id: 'community-1v5-clutch',
    type: 'community_post',
    priority: 128,
    data: {
      author: 'DeathBringer',
      content: '🎯 1v5 CLUTCH bei Oil Rig! Sie hatten Full Metal, ich hatte Crossbow und Träume. 47 Sekunden später: 5 Körper, 0 Deaths. Clip ist auf meinem Twitch! Die AK ist immer noch King. 👑',
      likes: 1567,
      comments: 412,
      timeAgo: '2.5 Stunden',
    }
  },
  {
    id: 'community-revenge-raid',
    type: 'community_post',
    priority: 115,
    data: {
      author: 'VengeanceSeeker',
      content: '⚔️ Vor 3 Tagen hat Iron Legion unsere Base offline geraided. Heute Nacht: REVENGE! 200 Rockets ready, 25 Mann online. Wer dabei sein will - Discord Link in Bio. Es wird EPISCH! 🔥',
      likes: 678,
      comments: 234,
      timeAgo: '4 Stunden',
    }
  },
  
  // === COMMUNITY & SOCIAL ===
  {
    id: 'community-newbie-welcome',
    type: 'community_post',
    priority: 105,
    data: {
      author: 'CommunityManager',
      content: '👋 Willkommen an alle 47 neuen Spieler diese Woche! Eldrun ist eine Familie. Fragt im Chat wenn ihr Hilfe braucht - die Community ist super freundlich. Außer im PvP. Da kennen wir keine Gnade. 😈',
      likes: 456,
      comments: 89,
      timeAgo: '5 Stunden',
    }
  },
  {
    id: 'community-meme',
    type: 'community_post',
    priority: 95,
    data: {
      author: 'MemeKing',
      content: 'Wenn du 4 Stunden farmst und dann von einem Naked mit Eoka gekillt wirst 😭 Die Eldrun Experience™',
      likes: 1234,
      comments: 345,
      timeAgo: '3 Stunden',
    }
  },
  {
    id: 'community-screenshot',
    type: 'community_post',
    priority: 88,
    data: {
      author: 'ScreenshotPro',
      content: '📸 Sonnenuntergang bei meiner neuen Castle. Eldrun ist einfach wunderschön! Die Custom Map ist ein Kunstwerk. 🎨',
      image: '/images/backgrounds/epic-landscape.svg',
      likes: 567,
      comments: 23,
      timeAgo: '6 Stunden',
    }
  },
  {
    id: 'community-blacklist-reaction',
    type: 'community_post',
    priority: 92,
    data: {
      author: 'FairPlayer',
      content: '☠️ Endlich die Blacklist-Seite! Zero Tolerance ist der richtige Weg. Cheater haben auf Eldrun nichts verloren! Danke Admins! 🙏',
      likes: 892,
      comments: 156,
      timeAgo: '1 Stunde',
    }
  },
  {
    id: 'community-faction-war',
    type: 'community_post',
    priority: 84,
    data: {
      author: 'SerapharChampion',
      content: '⚔️ SERAPHAR führt im Fraktionskrieg! 2.847 zu 2.651 - Vorgaroth, ihr habt keine Chance! Das Licht siegt IMMER! 🔥',
      likes: 456,
      comments: 234,
      timeAgo: '2 Stunden',
    }
  },
  {
    id: 'community-casino-win',
    type: 'community_post',
    priority: 71,
    data: {
      author: 'LuckyGambler',
      content: '🎰 JACKPOT! Gerade 250.000 Coins im Casino gewonnen! Das Wheel of Fortune ist mein Freund! 💰',
      image: '/images/icons/icon_gambling.svg',
      likes: 678,
      comments: 89,
      timeAgo: '4 Stunden',
    }
  },
  {
    id: 'community-guild-victory',
    type: 'community_post',
    priority: 63,
    data: {
      author: 'PhoenixLeader',
      content: '🏆 Phoenix Rising hat gerade Castle Nordwall erobert! GG an Iron Legion für den epischen Kampf!',
      likes: 345,
      comments: 67,
      timeAgo: '5 Stunden',
    }
  },
  {
    id: 'community-artifact-hunt',
    type: 'community_post',
    priority: 57,
    data: {
      author: 'ArtifactSeeker',
      content: '👑 Wer hat gerade die Krone der ewigen Herrschaft? Der letzte Träger wurde bei Artifact Island Beta gesichtet!',
      likes: 234,
      comments: 78,
      timeAgo: '7 Stunden',
    }
  },
  
  // === TIPS & QUESTIONS ===
  {
    id: 'community-question-base',
    type: 'community_post',
    priority: 75,
    data: {
      author: 'NewPlayer2024',
      content: '❓ Frage an die Profis: Was ist besser für Duo - Bunker Base oder Compound? Wir werden ständig geraided und wissen nicht warum... 😅',
      likes: 89,
      comments: 156,
      timeAgo: '8 Stunden',
    }
  },
  {
    id: 'community-answer-base',
    type: 'community_post',
    priority: 72,
    data: {
      author: 'ArchitectPro',
      content: '@NewPlayer2024 Bunker 100%! Compounds sind Raid-Magnete. Bau klein, bau versteckt, bau mehrere Bases. Mein Guide im Forum hat alle Details. Und IMMER Honeycomb! 🏠',
      likes: 234,
      comments: 45,
      timeAgo: '8 Stunden',
    }
  },
  {
    id: 'community-tip-economy',
    type: 'community_post',
    priority: 68,
    data: {
      author: 'MarketMogul',
      content: '💡 Wirtschafts-Tipp: Runenstahl kaufen wenn er unter 1200 ist, verkaufen über 1500. Diese Woche hab ich 200k nur durch Trading gemacht. Das Auction House ist ein Goldmine! 📈',
      likes: 456,
      comments: 123,
      timeAgo: '9 Stunden',
    }
  },
  
  // === EVENTS & TOURNAMENTS ===
  {
    id: 'community-tournament-hype',
    type: 'community_post',
    priority: 145,
    data: {
      author: 'TournamentHost',
      content: '🏆 CLAN TURNIER ANKÜNDIGUNG! 500.000 Coins Preisgeld! 5v5, Double Elimination, Samstag 18:00 Uhr. Anmeldung im Forum bis Freitag! Die besten Clans von Eldrun treffen aufeinander! ⚔️',
      likes: 1567,
      comments: 456,
      timeAgo: '30 Minuten',
    }
  },
  {
    id: 'community-event-boss',
    type: 'community_post',
    priority: 132,
    data: {
      author: 'EventCaster',
      content: '🐉 WORLD BOSS IN 2 STUNDEN! Der Frost Dragon spawnt bei Artifact Island Alpha! Letzte Woche hat er 3 Clans gewipet. Bringt Anti-Frost Potions und VIEL Heals! Stream auf Twitch! 🎥',
      likes: 892,
      comments: 234,
      timeAgo: '1 Stunde',
    }
  },
]

// Blacklist & Anti-Cheat Content
export const BLACKLIST_ITEMS: ContentItem[] = [
  {
    id: 'blacklist-announcement',
    type: 'news',
    priority: 98,
    data: {
      title: '☠️ BLACKLIST UPDATE - 8 neue Cheater gebannt!',
      excerpt: 'Zero Tolerance Policy in Aktion! Diese Woche wurden 8 Cheater permanent gebannt und auf unserer Blacklist veröffentlicht.',
      image: '/images/backgrounds/dark-cathedral.svg',
      category: 'Anti-Cheat',
      date: '2024-12-16',
      link: '/blacklist'
    }
  },
  {
    id: 'blacklist-stats',
    type: 'stats_highlight',
    priority: 86,
    data: {
      title: '🛡️ Anti-Cheat Statistiken',
      stats: [
        { label: 'Cheater gebannt (gesamt)', value: 847 },
        { label: 'Diese Woche', value: 8 },
        { label: 'Erkennungsrate', value: '99.7%' },
        { label: 'Entschädigung ausgezahlt', value: '2.5M Coins' },
      ],
      link: '/blacklist'
    }
  },
]

// Vote & Support Content
export const VOTE_ITEMS: ContentItem[] = [
  {
    id: 'vote-reminder',
    type: 'server_event',
    priority: 79,
    data: {
      title: '🗳️ Vote für Eldrun!',
      description: 'Unterstütze unseren Server und erhalte bis zu 2.000 Coins täglich!',
      type: 'vote',
      countdown: false,
      reward: '500-2.000 Coins + Vote Crates',
      link: '/vote'
    }
  },
  {
    id: 'vote-top-voters',
    type: 'stats_highlight',
    priority: 51,
    data: {
      title: '🏆 Top Voter der Woche',
      stats: [
        { label: '#1 VoteKing', value: '28 Votes', holder: '14.000 Coins' },
        { label: '#2 SupporterMax', value: '24 Votes', holder: '12.000 Coins' },
        { label: '#3 DailyVoter', value: '21 Votes', holder: '10.500 Coins' },
      ],
    }
  },
]

// Staff & Support Content
export const STAFF_ITEMS: ContentItem[] = [
  {
    id: 'staff-online',
    type: 'stats_highlight',
    priority: 69,
    data: {
      title: '👥 Team Online Status',
      stats: [
        { label: 'Admins Online', value: 3 },
        { label: 'Moderatoren Online', value: 5 },
        { label: 'Durchschn. Antwortzeit', value: '~15 Min' },
        { label: 'Tickets heute gelöst', value: 23 },
      ],
      link: '/staff'
    }
  },
]

// FAQ & Help Content
export const FAQ_HIGHLIGHT_ITEMS: ContentItem[] = [
  {
    id: 'faq-highlight',
    type: 'guide',
    priority: 61,
    data: {
      title: '❓ Häufige Fragen (FAQ)',
      description: 'Antworten auf die wichtigsten Fragen rund um Eldrun - von Gameplay bis VIP.',
      chapters: 6,
      readTime: '10 min',
      difficulty: 'Alle Level',
      link: '/faq'
    }
  },
]

// Gallery Highlights
export const GALLERY_HIGHLIGHT_ITEMS: ContentItem[] = [
  {
    id: 'gallery-featured',
    type: 'gallery',
    priority: 73,
    data: {
      title: '📸 Featured Screenshots der Woche',
      images: [
        '/images/backgrounds/war-scene.png',
        '/images/gameplay/arena-battle.png',
        '/images/backgrounds/kings-bridge.svg',
      ],
      author: 'Community',
      likes: 1247,
      link: '/gallery'
    }
  },
]

// Rules & Appeals
export const RULES_ITEMS: ContentItem[] = [
  {
    id: 'rules-reminder',
    type: 'tip',
    priority: 53,
    data: {
      title: '📜 Server Regeln',
      content: 'Kennst du alle Regeln? Zero Tolerance für Cheater, Respekt im Chat, Fair Play. Lies die vollständigen Regeln!',
      icon: '⚖️',
      link: '/rules'
    }
  },
  {
    id: 'appeal-info',
    type: 'tip',
    priority: 41,
    data: {
      title: '⚖️ Ban Appeal',
      content: 'Zu Unrecht gebannt? Reiche einen Appeal ein. Bearbeitungszeit: 24-48 Stunden.',
      icon: '📋',
      link: '/appeals'
    }
  },
]

// XP & Level System
export const XP_ITEMS: ContentItem[] = [
  {
    id: 'xp-guide',
    type: 'tutorial',
    priority: 77,
    data: {
      title: '⚡ XP & Level System Guide',
      description: 'Alles über das Eldrun XP-System: 20 Skills, 5 Skill-Bäume, Prestige und mehr!',
      difficulty: 'Alle Level',
      duration: '15 min',
      icon: '📈',
    }
  },
  {
    id: 'xp-leaderboard',
    type: 'stats_highlight',
    priority: 68,
    data: {
      title: '🏅 XP Leaderboard - Top 3',
      stats: [
        { label: '#1 EldrunMaster', value: 'Level 98', holder: '2.4M XP' },
        { label: '#2 GrindKing', value: 'Level 94', holder: '2.1M XP' },
        { label: '#3 ProPlayer', value: 'Level 91', holder: '1.9M XP' },
      ],
    }
  },
]

// Faction Content
export const FACTION_ITEMS: ContentItem[] = [
  {
    id: 'faction-war-status',
    type: 'server_event',
    priority: 93,
    data: {
      title: '⚔️ FRAKTIONSKRIEG LIVE!',
      description: 'Seraphar vs Vorgaroth - Der Kampf um die Artifact Islands tobt!',
      type: 'faction_war',
      countdown: true,
      reward: 'Doppelte XP + Legendary Loot',
    }
  },
  {
    id: 'faction-stats',
    type: 'stats_highlight',
    priority: 81,
    data: {
      title: '🏰 Fraktions-Statistiken',
      stats: [
        { label: 'Seraphar Kills', value: 2847 },
        { label: 'Vorgaroth Kills', value: 2651 },
        { label: 'Aktive Krieger', value: 156 },
        { label: 'Territorien umkämpft', value: 5 },
      ],
    }
  },
]

// Casino Featured Items
export const CASINO_ITEMS: ContentItem[] = [
  {
    id: 'casino-dragons-throne',
    type: 'news',
    priority: 160,
    data: {
      title: "👑 NEU: DRAGON'S THRONE - Das Epische Casino-Spiel!",
      excerpt: 'Wähle deine Fraktion, kämpfe gegen Drachen und erobere den Eisernen Thron! Bis zu 250.000 Einsatz, 2x Thron-Bonus!',
      image: '/images/gameplay/battle-scene.png',
      category: 'Casino',
      date: '2024-12-17',
      link: '/casino',
      hot: true,
      featured: true
    }
  },
]

// Gallery Update Featured
export const GALLERY_ITEMS_CONTENT: ContentItem[] = [
  {
    id: 'gallery-update-dec2024',
    type: 'news',
    priority: 142,
    data: {
      title: '📸 GALERIE UPDATE: 16 Neue Rust Screenshots!',
      excerpt: 'Heli Crash Sites, Oil Rig Raids, Dragon Boss World First, Community Events & mehr! Zeige deine besten Momente!',
      image: '/images/backgrounds/war-scene.svg',
      category: 'Community',
      date: '2024-12-17',
      link: '/gallery',
      hot: true,
      featured: true
    }
  },
]

// Support Page Featured
export const SUPPORT_ITEMS: ContentItem[] = [
  {
    id: 'support-winter-special',
    type: 'news',
    priority: 145,
    data: {
      title: '🔥 WINTER SPECIAL: +25% Bonus auf alle Supporter-Tiers!',
      excerpt: 'Limitiertes Angebot! Unterstütze Eldrun und erhalte 25% extra Rewards. VIP Perks, exklusive Skins & mehr!',
      image: '/images/currency/gold.svg',
      category: 'Support',
      date: '2024-12-17',
      link: '/support',
      hot: true,
      featured: true
    }
  },
  {
    id: 'support-leaderboard',
    type: 'news',
    priority: 128,
    data: {
      title: '🏆 TOP SUPPORTER LEADERBOARD - Werde zur Legende!',
      excerpt: 'Neues Leaderboard! Die größten Unterstützer werden verewigt. Exklusive Badges und Titel für Top 5!',
      image: '/images/gameplay/siege-battle.png',
      category: 'Community',
      date: '2024-12-16',
      link: '/support',
      hot: true
    }
  },
]

// Shop Featured Items
export const SHOP_ITEMS: ContentItem[] = [
  {
    id: 'shop-battlepass',
    type: 'news',
    priority: 135,
    data: {
      title: '🎫 SEASON 4 BATTLE PASS - Jetzt verfügbar!',
      excerpt: '100 Level, 15 exklusive Skins, Frost Wolf Pet und 50.000 Coins! Nur €9.99!',
      image: '/images/icons/icon_season.svg',
      category: 'Shop',
      date: '2024-12-17',
      link: '/shop',
      hot: true
    }
  },
  {
    id: 'shop-mythic-kit',
    type: 'news',
    priority: 130,
    data: {
      title: '🌟 MYTHIC SUPREME Kit - Das Ultimative!',
      excerpt: 'Einmalig kaufbar! Dragon Pet, 200k Coins, 90 Tage VIP Diamond und MEHR! 50% Rabatt!',
      image: '/images/gameplay/battle-scene.png',
      category: 'Shop',
      date: '2024-12-17',
      link: '/shop',
      limited: true
    }
  },
  {
    id: 'shop-warlord-bundle',
    type: 'news',
    priority: 125,
    data: {
      title: '🔥 WARLORD Bundle - Nur noch 100 Stück!',
      excerpt: 'Das ultimative PvP Bundle! 5 Weapon Skins, War Wolf Pet, 50k Coins! -42% Rabatt!',
      image: '/images/gameplay/warrior-stance.png',
      category: 'Shop',
      date: '2024-12-16',
      link: '/shop',
      limited: true
    }
  },
  {
    id: 'shop-vip-diamond',
    type: 'news',
    priority: 115,
    data: {
      title: '💎 VIP DIAMOND - Die Elite unter den VIPs!',
      excerpt: '3x XP, 10 Home Slots, 5 tägliche Crates, Diamond Pet und Priority Support!',
      image: '/images/currency/dragons.svg',
      category: 'Shop',
      date: '2024-12-15',
      link: '/shop'
    }
  },
  {
    id: 'shop-casino-chips',
    type: 'news',
    priority: 108,
    data: {
      title: '🎰 100.000 Casino Chips + JACKPOT TICKET!',
      excerpt: 'Mega Casino Paket für High Roller! +10.000 Bonus Chips inklusive!',
      image: '/images/icons/icon_gambling.svg',
      category: 'Shop',
      date: '2024-12-14',
      link: '/casino'
    }
  },
  {
    id: 'shop-dragon-armor',
    type: 'news',
    priority: 103,
    data: {
      title: '🐉 Dragon Scale Armor - Legendär!',
      excerpt: 'Animiertes Drachenschuppen-Set mit Fire Particle Trail! Intimidating Aura!',
      image: '/images/classes/class_warrior.png',
      category: 'Shop',
      date: '2024-12-13',
      link: '/shop'
    }
  },
  {
    id: 'shop-mystery-box',
    type: 'news',
    priority: 95,
    data: {
      title: '🎁 MEGA Mystery Box - Legendary Garantie!',
      excerpt: 'Nur €9.99! Garantiert Legendary oder besser! Chance auf Mythic Exklusiv-Items!',
      image: '/images/icons/icon_loot.svg',
      category: 'Shop',
      date: '2024-12-12',
      link: '/shop'
    }
  },
  {
    id: 'shop-wolf-pack',
    type: 'news',
    priority: 88,
    data: {
      title: '🐺 Alpha Wolf Pack - 3 Wölfe gleichzeitig!',
      excerpt: 'Deine Wölfe attackieren Feinde! +5% Movement Speed! Erhöhte Feind-Erkennung!',
      image: '/images/bosses/toxic-golem.png',
      category: 'Shop',
      date: '2024-12-11',
      link: '/shop'
    }
  },
]

// Faction War Featured Items
export const FACTION_WAR_ITEMS: ContentItem[] = [
  {
    id: 'faction-war-support',
    type: 'faction_war',
    priority: 150,
    data: {
      title: '🏆 Fraktionskrieg - Unterstütze deine Fraktion!',
      excerpt: 'Unterstütze deine Fraktion im Kampf um die Vorherrschaft! Erhalte exklusive Belohnungen und Titel!',
      image: '/images/gameplay/faction-war.png',
      category: 'Faction War',
      date: '2024-12-17',
      link: '/faction-war',
      hot: true
    }
  },
]

// Combine all content items
export const ALL_CONTENT: ContentItem[] = [
  ...CASINO_ITEMS,
  ...GALLERY_ITEMS_CONTENT,
  ...SUPPORT_ITEMS,
  ...SHOP_ITEMS,
  ...FACTION_WAR_ITEMS,
  ...NEWS_ITEMS,
  ...TUTORIAL_ITEMS,
  ...TIP_ITEMS,
  ...FORUM_ITEMS,
  ...CLAN_SPOTLIGHTS,
  ...PLAYER_SPOTLIGHTS,
  ...EVENT_ITEMS,
  ...GALLERY_ITEMS,
  ...POLL_ITEMS,
  ...STATS_ITEMS,
  ...GUIDE_ITEMS,
  ...UPDATE_ITEMS,
  ...COMMUNITY_ITEMS,
  ...BLACKLIST_ITEMS,
  ...VOTE_ITEMS,
  ...STAFF_ITEMS,
  ...FAQ_HIGHLIGHT_ITEMS,
  ...GALLERY_HIGHLIGHT_ITEMS,
  ...RULES_ITEMS,
  ...XP_ITEMS,
  ...FACTION_ITEMS,
].sort((a, b) => b.priority - a.priority)

export const TOTAL_CONTENT_COUNT = ALL_CONTENT.length
