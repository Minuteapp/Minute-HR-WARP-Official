import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, RefreshCw, Download, Search, Clock, AlertTriangle, 
  Calendar, Euro, CheckCircle, XCircle, Eye, Plane, Receipt, RotateCcw,
  ArrowRight
} from 'lucide-react';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

export function AdminApprovalsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const queryClient = useQueryClient();

  // Fetch all approvals
  const { data: approvals = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-travel-approvals', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('travel_approvals')
        .select(`
          *,
          employee:employees(first_name, last_name, position, department, avatar_url)
        `)
        .order('submitted_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (approvalId: string) => {
      const { error } = await supabase
        .from('travel_approvals')
        .update({ status: 'approved' })
        .eq('id', approvalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-travel-approvals'] });
      toast.success('Antrag genehmigt');
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (approvalId: string) => {
      const { error } = await supabase
        .from('travel_approvals')
        .update({ status: 'rejected' })
        .eq('id', approvalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-travel-approvals'] });
      toast.success('Antrag abgelehnt');
    }
  });

  // Filter approvals
  const filteredApprovals = approvals.filter((approval: any) => {
    const employeeName = `${approval.employee?.first_name || ''} ${approval.employee?.last_name || ''}`.toLowerCase();
    const matchesSearch = !searchTerm || 
      employeeName.includes(searchTerm.toLowerCase()) ||
      approval.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.approval_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || approval.request_type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || approval.priority === priorityFilter;
    const matchesDepartment = departmentFilter === 'all' || approval.employee?.department === departmentFilter;
    return matchesSearch && matchesType && matchesPriority && matchesDepartment;
  });

  // Calculate stats
  const pendingCount = approvals.filter((a: any) => a.status === 'pending').length;
  const urgentCount = approvals.filter((a: any) => a.priority === 'high' && a.status === 'pending').length;
  const dueTodayCount = approvals.filter((a: any) => {
    if (!a.travel_date) return false;
    const travelDate = new Date(a.travel_date);
    const today = new Date();
    return travelDate.toDateString() === today.toDateString() && a.status === 'pending';
  }).length;
  const totalAmount = filteredApprovals.reduce((sum: number, a: any) => sum + (Number(a.total_amount) || 0), 0);

  // Get unique departments
  const departments = [...new Set(approvals.map((a: any) => a.employee?.department).filter(Boolean))];

  const getEmployeeName = (employee: any) => {
    if (!employee) return 'Unbekannt';
    return `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unbekannt';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Genehmigt</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Abgelehnt</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Ausstehend</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Hoch</Badge>;
      case 'normal':
        return <Badge variant="secondary">Normal</Badge>;
      case 'low':
        return <Badge variant="outline">Niedrig</Badge>;
      default:
        return null;
    }
  };

  const isOverdue = (approval: any) => {
    if (!approval.travel_date || approval.status !== 'pending') return false;
    const travelDate = new Date(approval.travel_date);
    const today = new Date();
    return isBefore(travelDate, today);
  };

  const getDueDateInfo = (approval: any) => {
    if (!approval.travel_date) return { text: '-', isOverdue: false, daysLeft: null };
    const travelDate = new Date(approval.travel_date);
    const today = new Date();
    const days = differenceInDays(travelDate, today);
    
    if (days < 0 && approval.status === 'pending') {
      return { text: 'Überfällig', isOverdue: true, daysLeft: days };
    } else if (days === 0) {
      return { text: 'Heute', isOverdue: false, daysLeft: 0 };
    } else if (days === 1) {
      return { text: 'Morgen', isOverdue: false, daysLeft: 1 };
    } else if (days <= 7) {
      return { text: `In ${days} Tagen`, isOverdue: false, daysLeft: days };
    }
    return { text: format(travelDate, 'dd. MMMM yyyy', { locale: de }), isOverdue: false, daysLeft: days };
  };

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
    setStatusFilter('pending');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Administration & Genehmigungen</h2>
            <p className="text-muted-foreground">
              Zentrale Verwaltung aller Reise- und Spesenanträge
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ausstehend</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg border border-orange-200">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dringend</p>
                <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heute fällig</p>
                <p className="text-2xl font-bold text-blue-600">{dueTodayCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg border border-blue-200">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtbetrag</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Suchen..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Alle Typen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="travel_request">Reiseantrag</SelectItem>
            <SelectItem value="expense_report">Spesenabrechnung</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priorität" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="high">Hoch</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Niedrig</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Alle Abteilungen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept as string} value={dept as string}>{dept as string}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="pending">Ausstehend</SelectItem>
            <SelectItem value="approved">Genehmigt</SelectItem>
            <SelectItem value="rejected">Abgelehnt</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Zurücksetzen
        </Button>
      </div>

      {/* Approvals Cards View */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Genehmigungen ({filteredApprovals.length})</h3>
        </div>
        
        {filteredApprovals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Genehmigungen gefunden</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApprovals.map((approval: any) => {
              const dueDateInfo = getDueDateInfo(approval);
              
              return (
                <Card key={approval.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      {/* Left content */}
                      <div className="flex-1 p-5">
                        {/* Header Row: Employee + Amount */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                              <AvatarImage src={approval.employee?.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getEmployeeName(approval.employee).substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-lg">{getEmployeeName(approval.employee)}</p>
                              <p className="text-sm text-muted-foreground">
                                {approval.employee?.position || 'Mitarbeiter'} • {approval.employee?.department || 'Keine Abteilung'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              {Number(approval.total_amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                            </p>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t mb-4" />

                        {/* Type Badge + Title */}
                        <div className="mb-3">
                          <Badge variant="outline" className="mb-2 text-xs">
                            {approval.request_type === 'expense_report' ? (
                              <>
                                <Receipt className="h-3 w-3 mr-1" />
                                Spesenabrechnung
                              </>
                            ) : (
                              <>
                                <Plane className="h-3 w-3 mr-1" />
                                Reiseantrag
                              </>
                            )}
                          </Badge>
                          <h4 className="font-semibold text-base">{approval.destination || 'Ohne Titel'}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {approval.description || approval.project || 'Keine Beschreibung'}
                          </p>
                        </div>

                        {/* Priority + Status Badges */}
                        <div className="flex items-center gap-2 mb-4">
                          {getPriorityBadge(approval.priority)}
                          {getStatusBadge(approval.status)}
                        </div>

                        {/* Date Info */}
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Reisedatum: </span>
                            <span className="font-medium">
                              {approval.travel_date 
                                ? format(new Date(approval.travel_date), 'dd. MMMM yyyy', { locale: de })
                                : '-'
                              }
                            </span>
                          </div>
                          {dueDateInfo.isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              {dueDateInfo.text}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Right Actions Panel */}
                      <div className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-muted/30 border-l min-w-[100px]">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-10 w-10 rounded-full"
                        >
                          <Eye className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        {approval.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-10 w-10 rounded-full text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => approveMutation.mutate(approval.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-10 w-10 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => rejectMutation.mutate(approval.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-5 w-5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}