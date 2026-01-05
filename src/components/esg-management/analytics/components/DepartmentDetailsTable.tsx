import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const getProKopfColor = (value: number) => {
  if (value < 2.5) return 'text-green-600 bg-green-50';
  if (value < 3.5) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

export const DepartmentDetailsTable = () => {
  const { data: departmentData = [], isLoading } = useQuery({
    queryKey: ['esg-department-details'],
    queryFn: async () => {
      const { data: emissions } = await supabase
        .from('esg_emissions')
        .select('*');

      if (!emissions || emissions.length === 0) {
        return [];
      }

      // Gruppiere nach Abteilung
      const departmentMap = new Map<string, { total: number; count: number; categories: Set<string> }>();
      
      emissions.forEach((e: any) => {
        const department = e.department || 'Unbekannt';
        
        if (!departmentMap.has(department)) {
          departmentMap.set(department, { total: 0, count: 0, categories: new Set() });
        }
        
        const current = departmentMap.get(department)!;
        current.total += Number(e.amount) || 0;
        current.count += 1;
        if (e.category) current.categories.add(e.category);
      });

      return Array.from(departmentMap.entries())
        .map(([abteilung, data]) => {
          const proKopf = data.count > 0 ? data.total / data.count : 0;
          const haupttreiber = data.categories.size > 0 
            ? Array.from(data.categories).slice(0, 2).join(', ')
            : 'Keine Kategorie';
          
          return {
            abteilung,
            datensaetze: data.count,
            gesamtCO2: `${Math.round(data.total)} t`,
            proKopf: Math.round(proKopf * 100) / 100,
            haupttreiber,
          };
        })
        .sort((a, b) => b.datensaetze - a.datensaetze);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Abteilungs-Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (departmentData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Abteilungs-Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Keine Abteilungsdaten vorhanden</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Abteilungs-Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-semibold">ABTEILUNG</TableHead>
              <TableHead className="text-xs font-semibold">DATENSÄTZE</TableHead>
              <TableHead className="text-xs font-semibold">GESAMT CO₂E</TableHead>
              <TableHead className="text-xs font-semibold">PRO DATENSATZ</TableHead>
              <TableHead className="text-xs font-semibold">KATEGORIEN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departmentData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.abteilung}</TableCell>
                <TableCell>{row.datensaetze}</TableCell>
                <TableCell>{row.gesamtCO2}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-sm ${getProKopfColor(row.proKopf)}`}>
                    {row.proKopf} t
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.haupttreiber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
