
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { CaseTypeBadge } from './CaseTypeBadge';
import { CaseStatusBadge } from './CaseStatusBadge';
import { GlobalMobilityRequest } from '@/types/global-mobility';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface CasesTableProps {
  requests: GlobalMobilityRequest[];
  onViewDetails: (request: GlobalMobilityRequest) => void;
}

export const CasesTable = ({ requests, onViewDetails }: CasesTableProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fall-ID</TableHead>
            <TableHead>Mitarbeiter</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Von → Nach</TableHead>
            <TableHead>Zeitraum</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Kosten</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length > 0 ? (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-mono text-sm">
                  {request.id.substring(0, 8).toUpperCase()}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{request.title}</div>
                    <div className="text-sm text-muted-foreground">{request.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <CaseTypeBadge type={request.request_type} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {request.current_location || '-'} → {request.destination_location || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                  </div>
                </TableCell>
                <TableCell>
                  <CaseStatusBadge status={request.status} />
                </TableCell>
                <TableCell>{formatCurrency(request.estimated_cost)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(request)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Keine Entsendungen gefunden
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
