'use client'

import { motion } from 'framer-motion'
import { BookMarked, Clock, Layers } from 'lucide-react'

interface GuideData {
  title: string
  description: string
  chapters: number
  readTime: string
  difficulty: string
}

export function GuideCard({ data }: { data: GuideData }) {
  return (
    <section className="py-6 px-4">
      <div className="container-rust">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-metal-900/60 border border-metal-700 p-6 cursor-pointer hover:border-rust-500/50 transition-all">
          <div className="flex items-center gap-2 mb-3 text-rust-400">
            <BookMarked className="w-4 h-4" />
            <span className="font-mono text-xs uppercase">Guide</span>
          </div>
          <h4 className="font-display font-bold text-xl text-white mb-2">{data.title}</h4>
          <p className="text-metal-400 text-sm mb-4">{data.description}</p>
          <div className="flex items-center gap-4 text-sm text-metal-500">
            <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {data.chapters} Kapitel</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {data.readTime}</span>
            <span className="px-2 py-0.5 bg-metal-800 text-xs">{data.difficulty}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
