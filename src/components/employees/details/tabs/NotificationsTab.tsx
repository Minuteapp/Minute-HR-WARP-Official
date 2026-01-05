import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle, AlertCircle, Info, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface NotificationsTabProps {
  employeeId: string;
}

export const NotificationsTab = ({ employeeId }: NotificationsTabProps) => {
  // Lade Benachrichtigungen für diesen Mitarbeiter
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['employee-notifications', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absence_notifications')
        .select('*')
        .eq('user_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Fehler beim Laden der Benachrichtigungen:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!employeeId,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejection':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'reminder':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!notifications || notifications.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Keine Benachrichtigungen vorhanden</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border rounded-lg ${notification.read ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'}`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.notification_type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{notification.notification_type}</span>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">Neu</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.created_at && format(new Date(notification.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
