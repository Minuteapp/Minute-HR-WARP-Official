import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Folder, Clock, Eye, Check, X, MessageSquare, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export interface ApprovalRequest {
  id: string;
  expenseId: string;
  employeeName: string;
  employeeInitials: string;
  description: string;
  date: Date;
  project?: string;
  approvalStage: number;
  totalStages: number;
  amount: number;
  category: string;
  isHighPriority: boolean;
  warnings: ('over_limit' | 'ai_check' | 'high_amount')[];
}

interface PendingApprovalCardProps {
  approval: ApprovalRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDetails: (id: string) => void;
  onQuery: (id: string) => void;
}

const PendingApprovalCard = ({ 
  approval, 
  onApprove, 
  onReject, 
  onDetails, 
  onQuery 
}: PendingApprovalCardProps) => {
  const warningLabels = {
    over_limit: 'Über Limit',
    ai_check: 'KI-Prüfung',
    high_amount: 'Hoher Betrag',
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10 bg-purple-100">
              <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                {approval.employeeInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground">{approval.employeeName}</span>
                <span className="text-muted-foreground text-sm">• {approval.expenseId}</span>
                {approval.isHighPriority && (
                  <span className="bg-red-100 text-red-600 border border-red-200 rounded px-2 py-0.5 text-xs font-medium">
                    Hohe Priorität
                  </span>
                )}
              </div>
              
              <p className="text-sm text-foreground mb-2">{approval.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(approval.date, 'dd.MM.yyyy', { locale: de })}
                </span>
                {approval.project && (
                  <span className="flex items-center gap-1">
                    <Folder className="h-3 w-3" />
                    {approval.project}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Stufe {approval.approvalStage} von {approval.totalStages}
                </span>
              </div>
              
              {approval.warnings.length > 0 && (
                <div className="flex items-center gap-2">
                  {approval.warnings.map((warning) => (
                    <span 
                      key={warning}
                      className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded px-2 py-0.5 text-xs"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {warningLabels[warning]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right ml-4">
            <p className="text-lg font-semibold text-foreground">
              €{approval.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground">{approval.category}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <Button 
            variant="default" 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => onDetails(approval.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-green-500 hover:bg-green-600"
            onClick={() => onApprove(approval.id)}
          >
            <Check className="h-4 w-4 mr-1" />
            Genehmigen
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-red-500 hover:bg-red-600"
            onClick={() => onReject(approval.id)}
          >
            <X className="h-4 w-4 mr-1" />
            Ablehnen
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onQuery(approval.id)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Rückfrage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovalCard;
