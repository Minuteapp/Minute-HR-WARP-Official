import { Clock, Calendar, Archive, Trash2, CheckCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NotificationContextMenuProps {
  notification: any;
  onMarkAsRead: () => void;
  onSetReminder: (duration: number) => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function NotificationContextMenu({
  notification,
  onMarkAsRead,
  onSetReminder,
  onArchive,
  onDelete,
}: NotificationContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {!notification.read && (
          <>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarkAsRead(); }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Als gelesen markieren
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetReminder(3600000); }}>
          <Clock className="h-4 w-4 mr-2" />
          1 Stunde erinnern
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetReminder(86400000); }}>
          <Calendar className="h-4 w-4 mr-2" />
          Morgen erinnern
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
          <Archive className="h-4 w-4 mr-2" />
          Archivieren
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Löschen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
