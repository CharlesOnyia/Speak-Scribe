import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ 
  rating, 
  onChange, 
  readonly = false,
  size = "md" 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const handleClick = (index: number) => {
    if (!readonly && onChange) {
      onChange(index);
    }
  };

  return (
    <div 
      className="flex items-center gap-1"
      role="group"
      aria-label="Star rating"
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = index <= (hoverRating || rating);
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => !readonly && setHoverRating(index)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer"
            }`}
            disabled={readonly}
            aria-label={`${index} star${index !== 1 ? "s" : ""}`}
            data-testid={`button-star-${index}`}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors ${
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
