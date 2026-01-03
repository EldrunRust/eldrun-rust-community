# Eldrun Data Model Documentation

## Overview

Das Eldrun-Datenmodell ist eine umfassende Struktur für die Community-Website, die alle Spiel- und Community-Domains abdeckt.

## Entity Relationship Diagram (High-Level)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▶│   Player    │────▶│   Faction   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  GameClass  │     │   Guild     │     │ FactionWar  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│   Skills    │     │GuildMember  │
└─────────────┘     └─────────────┘
```

## Core Models

### User & Authentication
- **User** - Hauptbenutzer mit Auth-Daten
- **Account** - OAuth-Verbindungen (Steam, Discord)
- **Session** - Aktive Sitzungen

### Game Entities
- **Faction** - Seraphar & Vorgaroth
- **FactionWar** - Kriegs-Historie
- **GameClass** - 6 Klassen (Warrior, Archer, Mage, etc.)
- **Skill** - Klassen-Skills
- **Profession** - 5 Berufe (Mining, Crafting, etc.)
- **Recipe** - Herstellungsrezepte

### Player Progress
- **PlayerClass** - Spieler-Klassen-Fortschritt
- **PlayerProfession** - Beruf-Level
- **PlayerQuest** - Quest-Fortschritt
- **PlayerSeason** - Battle Pass Fortschritt
- **UserAchievement** - Errungenschaften

### Events & Activities
- **GameEvent** - Event-Definitionen
- **ActiveGameEvent** - Laufende Events
- **HeatmapEvent** - Position-basierte Events
- **HeatmapAggregate** - Aggregierte Heatmap-Daten

### Economy
- **AuctionListing** - Auktionshaus-Einträge
- **AuctionBid** - Gebote
- **ShopProduct** - Shop-Artikel
- **Transaction** - Zahlungen

### Community
- **ForumCategory** - Forum-Kategorien
- **ForumBoard** - Forum-Boards
- **ForumThread** - Threads
- **ForumPost** - Beiträge
- **ChatChannel** - Chat-Kanäle
- **ChatMessage** - Nachrichten
- **News** - Neuigkeiten

### Content
- **ChangelogRelease** - Versionen
- **ChangelogItem** - Änderungen
- **StaticPage** - Statische Seiten (versioniert)
- **LoreEntry** - Lore-Einträge
- **ItemCatalog** - Item-Datenbank

### Moderation
- **Ticket** - Support-Tickets
- **TicketMessage** - Ticket-Nachrichten
- **AuditLog** - Audit-Trail

### Simulation (Dev/Demo only)
- **SimulationConfig** - Simulation-Einstellungen
- **SimulationLog** - Aktivitäts-Log

## Schema-Konventionen

### IDs
- Alle IDs verwenden `cuid()` für eindeutige Identifikation
- Slug-Felder für URL-freundliche Referenzen

### Timestamps
- `createdAt` - Erstellungsdatum
- `updatedAt` - Letzte Änderung (automatisch)

### JSON Fields
- Komplexe Daten wie `bonuses`, `rewards`, `metadata` als JSON-String

### Soft Delete
- `isDeleted` Flag statt hartem Löschen

### Simulation Marking
- `isSimulated` Flag für Demo-Daten

## Prisma Commands

```bash
# Schema validieren
npx prisma validate

# Client generieren (nach Schema-Änderungen!)
npx prisma generate

# Migration erstellen
npx prisma migrate dev --name <name>

# DB pushen (Dev)
npx prisma db push

# Studio öffnen
npx prisma studio
```

## Import Commands

```bash
# EldrunMod Daten importieren
pnpm import:eldrun

# Dry-Run (keine DB-Änderungen)
pnpm import:eldrun:dry

# Content seeden
pnpm seed:content
```

## Simulation Commands

```bash
# Simulation starten
pnpm sim:start

# Simulation stoppen
pnpm sim:stop

# Simulations-Daten löschen
pnpm sim:reset --force
```
