import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText } from "lucide-react";

interface TextMessageProps {
  sender: string;
  initials: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  attachment?: {
    name: string;
    size: string;
    url?: string;
  };
}

export default function TextMessage({
  sender,
  initials,
  message,
  timestamp,
  isOwn,
  attachment,
}: TextMessageProps) {
  if (isOwn) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] flex items-start gap-2">
          <div className="flex-1" />
          <div className="space-y-1">
            {/* Sender-Name und Zeit */}
            <div className="flex items-center justify-end gap-2 px-1">
              <span className="text-xs font-medium text-primary">{sender}</span>
            </div>

            {/* Nachricht-Bubble */}
            <div className="bg-primary/10 rounded-2xl rounded-tr-sm px-4 py-3">
              <p className="text-sm">{message}</p>
            </div>

            {/* Datei-Anhang (optional) */}
            {attachment && (
              <div 
                className="bg-white border rounded-lg p-3 flex items-center gap-3 mt-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => attachment.url && window.open(attachment.url, '_blank')}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">{attachment.size}</p>
                </div>
              </div>
            )}

            {/* Zeitstempel */}
            <div className="text-xs text-muted-foreground text-right px-1">
              {timestamp}
            </div>
          </div>

          {/* Avatar-Initialen */}
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mb-4">
      <div className="max-w-[80%] flex items-start gap-2">
        {/* Avatar */}
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-muted text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {/* Sender-Name und Zeit */}
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-medium text-primary">{sender}</span>
          </div>

          {/* Nachricht-Bubble */}
          <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-sm">{message}</p>
          </div>

          {/* Zeitstempel */}
          <div className="text-xs text-muted-foreground px-1 mt-1">
            {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}
