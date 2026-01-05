import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ApprovalEntry {
  approver_name: string;
  approver_role: string;
  status: string;
  approved_at: string;
}

interface JobApprovalHistoryProps {
  approvalHistory?: ApprovalEntry[];
}

const JobApprovalHistory = ({ approvalHistory }: JobApprovalHistoryProps) => {
  if (!approvalHistory || approvalHistory.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-xs text-muted-foreground mb-2">Genehmigungsverlauf:</p>
      <div className="space-y-1">
        {approvalHistory.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-foreground">
              {entry.approver_name} ({entry.approver_role})
            </span>
            <span className="text-muted-foreground">-</span>
            <span className="text-muted-foreground">{entry.status}</span>
            <span className="text-muted-foreground">
              {format(new Date(entry.approved_at), 'dd.MM.yyyy HH:mm', { locale: de })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobApprovalHistory;
