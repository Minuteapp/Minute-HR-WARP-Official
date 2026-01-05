
import { Clock, CheckCircle, XCircle, FileText, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';

interface ExpenseStatusBadgeProps {
  status: ExpenseStatus;
}

const statusConfig: Record<ExpenseStatus, { label: string; className: string; icon: React.ElementType }> = {
  draft: {
    label: 'Entwurf',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
    icon: FileText
  },
  submitted: {
    label: 'Eingereicht',
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
    icon: Clock
  },
  approved: {
    label: 'Genehmigt',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
    icon: CheckCircle
  },
  rejected: {
    label: 'Abgelehnt',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
    icon: XCircle
  },
  reimbursed: {
    label: 'Erstattet',
    className: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100',
    icon: RefreshCw
  }
};

const ExpenseStatusBadge = ({ status }: ExpenseStatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} font-medium`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

export default ExpenseStatusBadge;
