'use client'

import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'

interface TipData {
  title: string
  content: string
  icon: string
}

export function TipCard({ data }: { data: TipData }) {
  return (
    <section className="py-4 px-4">
      <div className="container-rust max-w-2xl mx-auto">
        <motion.div
          whileHover={{ x: 5 }}
          className="bg-rust-500/10 border-l-4 border-rust-500 p-4 flex items-start gap-4"
        >
          <span className="text-2xl">{data.icon}</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-rust-400" />
              <span className="font-display font-bold text-rust-400 text-sm uppercase">Tipp</span>
            </div>
            <h4 className="font-display font-bold text-white mb-1">{data.title}</h4>
            <p className="text-metal-400 text-sm">{data.content}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
