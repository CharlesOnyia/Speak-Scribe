import { useState, useCallback, useRef, useEffect } from "react";

interface SpeechCaptureState {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string;
  interimTranscript: string;
  detectedLanguage: string;
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
    interimTranscript: "",
    detectedLanguage: "en",
    error: null,
    isSupported: false,
    audioUrl: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
    };
  }, []);

  const startRecording = useCallback(async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setState(prev => ({ 
        ...prev, 
        error: "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari." 
      }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setState(prev => ({ ...prev, audioUrl }));
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = ""; 

      let finalTranscript = "";

      recognition.onresult = (event) => {
        let interim = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + " ";
          } else {
            interim += result[0].transcript;
          }
        }

        setState(prev => ({
          ...prev,
          transcript: finalTranscript.trim(),
          interimTranscript: interim,
        }));
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        
        if (event.error === "not-allowed") {
          setState(prev => ({ 
            ...prev, 
            error: "Microphone access denied. Please allow microphone access and try again.",
            isRecording: false,
            isTranscribing: false,
          }));
        } else if (event.error !== "aborted") {
          setState(prev => ({ 
            ...prev, 
            error: `Speech recognition error: ${event.error}`,
          }));
        }
      };

      recognition.onend = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        
        setState(prev => ({
          ...prev,
          isRecording: false,
          isTranscribing: false,
          transcript: finalTranscript.trim() || prev.transcript,
          interimTranscript: "",
        }));
      };

      recognition.start();
      
      setState(prev => ({
        ...prev,
        isRecording: true,
        isTranscribing: false,
        transcript: "",
        interimTranscript: "",
        error: null,
        audioUrl: null,
      }));

    } catch (err) {
      console.error("Failed to start recording:", err);
      setState(prev => ({
        ...prev,
        error: "Could not access microphone. Please check your permissions.",
        isRecording: false,
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setState(prev => ({
      ...prev,
      isTranscribing: true,
    }));
  }, []);

  const resetCapture = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState({
      isRecording: false,
      isTranscribing: false,
      transcript: "",
      interimTranscript: "",
      detectedLanguage: "en",
      error: null,
      isSupported: state.isSupported,
      audioUrl: null,
    });
  }, [state.audioUrl, state.isSupported]);

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

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
