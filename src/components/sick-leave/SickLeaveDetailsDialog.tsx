import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarDays, 
  Building2, 
  MapPin, 
  Hash, 
  FileText,
  Mail,
  Phone,
  Download,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp
} from 'lucide-react';
import type { SickLeave } from '@/types/sick-leave';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface SickLeaveDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sickLeave: SickLeave | null;
  canApprove?: boolean;
  onApprove?: (sickLeave: SickLeave) => void;
  onReject?: (sickLeave: SickLeave) => void;
}

export const SickLeaveDetailsDialog = ({
  open,
  onOpenChange,
  sickLeave,
  canApprove = false,
  onApprove,
  onReject
}: SickLeaveDetailsDialogProps) => {
  if (!sickLeave) return null;

  const getDaysCount = (startDate: string, endDate?: string) => {
    if (!endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  };

  const getStatusBadge = (status: string, hasDoctor: boolean) => {
    if (status === 'approved') {
      return <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">✓ Genehmigt</Badge>;
    }
    if (status === 'pending' && !hasDoctor) {
      return <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">! Attest erforderlich</Badge>;
    }
    return <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200">⏱ Ausstehend</Badge>;
  };

  const days = getDaysCount(sickLeave.start_date, sickLeave.end_date);
  const startDateFormatted = format(parseISO(sickLeave.start_date), 'dd. MMMM yyyy', { locale: de });
  const endDateFormatted = sickLeave.end_date 
    ? format(parseISO(sickLeave.end_date), 'dd. MMMM yyyy', { locale: de })
    : 'Offen';
  const submittedDate = format(parseISO(sickLeave.created_at), 'dd. MMMM yyyy, HH:mm', { locale: de }) + ' Uhr';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Krankmeldungs-Details</DialogTitle>
          <DialogDescription>
            Vollständige Informationen zur Krankmeldung #{sickLeave.id.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Employee Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-600 text-white text-lg">
                  {sickLeave.employee_name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{sickLeave.employee_name || 'Unbekannt'}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{sickLeave.department || 'Keine Abteilung'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Berlin</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="w-4 h-4" />
                    <span>MA-{sickLeave.id?.substring(0, 6) || '------'}</span>
                  </div>
                </div>
              </div>

              <div>
                {getStatusBadge(sickLeave.status, sickLeave.has_contacted_doctor || false)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Absence Period */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold">Abwesenheitszeitraum</h4>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Von</span>
                  <span className="font-medium">{startDateFormatted}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Bis</span>
                  <span className="font-medium">{endDateFormatted}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Gesamtdauer</span>
                  <span className="font-medium">{days} Tag{days !== 1 ? 'e' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold">Meldungsinformationen</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Eingereicht am</span>
                <span className="font-medium">{submittedDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Attest erforderlich</span>
                <span className="font-medium">{days > 3 ? 'Ja' : 'Nein'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block mb-1">Attest eingereicht</span>
                <span className={`font-medium ${sickLeave.has_contacted_doctor ? 'text-green-600' : 'text-red-600'}`}>
                  {sickLeave.has_contacted_doctor ? '✓ Ja' : '✗ Nein'}
                </span>
              </div>
            </div>
          </div>

          {/* Attached Certificate */}
          {sickLeave.has_contacted_doctor && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Angehängtes Attest</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Arbeitsunfähigkeitsbescheinigung.pdf</p>
                    <p className="text-xs text-muted-foreground">284 KB</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Herunterladen
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          {sickLeave.description && (
            <div>
              <h4 className="font-semibold mb-2">Grund</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
                {sickLeave.description}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-3">Kontaktinformationen</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600">{sickLeave.employee_name?.toLowerCase().replace(' ', '.')}@unternehmen.de</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>Nicht angegeben</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold">Statistiken</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-muted-foreground block mb-1">Krankheitsfälle 2025</span>
                <span className="text-xl font-bold text-blue-700">—</span>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <span className="text-muted-foreground block mb-1">Team-Auswirkung</span>
                <span className="text-xl font-bold text-orange-700">
                  {days > 5 ? 'Hoch' : days > 2 ? 'Mittel' : 'Niedrig'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Approval Buttons */}
        {canApprove && sickLeave.status === 'pending' && (
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              onClick={() => onReject?.(sickLeave)}
              variant="outline"
              className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Ablehnen
            </Button>
            <Button
              onClick={() => onApprove?.(sickLeave)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Genehmigen
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
