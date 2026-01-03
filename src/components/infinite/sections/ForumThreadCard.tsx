'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Eye, Clock, User } from 'lucide-react'

interface ForumData {
  title: string
  author: string
  replies: number
  views: number
  lastActive: string
  category: string
}

export function ForumThreadCard({ data }: { data: ForumData }) {
  return (
    <section className="py-4 px-4">
      <div className="container-rust">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-metal-900/50 border border-metal-800 p-4 hover:border-metal-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <span className="inline-block px-2 py-0.5 mb-2 text-xs font-mono bg-metal-800 text-metal-400 uppercase">{data.category}</span>
              <h4 className="font-display font-bold text-white hover:text-rust-400 transition-colors">{data.title}</h4>
              <div className="flex items-center gap-2 mt-2 text-sm text-metal-500">
                <User className="w-3 h-3" />
                <span>{data.author}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{data.lastActive}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-metal-500">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-mono text-white">{data.replies}</span>
                </div>
                <span className="text-xs">Antworten</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span className="font-mono text-white">{data.views}</span>
                </div>
                <span className="text-xs">Views</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
