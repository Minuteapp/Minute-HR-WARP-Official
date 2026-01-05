import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const LocationOverviewTable = () => {
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['esg-locations-overview'],
    queryFn: async () => {
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('location, amount')
        .not('location', 'is', null);

      if (!emissions || emissions.length === 0) {
        return [];
      }

      // Gruppiere nach Standort
      const locationData = new Map<string, { emissions: number; count: number }>();
      
      emissions.forEach((e: any) => {
        const location = e.location || 'Unbekannt';
        const existing = locationData.get(location) || { emissions: 0, count: 0 };
        existing.emissions += Number(e.amount) || 0;
        existing.count += 1;
        locationData.set(location, existing);
      });

      // Berechne Durchschnitt für Status-Bestimmung
      const allEmissions = Array.from(locationData.values()).map(l => l.emissions);
      const avgEmissions = allEmissions.length > 0 
        ? allEmissions.reduce((a, b) => a + b, 0) / allEmissions.length 
        : 0;

      return Array.from(locationData.entries()).map(([name, data]) => ({
        name,
        emissions: Math.round(data.emissions * 10) / 10,
        dataPoints: data.count,
        status: data.emissions <= avgEmissions ? 'im-ziel' : 'achtung',
      }));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg font-semibold">Standort-Übersicht</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (locations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg font-semibold">Standort-Übersicht</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Keine Standortdaten vorhanden</p>
            <p className="text-xs text-muted-foreground mt-1">
              Erfassen Sie Emissionen mit Standortangabe
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg font-semibold">Standort-Übersicht</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Standort</TableHead>
              <TableHead className="text-right">Datenpunkte</TableHead>
              <TableHead className="text-right">Emissionen</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell className="text-right">{location.dataPoints}</TableCell>
                <TableCell className="text-right">{location.emissions} t CO₂e</TableCell>
                <TableCell>
                  {location.status === 'im-ziel' ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Unter Ø
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      Über Ø
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                    Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
