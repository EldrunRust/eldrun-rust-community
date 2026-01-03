import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ALL_SMILEYS as IMPORTED_SMILEYS, SMILEY_STATS } from '@/data/smileyData'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES - ELDRUN PREMIUM SMILEY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export type SmileyRarity = 'free' | 'common' | 'rare' | 'epic' | 'legendary' | 'elite' | 'mythic'
export type SmileyCategory = 'smileys' | 'gaming' | 'reactions' | 'animals' | 'fantasy' | 'emotes' | 'seasonal' | 'vip' | 'animated' | 'eldrun'

export interface Smiley {
  id: string
  code: string // :smiley_code:
  name: string
  emoji: string // Unicode emoji or image URL
  category: SmileyCategory
  rarity: SmileyRarity
  
  // Pricing
  price: number // in Eldruns (0 = free)
  rentPrice?: number // per week
  
  // Features
  isAnimated: boolean
  hasSound: boolean
  isExclusive: boolean
  
  // Effects
  effect?: 'glow' | 'sparkle' | 'fire' | 'ice' | 'rainbow' | 'shake' | 'bounce' | 'pulse'
  
  // Stats
  timesUsed: number
  ownersCount: number
  
  // Availability
  isAvailable: boolean
  limitedEdition?: boolean
  availableUntil?: string
  
  // Requirements
  minLevel?: number
  vipOnly?: boolean
  
  createdAt: string
}

export interface OwnedSmiley {
  smileyId: string
  purchasedAt: string
  rentedUntil?: string // If rented
  isForSale: boolean
  salePrice?: number
  isForRent: boolean
  rentPrice?: number
}

export interface SmileyTransaction {
  id: string
  type: 'purchase' | 'sale' | 'rent_out' | 'rent_in'
  smileyId: string
  fromUserId?: string
  toUserId?: string
  price: number
  createdAt: string
}

// ═══════════════════════════════════════════════════════════════════════════
// SMILEY DATA - 500+ FREE + PREMIUM + ELITE
// ═══════════════════════════════════════════════════════════════════════════

const FREE_SMILEYS: Smiley[] = [
  // Basic Smileys (50)
  { id: 'smile', code: ':)', name: 'Lächeln', emoji: '😊', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 125000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'grin', code: ':D', name: 'Grinsen', emoji: '😀', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 98000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'wink', code: ';)', name: 'Zwinkern', emoji: '😉', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 87000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'love', code: ':heart:', name: 'Herz', emoji: '❤️', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 156000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'sad', code: ':(', name: 'Traurig', emoji: '😢', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 45000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'angry', code: ':@', name: 'Wütend', emoji: '😠', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 32000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'cool', code: 'B)', name: 'Cool', emoji: '😎', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 67000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'laugh', code: ':lol:', name: 'Lachen', emoji: '😂', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 234000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'thinking', code: ':think:', name: 'Nachdenken', emoji: '🤔', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 78000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'surprised', code: ':o', name: 'Überrascht', emoji: '😮', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 56000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'tongue', code: ':P', name: 'Zunge', emoji: '😛', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 89000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'crazy', code: ':crazy:', name: 'Verrückt', emoji: '🤪', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 43000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'kiss', code: ':kiss:', name: 'Kuss', emoji: '😘', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 67000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'blush', code: ':blush:', name: 'Erröten', emoji: '😊', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 54000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'angel', code: ':angel:', name: 'Engel', emoji: '😇', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 34000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'devil', code: ':devil:', name: 'Teufel', emoji: '😈', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 45000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'sleepy', code: ':zzz:', name: 'Müde', emoji: '😴', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 23000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'sick', code: ':sick:', name: 'Krank', emoji: '🤢', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 12000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'party', code: ':party:', name: 'Party', emoji: '🥳', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 89000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'nerd', code: ':nerd:', name: 'Nerd', emoji: '🤓', category: 'smileys', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 34000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  
  // Reactions (30)
  { id: 'thumbsup', code: ':+1:', name: 'Daumen hoch', emoji: '👍', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 345000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'thumbsdown', code: ':-1:', name: 'Daumen runter', emoji: '👎', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 67000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'clap', code: ':clap:', name: 'Applaus', emoji: '👏', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 123000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'fire', code: ':fire:', name: 'Feuer', emoji: '🔥', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 267000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'hundred', code: ':100:', name: '100', emoji: '💯', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 189000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'check', code: ':check:', name: 'Check', emoji: '✅', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 234000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'cross', code: ':x:', name: 'Kreuz', emoji: '❌', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 145000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'star', code: ':star:', name: 'Stern', emoji: '⭐', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 178000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'sparkles', code: ':sparkles:', name: 'Funken', emoji: '✨', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 156000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'boom', code: ':boom:', name: 'Boom', emoji: '💥', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 89000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'eyes', code: ':eyes:', name: 'Augen', emoji: '👀', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 198000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'pray', code: ':pray:', name: 'Beten', emoji: '🙏', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 134000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'wave', code: ':wave:', name: 'Winken', emoji: '👋', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 167000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'ok', code: ':ok:', name: 'OK', emoji: '👌', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 145000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'fist', code: ':fist:', name: 'Faust', emoji: '✊', category: 'reactions', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 89000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  
  // Gaming (40)
  { id: 'sword', code: ':sword:', name: 'Schwert', emoji: '⚔️', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 234000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'shield', code: ':shield:', name: 'Schild', emoji: '🛡️', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 189000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'bow', code: ':bow:', name: 'Bogen', emoji: '🏹', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 134000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'skull', code: ':skull:', name: 'Totenkopf', emoji: '💀', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 267000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'trophy', code: ':trophy:', name: 'Pokal', emoji: '🏆', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 178000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'medal', code: ':medal:', name: 'Medaille', emoji: '🥇', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 145000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'gem', code: ':gem:', name: 'Edelstein', emoji: '💎', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 198000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'coin', code: ':coin:', name: 'Münze', emoji: '🪙', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 267000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'gamepad', code: ':game:', name: 'Controller', emoji: '🎮', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 145000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'dice', code: ':dice:', name: 'Würfel', emoji: '🎲', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 123000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'target', code: ':target:', name: 'Zielscheibe', emoji: '🎯', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 89000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'bomb', code: ':bomb:', name: 'Bombe', emoji: '💣', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 156000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'lightning', code: ':zap:', name: 'Blitz', emoji: '⚡', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 234000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'ghost', code: ':ghost:', name: 'Geist', emoji: '👻', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 98000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'crown', code: ':crown:', name: 'Krone', emoji: '👑', category: 'gaming', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 189000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  
  // Animals (40)
  { id: 'dragon', code: ':dragon:', name: 'Drache', emoji: '🐉', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 267000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'wolf', code: ':wolf:', name: 'Wolf', emoji: '🐺', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 198000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'lion', code: ':lion:', name: 'Löwe', emoji: '🦁', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 178000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'eagle', code: ':eagle:', name: 'Adler', emoji: '🦅', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 145000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'bear', code: ':bear:', name: 'Bär', emoji: '🐻', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 134000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'fox', code: ':fox:', name: 'Fuchs', emoji: '🦊', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 167000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'tiger', code: ':tiger:', name: 'Tiger', emoji: '🐯', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 156000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'snake', code: ':snake:', name: 'Schlange', emoji: '🐍', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 89000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'bat', code: ':bat:', name: 'Fledermaus', emoji: '🦇', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 78000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'spider', code: ':spider:', name: 'Spinne', emoji: '🕷️', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 67000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'unicorn', code: ':unicorn:', name: 'Einhorn', emoji: '🦄', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 189000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'horse', code: ':horse:', name: 'Pferd', emoji: '🐎', category: 'animals', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 123000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  
  // Fantasy (30)
  { id: 'wizard', code: ':wizard:', name: 'Zauberer', emoji: '🧙', category: 'fantasy', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 145000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'fairy', code: ':fairy:', name: 'Fee', emoji: '🧚', category: 'fantasy', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 134000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'vampire', code: ':vampire:', name: 'Vampir', emoji: '🧛', category: 'fantasy', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 98000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'zombie', code: ':zombie:', name: 'Zombie', emoji: '🧟', category: 'fantasy', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 87000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'elf', code: ':elf:', name: 'Elf', emoji: '🧝', category: 'fantasy', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 112000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'genie', code: ':genie:', name: 'Dschinn', emoji: '🧞', category: 'fantasy', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 67000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'mermaid', code: ':mermaid:', name: 'Meerjungfrau', emoji: '🧜', category: 'fantasy', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 89000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'crystal', code: ':crystal:', name: 'Kristall', emoji: '🔮', category: 'fantasy', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 134000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'magic', code: ':magic:', name: 'Magie', emoji: '🪄', category: 'fantasy', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 156000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'moon', code: ':moon:', name: 'Mond', emoji: '🌙', category: 'fantasy', rarity: 'free', price: 0, isAnimated: false, hasSound: false, isExclusive: false, timesUsed: 178000, ownersCount: 0, isAvailable: true, createdAt: '2024-01-01' },
]

const PREMIUM_SMILEYS: Smiley[] = [
  // Common Premium (50 Eldruns)
  { id: 'premium_heart_eyes', code: ':heart_eyes_premium:', name: 'Premium Herzaugen', emoji: '😍', category: 'smileys', rarity: 'common', price: 50, isAnimated: false, hasSound: false, isExclusive: false, effect: 'glow', timesUsed: 45000, ownersCount: 1234, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'premium_fire_skull', code: ':fire_skull:', name: 'Feuer-Totenkopf', emoji: '💀🔥', category: 'gaming', rarity: 'common', price: 50, isAnimated: false, hasSound: false, isExclusive: false, effect: 'fire', timesUsed: 67000, ownersCount: 2345, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'premium_gold_crown', code: ':gold_crown:', name: 'Goldene Krone', emoji: '👑', category: 'gaming', rarity: 'common', price: 50, isAnimated: false, hasSound: false, isExclusive: false, effect: 'sparkle', timesUsed: 89000, ownersCount: 3456, isAvailable: true, createdAt: '2024-01-01' },
  
  // Rare Premium (150 Eldruns)
  { id: 'rare_rainbow_heart', code: ':rainbow_heart:', name: 'Regenbogen-Herz', emoji: '❤️🌈', category: 'reactions', rarity: 'rare', price: 150, isAnimated: true, hasSound: false, isExclusive: false, effect: 'rainbow', timesUsed: 34000, ownersCount: 890, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'rare_dragon_flame', code: ':dragon_flame:', name: 'Drachenfeuer', emoji: '🐉🔥', category: 'fantasy', rarity: 'rare', price: 150, isAnimated: true, hasSound: false, isExclusive: false, effect: 'fire', timesUsed: 45000, ownersCount: 1234, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'rare_ice_crystal', code: ':ice_crystal:', name: 'Eiskristall', emoji: '❄️💎', category: 'fantasy', rarity: 'rare', price: 150, isAnimated: true, hasSound: false, isExclusive: false, effect: 'ice', timesUsed: 23000, ownersCount: 567, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'rare_thunder_sword', code: ':thunder_sword:', name: 'Donnerschwert', emoji: '⚔️⚡', category: 'gaming', rarity: 'rare', price: 150, isAnimated: true, hasSound: false, isExclusive: false, effect: 'pulse', timesUsed: 56000, ownersCount: 1456, isAvailable: true, createdAt: '2024-01-01' },
  
  // Epic Premium (500 Eldruns)
  { id: 'epic_phoenix', code: ':phoenix:', name: 'Phönix', emoji: '🔥🦅', category: 'fantasy', rarity: 'epic', price: 500, isAnimated: true, hasSound: true, isExclusive: false, effect: 'fire', timesUsed: 12000, ownersCount: 234, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'epic_void_skull', code: ':void_skull:', name: 'Void-Totenkopf', emoji: '💀✨', category: 'gaming', rarity: 'epic', price: 500, isAnimated: true, hasSound: true, isExclusive: false, effect: 'pulse', timesUsed: 8900, ownersCount: 189, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'epic_galaxy', code: ':galaxy:', name: 'Galaxie', emoji: '🌌', category: 'fantasy', rarity: 'epic', price: 500, isAnimated: true, hasSound: false, isExclusive: false, effect: 'sparkle', timesUsed: 15000, ownersCount: 345, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'epic_blood_moon', code: ':blood_moon:', name: 'Blutmond', emoji: '🌙🔴', category: 'fantasy', rarity: 'epic', price: 500, isAnimated: true, hasSound: false, isExclusive: false, effect: 'glow', timesUsed: 7800, ownersCount: 156, isAvailable: true, createdAt: '2024-01-01' },
]

const ELITE_SMILEYS: Smiley[] = [
  // Legendary (2000 Eldruns)
  { id: 'legendary_golden_dragon', code: ':golden_dragon:', name: 'Goldener Drache', emoji: '🐉👑', category: 'fantasy', rarity: 'legendary', price: 2000, isAnimated: true, hasSound: true, isExclusive: true, effect: 'fire', timesUsed: 2300, ownersCount: 45, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'legendary_frost_lord', code: ':frost_lord:', name: 'Frostlord', emoji: '❄️👑', category: 'fantasy', rarity: 'legendary', price: 2000, isAnimated: true, hasSound: true, isExclusive: true, effect: 'ice', timesUsed: 1800, ownersCount: 34, isAvailable: true, createdAt: '2024-01-01' },
  { id: 'legendary_thunder_god', code: ':thunder_god:', name: 'Donnergott', emoji: '⚡👑', category: 'fantasy', rarity: 'legendary', price: 2000, isAnimated: true, hasSound: true, isExclusive: true, effect: 'pulse', timesUsed: 2100, ownersCount: 41, isAvailable: true, createdAt: '2024-01-01' },
  
  // Elite (5000 Eldruns - Limited)
  { id: 'elite_emperor', code: ':emperor:', name: 'Kaiser', emoji: '👑⚔️🔥', category: 'vip', rarity: 'elite', price: 5000, isAnimated: true, hasSound: true, isExclusive: true, effect: 'fire', timesUsed: 890, ownersCount: 12, isAvailable: true, limitedEdition: true, createdAt: '2024-01-01' },
  { id: 'elite_void_master', code: ':void_master:', name: 'Void-Meister', emoji: '💀🌀✨', category: 'vip', rarity: 'elite', price: 5000, isAnimated: true, hasSound: true, isExclusive: true, effect: 'pulse', timesUsed: 567, ownersCount: 8, isAvailable: true, limitedEdition: true, createdAt: '2024-01-01' },
  { id: 'elite_celestial', code: ':celestial:', name: 'Himmlisch', emoji: '✨🌟👑', category: 'vip', rarity: 'elite', price: 5000, isAnimated: true, hasSound: true, isExclusive: true, effect: 'rainbow', timesUsed: 456, ownersCount: 6, isAvailable: true, limitedEdition: true, createdAt: '2024-01-01' },
  
  // Mythic (10000 Eldruns - Ultra Rare)
  { id: 'mythic_eldrun_lord', code: ':eldrun_lord:', name: 'ELDRUN Lord', emoji: '🏰👑🔥⚔️', category: 'vip', rarity: 'mythic', price: 10000, isAnimated: true, hasSound: true, isExclusive: true, effect: 'fire', timesUsed: 123, ownersCount: 3, isAvailable: true, limitedEdition: true, vipOnly: true, createdAt: '2024-01-01' },
  { id: 'mythic_eternal', code: ':eternal:', name: 'Ewigkeit', emoji: '∞✨👑', category: 'vip', rarity: 'mythic', price: 10000, isAnimated: true, hasSound: true, isExclusive: true, effect: 'rainbow', timesUsed: 89, ownersCount: 2, isAvailable: true, limitedEdition: true, vipOnly: true, createdAt: '2024-01-01' },
]

// Use expanded smiley data (800+ smileys)
export const ALL_SMILEYS: Smiley[] = IMPORTED_SMILEYS
export { SMILEY_STATS }

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

interface SmileyState {
  // All smileys
  smileys: Smiley[]
  
  // User's owned smileys
  ownedSmileys: OwnedSmiley[]
  
  // Favorites
  favoriteSmileys: string[]
  
  // Recent used
  recentSmileys: string[]
  
  // Marketplace listings
  marketListings: {
    smileyId: string
    sellerId: string
    sellerName: string
    price: number
    type: 'sale' | 'rent'
    rentDays?: number
  }[]
  
  // Transaction history
  transactions: SmileyTransaction[]
  
  // Actions
  buySmiley: (smileyId: string) => boolean
  sellSmiley: (smileyId: string, price: number) => void
  rentSmiley: (smileyId: string, days: number) => boolean
  listForSale: (smileyId: string, price: number) => void
  listForRent: (smileyId: string, pricePerWeek: number) => void
  cancelListing: (smileyId: string) => void
  toggleFavorite: (smileyId: string) => void
  addToRecent: (smileyId: string) => void
  
  // Getters
  getSmileyById: (id: string) => Smiley | undefined
  getSmileysByCategory: (category: SmileyCategory) => Smiley[]
  getSmileysByRarity: (rarity: SmileyRarity) => Smiley[]
  getOwnedSmileys: () => Smiley[]
  getFreeSmileys: () => Smiley[]
  getPremiumSmileys: () => Smiley[]
  getEliteSmileys: () => Smiley[]
  isOwned: (smileyId: string) => boolean
}

export const useSmileyStore = create<SmileyState>()(
  persist(
    (set, get) => ({
      smileys: ALL_SMILEYS,
      ownedSmileys: [],
      favoriteSmileys: [],
      recentSmileys: [],
      marketListings: [
        // Sample listings
        { smileyId: 'rare_rainbow_heart', sellerId: 'user_1', sellerName: 'DragonLord', price: 200, type: 'sale' },
        { smileyId: 'epic_phoenix', sellerId: 'user_2', sellerName: 'QueenValeria', price: 100, type: 'rent', rentDays: 7 },
      ],
      transactions: [],

      buySmiley: (smileyId) => {
        const smiley = get().smileys.find(s => s.id === smileyId)
        if (!smiley || get().isOwned(smileyId)) return false
        
        set((state) => ({
          ownedSmileys: [...state.ownedSmileys, {
            smileyId,
            purchasedAt: new Date().toISOString(),
            isForSale: false,
            isForRent: false,
          }],
          smileys: state.smileys.map(s => 
            s.id === smileyId ? { ...s, ownersCount: s.ownersCount + 1 } : s
          ),
          transactions: [{
            id: `tx_${Date.now()}`,
            type: 'purchase',
            smileyId,
            price: smiley.price,
            createdAt: new Date().toISOString(),
          }, ...state.transactions],
        }))
        return true
      },

      sellSmiley: (smileyId, price) => {
        set((state) => ({
          ownedSmileys: state.ownedSmileys.filter(s => s.smileyId !== smileyId),
          transactions: [{
            id: `tx_${Date.now()}`,
            type: 'sale',
            smileyId,
            price,
            createdAt: new Date().toISOString(),
          }, ...state.transactions],
        }))
      },

      rentSmiley: (smileyId, days) => {
        const smiley = get().smileys.find(s => s.id === smileyId)
        if (!smiley || !smiley.rentPrice) return false
        
        const rentUntil = new Date()
        rentUntil.setDate(rentUntil.getDate() + days)
        
        set((state) => ({
          ownedSmileys: [...state.ownedSmileys, {
            smileyId,
            purchasedAt: new Date().toISOString(),
            rentedUntil: rentUntil.toISOString(),
            isForSale: false,
            isForRent: false,
          }],
          transactions: [{
            id: `tx_${Date.now()}`,
            type: 'rent_in',
            smileyId,
            price: smiley.rentPrice! * (days / 7),
            createdAt: new Date().toISOString(),
          }, ...state.transactions],
        }))
        return true
      },

      listForSale: (smileyId, price) => {
        set((state) => ({
          ownedSmileys: state.ownedSmileys.map(s => 
            s.smileyId === smileyId ? { ...s, isForSale: true, salePrice: price } : s
          ),
          marketListings: [...state.marketListings, {
            smileyId,
            sellerId: 'current_user',
            sellerName: 'Du',
            price,
            type: 'sale',
          }],
        }))
      },

      listForRent: (smileyId, pricePerWeek) => {
        set((state) => ({
          ownedSmileys: state.ownedSmileys.map(s => 
            s.smileyId === smileyId ? { ...s, isForRent: true, rentPrice: pricePerWeek } : s
          ),
          marketListings: [...state.marketListings, {
            smileyId,
            sellerId: 'current_user',
            sellerName: 'Du',
            price: pricePerWeek,
            type: 'rent',
            rentDays: 7,
          }],
        }))
      },

      cancelListing: (smileyId) => {
        set((state) => ({
          ownedSmileys: state.ownedSmileys.map(s => 
            s.smileyId === smileyId ? { ...s, isForSale: false, isForRent: false } : s
          ),
          marketListings: state.marketListings.filter(l => 
            !(l.smileyId === smileyId && l.sellerId === 'current_user')
          ),
        }))
      },

      toggleFavorite: (smileyId) => {
        set((state) => ({
          favoriteSmileys: state.favoriteSmileys.includes(smileyId)
            ? state.favoriteSmileys.filter(id => id !== smileyId)
            : [...state.favoriteSmileys, smileyId],
        }))
      },

      addToRecent: (smileyId) => {
        set((state) => ({
          recentSmileys: [smileyId, ...state.recentSmileys.filter(id => id !== smileyId)].slice(0, 20),
        }))
      },

      // Getters
      getSmileyById: (id) => get().smileys.find(s => s.id === id),
      
      getSmileysByCategory: (category) => get().smileys.filter(s => s.category === category),
      
      getSmileysByRarity: (rarity) => get().smileys.filter(s => s.rarity === rarity),
      
      getOwnedSmileys: () => {
        const ownedIds = get().ownedSmileys.map(o => o.smileyId)
        return get().smileys.filter(s => ownedIds.includes(s.id))
      },
      
      getFreeSmileys: () => get().smileys.filter(s => s.rarity === 'free'),
      
      getPremiumSmileys: () => get().smileys.filter(s => 
        ['common', 'rare', 'epic'].includes(s.rarity)
      ),
      
      getEliteSmileys: () => get().smileys.filter(s => 
        ['legendary', 'elite', 'mythic'].includes(s.rarity)
      ),
      
      isOwned: (smileyId) => get().ownedSmileys.some(o => o.smileyId === smileyId),
    }),
    {
      name: 'eldrun-smiley-storage',
      partialize: (state) => ({
        ownedSmileys: state.ownedSmileys,
        favoriteSmileys: state.favoriteSmileys,
        recentSmileys: state.recentSmileys,
        transactions: state.transactions,
      }),
    }
  )
)

export default useSmileyStore
