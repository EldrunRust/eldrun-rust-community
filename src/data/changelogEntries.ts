export type ChangelogEntry = {
  version: string
  date: string
  title: string
  type: 'major' | 'minor' | 'patch' | 'hotfix'
  highlights?: string[]
  changes: {
    category: 'feature' | 'improvement' | 'bugfix' | 'security' | 'balance'
    items: string[]
  }[]
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ✨ JANUAR 2025 - AURORA OVERDRIVE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    version: '6.2.0',
    date: '2025-01-05',
    title: 'Aurora Cascade – UI Resonanz Release',
    type: 'major',
    highlights: [
      'Hero-Parallax-System mit Aurora-Partikeln',
      'Live Changelog Badges für jede Seite',
      'Plugin Telemetry Hub (Realtime)'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🌌 Global Hero Overhaul mit Aurora-Triplane-Parallax auf Home, Forum und Shop',
          '🧭 Navigation Breadcrumb Pulses: jeder Klick malt ein glühendes Siegel',
          '🎚️ Adaptive Soundscape Toggle im Header (Wind, Campfire, Stormwall)',
          '🧿 “What Changed?” Button in jedem Page-Header, verlinkt auf passenden Abschnitt',
          '📡 Plugin Telemetry Hub im Admin (zeigt TPS, Hook-Status, Packet-Latency)',
          '🚀 Live Deployment Timeline in Footer, synchronisiert mit Changelog',
          '🦾 Accessibility Control Deck (Font Boost, Dyslexia Mode, Contrast Warp)',
          '🕯️ Candlelight Loading Skeletons für Lore-, Forum- und Guide-Seiten',
          '✨ Scroll-based Sigil Animations auf jeder Section mit GoT-inspirierten Rändern',
          '⚙️ Plugin Heartbeat Overlay: zeigt pro Plugin Hz/Load per sparkline'
        ]
      },
      {
        category: 'improvement',
        items: [
          '🎨 Forum-Pins erhalten Mini-Banners und Schattenfugen',
          '📝 Changelog Cards bekommen Inline-Tag-Badges pro Feature',
          '📱 Mobile Header Buttons vergrößert + Haptics hinzugefügt',
          '🏛️ Gallery Lightbox: Focus Trap perfektioniert & Blur-Backdrop verstärkt',
          '🧩 Shop Carousel Snap Points neu kalibriert (keine Mikrosprünge mehr)',
          '📦 Simulation Script blendet jetzt Micro-Statusmeldungen ein',
          '🌁 Map Page Nebel-Shader bei Nacht leicht reduziert (mehr Sichtbarkeit)',
          '🛰️ Leaderboard Suchfeld reagiert nun auf / Shortcut',
          '🪙 Currency Badges bekommen dynamische Glitzer-Noise',
          '🔮 Icon Pack aktualisiert: 18 neue Outline-Relikte für Subnav'
        ]
      },
      {
        category: 'bugfix',
        items: [
          '🐛 Gefixt: Forum-Thread-Detail verlor auf iOS das Scroll Momentum',
          '🐛 Gefixt: HeroSection CTA-Glow blieb nach Page Leave aktiv',
          '🐛 Gefixt: Plugin Monitor zeigte Phantom-Offline Status nach Deploy',
          '🐛 Gefixt: Custom Cursor im Casino flackerte bei 120+ FPS'
        ]
      }
    ]
  },
  {
    version: '6.1.2',
    date: '2025-01-04',
    title: 'Plugin Pulse & Micro-Update Storm',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '🔌 EldrunWeatherSynth Plugin: Nebel, Regen und Aurora Presets steuerbar',
          '⚡ EldrunReactivity Plugin: verteilt UI-Events als WebSocket Broadcast',
          '🧠 AI Patch Notes Generator speist kurze Tooltips in Changelog Cards'
        ]
      },
      {
        category: 'improvement',
        items: [
          '🧵 Simulation CLI zeigt nun Hook-Namen bei jedem Seed-Schritt',
          '🕸️ Footer Net Animation verlangsamt, damit Text leichter lesbar bleibt',
          '📖 Docs Sidebar erhält “Changed today” Emblem',
          '🧊 Eldrun Map Tooltip Kanten glasiert für bessere Lesbarkeit',
          '🎯 Blacklist Suche reagiert jetzt auf Pfeiltasten',
          '🪄 Command Palette Einträge gruppiert nach Seiten',
          '🔍 Heatmap Filters behalten Auswahl nach Hard Reload',
          '🧾 Plugin Telemetry exportiert CSV mit Uhrzeit',
          '🪐 Factions Banner bekamen 2px Chrom-Outline',
          '📅 Event Scheduler Panel zeigt Wochentag-Icons'
        ]
      },
      {
        category: 'bugfix',
        items: [
          '🐛 Fix: Shop CTA Links verloren ihr Hover-Licht im Safari',
          '🐛 Fix: Forum Reply Editor setzte Bold + Italic gleichzeitig zurück',
          '🐛 Fix: InfiniteContent VirtualScroller sprang an Browser-Rändern',
          '🐛 Fix: EldrunMultiShop Plugin sendete doppelte Webhook Events'
        ]
      }
    ]
  },
  {
    version: '6.1.1',
    date: '2025-01-03',
    title: 'Velvet Threads – Micro Copy Edition',
    type: 'patch',
    changes: [
      {
        category: 'improvement',
        items: [
          '🪶 Alle Hero Subtitles mit poetischen Zweizeilern versehen',
          '🖋️ Tooltip Text für “Eldrun Rank” in Profile Cards präzisiert',
          '📌 Forum Tag Pills bekommen Kontext-Beschreibung nach Hover 400ms',
          '🎟️ Battle Pass Steps zeigen jetzt “last touched” Zeitstempel',
          '📮 Newsletter Modal hat neues animiertes Siegel'
        ]
      },
      {
        category: 'bugfix',
        items: [
          '🐛 Copy Fehler auf Shop/Auction CTA korrigiert (doppelte Kommas)',
          '🐛 Modal Stack Fix: Kein Shadow-Leak mehr bei 3+ Layern'
        ]
      }
    ]
  },
  {
    version: '6.1.0',
    date: '2025-01-02',
    title: 'Nebula Threading & Forum Cinematics',
    type: 'major',
    highlights: [
      'Thread Cinematic Mode',
      'VIP Forum Badges 3D',
      'Jump-to-Update Mini-Timeline'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🎥 Thread Cinematic Mode mit Vollbild Gradient, Zoom & Typing Echo',
          '🧵 Jump-to-Update Mini-Timeline rechts neben jedem langen Thread',
          '🎖️ VIP Badges jetzt echte 3D Medaillons mit Reflektion',
          '🪄 AI Thread Summaries generieren “TL;DR Nebel” Box',
          '🔖 Bookmark-Sidebar zeigt Live-Sync zwischen Geräten',
          '🚨 Announcement Threads besitzen Beacon-Animation im Board'
        ]
      },
      {
        category: 'improvement',
        items: [
          '🔔 Forum Notifications bekommen Kontextzeilen (Board + Aktion)',
          '🗂️ Directory Grid neu typografiert (CInzel Extended)',
          '🌠 Infinite Scroll Gains: 8% glatter durch Interpolated ScrollTo',
          '🧷 Profile Tabs zeigen micro-progress Bars pro Feature-Test',
          '📊 Forum Stats Panel synchronisiert sich jede Minute automatisch'
        ]
      },
      {
        category: 'bugfix',
        items: [
          '🐛 Fix: Thread Search Filter klemmte bei sehr langen Tag Namen',
          '🐛 Fix: Reply Editor hat Compose Ghosts nicht entfernt'
        ]
      }
    ]
  },
  {
    version: '6.0.3',
    date: '2024-12-29',
    title: 'Plugin Atelier – Texture Bloom',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '🎨 EldrunShaderForge Plugin bringt Bloom-Profile für Castle-, Shop- und Casino-Seiten',
          '🧱 EldrunPrefabTracker Plugin zeigt Prefab-Diff zwischen Builds',
          '🪽 Companion “Aurora Sprite” als schwebender Helfer in Admin Panels'
        ]
      },
      {
        category: 'improvement',
        items: [
          '🧊 Map Gridlines leicht verjüngt für 4K Screens',
          '🧵 Forum Quick Reply Buttons bekamen diagonale Satin-Textur',
          '🧭 Header Compass Icon jetzt SVG + Motion Path',
          '📜 Docs Code Blocks erhielten dünne Gold-Linien',
          '📦 Simulation Start CLI loggt Plugin Variablen alphabetisch'
        ]
      }
    ]
  },
  {
    version: '6.0.2',
    date: '2024-12-27',
    title: 'Micro Spark Hotfix Set',
    type: 'hotfix',
    changes: [
      {
        category: 'bugfix',
        items: [
          '🐛 Fix: HeroSection SVG Wechsel erzeugte 404 weil Cache noch PNG suchte',
          '🐛 Fix: Trading Page Background Blend Mode invertierte Farben bei Safari',
          '🐛 Fix: Auction Gradient aliaste auf 5K Monitoren',
          '🐛 Fix: Leaderboard Reputation Icon fiel auf PNG zurück'
        ]
      },
      {
        category: 'security',
        items: [
          '🛡️ CSP Liste um neue CDN Domains erweitert',
          '🛡️ Plugin Webhooks prüfen jetzt Signaturen auf Timestamp Drift'
        ]
      }
    ]
  },
  {
    version: '6.0.1',
    date: '2024-12-26',
    title: 'Frostglass Content Sweep',
    type: 'patch',
    changes: [
      {
        category: 'feature',
        items: [
          '❄️ Frostglass Hero Filter für Professions, Classes und Trading Seiten',
          '🃏 Casino Cards bekamen neue SVG-Rücken',
          '🎯 Professions Page Stat-Bubbles mit Scroll-Reveal'
        ]
      },
      {
        category: 'improvement',
        items: [
          '🧼 Alle PNG Assets auf SVG Refactor gesetzt (siehe InfiniteContent, Hero, Shop)',
          '📐 Spacing Audit auf AppShell (100% Header Breite fortgeführt)',
          '💡 Tooltip Delay global vereinheitlicht (120ms)',
          '🏷️ Badge Kerning neu gesetzt für Cinzel Decorative',
          '📲 Mobile Drawer Scrollbars entfernt',
          '🕯️ Forum Sidebar Panel Outline intensiver gemacht',
          '🪙 Currency Icons bekommen Pastell-Glow je nach Typ'
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 🗺️ DEZEMBER 2024 - ELDRUN MAP RELEASE - MEILENSTEIN!
  // ═══════════════════════════════════════════════════════════════════════════
  {
    version: '6.0.0',
    date: '2024-12-24',
    title: '🗺️ ELDRUN MAP RELEASE - MEILENSTEIN!',
    type: 'major',
    highlights: [
      '🎄 Die ELDRUN Rust Map ist fertig!',
      '🏝️ 4 einzigartige Inseln',
      '🏛️ 19 Custom Monuments',
      '🚂 63 Railroads & 6 Skytrain Stationen'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🗺️ MAP STATISTIKEN',
          '📐 Map Size: 4500',
          '🧱 113.840 Prefabs',
          '🏗️ 40.5% bebaubare Fläche',
          '🏛️ 40 Monumente (19 Custom!)',
          '🏝️ 4 Inseln',
          '🌊 3 Flüsse',
          '🚂 63 Railroads',
          '🦇 2 Höhlen',
          '🏞️ 1 See',
          '🪨 3 bebaubare Felsen',
          '',
          '🌍 BIOME VERTEILUNG',
          '🌴 Jungle: 33.3%',
          '🏜️ Arid: 26.7%',
          '❄️ Arctic: 20.0%',
          '🌲 Temperate: 10.0%',
          '🏔️ Tundra: 10.0%',
          '🌊 Ocean: 48.6%',
          '',
          '🏛️ CUSTOM MONUMENTS',
          '🎰 West Coast Casino',
          '⚔️ Bradley Arena',
          '🚂 Skytrain Station ×6',
          '🏠 Abandoned Apt ×2',
          '🍔 Diner ×4',
          '🍎 Roadside Fruitstand',
          '🎨 Art Gallery',
          '🚌 Bus Depot',
          '⛏️ Nodecluster Trench',
          '🌳 Nodedust Park',
          '',
          '🏗️ VANILLA MONUMENTS',
          '🔬 Arctic Research Base',
          '⚡ Power Plant',
          '🚂 Train Yard',
          '💧 Water Treatment Plant',
          '🏪 Outpost & Bandit Camp',
          '🛢️ Large Oil Rig & Oil Rig',
          '⛽ Oxums Gas Station ×4',
          '🏬 Abandoned Supermarket ×4',
          '📡 Satellite Dish',
          '🚢 Harbor ×2',
          '🚇 Train Tunnel ×13',
          '🏠 Ranch & Large Barn',
          '🐟 Fishing Village ×3',
          '🗼 Lighthouse ×2'
        ]
      },
      {
        category: 'improvement',
        items: [
          '🎯 Optimierte Spawn-Punkte',
          '🛤️ Durchgängiges Schienennetz',
          '⚖️ Ausgewogene Ressourcenverteilung',
          '🏝️ Strategische Insel-Positionierung',
          '🚀 Performance-optimierte Prefabs'
        ]
      }
    ]
  },
  {
    version: '5.2.0',
    date: '2024-12-24',
    title: 'Map Mod Integration (Coming Soon)',
    type: 'minor',
    highlights: [
      '🔧 ELDRUN Mod wird auf Map angepasst',
      '⚔️ Fraktionsgebiete werden definiert',
      '🏰 Castle-Positionen festgelegt'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🔜 COMING SOON',
          '⚔️ Fraktions-Territorien auf der Map',
          '🏰 Vordefinierte Castle-Bauplätze',
          '🎯 Custom Loot-Tables für Monumente',
          '🤖 NPC Spawn-Punkte',
          '📍 Event-Locations',
          '🗺️ In-Game Map Integration'
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // DEZEMBER 2024 - FINALE PHASE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    version: '5.1.0',
    date: '2024-12-18',
    title: 'ELDRUN Smiley Store',
    type: 'major',
    highlights: [
      '500+ Smileys & Emojis',
      'Premium & Elite Smileys',
      'Smiley Marktplatz'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '😀 SMILEY STORE',
          '🆓 80+ kostenlose Smileys',
          '⭐ Premium Smileys (Common, Rare, Epic)',
          '👑 Elite Smileys (Legendary, Elite, Mythic)',
          '✨ Animierte Smileys mit Effekten',
          '🔥 Spezialeffekte: Glow, Fire, Ice, Rainbow',
          '',
          '🏪 SMILEY MARKTPLATZ',
          '💰 Smileys kaufen & verkaufen',
          '📋 Smileys mieten (zeitlich begrenzt)',
          '❤️ Favoriten-System',
          '📊 Nutzungsstatistiken'
        ]
      },
      {
        category: 'improvement',
        items: [
          '🔍 Smiley-Suche mit Filtern',
          '📂 Kategorien: Smileys, Gaming, Fantasy, Tiere',
          '🏷️ Rarity-System mit Badges',
          '🔄 Sortierung nach Beliebtheit/Preis/Name'
        ]
      }
    ]
  },
  {
    version: '5.0.0',
    date: '2024-12-17',
    title: 'ELDRUN Community Chat',
    type: 'major',
    highlights: [
      'Premium Chat im GoT-Style',
      'ELDRUNS Währungssystem',
      'Soziale Features (Herz, Rose, Kiss)'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🏰 COMMUNITY CHAT SYSTEM',
          '💬 7 thematische Channels (Große Halle, Marktplatz, Kriegsrat, etc.)',
          '👑 VIP Thronsaal exklusiv für Premium-Mitglieder',
          '🎰 Casino Chat & Glückstaverne',
          '❓ Ratskammer für Support',
          '',
          '💰 ELDRUNS WÄHRUNG',
          '🎁 Eldruns verschenken an andere User',
          '📊 Treuestufen-System (10 Stufen)',
          '👑 VIP Bonus Eldruns (Bronze/Silber/Gold)',
          '',
          '💕 SOZIALE FEATURES',
          '❤️ Herz vergeben (monatlich)',
          '🌹 Rosen verschicken (wöchentlich)',
          '💋 Küssen-Feature',
          '🎯 User Status & Statusnachrichten',
          '',
          '🎨 CHAT UI FEATURES',
          '📝 Nachrichten mit Reaktionen',
          '↩️ Reply-System',
          '📌 Pinned Messages',
          '🔥 Nick-Effekte (Flame, Sparkle, Glow)',
          '🏷️ Rollen-Badges & User-Badges',
          '⌨️ Typing Indicators'
        ]
      },
      {
        category: 'improvement',
        items: [
          '⚙️ Admin Chat Settings komplett',
          '🛡️ Moderation: Auto-Mod, Spam-Schutz, Wort-Filter',
          '📋 Zugangsvoraussetzungen (Level, Spielzeit)',
          '🎚️ Limits: Channels, DMs, Geschenke pro Tag',
          '💎 VIP Bonus Konfiguration',
          '🔧 Feature Toggles für alle Funktionen'
        ]
      }
    ]
  },
  {
    version: '4.1.0',
    date: '2024-12-17',
    title: 'Auktionshaus Feature',
    type: 'major',
    highlights: [
      'Vollständiges Auktionshaus',
      'Live Bieten & Sofortkauf',
      'Featured & Ending Soon Sections'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🏛️ AUKTIONSHAUS SYSTEM',
          '⚡ Echtzeit-Countdown für alle Auktionen',
          '💰 Bieten mit Mindesterhöhung',
          '🛒 Sofortkauf-Option (Buy Now)',
          '🔥 Featured Auktionen Highlight',
          '⏰ "Endet bald" Section für heiße Deals',
          '',
          '🎯 AUCTION FEATURES',
          '📊 Bid Modal mit Quick-Bid Buttons',
          '👁️ Watchlist für interessante Auktionen',
          '🏷️ Kategorien: Waffen, Skins, VIP, Ressourcen, Coins',
          '🔍 Suche & Filter System',
          '📈 Sortierung: Endet bald, Neu, Preis, Gebote',
          '',
          '💾 AUCTION STORE (Zustand)',
          '📝 Vollständiges State Management',
          '🔒 Reserve Price System',
          '⭐ Seller Rating Integration',
          '📜 Bid History pro Auktion'
        ]
      },
      {
        category: 'improvement',
        items: [
          '🛍️ Shop Header: Auktionshaus Button',
          '📋 Header Dropdown: Auktionshaus Link',
          '🎨 Gold-Theme für Auktionshaus UI'
        ]
      }
    ]
  },
  {
    version: '4.0.0',
    date: '2024-12-17',
    title: 'Medieval Theme & Backend Revolution',
    type: 'major',
    highlights: [
      'Game of Thrones inspiriertes Design',
      'Vollständige Backend-Integrationen',
      'Admin API-Konfiguration'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🏰 MEDIEVAL TYPOGRAPHY OVERHAUL',
          '⚔️ Cinzel & Cinzel Decorative Fonts integriert',
          '👑 Goldenes Farbschema (gold-300 bis gold-900)',
          '🐉 Game of Thrones inspirierte Schriftzüge',
          '✨ Goldene Gradient-Texte auf allen Seiten',
          '🎭 MedievalPageHeader Komponente erstellt',
          '📜 Header, Hero, Features im mittelalterlichen Stil',
          '',
          '💳 PAYMENT GATEWAY INTEGRATION',
          '💰 Stripe Checkout Session API implementiert',
          '🅿️ PayPal Orders API vollständig integriert',
          '🔐 Sichere Webhook-Verifizierung',
          '💵 Multi-Currency Support (EUR)',
          '',
          '📺 STREAMING API INTEGRATION',
          '🟣 Twitch API: Live Streams, Clips, User Info',
          '🔴 YouTube Data API: Videos, Live Streams',
          '🎮 Rust Game Streams automatisch laden',
          '',
          '🐛 ERROR TRACKING',
          '📊 Sentry Integration vorbereitet',
          '🔍 captureError & captureMessage Funktionen',
          '🏷️ Environment-spezifisches Tracking',
          '',
          '🖥️ RCON SERVER VERBINDUNG',
          '🔌 WebSocket RCON Client Architektur',
          '📡 Server Info, Player List, Commands',
          '⚡ Mock-Daten Fallback wenn offline'
        ]
      },
      {
        category: 'improvement',
        items: [
          '⚙️ Admin Settings komplett überarbeitet',
          '💳 Payment Tab: Stripe & PayPal Konfiguration',
          '🖥️ RCON Tab: Server-Verbindung einstellen',
          '📺 Streaming Tab: Twitch & YouTube API Keys',
          '🐛 Error Tracking Tab: Sentry DSN',
          '👁️ Passwort-Toggle für alle sensiblen Felder',
          '🎨 Farbcodierte Konfigurationskarten',
          '🔗 Direkte Links zu Developer Consoles'
        ]
      }
    ]
  },
  {
    version: '3.9.0',
    date: '2024-12-17',
    title: 'Persistente Datenspeicher',
    type: 'minor',
    highlights: [
      'Ticket-System Store',
      'Trading mit Escrow',
      'LFG Matchmaking Store'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🎫 TICKET STORE (Zustand + Persist)',
          '📝 Vollständiges Ticket-System mit Messages',
          '🏷️ Status: open, in_progress, waiting, resolved, closed',
          '⚡ Priority: low, medium, high, urgent',
          '👤 Staff Assignment & Ticket History',
          '',
          '💱 TRADING STORE',
          '🔒 24h Escrow-System für sichere Trades',
          '📦 Item Categories & Rarity System',
          '⭐ Seller Rating Integration',
          '📊 Trade History Tracking',
          '',
          '👥 LFG STORE (Looking For Group)',
          '🎮 PlayStyle: casual, competitive, pvp, pve, raiding',
          '🌍 Region Filter: EU, NA, Asia, Oceania',
          '📋 Applicant Management System',
          '⏰ 7-Tage Auto-Expiry für Posts'
        ]
      }
    ]
  },
  {
    version: '3.8.0',
    date: '2024-12-17',
    title: 'Navigation Update',
    type: 'patch',
    changes: [
      {
        category: 'improvement',
        items: [
          '🗺️ Heatmap in Hauptnavigation verschoben',
          '⚡ Battle Pass ins Dropdown Menu',
          '📍 Logischere Navigation für häufig genutzte Seiten'
        ]
      }
    ]
  },
  {
    version: '3.7.0',
    date: '2024-12-17',
    title: 'Environment Configuration',
    type: 'patch',
    changes: [
      {
        category: 'improvement',
        items: [
          '📄 .env.example vollständig aktualisiert',
          '💳 Stripe & PayPal Variables',
          '🖥️ RCON Connection Variables',
          '📺 Twitch & YouTube API Keys',
          '🐛 Sentry DSN Configuration',
          '📝 Dokumentation für jeden API-Schlüssel'
        ]
      }
    ]
  },
  {
    version: '3.6.0',
    date: '2024-12-17',
    title: 'Checkout API Upgrade',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '💳 Stripe Checkout direkt integriert',
          '🅿️ PayPal Order Creation API',
          '✅ isStripeConfigured() / isPayPalConfigured() Checks',
          '🔄 Graceful Fallback wenn nicht konfiguriert',
          '📧 Customer Email an Payment Provider'
        ]
      },
      {
        category: 'security',
        items: [
          '🔐 API Keys nur serverseitig',
          '🛡️ Webhook Signature Verification',
          '⚠️ Konfigurations-Checks vor Checkout'
        ]
      }
    ]
  },
  {
    version: '3.5.0',
    date: '2024-12-17',
    title: 'Medieval Page Headers',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '📜 Tools Page: Goldene Schrift & Medieval Font',
          '👥 LFG Page: Game of Thrones Styling',
          '📺 Streams Page: Mittelalterlicher Header',
          '⚡ Battle Pass: Goldenes Theme',
          '🎯 Challenges: Medieval Upgrade',
          '💱 Trading: GoT-inspiriert',
          '🎫 Tickets: Königliches Design',
          '🎁 Referral: Goldene Akzente',
          '📊 Stats: Medieval Statistics'
        ]
      }
    ]
  },
  {
    version: '3.4.0',
    date: '2024-12-17',
    title: 'Tailwind Theme Extension',
    type: 'patch',
    changes: [
      {
        category: 'feature',
        items: [
          '🎨 Gold Color Palette (300-900)',
          '🥉 Bronze Color Palette',
          '🥈 Silver Color Palette',
          '📝 font-medieval (Cinzel)',
          '👑 font-medieval-decorative (Cinzel Decorative)',
          '📖 font-body (Inter)',
          '💻 font-mono (JetBrains Mono)'
        ]
      }
    ]
  },
  {
    version: '3.3.0',
    date: '2024-12-17',
    title: 'Google Fonts Integration',
    type: 'patch',
    changes: [
      {
        category: 'feature',
        items: [
          '🔤 Cinzel Font für mittelalterliche Headlines',
          '👑 Cinzel Decorative für Display Text',
          '📝 Inter als Body Font beibehalten',
          '💻 JetBrains Mono für Code',
          '🎯 CSS Variables für alle Fonts',
          '⚡ Next.js optimierte Font-Ladung'
        ]
      }
    ]
  },
  {
    version: '3.2.0',
    date: '2024-12-17',
    title: "Dragon's Throne Casino Game",
    type: 'major',
    highlights: [
      'Neues Dragon\'s Throne Spiel im Casino',
      'Game of Thrones inspiriertes Gameplay',
      'Fraktionskämpfe um den Eisernen Thron'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          "🐉 Dragon's Throne: Neues Premium Casino-Spiel",
          '👑 Wähle deine Fraktion: Seraphar vs Vorgaroth',
          '🎰 Drachen sammeln für massive Multiplikatoren',
          '⚔️ Kampf-Animationen und Spezialeffekte',
          'Einsätze von 500 bis 250.000 Chips'
        ]
      }
    ]
  },
  {
    version: '3.1.0',
    date: '2024-12-17',
    title: 'Support Page WOW-Effekte',
    type: 'minor',
    highlights: [
      'Animierte Glow-Orbs',
      'Live Donation Counter',
      'Top Supporter Leaderboard'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '✨ Animierte Glow-Orbs im Hero-Bereich',
          '💫 Floating Particles Animation',
          '❤️ Pulsierendes Heart-Icon',
          '📊 Live Donation Counter mit Blinking Indicator',
          '🏆 Top Supporter Leaderboard Tab',
          '💬 Testimonials mit Tier-Badges',
          '🎁 Limited-Time Bonus Banner'
        ]
      },
      {
        category: 'improvement',
        items: [
          'VIP Perks Preview Section',
          '2 neue News-Artikel für Endless Scroll',
          'Support-Statistiken im Admin'
        ]
      }
    ]
  },
  {
    version: '3.0.0',
    date: '2024-12-17',
    title: 'Achievements System Feinschliff',
    type: 'major',
    highlights: [
      '31 Achievements total',
      'Near-Completion Alerts',
      'Rarity Filter System'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🏆 9 neue Achievements hinzugefügt',
          '🔔 Near-Completion Alert (≥70% Fortschritt)',
          '🎨 Enhanced Hero mit Glow-Effekten',
          '🔍 Rarity Filter (Gewöhnlich bis Legendär)',
          '👑 Thronsucher Achievement für Casino'
        ]
      }
    ]
  },
  {
    version: '2.9.0',
    date: '2024-12-17',
    title: 'Gallery Expansion',
    type: 'minor',
    highlights: [
      '16 neue Rust Screenshots',
      'Erweiterte Filter-Kategorien',
      'Gallery Admin Settings'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '📸 16 neue Rust-themed Screenshots',
          '🏷️ 6 neue Filter-Tags (Monument, Loot, Boss, etc.)',
          '⚙️ Gallery Settings im Admin-Panel',
          '📰 Gallery Update News im Endless Scroll'
        ]
      }
    ]
  },
  {
    version: '2.8.0',
    date: '2024-12-17',
    title: 'Clan Bewerbungssystem & Fraktionen',
    type: 'major',
    highlights: [
      'Vollständiges Clan-Bewerbungssystem',
      'Fraktionsnamen korrigiert: Seraphar & Vorgaroth',
      'Clan-Leader Rekrutierungs-Einstellungen'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          'Clan-Bewerbungsformular mit 3-Schritt Prozess',
          'Clan-Rekrutierungs-Einstellungen für Leader',
          'Min-Level, K/D, Spielzeit, Coins Anforderungen',
          'Discord & Mikrofon Pflicht-Optionen',
          'Auto-Accept für qualifizierte Bewerber',
          'Custom Bewerbungsfragen (bis zu 5)',
          'Willkommensnachricht für neue Mitglieder'
        ]
      },
      {
        category: 'bugfix',
        items: [
          'Fraktionsnamen von APEX/VOID zu Seraphar/Vorgaroth korrigiert',
          'Heatmap Faction War korrekte Farben (Amber/Rot)',
          'Alle 10 Heatmap-Komponenten aktualisiert'
        ]
      }
    ]
  },
  {
    version: '2.7.0',
    date: '2024-12-16',
    title: 'Plugin Features Integration',
    type: 'major',
    highlights: [
      '65+ Server-Plugins analysiert',
      'Pet System, Raid Bases, Vehicles',
      'Castle System, Bounty, Quests'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🐾 Pet System: Bär, Wolf, Pferd, Wildschwein, Huhn, Hirsch, Eisbär',
          '🏰 Raid Bases: Automatische PvE-Raids mit NPCs',
          '🚁 50+ Custom Vehicles: Helikopter, Fighter, Boote, Motorräder',
          '🏰 Castle System: 12 Gebäude, 7 Verteidigungsanlagen',
          '💰 Bounty System: Kopfgelder auf Spieler setzen',
          '🏛️ Auction House & Black Market im MultiShop',
          '📜 Quest System mit NPC Vendors',
          '🎯 20 Skills in 6 Kategorien, 10 Talent Trees'
        ]
      },
      {
        category: 'improvement',
        items: [
          'Guild Perks: Fast Crafting, Gather Boost, Combat Bonus',
          'Guild Upgrades: Bank Capacity, Member Slots, XP Boost',
          'Guild Achievements mit Honor-Belohnungen',
          'Teleport-System mit hohen Kosten & Cooldowns'
        ]
      }
    ]
  },
  {
    version: '2.6.0',
    date: '2024-12-15',
    title: 'Admin System Update',
    type: 'major',
    highlights: [
      'Neues erweitertes Admin-Panel mit 12 Tabs',
      'Blacklist-Management direkt im Admin',
      'Forum-Moderation integriert'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          'Admin-Panel: Blacklist-Verwaltung hinzugefügt',
          'Admin-Panel: User-Management mit Suche',
          'Admin-Panel: Forum-Moderation mit Reports',
          'Admin-Panel: Seiten-Übersicht',
          'Neue AGB-Seite (/terms)',
          'Neue Datenschutz-Seite (/privacy)',
          'Neue Changelog-Seite (/changelog)'
        ]
      },
      {
        category: 'improvement',
        items: [
          'OAuth Demo-Hinweis im Login',
          'Social Media Links im Footer aktualisiert',
          'Contact & Appeals Forms mit echtem API Backend'
        ]
      }
    ]
  },
  {
    version: '2.5.0',
    date: '2024-12-14',
    title: 'Blacklist & Content Update',
    type: 'major',
    highlights: [
      'Neue Blacklist-Seite (Cheater Pranger)',
      'Infinite Scroll auf 50 Items erweitert',
      'Zero-Tolerance Policy implementiert'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          'Blacklist-Seite mit Cheater-Datenbank',
          'Detaillierte Cheat-Informationen und Beweise',
          'Such- und Filterfunktionen für Blacklist',
          'Statistiken zu gebannten Cheatern'
        ]
      },
      {
        category: 'improvement',
        items: [
          'Infinite Scroll Content von 35 auf 50 Items',
          'Neue Content-Kategorien: Blacklist, Vote, Staff, FAQ',
          'Forum-Integration mit Blacklist-Board'
        ]
      }
    ]
  },
  {
    version: '2.4.0',
    date: '2024-12-10',
    title: 'Elite Forum Release',
    type: 'major',
    highlights: [
      'NASA-Level Forum komplett',
      'AI-Features integriert',
      'Rich Media Support'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          'Live Activity Feed im Forum',
          'Dynamic Theme System',
          'Smart Search mit AI',
          'Rich Media Support (Bilder, Videos)',
          'Advanced Polls',
          'Gamification System'
        ]
      },
      {
        category: 'improvement',
        items: [
          'Perfekte Breitenanpassung aller Forum-Elemente',
          'Verbesserte Mobile Experience',
          '3D Avatar Support vorbereitet'
        ]
      }
    ]
  },
  {
    version: '2.3.0',
    date: '2024-12-05',
    title: 'Casino Expansion',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '10 Casino-Spiele implementiert',
          'Jackpot System',
          'Live Feed & Game History',
          'Täglicher Bonus'
        ]
      },
      {
        category: 'balance',
        items: [
          'House Edge pro Spiel anpassbar',
          'Min/Max Einsätze konfigurierbar',
          'Gewinnlimits hinzugefügt'
        ]
      }
    ]
  },
  {
    version: '2.2.0',
    date: '2024-12-01',
    title: 'Heatmap & Leaderboard',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          'Interaktive Heatmap mit Live-Events',
          'Echtzeit Leaderboard',
          '16 Achievements im System',
          'Fraktions-Statistiken'
        ]
      },
      {
        category: 'bugfix',
        items: [
          'Performance-Optimierungen',
          'Memory Leaks behoben'
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // NOVEMBER 2024 - LAUNCH PHASE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    version: '2.1.0',
    date: '2024-11-28',
    title: 'Features Page Complete',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '10 Feature-Tabs implementiert',
          'Fraktionen: Seraphar vs Vorgaroth',
          '6 Spielerklassen mit Skills',
          'Gilden-System mit Perks',
          'Burgen-System mit 12 Gebäuden'
        ]
      }
    ]
  },
  {
    version: '2.0.0',
    date: '2024-11-25',
    title: 'ELDRUN Website Launch 🚀',
    type: 'major',
    highlights: [
      'Kompletter Website Relaunch',
      'Neues Design System',
      'Alle Core Features'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          'Neues modernes Design mit Framer Motion',
          'Shop System mit 6 Währungen',
          'News System mit Infinite Scroll',
          'Profil System mit Statistiken',
          'Auth System mit Demo-Mode'
        ]
      },
      {
        category: 'security',
        items: [
          'JWT Authentication',
          'Password Hashing mit bcrypt',
          'HTTP-Only Cookies'
        ]
      }
    ]
  },
  {
    version: '1.9.0',
    date: '2024-11-20',
    title: 'EldrunMultiShop Plugin',
    type: 'major',
    highlights: [
      '475KB Plugin Code',
      'GUI Shop, Auction House, Black Market',
      'Vollständiges Wirtschaftssystem'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🏪 GUI Shop mit 1000+ Items',
          '🏛️ Auction House für Spieler-Handel',
          '🖤 Black Market für seltene Items',
          '💰 Multi-Currency Support',
          '📊 Preishistorie und Statistiken'
        ]
      }
    ]
  },
  {
    version: '1.8.0',
    date: '2024-11-15',
    title: 'EldrunXP & Level System',
    type: 'major',
    highlights: [
      '445KB XP Plugin',
      '100 Level, 20 Skills',
      'Prestige System'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '📈 100 Level mit XP-Progression',
          '⚡ 20 Skills in 6 Kategorien',
          '🌟 Prestige System für Veteranen',
          '🎯 Skill Trees mit Spezialisierungen',
          '📊 XP-Leiste im HUD'
        ]
      }
    ]
  },
  {
    version: '1.7.0',
    date: '2024-11-10',
    title: 'EldrunTeleport System',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '🏠 Home Teleports (bis zu 5)',
          '👥 TPR zu anderen Spielern',
          '⚔️ Fraktions-Teleport',
          '🏛️ Monument-Teleport',
          '⏱️ Cooldowns und Kosten'
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // OKTOBER 2024 - CORE PLUGINS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    version: '1.6.0',
    date: '2024-10-30',
    title: 'EldrunFraktion Plugin',
    type: 'major',
    highlights: [
      '416KB Fraktions-Plugin',
      'Seraphar vs Vorgaroth',
      'Territorien und Kriege'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '⚔️ Zwei Fraktionen: Seraphar & Vorgaroth',
          '🗺️ Territorien erobern und verteidigen',
          '🏆 Fraktions-Events und Belohnungen',
          '💬 Fraktions-Chat',
          '📊 Fraktions-Statistiken'
        ]
      }
    ]
  },
  {
    version: '1.5.0',
    date: '2024-10-25',
    title: 'EldrunVehicleLicence',
    type: 'major',
    highlights: [
      '389KB Vehicle Plugin',
      '50+ Custom Vehicles',
      'Lizenzsystem'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🚁 Helikopter: Minicopter, Scrap Heli, Attack Heli',
          '✈️ Fighter Jets und Bomber',
          '🚗 Autos: Sedan, Pickup, SUV',
          '🏍️ Motorräder und Quads',
          '🚤 Boote: RHIB, Motorboot, Kriegsschiff',
          '📜 Fahrzeug-Lizenzen und Garage'
        ]
      }
    ]
  },
  {
    version: '1.4.0',
    date: '2024-10-20',
    title: 'EldrunBackpacks System',
    type: 'minor',
    highlights: [
      '361KB Backpack Plugin',
      '4 Rucksack-Stufen',
      'Bis zu 48 extra Slots'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🎒 Basic Backpack: 12 Slots',
          '🎒 Large Backpack: 24 Slots',
          '🎒 VIP Backpack: 36 Slots',
          '🎒 Premium Backpack: 48 Slots',
          '🔒 Berechtigungssystem'
        ]
      }
    ]
  },
  {
    version: '1.3.0',
    date: '2024-10-15',
    title: 'EldrunGUIShop & Kits',
    type: 'major',
    changes: [
      {
        category: 'feature',
        items: [
          '🏪 GUI Shop mit Kategorien',
          '🎁 Kit System: Starter bis Legendary',
          '⏱️ Kit Cooldowns',
          '💰 Multi-Currency Support'
        ]
      }
    ]
  },
  {
    version: '1.2.0',
    date: '2024-10-10',
    title: 'EldrunGuilds Plugin',
    type: 'major',
    highlights: [
      '240KB Gilden-Plugin',
      'Perks und Upgrades',
      'Gilden-Bank'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🛡️ Gilden erstellen und beitreten',
          '📈 Gilden-Perks: Crafting, Gather, Combat',
          '🏦 Gilden-Bank',
          '🤝 Allianzen und Kriege',
          '🏆 Gilden-Achievements'
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // SEPTEMBER 2024 - GAMEPLAY PLUGINS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    version: '1.1.0',
    date: '2024-09-30',
    title: 'EldrunRaidBases Plugin',
    type: 'major',
    highlights: [
      '879KB - Größtes Plugin!',
      'Automatische PvE Raids',
      'NPC-Verteidigung'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🏰 Automatisch generierte Raid-Basen',
          '🤖 NPCs mit KI-Verteidigung',
          '⚔️ 4 Schwierigkeitsgrade',
          '💎 Einzigartige Loot-Tables',
          '👥 Gruppen-Raids für mehr Beute'
        ]
      }
    ]
  },
  {
    version: '1.0.5',
    date: '2024-09-25',
    title: 'EldrunQuests System',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '📜 6 Quest-Typen',
          '🎯 Daily und Weekly Quests',
          '👤 NPC Questgeber',
          '🏆 Quest-Belohnungen',
          '📊 Quest-Tracker im HUD'
        ]
      }
    ]
  },
  {
    version: '1.0.4',
    date: '2024-09-20',
    title: 'EldrunServerRewards',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '🎁 Server Rewards System',
          '⏱️ Spielzeit-Belohnungen',
          '🎰 Daily Login Bonus',
          '🏆 Achievement Rewards'
        ]
      }
    ]
  },
  {
    version: '1.0.3',
    date: '2024-09-15',
    title: 'EldrunBounty & Lottery',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '💀 Kopfgeld-System',
          '🎯 Bounty auf Spieler setzen',
          '🎰 Lotterie-System',
          '💰 Jackpot-Pool'
        ]
      }
    ]
  },
  {
    version: '1.0.2',
    date: '2024-09-10',
    title: 'EldrunPets System',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '🐻 Pet Bär - Tank Begleiter',
          '🐺 Pet Wolf - Angriff Begleiter',
          '🐴 Pet Pferd - Schnelles Reittier',
          '🐗 Pet Wildschwein - Sammel-Helfer',
          '🦌 Pet Hirsch - Scout',
          '❄️ Pet Eisbär - Elite Tank'
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // AUGUST 2024 - INFRASTRUCTURE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    version: '1.0.1',
    date: '2024-08-30',
    title: 'EldrunCore & HUD',
    type: 'major',
    highlights: [
      '207KB Core Plugin',
      'Custom HUD System',
      'Info Panel'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🎮 EldrunCore: Basis-Plugin für alle anderen',
          '📊 Custom HUD mit XP, Währungen, Faction',
          'ℹ️ Info Panel mit Server-Stats',
          '🗺️ LustyMap Integration',
          '🧭 Kompass-Anzeige'
        ]
      }
    ]
  },
  {
    version: '1.0.0',
    date: '2024-08-25',
    title: 'EldrunZones & Stormwall',
    type: 'major',
    highlights: [
      'Zone Management',
      'Stormwall Events',
      'PvP/PvE Zonen'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🗺️ Zone Manager mit Custom Zonen',
          '🌪️ Stormwall Event System',
          '⚔️ PvP und PvE Zonen',
          '🏠 Safe Zones',
          '🔒 Raid Protection Zonen'
        ]
      }
    ]
  },
  {
    version: '0.9.0',
    date: '2024-08-20',
    title: 'EldrunClans & Chat',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '👥 Clan System',
          '💬 Better Chat mit Rängen',
          '🏷️ Custom Prefixes',
          '🎨 Farbige Namen'
        ]
      }
    ]
  },
  {
    version: '0.8.0',
    date: '2024-08-15',
    title: 'EldrunLoot & Gather',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '💎 Better Loot Tables',
          '⛏️ Gather Manager mit Multiplikatoren',
          '📦 Custom Loot Spawns',
          '🎨 6 Loot-Seltenheiten'
        ]
      }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // JULI 2024 - FOUNDATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    version: '0.7.0',
    date: '2024-07-30',
    title: 'EldrunCastles Plugin',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '🏰 Castle System mit 12 Gebäuden',
          '🗼 Verteidigungsanlagen',
          '⚔️ Belagerungswaffen',
          '💂 NPC Wachen'
        ]
      }
    ]
  },
  {
    version: '0.6.0',
    date: '2024-07-25',
    title: 'EldrunArtifactIsland',
    type: 'major',
    highlights: [
      '83KB Artifact Plugin',
      'Custom Insel-Event',
      'Legendäre Artefakte'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          '🏝️ Artifact Island Event',
          '🏺 Legendäre Artefakte',
          '👹 Elite NPCs als Wächter',
          '💎 Exklusive Belohnungen',
          '⏱️ Zeitbasiertes Event'
        ]
      }
    ]
  },
  {
    version: '0.5.0',
    date: '2024-07-20',
    title: 'EldrunFastTravel',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '🚀 Schnellreise-Netzwerk',
          '📍 6+ Travel Points',
          '💰 Reisekosten in Scrap',
          '⏱️ Cooldowns'
        ]
      }
    ]
  },
  {
    version: '0.4.0',
    date: '2024-07-15',
    title: 'EldrunEconomics',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '💰 Wirtschaftssystem',
          '🪙 Gold Währung',
          '💎 Dragons Premium-Währung',
          '🛡️ Honor Points',
          '📦 Vote Crates'
        ]
      }
    ]
  },
  {
    version: '0.3.0',
    date: '2024-07-10',
    title: 'EldrunRemoverTool & CopyPaste',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '🔧 Remover Tool für Bauen',
          '📋 CopyPaste für Bases',
          '🏗️ Schnelles Bauen',
          '🔄 Undo-Funktion'
        ]
      }
    ]
  },
  {
    version: '0.2.0',
    date: '2024-07-05',
    title: 'EldrunStarter Pack',
    type: 'minor',
    changes: [
      {
        category: 'feature',
        items: [
          '🎒 Starter Kits',
          '⚔️ Basis Waffen Loadout',
          '🏠 Kleine Starter Base',
          '📦 Ressourcen-Paket'
        ]
      }
    ]
  },
  {
    version: '0.1.0',
    date: '2024-07-01',
    title: 'Projektstart',
    type: 'major',
    highlights: [
      'Erste Server-Idee',
      'Design-Richtung festgelegt',
      'Team formiert'
    ],
    changes: [
      {
        category: 'feature',
        items: [
          'Projektplanung',
          'Design Moodboards',
          'Tech Stack Auswahl'
        ]
      }
    ]
  }
]

const CHANGELOG_ENTRY_MAP: Record<string, ChangelogEntry> = CHANGELOG_ENTRIES.reduce(
  (acc, entry) => {
    acc[entry.version] = entry
    return acc
  },
  {} as Record<string, ChangelogEntry>
)

export function getChangelogEntry(version: string): ChangelogEntry | undefined {
  return CHANGELOG_ENTRY_MAP[version]
}

export function getChangelogAnchorId(version: string): string {
  return `changelog-${version.replace(/\./g, '-')}`
}
