import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { useAbsenceManagement } from '@/hooks/useAbsenceManagement';
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Filter, Download, CheckSquare, XSquare, Clock, 
  Users, Calendar, FileText, Workflow, Settings 
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: (selectedIds: string[]) => Promise<void>;
  requiresConfirmation?: boolean;
  permission: string;
}

export const EnterpriseAbsenceManagement: React.FC = () => {
  const { toast } = useToast();
  const { hasAction, canView, canEdit, canApprove } = useEnterprisePermissions();
  const { 
    absenceRequests = [], 
    isLoadingRequests, 
    updateFilter, 
    filter,
    approveRequest,
    rejectRequest 
  } = useAbsenceManagement();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);

  // Enterprise Bulk-Aktionen
  const bulkActions: BulkAction[] = [
    {
      id: 'approve',
      label: 'Genehmigen',
      icon: CheckSquare,
      permission: 'absence_requests.approve',
      action: async (ids) => {
        for (const id of ids) {
          await approveRequest(id);
        }
        toast({ title: `${ids.length} Anträge genehmigt` });
      }
    },
    {
      id: 'reject',
      label: 'Ablehnen',
      icon: XSquare,
      permission: 'absence_requests.reject',
      requiresConfirmation: true,
      action: async (ids) => {
        for (const id of ids) {
          await rejectRequest({ id, reason: 'Bulk-Ablehnung durch Admin' });
        }
        toast({ title: `${ids.length} Anträge abgelehnt` });
      }
    },
    {
      id: 'export',
      label: 'Exportieren',
      icon: Download,
      permission: 'absence_requests.export',
      action: async (ids) => {
        const selectedRequests = absenceRequests.filter(req => ids.includes(req.id));
        await exportToCSV(selectedRequests);
        toast({ title: `${ids.length} Anträge exportiert` });
      }
    }
  ];

  // CSV Export für Enterprise
  const exportToCSV = async (requests: any[]) => {
    const headers = [
      'ID', 'Mitarbeiter', 'Abteilung', 'Typ', 'Von', 'Bis', 
      'Status', 'Antragsdatum', 'Genehmigt von', 'Grund'
    ];
    
    const rows = requests.map(req => [
      req.id,
      req.employee_name || 'Unbekannt',
      req.department || '',
      req.type || req.absence_type,
      req.start_date,
      req.end_date,
      req.status,
      new Date(req.created_at).toLocaleDateString('de-DE'),
      req.approved_by || '',
      req.reason || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `abwesenheitsanträge_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Workflow-Integration für Enterprise
  const triggerWorkflow = async (requestId: string, workflowType: string) => {
    try {
      const { data, error } = await supabase.rpc('start_workflow', {
        p_template_id: 'vacation_approval', // Aus workflow_templates
        p_reference_id: requestId,
        p_reference_type: 'absence_request',
        p_workflow_data: { type: workflowType }
      });
      
      if (error) throw error;
      toast({ title: 'Workflow gestartet', description: `Workflow für Antrag ${requestId}` });
    } catch (error) {
      console.error('Workflow error:', error);
      toast({ 
        title: 'Workflow-Fehler', 
        description: 'Workflow konnte nicht gestartet werden',
        variant: 'destructive' 
      });
    }
  };

  // Filterte Requests basierend auf Enterprise-Filter
  const filteredRequests = absenceRequests.filter(request => {
    const matchesSearch = !searchQuery || 
      request.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || request.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Bulk-Aktionen ausführen
  const executeBulkAction = async (action: BulkAction) => {
    if (selectedItems.length === 0) {
      toast({ title: 'Keine Auswahl', description: 'Bitte wählen Sie Anträge aus' });
      return;
    }

    if (!hasAction('absence_requests', action.permission)) {
      toast({ title: 'Keine Berechtigung', variant: 'destructive' });
      return;
    }

    if (action.requiresConfirmation) {
      if (!confirm(`${action.label} für ${selectedItems.length} Anträge?`)) return;
    }

    setBulkActionInProgress(true);
    try {
      await action.action(selectedItems);
      setSelectedItems([]);
    } catch (error) {
      toast({ 
        title: 'Fehler', 
        description: `${action.label} fehlgeschlagen`,
        variant: 'destructive' 
      });
    } finally {
      setBulkActionInProgress(false);
    }
  };

  // Unique Departments für Filter
  const departments = [...new Set(absenceRequests.map(req => req.department).filter(Boolean))];

  if (!canView('absence_requests')) {
    return <div>Keine Berechtigung für Abwesenheitsverwaltung</div>;
  }

  return (
    <div className="space-y-6">
      {/* Enterprise Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Enterprise Abwesenheitsverwaltung</CardTitle>
              <p className="text-muted-foreground">
                Verwaltung von {absenceRequests.length} Abwesenheitsanträgen mit erweiterten Funktionen
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => triggerWorkflow('', 'bulk_process')}>
                <Workflow className="w-4 h-4 mr-2" />
                Workflow
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enterprise Filter & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Mitarbeiter, Abteilung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="approved">Genehmigt</SelectItem>
                <SelectItem value="rejected">Abgelehnt</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Abteilung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Abteilungen</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {filteredRequests.length} Anträge
              </Badge>
              {selectedItems.length > 0 && (
                <Badge variant="default">
                  {selectedItems.length} ausgewählt
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-700">
                {selectedItems.length} Anträge ausgewählt
              </div>
              <div className="flex space-x-2">
                {bulkActions.map(action => (
                  hasAction('absence_requests', action.permission) && (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => executeBulkAction(action)}
                      disabled={bulkActionInProgress}
                      className="bg-white"
                    >
                      <action.icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </Button>
                  )
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enterprise Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Abwesenheitsanträge</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <Checkbox
                        checked={selectedItems.length === filteredRequests.length && filteredRequests.length > 0}
                        onCheckedChange={(checked) => {
                          setSelectedItems(checked ? filteredRequests.map(r => r.id) : []);
                        }}
                      />
                    </th>
                    <th className="text-left p-3">Mitarbeiter</th>
                    <th className="text-left p-3">Abteilung</th>
                    <th className="text-left p-3">Typ</th>
                    <th className="text-left p-3">Zeitraum</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedItems.includes(request.id)}
                          onCheckedChange={(checked) => {
                            setSelectedItems(prev => 
                              checked 
                                ? [...prev, request.id]
                                : prev.filter(id => id !== request.id)
                            );
                          }}
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{request.employee_name || 'Unbekannt'}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString('de-DE')}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{request.department || '-'}</td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {request.type || 'Abwesenheit'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {request.start_date} - {request.end_date}
                          {request.half_day && <span className="text-blue-600 ml-1">(Halbtag)</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {request.status === 'pending' ? 'Ausstehend' :
                           request.status === 'approved' ? 'Genehmigt' :
                           request.status === 'rejected' ? 'Abgelehnt' : request.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          {request.status === 'pending' && canApprove('absence_requests') && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveRequest(request.id)}
                              >
                                <CheckSquare className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectRequest({ id: request.id })}
                              >
                                <XSquare className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerWorkflow(request.id, 'approval')}
                          >
                            <Workflow className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Abwesenheitsanträge gefunden
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};