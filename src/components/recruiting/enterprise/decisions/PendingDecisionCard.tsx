import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface PendingDecision {
  id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  applied_at: string;
  application_id: string;
}

interface PendingDecisionCardProps {
  decision: PendingDecision;
  onCreateOffer: (applicationId: string) => void;
  onAddToTalentPool: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
}

const PendingDecisionCard = ({ 
  decision, 
  onCreateOffer, 
  onAddToTalentPool, 
  onReject 
}: PendingDecisionCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-foreground">{decision.candidate_name}</h3>
            <p className="text-sm text-muted-foreground">{decision.job_title}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Beworben: {format(new Date(decision.applied_at), 'dd.MM.yyyy', { locale: de })}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {decision.candidate_email}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onCreateOffer(decision.application_id)}>
              Angebot erstellen
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAddToTalentPool(decision.application_id)}>
              Talentpool
            </Button>
            <Button size="sm" variant="outline" onClick={() => onReject(decision.application_id)}>
              Ablehnen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingDecisionCard;
