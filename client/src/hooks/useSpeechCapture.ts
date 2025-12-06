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
  const interimTranscriptRef = useRef("");
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
      interimTranscriptRef.current = "";
      
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
      recognition.maxAlternatives = 3;
      
      const speechCode = getSpeechCodeByLanguage(selectedLanguageRef.current);
      recognition.lang = speechCode;
      
      console.log(`[Speech] Recognition config: continuous=${recognition.continuous}, interimResults=${recognition.interimResults}, lang=${recognition.lang}`);

      const handleResult = (event: SpeechRecognitionEvent) => {
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          
          let bestTranscript = "";
          let bestConfidence = 0;
          
          for (let j = 0; j < result.length; j++) {
            const alt = result[j];
            console.log(`[Speech] Alt ${j}: "${alt.transcript}" (confidence: ${alt.confidence?.toFixed(2) || 'N/A'})`);
            if (alt.confidence > bestConfidence || j === 0) {
              bestTranscript = alt.transcript;
              bestConfidence = alt.confidence || 0;
            }
          }
          
          const currentSpeechCode = getSpeechCodeByLanguage(selectedLanguageRef.current);
          console.log(`[Speech] Best result: "${bestTranscript}" (confidence: ${bestConfidence?.toFixed(2) || 'N/A'}, final: ${result.isFinal}, lang: ${currentSpeechCode})`);
          
          if (result.isFinal) {
            fullTranscriptRef.current += bestTranscript + " ";
            interimTranscriptRef.current = "";
          } else {
            interimText += bestTranscript;
          }
        }

        interimTranscriptRef.current = interimText;

        setState(prev => ({
          ...prev,
          transcript: fullTranscriptRef.current.trim(),
          interimTranscript: interimText,
        }));
      };

      const handleError = (event: SpeechRecognitionErrorEvent) => {
        const currentSpeechCode = getSpeechCodeByLanguage(selectedLanguageRef.current);
        console.log(`[Speech] Error: ${event.error} (recording: ${isRecordingRef.current}, lang: ${currentSpeechCode})`);
        
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
        
        if (event.error === "language-not-supported") {
          setState(prev => ({
            ...prev,
            error: `Language ${currentSpeechCode} is not supported by your browser. Try using Chrome.`,
          }));
          return;
        }
        
        setState(prev => ({
          ...prev,
          error: `Speech recognition error: ${event.error}`,
        }));
      };

      const handleStart = () => {
        const currentSpeechCode = getSpeechCodeByLanguage(selectedLanguageRef.current);
        console.log(`[Speech] Recognition started successfully with lang: ${currentSpeechCode}`);
      };
      
      const handleAudioStart = () => {
        console.log(`[Speech] Audio capture started`);
      };
      
      const handleSpeechStart = () => {
        console.log(`[Speech] Speech detected`);
      };
      
      const handleSpeechEnd = () => {
        console.log(`[Speech] Speech ended`);
      };
      
      const handleSoundStart = () => {
        console.log(`[Speech] Sound detected`);
      };
      
      const handleSoundEnd = () => {
        console.log(`[Speech] Sound ended`);
      };
      
      const handleNoMatch = () => {
        console.log(`[Speech] No match found for speech`);
      };

      const createFreshRecognition = (): SpeechRecognition | null => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) return null;
        
        const newRecognition = new SpeechRecognitionAPI();
        newRecognition.continuous = true;
        newRecognition.interimResults = true;
        newRecognition.maxAlternatives = 3;
        newRecognition.lang = getSpeechCodeByLanguage(selectedLanguageRef.current);
        
        newRecognition.onresult = handleResult;
        newRecognition.onerror = handleError;
        newRecognition.onend = handleEnd;
        newRecognition.onstart = handleStart;
        newRecognition.onaudiostart = handleAudioStart;
        newRecognition.onspeechstart = handleSpeechStart;
        newRecognition.onspeechend = handleSpeechEnd;
        newRecognition.onsoundstart = handleSoundStart;
        newRecognition.onsoundend = handleSoundEnd;
        newRecognition.onnomatch = handleNoMatch;
        
        return newRecognition;
      };

      const handleEnd = () => {
        const currentSpeechCode = getSpeechCodeByLanguage(selectedLanguageRef.current);
        console.log(`[Speech] Recognition ended (recording: ${isRecordingRef.current}, hasRef: ${!!recognitionRef.current}, lang: ${currentSpeechCode})`);
        
        if (!isRecordingRef.current) {
          return;
        }
        
        if (!recognitionRef.current) {
          return;
        }
        
        const currentLang = selectedLanguageRef.current;
        
        if (currentLang === "fr") {
          console.log(`[Speech] French: Creating fresh recognition instance`);
          
          setTimeout(() => {
            if (!isRecordingRef.current) return;
            
            const newRecognition = createFreshRecognition();
            if (!newRecognition) return;
            
            recognitionRef.current = newRecognition;
            
            try {
              console.log(`[Speech] Starting fresh French recognition with lang: ${newRecognition.lang}`);
              newRecognition.start();
            } catch (e) {
              console.log(`[Speech] Fresh start failed:`, e);
            }
          }, 300);
        } else {
          const restartDelay = currentLang === "en" ? 100 : 500;
          
          console.log(`[Speech] Restarting recognition in ${restartDelay}ms for ${currentLang}`);
          
          setTimeout(() => {
            if (isRecordingRef.current && recognitionRef.current) {
              try {
                const newSpeechCode = getSpeechCodeByLanguage(selectedLanguageRef.current);
                recognitionRef.current.lang = newSpeechCode;
                console.log(`[Speech] Starting recognition with lang: ${newSpeechCode}`);
                recognitionRef.current.start();
              } catch (e) {
                console.log(`[Speech] Restart failed:`, e);
              }
            }
          }, restartDelay);
        }
      };

      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = handleEnd;
      recognition.onstart = handleStart;
      recognition.onaudiostart = handleAudioStart;
      recognition.onspeechstart = handleSpeechStart;
      recognition.onspeechend = handleSpeechEnd;
      recognition.onsoundstart = handleSoundStart;
      recognition.onsoundend = handleSoundEnd;
      recognition.onnomatch = handleNoMatch;
      
      console.log(`[Speech] Initial start with lang: ${speechCode}`);
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

    const pendingInterim = interimTranscriptRef.current.trim();
    let combinedTranscript = fullTranscriptRef.current.trim();
    
    if (pendingInterim) {
      console.log(`[Speech] Including pending interim text: "${pendingInterim}"`);
      if (combinedTranscript) {
        combinedTranscript += " " + pendingInterim;
      } else {
        combinedTranscript = pendingInterim;
      }
    }
    
    const finalTranscript = combinedTranscript;
    interimTranscriptRef.current = "";
    
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
      console.log(`[Translation] Starting translation from ${currentLang} to English. Text: "${finalTranscript}"`);
      setState(prev => ({ ...prev, isTranslating: true }));
      
      try {
        const result = await translateToEnglish(finalTranscript, currentLang);
        console.log(`[Translation] Result:`, result);
        
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
        console.error("[Translation] Error:", err);
        setState(prev => ({
          ...prev,
          isTranslating: false,
          error: "Translation failed. Your review is shown in the original language.",
        }));
      }
    } else {
      console.log(`[Translation] Skipping translation: transcript="${finalTranscript}", lang="${currentLang}"`);
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
    interimTranscriptRef.current = "";

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
