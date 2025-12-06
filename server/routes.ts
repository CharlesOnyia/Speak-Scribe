import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { createTranscriptionResult } from "./transcription";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Simple transcription result endpoint - browser handles actual transcription
  // This just formats the result properly
  app.post("/api/transcribe", async (req: Request, res: Response) => {
    try {
      const { text, languageCode } = req.body;

      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      const result = createTranscriptionResult(text, languageCode || "en");

      return res.json({
        success: true,
        originalText: result.originalText,
        translatedText: result.translatedText,
        detectedLanguage: result.detectedLanguage,
        detectedLanguageCode: result.detectedLanguageCode,
        needsTranslation: result.needsTranslation,
      });
    } catch (error) {
      console.error("Transcription endpoint error:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to process transcription",
      });
    }
  });

  return httpServer;
}
