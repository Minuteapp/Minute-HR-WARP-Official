import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Upload, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ComplianceDocsPage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings/company")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Unternehmenseinstellungen
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Compliance-Dokumentation</h1>
              <p className="text-muted-foreground mt-2">
                Unternehmensrelevante Compliance-Dokumente und Zertifikate
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Dokumente verwalten</h2>
            <p className="text-muted-foreground">Halten Sie Ihre Compliance-Dokumente aktuell</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dokument hinzufügen
          </Button>
        </div>

        {/* Document Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Zertifikate</CardTitle>
              <CardDescription>ISO, SOC und andere Zertifizierungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Noch keine Zertifikate hochgeladen</p>
                <Button variant="outline" className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Zertifikat hochladen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lizenzen & Genehmigungen</CardTitle>
              <CardDescription>Betriebserlaubnisse und Gewerbeanmeldungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Gewerbeanmeldung</div>
                    <div className="text-sm text-muted-foreground">Gültig bis: 31.12.2025</div>
                  </div>
                  <Badge variant="default">Aktiv</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Weitere Lizenz hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unternehmensrichtlinien</CardTitle>
              <CardDescription>Compliance-Richtlinien und Verfahrensanweisungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Noch keine Richtlinien definiert</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Richtlinie erstellen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit-Dokumentation</CardTitle>
              <CardDescription>Prüfberichte und Audit-Nachweise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Noch keine Audit-Dokumente</p>
                <Button variant="outline" className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Dokument hochladen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance-Status</CardTitle>
            <CardDescription>
              Übersicht über den aktuellen Compliance-Status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1</div>
                <div className="text-sm text-muted-foreground">Aktive Lizenzen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-muted-foreground">Ablaufende Dokumente</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-muted-foreground">Zertifizierungen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">0</div>
                <div className="text-sm text-muted-foreground">Offene Audits</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}