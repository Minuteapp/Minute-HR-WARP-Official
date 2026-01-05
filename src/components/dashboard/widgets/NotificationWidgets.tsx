import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, MessageSquare, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Notification {
  id: string;
  title?: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
  source_table?: string;
}

export const RecentNotificationsWidget: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        // Verschiedene Notification-Quellen zusammenführen
        const notificationPromises = [
          // Abwesenheits-Benachrichtigungen
          supabase
            .from('absence_notifications')
            .select('id, message, notification_type as type, created_at, read')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          
          // Aufgaben-Benachrichtigungen (falls vorhanden)
          supabase
            .from('task_notifications')
            .select('id, message, notification_type as type, created_at, read')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)
        ];

        const results = await Promise.allSettled(notificationPromises);
        
        const allNotifications: Notification[] = [];
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.data) {
            const sourceTable = index === 0 ? 'absence_notifications' : 'task_notifications';
            result.value.data.forEach((notification: any) => {
              allNotifications.push({
                id: notification.id,
                message: notification.message,
                type: notification.type,
                created_at: notification.created_at,
                read: notification.read || false,
                source_table: sourceTable
              });
            });
          }
        });

        // Nach Datum sortieren und limitieren
        allNotifications.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setNotifications(allNotifications.slice(0, 8));
      } catch (error) {
        console.error('Fehler beim Laden der Benachrichtigungen:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'approval':
      case 'task_completed':
        return <Info className="h-3 w-3 text-blue-500" />;
      case 'rejection':
      case 'task_overdue':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'reminder':
      case 'task_assigned':
        return <MessageSquare className="h-3 w-3 text-yellow-500" />;
      default:
        return <Bell className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'approval': return 'Genehmigung';
      case 'rejection': return 'Ablehnung';
      case 'reminder': return 'Erinnerung';
      case 'task_completed': return 'Aufgabe erledigt';
      case 'task_assigned': return 'Neue Aufgabe';
      case 'task_overdue': return 'Überfällig';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Benachrichtigungen
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {notifications.length === 0 ? (
          <p className="text-muted-foreground text-sm">Keine Benachrichtigungen</p>
        ) : (
          notifications.map((notification) => (
            <div 
              key={`${notification.source_table}-${notification.id}`} 
              className={`p-2 border rounded-md space-y-1 ${
                !notification.read ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  {getTypeIcon(notification.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getTypeText(notification.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.created_at), 'dd.MM HH:mm', { locale: de })}
                      </span>
                    </div>
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};