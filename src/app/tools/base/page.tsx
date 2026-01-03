'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Building2, ArrowLeft, Plus, Minus, Trash2, Calculator,
  Home, Layers, Box, DoorOpen, Wrench
} from 'lucide-react'

const BUILDING_MATERIALS = {
  wood: { name: 'Holz', color: 'from-amber-600 to-amber-800', icon: '🪵' },
  stone: { name: 'Stein', color: 'from-gray-500 to-gray-700', icon: '🪨' },
  metal: { name: 'Metall', color: 'from-zinc-400 to-zinc-600', icon: '⚙️' },
  hqm: { name: 'HQM', color: 'from-blue-500 to-blue-700', icon: '💎' },
}

const BUILDING_PARTS = [
  { id: 'foundation', name: 'Fundament', category: 'structure', costs: { wood: 50, stone: 150, metal: 200, hqm: 25 } },
  { id: 'foundation_triangle', name: 'Dreieck-Fundament', category: 'structure', costs: { wood: 25, stone: 75, metal: 100, hqm: 13 } },
  { id: 'wall', name: 'Wand', category: 'structure', costs: { wood: 50, stone: 150, metal: 200, hqm: 25 } },
  { id: 'wall_half', name: 'Halbe Wand', category: 'structure', costs: { wood: 25, stone: 75, metal: 100, hqm: 13 } },
  { id: 'wall_low', name: 'Niedrige Wand', category: 'structure', costs: { wood: 25, stone: 75, metal: 100, hqm: 13 } },
  { id: 'doorway', name: 'Türrahmen', category: 'structure', costs: { wood: 30, stone: 90, metal: 120, hqm: 15 } },
  { id: 'window', name: 'Fenster', category: 'structure', costs: { wood: 30, stone: 90, metal: 120, hqm: 15 } },
  { id: 'floor', name: 'Boden/Decke', category: 'structure', costs: { wood: 50, stone: 150, metal: 200, hqm: 25 } },
  { id: 'floor_triangle', name: 'Dreieck-Boden', category: 'structure', costs: { wood: 25, stone: 75, metal: 100, hqm: 13 } },
  { id: 'stairs_l', name: 'L-Treppe', category: 'structure', costs: { wood: 50, stone: 150, metal: 200, hqm: 25 } },
  { id: 'stairs_u', name: 'U-Treppe', category: 'structure', costs: { wood: 50, stone: 150, metal: 200, hqm: 25 } },
  { id: 'roof', name: 'Dach', category: 'structure', costs: { wood: 50, stone: 150, metal: 200, hqm: 25 } },
  { id: 'door_wood', name: 'Holztür', category: 'doors', costs: { wood: 300, stone: 0, metal: 0, hqm: 0 } },
  { id: 'door_metal', name: 'Blechtür', category: 'doors', costs: { wood: 0, stone: 0, metal: 150, hqm: 0 } },
  { id: 'door_armored', name: 'Gepanzerte Tür', category: 'doors', costs: { wood: 0, stone: 0, metal: 0, hqm: 20 } },
  { id: 'door_garage', name: 'Garagentor', category: 'doors', costs: { wood: 0, stone: 0, metal: 300, hqm: 0 } },
  { id: 'ladder_hatch', name: 'Ladder Hatch', category: 'doors', costs: { wood: 0, stone: 0, metal: 200, hqm: 0 } },
  { id: 'tc', name: 'Tool Cupboard', category: 'deployables', costs: { wood: 1000, stone: 0, metal: 0, hqm: 0 } },
  { id: 'workbench1', name: 'Workbench T1', category: 'deployables', costs: { wood: 500, stone: 0, metal: 100, hqm: 0 } },
  { id: 'workbench2', name: 'Workbench T2', category: 'deployables', costs: { wood: 500, stone: 0, metal: 500, hqm: 0 } },
  { id: 'workbench3', name: 'Workbench T3', category: 'deployables', costs: { wood: 1000, stone: 0, metal: 500, hqm: 100 } },
  { id: 'furnace', name: 'Schmelzofen', category: 'deployables', costs: { wood: 200, stone: 100, metal: 0, hqm: 0 } },
  { id: 'large_furnace', name: 'Großer Ofen', category: 'deployables', costs: { wood: 500, stone: 500, metal: 0, hqm: 0 } },
]

const UPKEEP_MULTIPLIERS = {
  wood: 1,
  stone: 0.5,
  metal: 0.33,
  hqm: 0.33,
}

interface BuildItem {
  id: string
  partId: string
  quantity: number
  material: 'wood' | 'stone' | 'metal' | 'hqm'
}

export default function BaseCalculatorPage() {
  const [buildItems, setBuildItems] = useState<BuildItem[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<'wood' | 'stone' | 'metal' | 'hqm'>('stone')
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const addPart = (partId: string) => {
    const existing = buildItems.find(item => item.partId === partId && item.material === selectedMaterial)
    if (existing) {
      setBuildItems(items => 
        items.map(item => 
          item.partId === partId && item.material === selectedMaterial
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setBuildItems(items => [...items, { 
        id: Date.now().toString(), 
        partId, 
        quantity: 1,
        material: selectedMaterial
      }])
    }
    setShowAddMenu(false)
  }

  const updateQuantity = (id: string, delta: number) => {
    setBuildItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    )
  }

  const removeItem = (id: string) => {
    setBuildItems(items => items.filter(item => item.id !== id))
  }

  const clearAll = () => {
    setBuildItems([])
  }

  const calculateTotals = () => {
    const totals = { wood: 0, stone: 0, metal: 0, hqm: 0 }
    const upkeep = { wood: 0, stone: 0, metal: 0, hqm: 0 }

    buildItems.forEach(item => {
      const part = BUILDING_PARTS.find(p => p.id === item.partId)
      if (!part) return

      const cost = part.costs[item.material] * item.quantity
      totals[item.material] += cost
      upkeep[item.material] += Math.ceil(cost * UPKEEP_MULTIPLIERS[item.material])
    })

    return { totals, upkeep }
  }

  const { totals, upkeep } = calculateTotals()

  const filteredParts = filterCategory === 'all' 
    ? BUILDING_PARTS 
    : BUILDING_PARTS.filter(p => p.category === filterCategory)

  return (
    <div className="min-h-screen bg-metal-950 pt-24">
      <div className="border-b border-metal-800">
        <div className="container-rust py-8">
          <Link href="/tools" className="inline-flex items-center gap-2 text-metal-400 hover:text-amber-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück zu Tools
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-3xl text-white">Base Calculator</h1>
              <p className="text-metal-400">Berechne Material- und Upkeep-Kosten</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-rust py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Material Selection */}
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-4">
              <h3 className="font-bold text-white mb-3">Material wählen</h3>
              <div className="grid grid-cols-4 gap-2">
                {(Object.entries(BUILDING_MATERIALS) as [keyof typeof BUILDING_MATERIALS, typeof BUILDING_MATERIALS[keyof typeof BUILDING_MATERIALS]][]).map(([key, mat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMaterial(key)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedMaterial === key
                        ? 'bg-gradient-to-br ' + mat.color + ' border-white/30 text-white'
                        : 'bg-metal-800/50 border-metal-700 text-metal-300 hover:border-metal-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{mat.icon}</div>
                      <div className="text-sm font-medium">{mat.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Part Button */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full p-4 bg-metal-900/50 border border-dashed border-metal-700 rounded-xl text-metal-400 hover:text-amber-400 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Bauteil hinzufügen
              </button>

              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-metal-900 border border-metal-700 rounded-xl p-4 z-20 max-h-80 overflow-y-auto"
                >
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {['all', 'structure', 'doors', 'deployables'].map(cat => (
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
                    {filteredParts.map(part => (
                      <button
                        key={part.id}
                        onClick={() => addPart(part.id)}
                        className="p-3 bg-metal-800/50 border border-metal-700 rounded-lg text-left hover:bg-metal-800 hover:border-amber-500/50 transition-all"
                      >
                        <div className="font-medium text-white text-sm">{part.name}</div>
                        <div className="text-xs text-metal-500">{part.costs[selectedMaterial]} {BUILDING_MATERIALS[selectedMaterial].name}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Build Items List */}
            {buildItems.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">Bauteile ({buildItems.length})</h3>
                  <button onClick={clearAll} className="text-sm text-red-400 hover:text-red-300">
                    Alle löschen
                  </button>
                </div>

                {buildItems.map(item => {
                  const part = BUILDING_PARTS.find(p => p.id === item.partId)
                  if (!part) return null
                  const mat = BUILDING_MATERIALS[item.material]
                  const cost = part.costs[item.material] * item.quantity

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 bg-metal-900/50 border border-metal-800 rounded-xl p-4"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mat.color} flex items-center justify-center text-lg`}>
                        {mat.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{part.name}</div>
                        <div className="text-sm text-metal-500">{mat.name}</div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-lg bg-metal-800 text-metal-400 hover:text-white transition-colors flex items-center justify-center">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-lg bg-metal-800 text-metal-400 hover:text-white transition-colors flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <div className="font-bold text-amber-400">{cost.toLocaleString()}</div>
                        <div className="text-xs text-metal-500">{mat.name}</div>
                      </div>

                      <button onClick={() => removeItem(item.id)} className="p-2 text-metal-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-metal-500">
                <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Füge Bauteile hinzu, um die Kosten zu berechnen</p>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6 sticky top-28">
              <h3 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                Materialkosten
              </h3>

              <div className="space-y-3 mb-6">
                {(Object.entries(totals) as [keyof typeof totals, number][]).map(([key, value]) => {
                  if (value === 0) return null
                  const mat = BUILDING_MATERIALS[key]
                  return (
                    <div key={key} className="flex items-center justify-between p-3 bg-metal-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{mat.icon}</span>
                        <span className="text-metal-300">{mat.name}</span>
                      </div>
                      <span className="font-bold text-white">{value.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>

              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Upkeep (24h)
              </h4>
              <div className="space-y-3">
                {(Object.entries(upkeep) as [keyof typeof upkeep, number][]).map(([key, value]) => {
                  if (value === 0) return null
                  const mat = BUILDING_MATERIALS[key]
                  return (
                    <div key={key} className="flex items-center justify-between p-3 bg-metal-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{mat.icon}</span>
                        <span className="text-metal-300">{mat.name}</span>
                      </div>
                      <span className="font-bold text-amber-400">{value.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
