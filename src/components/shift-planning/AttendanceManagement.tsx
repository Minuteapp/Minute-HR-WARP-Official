import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, UserX, Calendar as CalendarIconLucide, Clock, CheckCircle, Plus, FileText, AlertCircle } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface AbsenceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'vacation' | 'sick' | 'personal' | 'training';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: Date;
  approvedBy?: string;
}

export function AttendanceManagement() {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees-attendance', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department')
        .eq('company_id', companyId)
        .eq('status', 'active');
      if (error) throw error;
      return (data || []).map(e => ({
        id: e.id,
        name: `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Unbekannt',
        department: e.department || 'Allgemein'
      }));
    },
    enabled: !!companyId
  });

  const { data: absenceRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['absence-requests-attendance', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('absence_requests')
        .select(`
          id, 
          user_id, 
          employee_name,
          type, 
          start_date, 
          end_date, 
          reason, 
          status, 
          created_at,
          approved_by
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(r => ({
        id: r.id,
        employeeId: r.user_id,
        employeeName: r.employee_name || 'Unbekannt',
        type: r.type as 'vacation' | 'sick' | 'personal' | 'training',
        startDate: new Date(r.start_date),
        endDate: new Date(r.end_date),
        reason: r.reason || '',
        status: r.status as 'pending' | 'approved' | 'rejected',
        submittedDate: new Date(r.created_at),
        approvedBy: r.approved_by
      })) as AbsenceRequest[];
    },
    enabled: !!companyId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('absence_requests')
        .update({ 
          status, 
          approved_by: status === 'approved' ? 'Manager' : null,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          rejected_at: status === 'rejected' ? new Date().toISOString() : null
        })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absence-requests-attendance', companyId] });
      toast({ title: "Status aktualisiert", description: "Der Antrag wurde erfolgreich bearbeitet." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Fehler", description: "Status konnte nicht aktualisiert werden." });
    }
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sick': return 'bg-destructive/10 text-destructive';
      case 'vacation': return 'bg-primary/10 text-primary';
      case 'personal': return 'bg-warning/10 text-warning';
      case 'training': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sick': return 'Krank';
      case 'vacation': return 'Urlaub';
      case 'personal': return 'Persönlich';
      case 'training': return 'Schulung';
      default: return 'Unbekannt';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'approved': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      default: return 'Unbekannt';
    }
  };

  const approveRequest = (requestId: string) => {
    updateStatusMutation.mutate({ requestId, status: 'approved' });
  };

  const rejectRequest = (requestId: string) => {
    updateStatusMutation.mutate({ requestId, status: 'rejected' });
  };

  const AbsenceRequestDialog = () => {
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [absenceType, setAbsenceType] = useState('');
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [reason, setReason] = useState('');

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Abwesenheit melden
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Abwesenheit melden</DialogTitle>
            <DialogDescription>
              Melden Sie eine Abwesenheit für einen Mitarbeiter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mitarbeiter</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Mitarbeiter auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Art der Abwesenheit</Label>
              <Select value={absenceType} onValueChange={setAbsenceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Art auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Krankheit</SelectItem>
                  <SelectItem value="vacation">Urlaub</SelectItem>
                  <SelectItem value="personal">Persönlich</SelectItem>
                  <SelectItem value="training">Schulung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Von</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd.MM.yyyy', { locale: de }) : 'Datum auswählen'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Bis</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd.MM.yyyy', { locale: de }) : 'Datum auswählen'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Grund</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Grund der Abwesenheit..."
                rows={3}
              />
            </div>

            <Button className="w-full">Abwesenheit melden</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const isLoading = loadingEmployees || loadingRequests;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const pendingRequests = absenceRequests.filter(r => r.status === 'pending');
  const currentlyAbsent = absenceRequests.filter(r => 
    r.status === 'approved' && 
    new Date() >= r.startDate && 
    new Date() <= r.endDate
  );
  const upcomingAbsences = absenceRequests.filter(r => 
    r.status === 'approved' && 
    isAfter(r.startDate, new Date())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Anwesenheitsverwaltung</h2>
        <AbsenceRequestDialog />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehende Anträge</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {pendingRequests.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Benötigen Genehmigung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktuell abwesend</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {currentlyAbsent.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Mitarbeiter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geplante Abwesenheit</CardTitle>
            <CalendarIconLucide className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {upcomingAbsences.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Kommende Woche
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verfügbare Mitarbeiter</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {employees.length - currentlyAbsent.length}
            </div>
            <p className="text-xs text-muted-foreground">
              von {employees.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Ausstehende Genehmigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">Keine ausstehenden Anträge</p>
              </div>
            ) : (
              pendingRequests.map(request => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-medium">
                        {request.employeeName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium">{request.employeeName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(request.startDate, 'dd.MM.yyyy', { locale: de })} - {format(request.endDate, 'dd.MM.yyyy', { locale: de })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(request.type)}>
                        {getTypeLabel(request.type)}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{request.reason}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Eingereicht: {format(request.submittedDate, 'dd.MM.yyyy', { locale: de })}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => rejectRequest(request.id)}
                        disabled={updateStatusMutation.isPending}
                      >
                        Ablehnen
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => approveRequest(request.id)}
                        disabled={updateStatusMutation.isPending}
                      >
                        Genehmigen
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Alle Abwesenheitsanträge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {absenceRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">Keine Abwesenheitsanträge vorhanden</p>
            </div>
          ) : (
            <div className="space-y-3">
              {absenceRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {request.employeeName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{request.employeeName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {format(request.startDate, 'dd.MM.yyyy', { locale: de })} - {format(request.endDate, 'dd.MM.yyyy', { locale: de })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(request.type)} variant="outline">
                      {getTypeLabel(request.type)}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
