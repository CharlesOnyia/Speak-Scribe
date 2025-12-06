import { Textarea } from "@/components/ui/textarea";
import { Globe } from "lucide-react";

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
  detectedLanguage = "English",
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
        {translatedFrom && onToggleOriginal && (
          <button
            onClick={onToggleOriginal}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-toggle-language"
          >
            <Globe className="h-3.5 w-3.5" />
            {showOriginal 
              ? `View English` 
              : `View Original (${translatedFrom})`
            }
          </button>
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
