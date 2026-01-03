'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowLeft, Send, Image as ImageIcon, Smile, Bold, Italic,
  List, Link as LinkIcon, Quote, Code, Hash, Eye, EyeOff,
  AlertCircle, CheckCircle, Plus, X, ChevronDown
} from 'lucide-react'
import { useForumStore, ForumThread } from '@/store/forumStore'
import { useStore } from '@/store/useStore'
import { canAccessBoard } from '@/lib/forumPermissions'

export function NewThreadClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedBoard = searchParams.get('board')

  const [mounted, setMounted] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedBoardId, setSelectedBoardId] = useState(preselectedBoard || '')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBoardSelect, setShowBoardSelect] = useState(false)

  const { categories, createThreadAPI, popularTags, fetchCategories } = useForumStore()
  const { currentUser, openAuthModal } = useStore()

  // Get all boards
  const allBoards = useMemo(() => {
    return categories.flatMap(cat => 
      cat.boards
        .filter(b => canAccessBoard(b, currentUser))
        .map(b => ({ ...b, categoryName: cat.name }))
    )
  }, [categories, currentUser])

  const selectedBoard = allBoards.find(b => b.id === selectedBoardId)

  useEffect(() => {
    setMounted(true)
    // Fetch categories if not loaded
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [categories.length, fetchCategories])

  const handleAddTag = () => {
    if (newTag.trim() && tags.length < 5 && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = async () => {
    if (!currentUser || !title.trim() || !content.trim() || !selectedBoardId) return

    setIsSubmitting(true)

    const result = await createThreadAPI({
      boardId: selectedBoardId,
      title: title.trim(),
      content: content.trim(),
      tags
    })

    if (result) {
      router.push(`/forum/thread/${result.id}`)
    } else {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rust-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-metal-950 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-metal-900/50 border border-metal-800 rounded-xl max-w-md">
          <AlertCircle className="w-12 h-12 text-rust-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-white mb-2">
            Anmeldung erforderlich
          </h2>
          <p className="text-metal-400 mb-6">
            Du musst angemeldet sein, um ein neues Thema zu erstellen.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-2 bg-metal-800 hover:bg-metal-700 text-white font-bold rounded-xl transition-colors"
            >
              Anmelden
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="px-6 py-2 bg-rust-500 hover:bg-rust-400 text-white font-bold rounded-xl transition-colors"
            >
              Registrieren
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-metal-950 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link
            href="/forum"
            className="p-2 bg-metal-800 hover:bg-metal-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-metal-400" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Neues Thema erstellen</h1>
            <p className="text-metal-400 text-sm">Teile deine Gedanken mit der Community</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Board Selection */}
          <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
            <label className="block text-white font-medium mb-3">
              Board auswählen <span className="text-rust-400">*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setShowBoardSelect(!showBoardSelect)}
                className="w-full flex items-center justify-between px-4 py-3 bg-metal-800 border border-metal-700 rounded-xl text-left hover:border-metal-600 transition-colors"
              >
                {selectedBoard ? (
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{selectedBoard.icon}</span>
                    <span className="text-white">{selectedBoard.name}</span>
                    <span className="text-metal-500 text-sm">in {selectedBoard.categoryName}</span>
                  </span>
                ) : (
                  <span className="text-metal-500">Wähle ein Board...</span>
                )}
                <ChevronDown className={`w-5 h-5 text-metal-500 transition-transform ${showBoardSelect ? 'rotate-180' : ''}`} />
              </button>

              {showBoardSelect && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-metal-800 border border-metal-700 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <div className="px-4 py-2 bg-metal-900/50 text-metal-500 text-xs font-medium uppercase">
                        {cat.name}
                      </div>
                      {cat.boards
                        .filter(b => canAccessBoard(b, currentUser))
                        .map((board) => (
                          <button
                            key={board.id}
                            onClick={() => {
                              setSelectedBoardId(board.id)
                              setShowBoardSelect(false)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-metal-700 transition-colors ${
                              selectedBoardId === board.id ? 'bg-rust-500/20' : ''
                            }`}
                          >
                            <span className="text-xl">{board.icon}</span>
                            <span className="text-white">{board.name}</span>
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
            <label className="block text-white font-medium mb-3">
              Titel <span className="text-rust-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Gib deinem Thema einen aussagekräftigen Titel..."
              className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-xl text-white placeholder-metal-500 focus:outline-none focus:border-rust-500"
              maxLength={100}
            />
            <p className="text-metal-500 text-xs mt-2">{title.length}/100 Zeichen</p>
          </div>

          {/* Content */}
          <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">
                Inhalt <span className="text-rust-400">*</span>
              </label>
              <button
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-2 text-sm text-metal-400 hover:text-white transition-colors"
              >
                {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isPreview ? 'Bearbeiten' : 'Vorschau'}
              </button>
            </div>

            {/* Toolbar */}
            {!isPreview && (
              <div className="flex items-center gap-1 mb-3 pb-3 border-b border-metal-700">
                <button className="p-2 hover:bg-metal-800 rounded transition-colors">
                  <Bold className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-2 hover:bg-metal-800 rounded transition-colors">
                  <Italic className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-2 hover:bg-metal-800 rounded transition-colors">
                  <List className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-2 hover:bg-metal-800 rounded transition-colors">
                  <LinkIcon className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-2 hover:bg-metal-800 rounded transition-colors">
                  <Quote className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-2 hover:bg-metal-800 rounded transition-colors">
                  <Code className="w-4 h-4 text-metal-400" />
                </button>
                <div className="w-px h-6 bg-metal-700 mx-2" />
                <button className="p-2 hover:bg-metal-800 rounded transition-colors">
                  <ImageIcon className="w-4 h-4 text-metal-400" />
                </button>
                <button className="p-2 hover:bg-metal-800 rounded transition-colors">
                  <Smile className="w-4 h-4 text-metal-400" />
                </button>
              </div>
            )}

            {isPreview ? (
              <div className="min-h-[200px] p-4 bg-metal-800 rounded-xl">
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-metal-200 whitespace-pre-wrap">
                    {content || <span className="text-metal-500">Noch kein Inhalt...</span>}
                  </div>
                </div>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Schreibe deinen Beitrag... (Markdown wird unterstützt)"
                className="w-full h-64 px-4 py-3 bg-metal-800 border border-metal-700 rounded-xl text-white placeholder-metal-500 focus:outline-none focus:border-rust-500 resize-none"
              />
            )}
          </div>

          {/* Tags */}
          <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
            <label className="block text-white font-medium mb-3">
              Tags <span className="text-metal-500">(optional, max. 5)</span>
            </label>

            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-rust-500/20 text-rust-400 rounded-full"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Tag Input */}
            {tags.length < 5 && (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-500" />
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Tag hinzufügen..."
                    className="w-full pl-10 pr-4 py-2 bg-metal-800 border border-metal-700 rounded-xl text-white placeholder-metal-500 focus:outline-none focus:border-rust-500"
                    maxLength={20}
                  />
                </div>
                <button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="p-2 bg-metal-800 hover:bg-metal-700 disabled:opacity-50 rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5 text-metal-400" />
                </button>
              </div>
            )}

            {/* Popular Tags */}
            <div className="mt-4">
              <p className="text-metal-500 text-xs mb-2">Beliebte Tags:</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (!tags.includes(tag) && tags.length < 5) {
                        setTags([...tags, tag])
                      }
                    }}
                    disabled={tags.includes(tag) || tags.length >= 5}
                    className="px-2 py-1 bg-metal-800 hover:bg-metal-700 disabled:opacity-50 text-metal-400 text-sm rounded-lg transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <p className="text-metal-500 text-sm">
              <span className="text-rust-400">*</span> Pflichtfelder
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/forum"
                className="px-6 py-3 text-metal-400 hover:text-white transition-colors"
              >
                Abbrechen
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !content.trim() || !selectedBoardId || isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-rust-500 hover:bg-rust-400 disabled:bg-metal-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Thema erstellen
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
