import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface DocumentStatsDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'activeUsers' | 'recentlyModified' | 'pendingApprovals';
}

export const DocumentStatsDetail: React.FC<DocumentStatsDetailProps> = ({
  open,
  onOpenChange,
  type
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['document-stats-detail', type],
    queryFn: async () => {
      switch (type) {
        case 'activeUsers':
          return fetchActiveUsers();
        case 'recentlyModified':
          return fetchRecentlyModified();
        case 'pendingApprovals':
          return fetchPendingApprovals();
        default:
          return [];
      }
    },
    enabled: open
  });

  const fetchActiveUsers = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logs, error } = await supabase
      .from('document_access_logs')
      .select(`
        user_id,
        performed_at,
        action
      `)
      .gt('performed_at', thirtyDaysAgo.toISOString())
      .order('performed_at', { ascending: false });

    if (error) throw error;

    // Gruppiere nach Benutzer
    const userActivity = logs?.reduce((acc, log) => {
      if (!acc[log.user_id]) {
        acc[log.user_id] = {
          user_id: log.user_id,
          actions: [],
          lastActivity: log.performed_at
        };
      }
      acc[log.user_id].actions.push(log.action);
      return acc;
    }, {} as Record<string, any>) || {};

    return Object.values(userActivity);
  };

  const fetchRecentlyModified = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('documents')
      .select('id, title, updated_at, status, created_by, category')
      .gt('updated_at', sevenDaysAgo.toISOString())
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  const fetchPendingApprovals = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, created_at, status, created_by, category, file_size')
      .eq('status', 'pending')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  const getTitle = () => {
    switch (type) {
      case 'activeUsers':
        return 'Aktive Benutzer';
      case 'recentlyModified':
        return 'Kürzlich aktualisierte Dokumente';
      case 'pendingApprovals':
        return 'Ausstehende Genehmigungen';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'activeUsers':
        return <Users className="h-5 w-5" />;
      case 'recentlyModified':
        return <Clock className="h-5 w-5" />;
      case 'pendingApprovals':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Keine Daten verfügbar</p>
        </div>
      );
    }

    switch (type) {
      case 'activeUsers':
        return (
          <div className="space-y-3">
            {data.map((user: any) => (
              <Card key={user.user_id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {user.user_id.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">Benutzer {user.user_id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        Letzte Aktivität: {formatDistanceToNow(new Date(user.lastActivity), { 
                          addSuffix: true, 
                          locale: de 
                        })}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {[...new Set(user.actions)].slice(0, 3).map((action: string) => (
                          <Badge key={action} variant="secondary" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'recentlyModified':
        return (
          <div className="space-y-3">
            {data.map((doc: any) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Kategorie: {doc.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Geändert: {formatDistanceToNow(new Date(doc.updated_at), { 
                          addSuffix: true, 
                          locale: de 
                        })}
                      </p>
                    </div>
                    <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                      {doc.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'pendingApprovals':
        return (
          <div className="space-y-3">
            {data.map((doc: any) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Kategorie: {doc.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Eingereicht: {formatDistanceToNow(new Date(doc.created_at), { 
                          addSuffix: true, 
                          locale: de 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        Ausstehend
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getIcon()}
            <span>{getTitle()}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};