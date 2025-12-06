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

const LINGVA_INSTANCES = [
  "https://lingva.ml",
  "https://lingva.thedaviddelta.com",
  "https://translate.plausibility.cloud",
];

function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] || code.toUpperCase();
}

async function tryLingvaInstance(instance: string, sourceLanguage: string, text: string): Promise<string | null> {
  try {
    const apiUrl = `${instance}/api/v1/${sourceLanguage}/en/${encodeURIComponent(text)}`;
    console.log(`[Translation] Trying Lingva instance: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      console.log(`[Translation] Lingva instance ${instance} returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`[Translation] Lingva response:`, JSON.stringify(data));
    
    if (data.translation) {
      return data.translation;
    }
    
    return null;
  } catch (err) {
    console.log(`[Translation] Lingva instance ${instance} failed:`, err);
    return null;
  }
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

  for (const instance of LINGVA_INSTANCES) {
    const translation = await tryLingvaInstance(instance, sourceLanguage, text);
    
    if (translation) {
      const normalizedOriginal = text.toLowerCase().replace(/[.,!?'"]/g, '').trim();
      const normalizedTranslation = translation.toLowerCase().replace(/[.,!?'"]/g, '').trim();
      
      if (normalizedOriginal === normalizedTranslation) {
        console.log(`[Translation] Same text returned - trying next instance`);
        continue;
      }
      
      return {
        translatedText: translation,
        detectedLanguage: sourceLangName,
        error: null,
      };
    }
  }

  console.log(`[Translation] All Lingva instances failed, falling back to MyMemory`);
  
  try {
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|en`;
    console.log(`[Translation] MyMemory API URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Translation service unavailable");
    }

    const data = await response.json();
    console.log(`[Translation] MyMemory response:`, JSON.stringify(data));

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      let translatedText = data.responseData.translatedText;
      
      if (translatedText.toUpperCase() === translatedText && text.toUpperCase() !== text) {
        translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1).toLowerCase();
      }
      
      const normalizedOriginal = text.toLowerCase().replace(/[.,!?'"]/g, '').trim();
      const normalizedTranslation = translatedText.toLowerCase().replace(/[.,!?'"]/g, '').trim();
      
      if (normalizedOriginal === normalizedTranslation) {
        console.log(`[Translation] MyMemory returned same text - translation failed`);
        return {
          translatedText: text,
          detectedLanguage: sourceLangName,
          error: "Translation service could not translate this text. Showing original.",
        };
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
    console.error("[Translation] All services failed:", err);
    return {
      translatedText: text,
      detectedLanguage: sourceLangName,
      error: "Translation service temporarily unavailable. Showing original text.",
    };
  }
}

export { getLanguageName };
