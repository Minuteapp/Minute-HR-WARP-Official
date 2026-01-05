import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, MapPin, Mail, Phone, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AbsenceRequest } from '@/types/absence.types';

interface AbsenceDetailDialogProps {
  request: AbsenceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AbsenceDetailDialog = ({ request, open, onOpenChange }: AbsenceDetailDialogProps) => {
  if (!request) return null;

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      vacation: 'Urlaub',
      sick_leave: 'Krankmeldung',
      sick: 'Krankmeldung',
      parental: 'Elternzeit',
      business_trip: 'Dienstreise',
      other: 'Sonstiges'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: 'bg-warning/10 text-warning', text: 'Ausstehend' },
      approved: { color: 'bg-success/10 text-success', text: 'Genehmigt' },
      rejected: { color: 'bg-destructive/10 text-destructive', text: 'Abgelehnt' }
    };
    const variant = variants[status as keyof typeof variants] || variants.pending;
    return { ...variant };
  };

  const initials = request.employee_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'MA';

  const statusBadge = getStatusBadge(request.status);

  // Berechne Dauer in Tagen
  const startDate = new Date(request.start_date);
  const endDate = new Date(request.end_date);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <span className="sr-only">Schließen</span>
          ✕
        </button>

        <div className="space-y-6 pt-4">
          {/* Header mit Avatar und Name */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 bg-primary">
              <AvatarFallback className="text-primary-foreground text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{request.employee_name || 'Unbekannter Mitarbeiter'}</h2>
              <p className="text-sm text-muted-foreground">MA-0001 • Senior Entwickler</p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                  {getTypeBadge(request.type)}
                </Badge>
                <Badge className={`${statusBadge.color} hover:${statusBadge.color}`}>
                  {statusBadge.text}
                </Badge>
              </div>
            </div>
          </div>

          {/* Mitarbeiterinformationen */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Mitarbeiterinformationen
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Abteilung</p>
                    <p className="font-medium">{request.department || 'Entwicklung'}</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Standort</p>
                    <p className="font-medium">Berlin</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">E-Mail</p>
                    <p className="font-medium text-primary">
                      {request.employee_name?.toLowerCase().replace(' ', '.') || 'max.mueller'}@minute-hr.de
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Telefon</p>
                    <p className="font-medium">+49 150 1000000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Abwesenheitsdetails */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Abwesenheitsdetails
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Von</p>
                <p className="font-medium">{format(startDate, 'dd.MM.yyyy', { locale: de })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bis</p>
                <p className="font-medium">{format(endDate, 'dd.MM.yyyy', { locale: de })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dauer</p>
                <p className="font-medium">{duration} {duration === 1 ? 'Tag' : 'Tage'}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Grund</p>
              <p className="font-medium">
                {request.reason || 'Geplanter Jahresurlaub - Familienzeit'}
              </p>
            </div>
            {request.substitute_name && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Vertretung</p>
                <p className="font-medium">{request.substitute_name}</p>
              </div>
            )}
          </div>

          {/* Notizen */}
          {request.reason && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-warning text-lg">⚠️</span>
                <div className="text-sm text-foreground">
                  <p className="font-medium">Notizen</p>
                  <p className="mt-1">Dringend - wichtige Projekte müssen übergeben werden</p>
                </div>
              </div>
            </div>
          )}

          {/* Genehmigungsverlauf */}
          {request.status === 'approved' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Genehmigungsverlauf (3-Stufen-Workflow)
              </h3>

              {/* Stufe 1 */}
              <div className="flex items-start gap-3 bg-success/10 border border-success/20 rounded-lg p-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">Stufe 1: Lisa Wagner (Teamleiter)</p>
                    <Badge className="bg-success/10 text-success hover:bg-success/10">Genehmigt</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {request.approved_at 
                      ? format(new Date(request.approved_at), 'dd.MM.yyyy HH:mm', { locale: de })
                      : '10.10.2025 14:23'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Genehmigt - Vertretung ist organisiert</p>
                </div>
              </div>

              {/* Stufe 2 */}
              <div className="flex items-start gap-3 bg-success/10 border border-success/20 rounded-lg p-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">Stufe 2: Thomas Schmidt (HR Admin)</p>
                    <Badge className="bg-success/10 text-success hover:bg-success/10">Genehmigt</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">11.10.2025 09:15</p>
                  <p className="text-xs text-muted-foreground mt-1">Urlaubsantrag geprüft und freigegeben</p>
                </div>
              </div>

              {/* Stufe 3 */}
              <div className="flex items-start gap-3 bg-success/10 border border-success/20 rounded-lg p-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">Stufe 3: Sandra Müller (Admin)</p>
                    <Badge className="bg-success/10 text-success hover:bg-success/10">Genehmigt</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">11.10.2025 11:30</p>
                  <p className="text-xs text-muted-foreground mt-1">Final genehmigt</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
