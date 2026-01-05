import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SubsidiariesPage() {
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
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tochterunternehmen & Konzernstruktur</h1>
              <p className="text-muted-foreground mt-2">
                Verwaltung von Tochtergesellschaften und Konzernverbund
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Konzernstruktur</h2>
            <p className="text-muted-foreground">Verwalten Sie Tochtergesellschaften und Beteiligungen</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tochtergesellschaft hinzufügen
          </Button>
        </div>

        {/* Empty State */}
        <Card>
          <CardHeader>
            <CardTitle>Tochtergesellschaften</CardTitle>
            <CardDescription>
              Noch keine Tochtergesellschaften konfiguriert.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Keine Tochtergesellschaften</h3>
              <p className="mb-4">Fügen Sie Ihre erste Tochtergesellschaft hinzu, um die Konzernstruktur zu definieren.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Erste Tochtergesellschaft hinzufügen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rechtliche Einheiten</CardTitle>
              <CardDescription>Tochtergesellschaften und Beteiligungen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Definieren Sie alle rechtlichen Einheiten Ihres Konzerns.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Beteiligungsstrukturen</CardTitle>
              <CardDescription>Eigentumsverhältnisse und Anteile</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verwalten Sie Beteiligungen und Eigentumsverhältnisse.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Konsolidierungskreis</CardTitle>
              <CardDescription>Welche Einheiten fließen in Berichte ein</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Bestimmen Sie den Konsolidierungskreis für Ihre Berichte.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Konzernverrechnung</CardTitle>
              <CardDescription>Interne Verrechnungspreise</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Konfigurieren Sie interne Verrechnungspreise zwischen Konzerngesellschaften.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}