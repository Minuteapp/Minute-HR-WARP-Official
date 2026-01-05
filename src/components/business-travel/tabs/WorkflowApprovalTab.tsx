import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, XCircle, Clock, AlertTriangle, MapPin, Calendar, Euro,
  ArrowRight, FileText, Plane, Receipt, Leaf
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

interface ApprovalChainStep {
  role: string;
  name: string;
  status: 'approved' | 'pending' | 'waiting';
  approved_at?: string;
}

export function WorkflowApprovalTab() {
  const queryClient = useQueryClient();

  // Fetch pending approvals
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['travel-approvals-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_approvals')
        .select(`
          *,
          employee:employees(first_name, last_name, position, department, avatar_url)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch recent decisions
  const { data: recentDecisions = [] } = useQuery({
    queryKey: ['approval-decisions-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_decisions')
        .select(`
          *,
          approval:travel_approvals(approval_number, destination, total_amount, request_type)
        `)
        .order('decided_at', { ascending: false })
        .limit(10);

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
      queryClient.invalidateQueries({ queryKey: ['travel-approvals-pending'] });
      queryClient.invalidateQueries({ queryKey: ['approval-decisions-recent'] });
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
      queryClient.invalidateQueries({ queryKey: ['travel-approvals-pending'] });
      queryClient.invalidateQueries({ queryKey: ['approval-decisions-recent'] });
      toast.success('Antrag abgelehnt');
    }
  });

  const pendingCount = approvals.length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'waiting':
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEmployeeName = (employee: any) => {
    if (!employee) return 'Unbekannt';
    return `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unbekannt';
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
        <div>
          <h2 className="text-2xl font-bold">Genehmigungen</h2>
          <p className="text-muted-foreground">
            Reiseanträge und Spesenabrechnungen prüfen und genehmigen
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
            {pendingCount} ausstehend
          </Badge>
        )}
      </div>

      {/* Approval Cards */}
      <div className="space-y-4">
        {approvals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">Keine ausstehenden Genehmigungen</p>
              <p className="text-muted-foreground">Alle Anträge wurden bearbeitet</p>
            </CardContent>
          </Card>
        ) : (
          approvals.map((approval: any) => {
            const approvalChain: ApprovalChainStep[] = Array.isArray(approval.approval_chain) 
              ? approval.approval_chain 
              : [];

            return (
              <Card key={approval.id} className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={approval.employee?.avatar_url} />
                        <AvatarFallback>
                          {getEmployeeName(approval.employee).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{getEmployeeName(approval.employee)}</h3>
                          <Badge variant="outline" className="text-xs">
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
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {approval.employee?.position} • {approval.employee?.department}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{approval.approval_number}</p>
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center gap-6 mb-4 text-sm">
                    {approval.destination && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {approval.destination}
                      </div>
                    )}
                    {approval.travel_date && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(approval.travel_date), 'dd.MM.yyyy', { locale: de })}
                      </div>
                    )}
                    <div className="flex items-center gap-1 font-medium">
                      <Euro className="h-4 w-4" />
                      {Number(approval.total_amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </div>
                  </div>

                  {/* Description */}
                  {(approval.description || approval.project) && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm">
                      {approval.description && <p>{approval.description}</p>}
                      {approval.project && (
                        <p className="text-muted-foreground mt-1">Projekt: {approval.project}</p>
                      )}
                    </div>
                  )}

                  {/* Cost Breakdown */}
                  <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Transport</p>
                      <p className="font-medium">
                        {Number(approval.transport_cost || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Unterkunft</p>
                      <p className="font-medium">
                        {Number(approval.accommodation_cost || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Verpflegung</p>
                      <p className="font-medium">
                        {Number(approval.meals_cost || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">CO₂</p>
                      <p className="font-medium text-green-600">
                        {Number(approval.co2_kg || 0).toLocaleString('de-DE')} kg
                      </p>
                    </div>
                  </div>

                  {/* Approval Chain */}
                  {approvalChain.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                      {approvalChain.map((step, index) => (
                        <React.Fragment key={index}>
                          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg min-w-fit">
                            {getStatusIcon(step.status)}
                            <div>
                              <p className="text-xs text-muted-foreground">{step.role}</p>
                              <p className="text-sm font-medium">{step.name}</p>
                            </div>
                          </div>
                          {index < approvalChain.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Priority & ESG Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    {approval.priority === 'high' && (
                      <Badge variant="destructive">Hoch</Badge>
                    )}
                    {approval.esg_check_required && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                        <Leaf className="h-3 w-3 mr-1" />
                        ESG-Prüfung
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Details ansehen
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => rejectMutation.mutate(approval.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Ablehnen
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveMutation.mutate(approval.id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Genehmigen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Recent Decisions */}
      <Card>
        <CardHeader>
          <CardTitle>Kürzliche Entscheidungen</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDecisions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Noch keine Entscheidungen getroffen
            </p>
          ) : (
            <div className="space-y-3">
              {recentDecisions.map((decision: any) => (
                <div 
                  key={decision.id} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {decision.decision === 'approved' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {decision.approval?.destination || 'Unbekannt'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {decision.approval?.request_type === 'expense_report' 
                          ? 'Spesenabrechnung' 
                          : 'Reiseantrag'
                        } • {Number(decision.approval?.total_amount || 0).toLocaleString('de-DE')} € • {decision.approval?.approval_number}
                      </p>
                      {decision.decision === 'rejected' && decision.reason && (
                        <p className="text-sm text-red-600 mt-1">{decision.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{decision.approver_name}</p>
                    <p>{decision.decided_at ? format(new Date(decision.decided_at), 'dd.MM.yyyy HH:mm', { locale: de }) : ''}</p>
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