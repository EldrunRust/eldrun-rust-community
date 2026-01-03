// ═══════════════════════════════════════════════════════════════════════════
// ELDRUN - Image Utilities
// Fallback handling für externe Bilder
// ═══════════════════════════════════════════════════════════════════════════

// Default Fallback-Bilder für verschiedene Kategorien
export const FALLBACK_IMAGES = {
  // Allgemeines Fallback
  default: '/images/fallback/default.jpg',
  
  // Kategorie-spezifische Fallbacks
  avatar: '/images/fallback/avatar.png',
  gallery: '/images/fallback/gallery.jpg',
  news: '/images/fallback/news.jpg',
  shop: '/images/fallback/shop.jpg',
  event: '/images/fallback/event.jpg',
  clan: '/images/fallback/clan.jpg',
  
  // Placeholder Gradients (Base64 encoded tiny images)
  gradient: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxYTFhMWEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwYTBhMGEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==',
}

// Typ für Bild-Kategorien
export type ImageCategory = keyof typeof FALLBACK_IMAGES

/**
 * Gibt ein Fallback-Bild zurück, wenn das Original-Bild nicht geladen werden kann
 * @param src - Originale Bild-URL
 * @param category - Kategorie für spezifisches Fallback
 * @returns Fallback-Bild URL
 */
export function getImageWithFallback(src: string | undefined | null, category: ImageCategory = 'default'): string {
  if (!src) return FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default
  return src
}

/**
 * Prüft ob eine Bild-URL extern ist (Unsplash, etc.)
 * @param src - Bild-URL
 * @returns true wenn extern
 */
export function isExternalImage(src: string): boolean {
  if (!src) return false
  return src.startsWith('http://') || src.startsWith('https://')
}

/**
 * Generiert einen Blur-Placeholder für externe Bilder
 * @returns Base64 encoded blur placeholder
 */
export function getBlurPlaceholder(): string {
  return FALLBACK_IMAGES.gradient
}

/**
 * Handler für Image onError Events
 * Ersetzt fehlgeschlagene Bilder mit Fallback
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  category: ImageCategory = 'default'
): void {
  const target = event.currentTarget
  target.onerror = null // Verhindert Endlos-Loop
  target.src = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default
}

/**
 * Optimiert Unsplash URLs für bessere Performance
 * @param url - Original Unsplash URL
 * @param width - Gewünschte Breite
 * @param quality - Qualität (1-100)
 * @returns Optimierte URL
 */
export function optimizeUnsplashUrl(url: string, width: number = 800, quality: number = 80): string {
  if (!url || !url.includes('unsplash.com')) return url
  
  // Entferne bestehende Parameter und füge optimierte hinzu
  const baseUrl = url.split('?')[0]
  return `${baseUrl}?w=${width}&q=${quality}&auto=format&fit=crop`
}

/**
 * Generiert srcSet für responsive Bilder
 * @param url - Basis URL
 * @param sizes - Array von Größen
 * @returns srcSet String
 */
export function generateSrcSet(url: string, sizes: number[] = [400, 800, 1200]): string {
  if (!url || !url.includes('unsplash.com')) return ''
  
  return sizes
    .map(size => `${optimizeUnsplashUrl(url, size)} ${size}w`)
    .join(', ')
}
