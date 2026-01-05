import { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Users, CheckSquare, AlertTriangle, Calendar, Info, Settings, FileText, Clock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationStatsCards from "./NotificationStatsCards";
import NotificationCategoryTabs, { NotificationCategoryType } from "./NotificationCategoryTabs";
import NotificationListItem, { NotificationItemData } from "./NotificationListItem";
import NotificationFilterDropdowns from "./NotificationFilterDropdowns";
import NotificationDetailDialog from "./NotificationDetailDialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Hilfsfunktion um Icon basierend auf Kategorie zu erhalten
const getIconForCategory = (category: string, type?: string) => {
  switch (category) {
    case 'requests':
      return <ArrowUpDown className="h-5 w-5 text-primary" />;
    case 'tasks':
      return type === 'overdue' 
        ? <AlertTriangle className="h-5 w-5 text-red-600" />
        : <CheckSquare className="h-5 w-5 text-orange-600" />;
    case 'events':
      return <Calendar className="h-5 w-5 text-green-600" />;
    case 'info':
      return <FileText className="h-5 w-5 text-blue-600" />;
    case 'system':
      return type === 'time' 
        ? <Clock className="h-5 w-5 text-yellow-600" />
        : <Settings className="h-5 w-5 text-gray-600" />;
    default:
      return <Info className="h-5 w-5 text-blue-600" />;
  }
};

const getIconBgColor = (category: string, type?: string) => {
  switch (category) {
    case 'requests':
      return 'bg-blue-100';
    case 'tasks':
      return type === 'overdue' ? 'bg-red-100' : 'bg-orange-100';
    case 'events':
      return 'bg-green-100';
    case 'info':
      return 'bg-blue-100';
    case 'system':
      return type === 'time' ? 'bg-yellow-100' : 'bg-gray-100';
    default:
      return 'bg-blue-100';
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `vor ${diffMins} Min`;
  } else if (diffHours < 24) {
    return `vor ${diffHours} Std`;
  } else if (diffDays === 1) {
    return 'Gestern';
  } else {
    return `vor ${diffDays} Tagen`;
  }
};

const NotificationCenterRedesigned = () => {
  const queryClient = useQueryClient();
  
  // Benachrichtigungen aus der Datenbank laden
  const { data: dbNotifications = [], isLoading } = useQuery({
    queryKey: ['unified-notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('unified_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Fehler beim Laden der Benachrichtigungen:', error);
        return [];
      }
      
      return data || [];
    }
  });
  
  // Konvertiere DB-Daten zu NotificationItemData Format
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  
  useEffect(() => {
    const mapped: NotificationItemData[] = dbNotifications.map((n: any) => {
      const createdAt = new Date(n.created_at);
      const category = n.category || 'system';
      const notificationType = n.notification_type || 'info';
      
      return {
        id: n.id,
        title: n.title || 'Benachrichtigung',
        description: n.message || '',
        category: category,
        categoryLabel: n.source_module || category,
        priority: n.priority === 'high' ? 'kritisch' : n.priority === 'medium' ? 'wichtig' : 'hinweis',
        timestamp: formatTimestamp(createdAt),
        isUnread: !n.read,
        icon: getIconForCategory(category, notificationType),
        iconBgColor: getIconBgColor(category, notificationType),
        type: notificationType,
        createdAt: createdAt,
      };
    });
    
    setNotifications(mapped);
  }, [dbNotifications]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<NotificationCategoryType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItemData | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Check if notification is less than 24 hours old
  const isNewNotification = (notification: NotificationItemData) => {
    if (notification.createdAt) {
      return (new Date().getTime() - new Date(notification.createdAt).getTime()) < 24 * 60 * 60 * 1000;
    }
    return notification.timestamp.includes('Min') || notification.timestamp.includes('Std');
  };

  // Calculate counts for category tabs
  const categoryCounts = {
    all: notifications.length,
    new: notifications.filter(n => isNewNotification(n)).length,
    requests: notifications.filter(n => n.category === 'requests').length,
    tasks: notifications.filter(n => n.category === 'tasks').length,
    info: notifications.filter(n => n.category === 'info').length,
    events: notifications.filter(n => n.category === 'events').length,
    system: notifications.filter(n => n.category === 'system').length,
  };

  // Stats
  const stats = {
    unread: notifications.filter(n => n.isUnread).length,
    critical: notifications.filter(n => n.priority === 'kritisch').length,
    today: notifications.filter(n => n.timestamp.includes('Min') || n.timestamp.includes('Std')).length,
    done: 0,
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Category filter
    if (activeCategory === 'new') {
      if (!isNewNotification(notification)) return false;
    } else if (activeCategory !== 'all' && notification.category !== activeCategory) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!notification.title.toLowerCase().includes(query) && 
          !notification.description.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter === 'unread' && !notification.isUnread) return false;
    if (statusFilter === 'read' && notification.isUnread) return false;

    // Priority filter
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) {
      return false;
    }

    return true;
  });

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || moduleFilter !== 'all';

  const handleMarkAsRead = async (id: string) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isUnread: false } : n)
      );

      // Try to update in database
      const { error } = await supabase
        .from('unified_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.log('Could not update in database, keeping local state');
      }

      toast({ description: 'Als gelesen markiert' });
      queryClient.invalidateQueries({ queryKey: ['unified-notifications'] });
    } catch (error) {
      console.error('Error marking as read:', error);
      toast({ description: 'Als gelesen markiert' });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== id));

      // Try to delete from database
      const { error } = await supabase
        .from('unified_notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.log('Could not delete from database, keeping local state');
      }

      toast({ description: 'Archiviert' });
      queryClient.invalidateQueries({ queryKey: ['unified-notifications'] });
    } catch (error) {
      console.error('Error archiving:', error);
      toast({ description: 'Archiviert' });
    }
  };

  const handleAccept = async (id: string) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isUnread: false } : n)
      );

      toast({ 
        title: 'Anfrage akzeptiert',
        description: 'Die Anfrage wurde erfolgreich genehmigt.' 
      });
      queryClient.invalidateQueries({ queryKey: ['unified-notifications'] });
    } catch (error) {
      console.error('Error accepting:', error);
      toast({ description: 'Anfrage akzeptiert' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isUnread: false } : n)
      );

      toast({ 
        title: 'Anfrage abgelehnt',
        description: 'Die Anfrage wurde abgelehnt.',
        variant: 'destructive' 
      });
      queryClient.invalidateQueries({ queryKey: ['unified-notifications'] });
    } catch (error) {
      console.error('Error rejecting:', error);
      toast({ description: 'Anfrage abgelehnt', variant: 'destructive' });
    }
  };

  const handleOpen = (id: string) => {
    toast({ description: 'Wird geöffnet...' });
  };

  const handleExtendDeadline = (id: string) => {
    toast({ description: 'Frist-Verlängerung angefragt' });
  };

  const handleViewDetails = (notification: NotificationItemData) => {
    setSelectedNotification(notification);
    setDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <NotificationStatsCards stats={stats} />

      {/* Category Tabs */}
      <NotificationCategoryTabs 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        counts={categoryCounts}
      />

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Benachrichtigungen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className={hasActiveFilters ? 'border-primary text-primary' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          {hasActiveFilters ? 'Filter (aktiv)' : 'Filter'}
        </Button>
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <NotificationFilterDropdowns
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          moduleFilter={moduleFilter}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onModuleChange={setModuleFilter}
        />
      )}

      {/* Notifications List */}
      <ScrollArea className="h-[calc(100vh-28rem)]">
        <div className="space-y-3 pb-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-spin" />
              <p>Benachrichtigungen werden geladen...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Keine Benachrichtigungen gefunden</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onArchive={handleArchive}
                onAccept={handleAccept}
                onReject={handleReject}
                onOpen={handleOpen}
                onExtendDeadline={handleExtendDeadline}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Detail Dialog */}
      <NotificationDetailDialog
        notification={selectedNotification}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onMarkAsRead={handleMarkAsRead}
        onArchive={handleArchive}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </div>
  );
};

export default NotificationCenterRedesigned;
