import { Star } from 'lucide-react'

interface ReviewCardProps {
  review: {
    _id: string
    rating: number
    title: string
    text: string
    authorName: string
    publishedAt: string
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  const date = new Date(review.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= review.rating
                      ? 'fill-amber-400 dark:fill-amber-500 text-amber-400 dark:text-amber-500'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-foreground">{review.rating}.0</span>
          </div>
          <h3 className="font-bold text-lg text-foreground">{review.title}</h3>
        </div>
      </div>

      <p className="text-muted-foreground leading-relaxed mb-4">{review.text}</p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">{review.authorName}</span>
        <span>•</span>
        <span>{date}</span>
      </div>
    </div>
  )
}