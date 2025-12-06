const LIBRE_TRANSLATE_MIRRORS = [
  "https://libretranslate.com",
  "https://translate.argosopentech.com",
  "https://translate.terraprint.co",
];

interface TranslationResult {
  translatedText: string;
  detectedLanguage: string | null;
  error: string | null;
}

interface DetectionResult {
  language: string;
  confidence: number;
}

const LANGUAGE_CODE_MAP: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
};

function getLanguageName(code: string): string {
  return LANGUAGE_CODE_MAP[code] || code.toUpperCase();
}

async function tryTranslateWithMirror(
  mirrorUrl: string,
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ translatedText: string } | null> {
  try {
    const response = await fetch(`${mirrorUrl}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return { translatedText: data.translatedText };
  } catch {
    return null;
  }
}

async function tryDetectWithMirror(
  mirrorUrl: string,
  text: string
): Promise<DetectionResult[] | null> {
  try {
    const response = await fetch(`${mirrorUrl}/detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
      }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

export async function detectLanguage(text: string): Promise<{ language: string; confidence: number } | null> {
  if (!text || text.trim().length < 3) {
    return null;
  }

  for (const mirror of LIBRE_TRANSLATE_MIRRORS) {
    const result = await tryDetectWithMirror(mirror, text);
    if (result && result.length > 0) {
      return {
        language: result[0].language,
        confidence: result[0].confidence,
      };
    }
  }

  return null;
}

export async function translateToEnglish(
  text: string,
  sourceLanguage?: string
): Promise<TranslationResult> {
  if (!text || text.trim().length === 0) {
    return {
      translatedText: "",
      detectedLanguage: null,
      error: "No text to translate",
    };
  }

  let sourceLang = sourceLanguage || "auto";
  let detectedLang: string | null = null;

  if (sourceLang === "auto" || !sourceLang) {
    const detection = await detectLanguage(text);
    if (detection) {
      sourceLang = detection.language;
      detectedLang = getLanguageName(detection.language);
    } else {
      sourceLang = "auto";
    }
  } else {
    detectedLang = getLanguageName(sourceLang);
  }

  if (sourceLang === "en") {
    return {
      translatedText: text,
      detectedLanguage: "English",
      error: null,
    };
  }

  for (const mirror of LIBRE_TRANSLATE_MIRRORS) {
    const result = await tryTranslateWithMirror(mirror, text, sourceLang, "en");
    if (result) {
      return {
        translatedText: result.translatedText,
        detectedLanguage: detectedLang,
        error: null,
      };
    }
  }

  return {
    translatedText: "",
    detectedLanguage: detectedLang,
    error: "Translation service is temporarily unavailable. Please try again later.",
  };
}

export { getLanguageName };
