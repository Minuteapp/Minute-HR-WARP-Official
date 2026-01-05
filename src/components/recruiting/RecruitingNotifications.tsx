
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, UserPlus, CalendarClock } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const RecruitingNotifications = () => {
  const { notifications, markAsRead } = useNotifications();
  const [recruitingNotifications, setRecruitingNotifications] = useState<any[]>([]);
  
  useEffect(() => {
    // Filter für Recruiting-bezogene Benachrichtigungen
    const filtered = notifications.filter(
      notification => notification.category === 'recruiting'
    );
    setRecruitingNotifications(filtered);
  }, [notifications]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Recruiting-Benachrichtigungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recruitingNotifications.length > 0 ? (
          <div className="space-y-4">
            {recruitingNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 rounded border ${notification.read ? 'bg-transparent' : 'bg-muted/20'}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded">
                    {notification.type === 'interview' ? (
                      <CalendarClock className="h-4 w-4 text-primary" />
                    ) : (
                      <UserPlus className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{notification.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {new Date(notification.timestamp).toLocaleString('de-DE', { 
                          day: '2-digit', 
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Keine Benachrichtigungen vorhanden</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecruitingNotifications;
