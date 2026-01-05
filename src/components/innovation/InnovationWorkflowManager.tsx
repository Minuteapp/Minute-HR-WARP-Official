import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Settings, 
  Workflow, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InnovationWorkflow {
  id: string;
  idea_id: string;
  workflow_type: string;
  current_step: number;
  total_steps: number;
  workflow_status: string;
  approval_steps: any[];
  comments: any[];
  escalation_rules: any[];
}

interface InnovationApproval {
  id: string;
  idea_id: string;
  reviewer_id: string;
  reviewer_name: string;
  approval_stage: string;
  status: string;
  decision: string;
  feedback?: string;
  ai_score?: number;
  created_at: string;
}

interface InnovationAIInsight {
  id: string;
  idea_id: string;
  insight_type: string;
  confidence_score: number;
  insight_data: any;
  recommendations: string[];
  similar_ideas: string[];
  created_at: string;
  analysis_version: string;
}

export const InnovationWorkflowManager: React.FC = () => {
  const [workflows, setWorkflows] = useState<InnovationWorkflow[]>([]);
  const [approvals, setApprovals] = useState<InnovationApproval[]>([]);
  const [aiInsights, setAiInsights] = useState<InnovationAIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [workflowsRes, approvalsRes, insightsRes] = await Promise.all([
        supabase.from('innovation_workflows').select('*').order('created_at', { ascending: false }),
        supabase.from('innovation_approvals').select('*').order('created_at', { ascending: false }),
        supabase.from('innovation_ai_insights').select('*').order('created_at', { ascending: false })
      ]);

      if (workflowsRes.data) setWorkflows(workflowsRes.data);
      if (approvalsRes.data) setApprovals(approvalsRes.data);
      if (insightsRes.data) setAiInsights(insightsRes.data);
    } catch (error) {
      toast({
        title: "Fehler beim Laden",
        description: "Daten konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'approved': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Innovation Workflow Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="workflows" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="approvals">Genehmigungen</TabsTrigger>
              <TabsTrigger value="ai-insights">KI-Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="space-y-4">
              <div className="grid gap-4">
                {workflows.map((workflow) => (
                  <Card key={workflow.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Workflow className="h-4 w-4" />
                        <span className="font-medium">{workflow.workflow_type}</span>
                      </div>
                      <Badge className={getWorkflowStatusColor(workflow.workflow_status)}>
                        {workflow.workflow_status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Fortschritt:</span>
                        <span>{workflow.current_step}/{workflow.total_steps} Schritte</span>
                      </div>
                      <Progress 
                        value={(workflow.current_step / workflow.total_steps) * 100} 
                        className="h-2"
                      />
                    </div>

                    {workflow.approval_steps?.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium">Genehmigungsschritte:</span>
                        <div className="mt-1 space-y-1">
                          {workflow.approval_steps.map((step, index) => (
                            <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                              {step.name} - {step.status}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
                
                {workflows.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Keine Workflows gefunden
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="approvals" className="space-y-4">
              <div className="grid gap-4">
                {approvals.map((approval) => (
                  <Card key={approval.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getApprovalStatusIcon(approval.status)}
                        <span className="font-medium">{approval.reviewer_name}</span>
                      </div>
                      <Badge variant="outline">{approval.approval_stage}</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Entscheidung:</span>
                        <span className={`font-medium ${
                          approval.decision === 'approved' ? 'text-green-600' : 
                          approval.decision === 'rejected' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {approval.decision}
                        </span>
                      </div>
                      
                      {approval.ai_score && (
                        <div className="flex items-center justify-between">
                          <span>KI-Score:</span>
                          <span className="font-medium">{approval.ai_score}/100</span>
                        </div>
                      )}
                      
                      {approval.feedback && (
                        <div className="mt-2">
                          <span className="font-medium">Feedback:</span>
                          <p className="text-gray-600 mt-1">{approval.feedback}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                
                {approvals.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Keine Genehmigungen gefunden
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-4">
              <div className="grid gap-4">
                {aiInsights.map((insight) => (
                  <Card key={insight.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{insight.insight_type}</span>
                      </div>
                      <Badge variant="outline">
                        Konfidenz: {Math.round(insight.confidence_score * 100)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {insight.recommendations?.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Empfehlungen:</span>
                          <ul className="mt-1 text-sm space-y-1">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <TrendingUp className="h-3 w-3 text-blue-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {insight.similar_ideas?.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Ähnliche Ideen:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {insight.similar_ideas.map((ideaId, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                Idee #{ideaId.slice(0, 8)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {insight.insight_data && (
                        <div>
                          <span className="text-sm font-medium">Datenanalyse:</span>
                          <div className="mt-1 text-xs bg-gray-50 p-2 rounded">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(insight.insight_data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                
                {aiInsights.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Keine KI-Insights gefunden
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};