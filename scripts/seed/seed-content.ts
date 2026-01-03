#!/usr/bin/env ts-node
/**
 * Eldrun Content Seeder
 * Seeds the database with realistic demo content for all pages
 * 
 * Usage: pnpm seed:content
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ═══════════════════════════════════════════════════════════════════════════
// NEWS ARTICLES
// ═══════════════════════════════════════════════════════════════════════════

const NEWS_ARTICLES = [
  {
    title: 'Season 3: Schatten der Vergangenheit startet!',
    slug: 'season-3-schatten-der-vergangenheit',
    excerpt: 'Die neue Season bringt epische Inhalte, neue Belohnungen und spannende Events!',
    image: '/images/news/season3-shadow.jpg',
    ctaLabel: 'Battle Pass öffnen',
    ctaUrl: '/battlepass',
    content: `# Season 3: Schatten der Vergangenheit

Die lang erwartete dritte Season von Eldrun ist endlich da! Tauche ein in eine Welt voller neuer Geheimnisse, epischer Kämpfe und legendärer Belohnungen.

## Neue Features

### Der Neue Battle Pass
- **100 Stufen** mit exklusiven Belohnungen
- Neue Skins, Titel und Cosmetics
- Premium-Track mit legendären Items

### Neue Events
- **Geisterinvasion** - Kämpfe gegen untote Horden
- **Schattenturnier** - PvP-Event mit besonderen Regeln
- **Sammelwoche** - Bonus-XP für alle Berufe

### Balance-Änderungen
- Nekromanten-Klasse überarbeitet
- Neue Skills für alle Klassen
- Verbesserte Dungeon-Belohnungen

## Zeitraum
Season 3 läuft vom **20. Dezember 2024** bis **20. März 2025**.

Viel Spaß und möge das Licht (oder die Dunkelheit) euch leiten!`,
    category: 'Ankündigung',
    tags: JSON.stringify(['season', 'update', 'battlepass']),
    isPinned: true,
    published: true,
    isSimulated: true
  },
  {
    title: 'Großes Winter-Event: Frostnacht',
    slug: 'winter-event-frostnacht-2024',
    excerpt: 'Das Frostnacht-Event bringt Schnee, besondere Quests und limitierte Belohnungen!',
    image: '/images/news/frostnacht.jpg',
    ctaLabel: 'Zum Event-Guide',
    ctaUrl: '/news/winter-event-frostnacht-2024',
    content: `# Frostnacht 2024

Der Winter ist über Eldrun hereingebrochen! Das Frostnacht-Event läuft vom **18. Dezember bis 5. Januar**.

## Event-Aktivitäten

### Schneemann-Jagd
Finde und zerstöre die magischen Schneemänner, die überall auf der Karte erscheinen. Jeder Schneemann droppt besondere Event-Währung!

### Frostboss: Eiskönigin Valeria
Jeden Tag um 20:00 Uhr erscheint die Eiskönigin Valeria. Besiege sie für legendäre Belohnungen!

### Winterliche Quests
- Sammle 100 Schneeflocken
- Besiege 50 Frostelementare
- Craftet 10 Winter-Items

## Belohnungen
- **Frostdrachen-Mount** (Legendär)
- **Eiskristall-Rüstungsset**
- **Titel: Frostbezwinger**
- **Schneeflocken-Aura**

Frohe Feiertage!`,
    category: 'Event',
    tags: JSON.stringify(['event', 'winter', 'frostnacht']),
    isPinned: true,
    published: true,
    isSimulated: true
  },
  {
    title: 'Patch 2.5.1 - Bugfixes und Verbesserungen',
    slug: 'patch-2-5-1-bugfixes',
    excerpt: 'Wichtige Fehlerbehebungen und Quality-of-Life Verbesserungen.',
    image: '/images/news/patch-2-5-1.jpg',
    ctaLabel: 'Patch Notes lesen',
    ctaUrl: '/news/patch-2-5-1-bugfixes',
    content: `# Patch 2.5.1

## Bugfixes
- Behoben: Spieler konnten manchmal durch Wände laufen
- Behoben: Gilden-Chat funktionierte nicht nach Server-Neustart
- Behoben: Auktionshaus zeigte falsche Preise an
- Behoben: Skill "Feuerball" verursachte keinen Schaden an NPCs

## Verbesserungen
- Verbesserte Server-Performance
- Schnellere Ladezeiten für das Inventar
- Optimierte Heatmap-Darstellung
- UI-Verbesserungen im Shop

## Balance
- Magier: Feuerball-Schaden um 5% reduziert
- Krieger: Schildblock-Cooldown von 15s auf 12s reduziert
- Schurke: Kritische Trefferchance um 2% erhöht`,
    category: 'Patch Notes',
    tags: JSON.stringify(['patch', 'bugfix', 'balance']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Community Spotlight: Die besten Basen der Woche',
    slug: 'community-spotlight-beste-basen-woche-50',
    excerpt: 'Schaut euch die kreativsten Basen unserer Community an!',
    image: '/images/news/community-spotlight-50.jpg',
    ctaLabel: 'Mehr Spotlights',
    ctaUrl: '/news/community-spotlight-beste-basen-woche-50',
    content: `# Community Spotlight - Woche 50

Diese Woche präsentieren wir euch die beeindruckendsten Basen unserer Community!

## 🥇 1. Platz: "Himmelsfestung" von DragonSlayer
Eine atemberaubende Festung auf einem Bergplateau. Die Kombination aus Verteidigungsanlagen und ästhetischem Design ist unübertroffen!

## 🥈 2. Platz: "Unterwasserpalast" von AquaMarine
Innovativ und einzigartig! Eine komplette Basis unter Wasser mit Glasdächern.

## 🥉 3. Platz: "Die Schwarze Zitadelle" von ShadowLord
Perfekte Vorgaroth-Ästhetik mit beeindruckenden Verteidigungsanlagen.

## Ehrenvolle Erwähnungen
- "Elfenwald-Versteck" von ForestKeeper
- "Vulkanschmiede" von FireForge
- "Eispalast" von FrostQueen

**Reicht eure Basen ein!** Screenshot an support@eldrun.lol`,
    category: 'Community',
    tags: JSON.stringify(['community', 'basen', 'spotlight']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Server-Wartung am 22. Dezember',
    slug: 'server-wartung-22-dezember-2024',
    excerpt: 'Geplante Wartungsarbeiten für wichtige Server-Updates.',
    image: '/images/news/server-maintenance-2212.jpg',
    ctaLabel: 'Status verfolgen',
    ctaUrl: '/status',
    content: `# Geplante Server-Wartung

## Zeitraum
**22. Dezember 2024, 06:00 - 10:00 Uhr MEZ**

## Grund der Wartung
- Hardware-Upgrades für bessere Performance
- Datenbank-Optimierungen
- Sicherheits-Updates

## Was bedeutet das für euch?
- Der Server wird während dieser Zeit **nicht erreichbar** sein
- Alle laufenden Auktionen werden pausiert
- Event-Timer werden entsprechend angepasst

## Entschädigung
Als Entschuldigung für die Unannehmlichkeiten erhalten alle Spieler:
- **500 Gold**
- **2x XP Boost für 24 Stunden**
- **1x Schatzkiste**

Die Belohnungen werden automatisch nach dem Login gutgeschrieben.

Vielen Dank für euer Verständnis!`,
    category: 'Wartung',
    tags: JSON.stringify(['wartung', 'server', 'downtime']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Seraphar Season V – Gläserne Himmel',
    slug: 'seraphar-season-v-glaeserne-himmel',
    excerpt: 'Warbirds, Arkankuppeln und Luftschlachten dominieren die neue Season.',
    image: '/images/news/seraphar-season-v.jpg',
    ctaLabel: 'Patch Notes + Trailer',
    ctaUrl: '/news/seraphar-season-v',
    content: `# Seraphar Season V – Gläserne Himmel

Seraphar hebt ab: Luftschiff-Wettrüsten, Warbird-Bosse und das neue PvP-Areal „Himmelstor Citadel“ fordern jede Gruppe.

## Highlights
- Battle Pass mit 110 Rängen und Phantomrüstung
- Himmelsboss *Azhuriel, der Sturmpriester*
- Neue Skirmish-Modi samt saisonalem Ruhm-Track

## Release
Die Season startet am **27. Dezember** inklusive Trailer-Premiere und Livestream.`,
    category: 'Ankündigung',
    tags: JSON.stringify(['season', 'seraphar', 'skywar']),
    isPinned: true,
    published: true,
    isSimulated: true
  },
  {
    title: 'Schatten-Proklamation der Vorgaroth',
    slug: 'vorgaroth-schatten-proklamation',
    excerpt: 'Lebende Artefakte betreten das Ödland – neue Fraktionsquests und Handelsboni.',
    image: '/images/news/vorgaroth-shadow.jpg',
    ctaLabel: 'Event-Guide lesen',
    ctaUrl: '/news/shadow-proclamation',
    content: `# Schatten-Proklamation

Berichte über lebende Artefakte bestätigen sich. Vorgaroth ruft zu Ritualzügen, bei denen Blutopfer neue Reliktkräfte freischalten.

## Features
- Dynamisches Event-Grid mit Heatmap-Anzeigen
- Handelssteuer-Buff für Vorgaroth-Händler
- Raid-Boss „Ritual der Sieben Sigillen“ im Ödland

Fraktionen erhalten Ruf, Loyalität und kosmetische Banner.`,
    category: 'Event',
    tags: JSON.stringify(['vorgaroth', 'event', 'artefakte']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Arkrelk 2.0 – Mecha-Raid startet in Koop',
    slug: 'arkrelk-mech-raid',
    excerpt: 'Simulationsteam testet Titanenläufe – echter Loot erst auf Liveserver.',
    image: '/images/news/arkrelk-mechraid.jpg',
    ctaLabel: 'Simulator starten',
    ctaUrl: '/news/arkrelk-mechraid',
    content: `# Arkrelk 2.0 – Titanen erwachen

Der erste Eldrun-Mecha-Raid kombiniert 4 Piloten, 2 Ingenieure und einen Artilleristen.

## Feature-Liste
- Kooperative Rollenverteilung mit Live-Kommandokonsole
- Plasma-Kern-Crafting & Mecha-Modulare
- Demo/Simulation Mode ermöglicht Vorabtests (Drops deaktiviert)

Ab Januar im Livebetrieb – bereitet eure Crews vor!`,
    category: 'Preview',
    tags: JSON.stringify(['mech', 'raid', 'simulation']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Markt-Report Q4 – Auktionen explodieren',
    slug: 'auction-report-q4',
    excerpt: 'Runenstahl +35%, neue Watchlist-Grenzen, zehn Tipps für Gewinnspannen.',
    image: '/images/news/auction-report-q4.jpg',
    ctaLabel: 'Auktionsratgeber öffnen',
    ctaUrl: '/news/auction-report-q4',
    content: `# Markt-Report Q4

Wir mergen Simulation-Logs und echte Listings, um Handels-Hotspots sichtbar zu machen.

## Zahlen
- Runenstahl: +35 % Preisindex
- Top-Bieter & Watchlists im Fokus
- Heatmap der heißesten Handelsrouten

## Tipps
1. Maximiere Premium-Aufschläge zur Prime-Time
2. Nutze das neue Advanced-Suchfilter-Set
3. Kombiniere Vertragsauktionen mit Guild Orders`,
    category: 'Wirtschaft',
    tags: JSON.stringify(['auktion', 'wirtschaft', 'report']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Dispatch 3.0 – Grenzläufer-Update',
    slug: 'dispatch-3-roadmap',
    excerpt: '1440p-Modus auf Switch 2, neue Banditenforts und Roadmap bis Frühjahr.',
    image: '/images/news/dispatch-3-roadmap.jpg',
    ctaLabel: 'Roadmap lesen',
    ctaUrl: '/news/dispatch-3-roadmap',
    content: `# Dispatch 3.0

Das Grenzläufer-Protokoll liefert ein Grafik-Upgrade samt neuen Banditenforts.

## Technik
- Switch 1: 720p @ 30 FPS
- Switch 2 & PC: 1440p @ 60 FPS
- Adaptive Auflösung für Events

## Content
- Neue Fortresses mit Erzähler-Stimmenpack
- Saisonale Aufgaben für Roadrunner-Guilds
- Roadmap bis Frühjahr 2026 inklusive Koop-Modus`,
    category: 'Update',
    tags: JSON.stringify(['dispatch', 'update', 'tech']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Achievement-Matrix 1.0 – Eldrun belohnt jeden Spielstil',
    slug: 'achievement-matrix-eldrun',
    excerpt: 'Über 140 Achievements mit Raritäten, Titeln und UI-Rework wurden aktiviert.',
    image: '/images/news/achievements-matrix.jpg',
    ctaLabel: 'Alle Achievements ansehen',
    ctaUrl: '/achievements',
    content: `# Achievement-Matrix 1.0

Der EldrunAchievements-Core wurde nach Monaten im QA-Netzwerk live geschaltet und verknüpft das UI, EldrunCore, EldrunUI und EldrunLocale.

## Highlights
- **7 Kategorien**: Combat, Exploration, Crafting, Social, Economy, Progression, Special
- **Raritäten** von Common bis Legendary mit Farbcodierung im UI
- **Trigger-Engine** verarbeitet Kills, Ressourcen, Quests, Faction-Joins, Bosskills, Trades u. v. m.
- **Belohnungen**: XP, Gold, Items, Titles, Broadcasts für Epic+

## UI & Komfort
- Vollbild-Panel mit Progress-Balken, Tabs & Titelauswahl
- Popup, Sounds & Broadcasts für seltene Unlocks
- Fortschritts-Notifications bei 50 % Meilenstein

## Roadmap
- Integration in Dispatch 3.0 (Console Mode)
- API-Hooks für Discord & Companion-App
- Saisonale Rotationen für Special-Achievements

Verdient euch Titel wie *Himmelstor Protektor* oder *Siegelbrecher* – wir loggen jeden Fortschritt.`,
    category: 'Feature',
    tags: JSON.stringify(['achievements', 'progression', 'feature']),
    isPinned: true,
    published: true,
    isSimulated: true
  },
  {
    title: 'Auktionshaus 1.0 – Gebote, Sofortkauf & Händler-Mails',
    slug: 'eldrun-auctionhaus-release',
    excerpt: 'EldrunAuction vernetzt EldrunCore, HUD und Mail-System. VIP-Slots, Kategorien und Steuern greifen sofort.',
    image: '/images/news/auction-house-release.jpg',
    ctaLabel: 'Zum Auktionshaus',
    ctaUrl: '/auction',
    content: `# Auktionshaus 1.0

Das EldrunAuction-Plugin ist live und bringt ein vollwertiges Marktplatz-Erlebnis direkt ins HUD.

## Key Features
- **Listing-Typen**: Auktion, Sofortkauf oder Hybrid
- **Kategorien** mit Icons (Waffen, Mods, Runen, Utility, Kosmetik)
- **VIP-Slots**: 25 aktive Listings vs. 10 Standard
- **Gebühren**: 5 % Listing Fee, 10 % Verkaufssteuer – automatisch via EldrunCore Gold API
- **Mail Center**: Item-/Gold-Nachrichten mit Zeitstempel

## Komfortfunktionen
- Progress-Notifications im HUD, wenn Listings auslaufen
- Automatisches Zurückbuchen überbotener Gebote
- Watchlist & Suche (12 Items pro Seite, Server-seitig gefiltert)

## Nächste Schritte
- Cross-Faction Auktionssteuer
- Companion-App-Abfragen via EldrunData
- Historische Charts für Runenstahl/Dragons

Liste deine Items jetzt – das Wirtschaftsteam überwacht Heatmap & Bidcount in Echtzeit.`,
    category: 'Wirtschaft',
    tags: JSON.stringify(['auction', 'economy', 'feature']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Automation Hub – Türen, Lichter & Fraktionstore',
    slug: 'eldrun-automation-hub',
    excerpt: 'EldrunAutomation schließt Türen, dimmt Städte und bereitet Burgentore für Fraktionen vor.',
    image: '/images/news/automation-hub.jpg',
    ctaLabel: 'Automation öffnen',
    ctaUrl: '/automation',
    content: `# Automation Hub 1.0

Das neue EldrunAutomation-Plugin automatisiert Basen und Fraktionsanlagen – voll integriert mit EldrunCore, EldrunHUD und EldrunFactions.

## Auto Door Close
- Verzögerung per UI oder Chat (\`/autodoor delay 5-60s\`)
- VIP/Owner/CodeLock geprüft
- Optionaler Soundeffekt, Statistik-Tracking pro Spieler

## Auto Lights
- Serverweite Nachtlogik (18:00–06:00, anpassbar)
- Unterstützt über 15 Light-Prefabs inkl. Disco-Böden & Fogmachine
- Manuelle Toggles per \`/autolight on/off\`

## Faction Gates (Preview)
- Registrierung über Admin-Konsole \`eldrun.auto.admin registergate\`
- Geplante Features: Fraktions-Checks, Belagerungsmodus, Alarm

## UI
- Vollbildpanel mit Tabs für Türen, Lichter, Statistiken
- Live-Status (Serverzeit, Nacht/Tag)
- Buttons für Delay, Sounds, Schalter

Automation bildet die Grundlage für Dispatch 3.0 Housing & Castle Events – Logs landen automatisch im Simulation Mode.`,
    category: 'Feature',
    tags: JSON.stringify(['automation', 'housing', 'qualityoflife']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Backpack Nexus – Upgradebare Slots & sichere Lagerung',
    slug: 'eldrun-backpack-nexus',
    excerpt: 'EldrunBackpacks speichert Items persistent, bietet Tier-Upgrades und Drop-/Wipe-Optionen.',
    image: '/images/news/backpack-nexus.jpg',
    ctaLabel: 'Rucksack öffnen',
    ctaUrl: '/backpacks',
    content: `# Backpack Nexus 1.0

Das neue EldrunBackpacks-Modul bindet Extra-Inventare direkt an EldrunCore, EldrunUI, EldrunHUD und EldrunShop.

## Kernfeatures
- **Tiers & Slots**: Starter mit 6 Slots (1 Reihe) bis Premium (30+ Slots)
- **Upgrades**: Goldkosten + Level-Anforderung, UI zeigt Fortschritt & Gold
- **Persistenz**: Items werden serialisiert inkl. Skins, Condition, Nesting
- **Drop/Wipe-Regeln**: Server-Konfig definiert DropChance, WipeOnDeath, VIP-Bypass
- **Blacklist & Combat Lock**: Admins sperren Items (C4 etc.) und aktivieren Kampfsperre

## UI + Befehle
- Vollbildpanel “🎒 Rucksack System” mit Fortschrittsbalken, Gold-Anzeige, Upgrade-Karten
- Chat/Console Commands: \`/backpack\`, \`/autodoor\`, \`eldrun.backpack close\`
- Admin-Inspect (View fremde Backpacks) über Permission

## Roadmap
- Integration ins EldrunShop (Tier-Gutscheine)
- Companion-App-Viewer via EldrunData
- Seasonale Cosmetics für Backpack-Skins

Packt alles in sichere Reihen – die Dispatch-Teams sehen exakt, was ihr transportiert.`,
    category: 'Feature',
    tags: JSON.stringify(['backpack', 'inventory', 'qualityoflife']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Banking 2.0 – Vaults, Zinsen & Gildenfonds',
    slug: 'eldrun-banking-2',
    excerpt: 'EldrunBanking bringt persönliche Tresore, Gildenbanken, Zinsen und Limits mit EldrunGuilds-Integration.',
    image: '/images/news/banking-hub.jpg',
    ctaLabel: 'Bank öffnen',
    ctaUrl: '/banking',
    content: `# Banking 2.0

Der EldrunBanking-Core verbindet EldrunCore, EldrunHUD, EldrunGuilds und EldrunImages zu einem richtigen MMO-Banksystem.

## Persönliche Konten
- Tresor-Slots (10–50) mit Upgrade über Gold-Kosten
- Vault Items sichern Skins, Condition, Nesting
- Transaktions-Log (Einzahlung, Abhebung, Item-Log)
- Zinsen: 1 % täglich bis 100.000 Gold

## Gildenbanken
- 50+ Slots + Goldkonto
- Permissions (Deposit, Withdraw, Daily Limits)
- Daily Reset der Limits, Logging aller Bewegungen

## Gebühren & Limits
- Optionale Deposit Fee, 1 % Withdraw Fee
- Combat Cooldowns & Blacklist für Items

## UI
- Vollbild „🏦 Eldrun Bank“ mit Tabs (Personal, Guild, History)
- Schnellbuttons 1k / 10k, Gold- & Bank-Anzeige im Header
- Verlauf mit Spielername, Timestamp, Art der Transaktion

Eure Gilden können jetzt Kapital bündeln: Bankdaten fließen direkt in Dispatch 3.0 und Analytics.`,
    category: 'Wirtschaft',
    tags: JSON.stringify(['banking', 'economy', 'guilds']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Battlefield FFA – Waffenroulette & 3s-Respawn',
    slug: 'battlefield-ffa',
    excerpt: 'EldrunBattlefield startet als permanenter Deathmatch-Modus mit Loadout-Raritäten und Broadcast-Streaks.',
    image: '/images/news/battlefield-ffa.jpg',
    ctaLabel: 'Battlefield betreten',
    ctaUrl: '/battlefield',
    content: `# Battlefield FFA

Das Battlefield-Modul ist live und verbindet EldrunCore, HUD, UI und Achievements in einem rasanten Deathmatch.

## Regeln
- Free-for-All, Arena-Radius 100m, zehn Spawnpunkte mit Distanzlogik
- 3 Sekunden Auto-Respawn, neue Waffen mit jedem Spawn
- Loadouts nach Raritätsgewichtung (Primitive → Legendary)
- Kill XP/Gold + Streak-Boni, Broadcasts ab 5er Serie

## Features
- Inventar & Position werden gesichert und nach Verlassen wiederhergestellt
- Healing-Kit & Basic Armor automatisch
- HUD zeigt Kills, Deaths, Streak, Session-Dauer
- Localization: Join/Leave/Kill/Death/Streak Meldungen im Eldrun-Stil

## Achievements & Economy
- API_UpdateProgress('battlefield_kills') liefert neue Achievement-Pfade
- Gold & XP fließen via EldrunCore; Stats pro Match gespeichert

Admin-Kommandos \`/battlefield start/stop\` (Permission) sowie VIP-Zugang stehen bereit. Die Arena läuft nightly im Demo-Cluster.`,
    category: 'Event',
    tags: JSON.stringify(['battlefield', 'pvp', 'event']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Battlegrounds 5v5 – Queue, Ratings & Objectives',
    slug: 'battlegrounds-5v5',
    excerpt: 'EldrunBattlegrounds bringt strukturierte 5v5/10v10-Matches mit Rating, Aufgabenpunkten und Rewards.',
    image: '/images/news/battlegrounds-hub.jpg',
    ctaLabel: 'Queue öffnen',
    ctaUrl: '/battlegrounds',
    content: `# Battlegrounds 5v5

Team-Modi sind zurück: EldrunBattlegrounds verbindet EldrunCore, EldrunParty und EldrunLocale für organisierte PvP-Matches.

## Modi
- Team Deathmatch, Capture the Flag, Domination, King of the Hill
- Teamgrößen 5v5 / 10v10, Timer 15 Minuten, WinScore 100
- Killpunkte + Objectivepunkte + Heal/Damage-Tracking

## Queue & Rating
- Warteschlange pro Battleground, Auto-Team-Balance
- Countdown mit UI, Teleport zu roten/blauen Spawns
- Rating +/-25 bei Sieg/Niederlage, Statistik (Matches, Wins, K/D, Highest Rating)

## Rewards
- Sieg: +500 XP / +250 Gold (config), Niederlage: +100/+50
- Flag Events, Domination-Ticks, Broadcasts bei Flag Drop
- Match-History-UI für Ergebnisse

Queue dich via \`/bg queue <id>\` oder nutze das neue Battlegrounds-Panel. Dispatch-Cluster startet stündlich Rotationen.`,
    category: 'Event',
    tags: JSON.stringify(['battlegrounds', 'pvp', 'team']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Kopfgeld-Netzwerk – Wanted Wall & Hunters',
    slug: 'bounty-network',
    excerpt: 'EldrunBounty schaltet das Kopfgeldsystem frei: Wanted Wall, anonyme Aufträge und Hunter-Leaderboard.',
    image: '/images/news/bounty-network.jpg',
    ctaLabel: 'Wanted Wall öffnen',
    ctaUrl: '/bounty',
    content: `# Kopfgeld-Netzwerk

Mit EldrunBounty werden Spielerziele öffentlich: Wanted Wall, Hunter-Leaderboard und Broadcasts verbinden EldrunCore, HUD und Factions.

## Features
- Bounties von 100 bis 100.000 Gold, Gebühren +10 %, optional anonym (+500 Gold)
- Friendly-Fire-Check blockt Fraktions-Bounties automatisch
- Cooldown 30 min pro Spieler (Permission \`eldrun.bounty.nocooldown\`)
- Serverweite Broadcasts ab 1.000 Gold, Claims zahlen Gold direkt aus

## UI
- Vollbild „💀 Kopfgeld System“ mit Tabs (Wanted, Hunters, Meine, Setzen)
- Statistiken: Gesamtbounty, aktive Einträge, gesammelte Goldsummen
- Hunter-Log zeigt Kills/Gold, Wanted listet Top 25 Ziele

## Economy & Lore
- Abgelaufene Kopfgelder erstatten 100 %
- Raid-Leiter können per Admin-Tool Bounties entfernen
- Achievements & Leaderboards greifen automatisch

Setz ein Zeichen: \`/bounty place <player> <gold>\` + Grund, oder jage die meistgesuchten Köpfe.`,
    category: 'Event',
    tags: JSON.stringify(['bounty', 'pvp', 'event']),
    published: true,
    isSimulated: true
  },
  {
    title: 'World Boss Protocol – Enrage, Lootshare & Alerts',
    slug: 'world-boss-protocol',
    excerpt: 'EldrunBosses liefert skalierende Weltbosse mit Fähigkeiten, Spawnrotation, UI-Balken und Loot-Sharing.',
    image: '/images/news/world-boss.jpg',
    ctaLabel: 'Bosskalender öffnen',
    ctaUrl: '/bosses',
    content: `# World Boss Protocol

EldrunBosses bringt skalierende Weltbosse ins MMO – komplett angebunden an EldrunCore, EldrunHUD, EldrunLocale, EldrunParty.

## Highlights
- **Boss-Raritäten** von Elite bis Mythic/WorldBoss inklusive Level, HP, Damage und Enrage-Bereichen
- **Ability-System** mit Radius, Cooldowns, Effekten (z. B. Meteorschauer, Schockwellen)
- **Skalierung** nach Spielerzahl (HealthScalePerPlayer), Leash & Despawn-Logik
- **Spawnnetz** via BossSpawnPoints, Respawn-Minuten und optionalen Broadcasts beim Spawn/Tod

## Loot & Economy
- LootTable unterstützt Items, Gold, XP; DropChance mit Contribution-Faktor
- Loot-Sharing optional: MinDamageForLoot verhindert Leeches
- Gold/XP-Rewards + EldrunAchievements Hooks (Boss Kills, World Boss Kills)

## UI & Alerts
- HUD-Balken “EldrunUI.BossHealth” aktualisiert alle 0.5s
- Enrage-Announcements, Broadcasts bei FlagCarrier/Death
- Party-kompatibel (EldrunParty) für strukturierte Gruppen

Admins steuern spawns via \`/boss spawn <id>\`, enablen Auto-Rotationen und konfigurieren Loot im JSON. Dispatch nutzt die Daten für Live-Events & Heatmaps.`,
    category: 'Event',
    tags: JSON.stringify(['bosses', 'pve', 'event']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Castle Siege 2.0 – Gildenfestungen unter Feuer',
    slug: 'castle-siege-2',
    excerpt: 'EldrunCastles steuert wöchentliche Belagerungen, Throne-Kontrolle und Steuereinnahmen für Gilden.',
    image: '/images/news/castle-siege.jpg',
    ctaLabel: 'Belagerungsplan anzeigen',
    ctaUrl: '/castles',
    content: `# Castle Siege 2.0

Das EldrunCastles-Modul bringt organisierte Burgbelagerungen inkl. Vorbereitung, Phasenlogik und Belohnungen.

## Kernsystem
- Wöchentliche ScheduleTimes (Tag/Uhrzeit) starten automatisch die Vorbereitung
- Phasen: Gates → Inner Courtyard → Throne Room, mit Gate Health, Throne Capture Timer und Verlängerung
- SiegeState/Phase + Scoreboard für Angreifer/Verteidiger

## Belohnungen & Wirtschaft
- Gewinner: +1000 XP / +500 Gold, Teilnehmer erhalten 200/100
- DailyTaxIncome + Weekly XP Bonus für Besitzer-Gilden
- Defense Level, OwnerFaction & Guild-Name werden aktualisiert

## UI & Broadcasts
- HUD-Panel „EldrunUI.SiegeStatus“ für Teilnehmer
- Serverweite Broadcasts bei Vorbereitung, Start, Verlängerung, Sieg/Niederlage
- EldrunHUD Notifications + Sounds

## Admin/Integration
- EldrunGuilds für Goldzufuhr, EldrunFactions für Checks
- Join via \`/siege join attackers|defenders\`
- Stormwall/EldrunParty Integration für groß angelegte Events

Sichert euch eure Festung – Dispatch veröffentlicht jeden Montag den Belagerungsplan.`,
    category: 'Event',
    tags: JSON.stringify(['castles', 'guild', 'event']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Dueling League – Ranked, Bets & Arenas',
    slug: 'dueling-league',
    excerpt: 'EldrunDuels liefert Anfragen, Ranked Points, Wetten und UI-Countdowns zwischen EldrunClasses.',
    image: '/images/news/dueling-league.jpg',
    ctaLabel: 'Duel Hub öffnen',
    ctaUrl: '/duels',
    content: `# Dueling League

EldrunDuels verbindet Gold-Einsätze, Ranked Ladder und EldrunHUD für kompetitive 1v1s.

## Features
- Duel Requests mit Timeout, Bets (0–10k Gold), Cooldown und Fraktionschecks
- DuelTypes: Classic, Ranked, Tournament, Training
- Countdown HUD, Arena-Zonen mit Radius & Teleport, Anti-Looot
- Damage Tracking + Knockout-Detection, automatische Heilung danach

## Ranking & Rewards
- Spieler-Daten (Wins, WinRate, WinStreak, Rank Bronze→Meister)
- Ranked Points +25/-20, Bet-Pool Auszahlung + XP/Gold Rewards
- Leaderboard-ready via EldrunCore Stats

## UI
- EldrunUI.DuelRequest Panel, Countdown Overlay, Result Panel
- HUD Notifications & Sounds (Invite Notice, Countdown ticks)
- Integration mit EldrunClasses (Loadout), EldrunLocale (Mehrsprachigkeit)

Nutzt \`/duel <player> [bet]\` bzw. \`/duel ranked\` für Ladder-Kämpfe – Dispatch zeigt Top 20 wöchentlich.`,
    category: 'Event',
    tags: JSON.stringify(['duels', 'pvp', 'event']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Bugwatch 1.0 – Meldungen, Rewards & Admin-Panel',
    slug: 'bugwatch-eldrun',
    excerpt: 'EldrunBugReport koordiniert Kategorien, Cooldowns, UI und Gold-Belohnungen für valide Meldungen.',
    image: '/images/news/bugwatch.jpg',
    ctaLabel: 'Bug melden',
    ctaUrl: '/bugreport',
    content: `# Bugwatch 1.0

Mit EldrunBugReport landen Spieler-Bugs direkt beim QA-Team – inklusive Kategorien, Screenshots und Rewards.

## Workflow
- \`/bug <kategorie> <titel> | <beschreibung>\` öffnet das Panel
- Cooldown (5 Min) und Open-Report-Limit (3) verhindern Spam
- Kategorien: UI, Gameplay, Quest, Wirtschaft, PvP, Performance, Kritisch, Sonstiges
- Berichte enthalten Position, Zone, Status (Open/InProgress/Resolved/Rejected)

## Admin Tools
- EldrunUI.BugReport Dashboard mit Tabs (Melden, Meine, Alle)
- Statuswechsel vergibt automatisch Gold (200g normal, 1000g kritisch)
- NotifyAdmins broadcastet neue Reports inkl. ReporterName
- EldrunMail verschickt Rewards, falls Reporter offline ist

## Visibility
- HUD Notifications für Reporter & Admins
- QA kann Reports mit \`/eldrun.bug view all\` prüfen, Buttons für Resolve/Reject
- API Hooks: \`API_SubmitReport\`, \`API_GetOpenReportCount\` für externe Dashboards

Meldet reproduzierbare Bugs samt \`/bug logcode\`. Dispatch veröffentlicht wöchentlich Heatmaps + Fixlisten auf Basis eurer Reports.`,
    category: 'Support',
    tags: JSON.stringify(['bugs', 'support', 'qa']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Companion Forge – Pets, Mounts & VIP-Ställe',
    slug: 'companion-forge',
    excerpt: 'EldrunCompanions liefert 25 Pets & 25 Mounts mit Level-Anforderungen, VIP-Caps und UI-Shop.',
    image: '/images/news/companion-forge.jpg',
    ctaLabel: 'Companion Hub öffnen',
    ctaUrl: '/companions',
    content: `# Companion Forge 1.0

EldrunCompanions verbindet EldrunCore, Leveling, Factions und HUD zu einem vollständigen Pet & Mount-System.

## Highlights
- 25 Pets & 25 Mounts mit Rarity (Common → Mythic), Fraktionsanforderungen und Goldkosten
- VIP-Limits: 15 Pets / 5 Mounts, Standard 10 / 3
- \`/pet summon\`, \`/pet buy\`, \`/mount summon\`, \`/mount buy\`, \`/companions\` UI Tabs
- Pets folgen via FollowDistance, Teleport-Korrekturen bei >5x Distanz
- Mounts tracken Stamina, Distanz, XP (MountXPPer100m)

## Progression
- OwnedPet/OwnedMount speichern Level, CustomName, TimesSummoned, Distance
- XP aus Minuten (Pets) bzw. Distanz (Mounts), Achievements Hook für Summons/Rides
- ActivePet/ActiveMount Persistenz + Auto-Despawn beim Logout (config)

## UI
- EldrunUI.Companions Panel mit Pet-/Mount-Grid, VIP-Limits, Goldanzeige
- Buttons für Kaufen/Beschwören, Raritybars, Favoritenstatus
- Console-Commands \`eldrun.companion pet.summon\` etc. für Admin-Aktionen

Stallmeister aktivieren Events im Companion Hub – kommende Season bringt elementare Skins & Racing Leaderboards.`,
    category: 'Feature',
    tags: JSON.stringify(['companions', 'mounts', 'feature']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Class Nexus – Skilltrees, Mana & Cooldowns',
    slug: 'class-nexus',
    excerpt: 'EldrunClasses verknüpft Skillpunkte, Mana-Bars und Skillbars mit EldrunCore & HUD.',
    image: '/images/news/class-nexus.jpg',
    ctaLabel: 'Class Hub öffnen',
    ctaUrl: '/classes',
    content: `# Class Nexus 1.0

EldrunClasses bringt vollwertige Skilltrees und Mana-Management für Warrior, Archer, Mage, Rogue, Paladin und Necromancer.

## Systems
- Klassenauswahl mit Fraktions-Locks (Paladin = Seraphar, Necro = Vorgaroth)
- SkillPoints pro Level + Bonus bei jedem 5. Level
- ActiveSkillBar (5 Slots), Mana-Bar & Cooldown-Tracking über EldrunHUD
- \`/class select\`, \`/class skills\`, \`/class reset\`, Console-Befehle \`eldrun.class skill.learn/use\`

## Skills & Cooldowns
- Über 18 Skills (Strike, Teleport, Skeleton Summon etc.) mit DamageType, TargetType, Range, AoE
- Cooldowns per Spieler/Skill gespeichert, ManaCost überprüft vor Execution
- Passives erhöhen Armor, Crit, Lifesteal; Ultimates wie Göttlicher Schild mit 60s CD

## UI
- EldrunUI.Classes Selection Panel + Skilltree UI mit Icons, Rängen, Assign Buttons
- Skillbar blendet Cooldowns ein, Mana-Bar zeigt Werte + Regen
- Sound/FX Hooks (floating texts, slash FX) verstärken Feedback

## API Hooks
- \`API_GetPlayerClass\`, \`API_GetPlayerMana\`, \`API_SetPlayerClass\`, \`API_SummonSkill\` (internal) erlauben Integrationen (Leaderboard, Dispatch)

Class Nexus bildet die Grundlage für kommende Raid-Rollen, Skillbalance und Season-Perks.`,
    category: 'Feature',
    tags: JSON.stringify(['classes', 'feature', 'pve']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Event Constellation – Bossrush & Faction Wars live',
    slug: 'event-constellation',
    excerpt: 'EldrunEvents plant BossRush, GatheringContest und TerritoryWars inklusive Scoreboards & Rewards.',
    image: '/images/news/event-constellation.jpg',
    ctaLabel: 'Eventplan öffnen',
    ctaUrl: '/events',
    content: `# Event Constellation 1.0

EldrunEvents orchestriert Serverweite Events mit Ankündigungen, Scoreboards und Gold/XP-Rewards.

## Eventtypen
- BossRush mit automatischem EldrunBosses-Spawn (z. B. forest_guardian)
- TerritoryWar & FactionWar tracken Fraktionspunkte
- GatheringContest wertet Ressourcendrops in Echtzeit
- Treasure & Invasion liefern 30-Minuten-Herausforderungen

## Ablauf
- ScheduleTimes definieren Tag/Uhrzeit – \`EventAnnouncementMinutes\` kündigt 5 Minuten vorher
- Countdown via HUD + Sound, Join über Auto-Teleport (JoinEvent beim Start)
- Scoreboard aktualisiert alle 5 Sekunden; Top 3 broadcasted weltweit

## Rewards
- BaseXP/BaseGold + TopRewardMultiplier (3x/0.6x/0.3x)
- PlayerEventData speichert EventsWon, TotalScore, Kills, Rewards
- FactionWar addiert Score via \`API_GetPlayerFaction\`, Sieger-Fraktion broadcasted

## UI & API
- Panels: EldrunUI.EventAnnouncement, EventScoreboard, EventResult
- Hooks: \`API_SpawnBoss\`, \`API_GetPlayerFaction\` usw. eingebunden
- Commands für Admins (StartEvent, JoinEvent) + Timer gesteuert

Dispatch veröffentlicht jede Woche einen Event-Kalender inkl. Score-Leaderboards.`,
    category: 'Event',
    tags: JSON.stringify(['events', 'pvp', 'pve']),
    published: true,
    isSimulated: true
  },
  {
    title: 'Faction Ledger – Seraphar vs Vorgaroth Stats & Wars',
    slug: 'faction-ledger',
    excerpt: 'EldrunFactions trackt Loyalität, Kriege, Territorien und Bonuswerte für beide Häuser.',
    image: '/images/news/faction-ledger.jpg',
    ctaLabel: 'Fraktionen öffnen',
    ctaUrl: '/factions',
    content: `# Faction Ledger 1.0

Seraphar gegen Vorgaroth – EldrunFactions liefert Stats, WarStates und Territory-Kontrolle.

## Fraktionsdaten
- Live-Mitgliederzahlen, Online-Counts, K/D, Wars Won/Lost, Territories
- Bonuses aus Config (z. B. Seraphar Heilung +10 %, Vorgaroth Dark Magic +25 %)
- Fraktionswechsel optional (AllowFactionChange), Cooldown 7 Tage

## Kriegssystem
- WarStates: Peace → Preparation → Active → Cooldown
- KillPoints + TerritoryCapturePoints, WarDuration 3–72h
- Rewards: Winner 1000 Gold, Teilnehmer 100 Gold (konfigurierbar)
- Broadcasts + FactionScore Tracking via EldrunCore

## Territorien & UI
- CaptureTime 300s, MinPlayers 3, EldrunUI.Factions Panel zeigt Stats
- Befehle via EldrunCore (\`SetPlayerFaction\`), Hooks für EldrunTerritories
- War Log speichert Events + PlayerContribution

Faction Ledger liefert die Grundlage für Event Constellation & Castle Sieges: Dispatch veröffentlicht wöchentlich K/D & Territory Reports.`,
    category: 'Lore',
    tags: JSON.stringify(['factions', 'lore', 'pvp']),
    published: true,
    isSimulated: true
  }
]

const BLACKLIST_ENTRIES = [
  {
    steamId: '76561199123456789',
    playerName: 'RogueMerchant',
    reason: 'Doppelter Echtgeld-Handel + Ausnutzen des Auktionshauses',
    bannedBy: 'Admin Savant',
    isPermanent: true,
    canAppeal: false
  },
  {
    steamId: '76561198011223344',
    playerName: 'StormwallGlitcher',
    reason: 'Stormwand-Glitching während laufender Events (unendliche Loyalität)',
    bannedBy: 'Dev ShadowOps',
    isPermanent: true,
    canAppeal: true
  },
  {
    steamId: '76561198876543210',
    playerName: 'WheelStacker',
    reason: 'WheelOfFate Exploit – Manipulation von Dragons-Payouts',
    bannedBy: 'Casino Overseer',
    isPermanent: false,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    canAppeal: true
  },
  {
    steamId: '76561198223344556',
    playerName: 'GhostTrader',
    reason: 'API Key Missbrauch für externe Shop-Bots',
    bannedBy: 'Security Team',
    isPermanent: true,
    canAppeal: false
  },
  {
    steamId: '76561198099887766',
    playerName: 'TeleportBandit',
    reason: 'Teleport-Abuse + Kill-Farming außerhalb der Regeln',
    bannedBy: 'Moderator IronGuard',
    isPermanent: false,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    canAppeal: true
  }
]

const LEADERBOARD_PLAYERS = [
  { name: 'AzhurielPrime', faction: 'seraphar', class: 'paladin', rank: 1, kills: 3120, deaths: 410, kd: 7.61, playtime: 910, score: 18570, streak: 23, title: 'Himmelstor Protektor', gearScore: 980 },
  { name: 'VorgashRift', faction: 'vorgaroth', class: 'necromancer', rank: 2, kills: 2985, deaths: 530, kd: 5.63, playtime: 870, score: 17640, streak: 18, title: 'Schattenarchitekt', gearScore: 960 },
  { name: 'SeleneStrike', faction: 'seraphar', class: 'rogue', rank: 3, kills: 2744, deaths: 402, kd: 6.82, playtime: 820, score: 16230, streak: 15, title: 'Sturmklinge', gearScore: 945 },
  { name: 'KaelBloodbound', faction: 'vorgaroth', class: 'warrior', rank: 4, kills: 2510, deaths: 612, kd: 4.10, playtime: 760, score: 14980, streak: 12, title: 'Siegelbrecher', gearScore: 930 },
  { name: 'NovaArcanis', faction: 'seraphar', class: 'mage', rank: 5, kills: 2398, deaths: 355, kd: 6.76, playtime: 710, score: 14350, streak: 19, title: 'Aether-Katalysator', gearScore: 925 },
  { name: 'IronFang', faction: 'vorgaroth', class: 'warrior', rank: 6, kills: 2287, deaths: 590, kd: 3.87, playtime: 700, score: 13920, streak: 9, title: 'Festungsbrecher', gearScore: 918 },
  { name: 'LuminaShard', faction: 'seraphar', class: 'archer', rank: 7, kills: 2140, deaths: 420, kd: 5.10, playtime: 660, score: 13110, streak: 11, title: 'Kristall-Scharfschützin', gearScore: 910 },
  { name: 'DravenVoid', faction: 'vorgaroth', class: 'rogue', rank: 8, kills: 2074, deaths: 480, kd: 4.32, playtime: 640, score: 12680, streak: 10, title: 'Schattenkurier', gearScore: 904 },
  { name: 'HelenaDawn', faction: 'seraphar', class: 'paladin', rank: 9, kills: 1988, deaths: 360, kd: 5.52, playtime: 620, score: 12090, streak: 13, title: 'Lichtwächterin', gearScore: 900 },
  { name: 'RivanAsh', faction: 'vorgaroth', class: 'mage', rank: 10, kills: 1875, deaths: 510, kd: 3.67, playtime: 600, score: 11540, streak: 8, title: 'Asche-Weaver', gearScore: 895 }
]

const CHAT_TRANSCRIPTS = [
  {
    channelSlug: 'global',
    messages: [
      { author: 'SerapharCaptain', minutesAgo: 8, content: 'Seraphar-Staffel Alpha meldet: Vorgaroth blockiert erneut die Arkankuppeln. Wir brauchen Warbird-Unterstützung im Himmelstor-Sektor!' },
      { author: 'VorgarothShade', minutesAgo: 7, content: 'Negative. EMP-Glyphen sitzen stabil. Wer unseren Luftraum verletzt, zahlt Blutloyalität.' },
      { author: 'MagistraLumen', minutesAgo: 6, content: 'Erinnert euch: Loyalität <50 % = schwächere Schilde. Macht erst eure Fraktionsquests, bevor ihr losfliegt.' },
      { author: 'AdminSavant', minutesAgo: 5, content: 'LiveOps-Info: Wir beobachten das Gefecht. Bitte keine Exploit-Testläufe – Logs laufen.' },
      { author: 'Roadrunner', minutesAgo: 3, content: 'Dispatch 3.0-Konvoi kreuzt gleich Himmelstor. Bitte keine Warbird-Dogfights genau über dem Shuttle.' },
      { author: 'ForumMod', minutesAgo: 1, content: 'Bleibt sachlich. Für Balance-Diskussionen gibt es den Feedback-Thread.' }
    ]
  },
  {
    title: '[Events] Bossrush Rotation & Scoreboard Feedback',
    slug: 'events-bossrush-scoreboard',
    boardSlug: 'feedback',
    author: 'AdminSavant',
    tags: ['events', 'pve'],
    content: `Event Constellation läuft – wir brauchen Feedback zu:
- BossRush Spawn (forest_guardian) zu schwer?
- Scoreboard Update alle 5s ausreichend?
- Reward-Multiplikator (3x/0.6x/0.3x) fair?

Bitte auch \`/event log\` anhängen, falls ihr Bugs findet.`,
    replies: [
      {
        author: 'AtlasPilot',
        content: `Countdowns funktionieren, aber Scoreboard flackert bei >30 Teilnehmern. Könnt ihr die HUD-Panelgröße eskalieren?` 
      },
      {
        author: 'GuildBanker',
        content: `FactionWar Punkte wirken random – könnt ihr die EldrunCore-Factions noch mal syncen? Seraphar bekam keine Rewards.` 
      },
      {
        author: 'DevReply',
        content: `Scoreboard bekommt Performance-Patch, Faction-Sync läuft über \`API_GetPlayerFaction\`-Fix. Danke für die Logs!` 
      }
    ]
  },
  {
    title: '[Factions] Loyalität, Boni & Kriegsvorbereitung',
    slug: 'factions-loyalty-boni',
    boardSlug: 'feedback',
    author: 'MagistraLumen',
    tags: ['factions', 'pvp'],
    content: `Faction Ledger ist live – gebt Feedback zu:
- Loyalitäts-Boni (Seraphar Heilung, Vorgaroth Dark Magic) spürbar?
- WarStates: Preparation 30 Minuten ausreichend?
- Territory Capture (300s, 3 Spieler) zu streng?

Bitte War-Logs (\`/faction war log\`) anhängen.`,
    replies: [
      {
        author: 'SerapharCaptain',
        content: `Seraphar braucht 15 % Heal Buff, sonst überrennen uns Vorgaroth-Nachtangriffe. Außerdem: WarBroadcasts gerne 2 Minuten früher.` 
      },
      {
        author: 'VorgarothShade',
        content: `CaptureTime 300s ist ok, aber MinPlayers 3 blockt Solo-Saboteure. Vielleicht 2 Spieler + Loyalität >60?` 
      },
      {
        author: 'DevReply',
        content: `Wir testen 2-Spieler-Capture für Randzonen und erhöhen Seraphar-Heal-Bonus auf 12 %. Danke für die Logs!` 
      }
    ]
  },
  {
    channelSlug: 'trade',
    messages: [
      { author: 'TradeBaron', minutesAgo: 30, content: 'Suche 200 Runenstahl. Zahle 15 % über Marktpreis, wenn sofortige Lieferung.' },
      { author: 'AuctioneerRynn', minutesAgo: 28, content: 'Habe 120 Runenstahl, aber nur gegen Loyalitätstoken. Interesse?' },
      { author: 'GuildBanker', minutesAgo: 26, content: 'Neue Watchlist-Grenze aktiv: achtet auf die 10-Listing-Cap, sonst müsst ihr Premium-Slots freischalten.' },
      { author: 'WheelRunner', minutesAgo: 23, content: 'Oder ihr zockt WheelOfFate. Gestern zwei Legendary-Sigils in 15 Spins.' },
      { author: 'TradeBaron', minutesAgo: 21, content: 'Deal @Rynn. Schick dir gleich einen Gildenbot zur Abholung.' },
      { author: 'TeleportTech', minutesAgo: 19, content: 'Denkt an die neue Handelsroute über Stormwall-Süd. Teleport dort hat 10-Minuten-Cooldown.' }
    ]
  },
  {
    channelSlug: 'lfg',
    messages: [
      { author: 'AtlasPilot', minutesAgo: 60, content: 'Suche 2 Ingenieure + 1 Artillerist für Arkrelk 2.0 (Live, kein Sim). Treffpunkt 20:00 in GhostDock.' },
      { author: 'EngineerKyra', minutesAgo: 58, content: 'Bin dabei. Habe Cascade Array und Plasma-Kern-Kit.' },
      { author: 'ShadowOps', minutesAgo: 55, content: 'Ich specte euch im Hintergrund – neue Damage Matrices aktiv. Feedback erwünscht.' },
      { author: 'LoreKeeper', minutesAgo: 53, content: 'Bringe RP-Intro zu Arkrelk mit. Wer will, bekommt Bonus-Lore.' },
      { author: 'Roadrunner', minutesAgo: 50, content: 'Kann als Ersatzpilot einspringen, falls jemand DC hat.' }
    ]
  },
  {
    channelSlug: 'seraphar',
    messages: [
      { author: 'SerapharCaptain', minutesAgo: 15, content: 'Alle Seraphar-Piloten: Phantomrüstung aufladen und im Hangar West sammeln. Ziel: Himmelstor zurückerobern.' },
      { author: 'StableMaster', minutesAgo: 13, content: 'Reittier-Stall bereit. Greiflinge frisch gefüttert, Loyalitätskosten halbiert für die nächsten 2 Stunden.' },
      { author: 'MagistraLumen', minutesAgo: 11, content: 'Buff-Rotationen gepostet. Bitte keine Doppelungen bei Göttlicher Schild.' }
    ]
  },
  {
    channelSlug: 'vorgaroth',
    messages: [
      { author: 'VorgarothShade', minutesAgo: 18, content: 'Ritualisten der Sieben Sigillen, sammelt euch an der Süd-Scherbe. Wir halten die Arkankuppeln.' },
      { author: 'UndeadHunter', minutesAgo: 16, content: 'Nebenbei läuft ein Sturmwand-Run. Wer Loyalität opfern mag, kommt mit nach Westen.' },
      { author: 'TeleportTech', minutesAgo: 14, content: 'Schatten-Gates offen. Nutzt Code 441, um direkt in die Kuppel zu springen.' }
    ]
  },
  {
    channelSlug: 'qa',
    messages: [
      { author: 'AdminSavant', minutesAgo: 12, content: 'Bugwatch: 42 neue Reports seit Reset. Kritische Tickets zuerst in /bug all sortieren.' },
      { author: 'ShadowOps', minutesAgo: 10, content: 'Denkt daran: /bug logcode anhängen, sonst kann das Repro-Team nichts tun.' },
      { author: 'EngineerKyra', minutesAgo: 9, content: 'UI-Glitch #2187 nachgestellt. Fix liegt auf dem Staging-Server, Feedback erwünscht.' },
      { author: 'MagistraLumen', minutesAgo: 7, content: 'Belohnungen verschickt: 3x 200 Gold für valide Quests, 1x 1000 Gold für kritischen Duping-Bug.' },
      { author: 'QA-Bot', minutesAgo: 5, content: 'Reminder: Bug-Panel in HUB Nord testen. Spracheinstellung DE/EN umschalten und Screenshots anhängen.' }
    ]
  },
  {
    channelSlug: 'events',
    messages: [
      { author: 'AdminSavant', minutesAgo: 15, content: 'Event Constellation Countdown: BossRush startet in 5 Minuten. HUD-Panels gehen gleich live.' },
      { author: 'AtlasPilot', minutesAgo: 13, content: 'Squad Alpha unterwegs zum Marker. Bitte Scoreboard stabil halten, wir liefern Logdaten.' },
      { author: 'GuildBanker', minutesAgo: 10, content: 'FactionWar-Reward-Share pending – EldrunCore Tickets #4473 offen. Keine Auszahlungen bis Fix.' },
      { author: 'EventCaster', minutesAgo: 8, content: 'Live-Stream auf Dispatch TV – scoreboard overlay aktualisiert alle 5 Sekunden. Ping <50 empfohlen.' },
      { author: 'DevReply', minutesAgo: 6, content: 'Fix für flackernde Panels deployed. Bitte \"/event log\" senden, falls noch Tearing auftritt.' }
    ]
  }
]

// ═══════════════════════════════════════════════════════════════════════════
// CHANGELOG RELEASES
// ═══════════════════════════════════════════════════════════════════════════

const CHANGELOG_RELEASES = [
  {
    version: '2.5.1',
    title: 'Hotfix & Balance Update',
    description: 'Wichtige Fehlerbehebungen und Balance-Anpassungen',
    type: 'patch',
    isPublished: true,
    items: [
      { type: 'fixed', category: 'bugs', title: 'Spieler konnten durch Wände laufen', description: 'Kollisionserkennung verbessert' },
      { type: 'fixed', category: 'bugs', title: 'Gilden-Chat nach Neustart', description: 'Chat-System repariert' },
      { type: 'fixed', category: 'bugs', title: 'Auktionshaus Preisanzeige', description: 'Formatierung korrigiert' },
      { type: 'changed', category: 'balance', title: 'Magier Feuerball', description: 'Schaden um 5% reduziert' },
      { type: 'changed', category: 'balance', title: 'Krieger Schildblock', description: 'Cooldown von 15s auf 12s reduziert' },
      { type: 'improved', category: 'performance', title: 'Server-Performance', description: 'Tick-Rate optimiert' }
    ]
  },
  {
    version: '2.5.0',
    title: 'Season 3: Schatten der Vergangenheit',
    description: 'Großes Content-Update mit neuer Season',
    type: 'major',
    isPublished: true,
    items: [
      { type: 'added', category: 'content', title: 'Neuer Battle Pass', description: '100 Stufen mit exklusiven Belohnungen' },
      { type: 'added', category: 'content', title: 'Neue Dungeon-Zone', description: 'Das Schattenlabyrinth' },
      { type: 'added', category: 'gameplay', title: 'Neue Quests', description: '15 neue Story-Quests' },
      { type: 'added', category: 'content', title: 'Neue Skins', description: '25 neue Waffen- und Rüstungsskins' },
      { type: 'changed', category: 'gameplay', title: 'Nekromanten-Überarbeitung', description: 'Komplettes Skill-Rework' },
      { type: 'improved', category: 'ui', title: 'Neues Inventar-UI', description: 'Übersichtlicher und schneller' }
    ]
  },
  {
    version: '2.4.5',
    title: 'Quality of Life Update',
    description: 'Verbesserungen basierend auf Community-Feedback',
    type: 'minor',
    isPublished: true,
    items: [
      { type: 'added', category: 'ui', title: 'Schnellzugriff-Leiste', description: 'Anpassbare Hotbar für Items' },
      { type: 'added', category: 'gameplay', title: 'Auto-Loot Option', description: 'Automatisches Aufsammeln von Items' },
      { type: 'improved', category: 'performance', title: 'Ladezeiten', description: 'Bis zu 40% schnelleres Laden' },
      { type: 'fixed', category: 'bugs', title: 'Diverse Kleinigkeiten', description: '47 kleinere Bugs behoben' }
    ]
  }
]

// ═══════════════════════════════════════════════════════════════════════════
// FORUM CONTENT
// ═══════════════════════════════════════════════════════════════════════════

const FORUM_CATEGORIES = [
  { name: 'Allgemein', slug: 'allgemein', description: 'Allgemeine Diskussionen rund um Eldrun', icon: '💬', color: '#D4AF37' },
  { name: 'Ankündigungen', slug: 'ankuendigungen', description: 'Offizielle Neuigkeiten vom Eldrun-Team', icon: '📢', color: '#22C55E' },
  { name: 'Hilfe & Support', slug: 'hilfe-support', description: 'Fragen und Hilfestellungen', icon: '❓', color: '#3B82F6' },
  { name: 'Guides & Tutorials', slug: 'guides', description: 'Anleitungen und Tipps von der Community', icon: '📚', color: '#8B5CF6' },
  { name: 'Clans & Recruiting', slug: 'clans', description: 'Finde eine Gilde oder rekrutiere Mitglieder', icon: '🏰', color: '#EF4444' },
  { name: 'Off-Topic', slug: 'off-topic', description: 'Alles andere', icon: '🎮', color: '#6B7280' },
  { name: 'Simulation & QA', slug: 'simulation', description: 'Tests, Demo-Modus und Automationsberichte', icon: '⚙️', color: '#0EA5E9' },
  { name: 'Lore & Roleplay', slug: 'lore-rp', description: 'Geschichten, Charaktere und Narrative', icon: '📜', color: '#F97316' },
  { name: 'Ökonomie & Handel', slug: 'economy', description: 'Marktreports, Auktionen und Verträge', icon: '💱', color: '#14B8A6' },
  { name: 'Live Events & Ops', slug: 'events-live', description: 'Operationen, Raid-Pläne und Broadcasts', icon: '🎧', color: '#FB7185' }
]

const FORUM_BOARDS = [
  { categorySlug: 'allgemein', name: 'Neuigkeiten & Diskussion', slug: 'neuigkeiten', description: 'Aktuelle Themen und Diskussionen' },
  { categorySlug: 'allgemein', name: 'Feedback & Vorschläge', slug: 'feedback', description: 'Teile deine Ideen mit dem Team' },
  { categorySlug: 'ankuendigungen', name: 'Server-News', slug: 'server-news', description: 'Offizielle Server-Ankündigungen' },
  { categorySlug: 'ankuendigungen', name: 'Patch Notes', slug: 'patch-notes', description: 'Update-Informationen' },
  { categorySlug: 'hilfe-support', name: 'Technische Probleme', slug: 'tech-support', description: 'Hilfe bei technischen Problemen' },
  { categorySlug: 'hilfe-support', name: 'Gameplay-Fragen', slug: 'gameplay-fragen', description: 'Fragen zum Spielablauf' },
  { categorySlug: 'guides', name: 'Anfänger-Guides', slug: 'anfaenger-guides', description: 'Guides für neue Spieler' },
  { categorySlug: 'guides', name: 'Fortgeschrittene Guides', slug: 'advanced-guides', description: 'Für erfahrene Spieler' },
  { categorySlug: 'clans', name: 'Clan sucht Mitglieder', slug: 'clan-sucht', description: 'Gilden auf der Suche nach Verstärkung' },
  { categorySlug: 'clans', name: 'Spieler sucht Clan', slug: 'spieler-sucht', description: 'Spieler auf der Suche nach einer Gilde' },
  { categorySlug: 'off-topic', name: 'Gaming', slug: 'gaming', description: 'Andere Spiele und Gaming-Themen' },
  { categorySlug: 'off-topic', name: 'Kreatives', slug: 'kreatives', description: 'Fan-Art, Stories und mehr' },
  { categorySlug: 'simulation', name: 'Demo & QA Talk', slug: 'simulation-talk', description: 'Simulation Mode, Tests und QA-Debriefs' },
  { categorySlug: 'simulation', name: 'Automation Reports', slug: 'automation-reports', description: 'Automations-Pipelines, Cronjobs und Logs' },
  { categorySlug: 'lore-rp', name: 'Chroniken & Erzählungen', slug: 'chroniken', description: 'Langform-RP, Archiv-Chroniken und Stories' },
  { categorySlug: 'lore-rp', name: 'Charakterbörse', slug: 'charakterboerse', description: 'Charakterprofile, Beziehungen, Fraktionen' },
  { categorySlug: 'economy', name: 'Market Intelligence', slug: 'market-intel', description: 'Reports, Charts und Preisalarme' },
  { categorySlug: 'events-live', name: 'Operation Briefings', slug: 'ops-briefings', description: 'LiveOps, Raid-Pläne und Einsatzbefehle' },
  { categorySlug: 'events-live', name: 'Broadcast & Recap', slug: 'broadcast-recap', description: 'Nachberichte, Streams und Auswertungen' }
]

const FORUM_USERS = [
  { email: 'captain@eldrun.lol', username: 'SerapharCaptain', displayName: 'Captain Eloria', role: 'player', faction: 'seraphar', avatar: '/images/avatars/seraphar-captain.jpg', bio: 'Warbird-Kommandantin der Seraphar-Luftflotte.' },
  { email: 'shade@eldrun.lol', username: 'VorgarothShade', displayName: 'Shade Varion', role: 'player', faction: 'vorgaroth', avatar: '/images/avatars/vorgaroth-shade.jpg', bio: 'Schattenklingen-Offizier und Ritualgelehrter.' },
  { email: 'lumen@eldrun.lol', username: 'MagistraLumen', displayName: 'Magistra Lumen', role: 'moderator', faction: 'seraphar', avatar: '/images/avatars/magistra-lumen.jpg', bio: 'Lore-Archivarin & Balance-Team.' },
  { email: 'savant@eldrun.lol', username: 'AdminSavant', displayName: 'Admin Savant', role: 'admin', faction: 'neutral', avatar: '/images/avatars/admin-savant.jpg', bio: 'Tech-Lead der Eldrun-Serverflotte.' },
  { email: 'trade@eldrun.lol', username: 'TradeBaron', displayName: 'Baron Rhyse', role: 'player', faction: 'neutral', avatar: '/images/avatars/trade-baron.jpg', bio: 'Ökonomie-Experte und Auktionär.' },
  { email: 'auctioneer@eldrun.lol', username: 'AuctioneerRynn', displayName: 'Rynn Talar', role: 'player', faction: 'seraphar', avatar: '/images/avatars/auctioneer-rynn.jpg', bio: 'Auktionshaus-Analystin.' },
  { email: 'wheel@eldrun.lol', username: 'WheelRunner', displayName: 'Kesh the Runner', role: 'player', faction: 'vorgaroth', avatar: '/images/avatars/wheel-runner.jpg', bio: 'Wheel of Fate Enthusiast.' },
  { email: 'guildbank@eldrun.lol', username: 'GuildBanker', displayName: 'Helian Ledger', role: 'player', faction: 'neutral', avatar: '/images/avatars/guild-banker.jpg', bio: 'Gildenökonom & Datenanalyst.' },
  { email: 'atlas@eldrun.lol', username: 'AtlasPilot', displayName: 'Atlas Irun', role: 'player', faction: 'seraphar', avatar: '/images/avatars/atlas-pilot.jpg', bio: 'Lead-Pilot der Arkrelk-Testcrew.' },
  { email: 'kyra@eldrun.lol', username: 'EngineerKyra', displayName: 'Kyra Solance', role: 'player', faction: 'neutral', avatar: '/images/avatars/engineer-kyra.jpg', bio: 'Mecha-Ingenieurin und Automation-Nerd.' },
  { email: 'lore@eldrun.lol', username: 'LoreKeeper', displayName: 'Keeper Arion', role: 'player', faction: 'seraphar', avatar: '/images/avatars/lore-keeper.jpg', bio: 'RP-Historiker & Storyteller.' },
  { email: 'shadowops@eldrun.lol', username: 'ShadowOps', displayName: 'Dev ShadowOps', role: 'admin', faction: 'neutral', avatar: '/images/avatars/shadow-ops.jpg', bio: 'Core-Developer & LiveOps.' },
  { email: 'roadrunner@eldrun.lol', username: 'Roadrunner', displayName: 'Ria Swiftstep', role: 'player', faction: 'neutral', avatar: '/images/avatars/roadrunner.jpg', bio: 'Grenzläuferin & Dispatch-Testerin.' },
  { email: 'stable@eldrun.lol', username: 'StableMaster', displayName: 'Hadrin Foxglove', role: 'player', faction: 'seraphar', avatar: '/images/avatars/stable-master.jpg', bio: 'Mount-Designer & Stallwart.' },
  { email: 'teleport@eldrun.lol', username: 'TeleportTech', displayName: 'Techniker Voss', role: 'player', faction: 'vorgaroth', avatar: '/images/avatars/teleport-tech.jpg', bio: 'Portal-Ingenieur und Heatmap-Jäger.' },
  { email: 'mod@eldrun.lol', username: 'ForumMod', displayName: 'Forum Moderator', role: 'moderator', faction: 'neutral', avatar: '/images/avatars/forum-mod.jpg', bio: 'Bewahrt Ordnung im Forum.' },
  { email: 'stormwatch@eldrun.lol', username: 'Stormwatch', displayName: 'Scout Edrin', role: 'player', faction: 'seraphar', avatar: '/images/avatars/stormwatch.jpg', bio: 'Forscher der Sturmwand.' },
  { email: 'undead@eldrun.lol', username: 'UndeadHunter', displayName: 'Kael Bonesong', role: 'player', faction: 'vorgaroth', avatar: '/images/avatars/undead-hunter.jpg', bio: 'Spezialist für Untoten-Events.' },
  { email: 'archiv@eldrun.lol', username: 'LoreArchiv', displayName: 'Archivarin Sena', role: 'player', faction: 'neutral', avatar: '/images/avatars/lore-archiv.jpg', bio: 'Bewahrt jede RP-Session.' },
  { email: 'devreply@eldrun.lol', username: 'DevReply', displayName: 'Dev Reply Bot', role: 'admin', faction: 'neutral', avatar: '/images/avatars/dev-reply.jpg', bio: 'Automatisierte Dev-Antworten.' }
]

const FORUM_TAGS = [
  { name: 'Lore', slug: 'lore', color: '#FBBF24' },
  { name: 'PvP', slug: 'pvp', color: '#EF4444' },
  { name: 'Season', slug: 'season', color: '#10B981' },
  { name: 'Economy', slug: 'economy', color: '#3B82F6' },
  { name: 'Mech', slug: 'mech', color: '#6366F1' },
  { name: 'Travel', slug: 'travel', color: '#A855F7' },
  { name: 'Event', slug: 'event', color: '#EC4899' },
  { name: 'RP', slug: 'rp', color: '#8B5CF6' },
  { name: 'Achievements', slug: 'achievements', color: '#FACC15' },
  { name: 'Bounty', slug: 'bounty', color: '#DC2626' },
  { name: 'Duels', slug: 'duels', color: '#F97316' },
  { name: 'Bugs', slug: 'bugs', color: '#fb923c' },
  { name: 'Companions', slug: 'companions', color: '#10b981' },
  { name: 'Classes', slug: 'classes', color: '#60a5fa' },
  { name: 'Events', slug: 'events', color: '#f97316' },
  { name: 'Factions', slug: 'factions', color: '#fcd34d' }
]

const FORUM_THREADS = [
  {
    title: '[Lore & PvP] Himmelstor Citadel – wer kontrolliert den Luftraum?',
    slug: 'himmelstor-citadel-luftraum',
    boardSlug: 'neuigkeiten',
    author: 'SerapharCaptain',
    isPinned: true,
    tags: ['lore', 'pvp', 'season'],
    content: `*„Im Licht erobern wir“*

Seit dem letzten Patch campen Vorgaroth-Trupps permanent die Arkankuppeln über der Himmelstor-Zitadelle. Unsere Warbirds platzen, bevor sie auf 500 m ran sind. Fragen:
1. Nutzt ihr **Azhuriels Blitzlanze** noch oder killt euch die Ladezeit?
2. Wie kontert ihr die neuen Heatmap-Pings auf Supply-Routen?
3. Lohnt sich der 110er-Season-Rang wegen der Phantomrüstung oder Gold sparen?`,
    replies: [
      {
        author: 'VorgarothShade',
        content: `Die EMP-Glyphen stacken wir mit dem **Ritual der Sieben Sigillen**. Warbird stürzt, bevor ihr überhaupt raus seid. Tipp: Nutzt eure Arkana-Schutzblase nicht permanent, sondern nur beim Dive. Heatmap-Scanner aus \`EldrunBattlegrounds\` geben uns +10 % Reichweite – ohne /scan seid ihr frei Haus.`
      },
      {
        author: 'MagistraLumen',
        content: `Balance-Note: Warbird-Schilde skalieren mit Fraktionsloyalität. Wer <50 % hat, bekommt nur 80 % Schildwerte. Erst Fraktionsquests, dann jammern. Und ja, Phantomrüstung = BiS für Luftkämpfe (+12 % Resistenz gegen Luftminen).`
      },
      {
        author: 'AdminSavant',
        content: `Letzte Nacht Test: Seraphar (2 Warbirds + Priester + Ballista) vs Vorgaroth (3 Glyphen + Ritualist). Ergebnis 2:1 für Vorgaroth nach 22 Min. Wir evaluieren intern, ob der Glyphen-Cooldown leicht hoch muss.`
      }
    ]
  },
  {
    title: '[Classes] Skilltrees & Cooldown-Hotfix 1.0',
    slug: 'classes-skilltree-hotfix',
    boardSlug: 'feedback',
    author: 'MagistraLumen',
    tags: ['classes', 'feature'],
    content: `Class Nexus rollt aus. Bitte Feedback zu:
- SkillPoints pro Level (1 + Bonus alle 5 Level) ausreichend?
- Cooldowns fühlen sich zäh an (Rogue Stealth 45s, Paladin Shield 60s)?
- Mana-Regeneration pro Klasse im HUD ok?

Bugmeldungen inkl. SkillID + /class log bitte hier posten.`,
    replies: [
      {
        author: 'SerapharCaptain',
        content: `Paladin braucht dringend 45s Schild-CD, sonst halten wir keine Ops. Heals ok, aber Damage-Skills zu teuer.` 
      },
      {
        author: 'VorgarothShade',
        content: `Necro Lifesteal stackt zu heftig mit Companion-Pets. Schaut euch \`n_drain\` + Shadowwolf an.` 
      },
      {
        author: 'DevReply',
        content: `Stealth-CD geht auf 35s, Göttlicher Schild auf 50s. Mana-Regen Patch folgt. Danke für die Daten!` 
      }
    ]
  },
  {
    title: '[Companions] Stallmeister-Balancing & VIP Slots',
    slug: 'companions-stallmeister-feedback',
    boardSlug: 'feedback',
    author: 'StableMaster',
    tags: ['companions', 'feature'],
    content: `Companion Forge ist live – gebt Feedback zu:
- VIP-Limit 15/5 vs. Standard 10/3
- Pet XP pro Minute (5) zu niedrig?
- Mount-Stamina fällt bei Rennen zu schnell?

Wir testen Racing-Leaderboards + elementare Skins.`,
    replies: [
      {
        author: 'EngineerKyra',
        content: `MountXPPer100m fühlt sich gut an, aber Teleporter resetten Distance nicht richtig. Könnt ihr Position caching prüfen?` 
      },
      {
        author: 'GuildBanker',
        content: `Goldkosten ok. Was fehlt: Gilden-Buffs für Stallmeister (z. B. 5% Speed).` 
      },
      {
        author: 'DevReply',
        content: `Stamina-Drain wird um 10 % reduziert. Distance-Bug fixen wir im 1.0.1 Patch, danke für die Logs.` 
      }
    ]
  },
  {
    title: '[Markt & Wirtschaft] Runenstahlpreis +35 % – was tun?',
    slug: 'runenstahlpreis-bericht',
    boardSlug: 'feedback',
    author: 'TradeBaron',
    tags: ['economy'],
    content: `Der Q4-Report meldet +35 % auf Runenstahl. Liegt das an den neuen Arkrelk-Modularen oder zählen Simulation-Listings mit? Überlege ernsthaft, das WheelOfFate zu farmen statt Auktionshaus.`,
    replies: [
      {
        author: 'AuctioneerRynn',
        content: `Explosion hat zwei Gründe: 1) **Gildenverträge** aus \`EldrunBanking\` – öffentliche Listings trocknen aus. 2) Simulationseinträge werden als \`isSimulated\` markiert, zählen also nicht. Nutze das neue Advanced-Filter-Set und blende Fake-Angebote aus.`
      },
      {
        author: 'WheelRunner',
        content: `Wheel lohnt nur mit Lucky Sigils. Sonst verbrennst du Dragons. Für Runenstahl: ab ins Labyrinth (Daemon X Machina-Zone). Droprate von 2 % auf 3,5 % erhöht.`
      },
      {
        author: 'GuildBanker',
        content: `Jede Gilde braucht zwei Logistik-Offiziere für die Watchlists. Wir nutzen ein \`EldrunAutomation\`-Script, das stündlich Preise cached. Bei Interesse DM – nur für ernsthafte Trader.`
      }
    ]
  },
  {
    title: '[Mech Raid] Arkrelk 2.0 – Rollen & Builds',
    slug: 'arkrelk-rollen-builds',
    boardSlug: 'advanced-guides',
    author: 'AtlasPilot',
    tags: ['mech', 'season'],
    content: `Simulation Mode ist nett, aber im Live-Raid fressen uns die Titanenphasen. Crew: 4 Piloten (Tank, DPS, Support, Flex), 2 Ingenieure, 1 Artillerist. Trotzdem wipe bei Overclock. Ideen?`,
    replies: [
      {
        author: 'EngineerKyra',
        content: `Achte auf die **Plasma-Kern-Temperatur**. \`EldrunAutomation\` regelt bei 85 % automatisch runter. Override aktivieren, bevor ihr overclockt. Das neue Modular „Cascade Array“ reaktiviert Schilde nach jedem dritten Treffer – Drop im GhostShip-Event.`
      },
      {
        author: 'LoreKeeper',
        content: `Lore-Hinweis: Arkrelk war einst ein Vorgaroth-Titan. Nutzt das RP! Und kennzeichnet eure Threads mit [RP], sonst löscht Mod sie.`
      },
      {
        author: 'ShadowOps',
        content: `Wir testen Damage Matrices für Artilleristen im \`EldrunBattlegrounds\`-Branch. Dieses Feedback wandert direkt ins nächste Build. Danke!`
      }
    ]
  },
  {
    title: '[Achievements] Hidden Legendary Trigger – Datenabgleich',
    slug: 'achievements-hidden-legendary',
    boardSlug: 'feedback',
    author: 'MagistraLumen',
    tags: ['achievements'],
    content: `Seit EldrunAchievements live ist, bekommen wir zig Reports zu „Nightfall Archivist“ (Legendary) und „Stormwall Archivist“. Laut Config braucht man:
- 50 Zonen entdeckt
- 25 Lore-Seiten eingesammelt
- 3 Sturmwand-Runs ohne Tod

Trotzdem scheinen einige Spieler keinen Unlock zu erhalten. Hat jemand Logs oder HitInfo, die zeigen, dass die Trigger nicht feuern?`,
    replies: [
      {
        author: 'AdminSavant',
        content: `Wir haben das Trigger-Fenster gesenkt: \`zones_discovered\` ≥ 48 reicht jetzt. Bitte /report achiev + Screenshot posten, dann prüfen wir ProgressCache.` 
      },
      {
        author: 'LoreArchiv',
        content: `Bei uns hat geholfen, den dritten Sturmwand-Run im selben Server-Zyklus zu machen. Sonst resetten die Flags.` 
      },
      {
        author: 'DevReply',
        content: `Patch 1.0.3 incoming: Progress Notification feuert bei 75 %. Danke für alle JSON-Dumps!` 
      }
    ]
  },
  {
    title: '[Community & QoL] Reisezeiten – /teleport vs Reittiere?',
    slug: 'reisezeiten-teleport-vs-mounts',
    boardSlug: 'gameplay-fragen',
    author: 'Roadrunner',
    tags: ['travel'],
    content: `Seit \`EldrunTeleport\` genervt wurde, fühl ich nur Grind. Früher /tp base, jetzt „Teleport-Kapazität erschöpft“. Lohnt es sich, voll auf Mounts zu setzen? Oder doch Gilden-Hub + Shuttle?`,
    replies: [
      {
        author: 'StableMaster',
        content: `Mounts wurden bewusst gebufft: Nekros kriegen Skelett-Raptoren mit +15 % Speed, Paladine Seraphar-Greiflinge mit +20 % Sprungweite. Mount-Fuel = Loyalty Tokens, also Farmlauf einplanen.`
      },
      {
        author: 'TeleportTech',
        content: `Teleport-Limit verhindert Heatmap-Escape. Bau deinen Gildenhub zentral und nutzen Shuttle-Beratungsstellen aus \`EldrunParty\`. Die haben nur 15 Min Cooldown.`
      },
      {
        author: 'ForumMod',
        content: `Erinnert euch: Teleport-Regel-Diskussionen bitte in den offiziellen [Feedback]-Thread. Dieser hier bleibt für Reittier-Builds offen.`
      }
    ]
  },
  {
    title: '[Event & RP] Sturmwand – Spielerberichte sammeln',
    slug: 'sturmwand-berichte',
    boardSlug: 'kreatives',
    author: 'Stormwatch',
    tags: ['event', 'rp', 'lore'],
    content: `Wir brauchen mehr Daten zur Sturmwand. Angeblich verschwinden Spieler oder kommen mit +5 Int zurück. Laut Files gibt es einen **Aether-Korridor**, der nur bei Gewitter offen ist. Hat das jemand erlebt?`,
    replies: [
      {
        author: 'UndeadHunter',
        content: `Gestern 23:40: Gewitter, Drei-Mann-Party, Relikt im Inventar → Mini-Labyrinth mit Aether Riftern. Loot: 1× Storm Sigil, 300 Ehre. Achtung: -10 Loyalität bei Tod. Buffs vorher aktivieren!`
      },
      {
        author: 'LoreArchiv',
        content: `Der Aether-Korridor existiert seit Patch 0.9.5, war aber in \`EldrunLocale\` nicht übersetzt. Jetzt DE/EN verfügbar. Screens an support@eldrun.lol!`
      },
      {
        author: 'DevReply',
        content: `Wir tracken jeden Sturmwand-Run via \`EldrunData\`. Wer Chatlog + Mini-Map liefert, bekommt den exklusiven Stormwatch-Titel (handelbar via \`EldrunTrading\`).`
      }
    ]
  },
  {
    title: '[Simulation & QA] Demo Mode Telemetry – Woche 51',
    slug: 'simulation-telemetry-w51',
    boardSlug: 'simulation-talk',
    author: 'AdminSavant',
    isPinned: true,
    tags: ['season', 'mech'],
    content: `Telemetry-Report für Woche 51 ist raus. Highlights:
- Heatmap-Belastung bei globalen Events +27 %
- Chat-Latenz im Demo-Modus < 180 ms
- Automation-Script #441 hat drei falsche Trigger produziert

Bitte Feedback posten, wenn eure Arkrelk-Sessions merkwürdige Damage-Matrizen hatten.`,
    replies: [
      {
        author: 'EngineerKyra',
        content: `Habe Logdump im Repo abgelegt. Issue #441 triggert nur, wenn Automation + GhostShip gleichzeitig laufen. Vorschlag: Cron-Fenster splitten.` 
      },
      {
        author: 'ShadowOps',
        content: `Patch im Branch \`automation/sim-hotfix\` landet heute 23:00 MEZ. Bitte bei den nächsten Sim-Läufen prüfen.` 
      }
    ]
  },
  {
    title: '[Automation Report] Cron 07:00 – Fehler 0x42',
    slug: 'automation-cron-7',
    boardSlug: 'automation-reports',
    author: 'TeleportTech',
    tags: ['event'],
    content: `Der 07:00-Cron für Heatmap-Exports bricht mit 0x42 ab seit dem API-Key-Roll. Logs hängen an. Verdacht: fehlende ENV für Simulation-Module.`,
    replies: [
      {
        author: 'AdminSavant',
        content: `Fehlende \`SIMULATION_MODULES\`-Variable auf Worker #3 war schuld. Ist nachgezogen – danke.` 
      }
    ]
  },
  {
    title: '[Lore] Chronik des Sturmwalls – Teil III',
    slug: 'chronik-sturmwall-teil3',
    boardSlug: 'chroniken',
    author: 'LoreKeeper',
    tags: ['lore', 'rp'],
    content: `**Kapitel III – Der Aether-Korridor**

> „Die Sturmwand ist kein Hindernis, sondern ein Spiegel. Wer durchtritt, sieht sein wahres Haus.“

Screenshots + Übersetzungen der Monolith-Schriftzeichen im Anhang. Ergänzungen erwünscht!`,
    replies: [
      {
        author: 'Stormwatch',
        content: `Kann bestätigen: Nach Seraphar-Gelübde +5 Int erhalten. Loyalität scheint Einfluss zu haben.` 
      },
      {
        author: 'MagistraLumen',
        content: `Packe das in die offizielle Lore-Sammlung und verlinke im /news Bereich – großartig!` 
      }
    ]
  },
  {
    title: '[Charakterbörse] Spionin Selene sucht Auftraggeber',
    slug: 'charakterboerse-selene',
    boardSlug: 'charakterboerse',
    author: 'LoreArchiv',
    tags: ['rp'],
    content: `Charakterprofil: Selene Varis, Vorgaroth-Spionin mit Seraphar-Vergangenheit. Suche Fraktionen/Gilden für Intrigen-Storylines. DM oder hier antworten.`,
    replies: [
      {
        author: 'VorgarothShade',
        content: `Wir planen einen RP-Arc rund um die Sieben Sigillen. Könnte perfekt passen – schreib mir.` 
      }
    ]
  },
  {
    title: '[Market Intelligence] Runen-Bonds & Derivatpreise',
    slug: 'market-intel-runen-bonds',
    boardSlug: 'market-intel',
    author: 'TradeBaron',
    tags: ['economy'],
    content: `Analyse:
- Runen-Bonds jetzt mit 8 % Zins handelbar
- Nachtvolumen im Auktionshaus: 1.2 M Gold
- Viele verwechseln Sim-Daten mit Live-Preisen

Wie schützt ihr eure Margins?`,
    replies: [
      {
        author: 'GuildBanker',
        content: `Wir verlangen 200 Loyalitätstoken als Sicherheitsleistung für Bonds. Filtert Fake-Käufer zuverlässig.` 
      },
      {
        author: 'AuctioneerRynn',
        content: `Nutze Alerts – wenn Runenstahl < 420 fällt, kaufe automatisiert. Spart Reaktionszeit.` 
      }
    ]
  },
  {
    title: '[Auktionshaus] Watchlist 2.0 & Gebotsstrategie',
    slug: 'auction-watchlist-strategie',
    boardSlug: 'market-intel',
    author: 'AuctioneerRynn',
    tags: ['economy', 'achievements'],
    content: `Seit dem Launch von EldrunAuction ist meine Watchlist ständig voll. Nutzt ihr eher Buy-Now-Snipes oder wartet ihr bis zur letzten Minute?

Meine Beobachtung:
- Legendary-Skins gehen 30 % günstiger nachts um 3 Uhr
- Runenstahl-Stacks droppen sonntags, wenn Events laufen
- VIP-User flippen Items mit 25 aktiven Listings und drücken damit die Preise

Wie optimiert ihr Gebühren (5 % Listing, 10 % Steuer) und erfüllt nebenbei die neuen Achievement-Trigger?`,
    replies: [
      {
        author: 'TradeBaron',
        content: `Ich kalkuliere Gebühren immer mit: Startpreis = Einkauf + (Fee + Steuer) + Zielmarge. Wer VIP ist, kann über „Canceled Listings“ Items kurz parken.`
      },
      {
        author: 'MagistraLumen',
        content: `Achievement-Tipp: „Merchant Prince“ verlangt 100 Verkäufe >10k Gold. Listings immer 24h setzen, sonst riskierst du Expire.` 
      },
      {
        author: 'GuildBanker',
        content: `Wir verteilen Watchlist-Pflege auf drei Banker. Jeder trackt Kategorien (Waffen, Runen, Utility) und synced Preise via Sheets.` 
      }
    ]
  },
  {
    title: '[Banking] Gildenbank Limits & Permission-Setup',
    slug: 'banking-gildenbank-limits',
    boardSlug: 'market-intel',
    author: 'GuildBanker',
    tags: ['economy', 'banking'],
    content: `Wie konfiguriert ihr die neuen Gildenbank-Permissions? Wir haben:
- Officers: Deposit + Withdraw (Limit 25k/Tag)
- Quartermaster: Nur Deposit, keine Withdraws
- Rekruten: Vault Slots nutzen, aber kein Goldzugriff

Probleme:
- Daily Reset scheduled 00:00 UTC, wir hätten lieber lokale ZE.
- Withdraw-Log zeigt nur Gold, keine Items.
Tipps?`,
    replies: [
      {
        author: 'AdminSavant',
        content: `Reset ist aktuell UTC. In \`config/eldrunbanking.json\` kannst du \`DailyResetHour\` setzen (kommt im nächsten Patch). Items-Log ist geplant.` 
      },
      {
        author: 'MagistraLumen',
        content: `Wir haben Officer-Limit auf 10k reduziert + Discord-Webhook via EldrunAutomation, falls jemand >5k zieht.` 
      },
      {
        author: 'TradeBaron',
        content: `Vergesst nicht: Withdraw Fee = 1 %. Gilden sollten Gold in der Bank lassen, damit Zinsen greifen.` 
      }
    ]
  },
  {
    title: '[Bounty] Wanted Wall & Hunter Leaderboard',
    slug: 'bounty-wanted-wall',
    boardSlug: 'neuigkeiten',
    author: 'AdminSavant',
    tags: ['bounty', 'event'],
    content: `Bounty-System ist live – Wanted Panel zeigt jetzt Top 25 Ziele + Goldwert. Hunter-Leaderboard aktualisiert sich jede Stunde.

Änderungen:
- Mindestkopfgeld 100 Gold, Broadcast ab 1.000
- Anonyme Kopfgelder kosten +500 Gold
- Friendly-Fire-Check verhindert Fraktions-Abuse
- Claims zahlen sofort Gold aus, loggen in Hunter-Stats

Feedback zu Gebühren, Cooldowns oder UI gern hier posten.`,
    replies: [
      {
        author: 'VorgarothShade',
        content: `Liebe anonyme Spender, 8k auf meinen Kopf sind lächerlich. Verdoppelt das – oder versucht gleich mich zu holen.` 
      },
      {
        author: 'SerapharCaptain',
        content: `Pls schaut, dass Bounties auf Event-Kommandeure geblockt werden, wenn sie Instanzen leiten. Wir brauchen das Feature.` 
      },
      {
        author: 'DevReply',
        content: `Wir prüfen einen „Safe Mode“ für Raid-Leiter. Bis dahin: Admins können via /bounty admin remove <id> reagieren.` 
      }
    ]
  },
  {
    title: '[Castle Siege] Vorbereitung & Phasenfeedback',
    slug: 'castle-siege-feedback',
    boardSlug: 'neuigkeiten',
    author: 'SerapharCaptain',
    tags: ['castles', 'event'],
    content: `Neue Castle-Schedule läuft. Bitte Feedback zu:
- Mindestangreifer (5) zu hoch?
- Gates respawnen manchmal buggy?
- Throne-Capture fühlt sich mit 60s gut an?

Defender XP/Gold passen? Wir überlegen, Stormwall-Boni einzubauen.`,
    replies: [
      {
        author: 'GuildBanker',
        content: `Steuern (1k Gold/Tag) fühlen sich fair an. Vielleicht Defense-Level erhöhen, wenn Verteidiger gewinnen.` 
      },
      {
        author: 'VorgarothShade',
        content: `Wir brauchen mehr als einen Attacker-Spawn. Momentan campen Defenders alles weg.` 
      },
      {
        author: 'DevReply',
        content: `Mehrere Spawnpunkte + Sturmphase kommen. Bitte Logs posten, wenn Gates nicht sterben.` 
      }
    ]
  },
  {
    title: '[Duels] Ranked Ladder & Bet Limits',
    slug: 'duels-ranked-feedback',
    boardSlug: 'neuigkeiten',
    author: 'NovaArcanis',
    tags: ['duels', 'pvp'],
    content: `Ranked Duels laufen stabil, aber Feedback:
- Bet Cap 10k Gold reicht nicht für Highroller
- Countdown-Sound überlappt, wenn mehrere Duelle starten
- Bitte WinStreak Rewards ins Leaderboard übernehmen

Postet Bugs inkl. /duel log Code.`,
    replies: [
      {
        author: 'SerapharCaptain',
        content: `Wir testen 15k Bets + neue Arena bei Seraphar Fort. Countdown-Sound fix incoming.` 
      },
      {
        author: 'VorgarothShade',
        content: `Bitte verbietet Heal-Items in Ranked. Einige Necros nutzen Bandagen exploit.` 
      },
      {
        author: 'DevReply',
        content: `Healing ist bereits disabled; Inventory Restore kommt mit 1.1. Streak Rewards gehen ins Dispatch-Leaderboard.` 
      }
    ]
  },
  {
    title: '[Ops Briefing] Operation Radiant Bridge – 21.12',
    slug: 'ops-briefing-radiant-bridge',
    boardSlug: 'ops-briefings',
    author: 'SerapharCaptain',
    isPinned: true,
    tags: ['event'],
    content: `**Briefing**
- Ziel: Königsbrücke sichern
- Start: 21.12., 19:30 MEZ, Seraphar-Fort Nord
- Rollen: 2 Warbird-Squadrons, 1 Arkankuppel-Priester, 1 Boden-Team

Zusagen bitte hier.`,
    replies: [
      {
        author: 'Roadrunner',
        content: `Dispatch-Team meldet sich als Scout. Bringen Recon-Drohnen & Nebelwerfer mit.` 
      },
      {
        author: 'MagistraLumen',
        content: `Buff-Liste folgt 60 Min vorher. Sichert euch Fragmente.` 
      }
    ]
  },
  {
    title: '[Broadcast Recap] War of the Skies – Replay & Daten',
    slug: 'broadcast-recap-war-of-the-skies',
    boardSlug: 'broadcast-recap',
    author: 'AdminSavant',
    tags: ['event', 'season'],
    content: `Replay + Datenpacket vom letzten War of the Skies:
- 4K-Stream mit Kommentaren
- Heatmap-Replay (Seraphar vs Vorgaroth)
- Loot-Distribution

Feedback zum neuen Broadcast-Overlay?`,
    replies: [
      {
        author: 'ForumMod',
        content: `Overlay top, aber Chatblase verdeckt manchmal Stats. Vielleicht Bottom-Left-Option?` 
      },
      {
        author: 'ShadowOps',
        content: `Kommt. Baue Mini-Chat-Toggle ein und verteile es im nächsten Patch.` 
      }
    ]
  },
  {
    title: '[Plugin Feedback] EldrunCore API – Rate Limit Fragen',
    slug: 'plugin-eldruncore-rate-limit',
    boardSlug: 'feedback',
    author: 'DeveloperX',
    tags: ['season'],
    content: `Beim Scrapen der EldrunCore API (Stats & Events) laufen wir bei 60 Sek Polling in ein Rate Limit. Gibt es Pläne für Webhooks statt Polling?`,
    replies: [
      {
        author: 'AdminSavant',
        content: `Webhook-Endpunkte sind im Branch \`api/webhooks-core\`. Bis Release bitte \`Sync Interval Seconds\` auf 90 erhöhen.`
      },
      {
        author: 'MagistraLumen',
        content: `Kleiner Tipp: Nutzt den Event-Stream aus EldrunAutomation, dort gibt's already push-basierte Hooks.`
      }
    ]
  },
  {
    title: '[Plugin Support] EldrunGuilds – Bewerbungs-Bug?',
    slug: 'plugin-eldrunguilds-bewerbung',
    boardSlug: 'tech-support',
    author: 'GuildBanker',
    tags: ['economy'],
    content: `Seit Patch 3.2.1 erscheint bei \`/guild apply\` ein Timeout. Passiert nur, wenn die Gilde >50 Mitglieder hat.`,
    replies: [
      {
        author: 'CodeWizard',
        content: `Der GraphQL-Resolver hat ein Limit von 1000 Zeichen für Bewerbungen. Fix ist im nächsten Build, bis dahin Bewerbungen kürzen.`
      },
      {
        author: 'ForumMod',
        content: `Danke fürs Melden! Bitte Tickets in #plugin-support posten, falls es erneut auftaucht.`
      }
    ]
  },
  {
    title: '[Plugin Diskussion] EldrunShop V2 Preise zu hoch?',
    slug: 'plugin-eldrunshop-preise',
    boardSlug: 'neuigkeiten',
    author: 'WheelRunner',
    tags: ['economy'],
    content: `Viele Items im EldrunShop (z. B. Storm Relic) kosten jetzt +25 %. War das Absicht?`,
    replies: [
      {
        author: 'TradeBaron',
        content: `Die Preise spiegeln die Demo-Daten. In Live-Umgebung liegt Storm Relic bei 18k Gold.`
      },
      {
        author: 'AdminSavant',
        content: `War Hotfix gegen Exploit-Farmer. Wir testen gerade dynamische Preise pro Fraktion.`
      }
    ]
  },
  {
    title: '[Plugin Kritik] EldrunAuction – Watchlist Limit',
    slug: 'plugin-auction-watchlist',
    boardSlug: 'market-intel',
    author: 'SeleneStrike',
    tags: ['economy'],
    content: `Die Watchlist wurde auf 25 Items begrenzt. Für Handelsclans ist das zu wenig. Kann das Limit gildenbasiert erweitert werden?`,
    replies: [
      {
        author: 'GuildBanker',
        content: `Wir lösen es über Mehrfach-Accounts, aber das ist messy. +1 für Gilden-Upgrade.`
      },
      {
        author: 'AdminSavant',
        content: `Limit steigt bald pro Gilden-Level. Feature ist schon im Schema (\`guildTier\`).`
      }
    ]
  },
  {
    title: '[Plugin Frage] EldrunEvents – Automatischer Kalender',
    slug: 'plugin-events-kalender',
    boardSlug: 'simulation-talk',
    author: 'Stormwatch',
    tags: ['event'],
    content: `Kann EldrunEvents automatisch in den LiveOps-Kalender pushen? Momentan pflegen wir Kalender & Plugin doppelt.`,
    replies: [
      {
        author: 'ShadowOps',
        content: `Ja, sobald der ICS-Export fertig ist. Der Cron liegt im neuen \`events/calendar-sync\` Script (doku folgt).`
      }
    ]
  },
  {
    title: '[Plugin Beschwerde] EldrunAutomation löscht Logs?',
    slug: 'plugin-automation-logs',
    boardSlug: 'automation-reports',
    author: 'TeleportTech',
    tags: ['event'],
    content: `Uns sind 48h Automation-Logs verloren gegangen. Vermutlich weil der Cleanup-Job zu aggressiv läuft.`,
    replies: [
      {
        author: 'AdminSavant',
        content: `Cleanups laufen jede Nacht. Bitte setzt \`AUTOMATION_LOG_RETENTION\` in eurer .env – Standard sind 24h.`
      },
      {
        author: 'EngineerKyra',
        content: `Wir spiegeln Logs via S3-Backup. Kann ich gerne teilen, falls ihr historische Daten braucht.`
      }
    ]
  }
]

const STAFF_MEMBERS = [
  { name: 'IronGuard', role: 'moderator', title: 'Senior Moderator', description: 'Erfahrener Moderator seit Season 1.', avatar: '/images/staff/mod1.png' },
  { name: 'StarLight', role: 'moderator', title: 'Moderator', description: 'Kümmert sich um Forum und Discord.', avatar: '/images/staff/mod2.png' },
  { name: 'ThunderStrike', role: 'moderator', title: 'Moderator', description: 'Spezialisiert auf In-Game Support.', avatar: '/images/staff/mod3.png' },
  { name: 'CodeWizard', role: 'developer', title: 'Backend Developer', description: 'Entwickelt Server-Plugins und APIs.', avatar: '/images/staff/dev1.png' },
  { name: 'PixelArtist', role: 'developer', title: 'UI/UX Designer', description: 'Gestaltet die Benutzeroberflächen.', avatar: '/images/staff/dev2.png' },
  { name: 'HelpingHand', role: 'support', title: 'Support Team Lead', description: 'Leitet das Support-Team.', avatar: '/images/staff/support1.png' },
  { name: 'BuildMaster', role: 'builder', title: 'Lead Builder', description: 'Erstellt Maps und Strukturen.', avatar: '/images/staff/builder1.png' }
]

// ═══════════════════════════════════════════════════════════════════════════
// STATIC PAGES
// ═══════════════════════════════════════════════════════════════════════════

const STATIC_PAGES = [
  {
    slug: 'rules',
    title: 'Server-Regeln',
    content: `# Eldrun Server-Regeln

## 1. Allgemeine Verhaltensregeln
- Respektiere alle Spieler
- Kein Rassismus, Sexismus oder Diskriminierung
- Kein Spamming im Chat
- Keine Werbung für andere Server

## 2. Gameplay-Regeln
- Kein Exploiting oder Bug-Abuse
- Keine Cheats, Hacks oder unerlaubte Modifikationen
- Kein Griefing von Neulingen
- Base-Camping ist erlaubt, aber maßvoll

## 3. Handels-Regeln
- Scamming führt zu permanentem Bann
- Echtgeld-Handel ist verboten
- Alle Trades sind final

## 4. Chat-Regeln
- Deutsche Sprache im globalen Chat
- Keine NSFW-Inhalte
- Keine persönlichen Angriffe

## Strafen
1. Verwarnung
2. 24h Mute
3. 7 Tage Ban
4. Permanenter Ban

Bei schweren Verstößen behalten wir uns vor, sofort zu bannen.`
  },
  {
    slug: 'faq',
    title: 'Häufig gestellte Fragen',
    content: `# FAQ - Häufig gestellte Fragen

## Allgemein

### Wie verbinde ich mich mit dem Server?
Öffne Rust, klicke auf "Play Game" und suche nach "Eldrun" in der Serverliste oder verbinde dich direkt über: \`connect play.eldrun.lol:28015\`

### Wann wird der Server gewiped?
Monatlicher Map-Wipe am ersten Donnerstag des Monats. BP-Wipe alle 3 Monate.

### Gibt es VIP-Pakete?
Ja! Besuche unseren Shop für verschiedene VIP-Ränge mit Vorteilen.

## Gameplay

### Wie wähle ich eine Fraktion?
Nutze /faction im Chat oder besuche das Fraktions-Monument.

### Wie trete ich einer Gilde bei?
Nutze /guild oder frage im Discord nach offenen Gilden.

### Wie funktioniert das Levelsystem?
Du erhältst XP für fast alle Aktionen. Nutze /level für deinen Fortschritt.

## Technisch

### Der Server laggt, was kann ich tun?
1. Überprüfe deine Internetverbindung
2. Reduziere deine Grafikeinstellungen
3. Starte Rust neu

### Ich wurde ungerechtfertigt gebannt!
Erstelle einen Appeal auf unserer Website unter /appeals.`
  },
  {
    slug: 'privacy',
    title: 'Datenschutzerklärung',
    content: `# Datenschutzerklärung

## 1. Verantwortlicher
Eldrun Gaming Community
E-Mail: privacy@eldrun.lol

## 2. Erhobene Daten
Wir erheben folgende Daten:
- Steam-ID und Benutzername
- E-Mail-Adresse (bei Registrierung)
- IP-Adresse und Spielstatistiken
- Chat-Logs und Transaktionsdaten

## 3. Verwendungszweck
Die Daten werden verwendet für:
- Bereitstellung des Spieldienstes
- Moderation und Anti-Cheat
- Verbesserung des Spielerlebnisses
- Kommunikation mit Spielern

## 4. Speicherdauer
Daten werden gespeichert bis:
- Löschung des Accounts
- 2 Jahre nach letzter Aktivität
- Bei Bans: 5 Jahre

## 5. Ihre Rechte
Sie haben das Recht auf:
- Auskunft über Ihre Daten
- Berichtigung unrichtiger Daten
- Löschung Ihrer Daten
- Datenübertragbarkeit

Kontakt: privacy@eldrun.lol`
  },
  {
    slug: 'terms',
    title: 'Nutzungsbedingungen',
    content: `# Nutzungsbedingungen

## 1. Geltungsbereich
Diese Bedingungen gelten für alle Dienste von Eldrun.

## 2. Registrierung
- Mindestalter: 16 Jahre
- Korrekte Angaben erforderlich
- Ein Account pro Person

## 3. Nutzungsregeln
- Einhaltung der Server-Regeln
- Keine illegalen Aktivitäten
- Kein Verkauf von Accounts

## 4. Shop & Zahlungen
- Alle Käufe sind final
- Virtuelle Güter ohne Echtgeldwert
- Rückerstattung nur bei technischen Fehlern

## 5. Haftung
- Server "wie besehen"
- Keine Garantie für Verfügbarkeit
- Haftungsbeschränkung nach geltendem Recht

## 6. Änderungen
Wir behalten uns vor, diese Bedingungen jederzeit zu ändern.

Stand: Dezember 2024`
  },
  {
    slug: 'impressum',
    title: 'Impressum',
    content: `# Impressum

## Angaben gemäß § 5 TMG

Eldrun Gaming Community
[Adresse auf Anfrage]

E-Mail: contact@eldrun.lol
Discord: discord.gg/eldrun

## Haftungsausschluss

### Haftung für Inhalte
Als Diensteanbieter sind wir für eigene Inhalte verantwortlich. Für fremde Inhalte, die wir zur Nutzung bereitstellen, sind wir nur bei Kenntnis einer Rechtsverletzung verantwortlich.

### Haftung für Links
Für den Inhalt verlinkter externer Seiten sind ausschließlich deren Betreiber verantwortlich.

### Urheberrecht
Die durch uns erstellten Inhalte unterliegen dem Urheberrecht. Beiträge Dritter sind entsprechend gekennzeichnet.

## Streitschlichtung
Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`
  }
]

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function seedNews() {
  console.log('\n📰 Seeding News Articles...')
  
  for (const article of NEWS_ARTICLES) {
    await prisma.news.upsert({
      where: { slug: article.slug },
      update: article,
      create: {
        ...article,
        publishedAt: new Date()
      }
    })
  }
  
  console.log(`  ✅ ${NEWS_ARTICLES.length} news articles seeded`)
}

async function seedChangelog() {
  console.log('\n📋 Seeding Changelog...')
  
  for (const release of CHANGELOG_RELEASES) {
    const existing = await prisma.changelogRelease.findUnique({
      where: { version: release.version }
    })
    
    if (!existing) {
      const created = await prisma.changelogRelease.create({
        data: {
          version: release.version,
          title: release.title,
          description: release.description,
          type: release.type,
          isPublished: release.isPublished,
          publishedAt: new Date()
        }
      })
      
      for (const item of release.items) {
        await prisma.changelogItem.create({
          data: {
            releaseId: created.id,
            type: item.type,
            category: item.category,
            title: item.title,
            description: item.description
          }
        })
      }
    }
  }
  
  console.log(`  ✅ ${CHANGELOG_RELEASES.length} changelog releases seeded`)
}

async function seedForumUsers() {
  console.log('\n👤 Seeding Forum Users...')
  const userMap = new Map<string, Awaited<ReturnType<typeof prisma.user.upsert>>>()
  
  for (const user of FORUM_USERS) {
    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        faction: user.faction,
        avatar: user.avatar,
        bio: user.bio
      },
      create: {
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        faction: user.faction,
        avatar: user.avatar,
        bio: user.bio,
        passwordHash: null
      }
    })
    
    userMap.set(user.username, result)
  }
  
  console.log(`  ✅ ${userMap.size} forum users ready`)
  return userMap
}

async function seedForumTags() {
  console.log('\n🏷️  Seeding Forum Tags...')
  const tagMap = new Map<string, Awaited<ReturnType<typeof prisma.forumTag.upsert>>>()
  
  for (const tag of FORUM_TAGS) {
    const result = await prisma.forumTag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, color: tag.color },
      create: tag
    })
    tagMap.set(tag.slug, result)
  }
  
  console.log(`  ✅ ${tagMap.size} tags ready`)
  return tagMap
}

async function seedForumThreads(
  userMap: Map<string, Awaited<ReturnType<typeof prisma.user.upsert>>>,
  tagMap: Map<string, Awaited<ReturnType<typeof prisma.forumTag.upsert>>>
) {
  console.log('\n🧵 Seeding Forum Threads...')
  const boards = await prisma.forumBoard.findMany()
  const boardMap = new Map(boards.map(board => [board.slug, board]))
  let createdThreads = 0
  
  for (const thread of FORUM_THREADS) {
    const author = userMap.get(thread.author)
    const board = boardMap.get(thread.boardSlug)
    
    if (!author || !board) {
      console.warn(`  ⚠️  Skip thread "${thread.title}" – missing author or board.`)
      continue
    }
    
    const tagConnections = (thread.tags || [])
      .map(slug => tagMap.get(slug))
      .filter(Boolean)
      .map(tag => ({ id: tag!.id }))
    
    const baseData = {
      boardId: board.id,
      authorId: author.id,
      title: thread.title,
      slug: thread.slug,
      content: thread.content,
      isPinned: thread.isPinned ?? false
    }
    
    let threadRecord = await prisma.forumThread.findFirst({
      where: { slug: thread.slug, boardId: board.id }
    })
    
    if (threadRecord) {
      threadRecord = await prisma.forumThread.update({
        where: { id: threadRecord.id },
        data: {
          ...baseData,
          tags: { set: tagConnections }
        }
      })
    } else {
      threadRecord = await prisma.forumThread.create({
        data: {
          ...baseData,
          tags: { connect: tagConnections }
        }
      })
    }
    
    await prisma.forumPost.deleteMany({ where: { threadId: threadRecord.id } })
    
    const posts = []
    const basePost = await prisma.forumPost.create({
      data: {
        threadId: threadRecord.id,
        authorId: author.id,
        content: thread.content
      }
    })
    posts.push(basePost)
    
    for (const reply of thread.replies ?? []) {
      const replyAuthor = userMap.get(reply.author) ?? author
      const post = await prisma.forumPost.create({
        data: {
          threadId: threadRecord.id,
          authorId: replyAuthor.id,
          content: reply.content,
          replyToId: basePost.id
        }
      })
      posts.push(post)
    }
    
    const lastPost = posts[posts.length - 1]
    await prisma.forumThread.update({
      where: { id: threadRecord.id },
      data: {
        replyCount: Math.max(posts.length - 1, 0),
        lastReplyAt: lastPost.createdAt,
        lastReplyById: lastPost.authorId
      }
    })
    
    createdThreads++
  }
  
  console.log(`  ✅ ${createdThreads} forum threads seeded`)
}

async function seedForumStructure() {
  console.log('\n💬 Seeding Forum Structure...')
  
  for (const cat of FORUM_CATEGORIES) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    })
  }
  
  for (const board of FORUM_BOARDS) {
    const category = await prisma.forumCategory.findUnique({
      where: { slug: board.categorySlug }
    })
    
    if (category) {
      await prisma.forumBoard.upsert({
        where: { slug: board.slug },
        update: {
          name: board.name,
          description: board.description
        },
        create: {
          categoryId: category.id,
          name: board.name,
          slug: board.slug,
          description: board.description
        }
      })
    }
  }
  
  console.log(`  ✅ ${FORUM_CATEGORIES.length} categories, ${FORUM_BOARDS.length} boards seeded`)
}

async function seedStaff() {
  console.log('\n👥 Seeding Staff Members...')
  
  let order = 0
  for (const staff of STAFF_MEMBERS) {
    const existing = await prisma.staffMember.findFirst({
      where: { name: staff.name }
    })
    
    if (!existing) {
      await prisma.staffMember.create({
        data: {
          ...staff,
          sortOrder: order++
        }
      })
    }
  }
  
  console.log(`  ✅ ${STAFF_MEMBERS.length} staff members seeded`)
}

async function seedStaticPages() {
  console.log('\n📄 Seeding Static Pages...')
  
  for (const page of STATIC_PAGES) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content
      },
      create: page
    })
  }
  
  console.log(`  ✅ ${STATIC_PAGES.length} static pages seeded`)
}

async function seedChatChannels() {
  console.log('\n💭 Seeding Chat Channels...')
  
  const channels = [
    { name: 'Global', slug: 'global', description: 'Allgemeiner Server-Chat', type: 'public', icon: '🌍', color: '#D4AF37' },
    { name: 'Handel', slug: 'trade', description: 'Handels-Anfragen und Angebote', type: 'public', icon: '💰', color: '#22C55E' },
    { name: 'LFG', slug: 'lfg', description: 'Suche nach Gruppen', type: 'public', icon: '🎮', color: '#3B82F6' },
    { name: 'Seraphar', slug: 'seraphar', description: 'Fraktions-Chat für Seraphar', type: 'private', icon: '⚜️', color: '#D4AF37' },
    { name: 'Vorgaroth', slug: 'vorgaroth', description: 'Fraktions-Chat für Vorgaroth', type: 'private', icon: '🔥', color: '#DC2626' },
    { name: 'Support', slug: 'support', description: 'Hilfe vom Support-Team', type: 'public', icon: '❓', color: '#8B5CF6' }
  ]
  
  for (const channel of channels) {
    await prisma.chatChannel.upsert({
      where: { slug: channel.slug },
      update: channel,
      create: channel
    })
  }
  
  console.log(`  ✅ ${channels.length} chat channels seeded`)
}

async function seedChatMessages(userMap: Map<string, Awaited<ReturnType<typeof prisma.user.upsert>>>) {
  console.log('\n🗨️  Seeding Chat Messages...')
  const channels = await prisma.chatChannel.findMany()
  const channelMap = new Map(channels.map(channel => [channel.slug, channel]))
  let totalMessages = 0
  
  for (const transcript of CHAT_TRANSCRIPTS) {
    if (!transcript.channelSlug || !transcript.messages) continue
    const channel = channelMap.get(transcript.channelSlug)
    if (!channel) {
      console.warn(`  ⚠️  Skip chat transcript for "${transcript.channelSlug}" – channel missing.`)
      continue
    }
    
    await prisma.chatMessage.deleteMany({
      where: {
        channelId: channel.id,
        isSimulated: true,
      }
    })
    
    for (const message of transcript.messages) {
      const author = userMap.get(message.author)
      if (!author) {
        console.warn(`  ⚠️  Skip chat message – author "${message.author}" missing.`)
        continue
      }
      
      const createdAt = new Date(Date.now() - (message.minutesAgo ?? 0) * 60 * 1000)
      
      await prisma.chatMessage.create({
        data: {
          channelId: channel.id,
          authorId: author.id,
          content: message.content,
          createdAt,
          isSimulated: true,
        }
      })
      totalMessages++
    }
  }
  
  console.log(`  ✅ ${totalMessages} chat messages seeded`)
}

async function seedVoteSites() {
  console.log('\n🗳️ Seeding Vote Sites...')
  
  const sites = [
    { siteId: 'rust-servers', name: 'Rust-Servers.net', url: 'https://rust-servers.net/server/eldrun', rewardCoins: 100, rewardXp: 50 },
    { siteId: 'top-rust', name: 'Top Rust Servers', url: 'https://toprustservers.com/eldrun', rewardCoins: 100, rewardXp: 50 },
    { siteId: 'battlemetrics', name: 'Battlemetrics', url: 'https://battlemetrics.com/servers/rust/eldrun', rewardCoins: 75, rewardXp: 25 }
  ]
  
  for (const site of sites) {
    await prisma.voteSite.upsert({
      where: { siteId: site.siteId },
      update: site,
      create: site
    })
  }
  
  console.log(`  ✅ ${sites.length} vote sites seeded`)
}

async function seedBlacklists() {
  console.log('\n🚫 Seeding Blacklist...')
  
  for (const entry of BLACKLIST_ENTRIES) {
    await prisma.blacklist.upsert({
      where: { steamId: entry.steamId },
      update: {
        playerName: entry.playerName,
        reason: entry.reason,
        bannedBy: entry.bannedBy,
        expiresAt: entry.expiresAt ?? null,
        isPermanent: entry.isPermanent ?? false,
        canAppeal: entry.canAppeal ?? true
      },
      create: {
        steamId: entry.steamId,
        playerName: entry.playerName,
        reason: entry.reason,
        bannedBy: entry.bannedBy,
        expiresAt: entry.expiresAt ?? null,
        isPermanent: entry.isPermanent ?? false,
        canAppeal: entry.canAppeal ?? true
      }
    })
  }
  
  console.log(`  ✅ ${BLACKLIST_ENTRIES.length} blacklist entries seeded`)
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('       ELDRUN CONTENT SEEDER')
  console.log('═══════════════════════════════════════════════════════════')

  const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
  const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
  const seedModeEnabled = process.env.SEED_MODE === 'true'

  if (isProdDeployment && !seedModeEnabled) {
    console.error('❌ Refusing to seed content in production without SEED_MODE=true')
    process.exit(1)
  }
  
  try {
    await seedNews()
    await seedChangelog()
    
    const forumUsers = await seedForumUsers()
    const forumTags = await seedForumTags()
    await seedForumStructure()
    await seedForumThreads(forumUsers, forumTags)
    
    await seedStaff()
    await seedStaticPages()
    await seedChatChannels()
    await seedChatMessages(forumUsers)
    await seedVoteSites()
    
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('✅ CONTENT SEEDING COMPLETED')
    console.log('═══════════════════════════════════════════════════════════')
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
