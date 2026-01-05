
import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

export const InvoiceStatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case 'paid':
      return <Badge variant="default" className="bg-green-500">Bezahlt</Badge>;
    case 'pending':
      return <Badge variant="outline">Ausstehend</Badge>;
    case 'overdue':
      return <Badge variant="destructive">Überfällig</Badge>;
    case 'cancelled':
      return <Badge variant="secondary">Storniert</Badge>;
    default:
      return <Badge variant="outline">Unbekannt</Badge>;
  }
};
