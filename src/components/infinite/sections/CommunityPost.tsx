'use client'

import { motion } from 'framer-motion'
import { Heart, MessageCircle, User } from 'lucide-react'

interface CommunityData {
  author: string
  content: string
  image?: string
  likes: number
  comments: number
  timeAgo: string
}

export function CommunityPost({ data }: { data: CommunityData }) {
  return (
    <section className="py-4 px-4">
      <div className="container-rust max-w-xl mx-auto">
        <motion.div whileHover={{ scale: 1.01 }} className="bg-metal-900/50 border border-metal-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-rust-500/20 border border-rust-500/30 flex items-center justify-center">
              <User className="w-5 h-5 text-rust-400" />
            </div>
            <div>
              <span className="font-display font-bold text-white">{data.author}</span>
              <span className="block text-xs text-metal-500">{data.timeAgo}</span>
            </div>
          </div>
          <p className="text-metal-300 mb-3">{data.content}</p>
          {data.image && (
            <img src={data.image} alt="" className="w-full rounded mb-3 object-cover max-h-64" />
          )}
          <div className="flex items-center gap-4 text-sm text-metal-500">
            <button className="flex items-center gap-1 hover:text-blood-500 transition-colors">
              <Heart className="w-4 h-4" /> {data.likes}
            </button>
            <button className="flex items-center gap-1 hover:text-rust-400 transition-colors">
              <MessageCircle className="w-4 h-4" /> {data.comments}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
