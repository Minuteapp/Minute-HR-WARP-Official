import { CheckCircle, XCircle, Clock, Briefcase, Building, Mail, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/avatarUtils';

interface MobileEmployeeProfileCardProps {
  employee: any;
}

// Helper für Status-Badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return { variant: 'success' as const, icon: CheckCircle, label: 'Aktiv' };
    case 'inactive':
      return { variant: 'secondary' as const, icon: XCircle, label: 'Inaktiv' };
    case 'pending':
      return { variant: 'outline' as const, icon: Clock, label: 'Ausstehend' };
    default:
      return { variant: 'secondary' as const, icon: CheckCircle, label: status || 'Unbekannt' };
  }
};

export const MobileEmployeeProfileCard = ({ employee }: MobileEmployeeProfileCardProps) => {
  const statusInfo = getStatusBadge(employee.status);
  const StatusIcon = statusInfo.icon;
  
  // Format last login date if available
  const formattedLastActive = employee.updated_at 
    ? new Date(employee.updated_at).toLocaleDateString('de-DE')
    : null;
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
      {/* Avatar und Name */}
      <div className="flex flex-col items-center mb-3">
        <div className="relative mb-1.5">
          <Avatar className="w-14 h-14">
            <AvatarFallback className="bg-primary text-primary-foreground text-[14px]">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <Badge variant="secondary" className="absolute -top-1 -left-1 bg-gray-700 text-white text-[8px] px-1.5 py-0.5">
            Vorschau
          </Badge>
        </div>
        
        <h2 className="text-[13px] font-semibold text-foreground mb-1">
          {employee.name}
        </h2>
        
        <Badge variant={statusInfo.variant} className="gap-1 text-[9px] h-5">
          <StatusIcon className="w-3 h-3" />
          {statusInfo.label}
        </Badge>
      </div>
      
      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-start gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-[9px] text-muted-foreground">Position</div>
            <div className="text-[11px] font-medium">{employee.position || '-'}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1.5">
          <Building className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-[9px] text-muted-foreground">Abteilung</div>
            <div className="text-[11px] font-medium">{employee.department || employee.team || '-'}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1.5">
          <Mail className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-[9px] text-muted-foreground">E-Mail</div>
            <div className="text-[11px] font-medium break-all">{employee.email || '-'}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-[9px] text-muted-foreground">Standort</div>
            <div className="text-[11px] font-medium">{employee.location || '-'}</div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="pt-2.5 border-t border-border space-y-0.5">
        {formattedLastActive && (
          <div className="text-[10px] text-muted-foreground">
            Zuletzt aktualisiert: {formattedLastActive}
          </div>
        )}
        <div className="text-[10px] text-muted-foreground">
          Mitarbeiter-ID: {employee.employee_number || '-'}
        </div>
      </div>
    </div>
  );
};
