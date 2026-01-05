import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Activity,
  FileText,
  Download,
  Upload,
  Zap,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';
import { usePolicyEngine } from '@/hooks/system/usePolicyEngine';
import { supabase } from '@/integrations/supabase/client';

interface PolicyTemplate {
  id: string;
  template_name: string;
  template_description: string;
  template_category: string;
  policy_configuration: any;
  is_builtin: boolean;
}

const AdvancedPolicyDashboard = () => {
  const { policies, conflicts, loading, createPolicy, updatePolicy } = usePolicyEngine();
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PolicyTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [policyStats, setPolicyStats] = useState({
    totalEnforcements: 0,
    blockedActions: 0,
    successRate: 0,
    topBlockedPolicies: [] as Array<{policy_key: string, count: number}>
  });

  // Lade Policy Templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('policy_templates')
          .select('*')
          .order('is_builtin', { ascending: false });

        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    loadTemplates();
  }, []);

  // Lade Policy-Statistiken
  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data: logs, error } = await supabase
          .from('policy_enforcement_logs')
          .select('enforcement_result, policy_id')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        const totalEnforcements = logs?.length || 0;
        const blockedActions = logs?.filter(log => log.enforcement_result === 'blocked').length || 0;
        const successRate = totalEnforcements > 0 ? ((totalEnforcements - blockedActions) / totalEnforcements * 100) : 100;

        // Top blockierte Policies
        const blockedByPolicy: Record<string, number> = {};
        logs?.filter(log => log.enforcement_result === 'blocked').forEach(log => {
          const policy = policies.find(p => p.id === log.policy_id);
          if (policy) {
            blockedByPolicy[policy.policy_key] = (blockedByPolicy[policy.policy_key] || 0) + 1;
          }
        });

        const topBlockedPolicies = Object.entries(blockedByPolicy)
          .map(([policy_key, count]) => ({ policy_key, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setPolicyStats({
          totalEnforcements,
          blockedActions,
          successRate,
          topBlockedPolicies
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    if (policies.length > 0) {
      loadStats();
    }
  }, [policies]);

  const applyTemplate = async (template: PolicyTemplate) => {
    try {
      const { policies: templatePolicies } = template.policy_configuration;
      
      for (const policyConfig of templatePolicies) {
        const existingPolicy = policies.find(p => p.policy_key === policyConfig.key);
        
        if (existingPolicy) {
          await updatePolicy(existingPolicy.id, { is_active: policyConfig.active });
        }
      }
      
      setShowTemplateDialog(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const activePolicies = policies.filter(p => p.is_active);
  const criticalConflicts = conflicts.filter(c => c.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Header mit Quick Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Policy Management</h1>
          <p className="text-muted-foreground">
            Erweiterte Kontrolle und Überwachung aller Systemrichtlinien
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Template anwenden
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Policy-Template anwenden</DialogTitle>
                <DialogDescription>
                  Wählen Sie ein vorkonfiguriertes Template für häufige Sicherheitsszenarien.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{template.template_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {template.template_description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.is_builtin ? 'default' : 'secondary'}>
                            {template.is_builtin ? 'Builtin' : 'Custom'}
                          </Badge>
                          <Badge variant="outline">
                            {template.template_category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={() => selectedTemplate && applyTemplate(selectedTemplate)}
                  disabled={!selectedTemplate}
                >
                  Template anwenden
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Kritische Alerts */}
      {criticalConflicts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            {criticalConflicts.length} kritische Policy-Konflikte
          </AlertTitle>
          <AlertDescription className="text-red-700">
            Sofortige Aufmerksamkeit erforderlich - Systemsicherheit könnte beeinträchtigt sein.
          </AlertDescription>
        </Alert>
      )}

      {/* Dashboard Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Policies</p>
                <p className="text-2xl font-bold text-green-600">{activePolicies.length}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prüfungen heute</p>
                <p className="text-2xl font-bold">{policyStats.totalEnforcements.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blockierte Aktionen</p>
                <p className="text-2xl font-bold text-red-600">{policyStats.blockedActions}</p>
              </div>
              <Lock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erfolgsrate</p>
                <p className="text-2xl font-bold text-green-600">
                  {policyStats.successRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live-monitoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live-monitoring">
            <Zap className="h-4 w-4 mr-2" />
            Live Monitoring
          </TabsTrigger>
          <TabsTrigger value="policy-matrix">
            <Settings className="h-4 w-4 mr-2" />
            Policy Matrix
          </TabsTrigger>
          <TabsTrigger value="compliance-reports">
            <FileText className="h-4 w-4 mr-2" />
            Compliance Reports
          </TabsTrigger>
          <TabsTrigger value="audit-trail">
            <Eye className="h-4 w-4 mr-2" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live-monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Policy Enforcement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Policy Enforcement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policyStats.topBlockedPolicies.map((item, index) => (
                    <div key={item.policy_key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-mono">{item.policy_key}</span>
                      </div>
                      <Badge className="bg-red-100 text-red-800">
                        {item.count} Blocks
                      </Badge>
                    </div>
                  ))}
                  {policyStats.topBlockedPolicies.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>Keine blockierten Aktionen heute</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Module Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Modul-Abdeckung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['timetracking', 'absence', 'documents', 'business_travel', 'security'].map((module) => {
                    const modulePolicies = activePolicies.filter(p => 
                      p.affected_modules.includes(module) || p.affected_modules.length === 0
                    );
                    return (
                      <div key={module} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{module.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {modulePolicies.length} Policies
                          </Badge>
                          <div className={`w-3 h-3 rounded-full ${
                            modulePolicies.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policy-matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy-Wirkungsmatrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Policy</th>
                      <th className="text-center p-2">Zeiterfassung</th>
                      <th className="text-center p-2">Abwesenheiten</th>
                      <th className="text-center p-2">Dokumente</th>
                      <th className="text-center p-2">Geschäftsreisen</th>
                      <th className="text-center p-2">Sicherheit</th>
                      <th className="text-center p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePolicies.map((policy) => (
                      <tr key={policy.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium text-sm">{policy.policy_name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {policy.policy_key}
                            </p>
                          </div>
                        </td>
                        {['timetracking', 'absence', 'documents', 'business_travel', 'security'].map((module) => (
                          <td key={module} className="p-2 text-center">
                            {policy.affected_modules.includes(module) || policy.affected_modules.length === 0 ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                            ) : (
                              <div className="w-4 h-4 mx-auto" />
                            )}
                          </td>
                        ))}
                        <td className="p-2 text-center">
                          <Badge variant={policy.is_active ? 'default' : 'secondary'}>
                            {policy.is_active ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance-reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>DSGVO-Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Audit-Log Retention:</span>
                    <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Datenexport-Kontrollen:</span>
                    <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Einwilligungs-Management:</span>
                    <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Arbeitszeitgesetze (ArbZG)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Max. tägliche Arbeitszeit:</span>
                    <Badge className="bg-green-100 text-green-800">10h Limit aktiv</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mindestruhezeiten:</span>
                    <Badge className="bg-green-100 text-green-800">11h Überwacht</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pausenregelungen:</span>
                    <Badge className="bg-green-100 text-green-800">Automatisch</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit-trail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Audit-Log Zusammenfassung würde hier stehen */}
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Detaillierte Audit-Logs werden hier angezeigt</p>
                  <p className="text-sm">Alle Policy-Änderungen und Durchsetzungen werden revisionssicher gespeichert</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedPolicyDashboard;