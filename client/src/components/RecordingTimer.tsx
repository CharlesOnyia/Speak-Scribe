import { useEffect, useState } from "react";

interface RecordingTimerProps {
  isRecording: boolean;
  onTimeUpdate?: (seconds: number) => void;
}

export function RecordingTimer({ isRecording, onTimeUpdate }: RecordingTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      setSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const newValue = prev + 1;
        onTimeUpdate?.(newValue);
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      className="text-lg font-medium tabular-nums text-foreground"
      aria-live="polite"
      aria-atomic="true"
      data-testid="text-recording-timer"
    >
      {formatTime(seconds)}
    </div>
  );
}
