'use client'

import { motion } from 'framer-motion'
import { Vote, Clock } from 'lucide-react'

interface PollOption {
  text: string
  votes: number
}

interface PollData {
  question: string
  options: PollOption[]
  totalVotes: number
  endsIn: string
}

export function PollCard({ data }: { data: PollData }) {
  return (
    <section className="py-6 px-4">
      <div className="container-rust max-w-xl mx-auto">
        <motion.div whileHover={{ scale: 1.01 }} className="bg-metal-900/70 border border-metal-700 p-6">
          <div className="flex items-center gap-2 mb-4 text-rust-400">
            <Vote className="w-4 h-4" />
            <span className="font-mono text-xs uppercase">Community Poll</span>
          </div>
          <h4 className="font-display font-bold text-xl text-white mb-4">{data.question}</h4>
          <div className="space-y-3 mb-4">
            {data.options.map((opt, i) => {
              const pct = Math.round((opt.votes / data.totalVotes) * 100)
              return (
                <div key={i} className="relative bg-metal-800 p-3 cursor-pointer hover:bg-metal-700 transition-colors">
                  <div className="absolute inset-0 bg-rust-500/20" style={{ width: `${pct}%` }} />
                  <div className="relative flex justify-between">
                    <span className="text-white">{opt.text}</span>
                    <span className="font-mono text-rust-400">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-sm text-metal-500">
            <span>{data.totalVotes} Stimmen</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Endet in {data.endsIn}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
