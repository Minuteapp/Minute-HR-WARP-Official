import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, Leaf } from 'lucide-react';
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

export const Scope1DataTable = () => {
  const { data: scope1Data = [], isLoading } = useQuery({
    queryKey: ['esg-scope1-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esg_emissions')
        .select('*')
        .eq('scope', 'Scope 1')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scope1Data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Scope 1 Daten</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Erfassen Sie Ihre direkten Emissionen (Heizung, Firmenwagen, etc.) mit dem Button "Neuer Datensatz".
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Datum</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Standort</TableHead>
              <TableHead>Menge</TableHead>
              <TableHead>CO₂-Emissionen</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scope1Data.map((row: any) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  {new Date(row.created_at).toLocaleDateString('de-DE')}
                </TableCell>
                <TableCell>{row.category || '-'}</TableCell>
                <TableCell>{row.location || '-'}</TableCell>
                <TableCell>{row.quantity || '-'} {row.unit || ''}</TableCell>
                <TableCell>
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    {Number(row.amount).toLocaleString('de-DE')} kg CO₂
                  </Badge>
                </TableCell>
                <TableCell>
                  {row.status === 'verified' ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      ✓ Verifiziert
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      ⏳ Ausstehend
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {scope1Data.length} Einträge
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
