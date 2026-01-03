# Eldrun Data Model - Setup Guide

## Quick Start

### 1. Environment Setup

Kopiere `.env.example` zu `.env`:
```bash
cp .env.example .env
```

Wichtige Variablen anpassen:
```env
# Für lokale Entwicklung mit SQLite:
DATABASE_URL="file:./dev.db"

# Demo-Modus aktivieren:
DEMO_MODE="true"
SIMULATION_MODE="true"
SEED_MODE="true"
```

### 2. Prisma Client generieren

**WICHTIG:** Nach jeder Schema-Änderung ausführen!

```bash
npx prisma generate
```

### 3. Datenbank erstellen/migrieren

```bash
# Für Entwicklung (pusht Schema direkt):
npx prisma db push

# Für Production (erstellt Migration):
npx prisma migrate dev --name init
```

### 4. Basis-Daten importieren

```bash
# EldrunMod Daten (Factions, Classes, etc.)
pnpm import:eldrun

# Content (News, Changelog, Forum-Struktur)
pnpm seed:content
```

### 5. Simulation starten (optional)

```bash
# Simulierte Aktivität generieren
pnpm sim:start
```

## Vollständiger Setup-Workflow

```bash
# 1. Dependencies installieren
pnpm install

# 2. Prisma Client generieren
npx prisma generate

# 3. Datenbank erstellen
npx prisma db push

# 4. Daten importieren
pnpm import:eldrun
pnpm seed:content

# 5. Dev-Server starten
pnpm dev
```

## Troubleshooting

### "Property X does not exist on PrismaClient"
→ Führe `npx prisma generate` aus

### "Database file not found"
→ Führe `npx prisma db push` aus

### "Cannot connect to database"
→ Prüfe DATABASE_URL in .env

### "Migration failed"
→ Lösche `prisma/migrations/` und starte neu mit `db push`

## Demo Mode

Der Demo-Modus zeigt einen Banner und markiert alle simulierten Daten:

```tsx
// In layout.tsx oder page.tsx:
import DemoBanner from '@/components/ui/DemoBanner'

<DemoBanner 
  isDemoMode={process.env.DEMO_MODE === 'true'}
  isSimulation={process.env.SIMULATION_MODE === 'true'}
/>
```

## Feature Flags

Feature Flags können in `.env` gesteuert werden:

```env
FEATURE_CASINO="true"
FEATURE_AUCTION="true"
FEATURE_TRADING="true"
FEATURE_BATTLEPASS="true"
FEATURE_HEATMAP="true"
FEATURE_CHAT="true"
FEATURE_STREAMS="true"
```

Verwendung im Code:
```tsx
import { isFeatureEnabled } from '@/lib/eldrun/featureFlags'

if (isFeatureEnabled('casino')) {
  // Casino-Feature anzeigen
}
```

## Nächste Schritte

1. **Prisma Studio** öffnen: `npx prisma studio`
2. **API Routes** erstellen für neue Models
3. **UI-Komponenten** mit echten Daten verbinden
4. **Tests** für Import-Scripts schreiben
