import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

interface MicrophoneButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function MicrophoneButton({ isRecording, onToggle, disabled }: MicrophoneButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse-ring" />
        )}
        <Button
          size="icon"
          variant={isRecording ? "destructive" : "default"}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-lg transition-transform active:scale-95"
          onClick={onToggle}
          disabled={disabled}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          data-testid="button-microphone"
        >
          {isRecording ? (
            <Square className="h-6 w-6 md:h-8 md:w-8" />
          ) : (
            <Mic className="h-6 w-6 md:h-8 md:w-8" />
          )}
        </Button>
      </div>
      <span className="text-sm text-muted-foreground font-medium" data-testid="text-mic-hint">
        {isRecording ? "Tap to Stop" : "Tap to Speak Your Review"}
      </span>
    </div>
  );
}
