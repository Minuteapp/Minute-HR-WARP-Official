import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, CheckCircle, X } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PersonalDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: any;
}

export function PersonalDetailView({ open, onOpenChange, notification }: PersonalDetailViewProps) {
  const formatTimestamp = (timestamp: Date) => {
    return format(timestamp, "dd.MM.yyyy, HH:mm:ss", { locale: de });
  };

  // Icon basierend auf Type
  const getIcon = () => {
    if (notification.type === 'absence-approved') {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    return <Info className="h-6 w-6 text-blue-500" />;
  };

  const getIconBg = () => {
    if (notification.type === 'absence-approved') {
      return 'bg-green-50';
    }
    return notification.iconBg || 'bg-blue-50';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${getIconBg()} flex items-center justify-center flex-shrink-0`}>
            {getIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl font-semibold mb-2">{notification.title}</DialogTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={notification.badge?.class || 'bg-blue-100 text-blue-700'}>
                {notification.badge?.text || 'Personal'}
              </Badge>
              {notification.type === 'absence-approved' && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700">Abwesenheit</Badge>
              )}
              {notification.type === 'payslip' && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700">Lohn & Gehalt</Badge>
              )}
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
          
          {/* Anzeigen Button */}
          {notification.showViewButton && (
            <div className="pt-4 border-t">
              <Button size="sm">
                Anzeigen
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
