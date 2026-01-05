import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VoiceMessagePlayer } from "@/components/chat/VoiceMessagePlayer";

interface VoiceMessageProps {
  sender: string;
  initials: string;
  timestamp: string;
  duration: number;
  fileUrl?: string;
}

export default function VoiceMessage({
  sender,
  initials,
  timestamp,
  duration,
  fileUrl = '',
}: VoiceMessageProps) {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {/* Sender + Zeit */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">{sender}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>

          {/* Voice Player */}
          {fileUrl ? (
            <div className="bg-primary/5 rounded-lg p-2.5">
              <VoiceMessagePlayer fileUrl={fileUrl} duration={duration} />
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2.5">
              <span className="text-xs text-muted-foreground">Sprachnachricht wird geladen...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
