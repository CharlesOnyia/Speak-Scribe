import { useState } from "react";
import { ActionButtons } from "../ActionButtons";

export default function ActionButtonsExample() {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="p-4 bg-card rounded-lg max-w-xl">
      <ActionButtons
        isEditing={isEditing}
        onEdit={() => setIsEditing(!isEditing)}
        onSubmit={() => console.log("Submit clicked")}
        onReset={() => console.log("Reset clicked")}
      />
    </div>
  );
}
