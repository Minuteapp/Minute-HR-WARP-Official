import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, MapPin, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const getBewertungBadge = (bewertung: string) => {
  if (bewertung === 'gut') {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
        <TrendingDown className="h-3 w-3" />
        Gut
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
      <TrendingUp className="h-3 w-3" />
      Optimierbar
    </Badge>
  );
};

const getProKopfColor = (value: number) => {
  if (value < 2.5) return 'text-green-600 bg-green-50';
  if (value < 3.5) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

export const LocationDetailsTable = () => {
  const { data: locationData = [], isLoading } = useQuery({
    queryKey: ['esg-location-details'],
    queryFn: async () => {
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('*');

      if (!emissions || emissions.length === 0) {
        return [];
      }

      // Gruppiere nach Standort
      const locationMap = new Map<string, { total: number; count: number }>();
      
      emissions.forEach((e: any) => {
        const location = e.location || 'Unbekannt';
        
        if (!locationMap.has(location)) {
          locationMap.set(location, { total: 0, count: 0 });
        }
        
        const current = locationMap.get(location)!;
        current.total += Number(e.amount) || 0;
        current.count += 1;
      });

      return Array.from(locationMap.entries())
        .map(([standort, data]) => {
          const proKopf = data.count > 0 ? data.total / data.count : 0;
          return {
            standort,
            datensaetze: data.count,
            gesamtCO2: `${Math.round(data.total)} t`,
            proKopf: Math.round(proKopf * 100) / 100,
            bewertung: proKopf < 2.5 ? 'gut' : 'optimierbar',
          };
        })
        .sort((a, b) => b.datensaetze - a.datensaetze);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Standort-Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (locationData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Standort-Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <MapPin className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Keine Standortdaten vorhanden</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Standort-Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-semibold">STANDORT</TableHead>
              <TableHead className="text-xs font-semibold">DATENSÄTZE</TableHead>
              <TableHead className="text-xs font-semibold">GESAMT CO₂E</TableHead>
              <TableHead className="text-xs font-semibold">PRO DATENSATZ</TableHead>
              <TableHead className="text-xs font-semibold">BEWERTUNG</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locationData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.standort}</TableCell>
                <TableCell>{row.datensaetze}</TableCell>
                <TableCell>{row.gesamtCO2}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-sm ${getProKopfColor(row.proKopf)}`}>
                    {row.proKopf} t
                  </span>
                </TableCell>
                <TableCell>{getBewertungBadge(row.bewertung)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
