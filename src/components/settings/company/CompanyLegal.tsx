import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  FileText, 
  Upload, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Eye,
  Download,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LegalDocument {
  id: string;
  title: string;
  type: string;
  validUntil: string;
  status: 'active' | 'expiring' | 'expired';
  complianceScore: number;
  reminderDays: number;
}

interface ComplianceItem {
  id: string;
  title: string;
  type: 'certification' | 'regulation' | 'audit';
  status: 'compliant' | 'warning' | 'critical';
  score: number;
  nextAudit: string;
}

export const CompanyLegal = () => {
  const { toast } = useToast();
  const [documents] = useState<LegalDocument[]>([
    {
      id: '1',
      title: 'DSGVO Datenschutzrichtlinie',
      type: 'Datenschutz',
      validUntil: '2024-12-31',
      status: 'active',
      complianceScore: 95,
      reminderDays: 90
    },
    {
      id: '2',
      title: 'ISO 27001 Zertifikat',
      type: 'Zertifizierung',
      validUntil: '2024-08-30',
      status: 'expiring',
      complianceScore: 88,
      reminderDays: 60
    },
    {
      id: '3',
      title: 'Allgemeine Geschäftsbedingungen',
      type: 'AGB',
      validUntil: '2025-06-15',
      status: 'active',
      complianceScore: 92,
      reminderDays: 30
    }
  ]);

  const [compliance] = useState<ComplianceItem[]>([
    {
      id: '1',
      title: 'DSGVO Compliance',
      type: 'regulation',
      status: 'compliant',
      score: 95,
      nextAudit: '2024-09-15'
    },
    {
      id: '2',
      title: 'ISO 27001',
      type: 'certification',
      status: 'warning',
      score: 78,
      nextAudit: '2024-08-30'
    },
    {
      id: '3',
      title: 'EU-CSRD Berichtspflicht',
      type: 'regulation',
      status: 'critical',
      score: 45,
      nextAudit: '2024-07-30'
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      expiring: 'bg-yellow-500',
      expired: 'bg-red-500',
      compliant: 'bg-green-500',
      warning: 'bg-yellow-500',
      critical: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Aktiv',
      expiring: 'Läuft ab',
      expired: 'Abgelaufen',
      compliant: 'Konform',
      warning: 'Warnung',
      critical: 'Kritisch'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleUploadDocument = () => {
    toast({
      title: "Dokument hochgeladen",
      description: "Das rechtliche Dokument wurde erfolgreich hochgeladen.",
    });
  };

  const overallComplianceScore = Math.round(compliance.reduce((acc, item) => acc + item.score, 0) / compliance.length);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Rechtliche Dokumente & Compliance</h3>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie rechtliche Dokumente, Zertifizierungen und Compliance-Vorgaben.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Dokument hinzufügen
        </Button>
      </div>

      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{overallComplianceScore}%</div>
              <p className="text-sm text-muted-foreground">Gesamt-Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {compliance.filter(c => c.status === 'compliant').length}
              </div>
              <p className="text-sm text-muted-foreground">Konform</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {compliance.filter(c => c.status === 'warning').length}
              </div>
              <p className="text-sm text-muted-foreground">Warnungen</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {compliance.filter(c => c.status === 'critical').length}
              </div>
              <p className="text-sm text-muted-foreground">Kritisch</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rechtliche Dokumente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rechtliche Dokumente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium">{doc.title}</h4>
                    <p className="text-sm text-muted-foreground">{doc.type}</p>
                  </div>
                  <Badge className={getStatusColor(doc.status)}>
                    {getStatusLabel(doc.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compliance-Score</span>
                    <span>{doc.complianceScore}%</span>
                  </div>
                  <Progress value={doc.complianceScore} className="h-2" />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Gültig bis: {doc.validUntil}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <Button onClick={handleUploadDocument} variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Neues Dokument hochladen
            </Button>
          </CardContent>
        </Card>

        {/* Compliance-Vorgaben */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance-Vorgaben
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {compliance.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compliance-Score</span>
                    <span>{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Nächstes Audit: {item.nextAudit}
                  </span>
                  {item.status === 'critical' && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  {item.status === 'compliant' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Erinnerungen und Aktionen */}
      <Card>
        <CardHeader>
          <CardTitle>Anstehende Erinnerungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">ISO 27001 Zertifikat läuft in 30 Tagen ab</p>
                  <p className="text-sm text-muted-foreground">Erneuerung erforderlich bis 30.08.2024</p>
                </div>
              </div>
              <Button size="sm">Bearbeiten</Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">EU-CSRD Berichtspflicht kritisch</p>
                  <p className="text-sm text-muted-foreground">Sofortige Maßnahmen erforderlich</p>
                </div>
              </div>
              <Button size="sm" variant="destructive">Jetzt handeln</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};