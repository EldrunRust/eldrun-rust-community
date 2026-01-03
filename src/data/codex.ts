export type CodexEntry = {
  id: string
  title: string
  category: 'Klassen' | 'Artefakte' | 'Events' | 'Zonen'
  summary: string
  details: string
  tags: string[]
}

export const CODEX_ENTRIES: CodexEntry[] = [
  {
    id: 'class-krieger',
    title: 'Krieger von Seraphar',
    category: 'Klassen',
    summary: 'Frontline-Tank mit Schildmauern und Banner-Buffs.',
    details: '• Ultimate: Himmelslanze (stun + burn)\n• Passive: Banner des Lichts (+10% Rüstung für Verbündete)\n• Spezial: Schildwall gegen Explosivschaden',
    tags: ['Tank', 'Buffs', 'Seraphar'],
  },
  {
    id: 'class-necromancer',
    title: 'Nekromant von Vorgaroth',
    category: 'Klassen',
    summary: 'Beschwört Schatten-Entitäten und entzieht Leben.',
    details: '• Ultimate: Seelenbruch (AoE Life-Drain)\n• Passive: Schattenpakt (Heilung bei Kills)\n• Spezial: Knochenwall verlangsamt Angreifer',
    tags: ['DPS', 'Sustain', 'Vorgaroth'],
  },
  {
    id: 'class-archer',
    title: 'Archer von Seraphar',
    category: 'Klassen',
    summary: 'Fernkampf-Sniper mit Markierungs-Pfeilen und Stun-Traps.',
    details: '• Ultimate: Himmelsregen (AoE Pfeilhagel)\n• Passive: Mark of Light (+10% Crit gegen markierte Ziele)\n• Spezial: Stasis Trap (kurzer Root, nur einmal alle 40s)',
    tags: ['Ranged', 'CC', 'Seraphar'],
  },
  {
    id: 'class-rogue',
    title: 'Rogue von Vorgaroth',
    category: 'Klassen',
    summary: 'Stealth, Bleeds und Burst-Schaden in kurzen Fenstern.',
    details: '• Ultimate: Schattenvorstoß (Teleport + Burst)\n• Passive: Venom Edge (Bleed stacks)\n• Spezial: Rauchbombe (kurze Unverwundbarkeit, Movement)',
    tags: ['Burst', 'Stealth', 'Vorgaroth'],
  },
  {
    id: 'artifact-crown',
    title: 'Krone der ewigen Herrschaft',
    category: 'Artefakte',
    summary: 'Einzigartiges Artefakt – nur ein Träger weltweit.',
    details: '• Globale Ankündigung beim Besitzerwechsel\n• +20% All Stats, aber permanente Markierung auf der Karte\n• Droppt bei Tod, kann gestohlen werden',
    tags: ['Legendär', 'Artifact', 'Global'],
  },
  {
    id: 'artifact-heart',
    title: 'Eldrun Herzkristall',
    category: 'Artefakte',
    summary: 'PvE/PvP Hybrid-Artefakt für Gruppenbuffs.',
    details: '• +10% Lifesteal in 40m Radius\n• „Pulse Heal“ alle 60s für nahe Verbündete\n• Deaktiviert in Safe-Zonen\n• Droppt bei Stormwall Bossen',
    tags: ['Support', 'Heal', 'Artifact'],
  },
  {
    id: 'event-stormwall',
    title: 'Stormwall Collapse',
    category: 'Events',
    summary: 'Öffnet temporäre Zonen mit Elite-NPCs und seltenem Loot.',
    details: '• Dauer: 2h • Nächstes Event: Samstag 20:00\n• Neue Ressourcenfelder + Boss-Sentinels\n• Fraktionskontrolle gibt Bonus-Honor',
    tags: ['Event', 'Loot', 'Fraktionen'],
  },
  {
    id: 'event-arena',
    title: 'Arena „Eternal Trial“',
    category: 'Events',
    summary: 'Wellenbasierte PvPvE-Arena, alle 30 Minuten.',
    details: '• 5 Wellen, steigende Boss-Modifier\n• Zusatzziel: Kein Tod für Extra-Honor\n• Spectator-Mode im Stream-Panel',
    tags: ['Arena', 'PvPvE', 'Honor'],
  },
  {
    id: 'event-portal',
    title: 'Portal Surge',
    category: 'Events',
    summary: 'Portale spawnen mit random Loot-Tables und Mini-Bossen.',
    details: '• Portale halten 10 Minuten\n• Loot: Artefakt-Fragmente, Rare Skins, Coins\n• Gefahr: Instabile Explosion bei Ablauf',
    tags: ['Portal', 'Loot', 'Risk'],
  },
  {
    id: 'zone-artifact-beta',
    title: 'Artifact Island Beta',
    category: 'Zonen',
    summary: 'Hardcore-PvP-Zone mit Artefakt-Spawns und Bossen.',
    details: '• Keine Safe-Zonen\n• Höhere Drop-Raten für Artefakte\n• Fraktions-Respawn gesperrt – bringe Dein Team',
    tags: ['PvP', 'Artefakt', 'Boss'],
  },
  {
    id: 'zone-frost',
    title: 'Frozen Valley',
    category: 'Zonen',
    summary: 'PvE-Snow-Biome mit Eisbossen und seltenen Erzen.',
    details: '• Kälte-Debuff (Heiltränke empfohlen)\n• Boss: Frost Wyrm dropt Cryo-Cores\n• Exklusive Ressourcen: Frost Ore, Icewood',
    tags: ['PvE', 'Boss', 'Ressourcen'],
  },
  {
    id: 'zone-haven',
    title: 'Safe Haven Markt',
    category: 'Zonen',
    summary: 'Handels- und Social-Hub, PvP deaktiviert.',
    details: '• Auktionshaus-Zugang\n• Gildenrekrutierung live\n• Mini-Games: Dice, Coinflip (abgeschwächt)',
    tags: ['Social', 'Trading', 'Safe'],
  },
]
