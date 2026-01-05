
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MoreHorizontal, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NotificationsCardProps {
  darkMode: boolean;
  onToggleVisibility: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  link?: string;
  metadata?: Record<string, any>;
}

const NotificationsCard = ({ darkMode, onToggleVisibility }: NotificationsCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      return data || [];
    }
  });

  const dismissNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      // Aktualisiere die Abfrage
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    } catch (error) {
      console.error('Fehler beim Schließen der Benachrichtigung:', error);
    }
  };

  const dismissAllNotifications = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);
      
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    } catch (error) {
      console.error('Fehler beim Schließen aller Benachrichtigungen:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 shadow-sm">
        <div className="flex items-center justify-center py-4">
          <div className="text-gray-500">Lädt Benachrichtigungen...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="today-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Bell className="h-5 w-5 text-primary" />
          Nachrichten
          {notifications.length > 0 && (
            <span className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {notifications.length > 0 && (
              <DropdownMenuItem onClick={dismissAllNotifications}>
                Alle als gelesen markieren
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onToggleVisibility}>
              Card ausblenden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[220px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Keine neuen Nachrichten
            </div>
          ) : (
            notifications.map((notification) => {
              const initials = notification.title.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
              const timeAgo = formatDistanceToNow(new Date(notification.created_at), { 
                addSuffix: false, 
                locale: de 
              });
              
              return (
                <div 
                  key={notification.id} 
                  className="bg-blue-50 rounded-lg p-3 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate('/notifications')}
        >
          Alle Nachrichten öffnen
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationsCard;
