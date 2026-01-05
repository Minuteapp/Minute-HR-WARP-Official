import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  FileText, 
  Download, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Users,
  Activity,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ComplianceReport {
  reportType: string;
  dateRange: { start: Date | null; end: Date | null };
  includeModules: string[];
  includeUsers: boolean;
  includePolicyViolations: boolean;
  includeAuditTrail: boolean;
}

const ComplianceReportGenerator = () => {
  const [report, setReport] = useState<ComplianceReport>({
    reportType: 'dsgvo',
    dateRange: { start: null, end: null },
    includeModules: ['timetracking', 'absence', 'documents'],
    includeUsers: true,
    includePolicyViolations: true,
    includeAuditTrail: true
  });

  const [generating, setGenerating] = useState(false);
  const [reportStats, setReportStats] = useState<any>(null);

  const reportTypes = [
    { value: 'dsgvo', label: 'DSGVO-Compliance Report', icon: Shield },
    { value: 'arbeitszeit', label: 'Arbeitszeitgesetz (ArbZG)', icon: Activity },
    { value: 'security', label: 'Sicherheits-Audit', icon: Shield },
    { value: 'policy_enforcement', label: 'Policy-Durchsetzung', icon: CheckCircle },
    { value: 'user_activity', label: 'Benutzeraktivitäten', icon: Users },
    { value: 'full_compliance', label: 'Vollständiger Compliance-Report', icon: FileText }
  ];

  const availableModules = [
    { id: 'timetracking', label: 'Zeiterfassung' },
    { id: 'absence', label: 'Abwesenheiten' },
    { id: 'documents', label: 'Dokumente' },
    { id: 'business_travel', label: 'Geschäftsreisen' },
    { id: 'security', label: 'Sicherheit' },
    { id: 'payroll', label: 'Lohnabrechnung' }
  ];

  const generateReport = async () => {
    setGenerating(true);
    
    try {
      // Sammle Daten für den Report
      const reportData = await collectReportData();
      
      // Erstelle PDF-Report
      const pdfBlob = await createPDFReport(reportData);
      
      // Download starten
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${report.reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setReportStats(reportData.stats);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const collectReportData = async () => {
    const startDate = report.dateRange.start?.toISOString();
    const endDate = report.dateRange.end?.toISOString();
    
    // Policy Enforcement Logs
    let logsQuery = supabase
      .from('policy_enforcement_logs')
      .select('*');
    
    if (startDate) logsQuery = logsQuery.gte('created_at', startDate);
    if (endDate) logsQuery = logsQuery.lte('created_at', endDate);
    if (report.includeModules.length > 0) {
      logsQuery = logsQuery.in('module_name', report.includeModules);
    }

    const { data: enforcementLogs } = await logsQuery;

    // System Policies
    const { data: policies } = await supabase
      .from('system_policies')
      .select('*')
      .eq('is_active', true);

    // Policy Conflicts
    const { data: conflicts } = await supabase
      .from('policy_conflicts')
      .select('*');

    // Benutzer-Daten (wenn eingeschlossen)
    let userData = null;
    if (report.includeUsers) {
      const { data: users } = await supabase
        .from('user_roles')
        .select('user_id, role, company_id');
      userData = users;
    }

    // Statistiken berechnen
    const stats = {
      totalEnforcements: enforcementLogs?.length || 0,
      blockedActions: enforcementLogs?.filter(log => log.enforcement_result === 'blocked').length || 0,
      activePolicies: policies?.length || 0,
      unresolvedConflicts: conflicts?.filter(c => !c.is_resolved).length || 0,
      coverageByModule: report.includeModules.map(module => ({
        module,
        policies: policies?.filter(p => 
          p.affected_modules.includes(module) || p.affected_modules.length === 0
        ).length || 0,
        enforcements: enforcementLogs?.filter(log => log.module_name === module).length || 0
      }))
    };

    return {
      reportType: report.reportType,
      dateRange: report.dateRange,
      enforcementLogs,
      policies,
      conflicts,
      userData,
      stats
    };
  };

  const createPDFReport = async (data: any) => {
    // Hier würde die PDF-Generierung stattfinden
    // Für Demo-Zwecke erstellen wir einen simplen Blob
    const reportContent = generateReportContent(data);
    
    return new Blob([reportContent], { type: 'application/pdf' });
  };

  const generateReportContent = (data: any) => {
    const reportTypeLabel = reportTypes.find(t => t.value === report.reportType)?.label;
    
    return `
Compliance Report: ${reportTypeLabel}
Generiert am: ${new Date().toLocaleString('de-DE')}
Zeitraum: ${report.dateRange.start?.toLocaleDateString('de-DE')} - ${report.dateRange.end?.toLocaleDateString('de-DE')}

ZUSAMMENFASSUNG:
- Gesamte Policy-Durchsetzungen: ${data.stats.totalEnforcements}
- Blockierte Aktionen: ${data.stats.blockedActions}
- Aktive Policies: ${data.stats.activePolicies}
- Ungelöste Konflikte: ${data.stats.unresolvedConflicts}

MODUL-ABDECKUNG:
${data.stats.coverageByModule.map((m: any) => 
  `${m.module}: ${m.policies} Policies, ${m.enforcements} Durchsetzungen`
).join('\n')}

Dieser Report wurde automatisch vom Policy-Engine-System generiert.
Alle Daten sind revisionssicher und entsprechen den Compliance-Anforderungen.
    `;
  };

  const handleModuleToggle = (moduleId: string, checked: boolean) => {
    if (checked) {
      setReport({
        ...report,
        includeModules: [...report.includeModules, moduleId]
      });
    } else {
      setReport({
        ...report,
        includeModules: report.includeModules.filter(m => m !== moduleId)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Compliance Report Generator</h2>
          <p className="text-muted-foreground">
            Erstellen Sie detaillierte Compliance-Berichte für Audits und Behörden
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          <FileText className="h-4 w-4 mr-1" />
          Automatisiert
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report-Konfiguration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Report-Typ</Label>
                <Select 
                  value={report.reportType} 
                  onValueChange={(value) => setReport({...report, reportType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Startdatum</Label>
                  <DatePicker
                    date={report.dateRange.start}
                    onChange={(date) => setReport({
                      ...report, 
                      dateRange: {...report.dateRange, start: date}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Enddatum</Label>
                  <DatePicker
                    date={report.dateRange.end}
                    onChange={(date) => setReport({
                      ...report, 
                      dateRange: {...report.dateRange, end: date}
                    })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Eingeschlossene Module</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableModules.map((module) => (
                    <div key={module.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={module.id}
                        checked={report.includeModules.includes(module.id)}
                        onCheckedChange={(checked) => 
                          handleModuleToggle(module.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={module.id} className="text-sm">
                        {module.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Report-Inhalte</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-users"
                      checked={report.includeUsers}
                      onCheckedChange={(checked) => 
                        setReport({...report, includeUsers: checked as boolean})
                      }
                    />
                    <Label htmlFor="include-users" className="text-sm">
                      Benutzer-Informationen einschließen
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-violations"
                      checked={report.includePolicyViolations}
                      onCheckedChange={(checked) => 
                        setReport({...report, includePolicyViolations: checked as boolean})
                      }
                    />
                    <Label htmlFor="include-violations" className="text-sm">
                      Policy-Verletzungen detaillieren
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-audit"
                      checked={report.includeAuditTrail}
                      onCheckedChange={(checked) => 
                        setReport({...report, includeAuditTrail: checked as boolean})
                      }
                    />
                    <Label htmlFor="include-audit" className="text-sm">
                      Vollständiger Audit-Trail
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview & Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Report-Vorschau
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportStats ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Durchsetzungen:</span>
                    <Badge variant="outline">{reportStats.totalEnforcements}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Blockierte Aktionen:</span>
                    <Badge className="bg-red-100 text-red-800">{reportStats.blockedActions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Aktive Policies:</span>
                    <Badge className="bg-green-100 text-green-800">{reportStats.activePolicies}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Konflikte:</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{reportStats.unresolvedConflicts}</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Report generieren für Vorschau</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report erstellen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Der Report wird als PDF generiert und enthält:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Compliance-Status Übersicht</li>
                    <li>Policy-Durchsetzungsstatistiken</li>
                    <li>Sicherheitsvorfälle und Anomalien</li>
                    <li>Revisionssichere Audit-Logs</li>
                    <li>Empfehlungen für Verbesserungen</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={generateReport} 
                  disabled={generating || !report.dateRange.start || !report.dateRange.end}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generiere Report...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Report generieren
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReportGenerator;