'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, CreditCard, Package, Star, Crown, Shield,
  Sword, Gem, Gift, Zap, X, Plus, Minus, Check, Lock,
  Sparkles, Flame, Heart, ChevronRight, ExternalLink,
  Wallet, BadgeCheck, Timer, Percent, Tag, Copy, QrCode,
  RefreshCw, AlertCircle, Clock, Receipt, History, Bookmark,
  BookmarkCheck, Search, Filter, ArrowUpDown, TrendingUp,
  Globe, Smartphone, Mail, User, Hash, CheckCircle2, XCircle,
  Loader2, ArrowRight, Shield as ShieldIcon, Award, Coins
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ProductCategory = 'all' | 'vip' | 'kits' | 'skins' | 'items' | 'currency' | 'bundles' | 'services' | 'gifts'
type ProductRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
type PaymentMethod = 'paypal' | 'stripe' | 'crypto_btc' | 'crypto_eth' | 'crypto_usdt' | 'crypto_ltc' | 'crypto_sol' | 'paysafecard'
type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

interface Product {
  id: string
  name: string
  description: string
  category: ProductCategory
  rarity: ProductRarity
  price: number
  originalPrice?: number
  image: string
  icon: string
  features?: string[]
  duration?: string
  popular?: boolean
  new?: boolean
  limited?: boolean
  stock?: number
  discount?: number
  rating?: number
  reviews?: number
  soldCount?: number
}

interface CartItem {
  product: Product
  quantity: number
}

interface Order {
  id: string
  items: CartItem[]
  total: number
  status: OrderStatus
  paymentMethod: string
  date: Date
  steamId: string
  email: string
}

interface CryptoWallet {
  currency: string
  address: string
  network: string
  qrCode: string
  minConfirmations: number
}

interface CouponCode {
  code: string
  discount: number
  type: 'percent' | 'fixed'
  minPurchase?: number
  maxUses?: number
  usedCount: number
  expiresAt?: Date
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT DATA
// ═══════════════════════════════════════════════════════════════════════════

const PRODUCTS: Product[] = [
  // VIP Ranks
  {
    id: 'vip-bronze',
    name: 'VIP Bronze',
    description: 'Grundlegende VIP-Vorteile für Einsteiger',
    category: 'vip',
    rarity: 'uncommon',
    price: 4.99,
    image: '/shop/vip-bronze.png',
    icon: '🥉',
    features: ['2 Home-Punkte', 'Farbiger Chat-Name', 'VIP-Kit (48h CD)', '/kit vip'],
    duration: '30 Tage'
  },
  {
    id: 'vip-silver',
    name: 'VIP Silver',
    description: 'Erweiterte Vorteile für aktive Spieler',
    category: 'vip',
    rarity: 'rare',
    price: 9.99,
    originalPrice: 14.99,
    image: '/shop/vip-silver.png',
    icon: '🥈',
    features: ['5 Home-Punkte', 'Silberner Chat-Tag', 'VIP-Kit (24h CD)', 'Teleport-Rabatt 20%', '/backpack erweitert'],
    duration: '30 Tage',
    popular: true,
    discount: 33
  },
  {
    id: 'vip-gold',
    name: 'VIP Gold',
    description: 'Premium-Erlebnis mit exklusiven Boni',
    category: 'vip',
    rarity: 'epic',
    price: 19.99,
    originalPrice: 29.99,
    image: '/shop/vip-gold.png',
    icon: '🥇',
    features: ['10 Home-Punkte', 'Goldener Chat-Tag + Effekte', 'Elite-Kit (12h CD)', 'Teleport-Rabatt 50%', 'Priority Queue', '/fly in Safe Zones'],
    duration: '30 Tage',
    discount: 33
  },
  {
    id: 'vip-dragon',
    name: 'VIP Dragon',
    description: 'Das ultimative Eldrun Erlebnis',
    category: 'vip',
    rarity: 'legendary',
    price: 49.99,
    originalPrice: 79.99,
    image: '/shop/vip-dragon.png',
    icon: '🐉',
    features: ['Unbegrenzte Homes', 'Drachen-Chat-Effekte', 'Legendary-Kit (6h CD)', 'Kostenlose Teleports', 'VIP-Only Events', 'Exklusive Skins', 'Persönlicher Support'],
    duration: '30 Tage',
    popular: true,
    discount: 37
  },
  {
    id: 'vip-lifetime',
    name: 'VIP Lifetime',
    description: 'Einmalig kaufen, für immer genießen',
    category: 'vip',
    rarity: 'mythic',
    price: 149.99,
    originalPrice: 299.99,
    image: '/shop/vip-lifetime.png',
    icon: '👑',
    features: ['Alle VIP Dragon Features', 'LEBENSLANG gültig', 'Exklusiver Lifetime-Tag', 'Beta-Zugang', 'Namenswahl-Priorität', 'Custom Kit erstellen'],
    duration: 'Permanent',
    limited: true,
    stock: 23,
    discount: 50
  },

  // Kits
  {
    id: 'kit-starter',
    name: 'Starter Kit',
    description: 'Perfekt für den schnellen Einstieg',
    category: 'kits',
    rarity: 'common',
    price: 2.99,
    image: '/shop/kit-starter.png',
    icon: '📦',
    features: ['Stone Tools', 'Holzrüstung', '500 Holz', '250 Stein', '100 Metall']
  },
  {
    id: 'kit-warrior',
    name: 'Warrior Kit',
    description: 'Kampfbereit von Anfang an',
    category: 'kits',
    rarity: 'rare',
    price: 7.99,
    image: '/shop/kit-warrior.png',
    icon: '⚔️',
    features: ['Revolver + 50 Munition', 'Road Sign Armor', 'Med Kits x5', 'Bandagen x20'],
    popular: true
  },
  {
    id: 'kit-raider',
    name: 'Raider Kit',
    description: 'Alles für den erfolgreichen Raid',
    category: 'kits',
    rarity: 'epic',
    price: 14.99,
    image: '/shop/kit-raider.png',
    icon: '💥',
    features: ['C4 x4', 'Satchel x6', 'Rockets x8', 'AK-47 + 200 Munition', 'Metal Armor Set']
  },
  {
    id: 'kit-elite',
    name: 'Elite Kit',
    description: 'Militärische Ausrüstung der Spitzenklasse',
    category: 'kits',
    rarity: 'legendary',
    price: 24.99,
    originalPrice: 34.99,
    image: '/shop/kit-elite.png',
    icon: '🎖️',
    features: ['LR-300 + 500 Munition', 'M249 + 200 Munition', 'HQM Armor Set', 'C4 x8', 'Med Kits x20'],
    discount: 29,
    new: true
  },

  // Skins
  {
    id: 'skin-dragon-ak',
    name: 'Dragon Fire AK-47',
    description: 'Legendärer Drachen-Skin für AK-47',
    category: 'skins',
    rarity: 'legendary',
    price: 12.99,
    image: '/shop/skin-dragon-ak.png',
    icon: '🔥',
    features: ['Animierte Flammen', 'Glühende Augen', 'Kill-Counter']
  },
  {
    id: 'skin-void-armor',
    name: 'Void Armor Set',
    description: 'Komplettes Rüstungsset im Void-Design',
    category: 'skins',
    rarity: 'epic',
    price: 19.99,
    image: '/shop/skin-void-armor.png',
    icon: '🌀',
    features: ['Helm', 'Brustpanzer', 'Handschuhe', 'Hose', 'Stiefel'],
    popular: true
  },
  {
    id: 'skin-neon-set',
    name: 'Neon Weapon Pack',
    description: '5 Waffen im leuchtenden Neon-Look',
    category: 'skins',
    rarity: 'rare',
    price: 8.99,
    image: '/shop/skin-neon.png',
    icon: '💜',
    features: ['AK-47', 'LR-300', 'MP5', 'Revolver', 'Bolty']
  },
  {
    id: 'skin-golden-tools',
    name: 'Golden Tools',
    description: 'Vergoldete Werkzeuge für echte Könige',
    category: 'skins',
    rarity: 'epic',
    price: 6.99,
    image: '/shop/skin-golden-tools.png',
    icon: '✨',
    features: ['Spitzhacke', 'Axt', 'Hammer', 'Sichel'],
    new: true
  },

  // Items
  {
    id: 'item-resource-pack',
    name: 'Resource Pack',
    description: '50.000 Ressourcen deiner Wahl',
    category: 'items',
    rarity: 'uncommon',
    price: 4.99,
    image: '/shop/item-resources.png',
    icon: '🪵',
    features: ['50k Holz ODER', '50k Stein ODER', '25k Metall ODER', '10k HQM']
  },
  {
    id: 'item-scrap-bundle',
    name: 'Scrap Bundle',
    description: '10.000 Scrap für Forschung & Gambling',
    category: 'items',
    rarity: 'rare',
    price: 9.99,
    image: '/shop/item-scrap.png',
    icon: '⚙️',
    features: ['10.000 Scrap', 'Sofort verfügbar']
  },
  {
    id: 'item-blueprint-book',
    name: 'Blueprint Buch',
    description: 'Alle Tier 3 Blaupausen freigeschaltet',
    category: 'items',
    rarity: 'legendary',
    price: 29.99,
    image: '/shop/item-blueprints.png',
    icon: '📘',
    features: ['Alle Waffen-BPs', 'Alle Rüstungs-BPs', 'Alle Explosiv-BPs'],
    limited: true,
    stock: 50
  },

  // Currency
  {
    id: 'currency-1000',
    name: '1.000 Eldrun Coins',
    description: 'In-Game Währung für den Shop',
    category: 'currency',
    rarity: 'common',
    price: 0.99,
    image: '/shop/coins.png',
    icon: '🪙',
    features: ['1.000 Coins']
  },
  {
    id: 'currency-5500',
    name: '5.500 Eldrun Coins',
    description: '+10% Bonus Coins',
    category: 'currency',
    rarity: 'uncommon',
    price: 4.99,
    image: '/shop/coins.png',
    icon: '🪙',
    features: ['5.000 + 500 Bonus']
  },
  {
    id: 'currency-12000',
    name: '12.000 Eldrun Coins',
    description: '+20% Bonus Coins',
    category: 'currency',
    rarity: 'rare',
    price: 9.99,
    image: '/shop/coins.png',
    icon: '🪙',
    features: ['10.000 + 2.000 Bonus'],
    popular: true
  },
  {
    id: 'currency-30000',
    name: '30.000 Eldrun Coins',
    description: '+50% Bonus Coins',
    category: 'currency',
    rarity: 'epic',
    price: 19.99,
    image: '/shop/coins.png',
    icon: '🪙',
    features: ['20.000 + 10.000 Bonus']
  },

  // Bundles
  {
    id: 'bundle-starter',
    name: 'Starter Bundle',
    description: 'Alles für den perfekten Start',
    category: 'bundles',
    rarity: 'rare',
    price: 14.99,
    originalPrice: 24.99,
    image: '/shop/bundle-starter.png',
    icon: '🎁',
    features: ['VIP Bronze (30 Tage)', 'Starter Kit', '2.000 Coins', 'Basis Skin Pack'],
    discount: 40
  },
  {
    id: 'bundle-warrior',
    name: 'Warrior Bundle',
    description: 'Für den ambitionierten Kämpfer',
    category: 'bundles',
    rarity: 'epic',
    price: 34.99,
    originalPrice: 59.99,
    image: '/shop/bundle-warrior.png',
    icon: '⚔️',
    features: ['VIP Silver (30 Tage)', 'Warrior Kit', 'Raider Kit', '10.000 Coins', 'Neon Weapon Pack'],
    discount: 42,
    popular: true
  },
  {
    id: 'bundle-ultimate',
    name: 'Ultimate Bundle',
    description: 'Das komplette Eldrun Paket',
    category: 'bundles',
    rarity: 'mythic',
    price: 99.99,
    originalPrice: 199.99,
    image: '/shop/bundle-ultimate.png',
    icon: '👑',
    features: ['VIP Dragon (30 Tage)', 'Alle Kits', 'Alle Skins', '50.000 Coins', 'Blueprint Buch', 'Exklusiver Ultimate-Tag'],
    discount: 50,
    limited: true,
    stock: 10,
    rating: 5.0,
    reviews: 89,
    soldCount: 156
  },

  // Services
  {
    id: 'service-boost',
    name: 'Server Boost',
    description: 'Unterstütze den Server und erhalte exklusive Vorteile',
    category: 'services',
    rarity: 'epic',
    price: 9.99,
    image: '/shop/boost.png',
    icon: '🚀',
    features: ['Booster Badge', 'Exklusiver Chat-Effekt', 'Priority Support', '10% Shop-Rabatt'],
    duration: '30 Tage',
    popular: true,
    rating: 4.9,
    reviews: 234,
    soldCount: 1205
  },
  {
    id: 'service-custom-base',
    name: 'Custom Base Design',
    description: 'Professionelles Base-Design von unserem Team',
    category: 'services',
    rarity: 'legendary',
    price: 49.99,
    image: '/shop/custom-base.png',
    icon: '🏰',
    features: ['Individuelles Design', 'Optimierte Raid-Resistenz', 'Build Support', 'Inkl. Materialien'],
    limited: true,
    stock: 5,
    rating: 5.0,
    reviews: 23,
    soldCount: 47
  },
  {
    id: 'service-coaching',
    name: 'Pro Coaching Session',
    description: '1-Stunde 1:1 Coaching mit einem Pro-Spieler',
    category: 'services',
    rarity: 'rare',
    price: 19.99,
    image: '/shop/coaching.png',
    icon: '🎓',
    features: ['1h Live Coaching', 'PvP Training', 'Base Building Tipps', 'Strategie Review'],
    new: true,
    rating: 4.8,
    reviews: 67,
    soldCount: 189
  },

  // Gift Cards
  {
    id: 'gift-10',
    name: '€10 Geschenkkarte',
    description: 'Perfektes Geschenk für Freunde',
    category: 'gifts',
    rarity: 'common',
    price: 10.00,
    image: '/shop/gift-card.png',
    icon: '🎁',
    features: ['€10 Guthaben', 'Sofort einlösbar', 'Per Code aktivieren'],
    rating: 5.0,
    reviews: 156,
    soldCount: 823
  },
  {
    id: 'gift-25',
    name: '€25 Geschenkkarte',
    description: 'Mehr Guthaben für größere Käufe',
    category: 'gifts',
    rarity: 'uncommon',
    price: 25.00,
    image: '/shop/gift-card.png',
    icon: '🎁',
    features: ['€25 Guthaben', 'Sofort einlösbar', '+€2 Bonus'],
    popular: true,
    rating: 5.0,
    reviews: 98,
    soldCount: 456
  },
  {
    id: 'gift-50',
    name: '€50 Geschenkkarte',
    description: 'Das großzügige Geschenk',
    category: 'gifts',
    rarity: 'rare',
    price: 50.00,
    image: '/shop/gift-card.png',
    icon: '🎁',
    features: ['€50 Guthaben', 'Sofort einlösbar', '+€5 Bonus'],
    rating: 5.0,
    reviews: 45,
    soldCount: 234
  },
  {
    id: 'gift-100',
    name: '€100 Geschenkkarte',
    description: 'Premium Geschenkkarte mit extra Bonus',
    category: 'gifts',
    rarity: 'epic',
    price: 100.00,
    image: '/shop/gift-card.png',
    icon: '🎁',
    features: ['€100 Guthaben', 'Sofort einlösbar', '+€15 Bonus'],
    discount: 0,
    rating: 5.0,
    reviews: 28,
    soldCount: 123
  },

  // More Skins
  {
    id: 'skin-cyber-pack',
    name: 'Cyberpunk Weapon Pack',
    description: 'Futuristisches Waffenset im Cyber-Style',
    category: 'skins',
    rarity: 'legendary',
    price: 24.99,
    originalPrice: 39.99,
    image: '/shop/skin-cyber.png',
    icon: '🤖',
    features: ['10 Waffen-Skins', 'Animierte Effekte', 'Neon Glow', 'Kill Sound'],
    discount: 37,
    new: true,
    rating: 4.9,
    reviews: 156,
    soldCount: 678
  },
  {
    id: 'skin-arctic-camo',
    name: 'Arctic Camo Set',
    description: 'Komplettes Winter-Tarnungs-Set',
    category: 'skins',
    rarity: 'rare',
    price: 11.99,
    image: '/shop/skin-arctic.png',
    icon: '❄️',
    features: ['Rüstung + Waffen', 'Perfekt für Snow Maps', '15 Items'],
    rating: 4.7,
    reviews: 89,
    soldCount: 345
  },
  {
    id: 'skin-blood-moon',
    name: 'Blood Moon Collection',
    description: 'Dunkle Skins mit roten Akzenten',
    category: 'skins',
    rarity: 'epic',
    price: 17.99,
    image: '/shop/skin-blood.png',
    icon: '🌙',
    features: ['20 Items', 'Rote Partikel', 'Glowing Eyes', 'Special Kill Effect'],
    popular: true,
    rating: 4.8,
    reviews: 203,
    soldCount: 892
  },

  // More Items
  {
    id: 'item-tc-boost',
    name: 'TC Schutz Boost',
    description: 'Verlängert TC Decay um 48 Stunden',
    category: 'items',
    rarity: 'rare',
    price: 3.99,
    image: '/shop/tc-boost.png',
    icon: '🛡️',
    features: ['+48h TC Schutz', 'Sofort aktiv', 'Stapelbar'],
    rating: 4.6,
    reviews: 567,
    soldCount: 2341
  },
  {
    id: 'item-name-change',
    name: 'Name Change Token',
    description: 'Ändere deinen In-Game Namen',
    category: 'items',
    rarity: 'uncommon',
    price: 2.99,
    image: '/shop/name-change.png',
    icon: '✏️',
    features: ['1x Namensänderung', 'Farbige Namen möglich', 'Sofort nutzbar'],
    rating: 4.9,
    reviews: 234,
    soldCount: 1567
  },
  {
    id: 'item-xp-boost',
    name: '2x XP Boost',
    description: 'Doppelte Erfahrungspunkte für 24 Stunden',
    category: 'items',
    rarity: 'rare',
    price: 4.99,
    image: '/shop/xp-boost.png',
    icon: '⭐',
    features: ['2x XP', '24 Stunden', 'Alle Aktivitäten'],
    new: true,
    rating: 4.7,
    reviews: 145,
    soldCount: 789
  }
]

// ═══════════════════════════════════════════════════════════════════════════
// CRYPTO WALLETS
// ═══════════════════════════════════════════════════════════════════════════

const CRYPTO_WALLETS: Record<string, CryptoWallet> = {
  crypto_btc: {
    currency: 'Bitcoin',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    network: 'Bitcoin (BTC)',
    qrCode: '/crypto/btc-qr.png',
    minConfirmations: 3
  },
  crypto_eth: {
    currency: 'Ethereum',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    network: 'Ethereum (ERC-20)',
    qrCode: '/crypto/eth-qr.png',
    minConfirmations: 12
  },
  crypto_usdt: {
    currency: 'USDT',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    network: 'Ethereum (ERC-20) / Tron (TRC-20)',
    qrCode: '/crypto/usdt-qr.png',
    minConfirmations: 12
  },
  crypto_ltc: {
    currency: 'Litecoin',
    address: 'ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    network: 'Litecoin (LTC)',
    qrCode: '/crypto/ltc-qr.png',
    minConfirmations: 6
  },
  crypto_sol: {
    currency: 'Solana',
    address: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
    network: 'Solana (SOL)',
    qrCode: '/crypto/sol-qr.png',
    minConfirmations: 32
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COUPON CODES (Simulated)
// ═══════════════════════════════════════════════════════════════════════════

const VALID_COUPONS: CouponCode[] = [
  { code: 'WELCOME10', discount: 10, type: 'percent', usedCount: 0, maxUses: 1000 },
  { code: 'WINTER2024', discount: 20, type: 'percent', minPurchase: 20, usedCount: 0, maxUses: 500 },
  { code: 'VIP50OFF', discount: 50, type: 'percent', minPurchase: 50, usedCount: 0, maxUses: 100 },
  { code: 'CRYPTO5', discount: 5, type: 'fixed', usedCount: 0 },
  { code: 'ELDRUN25', discount: 25, type: 'percent', minPurchase: 30, usedCount: 0, maxUses: 200 }
]

// ═══════════════════════════════════════════════════════════════════════════
// SIMULATED ORDER HISTORY
// ═══════════════════════════════════════════════════════════════════════════

const generateOrderId = () => `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

const RARITY_COLORS: Record<ProductRarity, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-gray-500/10', border: 'border-gray-500/50', text: 'text-gray-400', glow: '' },
  uncommon: { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400', glow: '' },
  rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  legendary: { bg: 'bg-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
  mythic: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400', glow: 'shadow-red-500/30' }
}

const PAYMENT_METHODS = [
  { id: 'paypal', name: 'PayPal', icon: '💳', fee: '0%', color: 'bg-blue-600', description: 'Schnell & sicher mit PayPal bezahlen', processingTime: 'Sofort' },
  { id: 'stripe', name: 'Kreditkarte', icon: '💳', fee: '0%', color: 'bg-purple-600', description: 'Visa, Mastercard, AMEX', processingTime: 'Sofort' },
  { id: 'paysafecard', name: 'Paysafecard', icon: '🎫', fee: '+3%', color: 'bg-cyan-600', description: 'Anonym mit Paysafecard bezahlen', processingTime: '5-15 Min' },
  { id: 'crypto_btc', name: 'Bitcoin', icon: '₿', fee: '-5%', color: 'bg-orange-500', description: 'Dezentral & anonym', processingTime: '10-60 Min' },
  { id: 'crypto_eth', name: 'Ethereum', icon: 'Ξ', fee: '-5%', color: 'bg-indigo-500', description: 'Smart Contract Technologie', processingTime: '5-15 Min' },
  { id: 'crypto_usdt', name: 'USDT', icon: '₮', fee: '-3%', color: 'bg-green-500', description: 'Stablecoin - 1:1 USD', processingTime: '5-15 Min' },
  { id: 'crypto_ltc', name: 'Litecoin', icon: 'Ł', fee: '-5%', color: 'bg-gray-400', description: 'Schnelle Transaktionen', processingTime: '2-10 Min' },
  { id: 'crypto_sol', name: 'Solana', icon: '◎', fee: '-7%', color: 'bg-gradient-to-r from-purple-500 to-cyan-400', description: 'Blitzschnell & günstig', processingTime: '< 1 Min' }
]

// Crypto exchange rates (simulated - would be fetched from API)
const CRYPTO_RATES: Record<string, number> = {
  crypto_btc: 42500,
  crypto_eth: 2250,
  crypto_usdt: 1,
  crypto_ltc: 72,
  crypto_sol: 98
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function HeatmapShop() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'price' | 'popular' | 'new' | 'rating'>('popular')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null)
  const [couponError, setCouponError] = useState('')
  const [saleTimer, setSaleTimer] = useState({ hours: 2, minutes: 14, seconds: 37 })

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Sale timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSaleTimer(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 23, minutes: 59, seconds: 59 } // Reset
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Wishlist functions
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const isInWishlist = (productId: string) => wishlist.includes(productId)

  // Coupon functions
  const applyCoupon = () => {
    setCouponError('')
    const coupon = VALID_COUPONS.find(c => c.code.toUpperCase() === couponCode.toUpperCase())
    
    if (!coupon) {
      setCouponError('Ungültiger Gutscheincode')
      return
    }
    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      setCouponError(`Mindestbestellwert: €${coupon.minPurchase}`)
      return
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      setCouponError('Gutschein bereits ausgeschöpft')
      return
    }
    
    setAppliedCoupon(coupon)
    setCouponCode('')
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponError('')
  }

  // Calculate discount from coupon
  const couponDiscount = appliedCoupon 
    ? appliedCoupon.type === 'percent' 
      ? cartTotal * (appliedCoupon.discount / 100)
      : appliedCoupon.discount
    : 0

  const finalCartTotal = Math.max(0, cartTotal - couponDiscount)

  // Add order to history
  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev])
  }

  // Filter & sort products
  const filteredProducts = PRODUCTS
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      if (sortBy === 'new') return (b.new ? 1 : 0) - (a.new ? 1 : 0)
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      return (b.popular ? 1 : 0) - (a.popular ? 1 : 0)
    })

  const categories: { id: ProductCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Alle', icon: <Package className="w-4 h-4" /> },
    { id: 'vip', label: 'VIP Ränge', icon: <Crown className="w-4 h-4" /> },
    { id: 'kits', label: 'Kits', icon: <Gift className="w-4 h-4" /> },
    { id: 'skins', label: 'Skins', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'items', label: 'Items', icon: <Gem className="w-4 h-4" /> },
    { id: 'currency', label: 'Coins', icon: <Wallet className="w-4 h-4" /> },
    { id: 'bundles', label: 'Bundles', icon: <Tag className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <Award className="w-4 h-4" /> },
    { id: 'gifts', label: 'Geschenke', icon: <Gift className="w-4 h-4" /> }
  ]

  return (
    <div id="shop" className="bg-metal-900/50 border border-metal-800">
      {/* Header */}
      <div className="p-4 border-b border-metal-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            ELDRUN SHOP
          </h2>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-500" />
              <input
                type="text"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-metal-800 border border-metal-700 text-white text-sm w-48 focus:border-rust-500 focus:outline-none"
              />
            </div>
            {/* Order History */}
            <button
              onClick={() => setShowOrderHistory(true)}
              className="p-2 bg-metal-800 border border-metal-700 hover:bg-metal-700 transition-colors group relative"
              title="Bestellverlauf"
            >
              <History className="w-5 h-5 text-metal-400 group-hover:text-white" />
              {orders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs flex items-center justify-center rounded-full">
                  {orders.length}
                </span>
              )}
            </button>
            {/* Wishlist */}
            <button
              onClick={() => setShowWishlist(true)}
              className="p-2 bg-metal-800 border border-metal-700 hover:bg-metal-700 transition-colors group relative"
              title="Wunschliste"
            >
              <Heart className="w-5 h-5 text-metal-400 group-hover:text-red-400" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>
            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 bg-rust-500/20 border border-rust-500/50 hover:bg-rust-500/30 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-rust-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rust-500 text-white text-xs flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Promo Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-rust-500/20 to-red-500/20 border border-amber-500/30 p-3 mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
          <div className="flex items-center justify-center gap-3 relative z-10">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="font-display font-bold text-amber-400">WINTER SALE -50% auf ausgewählte Items!</span>
            <div className="flex items-center gap-2 bg-metal-900/50 px-3 py-1 border border-amber-500/30">
              <Timer className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-white font-bold">
                {String(saleTimer.hours).padStart(2, '0')}:{String(saleTimer.minutes).padStart(2, '0')}:{String(saleTimer.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods Preview */}
        <div className="flex items-center justify-between mb-4 p-3 bg-metal-800/30 border border-metal-700">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-400" />
            <span className="text-sm text-metal-400">Sichere Zahlung mit:</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">💳</span>
            <span className="text-lg font-bold text-blue-400">PayPal</span>
            <span className="text-lg">₿</span>
            <span className="text-lg">Ξ</span>
            <span className="text-lg text-green-400">₮</span>
            <span className="text-lg">◎</span>
            <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5">-7% CRYPTO</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-display uppercase tracking-wider transition-all ${
                activeCategory === cat.id
                  ? 'bg-rust-500/20 text-rust-400 border-b-2 border-rust-500'
                  : 'text-metal-400 hover:text-white hover:bg-metal-800'
              }`}
            >
              {cat.icon}
              {cat.label}
              <span className="text-metal-600">
                ({cat.id === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat.id).length})
              </span>
            </button>
          ))}
        </div>

        {/* Sort & Stats */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-metal-500" />
            <span className="text-xs text-metal-500">Sortieren:</span>
            {[
              { key: 'popular', label: 'Beliebt' },
              { key: 'price', label: 'Preis' },
              { key: 'new', label: 'Neu' },
              { key: 'rating', label: 'Bewertung' }
            ].map(sort => (
              <button
                key={sort.key}
                onClick={() => setSortBy(sort.key as typeof sortBy)}
                className={`px-2 py-1 text-xs transition-colors ${sortBy === sort.key ? 'bg-rust-500/20 text-rust-400 border border-rust-500/30' : 'text-metal-500 hover:text-white hover:bg-metal-800'}`}
              >
                {sort.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-metal-500">
            <span><strong className="text-white">{PRODUCTS.length}</strong> Produkte</span>
            <span><strong className="text-green-400">{PRODUCTS.filter(p => p.discount).length}</strong> Angebote</span>
            <span><strong className="text-amber-400">{PRODUCTS.filter(p => p.new).length}</strong> Neu</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onAddToCart={addToCart}
              onSelect={setSelectedProduct}
              onToggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist(product.id)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-metal-600 mx-auto mb-3" />
            <p className="text-metal-500">Keine Produkte gefunden</p>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="p-4 border-t border-metal-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <TrustBadge icon={<Lock />} title="SSL Gesichert" desc="256-bit Verschlüsselung" />
          <TrustBadge icon={<Zap />} title="Sofort-Lieferung" desc="Items in < 5 Minuten" />
          <TrustBadge icon={<BadgeCheck />} title="100% Sicher" desc="Verifizierter Shop" />
          <TrustBadge icon={<Heart />} title="Support 24/7" desc="Hilfe jederzeit" />
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <CartSidebar
            cart={cart}
            cartTotal={cartTotal}
            onClose={() => setShowCart(false)}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onCheckout={() => { setShowCart(false); setShowCheckout(true) }}
          />
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            cart={cart}
            cartTotal={cartTotal}
            onClose={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT CARD
// ═══════════════════════════════════════════════════════════════════════════

function ProductCard({ 
  product, 
  index,
  onAddToCart,
  onSelect,
  onToggleWishlist,
  isInWishlist
}: { 
  product: Product
  index: number
  onAddToCart: (p: Product) => void
  onSelect: (p: Product) => void
  onToggleWishlist: (id: string) => void
  isInWishlist: boolean
}) {
  const rarity = RARITY_COLORS[product.rarity]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`relative border ${rarity.border} ${rarity.bg} overflow-hidden group cursor-pointer hover:shadow-lg ${rarity.glow} transition-all`}
      onClick={() => onSelect(product)}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.popular && (
          <span className="px-2 py-0.5 bg-amber-500 text-black text-xs font-bold">BELIEBT</span>
        )}
        {product.new && (
          <span className="px-2 py-0.5 bg-green-500 text-black text-xs font-bold">NEU</span>
        )}
        {product.limited && (
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold">LIMITIERT</span>
        )}
        {product.discount && (
          <span className="px-2 py-0.5 bg-rust-500 text-white text-xs font-bold">-{product.discount}%</span>
        )}
      </div>

      {/* Wishlist & Stock */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id) }}
          className={`p-1.5 transition-all ${isInWishlist ? 'bg-red-500/20 text-red-400' : 'bg-metal-800/80 text-metal-400 hover:text-red-400'}`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
        {product.stock && (
          <span className="px-2 py-0.5 bg-metal-800/90 text-metal-400 text-xs font-mono">
            {product.stock} übrig
          </span>
        )}
      </div>

      {/* Image Area */}
      <div className="h-32 bg-metal-800/50 flex items-center justify-center relative">
        <span className="text-5xl group-hover:scale-110 transition-transform">{product.icon}</span>
        {product.soldCount && product.soldCount > 100 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-metal-900/80 text-xs">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-metal-300">{product.soldCount}+ verkauft</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-display font-bold text-white text-sm">{product.name}</h3>
          <span className={`text-xs uppercase ${rarity.text}`}>{product.rarity}</span>
        </div>
        <p className="text-metal-500 text-xs line-clamp-2 mb-2">{product.description}</p>
        
        {/* Rating & Duration */}
        <div className="flex items-center justify-between mb-2">
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs text-amber-400 font-bold">{product.rating}</span>
              {product.reviews && (
                <span className="text-xs text-metal-500">({product.reviews})</span>
              )}
            </div>
          )}
          {product.duration && (
            <div className="flex items-center gap-1 text-xs text-metal-400">
              <Timer className="w-3 h-3" />
              {product.duration}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-bold text-lg text-white">€{product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="font-mono text-xs text-metal-500 line-through">€{product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product) }}
            className="p-2 bg-rust-500/20 border border-rust-500/50 hover:bg-rust-500/40 transition-colors"
          >
            <Plus className="w-4 h-4 text-rust-400" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CART SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════

function CartSidebar({
  cart,
  cartTotal,
  onClose,
  onRemove,
  onUpdateQuantity,
  onCheckout
}: {
  cart: CartItem[]
  cartTotal: number
  onClose: () => void
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, delta: number) => void
  onCheckout: () => void
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-metal-900 border-l border-metal-800 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-metal-800 flex items-center justify-between">
          <h3 className="font-display font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-rust-400" />
            Warenkorb ({cart.length})
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-metal-800">
            <X className="w-5 h-5 text-metal-400" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-metal-700 mx-auto mb-3" />
              <p className="text-metal-500">Dein Warenkorb ist leer</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex gap-3 p-3 bg-metal-800/50 border border-metal-700">
                <div className="w-12 h-12 bg-metal-700 flex items-center justify-center text-2xl">
                  {item.product.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{item.product.name}</h4>
                  <p className="text-metal-500 text-xs">{item.product.rarity}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-white">€{(item.product.price * item.quantity).toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onUpdateQuantity(item.product.id, -1)} className="p-1 bg-metal-700 hover:bg-metal-600">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.product.id, 1)} className="p-1 bg-metal-700 hover:bg-metal-600">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => onRemove(item.product.id)} className="p-1 text-red-400 hover:bg-red-500/20 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-metal-800 space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-metal-400">Gesamt:</span>
              <span className="font-mono font-bold text-white">€{cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-rust-500 text-black font-display font-bold uppercase tracking-wider hover:from-amber-400 hover:to-rust-400 transition-all"
            >
              Zur Kasse
            </button>
            <p className="text-center text-xs text-metal-500">
              <Lock className="w-3 h-3 inline mr-1" />
              Sichere Zahlung mit SSL-Verschlüsselung
            </p>
          </div>
        )}
      </motion.div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKOUT MODAL
// ═══════════════════════════════════════════════════════════════════════════

function CheckoutModal({
  cart,
  cartTotal,
  onClose
}: {
  cart: CartItem[]
  cartTotal: number
  onClose: () => void
}) {
  const [step, setStep] = useState<'details' | 'payment' | 'confirm'>('details')
  const [steamId, setSteamId] = useState('')
  const [email, setEmail] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)

  const discount = selectedPayment?.startsWith('crypto') ? 0.05 : 0
  const finalTotal = cartTotal * (1 - discount)

  const handlePurchase = async () => {
    setProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setProcessing(false)
    setCompleted(true)
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-metal-900 border border-green-500/50 p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="font-display font-black text-2xl text-white mb-2">Kauf erfolgreich!</h3>
          <p className="text-metal-400 mb-4">
            Deine Items werden innerhalb von 5 Minuten auf deinem Account aktiviert.
          </p>
          <p className="text-sm text-metal-500 mb-6">
            Bestätigungs-Email wurde an {email} gesendet.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-500 text-black font-bold hover:bg-green-400 transition-colors"
          >
            Schließen
          </button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-metal-900 border border-metal-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-4 border-b border-metal-800 flex items-center justify-between sticky top-0 bg-metal-900 z-10">
          <h3 className="font-display font-bold text-white">Checkout</h3>
          <button onClick={onClose} className="p-2 hover:bg-metal-800">
            <X className="w-5 h-5 text-metal-400" />
          </button>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-metal-800">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {['details', 'payment', 'confirm'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step === s ? 'bg-rust-500 text-white' : 
                  ['details', 'payment', 'confirm'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-metal-700 text-metal-400'
                }`}>
                  {['details', 'payment', 'confirm'].indexOf(step) > i ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && <div className={`w-20 h-0.5 ${['details', 'payment', 'confirm'].indexOf(step) > i ? 'bg-green-500' : 'bg-metal-700'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <h4 className="font-display font-bold text-white text-lg mb-4">Account Details</h4>
              <div>
                <label className="block text-sm text-metal-400 mb-1">Steam ID / Account Name *</label>
                <input
                  type="text"
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  placeholder="76561198xxxxxxxxx oder Username"
                  className="w-full px-4 py-3 bg-metal-800 border border-metal-700 text-white focus:border-rust-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-metal-400 mb-1">E-Mail Adresse *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                  className="w-full px-4 py-3 bg-metal-800 border border-metal-700 text-white focus:border-rust-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setStep('payment')}
                disabled={!steamId || !email}
                className="w-full py-3 bg-rust-500 text-white font-bold hover:bg-rust-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Weiter zur Zahlung
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <div className="space-y-4">
              <h4 className="font-display font-bold text-white text-lg mb-4">Zahlungsmethode</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id as PaymentMethod)}
                    className={`p-4 border text-left transition-all ${
                      selectedPayment === method.id 
                        ? 'border-rust-500 bg-rust-500/10' 
                        : 'border-metal-700 hover:border-metal-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${method.color} flex items-center justify-center text-white font-bold text-lg`}>
                        {method.icon}
                      </div>
                      <div>
                        <p className="font-bold text-white">{method.name}</p>
                        <p className={`text-xs ${method.fee.includes('-') ? 'text-green-400' : 'text-metal-500'}`}>
                          {method.fee.includes('-') ? `${method.fee} Rabatt` : 'Keine Gebühren'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 py-3 bg-metal-800 text-white font-bold hover:bg-metal-700 transition-colors"
                >
                  Zurück
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!selectedPayment}
                  className="flex-1 py-3 bg-rust-500 text-white font-bold hover:bg-rust-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Weiter
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <h4 className="font-display font-bold text-white text-lg mb-4">Bestellung bestätigen</h4>
              
              {/* Order Summary */}
              <div className="bg-metal-800/50 border border-metal-700 p-4 space-y-2">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-metal-300">{item.quantity}x {item.product.name}</span>
                    <span className="text-white font-mono">€{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-metal-700 pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-metal-400">Zwischensumme</span>
                    <span className="text-white font-mono">€{cartTotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>Crypto Rabatt (-5%)</span>
                      <span className="font-mono">-€{(cartTotal * discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold mt-2">
                    <span className="text-white">Gesamt</span>
                    <span className="text-amber-400 font-mono">€{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Details Summary */}
              <div className="bg-metal-800/50 border border-metal-700 p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-metal-500">Account:</span>
                  <span className="text-white">{steamId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-metal-500">E-Mail:</span>
                  <span className="text-white">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-metal-500">Zahlung:</span>
                  <span className="text-white">{PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('payment')}
                  className="flex-1 py-3 bg-metal-800 text-white font-bold hover:bg-metal-700 transition-colors"
                >
                  Zurück
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={processing}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rust-500 text-black font-bold hover:from-amber-400 hover:to-rust-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Verarbeite...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Jetzt kaufen
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-metal-500">
                Mit dem Kauf akzeptierst du unsere AGB und Datenschutzrichtlinien.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT MODAL
// ═══════════════════════════════════════════════════════════════════════════

function ProductModal({
  product,
  onClose,
  onAddToCart
}: {
  product: Product
  onClose: () => void
  onAddToCart: (p: Product) => void
}) {
  const rarity = RARITY_COLORS[product.rarity]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-metal-900 border ${rarity.border} max-w-lg w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className={`h-48 ${rarity.bg} flex items-center justify-center relative`}>
          <span className="text-8xl">{product.icon}</span>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-metal-900/80 hover:bg-metal-800"
          >
            <X className="w-5 h-5 text-metal-400" />
          </button>
          {product.discount && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-rust-500 text-white font-bold">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-display font-black text-2xl text-white">{product.name}</h3>
            <span className={`text-sm uppercase ${rarity.text} font-bold`}>{product.rarity}</span>
          </div>
          <p className="text-metal-400 mb-4">{product.description}</p>

          {product.duration && (
            <div className="flex items-center gap-2 text-metal-300 mb-4">
              <Timer className="w-4 h-4" />
              <span>Gültig: {product.duration}</span>
            </div>
          )}

          {product.features && (
            <div className="mb-4">
              <h4 className="font-bold text-white text-sm mb-2">Enthält:</h4>
              <ul className="space-y-1">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-metal-300">
                    <Check className="w-4 h-4 text-green-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.stock && (
            <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 text-center">
              <span className="text-red-400 text-sm font-bold">Nur noch {product.stock} verfügbar!</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-3xl text-white">€{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="font-mono text-metal-500 line-through ml-2">€{product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <button
              onClick={() => { onAddToCart(product); onClose() }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rust-500 text-black font-bold hover:from-amber-400 hover:to-rust-400 transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              In den Warenkorb
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function TrustBadge({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-metal-800/50 border border-metal-700">
      <div className="text-green-400">{icon}</div>
      <div>
        <p className="font-bold text-white text-xs">{title}</p>
        <p className="text-metal-500 text-xs">{desc}</p>
      </div>
    </div>
  )
}
