import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface ProductHeaderProps {
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  price: string;
  imageUrl?: string;
}

export function ProductHeader({
  name,
  category,
  rating,
  reviewCount,
  price,
  imageUrl,
}: ProductHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
      <div className="w-full md:w-48 h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground text-sm">Product Image</div>
        )}
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <Badge variant="secondary" className="w-fit">
          {category}
        </Badge>
        <h1 className="text-2xl font-semibold text-foreground" data-testid="text-product-name">
          {name}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.floor(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground" data-testid="text-rating">
            {rating.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>
        <p className="text-xl font-medium text-foreground" data-testid="text-price">
          {price}
        </p>
      </div>
    </div>
  );
}
