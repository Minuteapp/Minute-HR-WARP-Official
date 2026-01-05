import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, MoreVertical, Phone, Video, Search, Info, Users } from "lucide-react";

interface MobileConversationHeaderProps {
  channelName: string;
  channelType: "team" | "hr" | "shift" | "dm" | "channel" | "private" | "project";
  memberCount: number;
  isOnline?: boolean;
  onBack: () => void;
  onOpenDetails: () => void;
}

export default function MobileConversationHeader({
  channelName,
  channelType,
  memberCount,
  isOnline,
  onBack,
  onOpenDetails,
}: MobileConversationHeaderProps) {
  const getIcon = () => {
    switch (channelType) {
      case "team":
        return <Users className="w-5 h-5 text-primary" />;
      case "project":
        return <Users className="w-5 h-5 text-primary" />;
      default:
        return <Users className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <>
      {/* Vorschau Badge */}
      <div className="absolute top-2 left-2 z-50 bg-gray-800/80 text-white rounded-md px-2 py-1 text-xs">
        Vorschau
      </div>

      <div className="border-b bg-background p-4 flex items-center gap-3">
        {/* Zurück-Button */}
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Channel-Icon/Avatar */}
        <div className="relative">
          {channelType === "dm" ? (
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {channelName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {getIcon()}
            </div>
          )}
          {isOnline && channelType === "dm" && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Channel-Info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{channelName}</h2>
          <p className="text-xs text-muted-foreground">
            {memberCount} Mitglieder
          </p>
        </div>

        {/* Drei-Punkte-Menü */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Phone className="w-4 h-4 mr-3" />
              <span>Anrufen</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Video className="w-4 h-4 mr-3" />
              <span>Videoanruf</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Search className="w-4 h-4 mr-3" />
              <span>Suchen</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenDetails}>
              <Info className="w-4 h-4 mr-3" />
              <span>Details</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
