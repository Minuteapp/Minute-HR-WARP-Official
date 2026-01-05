import React from 'react';
import { CompanyDetails } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface CompanyBillingTabProps {
  company: CompanyDetails;
}

export const CompanyBillingTab: React.FC<CompanyBillingTabProps> = ({ company }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Rechnungshistorie</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportieren
        </Button>
      </div>

      {/* Status Karten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800">Bezahlt (gesamt)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">€0,00</div>
            <div className="text-xs text-green-700 mt-1">0 Rechnungen</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">Ausstehend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">€0,00</div>
            <div className="text-xs text-blue-700 mt-1">0 Rechnungen</div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-800">Überfällig</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">€0,00</div>
            <div className="text-xs text-red-700 mt-1">0 Rechnungen</div>
          </CardContent>
        </Card>
      </div>

      {/* Rechnungstabelle */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rechnungsnr.</TableHead>
                <TableHead>Rechnungsdatum</TableHead>
                <TableHead>Fälligkeitsdatum</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bezahlt am</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Keine Rechnungen vorhanden
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bankverbindung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Hinterlegte Bankverbindung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm">DE89 3704 0044 0532 0130 00</div>
        </CardContent>
      </Card>
    </div>
  );
};
