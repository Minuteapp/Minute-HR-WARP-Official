import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  BarChart3,
  Users,
  Building,
  Globe,
  Shield,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  type: 'company_profile' | 'compliance' | 'financials' | 'hr_metrics' | 'audit';
  description: string;
  lastGenerated: string;
  status: 'current' | 'outdated' | 'generating';
  format: string[];
  size?: string;
  aiGenerated?: boolean;
}

interface ReportMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
}

export const CompanyReports = () => {
  const { toast } = useToast();
  
  const [reports] = useState<Report[]>([
    {
      id: '1',
      title: 'Unternehmensprofil',
      type: 'company_profile',
      description: 'Vollständiges Profil für Bewerber und Partner',
      lastGenerated: '2024-01-15',
      status: 'current',
      format: ['PDF', 'Word'],
      size: '2.3 MB',
      aiGenerated: true
    },
    {
      id: '2',
      title: 'Compliance-Bericht',
      type: 'compliance',
      description: 'Rechtliche Konformität und Zertifizierungen',
      lastGenerated: '2024-01-10',
      status: 'current',
      format: ['PDF', 'Excel'],
      size: '1.8 MB'
    },
    {
      id: '3',
      title: 'Company Fact Sheet',
      type: 'company_profile',
      description: 'KI-generierte Zusammenfassung',
      lastGenerated: '2024-01-08',
      status: 'outdated',
      format: ['PDF'],
      size: '0.8 MB',
      aiGenerated: true
    },
    {
      id: '4',
      title: 'HR-Kennzahlen Bericht',
      type: 'hr_metrics',
      description: 'Mitarbeiterstatistiken und Trends',
      lastGenerated: '2024-01-12',
      status: 'current',
      format: ['Excel', 'CSV'],
      size: '1.2 MB'
    },
    {
      id: '5',
      title: 'Audit-Dokumentation',
      type: 'audit',
      description: 'Externe Prüfungsunterlagen',
      lastGenerated: '2023-12-20',
      status: 'generating',
      format: ['PDF'],
      aiGenerated: false
    }
  ]);

  const [metrics] = useState<ReportMetric[]>([
    { label: 'Gesamtmitarbeiter', value: 250, trend: 'up', icon: Users },
    { label: 'Standorte', value: 3, trend: 'stable', icon: Building },
    { label: 'Compliance Score', value: '92%', trend: 'up', icon: Shield },
    { label: 'Länder', value: 2, trend: 'stable', icon: Globe }
  ]);

  const getStatusColor = (status: Report['status']) => {
    const colors = {
      current: 'bg-green-500',
      outdated: 'bg-yellow-500',
      generating: 'bg-blue-500'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Report['status']) => {
    const labels = {
      current: 'Aktuell',
      outdated: 'Veraltet',
      generating: 'Wird erstellt'
    };
    return labels[status];
  };

  const getTypeIcon = (type: Report['type']) => {
    const icons = {
      company_profile: Building,
      compliance: Shield,
      financials: BarChart3,
      hr_metrics: Users,
      audit: FileText
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const handleGenerateReport = (reportId: string) => {
    toast({
      title: "Bericht wird generiert",
      description: "Der Bericht wird im Hintergrund erstellt und steht in Kürze zum Download bereit.",
    });
  };

  const handleDownloadReport = (reportId: string, format: string) => {
    toast({
      title: "Download gestartet",
      description: `Der Bericht wird als ${format} heruntergeladen.`,
    });
  };

  const handleGenerateAIFactSheet = () => {
    toast({
      title: "KI-Fact Sheet wird erstellt",
      description: "Die KI erstellt eine aktuelle Zusammenfassung basierend auf allen Unternehmensdaten.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Berichte & Dokumentation</h3>
          <p className="text-sm text-muted-foreground">
            Generieren Sie automatisch Unternehmensberichte und Dokumentationen.
          </p>
        </div>
        <Button onClick={handleGenerateAIFactSheet} size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          KI-Fact Sheet erstellen
        </Button>
      </div>

      {/* Unternehmens-KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Unternehmenskennzahlen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <metric.icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
                {metric.trend && (
                  <Badge 
                    variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} 
                    {metric.trend === 'up' ? 'Steigend' : metric.trend === 'down' ? 'Fallend' : 'Stabil'}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verfügbare Berichte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Verfügbare Berichte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(report.type)}
                      <h4 className="font-medium">{report.title}</h4>
                      {report.aiGenerated && (
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          KI
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                  <Badge className={getStatusColor(report.status)}>
                    {getStatusLabel(report.status)}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Letzte Erstellung: {report.lastGenerated}</span>
                    </div>
                    {report.size && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4" />
                        <span>Größe: {report.size}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {report.status === 'generating' ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Wird erstellt...</span>
                        <Progress value={65} className="w-20 h-2" />
                      </div>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleGenerateReport(report.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.format.map((format) => (
                          <Button 
                            key={format}
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadReport(report.id, format)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {format}
                          </Button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automatisierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Automatische Generierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Geplante Berichte</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Monatlicher HR-Bericht</span>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aktiv
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Quartalsweise Compliance</span>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aktiv
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Jährlicher Audit-Bericht</span>
                  <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">KI-Empfehlungen</h4>
              <div className="space-y-2">
                <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Aktualisierung empfohlen</p>
                      <p className="text-xs text-muted-foreground">
                        Das Company Fact Sheet sollte aufgrund neuer Standortdaten aktualisiert werden.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Neuer Bericht verfügbar</p>
                      <p className="text-xs text-muted-foreground">
                        Generieren Sie einen ESG-Bericht basierend auf Ihren Compliance-Daten.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};