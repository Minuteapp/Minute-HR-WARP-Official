import { Bell, MessageSquare, AtSign, Heart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'mention':
      return <AtSign className="h-4 w-4 text-primary" />;
    case 'reaction':
      return <Heart className="h-4 w-4 text-destructive" />;
    case 'system':
      return <Info className="h-4 w-4 text-muted-foreground" />;
    default:
      return <MessageSquare className="h-4 w-4 text-primary" />;
  }
};

export const NotificationPanel = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useChatNotifications();

  if (loading) {
    return (
      <div className="w-80 p-4">
        <p className="text-sm text-muted-foreground">Lädt...</p>
      </div>
    );
  }

  return (
    <div className="w-80">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <h3 className="font-semibold">Benachrichtigungen</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-7 text-xs"
          >
            Alle lesen
          </Button>
        )}
      </div>

      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Keine Benachrichtigungen
            </p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors mb-1 ${
                  notification.read
                    ? 'hover:bg-accent/50'
                    : 'bg-primary/5 hover:bg-primary/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {notification.channel?.name || 'Kanal'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: de,
                        })}
                      </span>
                    </div>
                    {notification.message?.content && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message.content}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {notification.type === 'mention' && 'Erwähnung'}
                        {notification.type === 'reaction' && 'Reaktion'}
                        {notification.type === 'message' && 'Nachricht'}
                        {notification.type === 'system' && 'System'}
                      </Badge>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
