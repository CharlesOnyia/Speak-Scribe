import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Globe, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  originalText?: string;
  date: string;
  helpful: number;
  language?: string;
  translatedFrom?: string;
  isNew?: boolean;
}

interface ExistingReviewsProps {
  reviews: Review[];
}

function ReviewCard({ review }: { review: Review }) {
  const [showOriginal, setShowOriginal] = useState(false);
  
  const displayText = showOriginal && review.originalText ? review.originalText : review.text;
  
  return (
    <Card 
      data-testid={`card-review-${review.id}`}
      className={review.isNew ? "ring-2 ring-primary/20 bg-primary/5" : ""}
    >
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-muted text-muted-foreground">
                {review.author.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground" data-testid={`text-author-${review.id}`}>
                  {review.author}
                </p>
                {review.isNew && (
                  <span className="text-xs text-primary font-medium">Your review</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{review.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
        
        <p className="text-sm text-foreground leading-relaxed" data-testid={`text-review-${review.id}`}>
          {displayText}
        </p>
        
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            {review.translatedFrom && review.originalText && (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`button-toggle-lang-${review.id}`}
              >
                <Globe className="h-3.5 w-3.5" />
                {showOriginal 
                  ? `View English` 
                  : `View Original (${review.translatedFrom})`
                }
              </button>
            )}
          </div>
          {!review.isNew && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground"
              onClick={() => console.log(`Helpful clicked for review ${review.id}`)}
              data-testid={`button-helpful-${review.id}`}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Helpful ({review.helpful})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ExistingReviews({ reviews }: ExistingReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  const reviewCount = reviews.filter(r => !r.isNew).length;
  const hasNewReview = reviews.some(r => r.isNew);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Customer Reviews</h3>
      <p className="text-sm text-muted-foreground">
        {reviewCount} review{reviewCount !== 1 ? 's' : ''} from our customers
        {hasNewReview && " (plus your new review)"}
      </p>
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
