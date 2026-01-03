'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Hammer, ArrowLeft, Search, Clock, Wrench, Filter,
  ChevronDown, Package, Zap
} from 'lucide-react'

const WORKBENCH_LEVELS = [
  { level: 0, name: 'Kein Workbench', color: 'text-metal-400' },
  { level: 1, name: 'Workbench T1', color: 'text-green-400' },
  { level: 2, name: 'Workbench T2', color: 'text-blue-400' },
  { level: 3, name: 'Workbench T3', color: 'text-purple-400' },
]

const CATEGORIES = [
  'Alle', 'Waffen', 'Munition', 'Rüstung', 'Werkzeuge', 'Medizin', 
  'Ressourcen', 'Komponenten', 'Elektrik', 'Fallen'
]

const RECIPES = [
  // Waffen
  { id: 'ak47', name: 'Assault Rifle', category: 'Waffen', workbench: 3, time: 60, ingredients: [{ item: 'HQM', amount: 50 }, { item: 'Holz', amount: 200 }, { item: 'Rifle Body', amount: 1 }, { item: 'Metal Spring', amount: 4 }] },
  { id: 'lr300', name: 'LR-300', category: 'Waffen', workbench: 3, time: 60, ingredients: [{ item: 'HQM', amount: 25 }, { item: 'Rifle Body', amount: 1 }, { item: 'Metal Spring', amount: 2 }] },
  { id: 'mp5', name: 'MP5A4', category: 'Waffen', workbench: 3, time: 30, ingredients: [{ item: 'HQM', amount: 20 }, { item: 'SMG Body', amount: 1 }, { item: 'Metal Spring', amount: 2 }] },
  { id: 'thompson', name: 'Thompson', category: 'Waffen', workbench: 2, time: 30, ingredients: [{ item: 'HQM', amount: 20 }, { item: 'SMG Body', amount: 1 }, { item: 'Metal Spring', amount: 1 }] },
  { id: 'custom_smg', name: 'Custom SMG', category: 'Waffen', workbench: 1, time: 30, ingredients: [{ item: 'HQM', amount: 15 }, { item: 'SMG Body', amount: 1 }] },
  { id: 'semi_rifle', name: 'Semi-Auto Rifle', category: 'Waffen', workbench: 2, time: 30, ingredients: [{ item: 'HQM', amount: 25 }, { item: 'Metal Pipe', amount: 1 }, { item: 'Semi Body', amount: 1 }] },
  { id: 'semi_pistol', name: 'Semi-Auto Pistol', category: 'Waffen', workbench: 1, time: 20, ingredients: [{ item: 'HQM', amount: 15 }, { item: 'Metal Pipe', amount: 1 }, { item: 'Semi Body', amount: 1 }] },
  { id: 'revolver', name: 'Revolver', category: 'Waffen', workbench: 1, time: 20, ingredients: [{ item: 'Metal Frags', amount: 125 }, { item: 'Metal Pipe', amount: 1 }, { item: 'Cloth', amount: 10 }] },
  { id: 'db_shotgun', name: 'Double Barrel', category: 'Waffen', workbench: 1, time: 15, ingredients: [{ item: 'Metal Frags', amount: 175 }, { item: 'Metal Pipe', amount: 2 }, { item: 'Holz', amount: 100 }] },
  { id: 'pump_shotgun', name: 'Pump Shotgun', category: 'Waffen', workbench: 2, time: 30, ingredients: [{ item: 'HQM', amount: 15 }, { item: 'Metal Frags', amount: 200 }, { item: 'Holz', amount: 100 }] },
  { id: 'bolt', name: 'Bolt Action Rifle', category: 'Waffen', workbench: 3, time: 60, ingredients: [{ item: 'HQM', amount: 30 }, { item: 'Metal Frags', amount: 100 }, { item: 'Rifle Body', amount: 1 }] },
  { id: 'crossbow', name: 'Crossbow', category: 'Waffen', workbench: 1, time: 15, ingredients: [{ item: 'Holz', amount: 200 }, { item: 'Metal Frags', amount: 75 }, { item: 'Rope', amount: 2 }] },
  { id: 'compound_bow', name: 'Compound Bow', category: 'Waffen', workbench: 2, time: 30, ingredients: [{ item: 'HQM', amount: 5 }, { item: 'Metal Frags', amount: 75 }, { item: 'Rope', amount: 2 }, { item: 'Gears', amount: 2 }] },
  
  // Munition
  { id: '556', name: '5.56 Ammo', category: 'Munition', workbench: 2, time: 3, ingredients: [{ item: 'Metal Frags', amount: 10 }, { item: 'Gunpowder', amount: 5 }, { item: 'Sulfur', amount: 5 }] },
  { id: '556_hv', name: '5.56 HV Ammo', category: 'Munition', workbench: 2, time: 3, ingredients: [{ item: 'Metal Frags', amount: 10 }, { item: 'Gunpowder', amount: 10 }] },
  { id: '556_exp', name: '5.56 Explosive', category: 'Munition', workbench: 3, time: 5, ingredients: [{ item: 'Metal Frags', amount: 10 }, { item: 'Gunpowder', amount: 10 }, { item: 'Sulfur', amount: 5 }] },
  { id: 'pistol_ammo', name: 'Pistol Ammo', category: 'Munition', workbench: 1, time: 2, ingredients: [{ item: 'Metal Frags', amount: 5 }, { item: 'Gunpowder', amount: 3 }] },
  { id: 'shotgun_ammo', name: 'Buckshot', category: 'Munition', workbench: 1, time: 2, ingredients: [{ item: 'Metal Frags', amount: 5 }, { item: 'Gunpowder', amount: 5 }] },
  { id: 'rocket', name: 'Rocket', category: 'Munition', workbench: 3, time: 10, ingredients: [{ item: 'Metal Pipe', amount: 2 }, { item: 'Gunpowder', amount: 150 }, { item: 'Explosives', amount: 10 }] },
  { id: 'c4', name: 'Timed Explosive', category: 'Munition', workbench: 3, time: 30, ingredients: [{ item: 'Explosives', amount: 20 }, { item: 'Cloth', amount: 5 }, { item: 'Tech Trash', amount: 2 }] },
  { id: 'satchel', name: 'Satchel Charge', category: 'Munition', workbench: 1, time: 10, ingredients: [{ item: 'Beancan Grenade', amount: 4 }, { item: 'Rope', amount: 1 }, { item: 'Small Stash', amount: 1 }] },
  
  // Rüstung
  { id: 'metal_chest', name: 'Metal Chestplate', category: 'Rüstung', workbench: 2, time: 20, ingredients: [{ item: 'HQM', amount: 25 }, { item: 'Sewing Kit', amount: 1 }] },
  { id: 'metal_face', name: 'Metal Facemask', category: 'Rüstung', workbench: 3, time: 20, ingredients: [{ item: 'HQM', amount: 15 }, { item: 'Sewing Kit', amount: 1 }] },
  { id: 'roadsign_chest', name: 'Road Sign Jacket', category: 'Rüstung', workbench: 2, time: 20, ingredients: [{ item: 'Road Signs', amount: 3 }, { item: 'Sewing Kit', amount: 2 }] },
  { id: 'roadsign_kilt', name: 'Road Sign Kilt', category: 'Rüstung', workbench: 2, time: 15, ingredients: [{ item: 'Road Signs', amount: 2 }, { item: 'Sewing Kit', amount: 1 }] },
  { id: 'coffee_helmet', name: 'Coffee Can Helmet', category: 'Rüstung', workbench: 1, time: 15, ingredients: [{ item: 'Metal Frags', amount: 50 }, { item: 'Sewing Kit', amount: 1 }] },
  { id: 'hoodie', name: 'Hoodie', category: 'Rüstung', workbench: 1, time: 30, ingredients: [{ item: 'Cloth', amount: 40 }, { item: 'Sewing Kit', amount: 1 }] },
  
  // Werkzeuge
  { id: 'pickaxe', name: 'Pickaxe', category: 'Werkzeuge', workbench: 0, time: 15, ingredients: [{ item: 'Holz', amount: 100 }, { item: 'Metal Frags', amount: 125 }] },
  { id: 'hatchet', name: 'Hatchet', category: 'Werkzeuge', workbench: 0, time: 15, ingredients: [{ item: 'Holz', amount: 100 }, { item: 'Metal Frags', amount: 75 }] },
  { id: 'salvaged_pickaxe', name: 'Salvaged Pickaxe', category: 'Werkzeuge', workbench: 1, time: 20, ingredients: [{ item: 'Metal Frags', amount: 200 }, { item: 'Metal Pipe', amount: 1 }] },
  { id: 'salvaged_axe', name: 'Salvaged Axe', category: 'Werkzeuge', workbench: 1, time: 20, ingredients: [{ item: 'Metal Frags', amount: 150 }, { item: 'Metal Pipe', amount: 1 }] },
  { id: 'jackhammer', name: 'Jackhammer', category: 'Werkzeuge', workbench: 2, time: 30, ingredients: [{ item: 'HQM', amount: 50 }, { item: 'Gears', amount: 2 }] },
  { id: 'chainsaw', name: 'Chainsaw', category: 'Werkzeuge', workbench: 2, time: 30, ingredients: [{ item: 'HQM', amount: 50 }, { item: 'Gears', amount: 2 }] },
  
  // Medizin
  { id: 'syringe', name: 'Medical Syringe', category: 'Medizin', workbench: 1, time: 5, ingredients: [{ item: 'Metal Frags', amount: 10 }, { item: 'Cloth', amount: 10 }, { item: 'Low Grade', amount: 10 }] },
  { id: 'medkit', name: 'Large Medkit', category: 'Medizin', workbench: 2, time: 10, ingredients: [{ item: 'HQM', amount: 5 }, { item: 'Cloth', amount: 30 }, { item: 'Low Grade', amount: 15 }] },
  { id: 'bandage', name: 'Bandage', category: 'Medizin', workbench: 0, time: 2, ingredients: [{ item: 'Cloth', amount: 4 }] },
  
  // Ressourcen
  { id: 'gunpowder', name: 'Gunpowder', category: 'Ressourcen', workbench: 0, time: 1, ingredients: [{ item: 'Charcoal', amount: 30 }, { item: 'Sulfur', amount: 20 }] },
  { id: 'explosives', name: 'Explosives', category: 'Ressourcen', workbench: 2, time: 5, ingredients: [{ item: 'Gunpowder', amount: 50 }, { item: 'Metal Frags', amount: 10 }, { item: 'Sulfur', amount: 10 }, { item: 'Low Grade', amount: 3 }] },
  { id: 'low_grade', name: 'Low Grade Fuel', category: 'Ressourcen', workbench: 0, time: 2, ingredients: [{ item: 'Animal Fat', amount: 3 }, { item: 'Cloth', amount: 1 }] },
]

export default function CraftCalculatorPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Alle')
  const [selectedWorkbench, setSelectedWorkbench] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedRecipe, setSelectedRecipe] = useState<typeof RECIPES[0] | null>(null)

  const filteredRecipes = useMemo(() => {
    return RECIPES.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'Alle' || recipe.category === selectedCategory
      const matchesWorkbench = selectedWorkbench === null || recipe.workbench === selectedWorkbench
      return matchesSearch && matchesCategory && matchesWorkbench
    })
  }, [searchQuery, selectedCategory, selectedWorkbench])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    if (secs === 0) return `${mins}m`
    return `${mins}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-metal-950 pt-24">
      <div className="border-b border-metal-800">
        <div className="container-rust py-8">
          <Link href="/tools" className="inline-flex items-center gap-2 text-metal-400 hover:text-amber-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zu Tools
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
              <Hammer className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl text-white">Craft Calculator</h1>
              <p className="text-metal-400">Alle Rezepte und Crafting-Zeiten</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-rust py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
                <input
                  type="text"
                  placeholder="Rezept suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white placeholder:text-metal-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                      : 'bg-metal-800 text-metal-400 border border-metal-700 hover:border-metal-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Workbench Filter */}
            <div className="flex gap-2">
              {WORKBENCH_LEVELS.map(wb => (
                <button
                  key={wb.level}
                  onClick={() => setSelectedWorkbench(selectedWorkbench === wb.level ? null : wb.level)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                    selectedWorkbench === wb.level
                      ? 'bg-metal-800 border border-amber-500/50 ' + wb.color
                      : 'bg-metal-900 text-metal-400 border border-metal-700 hover:border-metal-600'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  T{wb.level}
                </button>
              ))}
            </div>

            {/* Recipes Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredRecipes.map(recipe => (
                <motion.button
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`p-4 bg-metal-900/50 border rounded-xl text-left hover:border-amber-500/50 transition-all ${
                    selectedRecipe?.id === recipe.id ? 'border-amber-500' : 'border-metal-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white">{recipe.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded ${WORKBENCH_LEVELS[recipe.workbench].color} bg-metal-800`}>
                      T{recipe.workbench}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-metal-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(recipe.time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {recipe.ingredients.length} Items
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12 text-metal-500">
                <Hammer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keine Rezepte gefunden</p>
              </div>
            )}
          </div>

          {/* Right Column - Recipe Details */}
          <div className="space-y-6">
            {selectedRecipe ? (
              <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6 sticky top-28">
                <h3 className="font-display font-bold text-xl text-white mb-2">{selectedRecipe.name}</h3>
                <div className="flex items-center gap-4 text-sm text-metal-400 mb-6">
                  <span className={WORKBENCH_LEVELS[selectedRecipe.workbench].color}>
                    {WORKBENCH_LEVELS[selectedRecipe.workbench].name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(selectedRecipe.time)}
                  </span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-metal-400">Menge:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-metal-800 text-metal-400 hover:text-white"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center bg-metal-800 border border-metal-700 rounded-lg text-white py-1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-metal-800 text-metal-400 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Ingredients */}
                <h4 className="font-bold text-white mb-3">Zutaten</h4>
                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-metal-800/50 rounded-lg">
                      <span className="text-metal-300">{ing.item}</span>
                      <span className="font-bold text-amber-400">{(ing.amount * quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Total Time */}
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400">Gesamtzeit</span>
                    <span className="font-bold text-white">{formatTime(selectedRecipe.time * quantity)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6 text-center text-metal-500">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Wähle ein Rezept aus, um die Details zu sehen</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
