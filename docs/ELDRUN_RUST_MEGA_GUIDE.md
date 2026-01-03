# Eldrun Rust Mega Guide – Vollständige Anleitung zu allen Systemen, Features & Plugins

> **Zielgruppe:** Admins, Moderatoren, Content Creators, Entwickler:innen und Power-User, die Eldrun Rust ganzheitlich betreiben, erweitern und dokumentieren wollen.  
> **Anspruch:** Extrem ausführlich, lange Sätze, jedes Modul logisch und intelligent erklärt, damit auch komplexe Zusammenhänge nachvollziehbar bleiben.

---

## 1. Grundverständnis & Setup

1. **Projektstruktur verstehen:** Eldrun Rust kombiniert Next.js (App Router), Prisma, Tailwind, Zustand Stores, Simulation-Skripte und umfangreiche Demo-/Live-Daten. Alles liegt im Ordner `rust-community`.  
2. **Umgebung vorbereiten:** `.env` aus `.env.example` kopieren, `DATABASE_URL`, `DEMO_MODE`, `SIMULATION_MODE`, `SEED_MODE` aktivieren, damit Demo-Daten und Simulationen vollständig funktionieren.  
3. **Installieren & Bauen:** `pnpm install`, `npx prisma generate`, `npx prisma db push`, `pnpm import:eldrun`, `pnpm seed:content`, `pnpm dev`. Für Produktion `pnpm build && pnpm start`.  
4. **Assets sicherstellen:** Alle Icons, Hintergründe, Avatare, SVGs müssen lokal in `public/images/...` existieren. Fehlende Assets dürfen weder aus unklaren Quellen kopiert noch extern verlinkt werden; stattdessen selbst erstellen (z. B. mit Figma/Inkscape) oder ausschließlich freie CC0/CC-BY-Quellen nutzen und herunterladen.

---

## 2. Feature-Landkarte (High Level)

- **Community Shell:** Header, Navigation, globale Ankündigungen, Heldenbereich.  
- **Chat Ökosystem:** Multikanal-Chat mit 15+ Themenräumen, Reaktionen, Gifts, Bot-Livefeed.  
- **Forum Elite:** NASA-Level Layout, 3D-Profile, Gamification, AI-Metafeatures (bereits implementiert).  
- **Game Knowledge Base:** Klassen, Berufe, Fraktionen, Guides, Lore, Quest-Walkthroughs.  
- **Economy & Simulation:** Auktionshaus, Casino, Währungsumläufe, Heatmaps, serverweite Statistiken.  
- **Operations & Events:** Live-Events, Dispatch-Streams, Active Events, War Rooms.  
- **Security & Moderation:** Auth, Rate Limiting, JWT-Handling, Admin Tools, Simulation Flags.

---

## 3. Detailkapitel – Schritt-für-Schritt Anleitungen

### 3.1 Chat & Channels

1. **Datenquellen:**  
   - `src/data/demoChatChannels.ts` – zentrale Definition aller Demo-Kanäle mit Metadaten (Typ, Farbe, Regeln, Monetarisierung).  
   - `src/store/chatStore.ts` – Zustand Store, der Kanäle, User, Nachrichten, Bot-Loop managt.  
   - `src/app/api/chat/channels/route.ts` – Next.js API, die entweder DB oder Demo-Kanäle ausliefert.  
   - `scripts/simulation/start.ts` – synchronisiert Demo-Kanäle mit realer DB, seeden von Intro-Messages, generiert aktive Chat-Ticks.

2. **Kanalerweiterung durchführen:**  
   - In `demoChatChannels.ts` neuen Eintrag hinzufügen (IDs slugifizieren, `type`, `color`, `slowMode`, `allow*` Flags setzen).  
   - Seed-Messages ergänzen (`DEMO_CHAT_CHANNEL_SEED_MESSAGES`).  
   - Simulation neu starten (`pnpm sim:reset --force && pnpm sim:start`) damit DB die Kanäle plus Seeds übernimmt.  
   - Frontend lädt automatisch, weil Store & API auf dieselbe Quelle zeigen.

3. **Bot Chatter justieren:**  
   - `BOT_LINES` array erweitern (Fragen, Tipps, Social).  
   - Intervall in `startBotLoop` anpassen (default 8 Sekunden).  
   - Nur aktiv, wenn kein API-Sync läuft (`state.isApiEnabled === false`).

4. **Reaktionen, Geschenke, Spezialfunktionen:**  
   - `sendEldruns`, `sendHeart`, `sendRose`, `sendKiss` in `chatStore`.  
   - UI-Komponenten reagieren auf `allowEldruns`, `allowGifts`, `allowRoses`.  
   - Für persistente Daten sicherstellen, dass Prisma-Models (`ChatMessage`) Felder wie `giftType`, `giftAmount`, `isSimulated` korrekt befüllt werden.

5. **Moderation:**  
   - Bann-/Mute-Logik (`banUser`, `muteUser`, `kickUser`) bereits hinterlegt.  
   - Wordfilter pro Kanal + global (`ChatAdminSettings`).  
   - Admin Panel kann via Store API Anfragen triggern (z. B. `/api/chat/channels` POST für neue Kanäle – nur Admins!).

### 3.2 Forum & Elite Features

1. **Layouts & Rendering:**  
   - Komponenten im `src/app/(forum)/...` Namespace und `src/components/forum`.  
   - 3D Cards, dynamische Breite, responsive Breakpoints (Tailwind).  
   - Inspiration: woltlab.com – d. h. viel Politur, Kacheln exakt an Shell-Breite anpassen.

2. **Profile & Avatare:**  
   - 3D Avatare (GLTF/Canvas) + fallback Bilder.  
   - Profile Settings: Themes, Banners, Bio, Social Badges.

3. **AI Features:**  
   - Smart Search, Content Moderation Hooks, Auto-Suggestions (bereits implementiert; ggf. `.env` Keys für OpenAI/Anthropic).  
   - Rate Limiter (`middleware.ts`) schützt API vor Abuse.

4. **Rich Media:**  
   - Uploads (via Next.js API Routes).  
   - Embeds (YouTube, Twitch, Spotify) whitelisted.  
   - Editor: Markdown/Slate Hybrid mit Formatierungen, Polls, Reaktionen.

### 3.3 Game Systems (Klassen, Berufe, Quests, Events)

1. **Klassen (`/classes`):**  
   - Datenquellen über `src/app/classes/page.tsx` + JSON/TS arrays.  
   - Jede Klasse mit Rollenbeschreibung, Signaturfähigkeiten, Tooltip-Badges.  
   - Assets: Icons, Hintergründe – alle `.svg` lokal.  
   - Animationen: `framer-motion` (fade-in, parallax).

2. **Berufe (`/professions`):**  
   - Fokus auf Produktionsketten (Mining → Refining → Crafting).  
   - UI: Gridcards, Steps, Statsbalken.  
   - Ergänzen durch Tutorials („So levelst du von 1–50 in 3 Tagen“).

3. **Factions & Wars:**  
   - Entities in Prisma (`Faction`, `FactionWar`).  
   - Live-Stats via Simulation: `updateServerStats` und `generateActiveEvents`.  
   - UI-Banner, War Maps, Territory Overlays.

4. **Events & Dispatch:**  
   - `generateActiveEvents` schreibt JSON in `simulationConfig`.  
   - Frontend liest via SWR/React Query, rendert Event Cards + Countdown.  
   - Dispatch Streams (Video + Chat) im Event-Lounge Channel.

### 3.4 Economy, Casino, Auktionshaus

1. **Currencies:**  
   - Eldruns (Primärwährung), Gold, Silber, Drachenmünzen.  
   - Visualisierung in `GameFeaturesGrid`, `Trading`, `Casino`.  
   - Jede Währung hat `icon.svg`; Währungswechsel nur serverseitig via Prisma Transactions.

2. **Auktionshaus:**  
   - `src/app/shop/auction/page.tsx`.  
   - Filter, Sortierung, Activity Feed.  
   - Backend: `AuctionListing`, `AuctionBid` Models.  
   - Tutorials sollten erklären, wie man Listings erstellt, auto-bid nutzt, scams vermeidet.

3. **Casino:**  
   - Roulette/Crash Simulation (UI).  
   - VIP Channel (invite-only) spiegelt Highroller Activity.  
   - Gift Log + Transparenzpflicht (Seed Messages).

### 3.5 Simulation & Seeder

1. **Start Script (`scripts/simulation/start.ts`):**  
   - Prüft ENV (nur Dev/Staging).  
   - Synct Demo Channels → DB, seed Intro Messages.  
   - Generiert Heatmap Events, Chat Messages (jetzt über alle Kanäle!), Server Stats, Active Events.  
   - Periodische Ticks via `setInterval`.  
   - Shutdown Hooks (SIGINT/SIGTERM) setzen `simulation_active=false`.

2. **Reset Script:**  
   - `pnpm sim:reset --force` entfernt simulierte Daten (ChatMessage.isSimulated).  
   - Achtung: Nur Demo-Daten löschen, niemals echte User-Messages!

3. **Seed Content:**  
   - `pnpm seed:content` füllt CMS, Forum, News.  
   - Alle Seeds eindeutig als Demo markiert, um Live-Daten nicht zu überschreiben.

### 3.6 Sicherheit & Infrastruktur

1. **Auth:**  
   - `src/lib/auth.ts` – `getJwtSecret()`, strikte Secret-Policy.  
   - Demo-Fallbacks nur, wenn `DEMO_MODE=true`.  
   - Admin-Check in API Routes (z. B. Channels POST).

2. **Rate Limiting:**  
   - `middleware.ts` konfiguriert IP-basierte Limits (bypass in Demo/Simulation Mode).  
   - Logging via `SimulationLog` optional.

3. **CSP & Headers:**  
   - `next.config.js` fügt Security Header + CSP Template ein.  
   - Remote Images nur über `NEXT_PUBLIC_IMAGE_HOSTS` Whitelist.

4. **Testing:**  
   - `pnpm lint`, `pnpm test`, `pnpm build`.  
   - Playwright E2E mit Production-Build + `playwright.config.ts` (webServer, Zeitouts).  
   - Bei Frontend-Guides immer erwähnen, wie Tests sicherstellen, dass Layouts nicht regredieren.

---

## 4. Tutorial-Strecken (Beispiele)

### 4.1 „Erstelle einen neuen thematischen Chatraum in 10 Schritten“

1. Brainstorming: Thema, Icon (Emoji oder eigenes SVG), Zielgruppe, Moderationsregeln.  
2. `demoChatChannels.ts` – neuen Datensatz ergänzen inkl. `maxUsers`, `monetizationEnabled`.  
3. Seed Messages schreiben (mindestens 2 aussagekräftige Posts).  
4. Eigene SVG-Assets zeichnen (z. B. `icon_relic.svg`) → Ablage `public/images/icons`.  
5. Simulation resetten und starten, damit DB-Kanal existiert.  
6. Frontend prüfen (`/chat`) – Channel-Liste, Intro-Message, Bot-Aktivität.  
7. Für Live-Betrieb Migration/Seed via Prisma (falls nicht Demo).  
8. Foren-Announcement erstellen, damit Community weiß, wozu der Raum dient.  
9. Moderations-Wordfilter definieren (z. B. Scam-Keywords).  
10. Analytics tracken (MemberCount, MessageCount, ReactionRate) und nachjustieren.

### 4.2 „Kompletter Anfänger-Guide für Spieler:innen“

1. Landing: `/game-guide` studieren (Hero ➜ Quick Links).  
2. Klassen wählen, Berufe verstehen, Fraktionen vergleichen.  
3. Erste 24 Stunden planen: Quests (#1–#5), Base-Building, Ressourcen.  
4. Economy Basics: Eldruns verdienen, Shop verstehen, Event-Loot.  
5. Social: Chat-Knigge, Clan-Suche, Forum-Guides, Discord Hooks.  
6. Sicherheitsregeln (kein Account-Sharing, 2FA falls vorhanden).  
7. FAQ pflegen (Doc erweitern, wenn neue Features launched werden).

### 4.3 „Admins / Moderatoren – Operations Manual“

1. Zugriff: Admin-Accounts mit `role=admin` in Prisma.  
2. Channels pflegen: API Routes testen (`GET/POST /api/chat/channels`).  
3. Simulation überwachen (`pnpm sim:start` Output + `simulation_active`).  
4. Heatmap & Events auswerten: `prisma.heatmapEvent`, `simulationConfig`.  
5. Forum-Moderation: Lock/Unlock, Pinned Threads, Tagging.  
6. Security: Rate Limit Logs, Audit Logs, suspicious Sessions.  
7. Deployment: Git + CI, `.env` Rotationen, Backup-Plan (DB snapshots).

---

## 5. Asset- & Content-Richtlinien

1. **Eigene Assets zuerst:** Icons, Hintergründe, Avatare idealerweise eigenständig gestalten (Vektor-Tool).  
2. **Freie Quellen:** Wenn nötig, CC0/CC-BY Ressourcen nutzen (z. B. `https://www.svgrepo.com`, `https://unsplash.com`). Immer downloaden, in `public/` speichern, ggf. Farbschema anpassen.  
3. **Benennung:** `icon_<thema>.svg`, `background_<szene>.svg`.  
4. **Dokumentation:** Jede neue Grafik in README/Guide erwähnen, damit andere wissen, wo sie herkommt und wofür sie gedacht ist.  
5. **Performance:** SVGs optimieren (SVGO), PNG/JPG vermeiden, wenn Vektor möglich ist.  
6. **Responsiveness testen:** Mobile + Desktop, Light + Dark Themes, High DPI.

---

## 6. Checklisten & QA

### Deployment Checklist
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Prisma Migrations geprüft (`npx prisma migrate status`)
- [ ] ENV Variablen auf Zielsystem gesetzt (Secrets NICHT im Repo!)
- [ ] Simulation-Modus korrekt deaktiviert/aktiviert
- [ ] Assets vorhanden, Pfade kontrolliert
- [ ] Observability aktiv (Logs, Alerts)

### Content Update Checklist
- [ ] Neue Guides im Forum posten + `infiniteContent` aktualisieren
- [ ] Chat Seeds angleichen (Store + Simulation)
- [ ] Screenshots/Icons lokal hinzufügen
- [ ] README/Docs ergänzen (z. B. dieses Mega Guide Kapitel referenzieren)

---

## 7. Wartung, Erweiterungen & Weiterführende Ideen

### 7.1 Regelmäßige Erweiterungen
- **Neue Features:** Nach jedem großen Release Abschnitt 3 aktualisieren (z. B. neues Plugin, zusätzliche Channel-Typen, UI-Redesign). Dabei genau erklären, wie Deploy, Datenmodell und UI zusammenspielen.
- **Screenshots & Visuals:** Für jede größere Änderung frische Screenshots erstellen (Desktop + Mobile, helle + dunkle Themes). Dateien im Ordner `public/docs/` ablegen, im Guide referenzieren und in Pull Requests erwähnen.
- **Übersetzungen:** Abschnitt mit `<!-- i18n:start -->` / `<!-- i18n:end -->` Tags um neue Kapitel legen, damit Lokalisierungstools erkennen, was übersetzt werden muss. Priorisiert Deutsch/Englisch, optional weitere Sprachen.

### 7.2 Interaktive Tutorials & Video-Guides
- **Onboarding Carousel:** Schritt für Schritt Videos/GIFs verlinken (z. B. „Channel anlegen“, „Simulation starten“). Empfohlene Tools: Loom, OBS, Figma Prototyping.
- **Embedded Tutorials:** In relevanten Pages (z. B. `/chat`) eine „Hilfeblase“ integrieren, die direkt auf Abschnitte dieses Guides verlinkt.
- **Video Library:** Playlist mit Screencasts anlegen, jede Episode im Guide verlinken (inkl. kurzer Inhaltsangabe, Dauer, Stand der Software-Version).

### 7.3 Wissens-Hub / Verlinkung
- **README/Knowledge Hub:** Dieser Guide muss prominent im Projekt-README sowie in internen Wikis verlinkt werden, damit jedes Teammitglied weiß, wo die Master-Dokumentation liegt.
- **Changelog-Hinweise:** Bei jedem Release-Note den relevanten Abschnitt aus diesem Guide erwähnen („Siehe Mega-Guide Kapitel 3.4.2“), damit Nutzer:innen automatisch zum Lernmaterial gelangen.
- **Feedback-Loop:** Markdown-Datei offen halten für Pull Requests, in denen Community oder Team Verbesserungen vorschlagen kann; Moderationsteam entscheidet über Merge.
-
- **Interaktive Tutorials (Backlog):** Onboarding Carousel, das neue Spieler durch Klassenwahl + Channel-Vorstellung führt.  
- **Plugin-Dokumentation:** Jede Komponente (z. B. Casino, Auction, Clan Wars) bekommt Unterkapitel mit API Hooks, DB-Tabellen, UI-Varianten.  
- **Video Guides:** Screencasts bereitstellen, wie man das Admin-Panel bedient oder Simulation startet.  
- **Localization:** Alle Texte in DE/EN, Guides in Markdown mit Übersetzungs-Tags.  
- **Automated Docs:** Script, das Channel/Forum Daten aus Prisma zieht und hier updatet.

---

## 8. Aurora Overdrive – Ops Playbook für Version 6.2.x

> **Kontext:** Die Releases „Aurora Cascade“, „Plugin Pulse“ und „Nebula Threading“ (Jan 2025) bilden das Aurora-Overdrive-Paket. Dieser Abschnitt erklärt, wie Design, Telemetrie und Content-Workflows zusammenspielen.

### 8.1 UI Resonanz & Hero-Systeme
1. **Aurora-Parallax aktivieren:**  
   - Assets liegen in `public/aurora/…`. Die Hero-Komponenten (Home, Shop, Forum) besitzen neue Motion-Layer (`AuroraSky`, `SigilGrid`). Beim Hinzufügen weiterer Seiten immer `HeroSection` kopieren und `useAuroraParallax()` Hook nutzen.  
   - Performance-Check: `framer-motion` `layoutScroll` + `IntersectionObserver` deaktivieren, falls Seite extrem lang ist.
2. **Navigation Breadcrumb Pulses:**  
   - Breadcrumb-Komponente (`src/components/navigation/Breadcrumbs.tsx`) akzeptiert jetzt `pulseVariant`. Für neue Seiten Variante definieren (`'sigil' | 'ember' | 'frost'`).  
   - Pulses nutzen CSS Custom Properties (`--pulse-color`, `--pulse-intensity`). Immer pro Route setzen, sonst greift Default (Purpur).
3. **Accessibility Control Deck:**  
   - `ControlDeck` Component im AppShell verlinkt auf Zustand-Slice (`uiAccessibilityStore`). Beim Deploy neue Optionen (z. B. Dyslexia Font) unbedingt im Mega Guide dokumentieren + in Tests (`__tests__/accessibility.spec.ts`) ergänzen.
4. **Loading Skeletons & Scroll Sigils:**  
   - Lore-, Forum- und Guide-Seiten verwenden `SkeletonSigilBlock`. Für zukünftige Seiten Parameter `tone="candlelight"` setzen, damit Aurora-Farbwelt konsistent bleibt.  
   - Scroll-basierte Sigils hängen an `data-sigil-id`. IDs im `sigilRegistry.ts` pflegen, damit Animation & Sound korrekt laden.

### 8.2 Plugin Telemetry & Simulation Pulse
1. **Telemetry Hub verstehen:**  
   - Datenquelle: `useStore.telemetryPulse` + Simulation Hook (`useHeatmapSimulation`). Admin Ansicht ruft `/api/telemetry/plugins` und kombiniert Store-Werte mit Live-Hooks.  
   - Module (WeatherSynth, Bot Chatter, Plugin Telemetry) folgen Interface `TelemetryModule`. Beim Hinzufügen eines Moduls:  
     ```ts
     modules: [
       { id: 'new-plugin', label: 'EldrunAI Relay', status: 'syncing', value: 74, unit: '% sync', trend: 'up' }
     ]
     
