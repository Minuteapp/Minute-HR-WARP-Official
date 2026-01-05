import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import ApprovalCard, { type ApprovalRequest } from './ApprovalCard';
import ApprovalDetailDialog from './ApprovalDetailDialog';

const mockApprovalRequests: ApprovalRequest[] = [];

const ApprovalsView = () => {
  const [requests, setRequests] = useState<ApprovalRequest[]>(mockApprovalRequests);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pendingCount = requests.filter(r => r.status === 'ausstehend').length;

  const handleViewDetails = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleApprove = (id: string, comment?: string) => {
    setRequests(prev => 
      prev.map(r => r.id === id ? { ...r, status: 'genehmigt' as const } : r)
    );
    console.log('Approved:', id, 'Comment:', comment);
  };

  const handleReject = (id: string, comment?: string) => {
    setRequests(prev => 
      prev.map(r => r.id === id ? { ...r, status: 'abgelehnt' as const } : r)
    );
    console.log('Rejected:', id, 'Comment:', comment);
  };

  const pendingRequests = requests.filter(r => r.status === 'ausstehend');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Ausstehende Genehmigungen</h2>
        <Badge variant="outline" className="border-red-300 text-red-600">
          {pendingCount} offen
        </Badge>
      </div>

      {/* Approval Cards */}
      <div className="space-y-4">
        {pendingRequests.map(request => (
          <ApprovalCard
            key={request.id}
            request={request}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewDetails={handleViewDetails}
          />
        ))}

        {pendingRequests.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Keine ausstehenden Genehmigungen vorhanden.
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <ApprovalDetailDialog
        request={selectedRequest}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default ApprovalsView;
