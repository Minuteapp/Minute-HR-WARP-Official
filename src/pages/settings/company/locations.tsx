import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LocationsPage() {
  const navigate = useNavigate();

  const locations = [
    {
      id: '1',
      name: 'Hauptsitz',
      type: 'headquarters',
      address: 'Musterstraße 123, 12345 Musterstadt',
      status: 'active',
      employees: 45
    },
    {
      id: '2', 
      name: 'Niederlassung Nord',
      type: 'branch',
      address: 'Nordweg 456, 54321 Nordstadt',
      status: 'active',
      employees: 23
    }
  ];

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
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Standorte & Niederlassungen</h1>
              <p className="text-muted-foreground mt-2">
                Verwaltung von Hauptsitz, Niederlassungen und Betriebsstätten
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Standortübersicht</h2>
            <p className="text-muted-foreground">Verwalten Sie alle Unternehmensstandorte</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Standort
          </Button>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card key={location.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                    <CardDescription>{location.address}</CardDescription>
                  </div>
                  <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                    {location.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Typ:</span>
                    <span>{location.type === 'headquarters' ? 'Hauptsitz' : 'Niederlassung'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mitarbeiter:</span>
                    <span>{location.employees}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State für weitere Module */}
        <Card>
          <CardHeader>
            <CardTitle>Weitere Konfiguration</CardTitle>
            <CardDescription>
              Diese Seite befindet sich noch in der Entwicklung. Weitere Funktionen folgen bald.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Erweiterte Standortverwaltung in Vorbereitung</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}