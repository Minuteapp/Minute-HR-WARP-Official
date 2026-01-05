import { useState } from "react";
import { 
  ChevronRight, 
  X, 
  Check, 
  Archive, 
  Forward, 
  MessageSquare,
  Clock,
  ExternalLink,
  Eye,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface NotificationItemData {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  priority: 'info' | 'hinweis' | 'wichtig' | 'kritisch';
  timestamp: string;
  isUnread: boolean;
  icon: React.ReactNode;
  iconBgColor: string;
  type: 'request' | 'task' | 'info' | 'event' | 'system';
  createdAt?: Date;
}

interface NotificationListItemProps {
  notification: NotificationItemData;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onOpen?: (id: string) => void;
  onExtendDeadline?: (id: string) => void;
  onViewDetails?: (notification: NotificationItemData) => void;
}

const NotificationListItem = ({
  notification,
  onMarkAsRead,
  onArchive,
  onAccept,
  onReject,
  onOpen,
  onExtendDeadline,
  onViewDetails,
}: NotificationListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if notification is less than 1 hour old
  const isNew = notification.createdAt 
    ? (new Date().getTime() - new Date(notification.createdAt).getTime()) < 3600000 
    : notification.timestamp.includes('Min');

  const isUrgent = notification.priority === 'kritisch';

  const getPriorityBadge = () => {
    switch (notification.priority) {
      case 'kritisch':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Kritisch</Badge>;
      case 'wichtig':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Wichtig</Badge>;
      case 'hinweis':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Hinweis</Badge>;
      case 'info':
      default:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Info</Badge>;
    }
  };

  const renderActions = () => {
    const detailsButton = (
      <Button 
        size="sm" 
        variant="outline" 
        className="text-primary border-primary hover:bg-primary/10"
        onClick={(e) => { 
          e.stopPropagation(); 
          onViewDetails?.(notification); 
        }}
      >
        <Eye className="h-4 w-4 mr-1" />
        Details ansehen
      </Button>
    );

    if (notification.type === 'request') {
      return (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
          {detailsButton}
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onAccept?.(notification.id); }}>
            <Check className="h-4 w-4 mr-1" />
            Akzeptieren
          </Button>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onReject?.(notification.id); }}>
            <X className="h-4 w-4 mr-1" />
            Ablehnen
          </Button>
          <Button size="sm" variant="outline" className="text-primary border-primary/30" onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}>
            <Check className="h-4 w-4 mr-1" />
            Als gelesen markieren
          </Button>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onArchive(notification.id); }}>
            <Archive className="h-4 w-4 mr-1" />
            Archivieren
          </Button>
          <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
            <Forward className="h-4 w-4 mr-1" />
            Weiterleiten
          </Button>
          <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
            <MessageSquare className="h-4 w-4 mr-1" />
            Kommentar
          </Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (notification.type === 'task' && notification.priority === 'kritisch') {
      return (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
          {detailsButton}
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onOpen?.(notification.id); }}>
            <ExternalLink className="h-4 w-4 mr-1" />
            Öffnen
          </Button>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onExtendDeadline?.(notification.id); }}>
            <Clock className="h-4 w-4 mr-1" />
            Frist verlängern
          </Button>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onArchive(notification.id); }}>
            <Archive className="h-4 w-4 mr-1" />
            Archivieren
          </Button>
          <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
            <Forward className="h-4 w-4 mr-1" />
            Weiterleiten
          </Button>
          <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
            <MessageSquare className="h-4 w-4 mr-1" />
            Kommentar
          </Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    // Default actions for other types
    return (
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
        {detailsButton}
        <Button size="sm" variant="outline" className="text-primary border-primary/30" onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}>
          <Check className="h-4 w-4 mr-1" />
          Als gelesen markieren
        </Button>
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onArchive(notification.id); }}>
          <Archive className="h-4 w-4 mr-1" />
          Archivieren
        </Button>
        <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
          <Forward className="h-4 w-4 mr-1" />
          Weiterleiten
        </Button>
        <Button size="sm" variant="ghost" className="ml-auto" onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div 
      className={`p-4 bg-white border rounded-lg hover:shadow-sm transition-all cursor-pointer relative ${
        notification.isUnread ? 'border-l-4 border-l-primary' : ''
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Badges oben rechts */}
      <div className="absolute top-2 right-2 flex gap-1">
        {isUrgent && (
          <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Dringend
          </Badge>
        )}
        {isNew && (
          <Badge className="bg-primary text-white text-xs px-1.5 py-0.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Neu
          </Badge>
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${notification.iconBgColor} flex items-center justify-center`}>
          {notification.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 pr-16">
              {/* Title with unread indicator */}
              <div className="flex items-center gap-2 mb-1">
                {notification.isUnread && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}
                <h4 className="font-semibold text-gray-900">{notification.title}</h4>
              </div>

              {/* Priority and Category */}
              <div className="flex items-center gap-2 mb-2">
                {getPriorityBadge()}
                <span className="text-sm text-gray-500">{notification.categoryLabel}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">{notification.timestamp}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600">{notification.description}</p>
            </div>

            {/* Chevron */}
            <ChevronRight className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`} />
          </div>

          {/* Expanded Actions */}
          {isExpanded && renderActions()}
        </div>
      </div>
    </div>
  );
};

export default NotificationListItem;
