import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle, 
  FileText, 
  Shield, 
  Star, 
  MoreHorizontal,
  Clock
} from "lucide-react";
import { Notification } from "@/contexts/NotificationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/contexts/NotificationContext";

interface NotificationCardProps {
  notification: Notification;
  onClick: () => void;
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const { toggleFavorite, archiveNotification } = useNotifications();
  
  const getIcon = () => {
    switch (notification.category) {
      case 'security':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'task':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'approval':
        return <FileText className="h-5 w-5 text-orange-600" />;
      case 'calendar':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'hr':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'system':
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getIconBgColor = () => {
    switch (notification.category) {
      case 'security':
        return 'bg-red-100';
      case 'task':
        return 'bg-blue-100';
      case 'approval':
        return 'bg-orange-100';
      case 'calendar':
        return 'bg-purple-100';
      case 'hr':
        return 'bg-blue-100';
      case 'system':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getPriorityBadge = () => {
    switch (notification.priority) {
      case 'high':
      case 'error':
        return <Badge className="bg-red-600 hover:bg-red-700">Sicherheit</Badge>;
      case 'urgent':
        return <Badge className="bg-red-600 hover:bg-red-700">Kritisch</Badge>;
      case 'warning':
        return <Badge className="bg-orange-600 hover:bg-orange-700">Warnung</Badge>;
      default:
        return null;
    }
  };

  const getCategoryLabel = () => {
    const labels: Record<string, string> = {
      security: 'Sicherheit',
      task: 'Aufgaben',
      approval: 'Abwesenheitsmanagement',
      hr: 'Abwesenheitsmanagement',
      calendar: 'Performance',
      system: 'System',
      project: 'Projekte',
      document: 'Compliance',
      chat: 'Chat & Nachrichten'
    };
    return labels[notification.category] || notification.category;
  };

  const getTimeAgo = () => {
    const now = new Date();
    const time = new Date(notification.timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diff < 60) return 'vor ' + diff + ' Sek';
    if (diff < 3600) return 'vor ' + Math.floor(diff / 60) + ' Min';
    if (diff < 86400) return 'vor ' + Math.floor(diff / 3600) + ' Std';
    return 'vor ' + Math.floor(diff / 86400) + ' Tagen';
  };

  return (
    <div
      className={cn(
        "today-card p-4 cursor-pointer transition-all hover:shadow-md relative",
        !notification.read && "bg-blue-50/50 border-l-4 border-l-blue-600"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg flex-shrink-0", getIconBgColor())}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-base leading-tight">{notification.title}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{getTimeAgo()}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(notification.id);
                  }}>
                    <Star className="h-4 w-4 mr-2" />
                    Als Favorit markieren
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    archiveNotification(notification.id);
                  }}>
                    Archivieren
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
          
          <div className="flex items-center gap-2">
            {getPriorityBadge()}
            <Badge variant="secondary" className="bg-gray-100">
              {getCategoryLabel()}
            </Badge>
          </div>
        </div>
      </div>
      
      {notification.actionRequired && (
        <div className="mt-3 pt-3 border-t flex gap-2">
          <Button size="sm" className="bg-black hover:bg-black/90 text-white">
            Überprüfen
          </Button>
          <Button size="sm" variant="outline">
            Ignorieren
          </Button>
        </div>
      )}
    </div>
  );
}
