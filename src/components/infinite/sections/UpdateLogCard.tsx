'use client'

import { motion } from 'framer-motion'
import { GitBranch, CheckCircle } from 'lucide-react'

interface UpdateData {
  version: string
  date: string
  changes: string[]
}

export function UpdateLogCard({ data }: { data: UpdateData }) {
  return (
    <section className="py-6 px-4">
      <div className="container-rust max-w-2xl mx-auto">
        <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="bg-metal-900/50 border-l-4 border-radiation-400 p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-radiation-400" />
            <span className="font-mono text-radiation-400">v{data.version}</span>
            <span className="text-metal-500 text-sm">• {data.date}</span>
          </div>
          <ul className="space-y-1">
            {data.changes.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-metal-400">
                <CheckCircle className="w-3 h-3 text-radiation-400 mt-1 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
