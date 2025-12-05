import { useState } from "react";
import { TranscriptionBox } from "../TranscriptionBox";

export default function TranscriptionBoxExample() {
  const [text, setText] = useState(
    "This is a great product! The quality exceeded my expectations and the delivery was fast. Highly recommend to anyone looking for a reliable solution."
  );
  
  return (
    <div className="p-4 bg-card rounded-lg max-w-xl">
      <TranscriptionBox
        text={text}
        onChange={setText}
        isEditing={true}
        detectedLanguage="English"
        translatedFrom="French"
      />
    </div>
  );
}
