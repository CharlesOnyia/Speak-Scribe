import { Badge } from "@/components/ui/badge";
import { Languages, Globe } from "lucide-react";

interface LanguageIndicatorProps {
  detectedLanguage: string;
  translatedFrom?: string;
  showTranslation?: boolean;
}

export function LanguageIndicator({
  detectedLanguage,
  translatedFrom,
  showTranslation = false,
}: LanguageIndicatorProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      <Badge variant="secondary" className="gap-1.5" data-testid="badge-language">
        <Globe className="h-3 w-3" />
        {detectedLanguage}
      </Badge>
      {showTranslation && translatedFrom && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic" data-testid="text-translation-source">
          <Languages className="h-3 w-3" />
          Translated from {translatedFrom}
        </div>
      )}
    </div>
  );
}
