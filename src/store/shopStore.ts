import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  category: string
}

export interface ShopProduct {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  price: number
  originalPrice?: number
  currency: string
  category: string
  rarity: string
  stock?: number
  sold: number
  isActive: boolean
  isFeatured: boolean
  isLimited: boolean
}

interface ShopState {
  // Cart
  cart: CartItem[]
  isCartOpen: boolean
  
  // Products
  products: ShopProduct[]
  featuredProducts: ShopProduct[]
  isLoading: boolean
  
  // Actions
  addToCart: (product: ShopProduct, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  
  // Computed
  getCartTotal: () => number
  getCartCount: () => number
  
  // API
  fetchProducts: () => Promise<void>
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      products: [],
      featuredProducts: [],
      isLoading: false,

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.cart.find(item => item.productId === product.id)
          
          if (existingItem) {
            return {
              cart: state.cart.map(item =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }
          }
          
          return {
            cart: [...state.cart, {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity,
              image: product.image,
              category: product.category
            }]
          }
        })
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter(item => item.productId !== productId)
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        
        set((state) => ({
          cart: state.cart.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        }))
      },

      clearCart: () => set({ cart: [] }),
      
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      getCartTotal: () => {
        const { cart } = get()
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getCartCount: () => {
        const { cart } = get()
        return cart.reduce((count, item) => count + item.quantity, 0)
      },

      fetchProducts: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/shop/products')
          const data = await response.json()
          
          set({
            products: data.products || [],
            featuredProducts: (data.products || []).filter((p: ShopProduct) => p.isFeatured),
            isLoading: false
          })
        } catch (error) {
          console.error('Failed to fetch products:', error)
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'eldrun-shop-cart',
      partialize: (state) => ({ cart: state.cart })
    }
  )
)

// Category labels
export const SHOP_CATEGORIES = {
  vip: { label: 'VIP Pakete', icon: '👑', color: 'text-amber-400' },
  kits: { label: 'Starter Kits', icon: '🎒', color: 'text-green-400' },
  skins: { label: 'Skins', icon: '🎨', color: 'text-purple-400' },
  items: { label: 'Items', icon: '📦', color: 'text-blue-400' },
  currency: { label: 'Währung', icon: '💰', color: 'text-yellow-400' },
  bundles: { label: 'Bundles', icon: '🎁', color: 'text-pink-400' },
  services: { label: 'Services', icon: '🛠️', color: 'text-cyan-400' }
}

// Rarity colors
export const RARITY_COLORS = {
  common: 'text-metal-400 border-metal-500',
  uncommon: 'text-green-400 border-green-500',
  rare: 'text-blue-400 border-blue-500',
  epic: 'text-purple-400 border-purple-500',
  legendary: 'text-amber-400 border-amber-500',
  mythic: 'text-red-400 border-red-500'
}
