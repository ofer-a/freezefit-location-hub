
import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CarouselImage {
  src: string
  alt: string
  title?: string
  isCustom?: boolean
}

interface ThreeDPhotoCarouselProps {
  images?: CarouselImage[]
  className?: string
  allowUpload?: boolean
}

const defaultImages: CarouselImage[] = [
  {
    src: "https://preview.reve.art/api/project/e3bb1c42-38cc-446e-aefe-02fa529ea994/image/e54e0687-b761-489c-a5b3-e1a5acede30f/url/filename/e54e0687-b761-489c-a5b3-e1a5acede30f?fit=contain&height=1152",
    alt: "אזור המתנה",
    title: "אזור המתנה",
    isCustom: false
  },
  {
    src: "https://preview.reve.art/api/project/e3bb1c42-38cc-446e-aefe-02fa529ea994/image/bed4c9d4-4db5-4de7-8d83-b6179680ef0e/url/filename/bed4c9d4-4db5-4de7-8d83-b6179680ef0e?fit=contain&height=1152",
    alt: "אמבט קרח",
    title: "אמבט קרח",
    isCustom: false
  }
]

export function ThreeDPhotoCarousel({ images = defaultImages, className, allowUpload = false }: ThreeDPhotoCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center'
  })
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(false)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>(images)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onInit, onSelect])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, imageIndex: number) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImages = [...carouselImages]
        newImages[imageIndex] = {
          ...newImages[imageIndex],
          src: e.target?.result as string,
          isCustom: true
        }
        setCarouselImages(newImages)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetToDefault = (imageIndex: number) => {
    const newImages = [...carouselImages]
    newImages[imageIndex] = {
      ...defaultImages[imageIndex],
      isCustom: false
    }
    setCarouselImages(newImages)
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {carouselImages.map((image, index) => (
            <div 
              key={index} 
              className="flex-[0_0_100%] min-w-0 relative"
            >
              <div className="relative h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden group">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {allowUpload && (
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 hover:bg-white text-gray-700"
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4" />
                        </span>
                      </Button>
                    </label>
                    
                    {image.isCustom && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => resetToDefault(index)}
                        className="bg-white/90 hover:bg-white text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              {image.title && (
                <div className="text-center mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">{image.title}</h3>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-none shadow-lg"
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-none shadow-lg"
        onClick={scrollNext}
        disabled={nextBtnDisabled}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-4 space-x-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === selectedIndex 
                ? "bg-primary" 
                : "bg-gray-300 hover:bg-gray-400"
            )}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
}
