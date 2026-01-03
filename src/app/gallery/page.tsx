'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Image as ImageIcon, Camera, Video, X, ChevronLeft, ChevronRight,
  Heart, MessageSquare, Share2, Download, Filter, Grid,
  LayoutGrid, User, Calendar, Eye, Award
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const GALLERY_ITEMS = [
  {
    id: '1',
    type: 'image',
    title: 'Epischer Fraktionskrieg bei Sonnenuntergang',
    author: 'ShadowHunter',
    authorAvatar: '🎮',
    date: '2024-12-15',
    likes: 247,
    comments: 34,
    views: 1892,
    tags: ['PvP', 'Fraktionskrieg', 'Seraphar'],
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    featured: true
  },
  {
    id: '2',
    type: 'image',
    title: 'Meine Festung nach 100 Stunden',
    author: 'BuildMaster',
    authorAvatar: '🏗️',
    date: '2024-12-14',
    likes: 189,
    comments: 28,
    views: 1456,
    tags: ['Building', 'Base', 'Architecture'],
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
    featured: false
  },
  {
    id: '3',
    type: 'image',
    title: 'Raid auf Dragon\'s Lair erfolgreich!',
    author: 'DragonSlayer',
    authorAvatar: '🐉',
    date: '2024-12-13',
    likes: 312,
    comments: 56,
    views: 2341,
    tags: ['Raid', 'PvE', 'Boss'],
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80',
    featured: true
  },
  {
    id: '4',
    type: 'image',
    title: 'Artifact Island bei Nacht',
    author: 'NightOwl',
    authorAvatar: '🦉',
    date: '2024-12-12',
    likes: 156,
    comments: 19,
    views: 987,
    tags: ['Landscape', 'Night', 'Artifact'],
    thumbnail: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&q=80',
    featured: false
  },
  {
    id: '5',
    type: 'image',
    title: 'Gildentreffen vor dem großen Krieg',
    author: 'PhoenixLeader',
    authorAvatar: '🔥',
    date: '2024-12-11',
    likes: 423,
    comments: 67,
    views: 3102,
    tags: ['Guild', 'Community', 'Event'],
    thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=600&q=80',
    featured: true
  },
  {
    id: '6',
    type: 'image',
    title: 'Mein erster Legendary Drop!',
    author: 'LuckyOne',
    authorAvatar: '🍀',
    date: '2024-12-10',
    likes: 534,
    comments: 89,
    views: 4521,
    tags: ['Loot', 'Legendary', 'Lucky'],
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
    featured: false
  },
  {
    id: '7',
    type: 'image',
    title: 'Vorgaroth Hauptquartier',
    author: 'DarkLord',
    authorAvatar: '👑',
    date: '2024-12-09',
    likes: 278,
    comments: 41,
    views: 1876,
    tags: ['Vorgaroth', 'Base', 'Faction'],
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    featured: false
  },
  {
    id: '8',
    type: 'image',
    title: 'Casino Jackpot - 500k gewonnen!',
    author: 'HighRoller',
    authorAvatar: '🎰',
    date: '2024-12-08',
    likes: 687,
    comments: 124,
    views: 5678,
    tags: ['Casino', 'Jackpot', 'Winner'],
    thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&q=80',
    featured: true
  },
  // NEW RUST-THEMED IMAGES
  {
    id: '9',
    type: 'image',
    title: 'Heli Crash Site - Premium Loot!',
    author: 'LootGoblin',
    authorAvatar: '🚁',
    date: '2024-12-17',
    likes: 892,
    comments: 156,
    views: 6234,
    tags: ['Loot', 'Heli', 'Military'],
    thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80',
    featured: true
  },
  {
    id: '10',
    type: 'image',
    title: 'Meine Compound-Verteidigung',
    author: 'FortressKing',
    authorAvatar: '🏰',
    date: '2024-12-17',
    likes: 445,
    comments: 78,
    views: 3421,
    tags: ['Building', 'Defense', 'Turrets'],
    thumbnail: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
    featured: false
  },
  {
    id: '11',
    type: 'image',
    title: 'Sonnenaufgang über dem Spawn',
    author: 'PhotoMaster',
    authorAvatar: '📸',
    date: '2024-12-16',
    likes: 623,
    comments: 45,
    views: 4567,
    tags: ['Landscape', 'Spawn', 'Sunrise'],
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    featured: true
  },
  {
    id: '12',
    type: 'image',
    title: 'Oil Rig Raid - 10 Mann Squad!',
    author: 'RaidLeader',
    authorAvatar: '⚔️',
    date: '2024-12-16',
    likes: 756,
    comments: 134,
    views: 5890,
    tags: ['Raid', 'OilRig', 'PvE'],
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
    featured: true
  },
  {
    id: '13',
    type: 'image',
    title: 'Nachts im Schneeland',
    author: 'ArcticWolf',
    authorAvatar: '🐺',
    date: '2024-12-15',
    likes: 389,
    comments: 56,
    views: 2789,
    tags: ['Night', 'Snow', 'Landscape'],
    thumbnail: 'https://images.unsplash.com/photo-1478719059408-592965723cbc?w=600&q=80',
    featured: false
  },
  {
    id: '14',
    type: 'image',
    title: 'AK-47 Skin Showcase',
    author: 'SkinCollector',
    authorAvatar: '🎨',
    date: '2024-12-15',
    likes: 534,
    comments: 89,
    views: 4123,
    tags: ['Skins', 'Weapons', 'Showcase'],
    thumbnail: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&q=80',
    featured: false
  },
  {
    id: '15',
    type: 'image',
    title: 'Clan Wars Finale 2024',
    author: 'EldrunTV',
    authorAvatar: '📺',
    date: '2024-12-14',
    likes: 1245,
    comments: 234,
    views: 12456,
    tags: ['PvP', 'Event', 'Tournament'],
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    featured: true
  },
  {
    id: '16',
    type: 'image',
    title: 'Monument Run - Launch Site',
    author: 'MonumentHunter',
    authorAvatar: '🏛️',
    date: '2024-12-14',
    likes: 467,
    comments: 67,
    views: 3567,
    tags: ['Monument', 'Loot', 'PvE'],
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
    featured: false
  },
  {
    id: '17',
    type: 'image',
    title: 'Seraphar Tempel bei Vollmond',
    author: 'TemplarKnight',
    authorAvatar: '⚜️',
    date: '2024-12-13',
    likes: 589,
    comments: 78,
    views: 4234,
    tags: ['Seraphar', 'Temple', 'Night'],
    thumbnail: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=600&q=80',
    featured: true
  },
  {
    id: '18',
    type: 'image',
    title: 'Elektrizität Setup Guide',
    author: 'ElectricMaster',
    authorAvatar: '⚡',
    date: '2024-12-12',
    likes: 345,
    comments: 156,
    views: 5678,
    tags: ['Building', 'Electric', 'Tutorial'],
    thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80',
    featured: false
  },
  {
    id: '19',
    type: 'image',
    title: 'Vorgaroth Raid Party',
    author: 'DarkRaider',
    authorAvatar: '💀',
    date: '2024-12-11',
    likes: 678,
    comments: 123,
    views: 5432,
    tags: ['Vorgaroth', 'Raid', 'PvP'],
    thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80',
    featured: false
  },
  {
    id: '20',
    type: 'image',
    title: 'Dragon Boss Down! World First!',
    author: 'WorldFirst',
    authorAvatar: '🏆',
    date: '2024-12-10',
    likes: 2345,
    comments: 456,
    views: 23456,
    tags: ['Boss', 'PvE', 'WorldFirst'],
    thumbnail: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=600&q=80',
    featured: true
  },
  {
    id: '21',
    type: 'image',
    title: 'Farming Route Optimiert',
    author: 'FarmKing',
    authorAvatar: '🌾',
    date: '2024-12-09',
    likes: 234,
    comments: 67,
    views: 2345,
    tags: ['Farming', 'Guide', 'Resources'],
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
    featured: false
  },
  {
    id: '22',
    type: 'image',
    title: 'Underwater Labs Expedition',
    author: 'DeepDiver',
    authorAvatar: '🤿',
    date: '2024-12-08',
    likes: 567,
    comments: 89,
    views: 4567,
    tags: ['Monument', 'Underwater', 'Loot'],
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
    featured: true
  },
  {
    id: '23',
    type: 'image',
    title: 'Bradley APC Destroyed!',
    author: 'TankBuster',
    authorAvatar: '💣',
    date: '2024-12-07',
    likes: 456,
    comments: 78,
    views: 3456,
    tags: ['PvE', 'Bradley', 'Military'],
    thumbnail: 'https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=600&q=80',
    featured: false
  },
  {
    id: '24',
    type: 'image',
    title: 'Community Event Gruppenfoto',
    author: 'EventTeam',
    authorAvatar: '🎉',
    date: '2024-12-06',
    likes: 1567,
    comments: 234,
    views: 12345,
    tags: ['Event', 'Community', 'Group'],
    thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&q=80',
    featured: true
  },
]

const FILTER_TAGS = ['Alle', 'PvP', 'Building', 'Raid', 'Landscape', 'Guild', 'Casino', 'Event', 'Monument', 'Loot', 'Boss', 'Military', 'Skins', 'Community']

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<typeof GALLERY_ITEMS[0] | null>(null)
  const [activeFilter, setActiveFilter] = useState('Alle')
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid')

  const filteredItems = activeFilter === 'Alle' 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.tags.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase())))

  const featuredItems = GALLERY_ITEMS.filter(item => item.featured)

  return (
    <EldrunPageShell
      icon={Camera}
      badge="GALLERY"
      title="COMMUNITY GALLERY"
      subtitle="TEILE DEINE MOMENTE"
      description="Screenshots und Highlights aus der Eldrun Community. Teile deine besten Momente mit uns!"
      gradient="from-purple-300 via-purple-400 to-purple-600"
      glowColor="rgba(168,85,247,0.22)"
    >
      <AuthGate>
      <div>
        {/* Featured Section */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-400" />
            Featured Screenshots
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredItems.slice(0, 4).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-amber-500/30"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-black text-xs font-bold rounded">
                  FEATURED
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-sm line-clamp-1">{item.title}</p>
                  <p className="text-metal-400 text-xs">von {item.author}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {FILTER_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === tag
                    ? 'bg-purple-500 text-white'
                    : 'bg-metal-800 text-metal-400 hover:bg-metal-700 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-metal-800 text-metal-400'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded-lg ${viewMode === 'masonry' ? 'bg-purple-500 text-white' : 'bg-metal-800 text-metal-400'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group cursor-pointer overflow-hidden rounded-xl bg-metal-900 border border-metal-800 hover:border-purple-500/50 transition-all"
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-black/50 rounded-lg hover:bg-black/70">
                    <Heart className="w-4 h-4 text-white" />
                  </button>
                  <button className="p-2 bg-black/50 rounded-lg hover:bg-black/70">
                    <Share2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-white font-medium text-sm line-clamp-1 mb-2">{item.title}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.authorAvatar}</span>
                    <span className="text-metal-400 text-xs">{item.author}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-metal-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {item.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {item.views}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upload CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl text-center">
          <Camera className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-white mb-2">
            Teile deine Momente!
          </h3>
          <p className="text-metal-400 mb-4">
            Hast du einen epischen Screenshot? Lade ihn in unserem Discord hoch 
            und er könnte hier featured werden!
          </p>
          <a
            href="https://discord.gg/eldrun"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
            Screenshot einreichen
          </a>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.thumbnail}
                alt={selectedImage.title}
                className="w-full rounded-xl"
              />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedImage.title}</h3>
                  <p className="text-metal-400">von {selectedImage.author} • {selectedImage.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-metal-400">
                    <Heart className="w-5 h-5" /> {selectedImage.likes}
                  </span>
                  <span className="flex items-center gap-1 text-metal-400">
                    <MessageSquare className="w-5 h-5" /> {selectedImage.comments}
                  </span>
                  <span className="flex items-center gap-1 text-metal-400">
                    <Eye className="w-5 h-5" /> {selectedImage.views}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
