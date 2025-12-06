import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

export interface Language {
  code: string;
  name: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", speechCode: "en-US" },
  { code: "es", name: "Spanish", speechCode: "es-ES" },
  { code: "fr", name: "French", speechCode: "fr-FR" },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedLanguage}
        onValueChange={onLanguageChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className="w-[140px]" 
          data-testid="select-language"
        >
          <SelectValue placeholder="Select language">
            {currentLanguage.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              data-testid={`option-language-${lang.code}`}
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function getLanguageByCode(code: string): Language {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}

export function getSpeechCodeByLanguage(code: string): string {
  const language = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return language?.speechCode || "en-US";
}
