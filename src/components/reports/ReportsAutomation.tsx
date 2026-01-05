
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Bell, Filter, Edit, ArrowRight, Clock } from "lucide-react";

const ReportsAutomation = () => {
  const automationRules = [
    {
      id: 1,
      title: 'Schulungsberichte',
      description: 'Automatische Generierung bei mehr als 50 Teilnehmern',
      condition: 'Teilnehmerzahl > 50', // Fixed: Use text representation
      action: 'Bericht an HR senden'
    },
    {
      id: 2, 
      title: 'Projektkosten',
      description: 'Bericht bei Überschreitung des Budgets',
      condition: 'Budget ueberschritten', // Fixed: Use text instead of symbol
      action: 'Bericht an Geschäftsführung'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Berichtsautomatisierung</h2>
          <p className="text-sm text-muted-foreground">
            Automatisieren Sie die Erstellung und Verteilung von Berichten
          </p>
        </div>
        <Button>
          Neue Automatisierung
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Automatisierungsstatus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 border rounded-lg bg-green-50">
                <CheckCircle2 className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <h4 className="font-medium">Automatisierung aktiv</h4>
                  <p className="text-sm text-muted-foreground">
                    Alle automatisierten Berichte werden planmäßig generiert und verteilt
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-sm text-muted-foreground">Aktive Automatisierungen</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">48</div>
                  <p className="text-sm text-muted-foreground">Berichte diesen Monat</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">8.5h</div>
                  <p className="text-sm text-muted-foreground">Gesparte Zeit</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benachrichtigungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Bell className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Monatsbericht</h4>
                  <p className="text-xs text-muted-foreground">
                    Wird morgen automatisch generiert
                  </p>
                  <Button variant="link" className="h-auto p-0 text-xs">
                    Vorschau anzeigen
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Fehlgeschlagene Automatisierung</h4>
                  <p className="text-xs text-muted-foreground">
                    Projektbericht konnte nicht generiert werden
                  </p>
                  <Button variant="link" className="h-auto p-0 text-xs">
                    Details anzeigen
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Geplante Berichte</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily">
            <TabsList className="mb-4">
              <TabsTrigger value="daily">Täglich</TabsTrigger>
              <TabsTrigger value="weekly">Wöchentlich</TabsTrigger>
              <TabsTrigger value="monthly">Monatlich</TabsTrigger>
              <TabsTrigger value="quarterly">Quartalsweise</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Täglicher Aktivitätsbericht</h4>
                  <p className="text-sm text-muted-foreground">
                    Zusammenfassung der täglichen Aktivitäten
                  </p>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Jeden Tag um 18:00 Uhr
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" /> Bearbeiten
                  </Button>
                  <Switch checked={true} />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Vertriebsübersicht</h4>
                  <p className="text-sm text-muted-foreground">
                    Tägliche Verkaufszahlen und Leads
                  </p>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Jeden Tag um 8:00 Uhr
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" /> Bearbeiten
                  </Button>
                  <Switch checked={true} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="weekly" className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Wöchentlicher Projektfortschritt</h4>
                  <p className="text-sm text-muted-foreground">
                    Übersicht über den Fortschritt aller aktiven Projekte
                  </p>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Jeden Freitag um 15:00 Uhr
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" /> Bearbeiten
                  </Button>
                  <Switch checked={true} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Monatliche Finanzübersicht</h4>
                  <p className="text-sm text-muted-foreground">
                    Finanzielle Leistung und Prognosen
                  </p>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Am 1. jedes Monats
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" /> Bearbeiten
                  </Button>
                  <Switch checked={true} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quarterly" className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Quartalsweise Leistungsanalyse</h4>
                  <p className="text-sm text-muted-foreground">
                    Umfassende Analyse der Unternehmensleistung
                  </p>
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Am 15. des ersten Monats jedes Quartals
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" /> Bearbeiten
                  </Button>
                  <Switch checked={true} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intelligente Automatisierungsregeln</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationRules.map((rule) => (
              <div 
                key={rule.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{rule.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {rule.description}
                  </p>
                  <div className="mt-2 text-xs">
                    <span className="font-semibold">Bedingung:</span> {rule.condition}
                  </div>
                  <div className="mt-1 text-xs">
                    <span className="font-semibold">Aktion:</span> {rule.action}
                  </div>
                </div>
                <Switch />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsAutomation;
