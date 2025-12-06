interface TranslationResult {
  translatedText: string;
  detectedLanguage: string | null;
  error: string | null;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
};

function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] || code.toUpperCase();
}

export async function translateToEnglish(
  text: string,
  sourceLanguage: string
): Promise<TranslationResult> {
  if (!text || text.trim().length === 0) {
    return {
      translatedText: "",
      detectedLanguage: null,
      error: null,
    };
  }

  if (sourceLanguage === "en") {
    return {
      translatedText: text,
      detectedLanguage: "English",
      error: null,
    };
  }

  const sourceLangName = getLanguageName(sourceLanguage);

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|en`
    );

    if (!response.ok) {
      throw new Error("Translation service unavailable");
    }

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      let translatedText = data.responseData.translatedText;
      
      if (translatedText.toUpperCase() === translatedText && text.toUpperCase() !== text) {
        translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1).toLowerCase();
      }

      return {
        translatedText,
        detectedLanguage: sourceLangName,
        error: null,
      };
    }

    if (data.responseStatus === 403 || data.quotaFinished) {
      return {
        translatedText: "",
        detectedLanguage: sourceLangName,
        error: "Translation quota exceeded. Please try again later.",
      };
    }

    return {
      translatedText: text,
      detectedLanguage: sourceLangName,
      error: null,
    };
  } catch (err) {
    console.error("Translation error:", err);
    return {
      translatedText: "",
      detectedLanguage: sourceLangName,
      error: "Translation service temporarily unavailable.",
    };
  }
}

export { getLanguageName };
