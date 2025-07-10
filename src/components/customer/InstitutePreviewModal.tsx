import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Star, X } from 'lucide-react'
import { ThreeDPhotoCarousel } from '@/components/ui/3d-carousel'
import { cn } from '@/lib/utils'

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

// Mock reviews data - in a real app, this would come from your database
const mockReviews: Review[] = [
  {
    id: 1,
    username: "יוסי כהן",
    rating: 5,
    content: "חוויה מדהימה! הצוות מקצועי והמתקנים במצב מעולה. האמבט קרח באמת עזר לי להתאושש אחרי האימון.",
    date: "2024-01-15"
  },
  {
    id: 2,
    username: "מירי לוי",
    rating: 4,
    content: "מקום נקי ומסודר, השירות היה טוב. המחיר קצת גבוה אבל שווה את זה.",
    date: "2024-01-10"
  },
  {
    id: 3,
    username: "דוד ישראלי",
    rating: 5,
    content: "ממליץ בחום! הטיפול היה מצוין והתוצאות מרגישות כבר אחרי פעם אחת.",
    date: "2024-01-08"
  },
  {
    id: 4,
    username: "שרה אברהם",
    rating: 4,
    content: "מקום מעולה לטיפולי התאוששות. הצוות מקצועי והמתקנים חדשים.",
    date: "2024-01-05"
  }
]

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
  if (!institute) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('he-IL')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              תצוגה מקדימה - {institute.name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">{institute.address}</p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 3D Image Carousel */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">גלריית תמונות</h3>
            <ThreeDPhotoCarousel />
          </div>

          {/* Reviews Section */}
          <div className="p-6 pt-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">ביקורות של משתמשים</h3>
              <div className="flex items-center space-x-2">
                <StarRating rating={institute.rating} />
                <span className="text-sm text-muted-foreground">
                  ({institute.reviewCount} ביקורות)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {mockReviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 bg-gray-50/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {review.username ? review.username.charAt(0) : 'א'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {review.username || 'משתמש אנונימי'}
                        </p>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline" className="text-sm">
                צפה בכל הביקורות ({institute.reviewCount})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}