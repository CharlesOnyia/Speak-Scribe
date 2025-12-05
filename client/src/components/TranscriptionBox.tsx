import { Textarea } from "@/components/ui/textarea";
import { LanguageIndicator } from "./LanguageIndicator";

interface TranscriptionBoxProps {
  text: string;
  onChange: (text: string) => void;
  isEditing: boolean;
  detectedLanguage?: string;
  translatedFrom?: string;
  placeholder?: string;
}

export function TranscriptionBox({
  text,
  onChange,
  isEditing,
  detectedLanguage = "Auto-detect",
  translatedFrom,
  placeholder = "Your review will appear here...",
}: TranscriptionBoxProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <label className="text-sm font-medium text-foreground">
          Your Review
        </label>
        {text && (
          <LanguageIndicator
            detectedLanguage={detectedLanguage}
            translatedFrom={translatedFrom}
            showTranslation={!!translatedFrom}
          />
        )}
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
