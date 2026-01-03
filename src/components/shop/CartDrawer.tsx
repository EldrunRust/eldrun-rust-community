'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react'
import { useShopStore, SHOP_CATEGORIES } from '@/store/shopStore'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount 
  } = useShopStore()

  const total = getCartTotal()
  const count = getCartCount()
  const tax = total * 0.19

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-metal-900 border-l border-metal-800 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-metal-800">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-rust-400" />
                <h2 className="font-display font-bold text-xl text-white">
                  Warenkorb
                </h2>
                <span className="px-2 py-0.5 bg-rust-500/20 border border-rust-500/30 text-rust-400 text-sm font-mono">
                  {count}
                </span>
              </div>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-metal-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-metal-400" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="w-16 h-16 text-metal-700 mb-4" />
                  <p className="text-metal-500 text-lg mb-2">Dein Warenkorb ist leer</p>
                  <p className="text-metal-600 text-sm">Füge Produkte hinzu um fortzufahren</p>
                  <Link href="/shop" onClick={toggleCart}>
                    <Button variant="rust" className="mt-6">
                      Zum Shop
                    </Button>
                  </Link>
                </div>
              ) : (
                cart.map((item) => {
                  const categoryInfo = SHOP_CATEGORIES[item.category as keyof typeof SHOP_CATEGORIES]
                  
                  return (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-4 bg-metal-800/50 border border-metal-700 rounded-lg"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 bg-metal-700 rounded-lg flex items-center justify-center text-2xl">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          categoryInfo?.icon || '📦'
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{item.name}</h3>
                        <p className={`text-sm ${categoryInfo?.color || 'text-metal-400'}`}>
                          {categoryInfo?.label || item.category}
                        </p>
                        <p className="text-rust-400 font-bold mt-1">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 hover:bg-red-500/20 rounded text-metal-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-2 bg-metal-700 rounded">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-metal-600 rounded-l transition-colors"
                          >
                            <Minus className="w-4 h-4 text-metal-400" />
                          </button>
                          <span className="w-8 text-center text-white font-mono text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-metal-600 rounded-r transition-colors"
                          >
                            <Plus className="w-4 h-4 text-metal-400" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-metal-800 p-4 space-y-4">
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-metal-400">
                    <span>Zwischensumme</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-metal-400">
                    <span>MwSt. (19%)</span>
                    <span>€{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-metal-700">
                    <span>Gesamt</span>
                    <span className="text-rust-400">€{(total + tax).toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={clearCart}
                    className="flex-1"
                  >
                    Leeren
                  </Button>
                  <Link href="/shop/checkout" onClick={toggleCart} className="flex-1">
                    <Button variant="rust" className="w-full gap-2">
                      <CreditCard className="w-4 h-4" />
                      Zur Kasse
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Cart button for header
export function CartButton() {
  const { toggleCart, getCartCount } = useShopStore()
  const count = getCartCount()

  return (
    <button
      onClick={toggleCart}
      className="relative p-2 hover:bg-metal-800 rounded-lg transition-colors"
    >
      <ShoppingCart className="w-5 h-5 text-metal-400 hover:text-white transition-colors" />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-rust-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </button>
  )
}
