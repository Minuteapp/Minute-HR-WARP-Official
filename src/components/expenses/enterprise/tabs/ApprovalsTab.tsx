import { useState } from 'react';
import ApprovalsStatsCards, { ApprovalStats } from '../approvals/ApprovalsStatsCards';
import ApprovalsTabs from '../approvals/ApprovalsTabs';
import { ApprovalRequest } from '../approvals/PendingApprovalCard';
import { ApprovalHistory } from '../approvals/ApprovalHistoryTable';
import { toast } from 'sonner';

const ApprovalsTab = () => {
  const [pendingApprovals] = useState<ApprovalRequest[]>([]);
  const [approvalHistory] = useState<ApprovalHistory[]>([]);

  const stats: ApprovalStats = {
    pending: pendingApprovals.length,
    highPriority: pendingApprovals.filter(a => a.isHighPriority).length,
    totalAmount: pendingApprovals.reduce((sum, a) => sum + a.amount, 0),
    avgProcessingDays: 0,
  };

  const handleApprove = (id: string) => {
    toast.success(`Ausgabe ${id} genehmigt`);
  };

  const handleReject = (id: string) => {
    toast.error(`Ausgabe ${id} abgelehnt`);
  };

  const handleDetails = (id: string) => {
    toast.info(`Details für ${id} anzeigen`);
  };

  const handleQuery = (id: string) => {
    toast.info(`Rückfrage für ${id} senden`);
  };

  return (
    <div className="space-y-6">
      <ApprovalsStatsCards stats={stats} />
      
      <ApprovalsTabs
        pendingApprovals={pendingApprovals}
        approvalHistory={approvalHistory}
        onApprove={handleApprove}
        onReject={handleReject}
        onDetails={handleDetails}
        onQuery={handleQuery}
      />
    </div>
  );
};

export default ApprovalsTab;
