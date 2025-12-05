import { RecordingTimer } from "../RecordingTimer";

export default function RecordingTimerExample() {
  return (
    <div className="p-4 bg-card rounded-lg">
      <RecordingTimer isRecording={true} />
    </div>
  );
}
