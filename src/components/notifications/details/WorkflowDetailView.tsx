import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkflowDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: any;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
}

export function WorkflowDetailView({
  open,
  onOpenChange,
  notification,
  onApprove,
  onReject,
  onViewDetails
}: WorkflowDetailViewProps) {
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

  const getModuleName = (moduleId: string) => {
    const moduleNames: Record<string, string> = {
      'absence': 'Abwesenheitsmanagement',
      'expense': 'Spesenabrechnung',
      'task': 'Aufgabenverwaltung',
      'hr': 'HR-Management'
    };
    return moduleNames[moduleId] || moduleId;
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
                  {notification.badge?.text || 'Workflow'}
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

            {notification.linkedModule && (
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <span className="text-muted-foreground">Verknüpftes Modul:</span>
                <a href={`/${notification.linkedModule}`} className="text-blue-600 hover:underline">
                  {getModuleName(notification.linkedModule)}
                </a>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onViewDetails}>
            Details
          </Button>
          <Button variant="destructive" onClick={onReject}>
            Ablehnen
          </Button>
          <Button onClick={onApprove}>
            Genehmigen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
