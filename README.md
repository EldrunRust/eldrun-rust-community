# 🎮 RUST ZONE - Community Website

Eine High-Tech AAA Rust Community Website für deinen Rust Game Server.

## 🚀 Tech Stack

- **Next.js 14** - React Framework mit App Router
- **TypeScript** - Type-Safety
- **TailwindCSS** - Modernes Styling
- **Framer Motion** - Flüssige Animationen
- **Zustand** - State Management
- **Lucide React** - Icons

## ✨ Features

- 🎨 **Rust-inspiriertes Design** - Post-apokalyptisches, industrielles Theme
- 📊 **Live Server Status** - Echtzeit Spieler- und Server-Statistiken
- 🏆 **Leaderboard** - Top Spieler mit Sortierung
- 📰 **News Section** - Aktuelle Updates und Events
- 🔐 **Auth System** - Login/Register Modal mit Steam-Integration
- 📱 **Responsive** - Optimiert für alle Geräte
- ⚡ **Animationen** - Smooth transitions und Hover-Effekte

## 🛠️ Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build
npm run build
npm start
```

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root Layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Globale Styles
├── components/
│   ├── layout/            # Header, Footer
│   ├── sections/          # Hero, Features, Leaderboard, etc.
│   └── ui/                # Buttons, Modals, etc.
├── data/                  # Dummy-Daten
├── lib/                   # Utilities
└── store/                 # Zustand Store
```

## 🎨 Design System

### Farben
- **Rust Orange**: #ed7620 (Primary)
- **Metal Grays**: #1a1a1a - #6d6d6d
- **Radiation Green**: #84cc16 (Online Status)
- **Blood Red**: #dc2626 (Danger)

### Schriften
- **Display**: Orbitron (Headlines)
- **Body**: Rajdhani (Text)
- **Mono**: Share Tech Mono (Code/Stats)

## 🔧 Konfiguration

Die Server-Informationen können in `src/data/serverData.ts` angepasst werden:

```typescript
export const SERVER_INFO = {
  name: "RUST ZONE",
  ip: "play.rustzone.de",
  port: "28015",
  // ... weitere Einstellungen
}
```

## 📝 Nächste Schritte

- [ ] Backend-Integration für echte Server-Daten
- [ ] Steam OAuth implementieren
- [ ] Shop-System
- [ ] Admin Dashboard
- [ ] Discord Integration
- [ ] ELDRUN RUST MEGA GUIDE regelmäßig aktualisieren

---

## 📚 Knowledge Hub

- [Eldrun Rust Mega Guide](./docs/ELDRUN_RUST_MEGA_GUIDE.md) – Vollständige Dokumentation für alle Systeme, Features, Assets, Tutorials und Betriebsprozesse.

---

Made with ❤️ for the Rust Community
