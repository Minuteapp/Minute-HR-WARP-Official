import { Clock } from 'lucide-react';
import PendingApprovalCard, { ApprovalRequest } from './PendingApprovalCard';

interface PendingApprovalsListProps {
  approvals: ApprovalRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDetails: (id: string) => void;
  onQuery: (id: string) => void;
}

const PendingApprovalsList = ({ 
  approvals, 
  onApprove, 
  onReject, 
  onDetails, 
  onQuery 
}: PendingApprovalsListProps) => {
  if (approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Keine ausstehenden Genehmigungen</h3>
        <p className="text-sm text-muted-foreground">
          Es gibt derzeit keine Ausgaben, die auf Ihre Genehmigung warten.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <PendingApprovalCard
          key={approval.id}
          approval={approval}
          onApprove={onApprove}
          onReject={onReject}
          onDetails={onDetails}
          onQuery={onQuery}
        />
      ))}
    </div>
  );
};

export default PendingApprovalsList;
