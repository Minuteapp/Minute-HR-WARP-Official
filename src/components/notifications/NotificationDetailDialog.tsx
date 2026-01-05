import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Tag, Loader2, CheckCircle, XCircle, Archive, Forward, MessageSquare, ExternalLink } from "lucide-react";
import { NotificationItemData } from './NotificationListItem';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NotificationDetailDialogProps {
  notification: NotificationItemData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

const NotificationDetailDialog = ({
  notification,
  open,
  onOpenChange,
  onMarkAsRead,
  onArchive,
  onAccept,
  onReject,
}: NotificationDetailDialogProps) => {
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  if (!notification) return null;

  const getPriorityBadge = () => {
    switch (notification.priority) {
      case 'kritisch':
        return <Badge className="bg-red-100 text-red-700">Kritisch</Badge>;
      case 'wichtig':
        return <Badge className="bg-orange-100 text-orange-700">Wichtig</Badge>;
      case 'hinweis':
        return <Badge className="bg-yellow-100 text-yellow-700">Hinweis</Badge>;
      case 'info':
      default:
        return <Badge className="bg-blue-100 text-blue-700">Info</Badge>;
    }
  };

  const handleRequestAIRecommendation = async () => {
    setIsLoadingAI(true);
    setAiRecommendation(null);

    try {
      const { data, error } = await supabase.functions.invoke('notification-ai-recommendation', {
        body: {
          notification: {
            title: notification.title,
            description: notification.description,
            category: notification.categoryLabel,
            priority: notification.priority,
            type: notification.type,
          }
        }
      });

      if (error) throw error;
      
      setAiRecommendation(data?.recommendation || 'Keine Empfehlung verfügbar.');
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      toast({
        title: 'Fehler',
        description: 'KI-Empfehlung konnte nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${notification.iconBgColor} flex items-center justify-center`}>
              {notification.icon}
            </div>
            <div className="flex-1">
              <span className="text-lg">{notification.title}</span>
              <div className="flex items-center gap-2 mt-1">
                {getPriorityBadge()}
                <span className="text-sm text-muted-foreground font-normal">{notification.categoryLabel}</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{notification.timestamp}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>Typ: {notification.type === 'request' ? 'Anfrage' : notification.type === 'task' ? 'Aufgabe' : notification.type === 'event' ? 'Termin' : notification.type === 'info' ? 'Information' : 'System'}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm">{notification.description}</p>
          </div>

          {/* AI Recommendation Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-medium">KI-Empfehlung</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestAIRecommendation}
                disabled={isLoadingAI}
                className="text-primary border-primary hover:bg-primary/10"
              >
                {isLoadingAI ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Lädt...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Empfehlung anfordern
                  </>
                )}
              </Button>
            </div>
            
            {aiRecommendation && (
              <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
                <p className="text-sm">{aiRecommendation}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {notification.type === 'request' && (
              <>
                <Button size="sm" onClick={() => { onAccept?.(notification.id); onOpenChange(false); }}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Akzeptieren
                </Button>
                <Button size="sm" variant="outline" onClick={() => { onReject?.(notification.id); onOpenChange(false); }}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Ablehnen
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={() => { onMarkAsRead(notification.id); onOpenChange(false); }}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Als gelesen
            </Button>
            <Button size="sm" variant="outline" onClick={() => { onArchive(notification.id); onOpenChange(false); }}>
              <Archive className="h-4 w-4 mr-1" />
              Archivieren
            </Button>
            <Button size="sm" variant="outline">
              <Forward className="h-4 w-4 mr-1" />
              Weiterleiten
            </Button>
            <Button size="sm" variant="outline">
              <MessageSquare className="h-4 w-4 mr-1" />
              Kommentar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetailDialog;
