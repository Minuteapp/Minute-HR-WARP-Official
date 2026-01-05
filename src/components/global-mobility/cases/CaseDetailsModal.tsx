
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CaseTypeBadge } from './CaseTypeBadge';
import { CaseStatusBadge } from './CaseStatusBadge';
import { GlobalMobilityRequest } from '@/types/global-mobility';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { User, MapPin, Calendar, DollarSign, Users, FileText } from "lucide-react";

interface CaseDetailsModalProps {
  request: GlobalMobilityRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CaseDetailsModal = ({ request, open, onOpenChange }: CaseDetailsModalProps) => {
  if (!request) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: de });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Fall: {request.id.substring(0, 8).toUpperCase()}</span>
            <CaseStatusBadge status={request.status} />
            <CaseTypeBadge type={request.request_type} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title and Description */}
          <div>
            <h3 className="text-lg font-semibold">{request.title}</h3>
            {request.description && (
              <p className="text-muted-foreground mt-1">{request.description}</p>
            )}
          </div>

          <Separator />

          {/* Mitarbeiter Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Mitarbeiter-Informationen
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Mitarbeiter-ID:</span>
                <span className="ml-2 font-medium">{request.employee_id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Priorität:</span>
                <Badge variant="outline" className="ml-2">
                  {request.priority === 'urgent' ? 'Dringend' : 
                   request.priority === 'high' ? 'Hoch' : 
                   request.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Standorte */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Standorte
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Aktueller Standort:</span>
                <span className="ml-2 font-medium">{request.current_location || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Zielstandort:</span>
                <span className="ml-2 font-medium">{request.destination_location || '-'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Zeitraum */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Zeitraum
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Startdatum:</span>
                <span className="ml-2 font-medium">{formatDate(request.start_date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Enddatum:</span>
                <span className="ml-2 font-medium">{formatDate(request.end_date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Eingereicht am:</span>
                <span className="ml-2 font-medium">{formatDate(request.submitted_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Genehmigt am:</span>
                <span className="ml-2 font-medium">{formatDate(request.approved_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Kosten */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Kosten
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Geschätzte Kosten:</span>
                <span className="ml-2 font-medium">{formatCurrency(request.estimated_cost)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tatsächliche Kosten:</span>
                <span className="ml-2 font-medium">{formatCurrency(request.actual_cost)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Business Justification */}
          {request.business_justification && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Geschäftliche Begründung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{request.business_justification}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
