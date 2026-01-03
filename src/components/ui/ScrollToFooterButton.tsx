'use client'

import { ArrowDown } from 'lucide-react'

export function ScrollToFooterButton() {
  return null

  const scrollToFooter = () => {
    const footer = document.getElementById('site-footer')
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToFooter}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-metal-900/90 border border-metal-700 text-metal-200 shadow-lg backdrop-blur hover:border-rust-500 hover:text-rust-400 transition-all duration-300 flex items-center justify-center"
      title="Zum Footer"
      aria-label="Zum Footer scrollen"
    >
      <ArrowDown className="w-5 h-5" />
    </button>
  )
}
