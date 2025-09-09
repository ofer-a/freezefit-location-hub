
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Star, X } from 'lucide-react'
import { CircularGallery } from '@/components/ui/circular-gallery'
import { cn } from '@/lib/utils'
import { dbOperations } from '@/lib/database'

interface Review {
  id: number
  username?: string
  rating: number
  content: string
  date: string
}

interface Institute {
  id: number
  name: string
  address: string
  rating: number
  reviewCount: number
}

interface InstitutePreviewModalProps {
  institute: Institute | null
  isOpen: boolean
  onClose: () => void
}

// This function will be replaced with a custom hook that loads reviews from database

// Gallery items for the circular gallery - institute specific
const getGalleryItems = (instituteId: number) => {
  if (instituteId === 2) { // Cryo Plus
    return [
      {
        image: "/lovable-uploads/9d188ea5-1475-4047-92d5-34c0e1b37fa5.png",
        text: "אזור המתנה"
      },
      {
        image: "/lovable-uploads/d66169b8-116f-4d4c-9df4-e799795fb4b1.png",
        text: "אמבט קרח"
      }
    ]
  }
  
  // Default gallery for other institutes
  return [
    {
      image: "/lovable-uploads/5eb33892-d2af-4b1d-b7a9-92708867a204.png",
      text: "אזור המתנה"
    },
    {
      image: "/lovable-uploads/233ae73b-0b0b-4350-bd4b-4f80e8bcbac2.png",
      text: "אמבט קרח"
    }
  ]
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-gray-300"
          )}
        />
      ))}
    </div>
  )
}

export function InstitutePreviewModal({ institute, isOpen, onClose }: InstitutePreviewModalProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)

  // Load reviews from database when institute changes
  useEffect(() => {
    const loadReviews = async () => {
      if (!institute?.id) return
      
      try {
        setLoading(true)
        
        // Convert institute ID to UUID format for database lookup
        // Map numeric IDs to actual UUIDs from database
        const idStr = institute.id.toString().repeat(4)  // Convert 2 to "2222"
        const instituteUUID = `bbbbbbbb-${idStr}-${idStr}-${idStr}-${idStr}${idStr}${idStr}`
        
        const dbReviews = await dbOperations.getReviewsByInstitute(instituteUUID)
        
        // Transform database reviews to match component interface
        const transformedReviews = dbReviews.map(review => ({
          id: parseInt(review.id.split('-')[0], 16),
          username: `משתמש ${review.id.slice(-4)}`, // Anonymous username based on ID
          rating: review.rating,
          content: review.content,
          date: review.review_date || review.created_at || '2024-01-01'
        }))
        
        setReviews(transformedReviews)
      } catch (error) {
        console.error('Error loading reviews:', error)
        // Fallback to empty reviews array
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && institute) {
      loadReviews()
    }
  }, [institute?.id, isOpen])

  if (!institute) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('he-IL')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0 bg-black">
        <DialogHeader className="p-6 pb-0 bg-black">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              תצוגה מקדימה - {institute.name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-300">{institute.address}</p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)] bg-black">
          {/* Circular Gallery Section */}
          <div className="h-[60vh] w-full bg-black">
            <CircularGallery 
              items={getGalleryItems(institute.id)}
              bend={3}
              textColor="#ffffff"
              borderRadius={0.05}
            />
          </div>

          {/* Reviews Section */}
          <div className="p-6 bg-gray-900">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">ביקורות של משתמשים</h3>
              <div className="flex items-center space-x-2">
                <StarRating rating={institute.rating} />
                <span className="text-sm text-gray-300">
                  ({institute.reviewCount} ביקורות)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-gray-400">טוען ביקורות...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center text-gray-400">אין ביקורות זמינות</div>
              ) : (
                reviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-700 rounded-lg p-4 bg-gray-800/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {review.username ? review.username.charAt(0) : 'א'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">
                          {review.username || 'משתמש אנונימי'}
                        </p>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(review.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {review.content}
                  </p>
                </div>
                ))
              )}
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline" className="text-sm bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                צפה בכל הביקורות ({institute.reviewCount})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
