'use client'

import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'

interface NewsData {
  title: string
  excerpt: string
  image: string
  category: string
  date: string
}

export function NewsCard({ data }: { data: NewsData }) {
  const categoryColors: { [key: string]: string } = {
    Event: 'bg-rust-500/20 text-rust-400 border-rust-500/30',
    Ankündigung: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Shop: 'bg-radiation-400/20 text-radiation-400 border-radiation-400/30',
  }

  return (
    <section className="py-8 px-4">
      <div className="container-rust">
        <motion.div
          whileHover={{ y: -5 }}
          className="group relative bg-metal-900/50 border border-metal-800 overflow-hidden hover:border-rust-500/50 transition-all duration-500"
          style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative w-full md:w-1/3 h-48 md:h-auto overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-metal-900/80 z-10" />
              <img
                src={data.image}
                alt={data.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 z-20">
                <span className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border ${categoryColors[data.category] || 'bg-metal-800 text-metal-300 border-metal-700'}`}>
                  {data.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex items-center gap-2 mb-3 text-metal-500">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-mono">{data.date}</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-white mb-3 group-hover:text-rust-400 transition-colors">
                {data.title}
              </h3>
              <p className="text-metal-400 mb-4">{data.excerpt}</p>
              <button className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-wider text-rust-400 hover:text-rust-300 transition-colors">
                Weiterlesen
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
