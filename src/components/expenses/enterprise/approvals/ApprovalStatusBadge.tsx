import { Check, X, Clock } from 'lucide-react';

interface ApprovalStatusBadgeProps {
  status: 'approved' | 'rejected' | 'pending';
}

const ApprovalStatusBadge = ({ status }: ApprovalStatusBadgeProps) => {
  const config = {
    approved: {
      icon: Check,
      text: 'Genehmigt',
      className: 'text-green-600 bg-green-50 border-green-200',
    },
    rejected: {
      icon: X,
      text: 'Abgelehnt',
      className: 'text-red-600 bg-red-50 border-red-200',
    },
    pending: {
      icon: Clock,
      text: 'Ausstehend',
      className: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    },
  };

  const { icon: Icon, text, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${className}`}>
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
};

export default ApprovalStatusBadge;
