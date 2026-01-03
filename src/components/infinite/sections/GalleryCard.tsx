'use client'

import { motion } from 'framer-motion'
import { Image as ImageIcon, Heart, User } from 'lucide-react'

interface GalleryData {
  title: string
  images: string[]
  author: string
  likes: number
}

export function GalleryCard({ data }: { data: GalleryData }) {
  return (
    <section className="py-6 px-4">
      <div className="container-rust">
        <motion.div whileHover={{ y: -3 }} className="bg-metal-900/50 border border-metal-800 overflow-hidden">
          <div className="grid grid-cols-2 gap-1">
            {data.images.slice(0, 2).map((img, i) => (
              <div key={i} className="aspect-video overflow-hidden">
                <img
                  src={img}
                  alt={`${data.title} - Bild ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2 text-metal-500 text-xs">
              <ImageIcon className="w-3 h-3" />
              <span className="uppercase font-mono">Gallery</span>
            </div>
            <h4 className="font-display font-bold text-white mb-2">{data.title}</h4>
            <div className="flex items-center justify-between text-sm text-metal-500">
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {data.author}</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-blood-500" /> {data.likes}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
