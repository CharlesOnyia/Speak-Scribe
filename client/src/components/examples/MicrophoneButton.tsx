import { useState } from "react";
import { MicrophoneButton } from "../MicrophoneButton";

export default function MicrophoneButtonExample() {
  const [isRecording, setIsRecording] = useState(false);
  
  return (
    <div className="p-8 bg-card rounded-lg flex justify-center">
      <MicrophoneButton 
        isRecording={isRecording} 
        onToggle={() => setIsRecording(!isRecording)} 
      />
    </div>
  );
}
