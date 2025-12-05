import { VoiceReviewSection } from "../VoiceReviewSection";
import { Toaster } from "@/components/ui/toaster";

export default function VoiceReviewSectionExample() {
  return (
    <>
      <div className="max-w-2xl mx-auto">
        <VoiceReviewSection productName="Premium Wireless Headphones" />
      </div>
      <Toaster />
    </>
  );
}
