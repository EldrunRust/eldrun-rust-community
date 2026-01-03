import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Eldrun forum demo seeds
export const DEMO_FORUM_USERS: OnlineUser[] = [
  { id: 'u_admin', name: 'AdminSavant', avatar: '/images/avatars/admin-savant.jpg', rank: 'admin', faction: 'neutral', currentLocation: 'Große Halle', lastActivity: new Date(), isInvisible: false },
  { id: 'u_seraph', name: 'SerapharCaptain', avatar: '/images/avatars/seraphar-captain.jpg', rank: 'elite', faction: 'seraphar', currentLocation: 'Ops Briefings', lastActivity: new Date(), isInvisible: false },
  { id: 'u_vorg', name: 'VorgarothShade', avatar: '/images/avatars/vorgaroth-shade.jpg', rank: 'elite', faction: 'vorgaroth', currentLocation: 'War Room', lastActivity: new Date(), isInvisible: false },
  { id: 'u_trade', name: 'TradeBaron', avatar: '/images/avatars/trade-baron.jpg', rank: 'veteran', faction: 'neutral', currentLocation: 'Market Intel', lastActivity: new Date(), isInvisible: false },
  { id: 'u_kyra', name: 'EngineerKyra', avatar: '/images/avatars/engineer-kyra.jpg', rank: 'veteran', faction: 'neutral', currentLocation: 'Forge Lab', lastActivity: new Date(), isInvisible: false },
  { id: 'u_vip_aurora', name: 'AuroraPrime', avatar: '/images/avatars/lucky.jpg', rank: 'legend', faction: 'neutral', currentLocation: 'Casino Lounge', lastActivity: new Date(), isInvisible: false },
  { id: 'u_vip_havel', name: 'HavelMod', avatar: '/images/avatars/admin-savant.jpg', rank: 'moderator', faction: 'neutral', currentLocation: 'Server News', lastActivity: new Date(), isInvisible: false },
  { id: 'u_member_echo', name: 'EchoRunner', avatar: '/images/avatars/newbie.jpg', rank: 'active', faction: 'seraphar', currentLocation: 'Offtopic', lastActivity: new Date(), isInvisible: false },
  { id: 'u_member_onyx', name: 'OnyxShade', avatar: '/images/avatars/vorgaroth-shade.jpg', rank: 'member', faction: 'vorgaroth', currentLocation: 'Diplomatie & Allianzen', lastActivity: new Date(), isInvisible: false },
  { id: 'u_support_mira', name: 'MiraSOS', avatar: '/images/avatars/engineer-kyra.jpg', rank: 'veteran', faction: 'neutral', currentLocation: 'Hilfe & Fragen', lastActivity: new Date(), isInvisible: false },
]

export const DEMO_CATEGORIES: ForumCategory[] = [
  {
    id: 'cat_announcements',
    name: 'Ankündigungen & News',
    description: 'Offizielle Updates, Patch Notes, Server News',
    icon: '📢',
    order: 0,
    boards: [
      { id: 'board_news', categoryId: 'cat_announcements', name: 'Server News', description: 'Offizielle Ankündigungen vom Admin-Team', icon: '📰', order: 1, threadCount: 24, postCount: 380, isPrivate: false, moderators: ['AdminSavant'], factionOnly: null },
      { id: 'board_patches', categoryId: 'cat_announcements', name: 'Patch Notes & Updates', description: 'Alle Änderungen dokumentiert', icon: '📋', order: 2, threadCount: 18, postCount: 290, isPrivate: false, moderators: ['AdminSavant', 'ShadowOps'], factionOnly: null },
      { id: 'board_changelog', categoryId: 'cat_announcements', name: 'Changelog & Roadmap', description: 'Zukunftspläne und Entwicklung', icon: '🗺️', order: 3, threadCount: 12, postCount: 180, isPrivate: false, moderators: ['AdminSavant'], factionOnly: null },
    ],
  },
  {
    id: 'cat_lore',
    name: 'Eldrun Lore & Geschichte',
    description: 'Die Mythen, Legenden und Geschichte von Eldrun',
    icon: '📜',
    order: 1,
    boards: [
      { id: 'board_lore_origins', categoryId: 'cat_lore', name: 'Die Ursprünge', description: 'Die Entstehung von Eldrun und der ewige Konflikt', icon: '🌅', order: 1, threadCount: 28, postCount: 520, isPrivate: false, moderators: ['LoreMaster', 'AdminSavant'], factionOnly: null },
      { id: 'board_lore_factions', categoryId: 'cat_lore', name: 'Fraktionsgeschichte', description: 'Seraphar vs Vorgaroth - Die wahre Geschichte', icon: '⚔️', order: 2, threadCount: 34, postCount: 680, isPrivate: false, moderators: ['SerapharCaptain', 'VorgarothShade'], factionOnly: null },
      { id: 'board_lore_legends', categoryId: 'cat_lore', name: 'Legenden & Helden', description: 'Die größten Krieger von Eldrun', icon: '🏆', order: 3, threadCount: 22, postCount: 410, isPrivate: false, moderators: ['LoreMaster'], factionOnly: null },
      { id: 'board_lore_mysteries', categoryId: 'cat_lore', name: 'Geheimnisse & Mysterien', description: 'Ungelöste Rätsel und verborgene Orte', icon: '🔮', order: 4, threadCount: 19, postCount: 340, isPrivate: false, moderators: ['LoreMaster'], factionOnly: null },
    ],
  },
  {
    id: 'cat_ops',
    name: 'Operative Leitstelle',
    description: 'Briefings, War-Room, Dispatch Calls',
    icon: '🎧',
    order: 2,
    boards: [
      { id: 'board_ops_briefings', categoryId: 'cat_ops', name: 'Briefings & Einsätze', description: 'LiveOps, Warbird-Flüge, Stormwall', icon: '🛰️', order: 1, threadCount: 18, postCount: 240, isPrivate: false, moderators: ['AdminSavant', 'ShadowOps'], factionOnly: null },
      { id: 'board_ops_logs', categoryId: 'cat_ops', name: 'After Action Reports', description: 'AARs, Logs, Telemetrie', icon: '📡', order: 2, threadCount: 9, postCount: 120, isPrivate: false, moderators: ['AdminSavant'], factionOnly: null },
    ],
  },
  {
    id: 'cat_factions',
    name: 'Fraktionen & Strategie',
    description: 'Seraphar vs Vorgaroth, Loyalität, Kriegszüge',
    icon: '⚔️',
    order: 3,
    boards: [
      { id: 'board_seraphar', categoryId: 'cat_factions', name: 'Seraphar Kommando', description: 'Himmelstor, Warbirds, Heil-Buffs', icon: '🪽', order: 1, threadCount: 14, postCount: 180, isPrivate: false, moderators: ['SerapharCaptain'], factionOnly: 'seraphar' },
      { id: 'board_vorgaroth', categoryId: 'cat_factions', name: 'Vorgaroth Kriegsschmiede', description: 'Rituale, Glyphen, Dunkelmagie', icon: '🔥', order: 2, threadCount: 12, postCount: 160, isPrivate: false, moderators: ['VorgarothShade'], factionOnly: 'vorgaroth' },
      { id: 'board_wars', categoryId: 'cat_factions', name: 'War Room', description: 'WarStates, Territory Control, Siege', icon: '🏰', order: 3, threadCount: 11, postCount: 150, isPrivate: false, moderators: ['AdminSavant', 'ShadowOps'], factionOnly: null },
      { id: 'board_diplomacy', categoryId: 'cat_factions', name: 'Diplomatie & Allianzen', description: 'Friedensverhandlungen, temporäre Bündnisse', icon: '🤝', order: 4, threadCount: 8, postCount: 95, isPrivate: false, moderators: ['AdminSavant'], factionOnly: null },
    ],
  },
  {
    id: 'cat_progression',
    name: 'Progression & Builds',
    description: 'Classes, Mechs, Gear, Labs',
    icon: '⚙️',
    order: 4,
    boards: [
      { id: 'board_classes', categoryId: 'cat_progression', name: 'Class Nexus', description: 'Skilltrees, Cooldowns, Mana', icon: '🌌', order: 1, threadCount: 16, postCount: 220, isPrivate: false, moderators: ['MagistraLumen'], factionOnly: null },
      { id: 'board_mechs', categoryId: 'cat_progression', name: 'Forge Lab', description: 'Mech-Builds, Overclock, Logs', icon: '🛠️', order: 2, threadCount: 10, postCount: 140, isPrivate: false, moderators: ['EngineerKyra'], factionOnly: null },
      { id: 'board_economy', categoryId: 'cat_progression', name: 'Market Intel', description: 'Auktionen, Watchlists, Deals', icon: '💱', order: 3, threadCount: 12, postCount: 190, isPrivate: false, moderators: ['TradeBaron', 'GuildBanker'], factionOnly: null },
      { id: 'board_guides', categoryId: 'cat_progression', name: 'Guides & Tutorials', description: 'Anfänger bis Profi - alles erklärt', icon: '📚', order: 4, threadCount: 45, postCount: 890, isPrivate: false, moderators: ['EngineerKyra', 'TradeBaron'], factionOnly: null },
    ],
  },
  {
    id: 'cat_casino',
    name: 'Eldrun Casino',
    description: 'Glücksspiel, Jackpots, Strategien',
    icon: '🎰',
    order: 5,
    boards: [
      { id: 'board_casino_general', categoryId: 'cat_casino', name: 'Casino Lounge', description: 'Allgemeine Diskussionen zum Casino', icon: '🎲', order: 1, threadCount: 38, postCount: 720, isPrivate: false, moderators: ['CasinoMaster'], factionOnly: null },
      { id: 'board_casino_wins', categoryId: 'cat_casino', name: 'Big Wins & Jackpots', description: 'Feiert eure größten Gewinne!', icon: '💰', order: 2, threadCount: 56, postCount: 1240, isPrivate: false, moderators: ['CasinoMaster'], factionOnly: null },
      { id: 'board_casino_strats', categoryId: 'cat_casino', name: 'Strategien & Tipps', description: 'Die besten Casino-Strategien', icon: '🧠', order: 3, threadCount: 24, postCount: 480, isPrivate: false, moderators: ['CasinoMaster', 'TradeBaron'], factionOnly: null },
    ],
  },
  {
    id: 'cat_events',
    name: 'Events & Showcases',
    description: 'Bossrush, Castle Siege, Spotlights',
    icon: '🎇',
    order: 6,
    boards: [
      { id: 'board_events', categoryId: 'cat_events', name: 'Event Constellation', description: 'BossRush, Territory Wars, Timings', icon: '📅', order: 1, threadCount: 13, postCount: 160, isPrivate: false, moderators: ['EventCaster'], factionOnly: null },
      { id: 'board_showcase', categoryId: 'cat_events', name: 'Spotlight & Medien', description: 'Screens, Videos, Recaps', icon: '🎥', order: 2, threadCount: 15, postCount: 210, isPrivate: false, moderators: ['ForumMod'], factionOnly: null },
      { id: 'board_tournaments', categoryId: 'cat_events', name: 'Turniere & Wettkämpfe', description: 'Clan Wars, 1v1 Turniere, Preise', icon: '🏅', order: 3, threadCount: 21, postCount: 380, isPrivate: false, moderators: ['EventCaster', 'AdminSavant'], factionOnly: null },
    ],
  },
  {
    id: 'cat_community',
    name: 'Community',
    description: 'Offtopic, Vorstellungen, Kreatives',
    icon: '👥',
    order: 7,
    boards: [
      { id: 'board_introductions', categoryId: 'cat_community', name: 'Vorstellungen', description: 'Stellt euch der Community vor!', icon: '👋', order: 1, threadCount: 89, postCount: 1450, isPrivate: false, moderators: ['ForumMod'], factionOnly: null },
      { id: 'board_offtopic', categoryId: 'cat_community', name: 'Offtopic', description: 'Alles was nicht zu Eldrun passt', icon: '💬', order: 2, threadCount: 67, postCount: 1890, isPrivate: false, moderators: ['ForumMod'], factionOnly: null },
      { id: 'board_creative', categoryId: 'cat_community', name: 'Kreatives & Fan Art', description: 'Eure Kunstwerke und Geschichten', icon: '🎨', order: 3, threadCount: 34, postCount: 560, isPrivate: false, moderators: ['ForumMod'], factionOnly: null },
      { id: 'board_clans', categoryId: 'cat_community', name: 'Clan Rekrutierung', description: 'Findet euren Clan oder gründet einen', icon: '🏴', order: 4, threadCount: 42, postCount: 680, isPrivate: false, moderators: ['ForumMod', 'AdminSavant'], factionOnly: null },
    ],
  },
  {
    id: 'cat_support',
    name: 'Support & QA',
    description: 'Bugwatch, Helpdesk, Appeals',
    icon: '🛡️',
    order: 8,
    boards: [
      { id: 'board_help', categoryId: 'cat_support', name: 'Hilfe & Fragen', description: 'Neue Spieler, technische Fragen', icon: '❓', order: 1, threadCount: 8, postCount: 90, isPrivate: false, moderators: ['ForumMod'], factionOnly: null },
      { id: 'board_bugwatch', categoryId: 'cat_support', name: 'Bugwatch', description: 'Bugs melden, Rewards kassieren', icon: '🐞', order: 2, threadCount: 9, postCount: 130, isPrivate: false, moderators: ['AdminSavant', 'ShadowOps'], factionOnly: null },
      { id: 'board_suggestions', categoryId: 'cat_support', name: 'Vorschläge & Feedback', description: 'Eure Ideen für Eldrun', icon: '💡', order: 3, threadCount: 56, postCount: 920, isPrivate: false, moderators: ['AdminSavant'], factionOnly: null },
    ],
  },
]

const DEMO_THREADS: ForumThread[] = [
  // === LORE THREADS ===
  {
    id: 't_lore_origins_1',
    boardId: 'board_lore_origins',
    title: '[DISKUSSION] Die Schöpfung von Eldrun - Was geschah vor dem Krieg?',
    slug: 'schoepfung-eldrun-vor-dem-krieg',
    authorId: 'u_loremaster',
    authorName: 'LoreMaster',
    authorAvatar: '/images/avatars/loremaster.jpg',
    authorRank: 'legend',
    authorFaction: 'neutral',
    content: 'Laut den alten Schriften existierte Eldrun lange vor dem Konflikt zwischen Seraphar und Vorgaroth. Die Ältesten sprechen von einer Zeit des Gleichgewichts, als beide Mächte im Einklang waren. Was glaubt ihr - war der Krieg unvermeidlich oder hätte er verhindert werden können?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(),
    status: 'open',
    isPinned: true,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 4820,
    replyCount: 89,
    lastReply: undefined,
    tags: ['lore', 'origins', 'geschichte'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },
  {
    id: 't_lore_factions_1',
    boardId: 'board_lore_factions',
    title: 'Die wahre Natur der Seraphar - Engel oder Tyrannen?',
    slug: 'wahre-natur-seraphar-engel-tyrannen',
    authorId: 'u_vorg',
    authorName: 'VorgarothShade',
    authorAvatar: '/images/avatars/vorgaroth-shade.jpg',
    authorRank: 'elite',
    authorFaction: 'vorgaroth',
    content: 'Die Seraphar präsentieren sich als die "Guten", aber lasst uns die Geschichte genauer betrachten. Wer hat den ersten Schlag geführt? Wer hat die neutralen Völker unterworfen? Die Wahrheit ist komplexer als das Licht, das sie ausstrahlen...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(),
    status: 'open',
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 3420,
    replyCount: 156,
    lastReply: undefined,
    tags: ['seraphar', 'vorgaroth', 'debatte'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },
  {
    id: 't_lore_legends_1',
    boardId: 'board_lore_legends',
    title: '[LEGENDE] Aetherion der Unsterbliche - Der erste Seraphar-König',
    slug: 'aetherion-unsterbliche-erster-seraphar-koenig',
    authorId: 'u_seraph',
    authorName: 'SerapharCaptain',
    authorAvatar: '/images/avatars/seraphar-captain.jpg',
    authorRank: 'elite',
    authorFaction: 'seraphar',
    content: 'Aetherion regierte über 3000 Jahre und führte die Seraphar in ihrer goldenen Ära. Seine Waffe, das Lichtschwert "Dawnbreaker", soll noch immer in der Himmelstor-Zitadelle ruhen. Hat jemand Hinweise auf seinen wahren Verbleib gefunden?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(),
    status: 'open',
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 2890,
    replyCount: 67,
    lastReply: undefined,
    tags: ['legende', 'seraphar', 'aetherion'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },
  {
    id: 't_lore_mysteries_1',
    boardId: 'board_lore_mysteries',
    title: '[GEHEIMNIS] Die verborgene Kammer unter dem Schlachtfeld',
    slug: 'verborgene-kammer-unter-schlachtfeld',
    authorId: 'u_kyra',
    authorName: 'EngineerKyra',
    authorAvatar: '/images/avatars/engineer-kyra.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Bei meinen Ausgrabungen habe ich eine versiegelte Tür gefunden. Die Runen darauf sind weder Seraphar noch Vorgaroth... sie scheinen älter zu sein. Hat jemand ähnliche Entdeckungen gemacht? Ich glaube, wir kratzen nur an der Oberfläche von Eldruns Geschichte.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(),
    status: 'open',
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 1980,
    replyCount: 43,
    lastReply: undefined,
    tags: ['mysterium', 'entdeckung', 'ruinen'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },

  // === OPS THREADS ===
  {
    id: 't_ops_1',
    boardId: 'board_ops_briefings',
    title: '[LIVE] Stormwall Öffnung + Warbird Staffel Delta',
    slug: 'stormwall-oeffnung-warbird-delta',
    authorId: 'u_admin',
    authorName: 'AdminSavant',
    authorAvatar: '/images/avatars/admin-savant.jpg',
    authorRank: 'admin',
    authorFaction: 'neutral',
    content: 'Stormwall öffnet in 12 Minuten. Delta Staffel übernimmt Luftsperre, Bodencrew sammelt bei Ghost Dock. Bitte Telemetrie posten.',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'open',
    isPinned: true,
    isLocked: false,
    isAnnouncement: true,
    viewCount: 1820,
    replyCount: 12,
    lastReply: undefined,
    tags: ['dispatch', 'stormwall'],
    poll: undefined,
    reactions: [],
    subscribers: ['u_seraph', 'u_vorg', 'u_kyra'],
  },

  // === FACTION THREADS ===
  {
    id: 't_factions_1',
    boardId: 'board_wars',
    title: 'WarState: Himmelstor Citadel – wer hält die Brücke?',
    slug: 'warstate-himmelstor-citadel',
    authorId: 'u_seraph',
    authorName: 'SerapharCaptain',
    authorAvatar: '/images/avatars/seraphar-captain.jpg',
    authorRank: 'elite',
    authorFaction: 'seraphar',
    content: 'Seraphar pushen Nordbrücke. Vorgaroth stackt Glyphen im Osten. Wir brauchen Anti-Magic + Schildknoten. Vorschläge?',
    createdAt: new Date(Date.now() - 1000 * 60 * 25),
    updatedAt: new Date(),
    status: 'open',
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 980,
    replyCount: 9,
    lastReply: undefined,
    tags: ['war', 'factions'],
    poll: undefined,
    reactions: [],
    subscribers: ['u_seraph', 'u_vorg'],
  },
  {
    id: 't_factions_seraphar_1',
    boardId: 'board_seraphar',
    title: '[STRATEGIE] Die Warbird-Formationen für den nächsten Großangriff',
    slug: 'warbird-formationen-grossangriff',
    authorId: 'u_seraph',
    authorName: 'SerapharCaptain',
    authorAvatar: '/images/avatars/seraphar-captain.jpg',
    authorRank: 'elite',
    authorFaction: 'seraphar',
    content: 'Brüder und Schwestern des Lichts, wir planen den entscheidenden Schlag gegen die Vorgaroth-Festung. Ich schlage die "Phoenix Formation" vor - 3 Heiler hinten, 5 DPS in V-Form, 2 Tanks an den Flanken. Diskutiert!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    updatedAt: new Date(),
    status: 'open',
    isPinned: true,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 2340,
    replyCount: 78,
    lastReply: undefined,
    tags: ['strategie', 'warbirds', 'seraphar'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },
  {
    id: 't_factions_vorgaroth_1',
    boardId: 'board_vorgaroth',
    title: '[RITUAL] Das Dunkelmond-Ritual - Maximale Glyphen-Effizienz',
    slug: 'dunkelmond-ritual-glyphen-effizienz',
    authorId: 'u_vorg',
    authorName: 'VorgarothShade',
    authorAvatar: '/images/avatars/vorgaroth-shade.jpg',
    authorRank: 'elite',
    authorFaction: 'vorgaroth',
    content: 'Das Dunkelmond-Ritual erhöht unsere Glyphen-Kraft um 40% für 2 Stunden. Ich habe die optimale Reihenfolge der Beschwörungen dokumentiert. Wer am Samstag um 22:00 dabei sein will, meldet sich hier.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    updatedAt: new Date(),
    status: 'open',
    isPinned: true,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 1890,
    replyCount: 45,
    lastReply: undefined,
    tags: ['ritual', 'glyphen', 'vorgaroth'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },

  // === CASINO THREADS ===
  {
    id: 't_casino_1',
    boardId: 'board_casino_wins',
    title: '🎰 MEGA JACKPOT! 2.3 MILLIONEN COINS IM CRASH!!!',
    slug: 'mega-jackpot-2-3-millionen-crash',
    authorId: 'u_lucky',
    authorName: 'LuckyLuke777',
    authorAvatar: '/images/avatars/lucky.jpg',
    authorRank: 'member',
    authorFaction: 'neutral',
    content: 'ICH KANN ES NICHT GLAUBEN!!! Hab bei 1.5x eingezahlt und der Multiplikator ist auf 147x gestiegen! 2.347.890 Coins Gewinn! Das ist der größte Win den ich je hatte! Screenshot im Anhang 🚀🚀🚀',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    updatedAt: new Date(),
    status: 'open',
    isPinned: true,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 8920,
    replyCount: 234,
    lastReply: undefined,
    tags: ['jackpot', 'crash', 'bigwin'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },
  {
    id: 't_casino_strat_1',
    boardId: 'board_casino_strats',
    title: '[GUIDE] Die Martingale-Strategie bei Coinflip - Funktioniert sie?',
    slug: 'martingale-strategie-coinflip-analyse',
    authorId: 'u_trade',
    authorName: 'TradeBaron',
    authorAvatar: '/images/avatars/trade-baron.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Ich habe 1000 Coinflip-Runden mit der Martingale-Strategie analysiert. Kurze Antwort: Auf lange Sicht verliert man. Aber es gibt einen Sweet Spot... Hier meine detaillierte Analyse mit Wahrscheinlichkeitsrechnungen.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(),
    status: 'open',
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 3450,
    replyCount: 89,
    lastReply: undefined,
    tags: ['strategie', 'coinflip', 'analyse'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },

  // === MARKET THREADS ===
  {
    id: 't_market_1',
    boardId: 'board_economy',
    title: 'Runenstahl Index +35 % – wer hat Sell Orders?',
    slug: 'runenstahl-index-35',
    authorId: 'u_trade',
    authorName: 'TradeBaron',
    authorAvatar: '/images/avatars/trade-baron.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Watchlist meldet 35 % Spike. Suche 500 Runenstahl, zahle +12 % über Markt. Drop Standorte & Zeiten!',
    createdAt: new Date(Date.now() - 1000 * 60 * 50),
    updatedAt: new Date(),
    status: 'open',
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 620,
    replyCount: 7,
    lastReply: undefined,
    tags: ['economy', 'trade'],
    poll: undefined,
    reactions: [],
    subscribers: ['u_trade', 'u_admin'],
  },

  // === GUIDE THREADS ===
  {
    id: 't_guide_newbie_1',
    boardId: 'board_guides',
    title: '[MEGA-GUIDE] Eldrun für Anfänger - Alles was du wissen musst!',
    slug: 'mega-guide-eldrun-anfaenger-alles-wissen',
    authorId: 'u_kyra',
    authorName: 'EngineerKyra',
    authorAvatar: '/images/avatars/engineer-kyra.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Willkommen in Eldrun! Dieser Guide deckt alles ab: Fraktionswahl, erste Schritte, Base-Building, PvP-Grundlagen, Economy-System und mehr. Bookmarkt diesen Thread - er wird regelmäßig aktualisiert!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    updatedAt: new Date(),
    status: 'open',
    isPinned: true,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 24500,
    replyCount: 456,
    lastReply: undefined,
    tags: ['guide', 'anfänger', 'tutorial'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },

  // === EVENT THREADS ===
  {
    id: 't_events_1',
    boardId: 'board_events',
    title: '[Bossrush] Forest Guardian – DPS/Healer Logs',
    slug: 'bossrush-forest-guardian-logs',
    authorId: 'u_kyra',
    authorName: 'EngineerKyra',
    authorAvatar: '/images/avatars/engineer-kyra.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Bitte Logs hochladen: DPS Peaks, Healer Outputs, Mechanic Fails. Cascade Array Buff -15 % Cooldown ist live.',
    createdAt: new Date(Date.now() - 1000 * 60 * 70),
    updatedAt: new Date(),
    status: 'open',
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 440,
    replyCount: 5,
    lastReply: undefined,
    tags: ['bossrush', 'pve'],
    poll: undefined,
    reactions: [],
    subscribers: ['u_kyra', 'u_admin'],
  },
  {
    id: 't_tournament_1',
    boardId: 'board_tournaments',
    title: '[TURNIER] Großes Clan-Turnier - 500.000 Coins Preisgeld!',
    slug: 'grosses-clan-turnier-500000-coins',
    authorId: 'u_admin',
    authorName: 'AdminSavant',
    authorAvatar: '/images/avatars/admin-savant.jpg',
    authorRank: 'admin',
    authorFaction: 'neutral',
    content: 'Das monatliche Clan-Turnier steht an! 5v5 Format, Double Elimination. Anmeldeschluss: Freitag 18:00 Uhr. Meldet eure Teams hier an!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(),
    status: 'open',
    isPinned: true,
    isLocked: false,
    isAnnouncement: true,
    viewCount: 5670,
    replyCount: 123,
    lastReply: undefined,
    tags: ['turnier', 'clan', 'preisgeld'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },

  // === COMMUNITY THREADS ===
  {
    id: 't_intro_1',
    boardId: 'board_introductions',
    title: 'Neu hier! 500h Rust-Erfahrung, suche Clan',
    slug: 'neu-hier-500h-rust-erfahrung-suche-clan',
    authorId: 'u_newbie',
    authorName: 'RustVeteran2024',
    authorAvatar: '/images/avatars/newbie.jpg',
    authorRank: 'newcomer',
    authorFaction: 'neutral',
    content: 'Hey Leute! Bin neu auf Eldrun aber hab 500h+ in Vanilla Rust. Der Server hier ist der Wahnsinn - die Fraktionen, das Lore, alles! Suche einen aktiven Clan, bin 25 Jahre alt und hab Zeit am Abend. Würde mich über Tipps freuen!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    updatedAt: new Date(),
    status: 'open',
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 345,
    replyCount: 28,
    lastReply: undefined,
    tags: ['vorstellung', 'clansuche'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },
  {
    id: 't_clan_recruit_1',
    boardId: 'board_clans',
    title: '[SERAPHAR] ⚔️ Die Lichtwächter suchen Verstärkung!',
    slug: 'seraphar-lichtwaechter-suchen-verstaerkung',
    authorId: 'u_seraph',
    authorName: 'SerapharCaptain',
    authorAvatar: '/images/avatars/seraphar-captain.jpg',
    authorRank: 'elite',
    authorFaction: 'seraphar',
    content: 'Die Lichtwächter sind einer der ältesten Seraphar-Clans auf Eldrun. Wir suchen: 2x Tank, 3x Heiler, 5x DPS. Anforderungen: Min. Level 30, aktiv mind. 3 Abende/Woche, Discord Pflicht. Bewerbungen als Antwort!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(),
    status: 'open',
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 1890,
    replyCount: 67,
    lastReply: undefined,
    tags: ['clan', 'rekrutierung', 'seraphar'],
    poll: undefined,
    reactions: [],
    subscribers: [],
  },

  // === EXPANDED COMMUNITY & SUPPORT THREADS ===
  {
    id: 't_offtopic_fun_1',
    boardId: 'board_offtopic',
    title: '[FUN] Eldrun Meme Parade – Woche 12 & Community Recap',
    slug: 'eldrun-meme-parade-woche-12',
    authorId: 'u_member_echo',
    authorName: 'EchoRunner',
    authorAvatar: '/images/avatars/newbie.jpg',
    authorRank: 'active',
    authorFaction: 'seraphar',
    content: 'Wir sammeln wieder die besten Memes der Woche! Thema: „Wenn Stormwall aufmacht und du noch im Casino stehst“. Postet eure Bilder, GIFs und Kurzgeschichten. Die Parade läuft seit 12 Wochen, also gerne auch Throwbacks posten!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21),
    updatedAt: new Date(),
    status: 'open',
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 5021,
    replyCount: 312,
    lastReply: undefined,
    tags: ['fun', 'community', 'memes'],
    poll: undefined,
    reactions: [],
    subscribers: ['u_member_echo', 'u_member_onyx', 'u_vip_aurora'],
  },
  {
    id: 't_support_help_1',
    boardId: 'board_help',
    title: '[GUIDE] Sammelthread „Meine erste Woche auf Eldrun“ – Q&A',
    slug: 'erste-woche-eldrun-qa',
    authorId: 'u_support_mira',
    authorName: 'MiraSOS',
    authorAvatar: '/images/avatars/engineer-kyra.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Hier sammeln wir Fragen & Antworten von neuen Spieler:innen. Ich aktualisiere den Startpost jede Woche mit den Top-Fragen der letzten Tage, inklusive Links zu Guides und Videos.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date(),
    status: 'open',
    isPinned: true,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 4120,
    replyCount: 154,
    lastReply: undefined,
    tags: ['hilfe', 'anfänger', 'faq'],
    poll: undefined,
    reactions: [],
    subscribers: ['u_support_mira', 'u_admin'],
  },
  {
    id: 't_casino_vip_1',
    boardId: 'board_casino_general',
    title: '[VIP Dispatch] AuroraPrime berichtet – Highroller Wochenreview',
    slug: 'vip-dispatch-auroraprime-wochenreview',
    authorId: 'u_vip_aurora',
    authorName: 'AuroraPrime',
    authorAvatar: '/images/avatars/lucky.jpg',
    authorRank: 'legend',
    authorFaction: 'neutral',
    content: 'VIP Lounge Report KW48: Coinflip Ladder eskaliert, Crash Peak 212x, Eldrun Gift Storm im Highroller Channel. Ich teile Insights, Top-Logs und Tipps für verantwortungsvolles Gambling.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    updatedAt: new Date(),
    status: 'open',
    isPinned: true,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 3780,
    replyCount: 96,
    lastReply: undefined,
    tags: ['vip', 'casino', 'review'],
    poll: undefined,
    reactions: [],
    subscribers: ['u_vip_aurora', 'u_trade'],
  },
  {
    id: 't_guides_translation_1',
    boardId: 'board_guides',
    title: '[Projekt] Übersetzungs-Offensive – EN/DE Guides synchronisieren',
    slug: 'uebersetzungs-offensive-guides',
    authorId: 'u_vip_havel',
    authorName: 'HavelMod',
    authorAvatar: '/images/avatars/admin-savant.jpg',
    authorRank: 'moderator',
    authorFaction: 'neutral',
    content: 'Wir bringen alle wichtigen Guides zweisprachig online. Jede Woche fokus auf ein Thema (Klassen, Economy, Events). Meldet euch, wenn ihr Texte oder Screenshots beisteuern wollt.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28),
    updatedAt: new Date(),
    status: 'open',
    isPinned: true,
    isLocked: false,
    isAnnouncement: true,
    viewCount: 6100,
    replyCount: 188,
    lastReply: undefined,
    tags: ['guide', 'translation', 'community'],
    poll: undefined,
    reactions: [],
    subscribers: ['u_vip_havel', 'u_support_mira', 'u_admin'],
  },
  {
    id: 't_changelog_discussion_1',
    boardId: 'board_changelog',
    title: '[ROADMAP] Eldrun Q1+Q2 – Bitte Feedback zu Feature Waves!',
    slug: 'eldrun-roadmap-q1-q2-feedback',
    authorId: 'u_admin',
    authorName: 'AdminSavant',
    authorAvatar: '/images/avatars/admin-savant.jpg',
    authorRank: 'admin',
    authorFaction: 'neutral',
    content: 'Hier liegt die Roadmap für die nächsten zwei Quartale. Jede Woche gehe ich auf Fragen ein und dokumentiere Entscheidungen. Bitte sortiert euer Feedback nach Welle / Feature.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    updatedAt: new Date(),
    status: 'open',
    isPinned: true,
    isLocked: false,
    isAnnouncement: true,
    viewCount: 8450,
    replyCount: 402,
    lastReply: undefined,
    tags: ['roadmap', 'ankündigung', 'feedback'],
    poll: undefined,
    reactions: [],
    subscribers: ['u_admin', 'u_vip_havel', 'u_trade'],
  },
  {
    id: 't_suggestions_lab_1',
    boardId: 'board_suggestions',
    title: '[IDEENLABOR] Community Pitch „Wöchentliche Faction Contracts“',
    slug: 'ideenlabor-faction-contracts',
    authorId: 'u_member_onyx',
    authorName: 'OnyxShade',
    authorAvatar: '/images/avatars/vorgaroth-shade.jpg',
    authorRank: 'member',
    authorFaction: 'vorgaroth',
    content: 'Vorschlag: Jede Woche drei Contracts pro Fraktion mit unterschiedlichen Boni. Ich sammle hier Pros/Cons, Ökonomie-Auswirkungen und UI-Ideen. Bitte konstruktiv bleiben!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
    updatedAt: new Date(),
    status: 'open',
    isPinned: false,
    isLocked: false,
    isAnnouncement: false,
    viewCount: 2680,
    replyCount: 132,
    lastReply: undefined,
    tags: ['vorschlag', 'faction', 'economy'],
    poll: undefined,
    reactions: [],
    subscribers: ['u_member_onyx', 'u_seraph', 'u_vorg'],
  },
]

const DEMO_POSTS: ForumPost[] = [
  // === LORE DISCUSSION POSTS ===
  {
    id: 'p_lore_1',
    threadId: 't_lore_origins_1',
    authorId: 'u_seraph',
    authorName: 'SerapharCaptain',
    authorAvatar: '/images/avatars/seraphar-captain.jpg',
    authorRank: 'elite',
    authorFaction: 'seraphar',
    content: 'Die Seraphar-Chroniken sprechen von der "Zeit der Einheit". Unsere Vorfahren und die Vorgaroth waren einst Brüder. Der Bruch kam, als Malzaroth die verbotenen Glyphen entdeckte und damit das Gleichgewicht störte. Der Krieg war IHRE Schuld.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_lore_2',
    threadId: 't_lore_origins_1',
    authorId: 'u_vorg',
    authorName: 'VorgarothShade',
    authorAvatar: '/images/avatars/vorgaroth-shade.jpg',
    authorRank: 'elite',
    authorFaction: 'vorgaroth',
    content: '@SerapharCaptain Typische Seraphar-Propaganda! Die "verbotenen Glyphen" waren uraltes Wissen, das die Seraphar unterdrücken wollten. Malzaroth hat nur die Wahrheit ans Licht gebracht. Eure "Einheit" war eine Diktatur des Lichts!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 30),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_lore_3',
    threadId: 't_lore_origins_1',
    authorId: 'u_loremaster',
    authorName: 'LoreMaster',
    authorAvatar: '/images/avatars/loremaster.jpg',
    authorRank: 'legend',
    authorFaction: 'neutral',
    content: 'Interessant, wie sich beide Seiten die Geschichte zurechtlegen. Die ältesten Texte, die ich gefunden habe, sprechen von einer DRITTEN Macht - den "Erbauern". Weder Seraphar noch Vorgaroth. Hat jemand von ihnen gehört?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_lore_4',
    threadId: 't_lore_origins_1',
    authorId: 'u_kyra',
    authorName: 'EngineerKyra',
    authorAvatar: '/images/avatars/engineer-kyra.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: '@LoreMaster Die Erbauer! Ja! Ich habe in den Ruinen Artefakte gefunden, die definitiv nicht von unseren Fraktionen stammen. Die Technologie ist... anders. Fortschrittlicher vielleicht? Wir sollten uns austauschen.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },

  // === FACTION DEBATE POSTS ===
  {
    id: 'p_faction_debate_1',
    threadId: 't_lore_factions_1',
    authorId: 'u_seraph',
    authorName: 'SerapharCaptain',
    authorAvatar: '/images/avatars/seraphar-captain.jpg',
    authorRank: 'elite',
    authorFaction: 'seraphar',
    content: 'Wieder diese Vorgaroth-Lügen! Die Seraphar haben NIEMALS neutrale Völker unterworfen. Wir haben sie BESCHÜTZT vor der Dunkelheit, die ihr verbreitet habt. Die Geschichte ist eindeutig - eure Rituale haben Dörfer zerstört!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_faction_debate_2',
    threadId: 't_lore_factions_1',
    authorId: 'u_trade',
    authorName: 'TradeBaron',
    authorAvatar: '/images/avatars/trade-baron.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Als Neutraler sage ich: Beide Seiten haben Dreck am Stecken. Ich habe Handelsdokumente aus der Vorkriegszeit - beide Fraktionen haben die Neutralen ausgebeutet. Der Unterschied? Die Seraphar taten es mit einem Lächeln.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 45),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 45),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_faction_debate_3',
    threadId: 't_lore_factions_1',
    authorId: 'u_vorg',
    authorName: 'VorgarothShade',
    authorAvatar: '/images/avatars/vorgaroth-shade.jpg',
    authorRank: 'elite',
    authorFaction: 'vorgaroth',
    content: '@TradeBaron Danke für die Ehrlichkeit. Wenigstens einer, der die Wahrheit sieht. Die Seraphar schreiben die Geschichte um, aber die Dokumente lügen nicht. Unsere Rituale haben nur auf ihre Aggression REAGIERT.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },

  // === CASINO POSTS ===
  {
    id: 'p_casino_1',
    threadId: 't_casino_1',
    authorId: 'u_trade',
    authorName: 'TradeBaron',
    authorAvatar: '/images/avatars/trade-baron.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'HOLY SHIT! 2.3 Millionen?! Das ist der zweitgrößte Win in der Geschichte von Eldrun Casino! GG dude! Was machst du mit dem Geld? 🎉',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_casino_2',
    threadId: 't_casino_1',
    authorId: 'u_lucky',
    authorName: 'LuckyLuke777',
    authorAvatar: '/images/avatars/lucky.jpg',
    authorRank: 'member',
    authorFaction: 'neutral',
    content: '@TradeBaron Erstmal VIP kaufen! Dann investiere ich den Rest in Runenstahl - hab gehört der Preis steigt bald. Und natürlich ein bisschen zurück ins Casino... man muss ja sein Glück nutzen 😎',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_casino_3',
    threadId: 't_casino_1',
    authorId: 'u_admin',
    authorName: 'AdminSavant',
    authorAvatar: '/images/avatars/admin-savant.jpg',
    authorRank: 'admin',
    authorFaction: 'neutral',
    content: 'Offiziell bestätigt! Dies ist der 3. größte Jackpot in der Eldrun Geschichte. Glückwunsch @LuckyLuke777! Der Win wurde verifiziert und ist 100% legitim. 🏆',
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },

  // === OPS POSTS ===
  {
    id: 'p_ops_1',
    threadId: 't_ops_1',
    authorId: 'u_seraph',
    authorName: 'SerapharCaptain',
    authorAvatar: '/images/avatars/seraphar-captain.jpg',
    authorRank: 'elite',
    authorFaction: 'seraphar',
    content: 'Delta Staffel ready. Wir nehmen Westflanke. Schildknoten stehen bei 60 %. Bitte Heal Bots hinter die Warbirds.',
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_ops_2',
    threadId: 't_ops_1',
    authorId: 'u_vorg',
    authorName: 'VorgarothShade',
    authorAvatar: '/images/avatars/vorgaroth-shade.jpg',
    authorRank: 'elite',
    authorFaction: 'vorgaroth',
    content: 'Glyphen bei 80 %, wir blocken Nord. Anti-Magic reicht nicht, wenn ihr kein Loyalität >50 habt.',
    createdAt: new Date(Date.now() - 1000 * 60 * 6),
    updatedAt: new Date(Date.now() - 1000 * 60 * 6),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },

  // === STRATEGY POSTS ===
  {
    id: 'p_strat_1',
    threadId: 't_factions_seraphar_1',
    authorId: 'u_kyra',
    authorName: 'EngineerKyra',
    authorAvatar: '/images/avatars/engineer-kyra.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Die Phoenix Formation ist solide, aber habt ihr an die Glyphen-Counter gedacht? Die Vorgaroth haben letzte Woche einen neuen Ritual-Build entdeckt, der eure Heiler ausschaltet. Ich würde 1 Disruptor einbauen.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_strat_2',
    threadId: 't_factions_seraphar_1',
    authorId: 'u_seraph',
    authorName: 'SerapharCaptain',
    authorAvatar: '/images/avatars/seraphar-captain.jpg',
    authorRank: 'elite',
    authorFaction: 'seraphar',
    content: '@EngineerKyra Guter Punkt! Wir tauschen einen DPS gegen einen Disruptor. Die neue Formation wäre dann: 3 Heiler, 1 Disruptor, 4 DPS, 2 Tanks. Wer hat Erfahrung als Disruptor?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },

  // === MARKET POSTS ===
  {
    id: 'p_market_1',
    threadId: 't_market_1',
    authorId: 'u_trade',
    authorName: 'TradeBaron',
    authorAvatar: '/images/avatars/trade-baron.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Biete 15 % Aufpreis, hole per Gildenbot ab. Watchlist Limit 10 – VIP Slots nötig.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },

  // === EVENTS POSTS ===
  {
    id: 'p_events_1',
    threadId: 't_events_1',
    authorId: 'u_kyra',
    authorName: 'EngineerKyra',
    authorAvatar: '/images/avatars/engineer-kyra.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Log: DPS Peak 2.4m, Heals 1.1m, Mechanic Fails: 3x Rootbeam. Bitte Add-Control früher.',
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },

  // === INTRODUCTION POSTS ===
  {
    id: 'p_intro_1',
    threadId: 't_intro_1',
    authorId: 'u_seraph',
    authorName: 'SerapharCaptain',
    authorAvatar: '/images/avatars/seraphar-captain.jpg',
    authorRank: 'elite',
    authorFaction: 'seraphar',
    content: 'Willkommen auf Eldrun! Mit 500h Erfahrung bist du definitiv kein Anfänger. Wenn du dich für die Seraphar interessierst, schau dir unseren Clan "Lichtwächter" an - wir suchen gerade aktive Spieler!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_intro_2',
    threadId: 't_intro_1',
    authorId: 'u_vorg',
    authorName: 'VorgarothShade',
    authorAvatar: '/images/avatars/vorgaroth-shade.jpg',
    authorRank: 'elite',
    authorFaction: 'vorgaroth',
    content: 'Lass dich nicht von den Lichtträgern blenden! 😈 Vorgaroth bietet echte Macht. Unsere Glyphen-Builds sind unschlagbar im PvP. Wenn du wirklich dominieren willst, weißt du wo du uns findest.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_intro_3',
    threadId: 't_intro_1',
    authorId: 'u_kyra',
    authorName: 'EngineerKyra',
    authorAvatar: '/images/avatars/engineer-kyra.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Pro-Tipp: Schau dir erstmal beide Fraktionen an, bevor du dich entscheidest. Die Wahl ist permanent und beeinflusst dein gesamtes Gameplay. Im Forum gibt es einen super Vergleichs-Guide!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: true,
    isHidden: false,
  },
  {
    id: 'p_fun_meme_1',
    threadId: 't_offtopic_fun_1',
    authorId: 'u_member_onyx',
    authorName: 'OnyxShade',
    authorAvatar: '/images/avatars/vorgaroth-shade.jpg',
    authorRank: 'member',
    authorFaction: 'vorgaroth',
    content: 'Throwback Meme: „Wenn du Raid planst aber Stormwall RNG dich erwischt“ – siehe Bild (Link). 😂',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    isEdited: false,
    reactions: [],
    attachments: [{ id: 'att_meme_1', fileName: 'stormwall-meme.png', fileSize: 352000, fileType: 'image/png', url: '/images/forum/stormwall-meme.png' }],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_fun_meme_2',
    threadId: 't_offtopic_fun_1',
    authorId: 'u_vip_aurora',
    authorName: 'AuroraPrime',
    authorAvatar: '/images/avatars/lucky.jpg',
    authorRank: 'legend',
    authorFaction: 'neutral',
    content: 'Ich hab ein GIF aus dem VIP-Lounge Stream geschnitten, wie jemand Crash offen lässt während Stormwall startet. 10/10 Meme Material!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    isEdited: false,
    reactions: [],
    attachments: [{ id: 'att_meme_2', fileName: 'vip-crash.gif', fileSize: 780000, fileType: 'image/gif', url: '/images/forum/vip-crash.gif' }],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_support_help_1',
    threadId: 't_support_help_1',
    authorId: 'u_newbie',
    authorName: 'RustVeteran2024',
    authorAvatar: '/images/avatars/newbie.jpg',
    authorRank: 'newcomer',
    authorFaction: 'neutral',
    content: 'Gibt es eine Übersicht, welche Quests man in den ersten 7 Tagen schaffen sollte? Ich verliere etwas den Überblick.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_support_help_2',
    threadId: 't_support_help_1',
    authorId: 'u_support_mira',
    authorName: 'MiraSOS',
    authorAvatar: '/images/avatars/engineer-kyra.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Gute Frage! Ich habe im Startpost Abschnitt 3 erweitert: „7-Tage Quest Plan“. Zusätzlich Link zum Mega Guide Kapitel 4.2.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    isEdited: true,
    reactions: [],
    attachments: [],
    isBestAnswer: true,
    isHidden: false,
  },
  {
    id: 'p_support_help_3',
    threadId: 't_support_help_1',
    authorId: 'u_vip_havel',
    authorName: 'HavelMod',
    authorAvatar: '/images/avatars/admin-savant.jpg',
    authorRank: 'moderator',
    authorFaction: 'neutral',
    content: 'Ich ergänze das Ganze mit einem englischen PDF. Wer Lust hat zu übersetzen: meldet euch im Übersetzungs-Thread!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_vip_report_1',
    threadId: 't_casino_vip_1',
    authorId: 'u_vip_aurora',
    authorName: 'AuroraPrime',
    authorAvatar: '/images/avatars/lucky.jpg',
    authorRank: 'legend',
    authorFaction: 'neutral',
    content: 'Review KW48: Coinflip Ladder Stats + Top 5 Highroller Clips (siehe Video). Bitte verantwortungsvoll spielen!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13),
    isEdited: false,
    reactions: [],
    attachments: [{ id: 'att_vip_video', fileName: 'vip-review.mp4', fileSize: 3024000, fileType: 'video/mp4', url: '/videos/forum/vip-review.mp4' }],
    isBestAnswer: false,
    isHidden: false,
  },
  {
    id: 'p_vip_report_2',
    threadId: 't_casino_vip_1',
    authorId: 'u_trade',
    authorName: 'TradeBaron',
    authorAvatar: '/images/avatars/trade-baron.jpg',
    authorRank: 'veteran',
    authorFaction: 'neutral',
    content: 'Danke Aurora! Kannst du in KW49 bitte einen Abschnitt zu Risikomanagement einbauen? Wir merken vermehrt Beschwerden.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11),
    isEdited: false,
    reactions: [],
    attachments: [],
    isBestAnswer: false,
    isHidden: false,
  },
]

const FORUM_BOT_LINES = [
  'Warroom: Ghost Dock Marker verschoben, checkt die neue Route!',
  'Economy: Runenstahl Bid-Gap schließt sich, stellt eure Sell Orders jetzt.',
  'QA: /bug logcode nicht vergessen, sonst keine Belohnung.',
  'Ops: Phantomrüstung buff aktiv – +12% Resist für Warbirds.',
  'Events: Bossrush Scoreboard patched, bitte neue Logs posten.',
  'Factions: Loyalität <50% = Schildschwund, erst Fraktionsquests machen.',
  'Classes: Necro Lifesteal wurde genervt, testet Mana-Regen.',
  'Forge Lab: Cascade Array Overclock +15%, teilt eure Builds.',
]

// Extended shoutbox bot messages
const SHOUTBOX_BOT_MESSAGES = [
  { user: 'AdminSavant', faction: 'neutral', rank: 'admin' as const, messages: [
    '🔔 Server läuft stabil - 245 FPS! Gute Jagd!',
    '⚠️ Wipe in 3 Tagen - plant eure Raids!',
    '🎯 Anti-Cheat Update live - 12 Bans heute',
    '📢 Neues Event morgen 20:00 - Faction War!'
  ]},
  { user: 'SerapharCaptain', faction: 'seraphar', rank: 'elite' as const, messages: [
    '⚔️ Seraphar sammelt bei Launch Site!',
    '🛡️ Wer hat Scrap für Turrets? PM!',
    '🎖️ GG an Vorgaroth für den Fight!',
    '📍 Neue Base Coords im Discord!'
  ]},
  { user: 'VorgarothShade', faction: 'vorgaroth', rank: 'elite' as const, messages: [
    '🔥 Vorgaroth dominiert Oil Rig!',
    '💀 Wer traut sich zu raiden? 😈',
    '⚡ Glyphen-Ritual um 22:00!',
    '🏴 Vorgaroth > Seraphar, easy'
  ]},
  { user: 'TradeBaron', faction: 'neutral', rank: 'veteran' as const, messages: [
    '💰 Verkaufe 5k Sulfur - faire Preise!',
    '📈 Runenstahl Preis steigt wieder...',
    '🤝 Suche Trading Partner für Raids',
    '💎 Rare Skins im Shop - checkt aus!'
  ]},
  { user: 'EngineerKyra', faction: 'neutral', rank: 'veteran' as const, messages: [
    '⚙️ Base Designs im Forum updatet!',
    '🔧 Wer braucht Hilfe mit Electricity?',
    '📊 Neue Raid Calculator Version online',
    '🏗️ Bunker Tutorials sind live!'
  ]},
  { user: 'NightRaider', faction: 'vorgaroth', rank: 'member' as const, messages: [
    '🌙 Online Raid um 23:00?',
    '💣 C4 ready, wer kommt mit?',
    '😤 Wurde gerade geraided... revenge time',
    '🎮 Stream läuft - twitch.tv/nightraider'
  ]},
  { user: 'PeacefulFarmer', faction: 'seraphar', rank: 'member' as const, messages: [
    '🌾 Farme gerade bei Dome, jemand dabei?',
    '🐴 Suche Pferd! Tausche gegen Scrap',
    '☮️ Warum können wir nicht alle Freunde sein?',
    '🏡 Meine kleine Farm wächst!'
  ]},
  { user: 'RustVeteran', faction: 'seraphar', rank: 'legend' as const, messages: [
    '🏆 5000h Spielzeit erreicht!',
    '📚 Guide für Anfänger im Forum',
    '🎯 Tipps für besseres Aim? Fragt mich!',
    '⭐ Back in the day war alles besser...'
  ]},
]

// Initial shoutbox messages
const DEMO_SHOUTBOX_MESSAGES: ShoutboxMessage[] = [
  { id: 'sb_1', authorId: 'u_admin', authorName: 'AdminSavant', authorRank: 'admin', authorFaction: 'neutral', content: '🔔 Willkommen im Eldrun Forum! Server Status: ONLINE', timestamp: new Date(Date.now() - 1000 * 60 * 45), reactions: [] },
  { id: 'sb_2', authorId: 'u_seraph', authorName: 'SerapharCaptain', authorRank: 'elite', authorFaction: 'seraphar', content: '⚔️ Seraphar rekrutiert! Bewerbungen im Forum.', timestamp: new Date(Date.now() - 1000 * 60 * 38), reactions: [] },
  { id: 'sb_3', authorId: 'u_vorg', authorName: 'VorgarothShade', authorRank: 'elite', authorFaction: 'vorgaroth', content: '🔥 Vorgaroth Kriegsrat um 20:00!', timestamp: new Date(Date.now() - 1000 * 60 * 30), reactions: [] },
  { id: 'sb_4', authorId: 'u_trade', authorName: 'TradeBaron', authorRank: 'veteran', authorFaction: 'neutral', content: '💰 Verkaufe AK Skins - PM für Preise', timestamp: new Date(Date.now() - 1000 * 60 * 22), reactions: [] },
  { id: 'sb_5', authorId: 'u_kyra', authorName: 'EngineerKyra', authorRank: 'veteran', authorFaction: 'neutral', content: '⚙️ Neue Base-Designs im Forge Lab!', timestamp: new Date(Date.now() - 1000 * 60 * 15), reactions: [] },
  { id: 'sb_6', authorId: 'u_admin', authorName: 'AdminSavant', authorRank: 'admin', authorFaction: 'neutral', content: '📢 Event heute Abend: Faction War bei Military!', timestamp: new Date(Date.now() - 1000 * 60 * 8), reactions: [] },
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Generate a random shoutbox message from bots
function generateShoutboxMessage(): ShoutboxMessage {
  const bot = randomFrom(SHOUTBOX_BOT_MESSAGES)
  const message = randomFrom(bot.messages)
  return {
    id: `sb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    authorId: `u_${bot.user.toLowerCase().replace(/\s/g, '_')}`,
    authorName: bot.user,
    authorRank: bot.rank,
    authorFaction: bot.faction,
    content: message,
    timestamp: new Date(),
    reactions: []
  }
}

// ============================================
// ELDRUN ELITE FORUM - TYPE DEFINITIONS
// ============================================

// User Ranks based on post count and activity
export type UserRank = 
  | 'newcomer'      // 0-10 posts
  | 'member'        // 11-50 posts
  | 'active'        // 51-150 posts
  | 'veteran'       // 151-500 posts
  | 'elite'         // 501-1000 posts
  | 'legend'        // 1000+ posts
  | 'moderator'     // Special role
  | 'admin'         // Special role

export type ThreadStatus = 'open' | 'closed' | 'pinned' | 'announcement' | 'archived'
export type ReactionType = '👍' | '❤️' | '😂' | '😮' | '😢' | '🔥' | '⚔️' | '🏆'

// Forum Category (Top Level)
export interface ForumCategory {
  id: string
  name: string
  description: string
  icon: string
  order: number
  boards: ForumBoard[]
  isCollapsed?: boolean
}

// Forum Board (Sub-category)
export interface ForumBoard {
  id: string
  categoryId: string
  name: string
  description: string
  icon: string
  order: number
  threadCount: number
  postCount: number
  lastPost?: LastPostInfo
  isPrivate: boolean
  requiredRank?: UserRank
  factionOnly?: 'seraphar' | 'vorgaroth' | null
  moderators: string[]
  subBoards?: ForumBoard[]
}

export interface LastPostInfo {
  threadId: string
  threadTitle: string
  authorId: string
  authorName: string
  authorAvatar?: string
  timestamp: Date
}

// Forum Thread
export interface ForumThread {
  id: string
  boardId: string
  title: string
  slug: string
  authorId: string
  authorName: string
  authorAvatar?: string
  authorRank: UserRank
  authorFaction?: string
  content: string
  createdAt: Date
  updatedAt: Date
  status: ThreadStatus
  isPinned: boolean
  isLocked: boolean
  isAnnouncement: boolean
  viewCount: number
  replyCount: number
  lastReply?: LastPostInfo
  tags: string[]
  poll?: ForumPoll
  reactions: ThreadReaction[]
  subscribers: string[]
}

// Forum Post (Reply)
export interface ForumPost {
  id: string
  threadId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  authorRank: UserRank
  authorFaction?: string
  authorSignature?: string
  content: string
  createdAt: Date
  updatedAt: Date
  isEdited: boolean
  editReason?: string
  replyToPostId?: string
  reactions: PostReaction[]
  attachments: PostAttachment[]
  isBestAnswer: boolean
  isHidden: boolean
  hiddenReason?: string
}

export interface PostAttachment {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
  thumbnailUrl?: string
}

export interface ThreadReaction {
  type: ReactionType
  count: number
  userIds: string[]
}

export interface PostReaction {
  type: ReactionType
  userId: string
  userName: string
  timestamp: Date
}

// Poll System
export interface ForumPoll {
  id: string
  question: string
  options: PollOption[]
  allowMultiple: boolean
  showResults: boolean
  endsAt?: Date
  totalVotes: number
  voters: string[]
}

export interface PollOption {
  id: string
  text: string
  votes: number
  voterIds: string[]
}

// Private Message System
export interface PrivateMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  createdAt: Date
  isRead: boolean
  attachments: PostAttachment[]
}

export interface Conversation {
  id: string
  participants: ConversationParticipant[]
  title?: string
  lastMessage?: PrivateMessage
  createdAt: Date
  updatedAt: Date
  unreadCount: number
}

export interface ConversationParticipant {
  userId: string
  userName: string
  userAvatar?: string
  joinedAt: Date
  lastReadAt: Date
}

// Shoutbox Message
export interface ShoutboxMessage {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  authorRank: UserRank
  authorFaction?: string
  content: string
  timestamp: Date
  reactions: PostReaction[]
}

// Online User
export interface OnlineUser {
  id: string
  name: string
  avatar?: string
  rank: UserRank
  faction?: string
  currentLocation: string
  lastActivity: Date
  isInvisible: boolean
}

// Forum Statistics
export interface ForumStats {
  totalThreads: number
  totalPosts: number
  totalMembers: number
  newestMember: {
    id: string
    name: string
    joinedAt: Date
  } | null
  onlineUsers: number
  onlineGuests: number
  recordOnline: number
  recordOnlineDate: Date
  postsToday: number
  threadsToday: number
}

// User Forum Profile Extension
export interface ForumUserProfile {
  userId: string
  postCount: number
  threadCount: number
  reputation: number
  rank: UserRank
  customTitle?: string
  signature?: string
  aboutMe?: string
  website?: string
  socialLinks: {
    discord?: string
    steam?: string
    twitter?: string
    youtube?: string
    twitch?: string
  }
  friends: string[]
  blockedUsers: string[]
  subscribedThreads: string[]
  subscribedBoards: string[]
  joinedAt: Date
  lastPostAt?: Date
  warnings: ForumWarning[]
  badges: ForumBadge[]
}

export interface ForumWarning {
  id: string
  reason: string
  issuedBy: string
  issuedAt: Date
  expiresAt?: Date
  points: number
}

export interface ForumBadge {
  id: string
  name: string
  icon: string
  description: string
  earnedAt: Date
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

// Notification
export interface ForumNotification {
  id: string
  type: 'reply' | 'mention' | 'quote' | 'reaction' | 'pm' | 'friend_request' | 'badge' | 'warning' | 'announcement'
  title: string
  message: string
  link?: string
  fromUserId?: string
  fromUserName?: string
  isRead: boolean
  createdAt: Date
}

// Search
export interface SearchResult {
  type: 'thread' | 'post' | 'user'
  id: string
  title: string
  excerpt: string
  authorName: string
  createdAt: Date
  boardName?: string
  threadTitle?: string
  relevance: number
}

// ============================================
// DEFAULT TAGS (loaded from API in production)
// ============================================

const DEFAULT_TAGS = [
  'pvp', 'raid', 'anfänger', 'guide', 'clan', 'handel', 'event', 
  'bug', 'vorschlag', 'diskussion', 'screenshot', 'video', 'hilfe',
  'seraphar', 'vorgaroth', 'turnier', 'base'
]

// ============================================
// FORUM STORE STATE
// ============================================

// API Response Types
interface ApiCategory {
  id: string
  name: string
  description: string
  icon?: string
  order: number
  boards: ApiBoard[]
}

interface ApiBoard {
  id: string
  name: string
  description: string
  icon?: string
  order: number
  threadCount?: number
  _count?: { threads: number }
  postCount?: number
  lastThread?: {
    id: string
    title: string
    authorId: string
    author?: { displayName?: string; username?: string }
    updatedAt?: string
    createdAt: string
  }
  isPrivate?: boolean
  factionOnly?: string | null
  moderators?: string[]
}

interface ApiThread {
  id: string
  boardId: string
  title: string
  slug: string
  authorId: string
  author?: {
    displayName?: string
    username?: string
    avatar?: string
    role?: string
    faction?: 'seraphar' | 'vorgaroth' | 'neutral'
  }
  content: string
  createdAt: string
  updatedAt: string
  isLocked?: boolean
  isPinned?: boolean
  viewCount: number
  _count?: { posts: number }
  tags?: { name: string }[]
  posts?: {
    authorId: string
    author?: { displayName?: string; username?: string }
    createdAt: string
  }[]
}

interface ApiPost {
  id: string
  threadId: string
  authorId: string
  author?: {
    displayName?: string
    username?: string
    avatar?: string
    role?: string
    faction?: 'seraphar' | 'vorgaroth' | 'neutral'
  }
  content: string
  createdAt: string
  updatedAt: string
  isEdited?: boolean
  isBestAnswer?: boolean
  isHidden?: boolean
  replyTo?: {
    id: string
    author?: { displayName?: string; username?: string }
    content?: string
  }
}

interface ApiOnlineUser {
  id: string
  displayName?: string
  username: string
  avatar?: string
  role: string
  faction?: 'seraphar' | 'vorgaroth' | 'neutral'
  lastActive: string
}

interface ApiSearchResult {
  type: 'thread' | 'post' | 'user'
  id: string
  title: string
  excerpt?: string
  content?: string
  authorName?: string
  author?: { displayName?: string; username?: string }
  createdAt: string
  boardName?: string
  threadTitle?: string
  relevance?: number
}

interface ApiError {
  error: string
}

interface ApiForumStats {
  totalThreads: number
  totalPosts: number
  totalMembers: number
  newestMember?: {
    id: string
    displayName?: string
    username: string
    createdAt: string
  }
  onlineUsers: number
  onlineGuests: number
  recordOnline: number
  recordOnlineDate: string
  postsToday: number
  threadsToday: number
}

interface ForumState {
  // Data
  categories: ForumCategory[]
  threads: ForumThread[]
  posts: ForumPost[]
  shoutboxMessages: ShoutboxMessage[]
  conversations: Conversation[]
  notifications: ForumNotification[]
  onlineUsers: OnlineUser[]
  stats: ForumStats
  popularTags: string[]
  
  // UI State
  activeBoard: string | null
  activeThread: string | null
  isShoutboxExpanded: boolean
  isShoutboxMinimized: boolean
  searchQuery: string
  searchResults: SearchResult[]
  isSearching: boolean
  
  // User Forum Data
  userForumProfile: ForumUserProfile | null
  
  // Filters & Sorting
  threadSortBy: 'latest' | 'popular' | 'unanswered' | 'pinned'
  threadFilterTags: string[]
  
  // Actions - Categories & Boards
  setCategories: (categories: ForumCategory[]) => void
  toggleCategoryCollapse: (categoryId: string) => void
  
  // Actions - Threads
  setActiveBoard: (boardId: string | null) => void
  setActiveThread: (threadId: string | null) => void
  addThread: (thread: ForumThread) => void
  updateThread: (threadId: string, updates: Partial<ForumThread>) => void
  deleteThread: (threadId: string) => void
  pinThread: (threadId: string) => void
  lockThread: (threadId: string) => void
  subscribeToThread: (threadId: string, userId: string) => void
  
  // Actions - Posts
  addPost: (post: ForumPost) => void
  updatePost: (postId: string, updates: Partial<ForumPost>) => void
  deletePost: (postId: string) => void
  addReactionToPost: (postId: string, reaction: PostReaction) => void
  markAsBestAnswer: (postId: string) => void
  
  // Actions - Shoutbox
  addShoutboxMessage: (message: ShoutboxMessage) => void
  toggleShoutboxExpanded: () => void
  toggleShoutboxMinimized: () => void
  startShoutboxSimulation: () => void
  stopShoutboxSimulation: () => void
  isShoutboxSimulationRunning: boolean
  
  // Actions - Private Messages
  addConversation: (conversation: Conversation) => void
  addMessageToConversation: (conversationId: string, message: PrivateMessage) => void
  markConversationAsRead: (conversationId: string) => void
  
  // Actions - Notifications
  addNotification: (notification: ForumNotification) => void
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearNotifications: () => void
  
  // Actions - Search
  setSearchQuery: (query: string) => void
  performSearch: (query: string) => void
  clearSearch: () => void
  
  // Actions - Sorting & Filtering
  setThreadSortBy: (sortBy: 'latest' | 'popular' | 'unanswered' | 'pinned') => void
  setThreadFilterTags: (tags: string[]) => void
  
  // Actions - User Profile
  setUserForumProfile: (profile: ForumUserProfile | null) => void
  updateUserForumProfile: (updates: Partial<ForumUserProfile>) => void
  
  // API Actions
  fetchCategories: () => Promise<void>
  fetchThreadsForBoard: (boardId: string) => Promise<void>
  fetchThread: (threadId: string) => Promise<ForumThread | null>
  fetchPostsForThread: (threadId: string) => Promise<void>
  fetchStats: () => Promise<void>
  fetchOnlineUsers: () => Promise<void>
  createThreadAPI: (data: { boardId: string; title: string; content: string; tags: string[] }) => Promise<ForumThread | null>
  createPostAPI: (data: { threadId: string; content: string; replyToId?: string }) => Promise<ForumPost | null>
  searchAPI: (query: string) => Promise<void>
  
  // Loading States
  isLoadingCategories: boolean
  isLoadingThreads: boolean
  isLoadingPosts: boolean
  isLoadingStats: boolean
  apiError: string | null
  
  // Computed
  getThreadsForBoard: (boardId: string) => ForumThread[]
  getPostsForThread: (threadId: string) => ForumPost[]
  getUnreadNotificationCount: () => number
  getUnreadMessageCount: () => number
}

// ============================================
// FORUM STORE
// ============================================

export const useForumStore = create<ForumState>()(
  persist(
    (set, get) => ({
      // Initial Data - Preloaded with demo data for simulation
      categories: DEMO_CATEGORIES,
      threads: DEMO_THREADS,
      posts: DEMO_POSTS,
      shoutboxMessages: DEMO_SHOUTBOX_MESSAGES,
      conversations: [],
      notifications: [],
      onlineUsers: DEMO_FORUM_USERS,
      stats: {
        totalThreads: 147,
        totalPosts: 2340,
        totalMembers: 892,
        newestMember: { id: 'u_new', name: 'NeueSeraphin', joinedAt: new Date() },
        onlineUsers: DEMO_FORUM_USERS.length,
        onlineGuests: 23,
        recordOnline: 0,
        recordOnlineDate: new Date(),
        postsToday: 0,
        threadsToday: 0
      },
      popularTags: DEFAULT_TAGS,
      
      // Initial UI State
      activeBoard: null,
      activeThread: null,
      isShoutboxExpanded: true,
      isShoutboxMinimized: false,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      
      // User Profile
      userForumProfile: null,
      
      // Filters
      threadSortBy: 'latest',
      threadFilterTags: [],
      
      // Loading States
      isLoadingCategories: false,
      isLoadingThreads: false,
      isLoadingPosts: false,
      isLoadingStats: false,
      apiError: null,
      
      // Category Actions
      setCategories: (categories) => set({ categories }),
      
      toggleCategoryCollapse: (categoryId) => set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === categoryId ? { ...cat, isCollapsed: !cat.isCollapsed } : cat
        )
      })),
      
      // Thread Actions
      setActiveBoard: (boardId) => set({ activeBoard: boardId }),
      setActiveThread: (threadId) => set({ activeThread: threadId }),
      
      addThread: (thread) => set((state) => ({
        threads: [thread, ...state.threads],
        stats: {
          ...state.stats,
          totalThreads: state.stats.totalThreads + 1,
          threadsToday: state.stats.threadsToday + 1
        }
      })),
      
      updateThread: (threadId, updates) => set((state) => ({
        threads: state.threads.map((t) =>
          t.id === threadId ? { ...t, ...updates, updatedAt: new Date() } : t
        )
      })),
      
      deleteThread: (threadId) => set((state) => ({
        threads: state.threads.filter((t) => t.id !== threadId),
        posts: state.posts.filter((p) => p.threadId !== threadId)
      })),
      
      pinThread: (threadId) => set((state) => ({
        threads: state.threads.map((t) =>
          t.id === threadId ? { ...t, isPinned: !t.isPinned } : t
        )
      })),
      
      lockThread: (threadId) => set((state) => ({
        threads: state.threads.map((t) =>
          t.id === threadId ? { ...t, isLocked: !t.isLocked } : t
        )
      })),
      
      subscribeToThread: (threadId, userId) => set((state) => ({
        threads: state.threads.map((t) =>
          t.id === threadId
            ? {
                ...t,
                subscribers: t.subscribers.includes(userId)
                  ? t.subscribers.filter((id) => id !== userId)
                  : [...t.subscribers, userId]
              }
            : t
        )
      })),
      
      // Post Actions
      addPost: (post) => set((state) => ({
        posts: [...state.posts, post],
        stats: {
          ...state.stats,
          totalPosts: state.stats.totalPosts + 1,
          postsToday: state.stats.postsToday + 1
        }
      })),
      
      updatePost: (postId, updates) => set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, ...updates, isEdited: true, updatedAt: new Date() } : p
        )
      })),
      
      deletePost: (postId) => set((state) => ({
        posts: state.posts.filter((p) => p.id !== postId)
      })),
      
      addReactionToPost: (postId, reaction) => set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId
            ? { ...p, reactions: [...p.reactions, reaction] }
            : p
        )
      })),
      
      markAsBestAnswer: (postId) => set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, isBestAnswer: !p.isBestAnswer } : p
        )
      })),
      
      // Shoutbox Actions
      addShoutboxMessage: (message) => set((state) => ({
        shoutboxMessages: [...state.shoutboxMessages.slice(-99), message]
      })),
      
      toggleShoutboxExpanded: () => set((state) => ({
        isShoutboxExpanded: !state.isShoutboxExpanded
      })),
      
      toggleShoutboxMinimized: () => set((state) => ({
        isShoutboxMinimized: !state.isShoutboxMinimized
      })),
      
      // Shoutbox Simulation
      isShoutboxSimulationRunning: false,
      
      startShoutboxSimulation: () => {
        const state = get()
        if (state.isShoutboxSimulationRunning) return
        
        set({ isShoutboxSimulationRunning: true })
        
        // Generate a new message every 8-15 seconds
        const generateMessage = () => {
          if (!get().isShoutboxSimulationRunning) return
          
          const newMessage = generateShoutboxMessage()
          set((s) => ({
            shoutboxMessages: [...s.shoutboxMessages.slice(-99), newMessage]
          }))
          
          // Schedule next message
          const nextDelay = Math.random() * 7000 + 8000 // 8-15 seconds
          setTimeout(generateMessage, nextDelay)
        }
        
        // Start after initial delay
        setTimeout(generateMessage, 5000)
      },
      
      stopShoutboxSimulation: () => {
        set({ isShoutboxSimulationRunning: false })
      },
      
      // PM Actions
      addConversation: (conversation) => set((state) => ({
        conversations: [conversation, ...state.conversations]
      })),
      
      addMessageToConversation: (conversationId, message) => set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: message,
                updatedAt: new Date(),
                unreadCount: c.unreadCount + 1
              }
            : c
        )
      })),
      
      markConversationAsRead: (conversationId) => set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      })),
      
      // Notification Actions
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications.slice(0, 49)]
      })),
      
      markNotificationAsRead: (notificationId) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      })),
      
      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
      })),

      removeNotification: (notificationId) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== notificationId)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      // Search Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      performSearch: async (query) => {
        set({ isSearching: true, searchQuery: query })
        try {
          const res = await fetch(`/api/forum/search?q=${encodeURIComponent(query)}`)
          if (res.ok) {
            const data = await res.json()
            const results: SearchResult[] = data.results || []
            set({ searchResults: results, isSearching: false })
          } else {
            set({ searchResults: [], isSearching: false })
          }
        } catch (error) {
          console.error('Search failed:', error)
          set({ searchResults: [], isSearching: false })
        }
      },
      
      clearSearch: () => set({ searchQuery: '', searchResults: [], isSearching: false }),
      
      // Filter Actions
      setThreadSortBy: (sortBy) => set({ threadSortBy: sortBy }),
      setThreadFilterTags: (tags) => set({ threadFilterTags: tags }),
      
      // User Profile Actions
      setUserForumProfile: (profile) => set({ userForumProfile: profile }),
      
      updateUserForumProfile: (updates) => set((state) => ({
        userForumProfile: state.userForumProfile
          ? { ...state.userForumProfile, ...updates }
          : null
      })),
      
      // API Actions
      fetchCategories: async () => {
        set({ isLoadingCategories: true, apiError: null })
        try {
          const res = await fetch('/api/forum/categories')
          if (!res.ok) throw new Error('Failed to fetch categories')
          const data = await res.json()
          
          // API returns { categories: [...] } or empty array - handle both
          const rawCategories = data.categories || data || []
          
          // If no categories from API, use demo data
          if (!rawCategories.length) {
            set({ categories: DEMO_CATEGORIES, isLoadingCategories: false })
            return
          }
          
          // Transform API data to match store format
          const categories: ForumCategory[] = rawCategories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            icon: cat.icon || '📁',
            order: cat.order,
            isCollapsed: false,
            boards: cat.boards.map((board: any) => ({
              id: board.id,
              categoryId: cat.id,
              name: board.name,
              description: board.description,
              icon: board.icon || '💬',
              order: board.order,
              threadCount: board.threadCount || board._count?.threads || 0,
              postCount: board.postCount || 0,
              lastPost: board.lastThread ? {
                threadId: board.lastThread.id,
                threadTitle: board.lastThread.title,
                authorId: board.lastThread.authorId,
                authorName: board.lastThread.author?.displayName || board.lastThread.author?.username || 'Unknown',
                timestamp: new Date(board.lastThread.updatedAt || board.lastThread.createdAt)
              } : undefined,
              isPrivate: board.isPrivate || false,
              factionOnly: board.factionOnly,
              moderators: board.moderators || []
            }))
          }))
          
          set({ categories, isLoadingCategories: false })
        } catch (error) {
          console.error('Error fetching categories:', error)
          // Fallback to demo data on error
          set({ categories: DEMO_CATEGORIES, isLoadingCategories: false })
        }
      },
      
      fetchThreadsForBoard: async (boardId) => {
        set({ isLoadingThreads: true, apiError: null })
        try {
          const res = await fetch(`/api/forum/threads?boardId=${boardId}`)
          if (!res.ok) throw new Error('Failed to fetch threads')
          const data = (await res.json()) as { threads: ApiThread[] }
          
          const threads: ForumThread[] = data.threads.map((t) => ({
            id: t.id,
            boardId: t.boardId,
            title: t.title,
            slug: t.slug,
            authorId: t.authorId,
            authorName: t.author?.displayName || t.author?.username || 'Unknown',
            authorAvatar: t.author?.avatar || '',
            authorRank: (t.author?.role === 'admin' ? 'admin' : t.author?.role === 'moderator' ? 'moderator' : 'member') as UserRank,
            authorFaction: t.author?.faction,
            content: t.content,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            status: t.isLocked ? 'closed' : 'open',
            isPinned: Boolean(t.isPinned),
            isLocked: Boolean(t.isLocked),
            isAnnouncement: Boolean(t.isPinned),
            viewCount: t.viewCount,
            replyCount: t._count?.posts || 0,
            tags: t.tags?.map((tag) => tag.name) || [],
            reactions: [],
            subscribers: [],
            lastReply: t.posts?.[0] ? {
              threadId: t.id,
              threadTitle: t.title,
              authorId: t.posts[0].authorId,
              authorName: t.posts[0].author?.displayName || t.posts[0].author?.username || 'Unknown',
              timestamp: new Date(t.posts[0].createdAt)
            } : undefined
          }))
          
          // Merge with existing threads (replace threads for this board)
          set((state) => ({
            threads: [
              ...state.threads.filter(t => t.boardId !== boardId),
              ...threads
            ],
            isLoadingThreads: false
          }))
        } catch (error) {
          console.error('Error fetching threads:', error)
          // Fallback to demo threads for this board
          const demoThreadsForBoard = DEMO_THREADS.filter(t => t.boardId === boardId)
          set((state) => ({
            threads: [
              ...state.threads.filter(t => t.boardId !== boardId),
              ...demoThreadsForBoard
            ],
            isLoadingThreads: false
          }))
        }
      },
      
      fetchThread: async (threadId) => {
        set({ isLoadingThreads: true, apiError: null })
        try {
          const res = await fetch(`/api/forum/threads/${threadId}`)
          if (!res.ok) {
            if (res.status === 404) return null
            throw new Error('Failed to fetch thread')
          }
          const t = (await res.json()) as ApiThread
          
          const thread: ForumThread = {
            id: t.id,
            boardId: t.boardId,
            title: t.title,
            slug: t.slug,
            authorId: t.authorId,
            authorName: t.author?.displayName || t.author?.username || 'Unknown',
            authorAvatar: t.author?.avatar || '',
            authorRank: (t.author?.role === 'admin' ? 'admin' : t.author?.role === 'moderator' ? 'moderator' : 'member') as UserRank,
            authorFaction: t.author?.faction,
            content: t.content,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            status: t.isLocked ? 'closed' : 'open',
            isPinned: Boolean(t.isPinned),
            isLocked: Boolean(t.isLocked),
            isAnnouncement: Boolean(t.isPinned),
            viewCount: t.viewCount,
            replyCount: t._count?.posts || 0,
            tags: t.tags?.map((tag) => tag.name) || [],
            reactions: [],
            subscribers: []
          }
          
          // Add or update thread in store
          set((state) => ({
            threads: state.threads.some(th => th.id === threadId)
              ? state.threads.map(th => th.id === threadId ? thread : th)
              : [...state.threads, thread],
            isLoadingThreads: false
          }))
          
          return thread
        } catch (error) {
          console.error('Error fetching thread:', error)
          // Try to find in demo data
          const demoThread = DEMO_THREADS.find(t => t.id === threadId)
          if (demoThread) {
            set((state) => ({
              threads: state.threads.some(th => th.id === threadId)
                ? state.threads.map(th => th.id === threadId ? demoThread : th)
                : [...state.threads, demoThread],
              isLoadingThreads: false
            }))
            return demoThread
          }
          set({ isLoadingThreads: false })
          return null
        }
      },
      
      fetchPostsForThread: async (threadId) => {
        set({ isLoadingPosts: true, apiError: null })
        try {
          const res = await fetch(`/api/forum/posts?threadId=${threadId}`)
          if (!res.ok) throw new Error('Failed to fetch posts')
          const data = (await res.json()) as { posts: ApiPost[] }
          
          const posts: ForumPost[] = data.posts.map((p) => ({
            id: p.id,
            threadId: p.threadId,
            authorId: p.authorId,
            authorName: p.author?.displayName || p.author?.username || 'Unknown',
            authorAvatar: p.author?.avatar || '',
            authorRank: (p.author?.role === 'admin' ? 'admin' : p.author?.role === 'moderator' ? 'moderator' : 'member') as UserRank,
            authorFaction: p.author?.faction,
            content: p.content,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            isEdited: p.isEdited || false,
            replyToPostId: p.replyTo?.id,
            reactions: [],
            attachments: [],
            isBestAnswer: p.isBestAnswer || false,
            isHidden: p.isHidden || false
          }))
          
          // Replace posts for this thread
          set((state) => ({
            posts: [
              ...state.posts.filter(p => p.threadId !== threadId),
              ...posts
            ],
            isLoadingPosts: false
          }))
        } catch (error) {
          console.error('Error fetching posts:', error)
          // Fallback to demo posts for this thread
          const demoPosts = DEMO_POSTS.filter(p => p.threadId === threadId)
          set((state) => ({
            posts: [
              ...state.posts.filter(p => p.threadId !== threadId),
              ...demoPosts
            ],
            isLoadingPosts: false
          }))
        }
      },
      
      fetchStats: async () => {
        set({ isLoadingStats: true, apiError: null })
        try {
          const res = await fetch('/api/forum/stats')
          if (!res.ok) throw new Error('Failed to fetch stats')
          const data: ApiForumStats = await res.json()
          
          set({
            stats: {
              totalThreads: data.totalThreads || 0,
              totalPosts: data.totalPosts || 0,
              totalMembers: data.totalMembers || 0,
              newestMember: data.newestMember ? {
                id: data.newestMember.id,
                name: data.newestMember.displayName || data.newestMember.username,
                joinedAt: new Date(data.newestMember.createdAt)
              } : null,
              onlineUsers: data.onlineUsers || 0,
              onlineGuests: data.onlineGuests || 0,
              recordOnline: data.recordOnline || 0,
              recordOnlineDate: data.recordOnlineDate ? new Date(data.recordOnlineDate) : new Date(),
              postsToday: data.postsToday || 0,
              threadsToday: data.threadsToday || 0
            },
            isLoadingStats: false
          })
        } catch (error) {
          console.error('Error fetching stats:', error)
          // Fallback to demo stats
          set({
            stats: {
              totalThreads: 147,
              totalPosts: 2340,
              totalMembers: 892,
              newestMember: { id: 'u_new', name: 'NeueSeraphin', joinedAt: new Date() },
              onlineUsers: DEMO_FORUM_USERS.length,
              onlineGuests: 23,
              recordOnline: 156,
              recordOnlineDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              postsToday: 34,
              threadsToday: 8
            },
            isLoadingStats: false
          })
        }
      },

      fetchOnlineUsers: async () => {
        try {
          const res = await fetch('/api/forum/users/online')
          if (!res.ok) throw new Error('Failed to fetch online users')
          const data = (await res.json()) as { users: ApiOnlineUser[] }
          
          const onlineUsers: OnlineUser[] = data.users?.map((u: ApiOnlineUser) => ({
            id: u.id,
            name: u.displayName || u.username,
            avatar: u.avatar,
            rank: (u.role === 'admin' ? 'admin' : u.role === 'moderator' ? 'moderator' : 'member') as UserRank,
            faction: u.faction || 'neutral',
            currentLocation: 'Forum',
            lastActivity: new Date(u.lastActive),
            isInvisible: false
          })) || []
          
          set({ onlineUsers })
        } catch (error) {
          console.error('Error fetching online users:', error)
          set({ onlineUsers: DEMO_FORUM_USERS })
        }
      },
      
      createThreadAPI: async (data) => {
        try {
          const res = await fetch('/api/forum/threads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          if (!res.ok) {
            const error: ApiError = await res.json()
            throw new Error(error.error || 'Failed to create thread')
          }
          
          const t: ApiThread = await res.json()
          
          const thread: ForumThread = {
            id: t.id,
            boardId: t.boardId,
            title: t.title,
            slug: t.slug,
            authorId: t.authorId,
            authorName: t.author?.displayName || t.author?.username || 'Unknown',
            authorAvatar: t.author?.avatar || '',
            authorRank: 'member',
            content: t.content,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            status: 'open',
            isPinned: false,
            isLocked: false,
            isAnnouncement: false,
            viewCount: 0,
            replyCount: 0,
            tags: data.tags || [],
            reactions: [],
            subscribers: [t.authorId]
          }
          
          set((state) => ({
            threads: [thread, ...state.threads],
            stats: {
              ...state.stats,
              totalThreads: state.stats.totalThreads + 1,
              threadsToday: state.stats.threadsToday + 1
            }
          }))
          
          return thread
        } catch (error) {
          console.error('Error creating thread:', error)
          set({ apiError: error instanceof Error ? error.message : 'Fehler beim Erstellen des Themas' })
          return null
        }
      },
      
      createPostAPI: async (data) => {
        try {
          const res = await fetch('/api/forum/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          if (!res.ok) {
            const error: ApiError = await res.json()
            throw new Error(error.error || 'Failed to create post')
          }
          
          const p: ApiPost = await res.json()
          
          const post: ForumPost = {
            id: p.id,
            threadId: p.threadId,
            authorId: p.authorId,
            authorName: p.author?.displayName || p.author?.username || 'Unknown',
            authorAvatar: p.author?.avatar || '',
            authorRank: 'member',
            content: p.content,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            isEdited: p.isEdited || false,
            isBestAnswer: p.isBestAnswer || false,
            isHidden: p.isHidden || false,
            reactions: [],
            attachments: []
          }
          
          set((state) => ({
            posts: [...state.posts, post],
            stats: {
              ...state.stats,
              totalPosts: state.stats.totalPosts + 1,
              postsToday: state.stats.postsToday + 1
            }
          }))
          
          return post
        } catch (error) {
          console.error('Error creating post:', error)
          set({ apiError: error instanceof Error ? error.message : 'Fehler beim Erstellen des Beitrags' })
          return null
        }
      },
      
      searchAPI: async (query) => {
        if (!query.trim()) {
          set({ searchResults: [], isSearching: false })
          return
        }
        
        set({ isSearching: true, searchQuery: query })
        try {
          const res = await fetch(`/api/forum/search?q=${encodeURIComponent(query)}`)
          if (!res.ok) throw new Error('Search failed')
          const data = (await res.json()) as { results: ApiSearchResult[] }
          
          const results: SearchResult[] = data.results?.map((r) => ({
            type: r.type,
            id: r.id,
            title: r.title,
            excerpt: r.excerpt || r.content?.substring(0, 150) || '',
            authorName: r.authorName || r.author?.displayName || r.author?.username || 'Unknown',
            createdAt: new Date(r.createdAt),
            boardName: r.boardName,
            threadTitle: r.threadTitle,
            relevance: r.relevance || 1
          })) || []
          
          set({ searchResults: results, isSearching: false })
        } catch (error) {
          console.error('Search error:', error)
          set({ searchResults: [], isSearching: false })
        }
      },
      
      // Computed Getters
      getThreadsForBoard: (boardId) => {
        const state = get()
        return state.threads
          .filter((t) => t.boardId === boardId)
          .sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
            if (state.threadSortBy === 'latest') {
              return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            }
            if (state.threadSortBy === 'popular') {
              return b.viewCount - a.viewCount
            }
            return 0
          })
      },
      
      getPostsForThread: (threadId) => {
        return get().posts
          .filter((p) => p.threadId === threadId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      },
      
      getUnreadNotificationCount: () => {
        return get().notifications.filter((n) => !n.isRead).length
      },
      
      getUnreadMessageCount: () => {
        return get().conversations.reduce((sum, c) => sum + c.unreadCount, 0)
      }
    }),
    {
      name: 'eldrun-forum-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isShoutboxExpanded: state.isShoutboxExpanded,
        isShoutboxMinimized: state.isShoutboxMinimized,
        threadSortBy: state.threadSortBy,
        userForumProfile: state.userForumProfile
      })
    }
  )
)

// Rank utilities
export const getRankInfo = (rank: UserRank) => {
  const ranks: Record<UserRank, { name: string; color: string; icon: string; minPosts: number }> = {
    newcomer: { name: 'Neuling', color: 'text-metal-400', icon: '🌱', minPosts: 0 },
    member: { name: 'Mitglied', color: 'text-green-400', icon: '👤', minPosts: 11 },
    active: { name: 'Aktiv', color: 'text-blue-400', icon: '⚡', minPosts: 51 },
    veteran: { name: 'Veteran', color: 'text-purple-400', icon: '⭐', minPosts: 151 },
    elite: { name: 'Elite', color: 'text-amber-400', icon: '💎', minPosts: 501 },
    legend: { name: 'Legende', color: 'text-red-400', icon: '🔥', minPosts: 1001 },
    moderator: { name: 'Moderator', color: 'text-cyan-400', icon: '🛡️', minPosts: 0 },
    admin: { name: 'Administrator', color: 'text-rust-400', icon: '👑', minPosts: 0 }
  }
  return ranks[rank]
}

export const getFactionInfo = (faction: string) => {
  const factions: Record<string, { name: string; color: string; icon: string; gradient: string; logo?: string; banner?: string }> = {
    seraphar: { 
      name: 'SERAPHAR', 
      color: 'text-amber-400', 
      icon: '🦁', 
      gradient: 'from-amber-500/20 to-amber-900/20',
      logo: '/images/factions/seraphar-logo.png',
      banner: '/images/factions/seraphar-banner.png'
    },
    vorgaroth: { 
      name: 'VORGAROTH', 
      color: 'text-red-400', 
      icon: '🐉', 
      gradient: 'from-red-500/20 to-red-900/20',
      logo: '/images/factions/vorgaroth-logo.png',
      banner: '/images/factions/vorgaroth-banner.png'
    },
  }
  return factions[faction] || null
}
