import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComplianceDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: any;
  onReview?: () => void;
}

export function ComplianceDetailView({
  open,
  onOpenChange,
  notification,
  onReview
}: ComplianceDetailViewProps) {
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 space-y-3">
              <DialogTitle className="text-xl font-semibold">
                {notification.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={notification.badge?.class || "bg-orange-100 text-orange-700"}>
                  {notification.badge?.text || 'Compliance'}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  {notification.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatTimestamp(notification.timestamp)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Details</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={onReview}>
            Überprüfen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
