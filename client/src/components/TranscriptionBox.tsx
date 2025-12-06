import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LanguageIndicator } from "./LanguageIndicator";
import { ArrowLeftRight } from "lucide-react";

interface TranscriptionBoxProps {
  text: string;
  onChange: (text: string) => void;
  isEditing: boolean;
  detectedLanguage?: string;
  translatedFrom?: string;
  placeholder?: string;
  showOriginal?: boolean;
  onToggleOriginal?: () => void;
}

export function TranscriptionBox({
  text,
  onChange,
  isEditing,
  detectedLanguage = "Auto-detect",
  translatedFrom,
  placeholder = "Your review will appear here...",
  showOriginal = false,
  onToggleOriginal,
}: TranscriptionBoxProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <label className="text-sm font-medium text-foreground">
          Your Review
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {translatedFrom && onToggleOriginal && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleOriginal}
              className="text-xs gap-1.5"
              data-testid="button-toggle-language"
            >
              <ArrowLeftRight className="h-3 w-3" />
              {showOriginal ? `View English` : `View ${translatedFrom}`}
            </Button>
          )}
          {text && (
            <LanguageIndicator
              detectedLanguage={detectedLanguage}
              translatedFrom={showOriginal ? undefined : translatedFrom}
              showTranslation={!showOriginal && !!translatedFrom}
            />
          )}
        </div>
      </div>
      <Textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        readOnly={!isEditing}
        placeholder={placeholder}
        className={`min-h-32 text-base leading-relaxed resize-none ${
          !isEditing ? "bg-muted/50" : ""
        }`}
        aria-label="Review transcription"
        data-testid="textarea-transcription"
      />
    </div>
  );
}
