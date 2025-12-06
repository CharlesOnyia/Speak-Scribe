import { useState, useCallback, useRef, useEffect } from "react";

interface SpeechCaptureState {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string;
  originalTranscript: string;
  interimTranscript: string;
  detectedLanguage: string;
  translatedFrom: string | null;
  error: string | null;
  isSupported: boolean;
  audioUrl: string | null;
}

interface UseSpeechCaptureReturn extends SpeechCaptureState {
  startRecording: () => void;
  stopRecording: () => void;
  resetCapture: () => void;
  setTranscript: (text: string) => void;
}

const LANGUAGE_CODES: Record<string, string> = {
  "en-US": "English",
  "en-GB": "English",
  "en-NG": "English (Nigerian)",
  "pcm": "Nigerian Pidgin",
  "fr-FR": "French",
  "fr": "French",
  "es-ES": "Spanish",
  "es": "Spanish",
  "es-MX": "Spanish",
  "it-IT": "Italian",
  "it": "Italian",
  "ig-NG": "Igbo",
  "ig": "Igbo",
  "yo-NG": "Yoruba",
  "yo": "Yoruba",
  "ar-SA": "Arabic",
  "ar": "Arabic",
  "ar-EG": "Arabic",
};

const SUPPORTED_LANGUAGES = [
  { code: "en-US", name: "English" },
  { code: "fr-FR", name: "French" },
  { code: "es-ES", name: "Spanish" },
  { code: "it-IT", name: "Italian" },
  { code: "ar-SA", name: "Arabic" },
  { code: "yo-NG", name: "Yoruba" },
  { code: "ig-NG", name: "Igbo" },
];

function getLanguageName(langCode: string): string {
  if (LANGUAGE_CODES[langCode]) {
    return LANGUAGE_CODES[langCode];
  }
  const baseLang = langCode.split("-")[0];
  if (LANGUAGE_CODES[baseLang]) {
    return LANGUAGE_CODES[baseLang];
  }
  return langCode;
}

export function useSpeechCapture(): UseSpeechCaptureReturn {
  const [state, setState] = useState<SpeechCaptureState>({
    isRecording: false,
    isTranscribing: false,
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
  const currentLanguageIndexRef = useRef(0);
  const fullTranscriptRef = useRef("");
  const detectedLangRef = useRef("English");
  const isRecordingRef = useRef(false);

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
      } catch (e) {
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
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
      detectedLangRef.current = "English";
      currentLanguageIndexRef.current = 0;
      
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
      recognition.lang = SUPPORTED_LANGUAGES[0].code;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimText = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptPart = result[0].transcript;
          
          if (result.isFinal) {
            finalText += transcriptPart + " ";
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

      recognition.onlanguagechange = ((event: Event) => {
        const langEvent = event as SpeechRecognitionEvent;
        if (langEvent.results && langEvent.results.length > 0) {
          const detectedLang = recognition.lang;
          const langName = getLanguageName(detectedLang);
          detectedLangRef.current = langName;
          setState(prev => ({
            ...prev,
            detectedLanguage: langName,
          }));
        }
      }) as EventListener;

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        
        if (!isRecordingRef.current || !recognitionRef.current) {
          console.log("Recording stopped, ignoring error");
          return;
        }
        
        if (event.error === "no-speech") {
          currentLanguageIndexRef.current = (currentLanguageIndexRef.current + 1) % SUPPORTED_LANGUAGES.length;
          if (recognitionRef.current && isRecordingRef.current) {
            try {
              recognitionRef.current.lang = SUPPORTED_LANGUAGES[currentLanguageIndexRef.current].code;
              recognitionRef.current.start();
            } catch (e) {
              console.log("Continuing with current language");
            }
          }
          return;
        }
        
        if (event.error === "aborted" || event.error === "network") {
          return;
        }
        
        setState(prev => ({
          ...prev,
          error: `Speech recognition error: ${event.error}`,
        }));
      };

      recognition.onend = () => {
        console.log("Recognition onend, isRecording:", isRecordingRef.current, "recognitionRef:", !!recognitionRef.current);
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log("Recognition ended");
          }
        }
      };

      recognition.start();
      
      isRecordingRef.current = true;
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
        detectedLanguage: "English",
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

  const stopRecording = useCallback(() => {
    console.log("stopRecording called");
    
    isRecordingRef.current = false;
    
    const recognition = recognitionRef.current;
    if (recognition) {
      recognitionRef.current = null;
      try {
        recognition.abort();
      } catch (e) {
        console.log("Recognition abort error:", e);
      }
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    const finalTranscript = fullTranscriptRef.current.trim();
    const detectedLang = detectedLangRef.current;

    setState(prev => ({
      ...prev,
      isRecording: false,
      isTranscribing: false,
      transcript: finalTranscript || prev.transcript,
      interimTranscript: "",
      detectedLanguage: detectedLang,
    }));

    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || "audio/webm" 
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      setState(prev => ({ ...prev, audioUrl }));
    }
  }, []);

  const resetCapture = useCallback(() => {
    isRecordingRef.current = false;
    
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    fullTranscriptRef.current = "";
    detectedLangRef.current = "English";
    currentLanguageIndexRef.current = 0;

    setState(prev => ({
      isRecording: false,
      isTranscribing: false,
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
