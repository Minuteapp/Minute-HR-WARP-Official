import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import NotificationRow from './NotificationRow';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  isEnabled: boolean;
}

const defaultNotifications: NotificationSetting[] = [
  {
    id: 'notif-1',
    title: 'Email-Benachrichtigungen',
    description: 'Wöchentlicher Portfolio-Status Report',
    isEnabled: true
  },
  {
    id: 'notif-2',
    title: 'Meilenstein-Erinnerungen',
    description: 'Benachrichtigungen 7 Tage vor Meilenstein-Fälligkeiten',
    isEnabled: true
  },
  {
    id: 'notif-3',
    title: 'Budget-Warnungen',
    description: 'Sofortige Benachrichtigung bei Budget-Überschreitungen',
    isEnabled: true
  }
];

const NotificationsSection = () => {
  const [notifications, setNotifications] = useState<NotificationSetting[]>(defaultNotifications);

  const handleToggle = (id: string, value: boolean) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isEnabled: value } : notif
      )
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Benachrichtigungen
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Konfigurieren Sie Benachrichtigungs-Präferenzen
        </p>
      </CardHeader>
      <CardContent>
        {notifications.map(notif => (
          <NotificationRow
            key={notif.id}
            title={notif.title}
            description={notif.description}
            isEnabled={notif.isEnabled}
            onToggleChange={(value) => handleToggle(notif.id, value)}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationsSection;
