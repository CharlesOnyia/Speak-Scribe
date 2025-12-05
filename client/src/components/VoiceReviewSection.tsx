import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MicrophoneButton } from "./MicrophoneButton";
import { WaveformAnimation } from "./WaveformAnimation";
import { RecordingTimer } from "./RecordingTimer";
import { TranscriptionBox } from "./TranscriptionBox";
import { ActionButtons } from "./ActionButtons";
import { StarRating } from "./StarRating";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ReviewState = "idle" | "recording" | "transcribing" | "review" | "submitted";

interface VoiceReviewSectionProps {
  productName?: string;
  onSubmitReview?: (review: {
    text: string;
    rating: number;
    language: string;
  }) => Promise<void>;
}

export function VoiceReviewSection({ 
  productName,
  onSubmitReview 
}: VoiceReviewSectionProps) {
  const { toast } = useToast();
  const [state, setState] = useState<ReviewState>("idle");
  const [transcribedText, setTranscribedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("English");
  const [translatedFrom, setTranslatedFrom] = useState<string | undefined>();

  const handleToggleRecording = useCallback(() => {
    if (state === "idle" || state === "review") {
      setState("recording");
      setTranscribedText("");
      setTranslatedFrom(undefined);
    } else if (state === "recording") {
      setState("transcribing");
      
      // todo: remove mock functionality - simulate transcription delay
      setTimeout(() => {
        const mockResponses = [
          {
            text: "This product exceeded all my expectations! The build quality is outstanding and it works exactly as advertised. I would definitely recommend this to anyone looking for a reliable solution. Five stars from me!",
            language: "English",
            translatedFrom: undefined,
          },
          {
            text: "I absolutely love this product. It arrived quickly and was packaged beautifully. The quality is top-notch and it performs even better than I expected. Great value for money!",
            language: "English",
            translatedFrom: "French",
          },
          {
            text: "Very satisfied with my purchase. The customer service was excellent and the product itself is exactly what I needed. Would buy again without hesitation.",
            language: "English",
            translatedFrom: "Spanish",
          },
        ];
        
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        setTranscribedText(randomResponse.text);
        setDetectedLanguage(randomResponse.language);
        setTranslatedFrom(randomResponse.translatedFrom);
        setState("review");
      }, 1500);
    }
  }, [state]);

  const handleSubmit = async () => {
    if (!transcribedText.trim() || rating === 0) {
      toast({
        title: "Missing information",
        description: "Please add a rating and ensure your review has content.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onSubmitReview) {
        await onSubmitReview({
          text: transcribedText,
          rating,
          language: detectedLanguage,
        });
      } else {
        // todo: remove mock functionality
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      setState("submitted");
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setState("idle");
    setTranscribedText("");
    setIsEditing(false);
    setRating(0);
    setTranslatedFrom(undefined);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">Leave a Review</CardTitle>
        </div>
        {productName && (
          <p className="text-sm text-muted-foreground">
            Share your thoughts about {productName}
          </p>
        )}
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-6 space-y-6">
        {state === "submitted" ? (
          <div className="text-center py-8 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
              <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Thank You!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your review has been submitted successfully.
              </p>
            </div>
            <ActionButtons
              isEditing={false}
              onEdit={() => {}}
              onSubmit={() => {}}
              onReset={handleReset}
              isSubmitted={true}
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Your Rating
              </label>
              <StarRating
                rating={rating}
                onChange={setRating}
                size="lg"
                readonly={state === "recording" || state === "transcribing"}
              />
            </div>

            {(state === "idle" || state === "recording" || state === "transcribing") && (
              <div className="flex flex-col items-center py-6 space-y-4">
                {state === "recording" && (
                  <div className="w-full max-w-xs space-y-4">
                    <div className="flex justify-center">
                      <RecordingTimer isRecording={true} />
                    </div>
                    <WaveformAnimation isActive={true} />
                  </div>
                )}
                
                {state === "transcribing" && (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Transcribing your review...
                    </span>
                  </div>
                )}
                
                <MicrophoneButton
                  isRecording={state === "recording"}
                  onToggle={handleToggleRecording}
                  disabled={state === "transcribing"}
                />
              </div>
            )}

            {state === "review" && (
              <div className="space-y-6">
                <TranscriptionBox
                  text={transcribedText}
                  onChange={setTranscribedText}
                  isEditing={isEditing}
                  detectedLanguage={detectedLanguage}
                  translatedFrom={translatedFrom}
                />
                
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  <button
                    onClick={handleToggleRecording}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    data-testid="button-record-again"
                  >
                    Record again
                  </button>
                  <ActionButtons
                    isEditing={isEditing}
                    onEdit={() => setIsEditing(!isEditing)}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    disabled={!transcribedText.trim() || rating === 0}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
