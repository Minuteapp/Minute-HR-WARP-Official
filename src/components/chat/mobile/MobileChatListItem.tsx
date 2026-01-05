import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Clock, Hash, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatListItemProps {
  id: string;
  name: string;
  type: "team" | "hr" | "shift" | "dm" | "channel" | "private";
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  avatarInitials?: string;
  onClick: () => void;
}

export default function MobileChatListItem({
  name,
  type,
  lastMessage,
  timestamp,
  unreadCount,
  isOnline,
  avatarInitials,
  onClick,
}: ChatListItemProps) {
  const getIcon = () => {
    const iconClass = "w-5 h-5 text-primary";
    switch (type) {
      case "team":
        return <Users className={iconClass} />;
      case "hr":
        return <Shield className={iconClass} />;
      case "shift":
        return <Clock className={iconClass} />;
      case "channel":
        return <Hash className={iconClass} />;
      case "private":
        return <Lock className={iconClass} />;
      case "dm":
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-3 flex gap-3 hover:bg-muted/50 transition-colors"
    >
      <div className="relative">
        {type === "dm" ? (
          <>
            <Avatar className="w-12 h-12 bg-primary/10">
              <AvatarFallback className="text-primary font-medium">
                {avatarInitials || "??"}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </>
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold truncate">{name}</h3>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">
            {timestamp}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
      </div>
      {unreadCount && unreadCount > 0 && (
        <Badge className="bg-primary text-primary-foreground h-6 min-w-6 px-2 rounded-full shrink-0">
          {unreadCount}
        </Badge>
      )}
    </button>
  );
}
