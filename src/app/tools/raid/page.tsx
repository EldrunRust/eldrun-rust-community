'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Bomb, ArrowLeft, Plus, Minus, Trash2, Calculator,
  Flame, Zap, Target, AlertTriangle, ChevronDown
} from 'lucide-react'

// Raid Data - All destructible structures
const STRUCTURES = [
  { id: 'wood_wall', name: 'Holzwand', hp: 250, category: 'walls', tier: 'wood' },
  { id: 'wood_door', name: 'Holztür', hp: 200, category: 'doors', tier: 'wood' },
  { id: 'stone_wall', name: 'Steinwand', hp: 500, category: 'walls', tier: 'stone' },
  { id: 'stone_door', name: 'Blechtür', hp: 250, category: 'doors', tier: 'stone' },
  { id: 'metal_wall', name: 'Metallwand', hp: 1000, category: 'walls', tier: 'metal' },
  { id: 'metal_door', name: 'Gepanzerte Tür', hp: 800, category: 'doors', tier: 'metal' },
  { id: 'garage_door', name: 'Garagentor', hp: 600, category: 'doors', tier: 'metal' },
  { id: 'hqm_wall', name: 'HQM Wand', hp: 2000, category: 'walls', tier: 'hqm' },
  { id: 'tc', name: 'Tool Cupboard', hp: 500, category: 'misc', tier: 'wood' },
  { id: 'wooden_floor', name: 'Holzboden', hp: 250, category: 'floors', tier: 'wood' },
  { id: 'stone_floor', name: 'Steinboden', hp: 500, category: 'floors', tier: 'stone' },
  { id: 'metal_floor', name: 'Metallboden', hp: 1000, category: 'floors', tier: 'metal' },
  { id: 'ladder_hatch', name: 'Ladder Hatch', hp: 250, category: 'misc', tier: 'metal' },
  { id: 'window_bars', name: 'Fenstergitter', hp: 500, category: 'misc', tier: 'metal' },
  { id: 'turret', name: 'Auto Turret', hp: 1000, category: 'misc', tier: 'metal' },
  { id: 'sam_site', name: 'SAM Site', hp: 1000, category: 'misc', tier: 'metal' },
]

// Raid tools and their costs
const RAID_TOOLS = {
  c4: { name: 'C4', sulfur: 2200, gunpowder: 1000, explosives: 20, techTrash: 2, cloth: 5 },
  rocket: { name: 'Rakete', sulfur: 1400, gunpowder: 650, explosives: 10, pipes: 2 },
  satchel: { name: 'Satchel', sulfur: 480, gunpowder: 240, rope: 1, beancan: 4 },
  expAmmo: { name: 'Explosive Ammo', sulfur: 25, gunpowder: 10, metalFrags: 10 },
  fire: { name: 'Incendiary', sulfur: 0, lowGrade: 50, animalFat: 0 },
}

// Damage values per tool per structure tier
const DAMAGE_TABLE: Record<string, Record<string, number>> = {
  wood: { c4: 1, rocket: 1, satchel: 2, expAmmo: 49, fire: 1 },
  stone: { c4: 1, rocket: 2, satchel: 4, expAmmo: 185, fire: 0 },
  metal: { c4: 2, rocket: 4, satchel: 23, expAmmo: 400, fire: 0 },
  hqm: { c4: 4, rocket: 8, satchel: 46, expAmmo: 799, fire: 0 },
}

// Special overrides for doors
const DOOR_DAMAGE: Record<string, Record<string, number>> = {
  wood_door: { c4: 1, rocket: 1, satchel: 2, expAmmo: 45, fire: 1 },
  stone_door: { c4: 1, rocket: 1, satchel: 4, expAmmo: 63, fire: 0 },
  metal_door: { c4: 1, rocket: 2, satchel: 12, expAmmo: 200, fire: 0 },
  garage_door: { c4: 1, rocket: 3, satchel: 9, expAmmo: 150, fire: 0 },
}

interface RaidItem {
  id: string
  structureId: string
  quantity: number
}

export default function RaidCalculatorPage() {
  const [raidItems, setRaidItems] = useState<RaidItem[]>([])
  const [selectedTool, setSelectedTool] = useState<'c4' | 'rocket' | 'satchel' | 'expAmmo'>('c4')
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const addStructure = (structureId: string) => {
    const existing = raidItems.find(item => item.structureId === structureId)
    if (existing) {
      setRaidItems(items => 
        items.map(item => 
          item.structureId === structureId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setRaidItems(items => [...items, { 
        id: Date.now().toString(), 
        structureId, 
        quantity: 1 
      }])
    }
    setShowAddMenu(false)
  }

  const updateQuantity = (id: string, delta: number) => {
    setRaidItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    )
  }

  const removeItem = (id: string) => {
    setRaidItems(items => items.filter(item => item.id !== id))
  }

  const clearAll = () => {
    setRaidItems([])
  }

  // Calculate totals
  const calculateTotals = () => {
    let totalTools = 0
    let totalSulfur = 0
    let totalGunpowder = 0

    raidItems.forEach(item => {
      const structure = STRUCTURES.find(s => s.id === item.structureId)
      if (!structure) return

      const damageTable = DOOR_DAMAGE[structure.id] || DAMAGE_TABLE[structure.tier]
      const toolsNeeded = damageTable?.[selectedTool] || 1
      const toolsForItem = toolsNeeded * item.quantity

      totalTools += toolsForItem

      const toolCost = RAID_TOOLS[selectedTool]
      totalSulfur += toolCost.sulfur * toolsForItem
      totalGunpowder += toolCost.gunpowder * toolsForItem
    })

    return { totalTools, totalSulfur, totalGunpowder }
  }

  const totals = calculateTotals()

  const filteredStructures = filterCategory === 'all' 
    ? STRUCTURES 
    : STRUCTURES.filter(s => s.category === filterCategory)

  return (
    <div className="min-h-screen bg-metal-950 pt-24">
      {/* Header */}
      <div className="border-b border-metal-800">
        <div className="container-rust py-8">
          <Link href="/tools" className="inline-flex items-center gap-2 text-metal-400 hover:text-amber-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zu Tools
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Bomb className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl text-white">Raid Calculator</h1>
              <p className="text-metal-400">Berechne die Kosten für deinen Raid</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-rust py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Structure List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tool Selection */}
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-4">
              <h3 className="font-bold text-white mb-3">Raid-Werkzeug wählen</h3>
              <div className="grid grid-cols-4 gap-2">
                {(['c4', 'rocket', 'satchel', 'expAmmo'] as const).map(tool => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedTool === tool
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-metal-800/50 border-metal-700 text-metal-300 hover:border-metal-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">{RAID_TOOLS[tool].name}</div>
                      <div className="text-xs text-metal-500">{RAID_TOOLS[tool].sulfur} Sulfur</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Structure Button */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full p-4 bg-metal-900/50 border border-dashed border-metal-700 rounded-xl text-metal-400 hover:text-amber-400 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Struktur hinzufügen
                <ChevronDown className={`w-4 h-4 transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-metal-900 border border-metal-700 rounded-xl p-4 z-20 max-h-80 overflow-y-auto"
                >
                  {/* Category Filter */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {['all', 'walls', 'doors', 'floors', 'misc'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          filterCategory === cat
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                            : 'bg-metal-800 text-metal-400 border border-metal-700'
                        }`}
                      >
                        {cat === 'all' ? 'Alle' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {filteredStructures.map(structure => (
                      <button
                        key={structure.id}
                        onClick={() => addStructure(structure.id)}
                        className="p-3 bg-metal-800/50 border border-metal-700 rounded-lg text-left hover:bg-metal-800 hover:border-amber-500/50 transition-all"
                      >
                        <div className="font-medium text-white text-sm">{structure.name}</div>
                        <div className="text-xs text-metal-500">{structure.hp} HP • {structure.tier}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Raid Items List */}
            {raidItems.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">Raid-Ziele ({raidItems.length})</h3>
                  <button onClick={clearAll} className="text-sm text-red-400 hover:text-red-300">
                    Alle löschen
                  </button>
                </div>

                {raidItems.map(item => {
                  const structure = STRUCTURES.find(s => s.id === item.structureId)
                  if (!structure) return null
                  
                  const damageTable = DOOR_DAMAGE[structure.id] || DAMAGE_TABLE[structure.tier]
                  const toolsNeeded = (damageTable?.[selectedTool] || 1) * item.quantity

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 bg-metal-900/50 border border-metal-800 rounded-xl p-4"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">{structure.name}</div>
                        <div className="text-sm text-metal-500">
                          {damageTable?.[selectedTool] || 1} {RAID_TOOLS[selectedTool].name} pro Stück
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-lg bg-metal-800 text-metal-400 hover:text-white transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-lg bg-metal-800 text-metal-400 hover:text-white transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <div className="font-bold text-amber-400">{toolsNeeded}x</div>
                        <div className="text-xs text-metal-500">{RAID_TOOLS[selectedTool].name}</div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-metal-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-metal-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Füge Strukturen hinzu, um die Raid-Kosten zu berechnen</p>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6 sticky top-28">
              <h3 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                Raid-Kosten
              </h3>

              {/* Tool Count */}
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-1">{totals.totalTools}</div>
                  <div className="text-red-400 font-medium">{RAID_TOOLS[selectedTool].name}</div>
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-metal-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="text-metal-300">Sulfur</span>
                  </div>
                  <span className="font-bold text-white">{totals.totalSulfur.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-metal-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gray-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-metal-300">Gunpowder</span>
                  </div>
                  <span className="font-bold text-white">{totals.totalGunpowder.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-metal-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center">
                      <Target className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-metal-300">Sulfur Ore</span>
                  </div>
                  <span className="font-bold text-white">{(totals.totalSulfur * 2).toLocaleString()}</span>
                </div>
              </div>

              {/* Warning */}
              {totals.totalTools > 0 && (
                <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-400/80">
                      Diese Werte sind Schätzungen. Tatsächliche Kosten können je nach Soft-Side Raiding variieren.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
