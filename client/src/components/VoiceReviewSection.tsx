import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MicrophoneButton } from "./MicrophoneButton";
import { WaveformAnimation } from "./WaveformAnimation";
import { RecordingTimer } from "./RecordingTimer";
import { TranscriptionBox } from "./TranscriptionBox";
import { ActionButtons } from "./ActionButtons";
import { StarRating } from "./StarRating";
import { MessageSquare, Keyboard, Mic, AlertCircle, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSpeechCapture } from "@/hooks/useSpeechCapture";

type ReviewState = "idle" | "recording" | "transcribing" | "review" | "submitted";
type InputMode = "voice" | "text";

interface VoiceReviewSectionProps {
  productName?: string;
  onSubmitReview?: (review: {
    text: string;
    rating: number;
    language: string;
    reviewerName: string;
  }) => Promise<void>;
}

export function VoiceReviewSection({ 
  productName,
  onSubmitReview 
}: VoiceReviewSectionProps) {
  const { toast } = useToast();
  const [state, setState] = useState<ReviewState>("idle");
  const [inputMode, setInputMode] = useState<InputMode>("voice");
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    isRecording,
    isTranscribing,
    isTranslating,
    transcript,
    originalTranscript,
    detectedLanguage,
    translatedFrom,
    error,
    isSupported,
    startRecording,
    stopRecording,
    resetCapture,
    setTranscript,
  } = useSpeechCapture();
  
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    if (state === "submitted") {
      return;
    }
    
    if (isRecording) {
      setState("recording");
    } else if (isTranscribing || isTranslating) {
      setState("transcribing");
    } else if (transcript && state !== "idle") {
      setState("review");
    } else if (!isRecording && !isTranscribing && !isTranslating && state === "recording") {
      setState("idle");
    }
  }, [isRecording, isTranscribing, isTranslating, transcript, state]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Recording Error",
        description: error,
        variant: "destructive",
      });
      if (state === "recording") {
        setState("idle");
      }
    }
  }, [error, toast, state]);

  const handleStartRecording = useCallback(() => {
    startRecording();
  }, [startRecording]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handleSwitchToText = () => {
    setInputMode("text");
    setState("review");
    setIsEditing(true);
    resetCapture();
  };

  const handleSwitchToVoice = () => {
    setInputMode("voice");
    setState("idle");
    resetCapture();
  };

  const handleSubmit = async () => {
    if (!transcript.trim() || rating === 0) {
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
          text: transcript,
          rating,
          language: detectedLanguage,
          reviewerName: "",
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      setState("submitted");
      toast({
        title: "Review submitted",
        description: "Thank you! Your feedback has been recorded.",
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
    setIsEditing(false);
    setRating(0);
    setShowOriginal(false);
    resetCapture();
  };

  const handleNewReview = () => {
    setState("idle");
    setInputMode("voice");
    setIsEditing(false);
    setRating(0);
    setShowOriginal(false);
    resetCapture();
  };

  return (
    <Card className="w-full shadow-lg border-purple-100 dark:border-purple-900/30 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Leave a Review</CardTitle>
        </div>
        {productName && (
          <p className="text-sm text-muted-foreground">
            Share your thoughts about {productName}
          </p>
        )}
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-6 space-y-6">
        {!isSupported && inputMode === "voice" && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm">
              Voice recording is not supported in your browser. Please use Chrome, Edge, or Safari, or type your review instead.
            </p>
          </div>
        )}

        {state === "submitted" && (
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleNewReview}
                data-testid="button-new-review"
              >
                Leave Another Review
              </Button>
            </div>
          </div>
        )}

        {state !== "submitted" && (
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
                    <p className="text-xs text-center text-muted-foreground">
                      Speak in any language - we'll transcribe it for you
                    </p>
                  </div>
                )}
                
                {state === "transcribing" && (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {isTranslating ? "Translating your review..." : "Processing your review..."}
                    </span>
                  </div>
                )}
                
                <MicrophoneButton
                  isRecording={state === "recording"}
                  onStart={handleStartRecording}
                  onStop={handleStopRecording}
                  disabled={state === "transcribing" || !isSupported}
                />
                
                {state === "idle" && (
                  <>
                    <p className="text-sm text-muted-foreground text-center">
                      {isSupported 
                        ? "Tap to start recording your review"
                        : "Voice recording unavailable"}
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
                          data-testid="button-language-info"
                        >
                          <Globe className="h-3 w-3" />
                          <span>Multilingual support</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-xs">
                          Supports English, Spanish, and French
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <button
                      onClick={handleSwitchToText}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                      data-testid="button-type-instead"
                    >
                      <Keyboard className="h-4 w-4" />
                      Or type your review instead
                    </button>
                  </>
                )}
              </div>
            )}

            {inputMode === "text" && state !== "recording" && state !== "transcribing" && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your review here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-32 resize-none"
                  data-testid="input-review-text"
                />
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  <button
                    onClick={handleSwitchToVoice}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    data-testid="button-use-voice"
                  >
                    <Mic className="h-4 w-4" />
                    Use voice instead
                  </button>
                  <ActionButtons
                    isEditing={true}
                    onEdit={() => {}}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    disabled={!transcript.trim() || rating === 0}
                  />
                </div>
              </div>
            )}

            {state === "review" && inputMode === "voice" && (
              <div className="space-y-6">
                {translatedFrom && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 text-center">
                    Translated from {translatedFrom} to English
                  </div>
                )}
                <TranscriptionBox
                  text={showOriginal ? originalTranscript : transcript}
                  onChange={setTranscript}
                  isEditing={isEditing}
                  detectedLanguage={detectedLanguage}
                  translatedFrom={translatedFrom || undefined}
                  showOriginal={showOriginal}
                  onToggleOriginal={translatedFrom ? () => setShowOriginal(!showOriginal) : undefined}
                />
                
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleStartRecording}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      data-testid="button-record-again"
                    >
                      <Mic className="h-4 w-4" />
                      Record again
                    </button>
                  </div>
                  <ActionButtons
                    isEditing={isEditing}
                    onEdit={() => setIsEditing(!isEditing)}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    disabled={!transcript.trim() || rating === 0}
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
