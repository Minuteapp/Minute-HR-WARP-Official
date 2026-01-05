import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RiskLevelBadge } from "./RiskLevelBadge";
import { RiskStatusBadge } from "./RiskStatusBadge";
import { Eye } from "lucide-react";
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

interface RisksTableProps {
  risks: Risk[];
  isLoading: boolean;
  onViewDetails: (risk: Risk) => void;
}

export const RisksTable = ({ risks, isLoading, onViewDetails }: RisksTableProps) => {
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

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Lade Risiken...
      </div>
    );
  }

  if (risks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine Risiken vorhanden
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mitarbeiter</TableHead>
          <TableHead>Kategorie</TableHead>
          <TableHead>Risikobeschreibung</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Frist</TableHead>
          <TableHead>Verantwortlich</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[80px]">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {risks.map((risk) => (
          <TableRow key={risk.id}>
            <TableCell className="font-medium">{risk.employee_name}</TableCell>
            <TableCell>{getCategoryLabel(risk.category)}</TableCell>
            <TableCell className="max-w-[200px] truncate">{risk.risk_description}</TableCell>
            <TableCell>
              <RiskLevelBadge level={risk.risk_level} />
            </TableCell>
            <TableCell>
              {risk.deadline 
                ? format(new Date(risk.deadline), 'dd.MM.yyyy', { locale: de })
                : '-'
              }
            </TableCell>
            <TableCell>{risk.responsible_person || '-'}</TableCell>
            <TableCell>
              <RiskStatusBadge status={risk.status || 'open'} />
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" onClick={() => onViewDetails(risk)}>
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
