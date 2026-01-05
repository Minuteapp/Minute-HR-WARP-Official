import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Pencil, Trash2, Plane } from 'lucide-react';
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

const categories = [
  { value: 'all', label: 'Alle Kategorien' },
  { value: 'cat6', label: 'Kat. 6 - Geschäftsreisen' },
  { value: 'cat7', label: 'Kat. 7 - Pendlerverkehr' },
  { value: 'cat1', label: 'Kat. 1 - Eingekaufte Güter' },
  { value: 'cat4', label: 'Kat. 4 - Transport (upstream)' },
  { value: 'cat11', label: 'Kat. 11 - Nutzung verkaufter Produkte' },
];

export const Scope3DataTable = () => {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: scope3Data = [], isLoading } = useQuery({
    queryKey: ['esg-scope3-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esg_emissions')
        .select('*')
        .eq('scope', 'Scope 3')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Kategorie:</span>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (scope3Data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Kategorie:</span>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Kategorie wählen" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <Plane className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Scope 3 Daten</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Erfassen Sie Ihre indirekten Emissionen (Geschäftsreisen, Lieferkette, etc.) mit dem Button "Neuer Datensatz".
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Kategorie:</span>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Kategorie wählen" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
              {scope3Data.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {new Date(row.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      {row.category || 'Scope 3'}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.location || '-'}</TableCell>
                  <TableCell>{row.quantity || '-'} {row.unit || ''}</TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
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
              {scope3Data.length} Einträge
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
