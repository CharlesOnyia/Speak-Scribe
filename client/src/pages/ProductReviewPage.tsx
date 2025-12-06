import { useState, useRef, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { ProductHeader } from "@/components/ProductHeader";
import { VoiceReviewSection } from "@/components/VoiceReviewSection";
import { ExistingReviews } from "@/components/ExistingReviews";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mic } from "lucide-react";
import headphonesImg from "@assets/generated_images/premium_wireless_headphones_product_photo.png";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  originalText?: string;
  date: string;
  helpful: number;
  translatedFrom?: string;
  isNew?: boolean;
}

const mockProduct = {
  name: "Premium Wireless Headphones Pro",
  category: "Electronics",
  rating: 4.6,
  reviewCount: 247,
  price: "$249.99",
  imageUrl: headphonesImg,
};

const initialReviews: Review[] = [
  {
    id: "1",
    author: "Sarah Miller",
    rating: 5,
    text: "Absolutely love these headphones! The sound quality is incredible and they're so comfortable for long listening sessions. Best purchase I've made this year. The noise cancellation is perfect for my daily commute.",
    date: "December 2, 2024",
    helpful: 24,
  },
  {
    id: "2",
    author: "Jean-Pierre Dubois",
    rating: 4,
    text: "Great product overall. The noise cancellation works very well and battery life is impressive. Only wish the case was a bit smaller for easier portability.",
    originalText: "Excellent produit dans l'ensemble. La réduction de bruit fonctionne très bien et l'autonomie de la batterie est impressionnante. J'aurais juste aimé que l'étui soit un peu plus petit pour un transport plus facile.",
    date: "November 28, 2024",
    helpful: 18,
    translatedFrom: "French",
  },
  {
    id: "3",
    author: "Maria Garcia",
    rating: 5,
    text: "These headphones exceeded my expectations. The setup was easy, the sound is crystal clear, and they connect seamlessly to all my devices. Highly recommend!",
    originalText: "Estos auriculares superaron mis expectativas. La configuración fue fácil, el sonido es cristalino y se conectan perfectamente a todos mis dispositivos. ¡Los recomiendo mucho!",
    date: "November 25, 2024",
    helpful: 12,
    translatedFrom: "Spanish",
  },
];

export default function ProductReviewPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  const handleSubmitReview = async (review: {
    text: string;
    rating: number;
    language: string;
  }) => {
    console.log("Submitting review:", review);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newReview: Review = {
      id: `new-${Date.now()}`,
      author: "You",
      rating: review.rating,
      text: review.text,
      date: new Date().toLocaleDateString("en-US", { 
        month: "long", 
        day: "numeric", 
        year: "numeric" 
      }),
      helpful: 0,
      isNew: true,
    };
    
    setReviews(prev => [newReview, ...prev]);
  };

  const scrollToReviews = () => {
    setTimeout(() => {
      reviewsSectionRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/50 dark:via-background dark:to-pink-950/30">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">VoiceReview</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        <section>
          <ProductHeader
            name={mockProduct.name}
            category={mockProduct.category}
            rating={mockProduct.rating}
            reviewCount={mockProduct.reviewCount}
            price={mockProduct.price}
            imageUrl={mockProduct.imageUrl}
          />
        </section>

        <Separator />

        <section className="max-w-2xl mx-auto">
          <VoiceReviewSection
            productName={mockProduct.name}
            onSubmitReview={async (review) => {
              await handleSubmitReview(review);
              scrollToReviews();
            }}
          />
        </section>

        <Separator />

        <section ref={reviewsSectionRef} className="max-w-2xl mx-auto pb-8">
          <ExistingReviews reviews={reviews} />
        </section>
      </main>

      <footer className="border-t border-purple-100 dark:border-purple-900/30 bg-white/50 dark:bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent font-medium">VoiceReview</span>
            <span>— Making feedback accessible for everyone</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
