'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Radio } from 'lucide-react'

export default function NewOpsSessionPage() {
  const router = useRouter()
  const [title, setTitle] = useState('Operation: Eldrun')
  const [description, setDescription] = useState('Live War Room Session')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCreate = useCallback(async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const res = await fetch('/api/ops/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error || 'Session konnte nicht erstellt werden')
      }

      router.push(`/ops/session/${data.session.code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler')
    } finally {
      setIsSubmitting(false)
    }
  }, [title, description, router])

  return (
    <div className="min-h-screen bg-metal-950 pt-24">
      <div className="border-b border-metal-800 bg-metal-900/50 backdrop-blur-sm">
        <div className="container-rust py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rust-500/20 border border-rust-500/30 flex items-center justify-center">
              <Radio className="w-6 h-6 text-rust-400" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl text-white">OPS SESSION ERSTELLEN</h1>
              <p className="text-metal-500 text-sm font-mono">Demo Mode • ohne Login</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-rust py-10">
        <div className="max-w-2xl">
          <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
            <label className="block text-metal-300 text-sm mb-2 font-mono">Titel</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-metal-950 border border-metal-800 rounded-lg px-4 py-3 text-white outline-none focus:border-gold-500/60"
            />

            <label className="block text-metal-300 text-sm mt-4 mb-2 font-mono">Beschreibung</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-metal-950 border border-metal-800 rounded-lg px-4 py-3 text-white outline-none focus:border-gold-500/60"
            />

            {error ? <div className="mt-4 text-red-300 text-sm">{error}</div> : null}

            <button
              onClick={onCreate}
              disabled={isSubmitting}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-rust-600 hover:bg-rust-500 disabled:opacity-50 text-white rounded-lg border border-rust-400/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Erstelle…' : 'Session erstellen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
