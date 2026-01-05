
import React from 'react';
import { useAbsenceAutoNotifications } from '@/hooks/useAbsenceAutoNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const AbsenceAutoNotificationsList = () => {
  const { notifications, isLoading } = useAbsenceAutoNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <Bell className="h-4 w-4 text-primary" />;
      case 'approval_reminder':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'deadline_reminder':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-success" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-destructive" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-success/10 text-success';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      case 'pending':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'status_change':
        return 'Statusänderung';
      case 'approval_reminder':
        return 'Genehmigungserinnerung';
      case 'deadline_reminder':
        return 'Frist-Erinnerung';
      default:
        return 'Benachrichtigung';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Lade automatische Benachrichtigungen...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Automatische Benachrichtigungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Keine automatischen Benachrichtigungen vorhanden
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className="p-3 rounded border bg-muted/50 border-border"
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.notification_type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{notification.subject}</h4>
                      <Badge variant="secondary" className={getStatusColor(notification.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(notification.status)}
                          <span className="capitalize">{notification.status}</span>
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(notification.notification_type)}
                      </Badge>
                      <span>•</span>
                      <span>
                        {format(new Date(notification.sent_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </span>
                      {notification.metadata?.employee_name && (
                        <>
                          <span>•</span>
                          <span>{notification.metadata.employee_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
