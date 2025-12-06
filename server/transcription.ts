import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured. Please add your OPENAI_API_KEY to continue.");
  }
  
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  return openaiClient;
}

// Supported languages with their codes
const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  it: "Italian",
  ar: "Arabic",
  yo: "Yoruba",
  ig: "Igbo",
  pcm: "Nigerian Pidgin",
};

interface TranscriptionResult {
  originalText: string;
  translatedText: string | null;
  detectedLanguage: string;
  detectedLanguageCode: string;
  needsTranslation: boolean;
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string = "audio/webm"
): Promise<TranscriptionResult> {
  const openai = getOpenAIClient();
  
  try {
    // Convert buffer to a File-like object for OpenAI
    const audioFile = new File([audioBuffer], "audio.webm", { type: mimeType });

    // Use Whisper to transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json",
    });

    const originalText = transcription.text;
    const detectedLanguageCode = transcription.language || "en";
    const detectedLanguage = SUPPORTED_LANGUAGES[detectedLanguageCode] || detectedLanguageCode;
    const needsTranslation = detectedLanguageCode !== "en";

    let translatedText: string | null = null;

    // If not English, translate to English
    if (needsTranslation && originalText.trim()) {
      translatedText = await translateToEnglish(originalText, detectedLanguage);
    }

    return {
      originalText,
      translatedText,
      detectedLanguage,
      detectedLanguageCode,
      needsTranslation,
    };
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function translateToEnglish(text: string, sourceLanguage: string): Promise<string> {
  const openai = getOpenAIClient();
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following ${sourceLanguage} text to English. 
Maintain the original tone, meaning, and nuance. 
If the text contains slang or colloquial expressions, translate them to equivalent English expressions.
Only output the translation, nothing else.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_completion_tokens: 2048,
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error("Translation error:", error);
    // Return original text if translation fails
    return text;
  }
}

export async function translateText(
  text: string,
  fromLanguage: string,
  toLanguage: string = "English"
): Promise<string> {
  const openai = getOpenAIClient();
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following ${fromLanguage} text to ${toLanguage}. 
Maintain the original tone, meaning, and nuance. 
If the text contains slang or colloquial expressions, translate them to equivalent expressions in the target language.
Only output the translation, nothing else.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_completion_tokens: 2048,
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error(`Failed to translate: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
