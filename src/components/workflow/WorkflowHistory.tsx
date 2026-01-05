import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface WorkflowInstance {
  id: string;
  reference_id: string;
  reference_type: string;
  status: string;
  current_step: number;
  workflow_data: any;
  created_at: string;
  completed_at?: string;
  initiated_by: string;
  workflow_templates: {
    name: string;
    workflow_type: string;
  };
  workflow_steps: Array<{
    id: string;
    step_number: number;
    step_type: string;
    status: string;
    approver_role: string;
    decision?: string;
    comments?: string;
    decision_date?: string;
  }>;
}

export const WorkflowHistory = () => {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkflowHistory();
  }, []);

  useEffect(() => {
    filterWorkflows();
  }, [workflows, searchTerm, statusFilter, typeFilter]);

  const fetchWorkflowHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          workflow_templates(name, workflow_type),
          workflow_steps(*)
        `)
        .in('status', ['approved', 'rejected', 'escalated', 'cancelled'])
        .order('completed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Laden der Workflow-Historie",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWorkflows = () => {
    let filtered = workflows;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(workflow =>
        workflow.workflow_templates.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.workflow_templates.workflow_type === typeFilter);
    }

    setFilteredWorkflows(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'escalated': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'escalated': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      case 'escalated': return 'Eskaliert';
      case 'cancelled': return 'Abgebrochen';
      default: return status;
    }
  };

  const getWorkflowTypeDisplay = (type: string) => {
    switch (type) {
      case 'absence_approval': return 'Urlaubsantrag';
      case 'overtime_approval': return 'Überstunden';
      case 'expense_approval': return 'Ausgaben';
      case 'time_off_approval': return 'Freistellung';
      case 'general_approval': return 'Allgemein';
      default: return type;
    }
  };

  const calculateProcessingTime = (workflow: WorkflowInstance) => {
    if (!workflow.completed_at) return null;
    
    const start = new Date(workflow.created_at);
    const end = new Date(workflow.completed_at);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (hours < 24) {
      return `${Math.round(hours)} Stunden`;
    } else {
      const days = Math.round(hours / 24);
      return `${days} Tag${days !== 1 ? 'e' : ''}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Lade Workflow-Historie...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Suche</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Workflow-ID oder Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                  <SelectItem value="escalated">Eskaliert</SelectItem>
                  <SelectItem value="cancelled">Abgebrochen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Typ</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="absence_approval">Urlaubsantrag</SelectItem>
                  <SelectItem value="overtime_approval">Überstunden</SelectItem>
                  <SelectItem value="expense_approval">Ausgaben</SelectItem>
                  <SelectItem value="time_off_approval">Freistellung</SelectItem>
                  <SelectItem value="general_approval">Allgemein</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow-Historie ({filteredWorkflows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Workflows gefunden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={getStatusColor(workflow.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(workflow.status)}
                              {getStatusText(workflow.status)}
                            </div>
                          </Badge>
                          <Badge variant="secondary">
                            {getWorkflowTypeDisplay(workflow.workflow_templates.workflow_type)}
                          </Badge>
                          <span className="font-medium">{workflow.workflow_templates.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Abgeschlossen: {workflow.completed_at ? 
                                formatDistanceToNow(new Date(workflow.completed_at), { 
                                  addSuffix: true, 
                                  locale: de 
                                }) : 'Unbekannt'
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Bearbeitungszeit: {calculateProcessingTime(workflow) || 'Unbekannt'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>ID: {workflow.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedWorkflow(workflow)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Workflow Details</DialogTitle>
                          </DialogHeader>
                          
                          {selectedWorkflow && (
                            <div className="space-y-6">
                              {/* Workflow Overview */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Workflow Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">ID:</span> {selectedWorkflow.id}</p>
                                    <p><span className="font-medium">Typ:</span> {getWorkflowTypeDisplay(selectedWorkflow.workflow_templates.workflow_type)}</p>
                                    <p><span className="font-medium">Template:</span> {selectedWorkflow.workflow_templates.name}</p>
                                    <p><span className="font-medium">Status:</span> 
                                      <Badge className={`ml-2 ${getStatusColor(selectedWorkflow.status)}`}>
                                        {getStatusText(selectedWorkflow.status)}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Zeitinformationen</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Gestartet:</span> {new Date(selectedWorkflow.created_at).toLocaleString('de-DE')}</p>
                                    {selectedWorkflow.completed_at && (
                                      <p><span className="font-medium">Abgeschlossen:</span> {new Date(selectedWorkflow.completed_at).toLocaleString('de-DE')}</p>
                                    )}
                                    <p><span className="font-medium">Bearbeitungszeit:</span> {calculateProcessingTime(selectedWorkflow) || 'Unbekannt'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Workflow Steps Timeline */}
                              <div>
                                <h4 className="font-medium mb-4">Workflow Verlauf</h4>
                                <div className="space-y-3">
                                  {selectedWorkflow.workflow_steps
                                    ?.sort((a, b) => a.step_number - b.step_number)
                                    .map((step, index) => (
                                    <div key={step.id} className="flex items-start gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                        step.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        step.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {step.step_number}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="font-medium text-sm">{step.approver_role}</div>
                                            <div className="text-xs text-muted-foreground">
                                              Schritt {step.step_number}: {step.step_type}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge variant={
                                              step.status === 'approved' ? 'default' :
                                              step.status === 'rejected' ? 'destructive' :
                                              step.status === 'pending' ? 'secondary' : 'outline'
                                            }>
                                              {step.status}
                                            </Badge>
                                            {step.decision_date && (
                                              <span className="text-xs text-muted-foreground">
                                                {new Date(step.decision_date).toLocaleString('de-DE')}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {step.comments && (
                                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                            <span className="font-medium">Kommentar:</span> {step.comments}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Workflow Data */}
                              {selectedWorkflow.workflow_data && Object.keys(selectedWorkflow.workflow_data).length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Antragsdetails</h4>
                                  <div className="bg-gray-50 p-3 rounded-lg text-sm max-h-48 overflow-y-auto">
                                    <pre className="whitespace-pre-wrap">
                                      {JSON.stringify(selectedWorkflow.workflow_data, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};