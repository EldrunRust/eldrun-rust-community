'use client'

import { motion } from 'framer-motion'
import { BookOpen, Clock, BarChart3 } from 'lucide-react'

interface TutorialData {
  title: string
  description: string
  difficulty: string
  duration: string
  icon: string
}

export function TutorialCard({ data }: { data: TutorialData }) {
  const difficultyColors: { [key: string]: string } = {
    Anfänger: 'text-radiation-400',
    Fortgeschritten: 'text-rust-400',
    Experte: 'text-blood-500',
  }

  return (
    <section className="py-6 px-4">
      <div className="container-rust">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-metal-900/80 to-metal-900/40 border border-metal-800 p-6 hover:border-rust-500/30 transition-all"
          style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-rust-500/20 border border-rust-500/30 flex items-center justify-center text-3xl flex-shrink-0">
              {data.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-rust-400" />
                <span className="font-mono text-xs text-rust-400 uppercase">Tutorial</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">{data.title}</h3>
              <p className="text-metal-400 text-sm mb-4">{data.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className={`flex items-center gap-1 ${difficultyColors[data.difficulty]}`}>
                  <BarChart3 className="w-4 h-4" />
                  {data.difficulty}
                </span>
                <span className="flex items-center gap-1 text-metal-500">
                  <Clock className="w-4 h-4" />
                  {data.duration}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
