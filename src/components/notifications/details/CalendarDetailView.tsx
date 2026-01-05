import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, X } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CalendarDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: any;
}

export function CalendarDetailView({ open, onOpenChange, notification }: CalendarDetailViewProps) {
  const formatTimestamp = (timestamp: Date) => {
    return format(timestamp, "dd.MM.yyyy, HH:mm:ss", { locale: de });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${notification.iconBg || 'bg-blue-50'} flex items-center justify-center flex-shrink-0`}>
            <Bell className={`h-6 w-6 ${notification.iconColor || 'text-blue-500'}`} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl font-semibold mb-2">{notification.title}</DialogTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={notification.badge?.class || 'bg-blue-100 text-blue-700'}>
                {notification.badge?.text || 'Kalender'}
              </Badge>
              <Badge variant="outline">calendar</Badge>
              <span className="text-sm text-muted-foreground">
                {formatTimestamp(notification.timestamp)}
              </span>
            </div>
          </div>
          
          {/* Close Button */}
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Schließen</span>
          </DialogClose>
        </div>
        
        {/* Details Section */}
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Details</h3>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
