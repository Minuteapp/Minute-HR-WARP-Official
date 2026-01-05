import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

const AIGovernance: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: approvals = [], isLoading: approvalsLoading } = useQuery({
    queryKey: ['ai-team-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_team_approvals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ['ai-compliance-audits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_compliance_audits')
        .select('*')
        .order('audit_date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['ai-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Genehmigt</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Abgelehnt</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Ausstehend</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Kritisch</Badge>;
      case 'high':
        return <Badge variant="destructive">Hoch</Badge>;
      case 'medium':
        return <Badge variant="secondary">Mittel</Badge>;
      default:
        return <Badge variant="outline">Niedrig</Badge>;
    }
  };

  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
  const totalAudits = audits.length;
  const passedAudits = audits.filter(a => a.compliance_score && a.compliance_score >= 80).length;
  const complianceRate = totalAudits > 0 ? (passedAudits / totalAudits) * 100 : 0;
  const activeAlerts = alerts.filter(a => !a.is_resolved).length;

  if (approvalsLoading || auditsLoading || alertsLoading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehende Genehmigungen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">von {approvals.length} Gesamt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance-Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceRate.toFixed(1)}%</div>
            <Progress value={complianceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.severity === 'critical').length} kritisch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossene Audits</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAudits}</div>
            <p className="text-xs text-muted-foreground">{passedAudits} bestanden</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">Genehmigungsworkflow</TabsTrigger>
          <TabsTrigger value="compliance">Compliance-Übersicht</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Warnungen</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>KI-Team Genehmigungen</CardTitle>
              <CardDescription>Verwalten Sie Genehmigungsanfragen für KI-Modelle und -Projekte</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anfrage</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priorität</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div className="font-medium">Anfrage #{approval.reference_id?.slice(0, 8)}</div>
                        <div className="text-sm text-muted-foreground">{approval.workflow_step}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{approval.request_type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      <TableCell>
                        <Badge variant={approval.priority === 'high' ? 'destructive' : 'outline'}>
                          {approval.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance-Audits</CardTitle>
              <CardDescription>Übersicht über durchgeführte KI-Compliance-Prüfungen</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Audit-Typ</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell>
                        <Badge variant="outline">{audit.audit_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {audit.audit_date ? new Date(audit.audit_date).toLocaleDateString('de-DE') : 'Kein Datum'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{audit.compliance_score || 0}/100</span>
                          <Progress value={audit.compliance_score || 0} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={audit.audit_status === 'completed' ? 'default' : 'secondary'}>
                          {audit.audit_status === 'completed' ? 'Abgeschlossen' : 'Ausstehend'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="grid gap-4">
            {alerts.filter(alert => !alert.is_resolved).map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        {alert.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(alert.severity)}
                        <Badge variant="outline">{alert.alert_type}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{alert.message}</p>
                  <div className="text-xs text-muted-foreground">
                    Erstellt am {new Date(alert.created_at).toLocaleString('de-DE')}
                  </div>
                </CardContent>
              </Card>
            ))}

            {alerts.filter(alert => !alert.is_resolved).length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Keine aktiven Alerts</h3>
                  <p className="text-sm text-muted-foreground text-center">Alle KI-Systeme funktionieren ordnungsgemäß.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIGovernance;