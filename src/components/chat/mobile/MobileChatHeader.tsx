import { Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

interface MobileChatHeaderProps {
  onNewChat: () => void;
  filter: "all" | "unread" | "pinned";
  onFilterChange: (filter: "all" | "unread" | "pinned") => void;
}

export default function MobileChatHeader({
  onNewChat,
  filter,
  onFilterChange,
}: MobileChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <h1 className="text-xl font-bold">Chat</h1>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs px-2 py-1">
          Vorschau
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilterChange("all")}>
              {filter === "all" && <Check className="h-4 w-4 mr-2" />}
              <span className={filter !== "all" ? "ml-6" : ""}>
                Alle anzeigen
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("unread")}>
              {filter === "unread" && <Check className="h-4 w-4 mr-2" />}
              <span className={filter !== "unread" ? "ml-6" : ""}>
                Nur ungelesene
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("pinned")}>
              {filter === "pinned" && <Check className="h-4 w-4 mr-2" />}
              <span className={filter !== "pinned" ? "ml-6" : ""}>
                Nur angeheftete
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="icon"
          className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90"
          onClick={onNewChat}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
