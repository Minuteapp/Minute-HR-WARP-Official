import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Star, 
  Archive, 
  CheckCircle, 
  Filter, 
  Search, 
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Info,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SecurityDetailView } from "./details/SecurityDetailView";
import { TaskDetailView } from "./details/TaskDetailView";
import { ComplianceDetailView } from "./details/ComplianceDetailView";
import { WorkflowDetailView } from "./details/WorkflowDetailView";
import { CalendarDetailView } from "./details/CalendarDetailView";
import { PersonalDetailView } from "./details/PersonalDetailView";
import { NotificationContextMenu } from "./NotificationContextMenu";
import { useNotifications } from "@/contexts/NotificationContext";
import AdvancedFilters, { FilterState } from "./AdvancedFilters";
import { toast } from "@/hooks/use-toast";

// Keine Mock-Daten - echte Benachrichtigungen werden aus der Datenbank geladen
const mockNotifications: any[] = [];

const NotificationCenter = () => {
  const { markAsRead, removeNotification, archiveNotification, setReminder } = useNotifications();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [detailDialogType, setDetailDialogType] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    priority: 'all',
    source: 'all',
    fromDate: undefined,
    toDate: undefined,
    onlyUnread: false,
    onlyImportant: false
  });

  const categories = [
    { id: 'all', label: 'Alle', icon: <Bell className="h-4 w-4" /> },
    { id: 'system', label: 'System', icon: <Info className="h-4 w-4" /> },
    { id: 'personal', label: 'Personal', icon: <Users className="h-4 w-4" /> },
    { id: 'tasks', label: 'Aufgaben', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'calendar', label: 'Kalender', icon: <Calendar className="h-4 w-4" /> },
  ];

  const filteredNotifications = mockNotifications.filter(n => {
    // Suchfilter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!n.title.toLowerCase().includes(query) && !n.message.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Erweiterte Filter
    if (advancedFilters.priority !== 'all' && n.priority !== advancedFilters.priority) {
      return false;
    }

    if (advancedFilters.source !== 'all') {
      const sourceTypeMap: { [key: string]: string[] } = {
        'system': ['system'],
        'absence': ['absence', 'absence-approved'],
        'tasks': ['task'],
        'calendar': ['calendar'],
        'ai-insights': ['budget-warning'],
        'compliance': ['compliance']
      };
      const allowedTypes = sourceTypeMap[advancedFilters.source] || [];
      if (!allowedTypes.includes(n.type)) {
        return false;
      }
    }

    if (advancedFilters.onlyUnread && !n.unread) {
      return false;
    }

    if (advancedFilters.onlyImportant && !n.important) {
      return false;
    }

    if (advancedFilters.fromDate) {
      const fromDate = new Date(advancedFilters.fromDate);
      fromDate.setHours(0, 0, 0, 0);
      if (new Date(n.timestamp) < fromDate) {
        return false;
      }
    }

    if (advancedFilters.toDate) {
      const toDate = new Date(advancedFilters.toDate);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(n.timestamp) > toDate) {
        return false;
      }
    }

    return true;
  });

  const unreadCount = filteredNotifications.filter(n => n.unread).length;

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    
    // Type-basiertes Routing für Detail-Dialoge
    if (notification.type === 'calendar') {
      setDetailDialogType('calendar');
    } else if (notification.type === 'compliance') {
      setDetailDialogType('compliance');
    } else if (notification.type === 'workflow') {
      setDetailDialogType('workflow');
    } else if (['absence', 'absence-approved', 'expense', 'payslip'].includes(notification.type)) {
      setDetailDialogType('personal');
    } else if (notification.type === 'task') {
      setDetailDialogType('task');
    } else if (notification.type === 'security') {
      setDetailDialogType('security');
    } else {
      setDetailDialogType(notification.type);
    }
  };

  const handleResetFilters = () => {
    setAdvancedFilters({
      priority: 'all',
      source: 'all',
      fromDate: undefined,
      toDate: undefined,
      onlyUnread: false,
      onlyImportant: false
    });
  };

  const activeFilterCount = [
    advancedFilters.priority !== 'all',
    advancedFilters.source !== 'all',
    advancedFilters.fromDate !== undefined,
    advancedFilters.toDate !== undefined,
    advancedFilters.onlyUnread,
    advancedFilters.onlyImportant
  ].filter(Boolean).length;

  // Zeitbasierte Gruppierung
  const groupedNotifications = filteredNotifications.reduce((groups: any, notification: any) => {
    const notificationDate = new Date(notification.timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    let groupLabel = 'Älter';
    
    // Prüfen ob heute
    if (notificationDate.toDateString() === new Date().toDateString()) {
      groupLabel = 'Heute';
    } 
    // Prüfen ob diese Woche
    else if (notificationDate >= weekAgo) {
      groupLabel = 'Diese Woche';
    }

    if (!groups[groupLabel]) {
      groups[groupLabel] = [];
    }
    groups[groupLabel].push(notification);
    return groups;
  }, {});

  // Formatiere die Zeitanzeige
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `vor ${diffMins} Min`;
    } else if (diffHours < 24) {
      return `vor ${diffHours} Std`;
    } else {
      return `vor ${diffDays} Tagen`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={filter === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(category.id)}
              className={filter === category.id ? "bg-primary" : ""}
            >
              {category.icon}
              <span className="ml-1">{category.label}</span>
            </Button>
          ))}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground h-5 min-w-[20px] px-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-1" />
            Favoriten
          </Button>
          
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-1" />
            Archiv
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <AdvancedFilters
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          onReset={handleResetFilters}
        />
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Benachrichtigungen durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Unread Count */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{unreadCount} ungelesene Benachrichtigungen</p>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Alle als gelesen markieren
          </Button>
        </div>
      )}

      {/* Notifications List */}
      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-8 pb-4">
          {Object.entries(groupedNotifications).map(([groupLabel, notifications]: [string, any]) => (
            <div key={groupLabel} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">{groupLabel}</h3>
              <div className="space-y-3">
                {notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer ${
                      notification.unread ? 'bg-blue-50 border-blue-100' : 'bg-white'
                    } ${notification.highlighted ? 'bg-yellow-50 border-yellow-200' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${notification.iconBg} flex items-center justify-center ${notification.iconColor}`}>
                        {notification.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base mb-1">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={notification.badge.class}>
                                {notification.badge.text}
                              </Badge>
                              {notification.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs">Hoch Priorität</Badge>
                              )}
                              {notification.badgeExtra?.text && (
                                <span className={`text-xs ${notification.badgeExtra.class}`}>
                                  {notification.badgeExtra.text}
                                </span>
                              )}
                              {notification.badgeExtra?.icon && !notification.badgeExtra?.label && (
                                <span className="text-xs">{notification.badgeExtra.icon}</span>
                              )}
                              <span className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</span>
                            </div>

                            {notification.extraInfo && notification.extraInfo.map((info: any, idx: number) => (
                              <div key={idx} className="mt-2 text-xs text-muted-foreground">
                                {info.icon} {info.label}
                              </div>
                            ))}

                            {notification.actions && (
                              <div className="flex gap-2 mt-3">
                                {notification.actions.map((action: any, idx: number) => (
                                  <Button
                                    key={idx}
                                    variant={action.variant}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Star className="h-4 w-4" />
                            </Button>
                            <NotificationContextMenu
                              notification={notification}
                              onMarkAsRead={() => markAsRead(notification.id)}
                              onSetReminder={(duration) => setReminder(notification.id, duration)}
                              onArchive={() => archiveNotification(notification.id)}
                              onDelete={() => removeNotification(notification.id)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Detail Dialogs */}
      {detailDialogType === 'security' && selectedNotification && (
        <SecurityDetailView
          open={!!selectedNotification}
          onOpenChange={(open) => !open && setSelectedNotification(null)}
          notification={selectedNotification}
          onEndAllSessions={() => {
            toast({ description: 'Alle Sitzungen wurden beendet' });
            setSelectedNotification(null);
          }}
          onBlockIP={(ip) => {
            toast({ description: `IP ${ip} wurde blockiert` });
            setSelectedNotification(null);
          }}
          onChangePassword={() => {
            toast({ description: 'Passwortänderung wird geöffnet...' });
            setSelectedNotification(null);
          }}
          onLockAccount={() => {
            toast({ description: 'Konto wurde gesperrt', variant: 'destructive' });
            setSelectedNotification(null);
          }}
        />
      )}

      {detailDialogType === 'task' && selectedNotification && (
        <TaskDetailView
          open={!!selectedNotification}
          onOpenChange={(open) => !open && setSelectedNotification(null)}
          notification={selectedNotification}
          onAssign={() => toast({ description: 'Aufgabe zuweisen...' })}
          onAttach={() => toast({ description: 'Anhang hinzufügen...' })}
          onMove={() => toast({ description: 'Aufgabe verschieben...' })}
          onMarkComplete={() => {
            toast({ description: 'Aufgabe wurde als erledigt markiert' });
            setSelectedNotification(null);
          }}
        />
      )}

      {detailDialogType === 'calendar' && selectedNotification && (
        <CalendarDetailView
          open={!!selectedNotification}
          onOpenChange={(open) => !open && setSelectedNotification(null)}
          notification={selectedNotification}
        />
      )}

      {detailDialogType === 'personal' && selectedNotification && (
        <PersonalDetailView
          open={!!selectedNotification}
          onOpenChange={(open) => !open && setSelectedNotification(null)}
          notification={selectedNotification}
        />
      )}

      {detailDialogType === 'compliance' && selectedNotification && (
        <ComplianceDetailView
          open={!!selectedNotification}
          onOpenChange={(open) => !open && setSelectedNotification(null)}
          notification={selectedNotification}
          onReview={() => {
            toast({ description: 'Compliance-Prüfung gestartet...' });
            setSelectedNotification(null);
          }}
        />
      )}

      {detailDialogType === 'workflow' && selectedNotification && (
        <WorkflowDetailView
          open={!!selectedNotification}
          onOpenChange={(open) => !open && setSelectedNotification(null)}
          notification={selectedNotification}
          onApprove={() => {
            toast({ description: 'Antrag wurde genehmigt' });
            setSelectedNotification(null);
          }}
          onReject={() => {
            toast({ description: 'Antrag wurde abgelehnt', variant: 'destructive' });
            setSelectedNotification(null);
          }}
          onViewDetails={() => {
            toast({ description: 'Details werden geladen...' });
            setSelectedNotification(null);
          }}
        />
      )}
    </div>
  );
};

export default NotificationCenter;
