'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'rust' | 'metal' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'rust', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = `
      relative inline-flex items-center justify-center gap-2
      font-display font-bold uppercase tracking-wider
      transition-all duration-300
      disabled:opacity-50 disabled:cursor-not-allowed
      overflow-hidden
    `

    const variants = {
      rust: `
        bg-gradient-to-r from-rust-600 to-rust-700
        text-white
        hover:from-rust-500 hover:to-rust-600
        hover:shadow-rust-lg
        active:scale-95
      `,
      metal: `
        bg-gradient-to-r from-metal-800 to-metal-900
        border border-metal-600
        text-metal-200
        hover:border-rust-500 hover:text-rust-400
        active:scale-95
      `,
      ghost: `
        bg-transparent
        text-metal-300
        hover:text-rust-400 hover:bg-metal-900/50
        active:scale-95
      `,
      danger: `
        bg-gradient-to-r from-blood-600 to-blood-700
        text-white
        hover:from-blood-500 hover:to-blood-600
        active:scale-95
      `,
    }

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    }

    const clipPath = {
      sm: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
      md: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
      lg: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={{ clipPath: clipPath[size] }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
        
        <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
