'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Link2, Unlink, Check, Copy, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface DiscordLinkProps {
  discordId?: string | null
  discordUsername?: string | null
  onLink?: () => void
  onUnlink?: () => void
}

export function DiscordLink({ discordId, discordUsername, onLink, onUnlink }: DiscordLinkProps) {
  const [loading, setLoading] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleLink = () => {
    // Redirect to Discord OAuth
    window.location.href = '/api/auth/discord'
  }

  const handleUnlink = async () => {
    if (!confirm('Discord-Verknüpfung wirklich aufheben?')) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth/discord/unlink', { method: 'POST' })
      if (res.ok) {
        onUnlink?.()
      }
    } catch (error) {
      console.error('Unlink error:', error)
    }
    setLoading(false)
  }

  const generateLinkCode = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/discord/code', { method: 'POST' })
      const data = await res.json()
      if (data.code) {
        setLinkCode(data.code)
        setShowLinkModal(true)
      }
    } catch (error) {
      console.error('Generate code error:', error)
    }
    setLoading(false)
  }

  const copyCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(linkCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (discordId) {
    return (
      <div className="bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5865F2] rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white flex items-center gap-2">
                Discord verknüpft
                <Check className="w-4 h-4 text-green-400" />
              </p>
              <p className="text-sm text-metal-400">
                {discordUsername || `ID: ${discordId}`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUnlink}
            disabled={loading}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Unlink className="w-4 h-4 mr-1" />
            Trennen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-metal-800/50 border border-metal-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-metal-700 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-metal-400" />
            </div>
            <div>
              <p className="font-medium text-white">Discord verknüpfen</p>
              <p className="text-sm text-metal-500">
                Verbinde deinen Discord-Account für Belohnungen
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={generateLinkCode}
              disabled={loading}
            >
              Bot-Code
            </Button>
            <Button
              variant="rust"
              size="sm"
              onClick={handleLink}
              disabled={loading}
              className="bg-[#5865F2] hover:bg-[#4752C4]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-1" />
                  Verknüpfen
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Link Code Modal */}
      <AnimatePresence>
        {showLinkModal && linkCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLinkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-metal-900 border border-[#5865F2]/30 rounded-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-metal-800 bg-[#5865F2]/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#5865F2] rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">Discord Bot Verknüpfung</h3>
                    <p className="text-sm text-metal-400">Nutze diesen Code im Discord</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-metal-300">
                  Gib folgenden Befehl im ELDRUN Discord Server ein:
                </p>

                <div className="bg-metal-800 rounded-lg p-4 font-mono text-center">
                  <code className="text-lg text-[#5865F2]">/link {linkCode}</code>
                </div>

                <Button
                  variant="ghost"
                  onClick={copyCode}
                  className="w-full gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      Kopiert!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Code kopieren
                    </>
                  )}
                </Button>

                <p className="text-xs text-metal-500 text-center">
                  Der Code ist 10 Minuten gültig.
                </p>
              </div>

              <div className="p-4 border-t border-metal-800 flex justify-between">
                <Button variant="ghost" onClick={() => setShowLinkModal(false)}>
                  Schließen
                </Button>
                <a 
                  href="https://discord.gg/eldrun" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] rounded-lg text-white font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Discord öffnen
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Discord Server Widget
export function DiscordWidget({ serverId }: { serverId: string }) {
  return (
    <div className="bg-metal-900 border border-metal-800 rounded-xl overflow-hidden">
      <iframe
        src={`https://discord.com/widget?id=${serverId}&theme=dark`}
        width="100%"
        height="400"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        className="border-0"
      />
    </div>
  )
}
