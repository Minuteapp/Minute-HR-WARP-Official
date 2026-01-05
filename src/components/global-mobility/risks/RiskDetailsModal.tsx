import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RiskLevelBadge } from "./RiskLevelBadge";
import { RiskStatusBadge } from "./RiskStatusBadge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Risk {
  id: string;
  employee_name: string;
  category: string;
  risk_description: string;
  risk_level: string;
  deadline: string | null;
  responsible_person: string | null;
  status: string | null;
  created_at: string;
}

interface RiskDetailsModalProps {
  risk: Risk | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RiskDetailsModal = ({ risk, open, onOpenChange }: RiskDetailsModalProps) => {
  if (!risk) return null;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'visa': 'Visa-Ablauf',
      'tax': 'Steuerliche Risiken',
      'compliance': 'Compliance-Verstöße',
      'operational': 'Operative Risiken',
      'legal': 'Rechtliche Risiken'
    };
    return labels[category] || category;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Risikodetails</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <RiskLevelBadge level={risk.risk_level} />
            <RiskStatusBadge status={risk.status || 'open'} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Mitarbeiter</p>
              <p className="font-medium">{risk.employee_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kategorie</p>
              <p className="font-medium">{getCategoryLabel(risk.category)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Risikobeschreibung</p>
            <p className="font-medium">{risk.risk_description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Frist</p>
              <p className="font-medium">
                {risk.deadline 
                  ? format(new Date(risk.deadline), 'dd.MM.yyyy', { locale: de })
                  : 'Keine Frist'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verantwortlich</p>
              <p className="font-medium">{risk.responsible_person || '-'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Erstellt am</p>
            <p className="font-medium">
              {format(new Date(risk.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
