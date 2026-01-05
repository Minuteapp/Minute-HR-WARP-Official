import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Play, Download } from "lucide-react";

interface VoiceMessageProps {
  sender: string;
  timestamp: string;
  avatar: string;
  duration: string;
}

export default function VoiceMessage({ sender, timestamp, avatar, duration }: VoiceMessageProps) {
  return (
    <div className="px-4 py-2">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {avatar}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">{sender}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>

          <div className="bg-card border rounded-lg p-3 max-w-md">
            <div className="flex items-center gap-3">
              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Play className="w-5 h-5 fill-current" />
              </Button>

              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-8 flex items-center gap-0.5">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 rounded-full"
                      style={{
                        height: `${Math.random() * 100}%`,
                        minHeight: "20%",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  0:00 / {duration}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
