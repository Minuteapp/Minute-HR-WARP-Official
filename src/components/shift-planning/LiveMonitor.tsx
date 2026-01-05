import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Phone, MessageSquare, AlertTriangle, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';

export const LiveMonitor = () => {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  // Aktive Schichten laden
  const { data: activeShifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ['live-shifts', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_assignments')
        .select(`
          *,
          employees (first_name, last_name, department),
          shifts (name, start_time, end_time)
        `)
        .eq('company_id', companyId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  // Benachrichtigungen laden
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['shift-notifications', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_notifications')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  const isLoading = shiftsLoading || notificationsLoading;

  // Statistiken berechnen
  const liveStats = [
    { 
      title: 'Aktive Schichten', 
      value: activeShifts.length.toString(), 
      subtitle: 'aktuell', 
      color: 'text-green-600' 
    },
    { 
      title: 'In Pause', 
      value: '0', 
      subtitle: 'Mitarbeiter', 
      color: 'text-orange-600' 
    },
    { 
      title: 'Verspätungen', 
      value: '0', 
      subtitle: 'Probleme', 
      color: 'text-red-600' 
    },
    { 
      title: 'Benachrichtigungen', 
      value: notifications.length.toString(), 
      subtitle: 'Ungelesen', 
      color: 'text-blue-600' 
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Live Schicht-Monitor</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Letztes Update: {new Date().toLocaleTimeString('de-DE')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600">Live</span>
        </div>
      </div>

      {/* Live Statistics */}
      <div className="grid grid-cols-4 gap-4">
        {liveStats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
            </div>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.subtitle}</div>
          </Card>
        ))}
      </div>

      {/* Active Shifts */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h3 className="text-base font-medium">Aktuelle Schichten</h3>
        </div>

        {activeShifts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Keine aktiven Schichten</p>
            <p className="text-sm mt-1">Schichten werden hier angezeigt, sobald sie gestartet werden.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeShifts.map((shift: any) => (
              <div key={shift.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded flex items-center justify-center text-sm font-medium">
                        {shift.employees?.first_name?.[0] || 'M'}
                        {shift.employees?.last_name?.[0] || 'A'}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {shift.employees?.first_name} {shift.employees?.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {shift.shifts?.name || 'Schicht'}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {shift.status || 'Aktiv'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      {shift.shifts?.start_time} - {shift.shifts?.end_time}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Fortschritt</span>
                        <span className="text-xs">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Phone className="w-3 h-3 mr-1" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-3 h-3 mr-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Warnings & Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-base font-medium">Warnungen & Benachrichtigungen</h3>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Keine ungelesenen Benachrichtigungen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification: any) => (
              <div key={notification.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-sm text-muted-foreground">{notification.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at).toLocaleString('de-DE')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Lösen
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
