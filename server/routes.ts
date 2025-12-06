import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { transcribeAudio, translateText } from "./transcription";
import multer from "multer";

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit (Whisper API limit)
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Transcription endpoint - accepts audio file and returns transcription
  app.post(
    "/api/transcribe",
    upload.single("audio"),
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No audio file provided" });
        }

        if (!process.env.OPENAI_API_KEY) {
          return res.status(500).json({ 
            error: "OpenAI API key not configured. Please add your API key to continue." 
          });
        }

        const result = await transcribeAudio(
          req.file.buffer,
          req.file.mimetype
        );

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
          error: error instanceof Error ? error.message : "Failed to transcribe audio",
        });
      }
    }
  );

  // Translation endpoint - translates text between languages
  app.post("/api/translate", async (req: Request, res: Response) => {
    try {
      const { text, fromLanguage, toLanguage } = req.body;

      if (!text || !fromLanguage) {
        return res.status(400).json({ error: "Missing required fields: text, fromLanguage" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured. Please add your API key to continue." 
        });
      }

      const translatedText = await translateText(text, fromLanguage, toLanguage || "English");

      return res.json({
        success: true,
        translatedText,
        fromLanguage,
        toLanguage: toLanguage || "English",
      });
    } catch (error) {
      console.error("Translation endpoint error:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to translate text",
      });
    }
  });

  return httpServer;
}
