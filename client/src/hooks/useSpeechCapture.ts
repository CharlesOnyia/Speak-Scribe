import { useState, useCallback, useRef, useEffect } from "react";
import { translateToEnglish } from "@/lib/translate";
import { getSpeechCodeByLanguage } from "@/components/LanguageSelector";

interface SpeechCaptureState {
  isRecording: boolean;
  isTranscribing: boolean;
  isTranslating: boolean;
  transcript: string;
  originalTranscript: string;
  interimTranscript: string;
  detectedLanguage: string;
  translatedFrom: string | null;
  error: string | null;
  isSupported: boolean;
  audioUrl: string | null;
}

interface UseSpeechCaptureOptions {
  selectedLanguage?: string;
}

interface UseSpeechCaptureReturn extends SpeechCaptureState {
  startRecording: () => void;
  stopRecording: () => Promise<void>;
  resetCapture: () => void;
  setTranscript: (text: string) => void;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
};

function getLanguageName(langCode: string): string {
  const baseLang = langCode.split("-")[0];
  return LANGUAGE_NAMES[baseLang] || langCode;
}

export function useSpeechCapture(options: UseSpeechCaptureOptions = {}): UseSpeechCaptureReturn {
  const { selectedLanguage = "en" } = options;
  
  const [state, setState] = useState<SpeechCaptureState>({
    isRecording: false,
    isTranscribing: false,
    isTranslating: false,
    transcript: "",
    originalTranscript: "",
    interimTranscript: "",
    detectedLanguage: "English",
    translatedFrom: null,
    error: null,
    isSupported: false,
    audioUrl: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const fullTranscriptRef = useRef("");
  const isRecordingRef = useRef(false);
  const selectedLanguageRef = useRef(selectedLanguage);

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition && !!navigator.mediaDevices?.getUserMedia;
    setState(prev => ({ ...prev, isSupported }));

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setState(prev => ({
        ...prev,
        error: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
      }));
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioChunksRef.current = [];
      fullTranscriptRef.current = "";
      
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/ogg";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "";
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      const speechCode = getSpeechCodeByLanguage(selectedLanguageRef.current);
      recognition.lang = speechCode;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptPart = result[0].transcript;
          
          if (result.isFinal) {
            fullTranscriptRef.current += transcriptPart + " ";
          } else {
            interimText += transcriptPart;
          }
        }

        setState(prev => ({
          ...prev,
          transcript: fullTranscriptRef.current.trim(),
          interimTranscript: interimText,
        }));
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (!isRecordingRef.current) {
          return;
        }
        
        if (event.error === "aborted") {
          return;
        }
        
        if (event.error === "no-speech") {
          return;
        }
        
        if (event.error === "network") {
          return;
        }
        
        setState(prev => ({
          ...prev,
          error: `Speech recognition error: ${event.error}`,
        }));
      };

      recognition.onend = () => {
        if (!isRecordingRef.current) {
          return;
        }
        
        if (!recognitionRef.current) {
          return;
        }
        
        // Use a longer delay for non-English locales to avoid rapid restart loops
        // that can cause issues with Chrome's Web Speech API for non-English languages
        const currentLang = selectedLanguageRef.current;
        const restartDelay = currentLang === "en" ? 100 : 300;
        
        setTimeout(() => {
          if (isRecordingRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // Recognition already started or stopped
            }
          }
        }, restartDelay);
      };

      recognition.start();
      
      isRecordingRef.current = true;
      const langName = getLanguageName(selectedLanguageRef.current);
      
      setState(prev => ({
        ...prev,
        isRecording: true,
        isTranscribing: false,
        transcript: "",
        originalTranscript: "",
        interimTranscript: "",
        error: null,
        audioUrl: null,
        translatedFrom: null,
        detectedLanguage: langName,
      }));

    } catch (err) {
      console.error("Failed to start recording:", err);
      isRecordingRef.current = false;
      setState(prev => ({
        ...prev,
        error: "Could not access microphone. Please check your permissions.",
        isRecording: false,
      }));
    }
  }, []);

  const stopRecording = useCallback(async () => {
    isRecordingRef.current = false;
    
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    
    if (recognition) {
      try {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        recognition.abort();
      } catch {
        // ignore
      }
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    const finalTranscript = fullTranscriptRef.current.trim();
    const currentLang = selectedLanguageRef.current;
    const langName = getLanguageName(currentLang);

    setState(prev => ({
      ...prev,
      isRecording: false,
      isTranscribing: false,
      transcript: finalTranscript || prev.transcript,
      originalTranscript: finalTranscript || prev.transcript,
      interimTranscript: "",
      detectedLanguage: langName,
    }));

    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || "audio/webm" 
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      setState(prev => ({ ...prev, audioUrl }));
    }

    if (finalTranscript && finalTranscript.length > 0 && currentLang !== "en") {
      setState(prev => ({ ...prev, isTranslating: true }));
      
      try {
        const result = await translateToEnglish(finalTranscript, currentLang);
        
        if (result.error) {
          setState(prev => ({
            ...prev,
            isTranslating: false,
            error: result.error,
          }));
        } else if (result.translatedText) {
          setState(prev => ({
            ...prev,
            isTranslating: false,
            transcript: result.translatedText,
            originalTranscript: finalTranscript,
            translatedFrom: langName,
            detectedLanguage: langName,
          }));
        } else {
          setState(prev => ({
            ...prev,
            isTranslating: false,
          }));
        }
      } catch (err) {
        console.error("Translation error:", err);
        setState(prev => ({
          ...prev,
          isTranslating: false,
          error: "Translation failed. Your review is shown in the original language.",
        }));
      }
    }
  }, []);

  const resetCapture = useCallback(() => {
    isRecordingRef.current = false;
    
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    
    if (recognition) {
      try {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        recognition.abort();
      } catch {
        // ignore
      }
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    fullTranscriptRef.current = "";

    setState(prev => ({
      isRecording: false,
      isTranscribing: false,
      isTranslating: false,
      transcript: "",
      originalTranscript: "",
      interimTranscript: "",
      detectedLanguage: "English",
      translatedFrom: null,
      error: null,
      isSupported: prev.isSupported,
      audioUrl: null,
    }));
  }, [state.audioUrl]);

  const setTranscript = useCallback((text: string) => {
    setState(prev => ({ ...prev, transcript: text }));
    fullTranscriptRef.current = text;
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    resetCapture,
    setTranscript,
  };
}
