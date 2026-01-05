import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PendingApprovalsList from './PendingApprovalsList';
import ApprovalHistoryTable, { ApprovalHistory } from './ApprovalHistoryTable';
import { ApprovalRequest } from './PendingApprovalCard';

interface ApprovalsTabsProps {
  pendingApprovals: ApprovalRequest[];
  approvalHistory: ApprovalHistory[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDetails: (id: string) => void;
  onQuery: (id: string) => void;
}

const ApprovalsTabs = ({
  pendingApprovals,
  approvalHistory,
  onApprove,
  onReject,
  onDetails,
  onQuery,
}: ApprovalsTabsProps) => {
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="bg-muted/50 border-b border-border rounded-none w-full justify-start h-auto p-0">
        <TabsTrigger 
          value="pending" 
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
        >
          Ausstehende Genehmigungen ({pendingApprovals.length})
        </TabsTrigger>
        <TabsTrigger 
          value="history" 
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
        >
          Verlauf
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="mt-4">
        <PendingApprovalsList
          approvals={pendingApprovals}
          onApprove={onApprove}
          onReject={onReject}
          onDetails={onDetails}
          onQuery={onQuery}
        />
      </TabsContent>
      
      <TabsContent value="history" className="mt-4">
        <ApprovalHistoryTable history={approvalHistory} />
      </TabsContent>
    </Tabs>
  );
};

export default ApprovalsTabs;
