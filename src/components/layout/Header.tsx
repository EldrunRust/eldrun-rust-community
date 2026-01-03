'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Users, 
  Trophy, 
  Newspaper, 
  ShoppingBag, 
  MessageSquare,
  Volume2,
  VolumeX,
  LogIn,
  UserPlus,
  Gamepad2,
  Map,
  Crown,
  Dices,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Coins,
  Star,
  Heart,
  MoreHorizontal,
  HelpCircle,
  Shield,
  FileText,
  ImageIcon,
  Award,
  Vote,
  Phone,
  Scale,
  History,
  Skull,
  UserCog,
  Calculator,
  Video,
  UserPlus2,
  Target,
  Gift,
  BarChart3,
  Ticket,
  ArrowLeftRight,
  Zap,
  Gavel,
  Sparkles,
  Play,
  Sword,
  Smile,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CartButton, CartDrawer } from '@/components/shop/CartDrawer'
import { useStore } from '@/store/useStore'
import { SERVER_INFO } from '@/data/serverData'
import { cn } from '@/lib/utils'

// Primary navigation items (shown directly in header)
const NAV_ITEMS = [
  { label: 'News', href: '/news', icon: Newspaper },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Forum', href: '/forum', icon: Users },
  { label: 'Shop', href: '/shop', icon: ShoppingBag },
  { label: 'Casino', href: '/casino', icon: Dices },
  { label: 'Heatmap', href: '/heatmap', icon: Map },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Changelog', href: '/changelog', icon: History },
  { label: 'Clans', href: '/clans', icon: Users },
  { label: 'Blacklist', href: '/blacklist', icon: Skull },
]

// Dropdown menu items (under "Mehr")
const MORE_ITEMS = [
  { label: 'Spieler-Guide', href: '/game-guide', icon: HelpCircle, description: 'Kompletter Guide' },
  { label: 'Klassen', href: '/classes', icon: Sword, description: '6 Spielklassen' },
  { label: 'Berufe', href: '/professions', icon: Calculator, description: '5 Berufe' },
  { label: 'Codex', href: '/codex', icon: BookOpen, description: 'Eldrun-Wiki mit allen Infos' },
  { label: 'Smileys', href: '/smileys', icon: Smile, description: '500+ Emojis & Smileys' },
  { label: 'Features', href: '/features', icon: Crown, description: 'Server Features' },
  { label: 'LFG', href: '/lfg', icon: UserPlus2, description: 'Mitspieler finden' },
  { label: 'Streams', href: '/streams', icon: Video, description: 'Live Streams' },
  { label: 'Trading', href: '/trading', icon: ArrowLeftRight, description: 'Handelsplatz' },
  { label: 'Auktionshaus', href: '/shop/auction', icon: Gavel, description: 'Bieten & Handeln' },
  { label: 'Challenges', href: '/challenges', icon: Target, description: 'Tägliche Aufgaben' },
  { label: 'divider', href: '', icon: null, description: '' },
  { label: 'AAA Features', href: '/features', icon: Sparkles, description: 'Neue AI-Tools' },
  { label: 'Map Editor', href: '/features/map-editor', icon: Play, description: 'Eigene Maps erstellen' },
  { label: 'Clip Generator', href: '/features/clip-generator', icon: Video, description: 'TikTok Clips erstellen' },
  { label: 'Voice Chat', href: '/features/voice-chat', icon: Volume2, description: '3D-Raumklang' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Echtzeit-Statistiken' },
  { label: 'divider', href: '', icon: null, description: '' },
  { label: 'Statistiken', href: '/stats', icon: BarChart3, description: 'Server Stats' },
  { label: 'Achievements', href: '/achievements', icon: Award, description: 'Erfolge' },
  { label: 'divider', href: '', icon: null, description: '' },
  { label: 'Tickets', href: '/tickets', icon: Ticket, description: 'Support Tickets' },
  { label: 'Referral', href: '/referral', icon: Gift, description: 'Freunde werben' },
  { label: 'Support', href: '/support', icon: Heart, description: 'Unterstützen' },
  { label: 'divider', href: '', icon: null, description: '' },
  { label: 'Battle Pass', href: '/battlepass', icon: Zap, description: 'Season Rewards' },
  { label: 'Gallery', href: '/gallery', icon: ImageIcon, description: 'Screenshots' },
  { label: 'divider', href: '', icon: null, description: '' },
  { label: 'Regeln', href: '/rules', icon: Scale, description: 'Server Regeln' },
  { label: 'FAQ', href: '/faq', icon: HelpCircle, description: 'Häufige Fragen' },
  { label: 'Staff', href: '/staff', icon: UserCog, description: 'Team' },
  { label: 'Vote', href: '/vote', icon: Vote, description: 'Server unterstützen' },
  { label: 'divider', href: '', icon: null, description: '' },
  { label: 'Admin Tool', href: '/tools/admin-tool', icon: Settings, description: 'Kostenlos Rust Admin Tool' },
  { label: 'divider', href: '', icon: null, description: '' },
  { label: 'Appeals', href: '/appeals', icon: Shield, description: 'Ban Einspruch' },
  { label: 'Kontakt', href: '/contact', icon: Phone, description: 'Kontaktformular' },
]

// All items for mobile menu
const ALL_NAV_ITEMS = [
  { label: 'News', href: '/news', icon: Newspaper },
  { label: 'Tools', href: '/tools', icon: Calculator },
  { label: 'Forum', href: '/forum', icon: MessageSquare },
  { label: 'Shop', href: '/shop', icon: ShoppingBag },
  { label: 'Casino', href: '/casino', icon: Dices },
  { label: 'Battle Pass', href: '/battlepass', icon: Zap },
  { label: 'LFG', href: '/lfg', icon: UserPlus2 },
  { label: 'Streams', href: '/streams', icon: Video },
  { label: 'Trading', href: '/trading', icon: ArrowLeftRight },
  { label: 'Challenges', href: '/challenges', icon: Target },
  { label: 'Statistiken', href: '/stats', icon: BarChart3 },
  { label: 'Features', href: '/features', icon: Crown },
  { label: 'Clans', href: '/clans', icon: Users },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Achievements', href: '/achievements', icon: Award },
  { label: 'Tickets', href: '/tickets', icon: Ticket },
  { label: 'Referral', href: '/referral', icon: Gift },
  { label: 'Support', href: '/support', icon: Heart },
  { label: 'Gallery', href: '/gallery', icon: ImageIcon },
  { label: 'Heatmap', href: '/heatmap', icon: Map },
  { label: 'Changelog', href: '/changelog', icon: History },
  { label: 'Regeln', href: '/rules', icon: Scale },
  { label: 'FAQ', href: '/faq', icon: HelpCircle },
  { label: 'Staff', href: '/staff', icon: UserCog },
  { label: 'Vote', href: '/vote', icon: Vote },
  { label: 'Blacklist', href: '/blacklist', icon: Skull },
  { label: 'Appeals', href: '/appeals', icon: Shield },
  { label: 'Kontakt', href: '/contact', icon: Phone },
]

export function Header() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const { isMenuOpen, toggleMenu, isSoundEnabled, toggleSound, openAuthModal, serverStats, currentUser, logout } = useStore()

  // Force navigation handler to bypass any click-blocking issues
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(href)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled 
          ? 'bg-metal-950/95 backdrop-blur-xl border-b border-metal-800' 
          : 'bg-transparent'
      )}
    >
      <div className="w-full flex justify-center">
        <div className="flex items-center justify-center h-20 gap-8">
          {/* Logo - nur Bild, kein Text */}
          <Link href="/" className="flex items-center group">
            <div className="relative w-24 h-24">
{/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/eldrunlogo.png" 
                alt="ELDRUN" 
                width={96}
                height={96}
                className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-rust-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" style={{ pointerEvents: 'auto' }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="group px-2.5 py-1.5 font-medieval text-xs uppercase tracking-widest text-gold-500/90 hover:text-gold-300 transition-all duration-300 relative cursor-pointer bg-transparent border-none"
                style={{ pointerEvents: 'auto' }}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <item.icon className="w-3.5 h-3.5 text-gold-600/70 group-hover:text-gold-400" />
                  {item.label}
                </span>
                <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-gold-500/50 via-gold-400 to-gold-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            ))}
            
            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="group px-2.5 py-1.5 font-medieval text-xs uppercase tracking-widest text-gold-500/90 hover:text-gold-300 transition-all duration-300 relative flex items-center gap-1.5"
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-gold-600/70 group-hover:text-gold-400" />
                Mehr
                <ChevronDown className={`w-3 h-3 transition-transform text-gold-600/70 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-gold-500/50 via-gold-400 to-gold-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
              
              <AnimatePresence>
                {moreMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMoreMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-metal-900/95 backdrop-blur-xl border border-gold-900/50 rounded-xl shadow-2xl shadow-gold-900/20 z-50 overflow-hidden"
                    >
                      <div className="p-2 max-h-[70vh] overflow-y-auto">
                        {MORE_ITEMS.map((item, index) => (
                          item.label === 'divider' ? (
                            <div key={index} className="my-2 border-t border-metal-700" />
                          ) : (
                            <button
                              key={item.label}
                              onClick={() => { setMoreMenuOpen(false); router.push(item.href); }}
                              className="flex items-center gap-3 px-3 py-2.5 text-metal-300 hover:text-gold-300 hover:bg-gold-900/20 rounded-lg transition-all group cursor-pointer bg-transparent border-none w-full text-left"
                              style={{ pointerEvents: 'auto' }}
                            >
                              {item.icon && <item.icon className="w-4 h-4 text-gold-600/60 group-hover:text-gold-400 transition-colors" />}
                              <div>
                                <p className="font-medieval text-sm tracking-wide">{item.label}</p>
                                <p className="text-xs text-metal-500 font-body">{item.description}</p>
                              </div>
                            </button>
                          )
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3 ml-8">
            {/* Server Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-metal-900/50 border border-metal-700 rounded-full">
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                serverStats.status === 'online' ? 'bg-radiation-400' : 'bg-blood-500'
              )} />
              <span className="font-mono text-xs text-metal-300">
                {serverStats.players}/{serverStats.maxPlayers}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 text-metal-400 hover:text-rust-400 transition-colors"
            >
              {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Shopping Cart */}
            <CartButton />

            {/* Auth Buttons or User Menu */}
            <div className="hidden sm:flex items-center gap-2">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 px-3 py-2 bg-metal-900/50 hover:bg-metal-800 border border-metal-700 rounded-lg transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-gradient-to-br from-rust-500 to-amber-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt=""
                          className="w-full h-full rounded-lg object-cover"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).src = '/images/avatars/default.svg'
                          }}
                        />
                      ) : (
                        currentUser.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* User Info */}
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-bold text-white leading-tight">{currentUser.displayName || currentUser.username}</p>
                      <p className="text-xs text-metal-400">Level {currentUser.level}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-metal-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-metal-900 border border-metal-700 rounded-lg shadow-xl z-50 overflow-hidden"
                        >
                          {/* User Header */}
                          <div className="p-4 border-b border-metal-800">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-rust-500 to-amber-600 rounded-xl flex items-center justify-center text-lg font-bold text-white">
                                {currentUser.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-white">{currentUser.displayName || currentUser.username}</p>
                                <p className="text-xs text-metal-400">@{currentUser.username}</p>
                              </div>
                            </div>
                            {/* XP Bar */}
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-metal-400">Level {currentUser.level}</span>
                                <span className="text-metal-500">{currentUser.xp}/{currentUser.xpToNextLevel} XP</span>
                              </div>
                              <div className="h-1.5 bg-metal-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-rust-500 to-amber-500"
                                  style={{ width: `${(currentUser.xp / currentUser.xpToNextLevel) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-2 p-3 border-b border-metal-800">
                            <div className="flex items-center gap-2 px-2 py-1.5 bg-metal-800/50 rounded">
                              <img src="/images/currency/gold.svg" alt="Gold" className="w-5 h-5 object-contain" />
                              <span className="text-sm text-white">{currentUser.coins.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1.5 bg-metal-800/50 rounded">
                              <img src="/images/currency/dragons.svg" alt="Drachenmünzen" className="w-5 h-5 object-contain" />
                              <span className="text-sm text-white">{currentUser.totalAchievementPoints}</span>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            <Link
                              href="/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 text-metal-300 hover:text-white hover:bg-metal-800 rounded-lg transition-colors"
                            >
                              <User className="w-4 h-4" />
                              Mein Profil
                            </Link>
                            <Link
                              href="/profile?tab=settings"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 text-metal-300 hover:text-white hover:bg-metal-800 rounded-lg transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Einstellungen
                            </Link>
                            <button
                              onClick={() => { logout(); setUserMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Abmelden
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => openAuthModal('login')}>
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                  <Button variant="rust" size="sm" onClick={() => openAuthModal('register')}>
                    <UserPlus className="w-4 h-4" />
                    Register
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 text-metal-300 hover:text-rust-400 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-metal-950/98 backdrop-blur-xl border-b border-metal-800"
          >
            <nav className="container-rust py-6 space-y-1">
              {ALL_NAV_ITEMS.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    href={item.href}
                    onClick={toggleMenu}
                    className="flex items-center gap-3 px-4 py-2.5 font-display text-base uppercase tracking-wider text-metal-300 hover:text-rust-400 hover:bg-metal-900/50 rounded-lg transition-all duration-300"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4">
                {currentUser ? (
                  <div className="space-y-3">
                    <Link
                      href="/profile"
                      onClick={toggleMenu}
                      className="flex items-center gap-4 p-4 bg-metal-800/50 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-rust-500 to-amber-600 rounded-xl flex items-center justify-center text-lg font-bold text-white">
                        {currentUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white">{currentUser.displayName || currentUser.username}</p>
                        <p className="text-xs text-metal-400">Level {currentUser.level} • {currentUser.coins.toLocaleString()} Coins</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => { logout(); toggleMenu(); }}
                      className="w-full flex items-center justify-center gap-2 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Abmelden
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="md" className="flex-1" onClick={() => { openAuthModal('login'); toggleMenu(); }}>
                      Login
                    </Button>
                    <Button variant="rust" size="md" className="flex-1" onClick={() => { openAuthModal('register'); toggleMenu(); }}>
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer />
    </header>
  )
}
