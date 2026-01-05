import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export const AbsenceManagement = () => {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [absenceType, setAbsenceType] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');

  // Mitarbeiter laden
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-select', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('last_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  // Abwesenheitsanträge laden
  const { data: absenceRequests = [], isLoading } = useQuery({
    queryKey: ['absence-requests', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absence_requests')
        .select(`
          *,
          employees:user_id (first_name, last_name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  // Statistiken berechnen
  const pendingRequests = absenceRequests.filter((r: any) => r.status === 'pending');
  const currentAbsent = absenceRequests.filter((r: any) => {
    const today = new Date();
    const start = new Date(r.start_date);
    const end = new Date(r.end_date);
    return r.status === 'approved' && today >= start && today <= end;
  });

  const absenceStats = [
    { title: 'Ausstehende Anträge', value: pendingRequests.length.toString(), subtitle: 'Benötigt Genehmigung', color: 'text-orange-600' },
    { title: 'Aktuell abwesend', value: currentAbsent.length.toString(), subtitle: 'Mitarbeiter', color: 'text-blue-600' },
    { title: 'Geplante Abwesenheit', value: '0', subtitle: 'Kommende Woche', color: 'text-purple-600' },
    { title: 'Verfügbare Mitarbeiter', value: employees.length.toString(), subtitle: 'aktiv', color: 'text-green-600' }
  ];

  // Mutation für neuen Antrag
  const createAbsenceMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('absence_requests')
        .insert({
          user_id: selectedEmployee,
          company_id: companyId,
          type: absenceType,
          absence_type: absenceType,
          start_date: startDate?.toISOString().split('T')[0],
          end_date: endDate?.toISOString().split('T')[0],
          reason,
          status: 'pending',
          created_by: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absence-requests', companyId] });
      toast({ title: 'Abwesenheit gemeldet', description: 'Der Antrag wurde erfolgreich erstellt.' });
      handleCloseDialog();
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Der Antrag konnte nicht erstellt werden.' });
    }
  });

  const handleCloseDialog = () => {
    setShowReportDialog(false);
    setSelectedEmployee('');
    setAbsenceType('');
    setStartDate(undefined);
    setEndDate(undefined);
    setReason('');
  };

  const handleReportAbsence = () => {
    createAbsenceMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Genehmigt';
      case 'pending': return 'Ausstehend';
      case 'rejected': return 'Abgelehnt';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Anwesenheitsverwaltung</h2>
        <Button onClick={() => setShowReportDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Abwesenheit melden
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        {absenceStats.map((stat, index) => (
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

      {/* Pending Approvals */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5" />
          <h3 className="text-base font-medium">Ausstehende Genehmigungen</h3>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Keine ausstehenden Anträge</p>
          </div>
        ) : (
          pendingRequests.map((request: any) => (
            <div key={request.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded flex items-center justify-center text-sm font-medium">
                  {request.employees?.first_name?.[0]}{request.employees?.last_name?.[0]}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {request.employees?.first_name} {request.employees?.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(request.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(request.end_date), 'dd.MM.yyyy', { locale: de })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(request.type)}>{request.type}</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-destructive">Ablehnen</Button>
                  <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">Genehmigen</Button>
                </div>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* All Absence Requests */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h3 className="text-base font-medium">Alle Abwesenheitsanträge</h3>
        </div>

        {absenceRequests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Keine Abwesenheitsanträge vorhanden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {absenceRequests.map((request: any) => (
              <div key={request.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded flex items-center justify-center text-sm font-medium">
                    {request.employees?.first_name?.[0]}{request.employees?.last_name?.[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {request.employees?.first_name} {request.employees?.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(request.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(request.end_date), 'dd.MM.yyyy', { locale: de })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(request.type)}>{request.type}</Badge>
                  <Badge variant="outline" className={getStatusColor(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Report Absence Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Neue Abwesenheit melden</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-4 top-4"
              onClick={handleCloseDialog}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Melden Sie eine Abwesenheit für einen Mitarbeiter.
            </p>
            
            <div>
              <Label className="text-sm font-medium">Mitarbeiter</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Mitarbeiter auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Art der Abwesenheit</Label>
              <Select value={absenceType} onValueChange={setAbsenceType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Art auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urlaub">Urlaub</SelectItem>
                  <SelectItem value="krank">Krank</SelectItem>
                  <SelectItem value="schulung">Schulung</SelectItem>
                  <SelectItem value="sonstiges">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Von</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd.MM.yyyy", { locale: de }) : "Datum auswählen"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-sm font-medium">Bis</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd.MM.yyyy", { locale: de }) : "Datum auswählen"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Grund</Label>
              <Textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Grund der Abwesenheit..."
                className="mt-1"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleReportAbsence}
              className="w-full"
              disabled={!selectedEmployee || !absenceType || !startDate || !endDate || createAbsenceMutation.isPending}
            >
              {createAbsenceMutation.isPending ? 'Wird gemeldet...' : 'Abwesenheit melden'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
