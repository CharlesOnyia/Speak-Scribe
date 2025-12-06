import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MicrophoneButton } from "./MicrophoneButton";
import { WaveformAnimation } from "./WaveformAnimation";
import { RecordingTimer } from "./RecordingTimer";
import { TranscriptionBox } from "./TranscriptionBox";
import { ActionButtons } from "./ActionButtons";
import { StarRating } from "./StarRating";
import { MessageSquare, Keyboard, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ReviewState = "idle" | "recording" | "transcribing" | "review" | "submitted";
type InputMode = "voice" | "text";

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
  const [inputMode, setInputMode] = useState<InputMode>("voice");
  const [transcribedText, setTranscribedText] = useState("");
  const [originalText, setOriginalText] = useState<string | undefined>();
  const [showOriginal, setShowOriginal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("English");
  const [translatedFrom, setTranslatedFrom] = useState<string | undefined>();

  const handleToggleRecording = useCallback(() => {
    if (state === "idle" || state === "review") {
      setState("recording");
      setTranscribedText("");
      setOriginalText(undefined);
      setTranslatedFrom(undefined);
      setShowOriginal(false);
    } else if (state === "recording") {
      setState("transcribing");
      
      // todo: remove mock functionality - simulate transcription delay
      setTimeout(() => {
        const mockResponses = [
          {
            text: "This product exceeded all my expectations! The build quality is outstanding and it works exactly as advertised. I would definitely recommend this to anyone looking for a reliable solution. Five stars from me!",
            originalText: undefined,
            language: "English",
            translatedFrom: undefined,
          },
          {
            text: "I absolutely love this product. It arrived quickly and was packaged beautifully. The quality is top-notch and it performs even better than I expected. Great value for money!",
            originalText: "J'adore absolument ce produit. Il est arrivé rapidement et était magnifiquement emballé. La qualité est excellente et il fonctionne encore mieux que prévu. Excellent rapport qualité-prix!",
            language: "English",
            translatedFrom: "French",
          },
          {
            text: "Very satisfied with my purchase. The customer service was excellent and the product itself is exactly what I needed. Would buy again without hesitation.",
            originalText: "Muy satisfecho con mi compra. El servicio al cliente fue excelente y el producto en sí es exactamente lo que necesitaba. Volvería a comprar sin dudarlo.",
            language: "English",
            translatedFrom: "Spanish",
          },
        ];
        
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        setTranscribedText(randomResponse.text);
        setOriginalText(randomResponse.originalText);
        setDetectedLanguage(randomResponse.language);
        setTranslatedFrom(randomResponse.translatedFrom);
        setState("review");
      }, 1500);
    }
  }, [state]);

  const handleSwitchToText = () => {
    setInputMode("text");
    setState("review");
    setIsEditing(true);
    setTranscribedText("");
    setOriginalText(undefined);
    setTranslatedFrom(undefined);
  };

  const handleSwitchToVoice = () => {
    setInputMode("voice");
    setState("idle");
    setTranscribedText("");
    setOriginalText(undefined);
    setTranslatedFrom(undefined);
  };

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
    setInputMode("voice");
    setTranscribedText("");
    setOriginalText(undefined);
    setIsEditing(false);
    setRating(0);
    setTranslatedFrom(undefined);
    setShowOriginal(false);
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

            {(state === "idle" || state === "recording" || state === "transcribing") && inputMode === "voice" && (
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
                
                {state === "idle" && (
                  <button
                    onClick={handleSwitchToText}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                    data-testid="button-type-instead"
                  >
                    <Keyboard className="h-4 w-4" />
                    Or type your review instead
                  </button>
                )}
              </div>
            )}

            {state === "review" && (
              <div className="space-y-6">
                <TranscriptionBox
                  text={showOriginal && originalText ? originalText : transcribedText}
                  onChange={setTranscribedText}
                  isEditing={isEditing}
                  detectedLanguage={showOriginal && translatedFrom ? translatedFrom : detectedLanguage}
                  translatedFrom={translatedFrom}
                  showOriginal={showOriginal}
                  onToggleOriginal={originalText ? () => setShowOriginal(!showOriginal) : undefined}
                />
                
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  <div className="flex items-center gap-3">
                    {inputMode === "voice" ? (
                      <button
                        onClick={handleToggleRecording}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        data-testid="button-record-again"
                      >
                        <Mic className="h-4 w-4" />
                        Record again
                      </button>
                    ) : (
                      <button
                        onClick={handleSwitchToVoice}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        data-testid="button-use-voice"
                      >
                        <Mic className="h-4 w-4" />
                        Use voice instead
                      </button>
                    )}
                  </div>
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
