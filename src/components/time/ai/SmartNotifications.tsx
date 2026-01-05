
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Brain, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiTimeTrackingService } from "@/services/aiTimeTrackingService";

interface SmartNotification {
  id: string;
  type: 'break_reminder' | 'project_suggestion' | 'time_optimization';
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  autoHide?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

interface SmartNotificationsProps {
  workingHours?: number;
  currentLocation?: string;
  currentProject?: string;
}

const SmartNotifications = ({ 
  workingHours = 0, 
  currentLocation,
  currentProject 
}: SmartNotificationsProps) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const { toast } = useToast();

  // Überwache Arbeitszeit für Break-Erinnerungen
  useEffect(() => {
    if (workingHours >= 4 && workingHours < 4.1) {
      const notification: SmartNotification = {
        id: 'break-4h',
        type: 'break_reminder',
        title: 'Pause erforderlich',
        message: 'Nach 4 Stunden Arbeitszeit ist eine Pause gesetzlich vorgeschrieben.',
        urgency: 'high',
        action: {
          label: 'Pause starten',
          callback: () => {
            toast({
              title: "Pause gestartet",
              description: "Die KI überwacht Ihre Pausenzeit."
            });
            removeNotification('break-4h');
          }
        }
      };
      
      addNotification(notification);
    }

    if (workingHours >= 6 && workingHours < 6.1) {
      const notification: SmartNotification = {
        id: 'break-6h',
        type: 'break_reminder',
        title: 'Weitere Pause empfohlen',
        message: 'Nach 6 Stunden Arbeitszeit ist eine weitere Pause sinnvoll.',
        urgency: 'medium',
        autoHide: true
      };
      
      addNotification(notification);
    }
  }, [workingHours, toast]);

  // Standort-basierte Optimierungsvorschläge
  useEffect(() => {
    if (currentLocation === 'home' && !currentProject?.includes('dev')) {
      const notification: SmartNotification = {
        id: 'home-optimization',
        type: 'time_optimization',
        title: 'Produktivitäts-Tipp',
        message: 'Im Home Office sind Sie besonders produktiv bei Entwicklungsaufgaben.',
        urgency: 'low',
        autoHide: true,
        action: {
          label: 'Projekt wechseln',
          callback: () => {
            toast({
              title: "Projekt-Vorschlag",
              description: "Entwicklungsprojekte werden vorgeschlagen."
            });
            removeNotification('home-optimization');
          }
        }
      };
      
      // Verzögert hinzufügen um Spam zu vermeiden
      setTimeout(() => addNotification(notification), 5000);
    }
  }, [currentLocation, currentProject, toast]);

  const addNotification = (notification: SmartNotification) => {
    setNotifications(prev => {
      // Verhindere Duplikate
      if (prev.some(n => n.id === notification.id)) return prev;
      
      const newNotifications = [...prev, notification];
      
      // Auto-Hide nach 10 Sekunden wenn aktiviert
      if (notification.autoHide) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, 10000);
      }
      
      return newNotifications;
    });

    // Zeige auch Toast für hohe Priorität
    if (notification.urgency === 'high') {
      toast({
        title: notification.title,
        description: notification.message,
      });
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'break_reminder':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'time_optimization':
        return <Brain className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      {notifications.map((notification) => (
        <Card 
          key={notification.id}
          className={`border-l-4 ${getUrgencyColor(notification.urgency)} shadow-lg animate-in slide-in-from-right`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getTypeIcon(notification.type)}
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">
                    {notification.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {notification.message}
                  </div>
                  
                  {notification.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={notification.action.callback}
                    >
                      {notification.action.label}
                    </Button>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-2"
                onClick={() => removeNotification(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SmartNotifications;
