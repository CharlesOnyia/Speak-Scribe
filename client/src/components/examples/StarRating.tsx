import { useState } from "react";
import { StarRating } from "../StarRating";

export default function StarRatingExample() {
  const [rating, setRating] = useState(0);
  
  return (
    <div className="p-4 bg-card rounded-lg flex flex-col items-center gap-2">
      <StarRating rating={rating} onChange={setRating} size="lg" />
      <span className="text-sm text-muted-foreground">
        {rating > 0 ? `You rated: ${rating} stars` : "Click to rate"}
      </span>
    </div>
  );
}
