'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Calendar, ArrowRight, Tag } from 'lucide-react'
import { NEWS_DATA } from '@/data/serverData'
import { cn } from '@/lib/utils'

const categoryColors: { [key: string]: string } = {
  Event: 'bg-rust-500/20 text-rust-400 border-rust-500/30',
  Ankündigung: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Shop: 'bg-radiation-400/20 text-radiation-400 border-radiation-400/30',
  Update: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

export function NewsSection() {
  return (
    <section id="news" className="relative py-24 bg-gradient-to-b from-metal-950 via-metal-900 to-metal-950">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-rust-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-[600px] h-[600px] bg-rust-600/5 rounded-full blur-3xl" />
      </div>

      <div className="container-rust relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-rust-500/10 border border-rust-500/30 rounded-full"
          >
            <Calendar className="w-4 h-4 text-rust-400" />
            <span className="font-mono text-sm text-rust-400 uppercase tracking-wider">Latest Updates</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-4xl sm:text-5xl text-white mb-4"
          >
            News & <span className="text-rust-400">Updates</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-metal-400 max-w-2xl mx-auto"
          >
            Bleibe auf dem Laufenden mit den neuesten Events, Updates und Ankündigungen.
          </motion.p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {NEWS_DATA.map((news, index) => (
            <motion.article
              key={news.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-metal-900/50 border border-metal-800 backdrop-blur-sm overflow-hidden hover:border-rust-500/50 transition-all duration-500"
              style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-metal-900/80 z-10" />
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className={cn(
                    "px-3 py-1 text-xs font-mono uppercase tracking-wider border",
                    categoryColors[news.category] || 'bg-metal-800 text-metal-300 border-metal-700'
                  )}>
                    {news.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Date */}
                <div className="flex items-center gap-2 mb-3 text-metal-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-mono">
                    {new Date(news.date).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-xl text-white mb-3 group-hover:text-rust-400 transition-colors duration-300">
                  {news.title}
                </h3>

                {/* Excerpt */}
                <p className="text-metal-400 text-sm leading-relaxed mb-4">
                  {news.excerpt}
                </p>

                {/* Read More */}
                <button className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-wider text-rust-400 hover:text-rust-300 transition-colors duration-300">
                  Weiterlesen
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              {/* Corner decoration */}
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-rust-500/0 group-hover:border-rust-500/30 transition-colors duration-500" />
            </motion.article>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <button className="px-8 py-3 bg-gradient-to-r from-rust-600 to-rust-700 font-display font-bold uppercase tracking-wider text-white hover:from-rust-500 hover:to-rust-600 hover:shadow-rust-lg transition-all duration-300"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
            Alle News anzeigen
          </button>
        </motion.div>
      </div>
    </section>
  )
}
