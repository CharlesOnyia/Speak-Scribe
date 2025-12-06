import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Languages, ThumbsUp, ArrowLeftRight } from "lucide-react";
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
}

interface ExistingReviewsProps {
  reviews: Review[];
}

function ReviewCard({ review }: { review: Review }) {
  const [showOriginal, setShowOriginal] = useState(false);
  
  const displayText = showOriginal && review.originalText ? review.originalText : review.text;
  const displayLanguage = showOriginal ? review.translatedFrom : "English";
  
  return (
    <Card data-testid={`card-review-${review.id}`}>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-muted text-muted-foreground">
                {review.author.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground" data-testid={`text-author-${review.id}`}>
                {review.author}
              </p>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-xs gap-1.5"
                data-testid={`button-toggle-lang-${review.id}`}
              >
                <ArrowLeftRight className="h-3 w-3" />
                {showOriginal ? "View English" : `View ${review.translatedFrom}`}
              </Button>
            )}
            {review.translatedFrom && !showOriginal && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Languages className="h-3 w-3" />
                Translated from {review.translatedFrom}
              </Badge>
            )}
            {showOriginal && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Languages className="h-3 w-3" />
                Original ({review.translatedFrom})
              </Badge>
            )}
          </div>
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Customer Reviews</h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
