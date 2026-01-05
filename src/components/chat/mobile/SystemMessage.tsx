interface SystemMessageProps {
  message: string;
  timestamp: string;
  emoji?: string;
}

export default function SystemMessage({
  message,
  timestamp,
  emoji = "🗓️",
}: SystemMessageProps) {
  return (
    <div className="flex justify-center mb-4">
      <div className="bg-primary/5 border-l-4 border-primary rounded-lg px-4 py-3 flex items-center gap-3 max-w-[90%]">
        <div className="shrink-0">
          <span className="text-2xl">{emoji}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-primary font-medium">{message}</p>
        </div>
        <div className="text-xs text-muted-foreground ml-auto">{timestamp}</div>
      </div>
    </div>
  );
}
