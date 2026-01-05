import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ApprovalRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  type: 'urlaub' | 'homeoffice' | 'zeitkorrektur' | 'sonderurlaub';
  dateRange: string;
  duration: string;
  location: string;
  reason: string;
  details: string;
  attachments: string[];
  isUrgent: boolean;
  status: 'ausstehend' | 'genehmigt' | 'abgelehnt';
}

interface ApprovalCardProps {
  request: ApprovalRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (request: ApprovalRequest) => void;
}

const ApprovalCard = ({ request, onApprove, onReject, onViewDetails }: ApprovalCardProps) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'urlaub': return 'Urlaub';
      case 'homeoffice': return 'Homeoffice';
      case 'zeitkorrektur': return 'Zeitkorrektur';
      case 'sonderurlaub': return 'Sonderurlaub';
      default: return type;
    }
  };

  return (
    <div className="rounded-lg border bg-yellow-50 border-yellow-200 p-6 space-y-4">
      {request.isUrgent && (
        <Badge className="bg-red-500 text-white hover:bg-red-600">
          Dringend
        </Badge>
      )}
      
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">{request.employeeName}</h3>
        <p className="text-muted-foreground">{getTypeLabel(request.type)}</p>
        <p className="text-muted-foreground">{request.dateRange}</p>
      </div>

      <div className="flex gap-2 items-center">
        <Button 
          className="flex-1"
          onClick={() => onApprove(request.id)}
        >
          Genehmigen
        </Button>
        <Button 
          variant="outline"
          className="flex-1"
          onClick={() => onReject(request.id)}
        >
          Ablehnen
        </Button>
        <Button 
          variant="ghost"
          onClick={() => onViewDetails(request)}
        >
          Details
        </Button>
      </div>
    </div>
  );
};

export default ApprovalCard;
export type { ApprovalRequest };
