import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CostStatusBadge } from "./CostStatusBadge";
import { CostDeviationCell } from "./CostDeviationCell";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CostEntry {
  id: string;
  employee_name: string;
  category: string;
  description: string | null;
  budget_amount: number | null;
  actual_amount: number | null;
  cost_center: string | null;
  status: string | null;
  created_at: string;
}

interface CostEntriesTableProps {
  entries: CostEntry[];
  isLoading: boolean;
}

export const CostEntriesTable = ({ entries, isLoading }: CostEntriesTableProps) => {
  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'relocation': 'Relocation-Kosten',
      'housing': 'Wohnkosten',
      'travel': 'Reisekosten',
      'taxes': 'Steuern & Abgaben',
      'benefits': 'Zusatzleistungen'
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Lade Kosteneinträge...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine Kosteneinträge vorhanden
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mitarbeiter</TableHead>
          <TableHead>Kategorie</TableHead>
          <TableHead>Beschreibung</TableHead>
          <TableHead className="text-right">Budget</TableHead>
          <TableHead className="text-right">Ist-Kosten</TableHead>
          <TableHead>Abweichung</TableHead>
          <TableHead>Kostenstelle</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="font-medium">{entry.employee_name}</TableCell>
            <TableCell>{getCategoryLabel(entry.category)}</TableCell>
            <TableCell>{entry.description || '-'}</TableCell>
            <TableCell className="text-right">{formatCurrency(entry.budget_amount)}</TableCell>
            <TableCell className="text-right">{formatCurrency(entry.actual_amount)}</TableCell>
            <TableCell>
              <CostDeviationCell 
                budgetAmount={entry.budget_amount || 0} 
                actualAmount={entry.actual_amount || 0} 
              />
            </TableCell>
            <TableCell>{entry.cost_center || '-'}</TableCell>
            <TableCell>
              <CostStatusBadge status={entry.status || 'planned'} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
