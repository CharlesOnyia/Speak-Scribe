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
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-pink-500 animate-ping opacity-30 pointer-events-none" />
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-red-400 to-pink-500 animate-pulse opacity-20 pointer-events-none" />
          </>
        )}
        {!isRecording && !disabled && (
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-50 blur-sm pointer-events-none" />
        )}
        <Button
          size="icon"
          variant={isRecording ? "destructive" : "default"}
          onClick={onToggle}
          disabled={disabled}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          data-testid="button-microphone"
          className={`
            relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full
            shadow-lg transition-all duration-200
            ${isRecording 
              ? 'bg-gradient-to-br from-red-500 to-pink-600 border-red-400 hover:from-red-600 hover:to-pink-700' 
              : 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400 hover:from-purple-600 hover:to-pink-600'
            }
          `}
        >
          {isRecording ? (
            <Square className="h-6 w-6 md:h-8 md:w-8 text-white" />
          ) : (
            <Mic className="h-6 w-6 md:h-8 md:w-8 text-white" />
          )}
        </Button>
      </div>
      <span className="text-sm text-muted-foreground font-medium" data-testid="text-mic-hint">
        {isRecording ? "Tap to Stop" : "Tap to Speak Your Review"}
      </span>
    </div>
  );
}
