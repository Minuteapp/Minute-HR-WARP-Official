import { Bell, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUnifiedNotifications } from "@/hooks/useUnifiedNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const priorityColors = {
  low: "bg-gray-100 text-gray-700 border-gray-300",
  medium: "bg-blue-100 text-blue-700 border-blue-300",
  high: "bg-orange-100 text-orange-700 border-orange-300",
  critical: "bg-red-100 text-red-700 border-red-300",
};

const moduleIcons = {
  tasks: "📋",
  absence: "📅",
  calendar: "🗓️",
  hr_cases: "💼",
  documents: "📄",
  default: "🔔",
};

export const UnifiedNotificationsList = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useUnifiedNotifications();

  const handleNotificationClick = async (notification: any) => {
    // Markiere als gelesen
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigiere zur Action URL
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Lädt Benachrichtigungen...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Benachrichtigungen
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Alle als gelesen markieren
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Keine Benachrichtigungen</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {notifications.map((notification) => {
                const moduleIcon = moduleIcons[notification.source_module as keyof typeof moduleIcons] || moduleIcons.default;
                const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: de,
                });

                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      notification.read
                        ? "bg-background border-border"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{moduleIcon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm">
                              {notification.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={priorityColors[notification.priority]}
                            >
                              {notification.priority}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {notification.source_module}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            {notification.action_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCheck className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{timeAgo}</span>
                          {notification.read && notification.read_at && (
                            <span>
                              Gelesen:{" "}
                              {formatDistanceToNow(new Date(notification.read_at), {
                                addSuffix: true,
                                locale: de,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
