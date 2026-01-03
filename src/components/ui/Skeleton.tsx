'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({ 
  className, 
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-metal-800'
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl'
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }

  const style: React.CSSProperties = {
    width: width,
    height: height
  }

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  )
}

// Pre-built skeleton components for common use cases

export function SkeletonCard() {
  return (
    <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl space-y-4">
      <Skeleton variant="rounded" className="w-full h-40" />
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-2/3 h-4" />
      <div className="flex gap-2">
        <Skeleton className="w-20 h-8" variant="rounded" />
        <Skeleton className="w-20 h-8" variant="rounded" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-metal-900/50 border border-metal-800 rounded-lg">
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-1/3 h-5" />
            <Skeleton className="w-2/3 h-4" />
          </div>
          <Skeleton className="w-20 h-8" variant="rounded" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-metal-900/50 border border-metal-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid gap-4 p-4 border-b border-metal-800" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4 p-4 border-b border-metal-800 last:border-0"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <Skeleton variant="rectangular" className="w-full h-48" />
        <div className="absolute -bottom-12 left-6">
          <Skeleton variant="circular" className="w-24 h-24 border-4 border-metal-950" />
        </div>
      </div>
      
      {/* Info */}
      <div className="pt-14 px-6 space-y-4">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-full h-16" />
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="w-12 h-6 mx-auto" />
              <Skeleton className="w-16 h-4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonNews() {
  return (
    <div className="space-y-6">
      {/* Featured */}
      <div className="p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
        <Skeleton variant="rounded" className="w-full h-64 mb-4" />
        <Skeleton className="w-24 h-6 mb-2" />
        <Skeleton className="w-3/4 h-8 mb-2" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4 mt-2" />
      </div>
      
      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl">
          <Skeleton variant="circular" className="w-10 h-10 mb-3" />
          <Skeleton className="w-16 h-8 mb-1" />
          <Skeleton className="w-24 h-4" />
        </div>
      ))}
    </div>
  )
}

// Loading overlay component
export function LoadingOverlay({ message = 'Laden...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-metal-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-rust-500/30 border-t-rust-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-metal-400">{message}</p>
      </div>
    </div>
  )
}

// Page loading skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-metal-950 pt-20">
      {/* Hero skeleton */}
      <div className="border-b border-metal-800 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Skeleton variant="rounded" className="w-20 h-20 mx-auto mb-6" />
          <Skeleton className="w-64 h-12 mx-auto mb-4" />
          <Skeleton className="w-96 h-6 mx-auto" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <SkeletonStats />
        <div className="mt-8">
          <SkeletonList count={5} />
        </div>
      </div>
    </div>
  )
}
