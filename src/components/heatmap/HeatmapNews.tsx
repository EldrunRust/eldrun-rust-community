'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Newspaper, Bell, Calendar, Clock, AlertTriangle, 
  CheckCircle, Info, Megaphone, Zap, Gift, Sword,
  Shield, Star, TrendingUp, Users, Server, Wrench,
  ChevronRight, ExternalLink, Pin, Flame, Trophy
} from 'lucide-react'

type NewsCategory = 'all' | 'events' | 'updates' | 'patches' | 'community' | 'maintenance'
type NewsPriority = 'low' | 'medium' | 'high' | 'urgent'

interface NewsItem {
  id: string
  title: string
  content: string
  category: NewsCategory
  priority: NewsPriority
  date: Date
  author: string
  pinned?: boolean
  tags?: string[]
  image?: string
  link?: string
}

// Eldrun Server News - Based on actual server features
const SIMULATED_NEWS: NewsItem[] = [
  {
    id: '1',
    title: '⚔️ FRAKTIONSKRIEG: Seraphar vs Vorgaroth - Dieses Wochenende!',
    content: 'Der epische Fraktionskrieg zwischen den Lichtkriegern von SERAPHAR und den dunklen Legionen von VORGAROTH beginnt am Samstag um 20:00 Uhr! Kämpft um die Kontrolle der Artifact Islands, verdient doppelte XP und sichert euch legendäre Belohnungen. Wählt eure Klasse weise: Warrior, Archer, Mage, Rogue, Paladin oder Necromancer!',
    category: 'events',
    priority: 'urgent',
    date: new Date(Date.now() - 1000 * 60 * 30),
    author: 'SirEldrun',
    pinned: true,
    tags: ['Fraktionskrieg', 'Seraphar', 'Vorgaroth', 'PvP']
  },
  {
    id: '2',
    title: '🏰 Neues Castle-System: Baut eure Festung!',
    content: 'Das Eldrun Castle-System ist live! Erobert Territorien, baut eure eigene Festung aus und verteidigt sie gegen feindliche Fraktionen. Castles können aufgewertet werden und bieten Schutz, Ressourcen-Boni und exklusive Crafting-Stationen. Nutzt /castle um zu beginnen!',
    category: 'updates',
    priority: 'urgent',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    author: 'DevTeam',
    pinned: true,
    tags: ['Castle', 'Feature', 'Territory']
  },
  {
    id: '3',
    title: '🐉 Raid Bases Update - 15 neue automatisierte Basen!',
    content: 'Das EldrunRaidBases-System wurde erweitert! 15 neue, vollautomatisierte Raid-Basen mit NPCs sind nun verfügbar. Von "Easy" bis "Nightmare" Schwierigkeit. Besiegt die Elite-NPCs und sichert euch seltene Artefakte, Waffen-Skins und bis zu 50.000 Coins!',
    category: 'updates',
    priority: 'high',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    author: 'DevTeam',
    tags: ['RaidBases', 'PvE', 'Loot', 'NPCs']
  },
  {
    id: '4',
    title: '📜 Quest-System Erweiterung - 50 neue Quests!',
    content: 'Das EldrunQuests-System wurde massiv erweitert! 50 neue Quests in verschiedenen Kategorien: Kill-Quests, Sammel-Quests, Erkundungs-Quests und Story-Quests. Besucht die Quest-NPCs bei den Monumenten und startet eure Abenteuer. Nutzt /quest für das Quest-Menü!',
    category: 'updates',
    priority: 'high',
    date: new Date(Date.now() - 1000 * 60 * 60 * 12),
    author: 'DevTeam',
    tags: ['Quests', 'Feature', 'Rewards']
  },
  {
    id: '5',
    title: '🐾 Pet-System: Zähmt eure Begleiter!',
    content: 'Ab sofort könnt ihr Tiere zähmen und als treue Begleiter nutzen! Wölfe, Bären und sogar Pferde können mit dem richtigen Futter gezähmt werden. Pets kämpfen an eurer Seite, tragen Items und entwickeln sich weiter. Befehle: Follow, Attack, Stay!',
    category: 'updates',
    priority: 'high',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    author: 'DevTeam',
    tags: ['Pets', 'Feature', 'Taming']
  },
  {
    id: '6',
    title: '⚡ XP & Level System - Neue Klassen-Fähigkeiten!',
    content: `Das Eldrun XP-System wurde überarbeitet:\n• Max Level auf 100 erhöht\n• Neue Skill-Bäume für jede Klasse\n• Passive Boni alle 10 Level\n• Prestige-System ab Level 100\n• Klassen-spezifische Ultimate-Fähigkeiten\nNutzt /xp oder /level für Details!`,
    category: 'patches',
    priority: 'high',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    author: 'DevTeam',
    tags: ['XP', 'Level', 'Classes', 'Skills']
  },
  {
    id: '7',
    title: '🎰 Casino Lottery - Jackpot bei 500.000 Coins!',
    content: 'Der Eldrun Lottery Jackpot ist auf 500.000 Coins angestiegen! Kauft eure Tickets im Casino (/casino) und hofft auf das große Glück. Ziehung jeden Sonntag um 21:00 Uhr. Bisherige Gewinner: ShadowHunter (250k), NightWalker (180k)!',
    category: 'events',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    author: 'Casino Manager',
    tags: ['Casino', 'Lottery', 'Jackpot']
  },
  {
    id: '8',
    title: '🎒 Backpack-System Upgrade - Mehr Slots!',
    content: 'Das EldrunBackpacks-System wurde verbessert! Standard-Spieler erhalten jetzt 24 Slots, VIP-Spieler bis zu 48 Slots. Neue Backpack-Skins im Shop verfügbar. Alle existierenden Backpacks wurden automatisch upgegradet!',
    category: 'updates',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 96),
    author: 'DevTeam',
    tags: ['Backpacks', 'Feature', 'VIP']
  },
  {
    id: '9',
    title: '🚗 Fahrzeug-Lizenz System - Permanente Fahrzeuge!',
    content: 'Mit dem neuen EldrunVehicleLicence-System könnt ihr nun permanente Fahrzeuge besitzen! Kauft Lizenzen für Boote, Helikopter, Autos und mehr. Fahrzeuge spawnen bei euch nach jedem Wipe. VIPs erhalten Rabatt auf alle Lizenzen!',
    category: 'updates',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 120),
    author: 'DevTeam',
    tags: ['Vehicles', 'License', 'Feature']
  },
  {
    id: '10',
    title: '👥 Gilden-System: Gründet eure Gilde!',
    content: 'Das EldrunGuilds-System ermöglicht es euch, eigene Gilden zu gründen! Rekrutiert Mitglieder, führt Gilden-Kriege, erobert Territorien und kämpft um die Gilden-Rangliste. Gilden-Chat, Gilden-Bank und Gilden-Quests inklusive!',
    category: 'updates',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 144),
    author: 'DevTeam',
    tags: ['Guilds', 'Feature', 'Social']
  },
  {
    id: '11',
    title: '💰 Kopfgeld-System aktiv!',
    content: 'Das EldrunBounty-System ist nun aktiv! Setzt Kopfgelder auf andere Spieler oder jagt die meistgesuchten Köpfe der Insel. Der aktuelle Top-Kopfgeld: 75.000 Coins auf "DarkReaper". Nutzt /bounty für alle Optionen!',
    category: 'community',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 168),
    author: 'Admin',
    tags: ['Bounty', 'PvP', 'Rewards']
  },
  {
    id: '12',
    title: '🗺️ Fast Travel - Neue Teleport-Punkte!',
    content: '10 neue Teleport-Punkte wurden der Karte hinzugefügt! Das EldrunFastTravel-System ermöglicht schnelles Reisen zwischen freigeschalteten Punkten. Erkundet die Karte und schaltet alle Teleport-Standorte frei. /tpr und /home Befehle aktiv!',
    category: 'updates',
    priority: 'low',
    date: new Date(Date.now() - 1000 * 60 * 60 * 192),
    author: 'DevTeam',
    tags: ['Teleport', 'Travel', 'Map']
  },
  {
    id: '13',
    title: '🛠️ Geplante Wartung - Mittwoch 04:00 Uhr',
    content: 'Am Mittwoch zwischen 04:00 und 06:00 Uhr findet eine geplante Wartung statt. Server-Hardware Upgrades für bessere Performance. Alle Fortschritte werden gespeichert. Discord-Bot informiert über Fortschritt!',
    category: 'maintenance',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 6),
    author: 'Admin',
    tags: ['Wartung', 'Downtime']
  },
  {
    id: '14',
    title: '🏆 Wöchentliche Top-Spieler Belohnungen',
    content: 'Herzlichen Glückwunsch an die Top-Spieler dieser Woche! Top Kills: DragonFury (847), Top Raids: NightStalker (23), Top Quests: QuestMaster (156). Alle erhalten exklusive Rewards und Titel!',
    category: 'community',
    priority: 'low',
    date: new Date(Date.now() - 1000 * 60 * 60 * 240),
    author: 'Community Manager',
    tags: ['Leaderboard', 'Rewards', 'Community']
  },
  {
    id: '15',
    title: '🎄 Winter-Event: Artifact Island im Schnee!',
    content: 'Das große Winter-Event ist da! Die Artifact Islands sind von Schnee bedeckt, spezielle Winter-Bosse spawnen, und es gibt limitierte Frost-Skins zu verdienen. Event läuft bis 6. Januar!',
    category: 'events',
    priority: 'high',
    date: new Date(Date.now() - 1000 * 60 * 60 * 1),
    author: 'SirEldrun',
    tags: ['Event', 'Winter', 'Seasonal', 'Artifacts']
  },
  // ==================== PATCH NOTES & CHANGELOGS ====================
  {
    id: '16',
    title: '📋 PATCH v36187 - Mega Content Update!',
    content: `🔥 ELDRUN MEGA PATCH v36187 🔥

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚔️ FRAKTIONS-SYSTEM (EldrunFraktion)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Seraphar vs Vorgaroth Konflikt aktiviert
• 6 Spielerklassen: Warrior, Archer, Mage, Rogue, Paladin, Necromancer
• Fraktions-Chat (/fchat) implementiert
• Fraktions-Teleport zu Hauptquartieren
• Wöchentliche Fraktions-Belohnungen basierend auf Kills
• Fraktions-Achievements mit Honor-Rewards
• Territorium-Kontrolle beeinflusst Ressourcen-Boni

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ XP & LEVEL SYSTEM (EldrunXP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 20 Skill-Kategorien: Combat, Mining, Woodcutting, Crafting, Magic...
• 5 Skill-Bäume: Combat, Gathering, Crafting, Building, Survival
• Nacht-Bonus: +50% XP zwischen 22:00 und 06:00 Uhr
• Level-Up Belohnungen alle 10 Level
• Prestige-System ab Level 100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏰 CASTLE SYSTEM (EldrunCastles)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Baue und upgrade deine eigene Festung
• Castle-Upgrades: Mauern, Türme, Verteidigung
• Ressourcen-Produktion in Castles
• Castle-Raids zwischen Gilden
• Belagerungsmechaniken

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 GILDEN SYSTEM (EldrunGuilds)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Gilden-Perks: Crafting Speed, Gather Boost, Combat Damage
• Gilden-Upgrades: Bank Capacity, Member Slots, XP Boost
• 8 Gilden-Achievements mit Honor-Rewards
• Gilden-Allianzen und Kriegserklärungen
• Gilden-Bank mit bis zu 100.000 Scrap Kapazität`,
    category: 'patches',
    priority: 'urgent',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3),
    author: 'DevTeam',
    pinned: true,
    tags: ['Patch', 'Changelog', 'v36187', 'Major Update']
  },
  {
    id: '17',
    title: '🗡️ ARTIFACT SYSTEM - Die Krone der ewigen Herrschaft!',
    content: `Das legendäre EldrunArtifactItem System ist live!

🏆 DIE KRONE DER EWIGEN HERRSCHAFT
Ein einzigartiges Artefakt existiert auf dem Server - wer es trägt, wird zum "Chosen One"!

⚔️ Features:
• Nur EIN Spieler kann das Artefakt gleichzeitig besitzen
• Der Träger erhält massive Boni aber wird zur Zielscheibe
• Artefakt droppt bei Tod und kann gestohlen werden
• Globale Ankündigung wenn das Artefakt den Besitzer wechselt
• Spezielle Titel und Cosmetics für den Träger
• Artefakt-HUD zeigt aktuelle Statistiken

📍 Aktueller Träger: ???
Finde das Artefakt und werde zur Legende!`,
    category: 'updates',
    priority: 'urgent',
    date: new Date(Date.now() - 1000 * 60 * 60 * 8),
    author: 'SirEldrun',
    tags: ['Artifact', 'Legendary', 'PvP', 'Crown']
  },
  {
    id: '18',
    title: '🌩️ STORMWALL EVENT - Die Barriere bricht!',
    content: `Das EldrunStormwall System aktiviert dramatische Server-Events!

⚡ STORMWALL COLLAPSE EVENT
Die magische Barriere um die Insel wird instabil - neue Gebiete werden zugänglich!

🔥 Was passiert:
• Stormwall-Zonen öffnen sich temporär
• Seltene Ressourcen und Loot in neuen Gebieten
• Elite-NPCs spawnen während des Events
• Fraktionen kämpfen um Kontrolle der neuen Zonen
• Bridge Gates verbinden Inseln während des Events

⏰ Nächstes Event: Samstag 20:00 Uhr
Dauer: 2 Stunden
Belohnungen: Legendary Loot, 10.000+ Coins, Exclusive Skins`,
    category: 'events',
    priority: 'high',
    date: new Date(Date.now() - 1000 * 60 * 60 * 10),
    author: 'EventTeam',
    tags: ['Stormwall', 'Event', 'PvP', 'Loot']
  },
  {
    id: '19',
    title: '🏪 GUI SHOP KOMPLETT ÜBERARBEITET!',
    content: `Das EldrunGUIShop und EldrunMultiShop System wurde komplett neu designed!

🛒 NEUE FEATURES:
• Modernes, übersichtliches UI Design
• 8 Kategorien: VIP, Kits, Skins, Items, Currency, Bundles, Services, Gifts
• Dynamische Preise basierend auf Angebot/Nachfrage
• Loyalitätspunkte-System (Dragons & Honor)
• Schnellkauf mit Favoriten
• Preishistorie und Markttrends
• Gilden-Rabatte für aktive Mitglieder

💰 WÄHRUNGEN:
• Coins - Hauptwährung
• Dragons - Premium-Währung
• Honor - Gilden-Währung
• Loyalty - VIP-Belohnungen

Besucht /shop oder /s für das neue Einkaufserlebnis!`,
    category: 'updates',
    priority: 'high',
    date: new Date(Date.now() - 1000 * 60 * 60 * 15),
    author: 'DevTeam',
    tags: ['Shop', 'GUI', 'Economy', 'Trading']
  },
  {
    id: '20',
    title: '📦 KITS SYSTEM - 25 neue Starter- und VIP-Kits!',
    content: `Das EldrunKits System wurde massiv erweitert!

🎁 NEUE KITS:
━━━━━━━━━━━━━━━━━━━
STARTER KITS (Kostenlos)
━━━━━━━━━━━━━━━━━━━
• Newcomer Kit - Basis Ausrüstung für neue Spieler
• Gatherer Kit - Werkzeuge und Ressourcen
• Builder Kit - Baumaterialien Starter
• Fighter Kit - Waffen und Rüstung Basis

━━━━━━━━━━━━━━━━━━━
VIP KITS (VIP-Rang erforderlich)
━━━━━━━━━━━━━━━━━━━
• VIP Bronze - Täglich, gute Ausrüstung
• VIP Silver - 12h Cooldown, bessere Items
• VIP Gold - 6h Cooldown, Premium Loot
• VIP Diamond - 3h Cooldown, Elite Gear
• VIP Legendary - 1h Cooldown, Best in Slot

━━━━━━━━━━━━━━━━━━━
FRAKTIONS KITS
━━━━━━━━━━━━━━━━━━━
• Seraphar Warrior Kit
• Vorgaroth Shadow Kit
• Beide mit einzigartigen Skins!

Nutzt /kit für die Übersicht!`,
    category: 'updates',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 20),
    author: 'DevTeam',
    tags: ['Kits', 'VIP', 'Starter', 'Rewards']
  },
  {
    id: '21',
    title: '🎯 KOPFGELD-SYSTEM ERWEITERUNG!',
    content: `Das EldrunBounty System hat neue Features erhalten!

💀 NEUE KOPFGELD-MECHANIKEN:
• Automatische Kopfgelder auf Kill-Streaks (5+ Kills)
• Gilden können Kopfgelder auf rivalisierende Gilden setzen
• Fraktions-Kopfgelder während Kriegszeiten
• Kopfgeld-Jäger Rangliste mit wöchentlichen Rewards
• Anonyme Kopfgelder möglich (gegen Aufpreis)

🏆 AKTUELLE TOP KOPFGELDER:
1. DarkReaper - 75.000 Coins (gesetzt von: Anonym)
2. NightStalker - 50.000 Coins (gesetzt von: Phoenix Guild)
3. ShadowBlade - 35.000 Coins (gesetzt von: Seraphar Fraktion)
4. BloodMoon - 25.000 Coins (gesetzt von: Mehrere Spieler)
5. IronFist - 20.000 Coins (gesetzt von: Vorgaroth Fraktion)

Befehle: /bounty set, /bounty list, /bounty hunt`,
    category: 'community',
    priority: 'high',
    date: new Date(Date.now() - 1000 * 60 * 60 * 25),
    author: 'Admin',
    tags: ['Bounty', 'PvP', 'Rewards', 'Community']
  },
  {
    id: '22',
    title: '🗺️ ZONEN-SYSTEM UPDATE - Neue Gebiete!',
    content: `Die EldrunZoneManager und EldrunZones Systeme wurden erweitert!

🌍 NEUE ZONEN:
• Artifact Island Alpha - PvP Zone mit Boss-Spawns
• Artifact Island Beta - Hardcore PvP, keine Regeln
• Artifact Island Gamma - Fraktions-exklusive Zone
• Frozen Valley - Neue PvE Zone mit Eisbossen
• Dragon's Lair - Raid-Zone für Gilden (min. 5 Spieler)
• Safe Haven - Handels-Zone, kein PvP erlaubt
• Arena District - 1v1 und Team-Kämpfe

🛡️ ZONEN-REGELN:
• Dome-Schutz für bestimmte Zonen
• Zone-spezifische Loot-Tabellen
• Automatische Teleport-Warnung
• Zone-Events mit Timer-System

Nutzt /zone info für Details zur aktuellen Zone!`,
    category: 'updates',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 30),
    author: 'DevTeam',
    tags: ['Zones', 'PvP', 'PvE', 'Map']
  },
  {
    id: '23',
    title: '💬 BETTER CHAT - Premium Kommunikation!',
    content: `Das EldrunBetterChat System bringt neue Chat-Features!

✨ NEUE CHAT-FEATURES:
• Rang-basierte Präfixe und Farben
• Fraktions-Tags in Farbe
• Gilden-Tags mit Custom Icons
• VIP-Titel und Effekte
• Level-Anzeige im Chat
• Chat-Filter für toxische Nachrichten
• Private Nachrichten mit /pm
• Globaler, Lokaler, Fraktions-, Gilden-Chat

🎨 CHAT-FORMATE:
[Admin] [LVL 100] [Seraphar] SirEldrun: Willkommen!
[VIP Gold] [LVL 45] [Phoenix] DragonFury: gg
[Moderator] [LVL 80] StormBringer: Keine Cheats!

Nutzt /chat help für alle Befehle!`,
    category: 'updates',
    priority: 'low',
    date: new Date(Date.now() - 1000 * 60 * 60 * 35),
    author: 'DevTeam',
    tags: ['Chat', 'Communication', 'Social']
  },
  {
    id: '24',
    title: '🎲 LOTTERY JACKPOT REKORD - 750.000 COINS!',
    content: `Der EldrunLottery Jackpot hat einen neuen Rekordstand erreicht!

🎰 JACKPOT STATUS:
━━━━━━━━━━━━━━━━━━━
💰 Aktueller Pot: 750.000 Coins
🎫 Verkaufte Tickets: 1.247
👥 Teilnehmer: 389 Spieler
⏰ Ziehung: Sonntag 21:00 Uhr
━━━━━━━━━━━━━━━━━━━

📊 LETZTE GEWINNER:
• Woche 47: ShadowHunter - 250.000 Coins
• Woche 46: NightWalker - 180.000 Coins
• Woche 45: DragonFury - 320.000 Coins
• Woche 44: StormBringer - 145.000 Coins

🎫 TICKET PREISE:
• 1 Ticket: 500 Coins
• 5 Tickets: 2.000 Coins (20% Rabatt)
• 10 Tickets: 3.500 Coins (30% Rabatt)
• VIP Bonus: +1 Gratis-Ticket pro Kauf

Kauft eure Tickets: /lottery buy`,
    category: 'events',
    priority: 'high',
    date: new Date(Date.now() - 1000 * 60 * 60 * 40),
    author: 'Casino Manager',
    tags: ['Lottery', 'Jackpot', 'Casino', 'Event']
  },
  {
    id: '25',
    title: '🔧 REMOVER TOOL & COPYPASTE UPDATE!',
    content: `Die EldrunRemoverTool und EldrunCopyPaste Systeme wurden verbessert!

🔨 REMOVER TOOL:
• Schnelleres Entfernen von Strukturen
• Ressourcen-Rückerstattung verbessert (80% statt 50%)
• VIP-Spieler erhalten 100% Rückerstattung
• Undo-Funktion für versehentliches Löschen
• Bereichs-Entfernung für Admins

📋 COPYPASTE:
• Bauten speichern und wiederverwenden
• Gilden-Baupläne teilen
• Automatische Ausrichtung
• Terrain-Anpassung
• Max. Größe: 500 Objekte (VIP: 1000)

Befehle: /remove, /copy, /paste, /undo`,
    category: 'patches',
    priority: 'low',
    date: new Date(Date.now() - 1000 * 60 * 60 * 45),
    author: 'DevTeam',
    tags: ['Building', 'Tools', 'QoL']
  },
  {
    id: '26',
    title: '🌙 NACHTLATERNEN & AUTO-LICHTER!',
    content: `Die EldrunNightLanterns und EldrunAutoLights Systeme sind aktiv!

💡 AUTOMATISCHE BELEUCHTUNG:
• Alle Lichter schalten automatisch bei Nacht ein
• Konfigurierbare Zeiten pro Spieler
• Energie-sparender Modus für große Basen
• Stimmungsbeleuchtung mit Farboptionen
• VIP: RGB-Beleuchtung freigeschaltet

🏮 NACHT-LATERNEN:
• Straßenlaternen beleuchten automatisch Wege
• Monument-Beleuchtung aktiv
• Safe-Zone Beleuchtung verbessert
• Laternen können eingesammelt werden

Einstellungen: /lights settings`,
    category: 'updates',
    priority: 'low',
    date: new Date(Date.now() - 1000 * 60 * 60 * 50),
    author: 'DevTeam',
    tags: ['Lights', 'Automation', 'QoL', 'Building']
  },
  {
    id: '27',
    title: '🎮 HUD SYSTEM - Vollständig anpassbar!',
    content: `Das EldrunHUD und EldrunInfoPanel System wurde komplett überarbeitet!

📊 HUD ELEMENTE:
• XP & Level Anzeige mit Fortschrittsbalken
• Fraktions-Status und Punkte
• Gilden-Info kompakt
• Mini-Map Integration
• Kompass mit POI-Markern
• Quick-Stats (Kills, Deaths, K/D)
• Server-Zeit und Events
• Aktive Buffs und Debuffs

⚙️ ANPASSUNGEN:
• Position aller Elemente verschiebbar
• Transparenz einstellbar
• Kompakt-Modus für PvP
• Elemente einzeln ein-/ausschaltbar
• Preset-Speicherung

Einstellungen: /hud config`,
    category: 'updates',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 55),
    author: 'DevTeam',
    tags: ['HUD', 'UI', 'Customization', 'QoL']
  },
  {
    id: '28',
    title: '🐛 BUG REPORT SYSTEM - Meldet Fehler!',
    content: `Das EldrunBugReport System ermöglicht einfaches Melden von Problemen!

🔍 SO MELDET IHR BUGS:
1. Nutzt /bugreport oder /bug
2. Wählt die Kategorie (Gameplay, UI, Performance, Exploit)
3. Beschreibt das Problem detailliert
4. Optional: Screenshot-Link hinzufügen
5. Absenden - Ticket wird erstellt

🏆 BUG-HUNTER BELOHNUNGEN:
• Bestätigter Bug: 1.000 Coins
• Kritischer Bug: 5.000 Coins
• Exploit-Meldung: 10.000 Coins + Titel
• Top Bug-Hunter des Monats: VIP Bronze

📊 STATUS:
• Offene Tickets: 23
• In Bearbeitung: 8
• Diese Woche behoben: 15

Danke für eure Hilfe, Eldrun besser zu machen!`,
    category: 'community',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 60),
    author: 'DevTeam',
    tags: ['BugReport', 'Community', 'Support', 'Feedback']
  },
  {
    id: '29',
    title: '🎖️ SERVER REWARDS - Tägliche Belohnungen!',
    content: `Das EldrunServerRewards System belohnt aktive Spieler!

🎁 TÄGLICHE BELOHNUNGEN:
• Tag 1: 500 Coins
• Tag 2: 1.000 Coins + 100 XP
• Tag 3: 2.000 Coins + Starter Kit
• Tag 4: 3.000 Coins + Random Skin
• Tag 5: 5.000 Coins + VIP 24h Trial
• Tag 6: 7.500 Coins + Legendary Crate
• Tag 7: 15.000 Coins + Exclusive Title!

🔥 STREAK BONI:
• 14 Tage Streak: +25% auf alle Rewards
• 30 Tage Streak: +50% auf alle Rewards
• 60 Tage Streak: Permanent +10% XP Boost

⏰ Reset: Täglich um 00:00 Uhr
Nicht vergessen: /daily zum Abholen!`,
    category: 'updates',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 70),
    author: 'DevTeam',
    tags: ['Rewards', 'Daily', 'Streak', 'Coins']
  },
  {
    id: '30',
    title: '📍 TELEPORT SYSTEM MEGA-UPDATE!',
    content: `Das EldrunTeleport und EldrunFastTravel System wurde massiv erweitert!

🚀 TELEPORT FEATURES:
━━━━━━━━━━━━━━━━━━━
/home - Bis zu 5 Homes (VIP: 15)
/tpr - Teleport-Anfrage an Spieler
/tpa - Anfrage akzeptieren
/town - Zum Handelsplatz
/outpost - Zum Outpost
/bandit - Zum Bandit Camp
━━━━━━━━━━━━━━━━━━━

🗺️ FAST TRAVEL PUNKTE:
• 25 freischaltbare Teleport-Punkte
• Erkunden erforderlich zum Freischalten
• Kosten pro Teleport: 50-500 Coins
• VIP: 50% Rabatt auf alle Teleports
• Gilden-HQ als Teleport-Punkt

⏱️ COOLDOWNS:
• Standard: 5 Minuten
• VIP Bronze: 3 Minuten
• VIP Gold: 1 Minute
• VIP Diamond: 30 Sekunden`,
    category: 'updates',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 80),
    author: 'DevTeam',
    tags: ['Teleport', 'Travel', 'Homes', 'QoL']
  },
  {
    id: '31',
    title: '⚒️ GATHER RATES & BETTER LOOT!',
    content: `Die EldrunGatherManager und EldrunBetterLoot Systeme bieten mehr Ressourcen!

⛏️ GATHER RATES:
• Standard: 3x Gather Rate
• VIP Bronze: 4x Gather Rate
• VIP Gold: 5x Gather Rate
• VIP Diamond: 6x Gather Rate
• Wochenend-Bonus: +50% auf alles!

📦 BETTER LOOT:
• Verbesserte Barrel/Crate Loot-Tabellen
• Höhere Chance auf seltene Items
• Military Crates: Guaranteed Component
• Elite Crates: Chance auf Legendary
• Helikopter/Bradley: Massiver Loot Buff

🎲 LOOT-MULTIPLIKATOREN:
• Airdrop: 2x Standard
• Hackable Crates: 1.5x Standard  
• Underwater Labs: 2x Standard
• Raid Bases: 3x Standard`,
    category: 'updates',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 90),
    author: 'DevTeam',
    tags: ['Gather', 'Loot', 'Resources', 'Rates']
  },
  {
    id: '32',
    title: '🗳️ COMMUNITY VOTE - Nächstes Feature!',
    content: `Stimmt ab für das nächste große Feature!

📊 AKTUELLE ABSTIMMUNG:
Was soll als nächstes entwickelt werden?

🏴‍☠️ Option A: Piraten-Event
   Schiffe, Seeschlachten, Schatz-Inseln
   Votes: 347 (28%)

🐲 Option B: Drachen-System  
   Zähmbare Drachen, Luftkämpfe
   Votes: 512 (42%)

⚔️ Option C: Arena-System
   1v1, 2v2, 5v5 Turniere mit Rängen
   Votes: 289 (24%)

🏰 Option D: Belagerungskrieg
   Großangelegte Gilden vs Gilden Kämpfe
   Votes: 73 (6%)

━━━━━━━━━━━━━━━━━━━
Abstimmung endet: Sonntag 23:59 Uhr
Teilnehmen: /vote im Spiel
━━━━━━━━━━━━━━━━━━━

Jede Stimme zählt - gestaltet Eldrun mit!`,
    category: 'community',
    priority: 'high',
    date: new Date(Date.now() - 1000 * 60 * 60 * 4),
    author: 'SirEldrun',
    tags: ['Vote', 'Community', 'Feature', 'Poll']
  },
  {
    id: '33',
    title: '🔒 SICHERHEITSUPDATE - Schutz verbessert!',
    content: `Wichtiges Sicherheitsupdate für alle Eldrun-Systeme!

🛡️ NEUE SICHERHEITSFEATURES:
• Anti-Cheat System v3.0 implementiert
• Verbesserte Exploit-Erkennung
• Admin-Panel nur für verifizierte Admins
• Zwei-Faktor für VIP-Transaktionen
• Automatische Backup-Systeme

⚠️ BAN-STATISTIK DIESE WOCHE:
• Cheater gebannt: 23
• Exploiter gebannt: 8
• Bot-Accounts entfernt: 156
• False-Positives: 0

🎖️ FAIR PLAY BELOHNUNGEN:
Alle Spieler ohne Verwarnungen erhalten:
• 2.500 Bonus-Coins
• "Fair Player" Badge
• +5% XP Boost permanent

Danke für eine faire Community!`,
    category: 'maintenance',
    priority: 'high',
    date: new Date(Date.now() - 1000 * 60 * 60 * 100),
    author: 'Security Team',
    tags: ['Security', 'AntiCheat', 'Safety', 'Update']
  },
  {
    id: '34',
    title: '🎪 WOCHENEND-EVENT: Doppel-XP Marathon!',
    content: `Dieses Wochenende gibt es massive Boni für alle Spieler!

🎉 EVENT DETAILS:
━━━━━━━━━━━━━━━━━━━
📅 Zeitraum: Fr 18:00 - So 23:59
━━━━━━━━━━━━━━━━━━━

⚡ BONI:
• 2x XP auf ALLE Aktivitäten
• 2x Gather Rate
• 2x Quest-Belohnungen
• 1.5x Loot-Qualität
• 50% Rabatt im Shop
• Gratis VIP Bronze für 48h

🏆 BONUS-HERAUSFORDERUNGEN:
• 100 Kills → Legendary Weapon Crate
• Level Up 10x → Exclusive Skin
• Complete 20 Quests → 50.000 Coins
• Win 5 Raids → VIP Silver 7 Tage

Lasst das Grinding beginnen!`,
    category: 'events',
    priority: 'urgent',
    date: new Date(Date.now() - 1000 * 60 * 30),
    author: 'EventTeam',
    pinned: true,
    tags: ['Event', 'DoubleXP', 'Weekend', 'Bonus']
  },
  {
    id: '35',
    title: '📱 DISCORD INTEGRATION - Jetzt verbinden!',
    content: `Verbindet euren Account mit Discord für exklusive Vorteile!

🔗 DISCORD FEATURES:
• Live Server-Status im Discord
• Kill-Feed und Event-Announcements
• Ticket-System für Support
• Rollen basierend auf Ingame-Rang
• Voice-Channels für Gilden
• Exklusive Discord-only Giveaways

🎁 VERBINDUNGS-BONUS:
• 5.000 Coins einmalig
• "Discord Member" Badge
• Zugang zu #verified Channel
• Priority Support Queue

📊 COMMUNITY STATS:
• Discord Mitglieder: 2.847
• Online jetzt: 489
• Nachrichten heute: 1.234

Join: discord.gg/eldrun`,
    category: 'community',
    priority: 'medium',
    date: new Date(Date.now() - 1000 * 60 * 60 * 110),
    author: 'Community Manager',
    tags: ['Discord', 'Social', 'Community', 'Integration']
  }
]

// Live ticker messages - Eldrun specific
const LIVE_TICKER = [
  '⚔️ SERAPHAR führt im Fraktionskrieg: 2.847 zu 2.651 Kills!',
  '🐉 Raid Base "Dragon\'s Lair" wurde von ShadowHunter bezwungen!',
  '🏰 Gilde "Phoenix Rising" hat Castle "Nordwall" erobert!',
  '⚡ NightWalker erreichte Level 100 - Prestige freigeschaltet!',
  '🎯 Kopfgeld erfüllt: DragonFury hat DarkReaper eliminiert (+75.000 Coins)',
  '📜 Quest "Der gefallene König" wurde 3x heute abgeschlossen!',
  '🐺 Neuer Pet-Rekord: MasterTamer hat 5 Wölfe gezähmt!',
  '🚁 Attack Helicopter spawned bei Artifact Island Alpha!',
  '💰 Casino Jackpot steigt: 750.000 Coins!',
  '🏆 Achievement "Legendary Raider" freigeschaltet von StormBringer!',
  '⚔️ VORGAROTH Gegenangriff: 15 Spieler bei Stormwall!',
  '🎒 VIP-Backpack Upgrade: 48 Slots jetzt verfügbar!',
  '🗺️ Neuer Teleport-Punkt "Frozen Valley" entdeckt!',
  '👥 Gilde "Iron Legion" gegründet - 25 Mitglieder!',
  '🗡️ DIE KRONE wurde gedroppt! Aktueller Träger: ???',
  '🌩️ STORMWALL EVENT startet in 2 Stunden!',
  '🎲 Lottery Ziehung: Sonntag 21:00 Uhr - 1.247 Tickets verkauft!',
  '⚒️ GatherBoost aktiv: +50% Ressourcen dieses Wochenende!',
  '🏴‍☠️ Artifact Island Beta: Hardcore PvP Zone - 23 Spieler aktiv!',
  '💎 Legendary Drop: IronFist fand "Schwert des Untergangs"!',
  '🔥 Kill-Streak: BloodMoon hat 15 Kills in Folge!',
  '📦 Neue Kits verfügbar: Seraphar Warrior & Vorgaroth Shadow!',
  '🎮 Server-Performance: 60 FPS, 0ms Ping, 156 Spieler online',
  '⭐ Daily Streak: 47 Spieler haben heute /daily abgeholt!',
  '🛡️ Anti-Cheat: 3 Cheater in der letzten Stunde gebannt!',
  '🏆 Gilden-Ranking: Phoenix Rising #1, Iron Legion #2, Shadow Clan #3',
  '📊 Community Vote: Drachen-System führt mit 42%!',
  '🎁 VIP-Aktion: 20% Rabatt auf alle VIP-Pakete bis Sonntag!',
]

export function HeatmapNews() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all')
  const [expandedNews, setExpandedNews] = useState<string | null>(null)
  const [tickerIndex, setTickerIndex] = useState(0)
  const [showNotifications, setShowNotifications] = useState(true)

  // Rotate live ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % LIVE_TICKER.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const categories: { id: NewsCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'all', label: 'Alle', icon: <Newspaper className="w-4 h-4" />, color: 'text-white' },
    { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" />, color: 'text-amber-400' },
    { id: 'updates', label: 'Updates', icon: <Zap className="w-4 h-4" />, color: 'text-blue-400' },
    { id: 'patches', label: 'Patches', icon: <Wrench className="w-4 h-4" />, color: 'text-green-400' },
    { id: 'community', label: 'Community', icon: <Users className="w-4 h-4" />, color: 'text-purple-400' },
    { id: 'maintenance', label: 'Wartung', icon: <Server className="w-4 h-4" />, color: 'text-orange-400' },
  ]

  const filteredNews = activeCategory === 'all' 
    ? SIMULATED_NEWS 
    : SIMULATED_NEWS.filter(n => n.category === activeCategory)

  const pinnedNews = filteredNews.filter(n => n.pinned)
  const regularNews = filteredNews.filter(n => !n.pinned)

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `vor ${minutes} Min.`
    if (hours < 24) return `vor ${hours} Std.`
    if (days < 7) return `vor ${days} Tagen`
    return date.toLocaleDateString('de-DE')
  }

  const getPriorityStyle = (priority: NewsPriority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500/50 bg-red-500/10'
      case 'high': return 'border-amber-500/50 bg-amber-500/10'
      case 'medium': return 'border-blue-500/50 bg-blue-500/10'
      default: return 'border-metal-700 bg-metal-800/50'
    }
  }

  const getPriorityIcon = (priority: NewsPriority) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'high': return <Flame className="w-4 h-4 text-amber-400" />
      case 'medium': return <Info className="w-4 h-4 text-blue-400" />
      default: return <CheckCircle className="w-4 h-4 text-green-400" />
    }
  }

  const getCategoryIcon = (category: NewsCategory) => {
    const cat = categories.find(c => c.id === category)
    return cat?.icon || <Newspaper className="w-4 h-4" />
  }

  const getCategoryColor = (category: NewsCategory) => {
    const cat = categories.find(c => c.id === category)
    return cat?.color || 'text-metal-400'
  }

  return (
    <div id="news" className="bg-metal-900/50 border border-metal-800">
      {/* Header */}
      <div className="p-4 border-b border-metal-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-rust-400" />
            SERVER NEWS & UPDATES
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 transition-colors ${showNotifications ? 'text-amber-400' : 'text-metal-500'}`}
            >
              <Bell className="w-5 h-5" />
            </button>
            <span className="px-2 py-1 bg-rust-500/20 text-rust-400 text-xs font-mono">
              {SIMULATED_NEWS.length} News
            </span>
          </div>
        </div>

        {/* Live Ticker */}
        <div className="relative overflow-hidden h-8 bg-metal-800/50 border border-metal-700 mb-4">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-red-500 flex items-center justify-center z-10">
            <span className="text-white text-xs font-bold animate-pulse">LIVE</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute left-20 right-0 top-0 bottom-0 flex items-center px-4"
            >
              <span className="text-sm text-metal-300 truncate">{LIVE_TICKER[tickerIndex]}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-display uppercase tracking-wider transition-all ${
                activeCategory === cat.id
                  ? `bg-rust-500/20 text-rust-400 border-b-2 border-rust-500`
                  : 'text-metal-400 hover:text-white hover:bg-metal-800'
              }`}
            >
              <span className={cat.color}>{cat.icon}</span>
              {cat.label}
              <span className="text-metal-600 ml-1">
                ({cat.id === 'all' ? SIMULATED_NEWS.length : SIMULATED_NEWS.filter(n => n.category === cat.id).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <QuickStat icon={<Calendar />} label="Events" value={SIMULATED_NEWS.filter(n => n.category === 'events').length} color="text-amber-400" />
          <QuickStat icon={<Zap />} label="Updates" value={SIMULATED_NEWS.filter(n => n.category === 'updates').length} color="text-blue-400" />
          <QuickStat icon={<Wrench />} label="Patches" value={SIMULATED_NEWS.filter(n => n.category === 'patches').length} color="text-green-400" />
          <QuickStat icon={<AlertTriangle />} label="Urgent" value={SIMULATED_NEWS.filter(n => n.priority === 'urgent').length} color="text-red-400" />
        </div>

        {/* Pinned News */}
        {pinnedNews.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-metal-500 uppercase">
              <Pin className="w-4 h-4" />
              Angepinnt
            </div>
            {pinnedNews.map((news, index) => (
              <NewsCard 
                key={news.id} 
                news={news} 
                index={index}
                expanded={expandedNews === news.id}
                onToggle={() => setExpandedNews(expandedNews === news.id ? null : news.id)}
                getPriorityStyle={getPriorityStyle}
                getPriorityIcon={getPriorityIcon}
                getCategoryIcon={getCategoryIcon}
                getCategoryColor={getCategoryColor}
                formatDate={formatDate}
                isPinned
              />
            ))}
          </div>
        )}

        {/* Regular News */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {regularNews.map((news, index) => (
            <NewsCard 
              key={news.id} 
              news={news} 
              index={index}
              expanded={expandedNews === news.id}
              onToggle={() => setExpandedNews(expandedNews === news.id ? null : news.id)}
              getPriorityStyle={getPriorityStyle}
              getPriorityIcon={getPriorityIcon}
              getCategoryIcon={getCategoryIcon}
              getCategoryColor={getCategoryColor}
              formatDate={formatDate}
            />
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="border-t border-metal-700 pt-4 mt-4">
          <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Kommende Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <EventPreview 
              title="Faction War"
              date="Sa, 20:00"
              type="PvP Event"
              color="text-red-400"
              icon="⚔️"
            />
            <EventPreview 
              title="Weihnachts-Event"
              date="20. Dez"
              type="Seasonal"
              color="text-green-400"
              icon="🎄"
            />
            <EventPreview 
              title="Raid Night"
              date="So, 21:00"
              type="Community"
              color="text-purple-400"
              icon="💥"
            />
            <EventPreview 
              title="Heli Hunting"
              date="Fr, 19:00"
              type="PvE Event"
              color="text-blue-400"
              icon="🚁"
            />
          </div>
        </div>

        {/* Server Status */}
        <div className="border-t border-metal-700 pt-4">
          <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-green-400" />
            Server Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <StatusItem label="Server" value="Online" status="online" />
            <StatusItem label="Ping" value="23ms" status="good" />
            <StatusItem label="TPS" value="30/30" status="online" />
            <StatusItem label="Nächste Wartung" value="Mo 03:00" status="scheduled" />
          </div>
        </div>

        {/* Changelog Preview */}
        <div className="border-t border-metal-700 pt-4">
          <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-400" />
            Letzte Änderungen (v2.4.1)
          </h3>
          <div className="space-y-1 text-sm">
            <ChangelogItem type="add" text="Neues Achievement-System" />
            <ChangelogItem type="fix" text="Dupe-Glitch beim Recycler behoben" />
            <ChangelogItem type="change" text="AK-47 Rückstoß angepasst" />
            <ChangelogItem type="add" text="3 neue PvP Arena Maps" />
            <ChangelogItem type="fix" text="Ladezeiten optimiert" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface NewsCardProps {
  news: NewsItem
  index: number
  expanded: boolean
  onToggle: () => void
  getPriorityStyle: (priority: NewsPriority) => string
  getPriorityIcon: (priority: NewsPriority) => React.ReactNode
  getCategoryIcon: (category: NewsCategory) => React.ReactNode
  getCategoryColor: (category: NewsCategory) => string
  formatDate: (date: Date) => string
  isPinned?: boolean
}

function NewsCard({ 
  news, 
  index, 
  expanded, 
  onToggle,
  getPriorityStyle,
  getPriorityIcon,
  getCategoryIcon,
  getCategoryColor,
  formatDate,
  isPinned
}: NewsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border p-4 cursor-pointer transition-all hover:border-rust-500/50 ${getPriorityStyle(news.priority)} ${isPinned ? 'ring-1 ring-amber-500/30' : ''}`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        {getPriorityIcon(news.priority)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-display font-bold text-white">{news.title}</h4>
            {isPinned && <Pin className="w-3 h-3 text-amber-400" />}
          </div>
          <div className="flex items-center gap-3 text-xs text-metal-500 mb-2">
            <span className={`flex items-center gap-1 ${getCategoryColor(news.category)}`}>
              {getCategoryIcon(news.category)}
              {news.category.toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(news.date)}
            </span>
            <span>von {news.author}</span>
          </div>
          
          <AnimatePresence>
            {expanded ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-metal-300 text-sm whitespace-pre-line mb-3">{news.content}</p>
                {news.tags && (
                  <div className="flex flex-wrap gap-1">
                    {news.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-metal-800 text-metal-400 text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <p className="text-metal-400 text-sm line-clamp-1">{news.content}</p>
            )}
          </AnimatePresence>
        </div>
        <ChevronRight className={`w-5 h-5 text-metal-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>
    </motion.div>
  )
}

function QuickStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-metal-800/50 p-3 border border-metal-700 text-center">
      <div className={`flex items-center justify-center gap-1 ${color} mb-1`}>
        {icon}
      </div>
      <span className={`font-mono text-xl font-bold ${color}`}>{value}</span>
      <p className="text-xs text-metal-500">{label}</p>
    </div>
  )
}

function EventPreview({ title, date, type, color, icon }: { title: string; date: string; type: string; color: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-metal-800/50 border border-metal-700 hover:border-rust-500/50 transition-colors cursor-pointer">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <h4 className="font-display font-bold text-white text-sm">{title}</h4>
        <p className="text-xs text-metal-500">{type}</p>
      </div>
      <div className="text-right">
        <span className={`text-sm font-mono ${color}`}>{date}</span>
      </div>
    </div>
  )
}

function StatusItem({ label, value, status }: { label: string; value: string; status: 'online' | 'good' | 'warning' | 'offline' | 'scheduled' }) {
  const statusColors = {
    online: 'bg-green-500',
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    offline: 'bg-red-500',
    scheduled: 'bg-blue-500'
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-metal-800/50 border border-metal-700">
      <div className={`w-2 h-2 rounded-full ${statusColors[status]} ${status === 'online' ? 'animate-pulse' : ''}`} />
      <div className="flex-1">
        <p className="text-xs text-metal-500">{label}</p>
        <p className="text-sm text-white font-mono">{value}</p>
      </div>
    </div>
  )
}

function ChangelogItem({ type, text }: { type: 'add' | 'fix' | 'change' | 'remove'; text: string }) {
  const styles = {
    add: { icon: '+', color: 'text-green-400 bg-green-500/20' },
    fix: { icon: '✓', color: 'text-blue-400 bg-blue-500/20' },
    change: { icon: '~', color: 'text-yellow-400 bg-yellow-500/20' },
    remove: { icon: '-', color: 'text-red-400 bg-red-500/20' }
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`w-5 h-5 flex items-center justify-center text-xs font-mono ${styles[type].color}`}>
        {styles[type].icon}
      </span>
      <span className="text-metal-300">{text}</span>
    </div>
  )
}
