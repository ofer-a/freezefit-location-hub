
import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface GalleryItem {
  image: string
  text: string
}

interface CircularGalleryProps {
  items: GalleryItem[]
  bend?: number
  textColor?: string
  borderRadius?: number
  className?: string
}

export function CircularGallery({ 
  items, 
  bend = 3, 
  textColor = "#ffffff", 
  borderRadius = 0.05,
  className 
}: CircularGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % items.length)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return
    setIsAnimating(true)
    setCurrentIndex(index)
    setTimeout(() => setIsAnimating(false), 600)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAnimating])

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full flex items-center justify-center bg-black overflow-hidden", className)}
    >
      {/* Main circular container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {items.map((item, index) => {
          const isActive = index === currentIndex
          const offset = index - currentIndex
          const absOffset = Math.abs(offset)
          
          // Calculate position and scale
          const angle = offset * (360 / items.length) * (Math.PI / 180)
          const radius = 200
          const x = Math.sin(angle) * radius
          const z = Math.cos(angle) * radius - radius
          
          const scale = isActive ? 1 : Math.max(0.6, 1 - absOffset * 0.2)
          const opacity = isActive ? 1 : Math.max(0.3, 1 - absOffset * 0.3)
          const blur = isActive ? 0 : Math.min(4, absOffset * 2)

          return (
            <div
              key={index}
              className={cn(
                "absolute transition-all duration-600 ease-in-out cursor-pointer",
                isActive ? "z-20" : "z-10"
              )}
              style={{
                transform: `translate3d(${x}px, 0, ${z}px) scale(${scale})`,
                opacity,
                filter: `blur(${blur}px)`,
              }}
              onClick={() => goToSlide(index)}
            >
              <div className="relative group">
                {/* Image container */}
                <div 
                  className="w-80 h-64 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl"
                  style={{ borderRadius: `${borderRadius * 100}%` }}
                >
                  <img
                    src={item.image}
                    alt={item.text}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                
                {/* Text overlay */}
                <div 
                  className="absolute bottom-4 left-4 right-4 text-center"
                  style={{ color: textColor }}
                >
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">
                    {item.text}
                  </h3>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        disabled={isAnimating}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors disabled:opacity-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        disabled={isAnimating}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors disabled:opacity-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "bg-white scale-125" 
                : "bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  )
}

// Export as Component for compatibility
export { CircularGallery as Component }
