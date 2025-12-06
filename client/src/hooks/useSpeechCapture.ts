import { useState, useCallback, useRef, useEffect } from "react";

interface TranscriptionResponse {
  success: boolean;
  originalText: string;
  translatedText: string | null;
  detectedLanguage: string;
  detectedLanguageCode: string;
  needsTranslation: boolean;
  error?: string;
}

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const isSupported = !!navigator.mediaDevices?.getUserMedia;
    setState(prev => ({ ...prev, isSupported }));

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const transcribeWithBackend = useCallback(async (audioBlob: Blob) => {
    setState(prev => ({ ...prev, isTranscribing: true }));

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const result: TranscriptionResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Transcription failed");
      }

      const displayText = result.translatedText || result.originalText;
      const needsTranslation = result.needsTranslation && result.translatedText;

      setState(prev => ({
        ...prev,
        isTranscribing: false,
        transcript: displayText,
        originalTranscript: needsTranslation ? result.originalText : "",
        detectedLanguage: needsTranslation ? "English" : result.detectedLanguage,
        translatedFrom: needsTranslation ? result.detectedLanguage : null,
        error: null,
      }));
    } catch (err) {
      console.error("Backend transcription error:", err);
      setState(prev => ({
        ...prev,
        isTranscribing: false,
        error: err instanceof Error ? err.message : "Failed to transcribe audio",
      }));
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioChunksRef.current = [];
      
      // Try to use webm format, fallback to other formats
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

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || "audio/webm" 
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setState(prev => ({ ...prev, audioUrl, isRecording: false }));
        
        // Send to backend for transcription
        await transcribeWithBackend(audioBlob);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      
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
      }));

    } catch (err) {
      console.error("Failed to start recording:", err);
      setState(prev => ({
        ...prev,
        error: "Could not access microphone. Please check your permissions.",
        isRecording: false,
      }));
    }
  }, [transcribeWithBackend]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetCapture = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

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
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    resetCapture,
    setTranscript,
  };
}
