// Supported languages with their codes (English, Spanish, French only)
export const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
};

export interface TranscriptionResult {
  originalText: string;
  translatedText: string | null;
  detectedLanguage: string;
  detectedLanguageCode: string;
  needsTranslation: boolean;
}

// Simple transcription result without external API
// The browser's Web Speech API handles transcription on the client side
// This function just returns the text as-is without translation
export function createTranscriptionResult(
  text: string,
  languageCode: string = "en"
): TranscriptionResult {
  const detectedLanguage = SUPPORTED_LANGUAGES[languageCode] || languageCode;
  const needsTranslation = languageCode !== "en";

  return {
    originalText: text,
    translatedText: null, // No translation without API key
    detectedLanguage,
    detectedLanguageCode: languageCode,
    needsTranslation,
  };
}
