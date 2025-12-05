interface WaveformAnimationProps {
  isActive: boolean;
}

export function WaveformAnimation({ isActive }: WaveformAnimationProps) {
  const bars = 12;
  
  return (
    <div className="flex items-center justify-center gap-1 h-20 w-full" aria-hidden="true">
      {Array.from({ length: bars }).map((_, index) => (
        <div
          key={index}
          className={`w-1.5 rounded-full bg-primary transition-all duration-150 ${
            isActive ? "animate-waveform" : "h-2"
          }`}
          style={{
            animationDelay: isActive ? `${index * 0.08}s` : undefined,
            height: isActive ? undefined : "8px",
          }}
        />
      ))}
    </div>
  );
}
