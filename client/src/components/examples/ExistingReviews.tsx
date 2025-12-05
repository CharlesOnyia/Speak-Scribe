import { ExistingReviews } from "../ExistingReviews";

// todo: remove mock functionality
const mockReviews = [
  {
    id: "1",
    author: "Sarah Miller",
    rating: 5,
    text: "Absolutely love these headphones! The sound quality is incredible and they're so comfortable for long listening sessions. Best purchase I've made this year.",
    date: "December 2, 2024",
    helpful: 24,
  },
  {
    id: "2", 
    author: "Jean-Pierre Dubois",
    rating: 4,
    text: "Great product overall. The noise cancellation works very well and battery life is impressive. Only wish the case was a bit smaller.",
    date: "November 28, 2024",
    helpful: 18,
    translatedFrom: "French",
  },
  {
    id: "3",
    author: "Maria Garcia",
    rating: 5,
    text: "These headphones exceeded my expectations. The setup was easy, the sound is crystal clear, and they connect seamlessly to all my devices.",
    date: "November 25, 2024",
    helpful: 12,
    translatedFrom: "Spanish",
  },
];

export default function ExistingReviewsExample() {
  return (
    <div className="max-w-2xl mx-auto">
      <ExistingReviews reviews={mockReviews} />
    </div>
  );
}
