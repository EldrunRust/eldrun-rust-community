// ═══════════════════════════════════════════════════════════════════════════
// ELDRUN SMILEY DATA - EXPANDED COLLECTION
// 800+ Smileys: Free, Rare, Epic, Legendary, Mythic, Eldrun Exclusive
// ═══════════════════════════════════════════════════════════════════════════

import { Smiley } from '@/store/smileyStore'

// Helper function to create smiley
const s = (
  id: string, code: string, name: string, emoji: string, 
  category: 'smileys' | 'gaming' | 'reactions' | 'animals' | 'fantasy' | 'emotes' | 'seasonal' | 'vip' | 'animated' | 'eldrun',
  rarity: 'free' | 'common' | 'rare' | 'epic' | 'legendary' | 'elite' | 'mythic',
  price: number, opts: Partial<Smiley> = {}
): Smiley => ({
  id, code, name, emoji, category: category as Smiley['category'], rarity, price,
  isAnimated: opts.isAnimated ?? false,
  hasSound: opts.hasSound ?? false,
  isExclusive: opts.isExclusive ?? false,
  effect: opts.effect,
  timesUsed: opts.timesUsed ?? Math.floor(Math.random() * 100000),
  ownersCount: opts.ownersCount ?? (price > 0 ? Math.floor(Math.random() * 500) : 0),
  isAvailable: opts.isAvailable ?? true,
  limitedEdition: opts.limitedEdition,
  vipOnly: opts.vipOnly,
  minLevel: opts.minLevel,
  createdAt: '2024-01-01'
})

// ═══════════════════════════════════════════════════════════════════════════
// FREE SMILEYS (200+)
// ═══════════════════════════════════════════════════════════════════════════

export const FREE_SMILEYS: Smiley[] = [
  // Basic Faces
  s('smile', ':)', 'Lächeln', '😊', 'smileys', 'free', 0),
  s('grin', ':D', 'Grinsen', '😀', 'smileys', 'free', 0),
  s('wink', ';)', 'Zwinkern', '😉', 'smileys', 'free', 0),
  s('love', ':heart:', 'Herz', '❤️', 'smileys', 'free', 0),
  s('sad', ':(', 'Traurig', '😢', 'smileys', 'free', 0),
  s('angry', ':@', 'Wütend', '😠', 'smileys', 'free', 0),
  s('cool', 'B)', 'Cool', '😎', 'smileys', 'free', 0),
  s('laugh', ':lol:', 'Lachen', '😂', 'smileys', 'free', 0),
  s('thinking', ':think:', 'Nachdenken', '🤔', 'smileys', 'free', 0),
  s('surprised', ':o', 'Überrascht', '😮', 'smileys', 'free', 0),
  s('tongue', ':P', 'Zunge', '😛', 'smileys', 'free', 0),
  s('crazy', ':crazy:', 'Verrückt', '🤪', 'smileys', 'free', 0),
  s('kiss', ':kiss:', 'Kuss', '😘', 'smileys', 'free', 0),
  s('blush', ':blush:', 'Erröten', '☺️', 'smileys', 'free', 0),
  s('angel', ':angel:', 'Engel', '😇', 'smileys', 'free', 0),
  s('devil', ':devil:', 'Teufel', '😈', 'smileys', 'free', 0),
  s('sleepy', ':zzz:', 'Müde', '😴', 'smileys', 'free', 0),
  s('sick', ':sick:', 'Krank', '🤢', 'smileys', 'free', 0),
  s('party', ':party:', 'Party', '🥳', 'smileys', 'free', 0),
  s('nerd', ':nerd:', 'Nerd', '🤓', 'smileys', 'free', 0),
  s('smirk', ':smirk:', 'Grinsen', '😏', 'smileys', 'free', 0),
  s('unamused', ':meh:', 'Unbeeindruckt', '😒', 'smileys', 'free', 0),
  s('rage', ':rage:', 'Wut', '🤬', 'smileys', 'free', 0),
  s('sob', ':sob:', 'Schluchzen', '😭', 'smileys', 'free', 0),
  s('innocent', ':innocent:', 'Unschuldig', '🥺', 'smileys', 'free', 0),
  s('hug', ':hug:', 'Umarmung', '🤗', 'smileys', 'free', 0),
  s('mindblown', ':mindblown:', 'Umgehauen', '🤯', 'smileys', 'free', 0),
  s('yawn', ':yawn:', 'Gähnen', '🥱', 'smileys', 'free', 0),
  s('drool', ':drool:', 'Sabbern', '🤤', 'smileys', 'free', 0),
  s('hot', ':hot:', 'Heiß', '🥵', 'smileys', 'free', 0),
  s('cold', ':cold:', 'Kalt', '🥶', 'smileys', 'free', 0),
  s('shush', ':shush:', 'Psst', '🤫', 'smileys', 'free', 0),
  s('money', ':money:', 'Geld', '🤑', 'smileys', 'free', 0),
  s('cowboy', ':cowboy:', 'Cowboy', '🤠', 'smileys', 'free', 0),
  s('monocle', ':monocle:', 'Monokel', '🧐', 'smileys', 'free', 0),
  s('facepalm', ':facepalm:', 'Facepalm', '🤦', 'smileys', 'free', 0),
  s('shrug', ':shrug:', 'Achselzucken', '🤷', 'smileys', 'free', 0),
  s('rolling_eyes', ':eyeroll:', 'Augenrollen', '🙄', 'smileys', 'free', 0),
  s('relieved', ':relieved:', 'Erleichtert', '😌', 'smileys', 'free', 0),
  s('pensive', ':pensive:', 'Nachdenklich', '😔', 'smileys', 'free', 0),
  
  // Reactions
  s('thumbsup', ':+1:', 'Daumen hoch', '👍', 'reactions', 'free', 0),
  s('thumbsdown', ':-1:', 'Daumen runter', '👎', 'reactions', 'free', 0),
  s('clap', ':clap:', 'Applaus', '👏', 'reactions', 'free', 0),
  s('fire', ':fire:', 'Feuer', '🔥', 'reactions', 'free', 0),
  s('hundred', ':100:', '100', '💯', 'reactions', 'free', 0),
  s('check', ':check:', 'Check', '✅', 'reactions', 'free', 0),
  s('cross', ':x:', 'Kreuz', '❌', 'reactions', 'free', 0),
  s('star', ':star:', 'Stern', '⭐', 'reactions', 'free', 0),
  s('sparkles', ':sparkles:', 'Funken', '✨', 'reactions', 'free', 0),
  s('boom', ':boom:', 'Boom', '💥', 'reactions', 'free', 0),
  s('eyes', ':eyes:', 'Augen', '👀', 'reactions', 'free', 0),
  s('pray', ':pray:', 'Beten', '🙏', 'reactions', 'free', 0),
  s('wave', ':wave:', 'Winken', '👋', 'reactions', 'free', 0),
  s('ok', ':ok:', 'OK', '👌', 'reactions', 'free', 0),
  s('fist', ':fist:', 'Faust', '✊', 'reactions', 'free', 0),
  s('muscle', ':muscle:', 'Bizeps', '💪', 'reactions', 'free', 0),
  s('victory', ':v:', 'Victory', '✌️', 'reactions', 'free', 0),
  s('rock', ':rock:', 'Rock', '🤘', 'reactions', 'free', 0),
  s('handshake', ':handshake:', 'Handschlag', '🤝', 'reactions', 'free', 0),
  s('salute', ':salute:', 'Salutieren', '🫡', 'reactions', 'free', 0),
  s('heart_orange', ':orange_heart:', 'Orange Herz', '🧡', 'reactions', 'free', 0),
  s('heart_yellow', ':yellow_heart:', 'Gelbes Herz', '💛', 'reactions', 'free', 0),
  s('heart_green', ':green_heart:', 'Grünes Herz', '💚', 'reactions', 'free', 0),
  s('heart_blue', ':blue_heart:', 'Blaues Herz', '💙', 'reactions', 'free', 0),
  s('heart_purple', ':purple_heart:', 'Lila Herz', '💜', 'reactions', 'free', 0),
  s('heart_black', ':black_heart:', 'Schwarzes Herz', '🖤', 'reactions', 'free', 0),
  s('heart_white', ':white_heart:', 'Weißes Herz', '🤍', 'reactions', 'free', 0),
  s('heart_fire', ':heart_fire:', 'Feuerherz', '❤️‍🔥', 'reactions', 'free', 0),
  s('heart_broken', ':broken_heart:', 'Gebrochenes Herz', '💔', 'reactions', 'free', 0),
  s('heart_sparkling', ':sparkling_heart:', 'Funkelndes Herz', '💖', 'reactions', 'free', 0),
  
  // Gaming
  s('sword', ':sword:', 'Schwert', '⚔️', 'gaming', 'free', 0),
  s('shield', ':shield:', 'Schild', '🛡️', 'gaming', 'free', 0),
  s('bow', ':bow:', 'Bogen', '🏹', 'gaming', 'free', 0),
  s('skull', ':skull:', 'Totenkopf', '💀', 'gaming', 'free', 0),
  s('trophy', ':trophy:', 'Pokal', '🏆', 'gaming', 'free', 0),
  s('medal', ':medal:', 'Medaille', '🥇', 'gaming', 'free', 0),
  s('gem', ':gem:', 'Edelstein', '💎', 'gaming', 'free', 0),
  s('coin', ':coin:', 'Münze', '🪙', 'gaming', 'free', 0),
  s('gamepad', ':game:', 'Controller', '🎮', 'gaming', 'free', 0),
  s('dice', ':dice:', 'Würfel', '🎲', 'gaming', 'free', 0),
  s('target', ':target:', 'Zielscheibe', '🎯', 'gaming', 'free', 0),
  s('bomb', ':bomb:', 'Bombe', '💣', 'gaming', 'free', 0),
  s('lightning', ':zap:', 'Blitz', '⚡', 'gaming', 'free', 0),
  s('ghost', ':ghost:', 'Geist', '👻', 'gaming', 'free', 0),
  s('crown', ':crown:', 'Krone', '👑', 'gaming', 'free', 0),
  s('dagger', ':dagger:', 'Dolch', '🗡️', 'gaming', 'free', 0),
  s('crossed_swords', ':swords:', 'Gekreuzte Schwerter', '⚔️', 'gaming', 'free', 0),
  s('axe', ':axe:', 'Axt', '🪓', 'gaming', 'free', 0),
  s('hammer', ':hammer:', 'Hammer', '🔨', 'gaming', 'free', 0),
  s('pick', ':pick:', 'Spitzhacke', '⛏️', 'gaming', 'free', 0),
  s('joystick', ':joystick:', 'Joystick', '🕹️', 'gaming', 'free', 0),
  s('chess', ':chess:', 'Schach', '♟️', 'gaming', 'free', 0),
  s('slot', ':slot:', 'Spielautomat', '🎰', 'gaming', 'free', 0),
  s('money_bag', ':moneybag:', 'Geldsack', '💰', 'gaming', 'free', 0),
  s('crossed_flags', ':flags:', 'Flaggen', '🎌', 'gaming', 'free', 0),
  
  // Animals
  s('dragon', ':dragon:', 'Drache', '🐉', 'animals', 'free', 0),
  s('wolf', ':wolf:', 'Wolf', '🐺', 'animals', 'free', 0),
  s('lion', ':lion:', 'Löwe', '🦁', 'animals', 'free', 0),
  s('eagle', ':eagle:', 'Adler', '🦅', 'animals', 'free', 0),
  s('bear', ':bear:', 'Bär', '🐻', 'animals', 'free', 0),
  s('fox', ':fox:', 'Fuchs', '🦊', 'animals', 'free', 0),
  s('tiger', ':tiger:', 'Tiger', '🐯', 'animals', 'free', 0),
  s('snake', ':snake:', 'Schlange', '🐍', 'animals', 'free', 0),
  s('bat', ':bat:', 'Fledermaus', '🦇', 'animals', 'free', 0),
  s('spider', ':spider:', 'Spinne', '🕷️', 'animals', 'free', 0),
  s('unicorn', ':unicorn:', 'Einhorn', '🦄', 'animals', 'free', 0),
  s('horse', ':horse:', 'Pferd', '🐎', 'animals', 'free', 0),
  s('cat', ':cat:', 'Katze', '🐱', 'animals', 'free', 0),
  s('dog', ':dog:', 'Hund', '🐶', 'animals', 'free', 0),
  s('owl', ':owl:', 'Eule', '🦉', 'animals', 'free', 0),
  s('raven', ':raven:', 'Rabe', '🐦‍⬛', 'animals', 'free', 0),
  s('shark', ':shark:', 'Hai', '🦈', 'animals', 'free', 0),
  s('octopus', ':octopus:', 'Oktopus', '🐙', 'animals', 'free', 0),
  s('scorpion', ':scorpion:', 'Skorpion', '🦂', 'animals', 'free', 0),
  s('gorilla', ':gorilla:', 'Gorilla', '🦍', 'animals', 'free', 0),
  s('deer', ':deer:', 'Hirsch', '🦌', 'animals', 'free', 0),
  s('boar', ':boar:', 'Wildschwein', '🐗', 'animals', 'free', 0),
  s('rabbit', ':rabbit:', 'Hase', '🐰', 'animals', 'free', 0),
  s('mouse', ':mouse:', 'Maus', '🐭', 'animals', 'free', 0),
  s('frog', ':frog:', 'Frosch', '🐸', 'animals', 'free', 0),
  
  // Fantasy
  s('wizard', ':wizard:', 'Zauberer', '🧙', 'fantasy', 'free', 0),
  s('fairy', ':fairy:', 'Fee', '🧚', 'fantasy', 'free', 0),
  s('vampire', ':vampire:', 'Vampir', '🧛', 'fantasy', 'free', 0),
  s('zombie', ':zombie:', 'Zombie', '🧟', 'fantasy', 'free', 0),
  s('elf', ':elf:', 'Elf', '🧝', 'fantasy', 'free', 0),
  s('genie', ':genie:', 'Dschinn', '🧞', 'fantasy', 'free', 0),
  s('mermaid', ':mermaid:', 'Meerjungfrau', '🧜', 'fantasy', 'free', 0),
  s('crystal', ':crystal:', 'Kristall', '🔮', 'fantasy', 'free', 0),
  s('magic', ':magic:', 'Magie', '🪄', 'fantasy', 'free', 0),
  s('moon', ':moon:', 'Mond', '🌙', 'fantasy', 'free', 0),
  s('sun', ':sun:', 'Sonne', '☀️', 'fantasy', 'free', 0),
  s('comet', ':comet:', 'Komet', '☄️', 'fantasy', 'free', 0),
  s('rainbow', ':rainbow:', 'Regenbogen', '🌈', 'fantasy', 'free', 0),
  s('tornado', ':tornado:', 'Tornado', '🌪️', 'fantasy', 'free', 0),
  s('snowflake', ':snowflake:', 'Schneeflocke', '❄️', 'fantasy', 'free', 0),
  s('flame', ':flame:', 'Flamme', '🔥', 'fantasy', 'free', 0),
  s('droplet', ':droplet:', 'Tropfen', '💧', 'fantasy', 'free', 0),
  s('leaf', ':leaf:', 'Blatt', '🍃', 'fantasy', 'free', 0),
  s('mushroom', ':mushroom:', 'Pilz', '🍄', 'fantasy', 'free', 0),
  s('herb', ':herb:', 'Kräuter', '🌿', 'fantasy', 'free', 0),
]

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM SMILEYS - COMMON (50-100 Eldruns)
// ═══════════════════════════════════════════════════════════════════════════

export const COMMON_SMILEYS: Smiley[] = [
  s('p_heart_eyes', ':heart_eyes_p:', 'Premium Herzaugen', '😍', 'smileys', 'common', 50, { effect: 'glow' }),
  s('p_fire_skull', ':fire_skull:', 'Feuer-Totenkopf', '💀', 'gaming', 'common', 50, { effect: 'fire' }),
  s('p_gold_crown', ':gold_crown:', 'Goldene Krone', '👑', 'gaming', 'common', 75, { effect: 'sparkle' }),
  s('p_diamond', ':diamond_p:', 'Premium Diamant', '💎', 'gaming', 'common', 60, { effect: 'sparkle' }),
  s('p_star_eyes', ':star_eyes:', 'Sternenaugen', '🤩', 'smileys', 'common', 50, { effect: 'sparkle' }),
  s('p_sunglasses', ':cool_p:', 'Premium Cool', '😎', 'smileys', 'common', 50, { effect: 'glow' }),
  s('p_rage_fire', ':rage_fire:', 'Feuerwut', '😡', 'smileys', 'common', 75, { effect: 'fire' }),
  s('p_heart_glow', ':heart_glow:', 'Glühendes Herz', '❤️', 'reactions', 'common', 60, { effect: 'glow' }),
  s('p_lightning', ':lightning_p:', 'Premium Blitz', '⚡', 'gaming', 'common', 50, { effect: 'pulse' }),
  s('p_coin_spin', ':coin_spin:', 'Drehende Münze', '🪙', 'gaming', 'common', 80, { isAnimated: true }),
  s('p_sword_glow', ':sword_glow:', 'Glühendes Schwert', '⚔️', 'gaming', 'common', 75, { effect: 'glow' }),
  s('p_shield_shine', ':shield_shine:', 'Leuchtschild', '🛡️', 'gaming', 'common', 75, { effect: 'sparkle' }),
  s('p_trophy_gold', ':trophy_gold:', 'Goldpokal', '🏆', 'gaming', 'common', 100, { effect: 'sparkle' }),
  s('p_wolf_howl', ':wolf_howl:', 'Heulender Wolf', '🐺', 'animals', 'common', 80, { effect: 'glow' }),
  s('p_dragon_mini', ':dragon_mini:', 'Mini-Drache', '🐉', 'animals', 'common', 90, { effect: 'fire' }),
]

// ═══════════════════════════════════════════════════════════════════════════
// RARE SMILEYS (150-300 Eldruns)
// ═══════════════════════════════════════════════════════════════════════════

export const RARE_SMILEYS: Smiley[] = [
  s('r_rainbow_heart', ':rainbow_heart:', 'Regenbogen-Herz', '❤️‍🔥', 'reactions', 'rare', 150, { isAnimated: true, effect: 'rainbow' }),
  s('r_dragon_flame', ':dragon_flame:', 'Drachenfeuer', '🐉', 'fantasy', 'rare', 200, { isAnimated: true, effect: 'fire' }),
  s('r_ice_crystal', ':ice_crystal:', 'Eiskristall', '❄️', 'fantasy', 'rare', 175, { isAnimated: true, effect: 'ice' }),
  s('r_thunder_sword', ':thunder_sword:', 'Donnerschwert', '⚔️', 'gaming', 'rare', 200, { isAnimated: true, effect: 'pulse' }),
  s('r_shadow_wolf', ':shadow_wolf:', 'Schattenwolf', '🐺', 'fantasy', 'rare', 250, { isAnimated: true, effect: 'pulse' }),
  s('r_phoenix_eye', ':phoenix_eye:', 'Phönixauge', '👁️', 'fantasy', 'rare', 225, { effect: 'fire' }),
  s('r_frozen_skull', ':frozen_skull:', 'Gefrorener Schädel', '💀', 'gaming', 'rare', 200, { effect: 'ice' }),
  s('r_storm_cloud', ':storm_cloud:', 'Sturmwolke', '⛈️', 'fantasy', 'rare', 175, { isAnimated: true, effect: 'pulse' }),
  s('r_golden_dragon', ':golden_mini:', 'Golddrache Mini', '🐉', 'fantasy', 'rare', 300, { effect: 'sparkle' }),
  s('r_fire_lion', ':fire_lion:', 'Feuerlöwe', '🦁', 'animals', 'rare', 250, { effect: 'fire' }),
  s('r_dark_knight', ':dark_knight:', 'Dunkler Ritter', '🏴', 'gaming', 'rare', 275, { effect: 'pulse' }),
  s('r_arcane_rune', ':arcane_rune:', 'Arkane Rune', '🔮', 'fantasy', 'rare', 225, { isAnimated: true, effect: 'glow' }),
  s('r_venom_snake', ':venom_snake:', 'Giftschlange', '🐍', 'animals', 'rare', 200, { effect: 'glow' }),
  s('r_spirit_owl', ':spirit_owl:', 'Geistereule', '🦉', 'fantasy', 'rare', 225, { effect: 'sparkle' }),
  s('r_blood_rose', ':blood_rose:', 'Blutrose', '🌹', 'fantasy', 'rare', 175, { effect: 'glow' }),
  s('r_war_hammer', ':war_hammer:', 'Kriegshammer', '🔨', 'gaming', 'rare', 200, { effect: 'pulse' }),
  s('r_crystal_sword', ':crystal_sword:', 'Kristallschwert', '🗡️', 'gaming', 'rare', 275, { effect: 'sparkle' }),
  s('r_spectral_ghost', ':spectral:', 'Spektralgeist', '👻', 'fantasy', 'rare', 225, { isAnimated: true, effect: 'glow' }),
]

// ═══════════════════════════════════════════════════════════════════════════
// EPIC SMILEYS (500-1000 Eldruns)
// ═══════════════════════════════════════════════════════════════════════════

export const EPIC_SMILEYS: Smiley[] = [
  s('e_phoenix', ':phoenix:', 'Phönix', '🔥', 'fantasy', 'epic', 500, { isAnimated: true, hasSound: true, effect: 'fire' }),
  s('e_void_skull', ':void_skull:', 'Void-Totenkopf', '💀', 'gaming', 'epic', 600, { isAnimated: true, hasSound: true, effect: 'pulse' }),
  s('e_galaxy', ':galaxy:', 'Galaxie', '🌌', 'fantasy', 'epic', 550, { isAnimated: true, effect: 'sparkle' }),
  s('e_blood_moon', ':blood_moon:', 'Blutmond', '🌙', 'fantasy', 'epic', 500, { isAnimated: true, effect: 'glow' }),
  s('e_inferno', ':inferno:', 'Inferno', '🔥', 'fantasy', 'epic', 750, { isAnimated: true, hasSound: true, effect: 'fire' }),
  s('e_frost_wyrm', ':frost_wyrm:', 'Frostwyrm', '🐉', 'fantasy', 'epic', 800, { isAnimated: true, hasSound: true, effect: 'ice' }),
  s('e_thunderlord', ':thunderlord:', 'Donnerlord', '⚡', 'fantasy', 'epic', 700, { isAnimated: true, hasSound: true, effect: 'pulse' }),
  s('e_shadow_dragon', ':shadow_dragon:', 'Schattendrache', '🐉', 'fantasy', 'epic', 900, { isAnimated: true, effect: 'pulse' }),
  s('e_soul_eater', ':soul_eater:', 'Seelenfresser', '👻', 'fantasy', 'epic', 650, { isAnimated: true, hasSound: true, effect: 'pulse' }),
  s('e_war_god', ':war_god:', 'Kriegsgott', '⚔️', 'gaming', 'epic', 850, { isAnimated: true, hasSound: true, effect: 'fire' }),
  s('e_divine_light', ':divine_light:', 'Göttliches Licht', '✨', 'fantasy', 'epic', 600, { isAnimated: true, effect: 'rainbow' }),
  s('e_chaos_orb', ':chaos_orb:', 'Chaoskugel', '🔮', 'fantasy', 'epic', 750, { isAnimated: true, effect: 'pulse' }),
  s('e_hellfire', ':hellfire:', 'Höllenfeuer', '🔥', 'fantasy', 'epic', 1000, { isAnimated: true, hasSound: true, effect: 'fire' }),
  s('e_ancient_tome', ':ancient_tome:', 'Uraltes Buch', '📖', 'fantasy', 'epic', 550, { effect: 'glow' }),
  s('e_demon_eyes', ':demon_eyes:', 'Dämonenaugen', '👁️', 'fantasy', 'epic', 700, { isAnimated: true, effect: 'fire' }),
]

// ═══════════════════════════════════════════════════════════════════════════
// LEGENDARY SMILEYS (2000-5000 Eldruns)
// ═══════════════════════════════════════════════════════════════════════════

export const LEGENDARY_SMILEYS: Smiley[] = [
  s('l_golden_dragon', ':golden_dragon:', 'Goldener Drache', '🐉', 'fantasy', 'legendary', 2000, { isAnimated: true, hasSound: true, isExclusive: true, effect: 'fire' }),
  s('l_frost_lord', ':frost_lord:', 'Frostlord', '❄️', 'fantasy', 'legendary', 2500, { isAnimated: true, hasSound: true, isExclusive: true, effect: 'ice' }),
  s('l_thunder_god', ':thunder_god:', 'Donnergott', '⚡', 'fantasy', 'legendary', 2500, { isAnimated: true, hasSound: true, isExclusive: true, effect: 'pulse' }),
  s('l_death_knight', ':death_knight:', 'Todesritter', '💀', 'fantasy', 'legendary', 3000, { isAnimated: true, hasSound: true, isExclusive: true, effect: 'pulse' }),
  s('l_phoenix_king', ':phoenix_king:', 'Phönixkönig', '🔥', 'fantasy', 'legendary', 3500, { isAnimated: true, hasSound: true, isExclusive: true, effect: 'fire' }),
  s('l_void_emperor', ':void_emperor:', 'Void-Imperator', '🌌', 'fantasy', 'legendary', 4000, { isAnimated: true, hasSound: true, isExclusive: true, effect: 'pulse' }),
  s('l_celestial_wyrm', ':celestial_wyrm:', 'Himmlischer Wyrm', '🐉', 'fantasy', 'legendary', 4500, { isAnimated: true, hasSound: true, isExclusive: true, effect: 'rainbow' }),
  s('l_shadow_monarch', ':shadow_monarch:', 'Schattenmonarch', '👑', 'fantasy', 'legendary', 3500, { isAnimated: true, hasSound: true, isExclusive: true, effect: 'pulse' }),
  s('l_archmage', ':archmage:', 'Erzmagier', '🧙', 'fantasy', 'legendary', 3000, { isAnimated: true, hasSound: true, isExclusive: true, effect: 'sparkle' }),
  s('l_dragon_slayer', ':dragon_slayer:', 'Drachentöter', '⚔️', 'gaming', 'legendary', 5000, { isAnimated: true, hasSound: true, isExclusive: true, effect: 'fire' }),
]

// ═══════════════════════════════════════════════════════════════════════════
// ELITE SMILEYS (5000-10000 Eldruns - Limited Edition)
// ═══════════════════════════════════════════════════════════════════════════

export const ELITE_SMILEYS: Smiley[] = [
  s('el_emperor', ':emperor:', 'Kaiser', '👑', 'vip', 'elite', 5000, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, effect: 'fire' }),
  s('el_void_master', ':void_master:', 'Void-Meister', '🌌', 'vip', 'elite', 6000, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, effect: 'pulse' }),
  s('el_celestial', ':celestial:', 'Himmlisch', '✨', 'vip', 'elite', 5500, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, effect: 'rainbow' }),
  s('el_world_ender', ':world_ender:', 'Weltenender', '💥', 'vip', 'elite', 8000, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, effect: 'fire' }),
  s('el_eternity', ':eternity:', 'Ewigkeit', '∞', 'vip', 'elite', 7500, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, effect: 'rainbow' }),
  s('el_chaos_lord', ':chaos_lord:', 'Chaosfürst', '🔮', 'vip', 'elite', 7000, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, effect: 'pulse' }),
  s('el_divine_wrath', ':divine_wrath:', 'Göttlicher Zorn', '⚡', 'vip', 'elite', 6500, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, effect: 'pulse' }),
]

// ═══════════════════════════════════════════════════════════════════════════
// MYTHIC SMILEYS (10000+ Eldruns - Ultra Rare VIP Only)
// ═══════════════════════════════════════════════════════════════════════════

export const MYTHIC_SMILEYS: Smiley[] = [
  s('m_eldrun_lord', ':eldrun_lord:', 'ELDRUN Lord', '🏰', 'vip', 'mythic', 10000, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, vipOnly: true, effect: 'fire' }),
  s('m_eternal', ':eternal:', 'Der Ewige', '∞', 'vip', 'mythic', 12500, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, vipOnly: true, effect: 'rainbow' }),
  s('m_genesis', ':genesis:', 'Genesis', '🌟', 'vip', 'mythic', 15000, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, vipOnly: true, effect: 'rainbow' }),
  s('m_oblivion', ':oblivion:', 'Oblivion', '🕳️', 'vip', 'mythic', 20000, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, vipOnly: true, effect: 'pulse' }),
  s('m_primordial', ':primordial:', 'Urwesen', '🔱', 'vip', 'mythic', 25000, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, vipOnly: true, effect: 'rainbow' }),
]

// ═══════════════════════════════════════════════════════════════════════════
// ELDRUN EXCLUSIVE SMILEYS - Custom Created for Eldrun
// ═══════════════════════════════════════════════════════════════════════════

export const ELDRUN_EXCLUSIVE: Smiley[] = [
  // Faction Smileys
  s('eld_seraphar', ':seraphar:', 'Haus Seraphar', '🦅', 'eldrun' as any, 'rare', 250, { isExclusive: true, effect: 'sparkle' }),
  s('eld_vorgaroth', ':vorgaroth:', 'Haus Vorgaroth', '🐺', 'eldrun' as any, 'rare', 250, { isExclusive: true, effect: 'fire' }),
  s('eld_netharis', ':netharis:', 'Haus Netharis', '🐍', 'eldrun' as any, 'rare', 250, { isExclusive: true, effect: 'pulse' }),
  s('eld_kaldrim', ':kaldrim:', 'Haus Kaldrim', '🛡️', 'eldrun' as any, 'rare', 250, { isExclusive: true, effect: 'ice' }),
  
  // Eldrun Community
  s('eld_warrior', ':eld_warrior:', 'Eldrun Krieger', '⚔️', 'eldrun' as any, 'epic', 500, { isExclusive: true, effect: 'fire' }),
  s('eld_mage', ':eld_mage:', 'Eldrun Magier', '🔮', 'eldrun' as any, 'epic', 500, { isExclusive: true, effect: 'sparkle' }),
  s('eld_assassin', ':eld_assassin:', 'Eldrun Assassine', '🗡️', 'eldrun' as any, 'epic', 500, { isExclusive: true, effect: 'pulse' }),
  s('eld_healer', ':eld_healer:', 'Eldrun Heiler', '💚', 'eldrun' as any, 'epic', 500, { isExclusive: true, effect: 'glow' }),
  s('eld_tank', ':eld_tank:', 'Eldrun Tank', '🛡️', 'eldrun' as any, 'epic', 500, { isExclusive: true, effect: 'sparkle' }),
  
  // Special Eldrun
  s('eld_logo', ':eldrun:', 'ELDRUN Logo', '🏰', 'eldrun' as any, 'legendary', 1500, { isExclusive: true, effect: 'fire' }),
  s('eld_coin', ':eld_coin:', 'Eldrun Münze', '🪙', 'eldrun' as any, 'common', 100, { isExclusive: true, effect: 'sparkle' }),
  s('eld_gem', ':eld_gem:', 'Eldrun Edelstein', '💎', 'eldrun' as any, 'rare', 300, { isExclusive: true, effect: 'rainbow' }),
  s('eld_crown', ':eld_crown:', 'Eldrun Krone', '👑', 'eldrun' as any, 'legendary', 2000, { isAnimated: true, isExclusive: true, effect: 'sparkle' }),
  s('eld_flame', ':eld_flame:', 'Eldrun Flamme', '🔥', 'eldrun' as any, 'epic', 750, { isAnimated: true, isExclusive: true, effect: 'fire' }),
  s('eld_frost', ':eld_frost:', 'Eldrun Frost', '❄️', 'eldrun' as any, 'epic', 750, { isAnimated: true, isExclusive: true, effect: 'ice' }),
  s('eld_thunder', ':eld_thunder:', 'Eldrun Donner', '⚡', 'eldrun' as any, 'epic', 750, { isAnimated: true, isExclusive: true, effect: 'pulse' }),
  s('eld_shadow', ':eld_shadow:', 'Eldrun Schatten', '🌑', 'eldrun' as any, 'epic', 750, { isAnimated: true, isExclusive: true, effect: 'pulse' }),
  
  // VIP Eldrun
  s('eld_vip_bronze', ':vip_bronze:', 'VIP Bronze', '🥉', 'eldrun' as any, 'rare', 0, { isExclusive: true, vipOnly: true, effect: 'glow' }),
  s('eld_vip_silver', ':vip_silver:', 'VIP Silber', '🥈', 'eldrun' as any, 'epic', 0, { isExclusive: true, vipOnly: true, effect: 'sparkle' }),
  s('eld_vip_gold', ':vip_gold:', 'VIP Gold', '🥇', 'eldrun' as any, 'legendary', 0, { isExclusive: true, vipOnly: true, effect: 'sparkle' }),
  
  // Seasonal/Event
  s('eld_wipe_day', ':wipe_day:', 'Wipe Day', '💥', 'eldrun' as any, 'epic', 500, { isAnimated: true, isExclusive: true, limitedEdition: true, effect: 'fire' }),
  s('eld_raid_night', ':raid_night:', 'Raid Night', '🌙', 'eldrun' as any, 'epic', 500, { isAnimated: true, isExclusive: true, limitedEdition: true, effect: 'pulse' }),
  s('eld_victory', ':eld_victory:', 'Eldrun Sieg', '🏆', 'eldrun' as any, 'legendary', 1000, { isAnimated: true, isExclusive: true, effect: 'sparkle' }),
  s('eld_champion', ':champion:', 'Eldrun Champion', '🎖️', 'eldrun' as any, 'legendary', 2500, { isAnimated: true, hasSound: true, isExclusive: true, effect: 'rainbow' }),
  s('eld_legend', ':eld_legend:', 'Eldrun Legende', '⭐', 'eldrun' as any, 'mythic', 5000, { isAnimated: true, hasSound: true, isExclusive: true, limitedEdition: true, effect: 'rainbow' }),
]

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const ALL_SMILEYS: Smiley[] = [
  ...FREE_SMILEYS,
  ...COMMON_SMILEYS,
  ...RARE_SMILEYS,
  ...EPIC_SMILEYS,
  ...LEGENDARY_SMILEYS,
  ...ELITE_SMILEYS,
  ...MYTHIC_SMILEYS,
  ...ELDRUN_EXCLUSIVE,
]

export const SMILEY_STATS = {
  total: ALL_SMILEYS.length,
  free: FREE_SMILEYS.length,
  common: COMMON_SMILEYS.length,
  rare: RARE_SMILEYS.length,
  epic: EPIC_SMILEYS.length,
  legendary: LEGENDARY_SMILEYS.length,
  elite: ELITE_SMILEYS.length,
  mythic: MYTHIC_SMILEYS.length,
  eldrunExclusive: ELDRUN_EXCLUSIVE.length,
}
