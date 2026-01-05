import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banknote, Calendar, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import OfferStatusBadge from './OfferStatusBadge';

interface Offer {
  id: string;
  candidate_name: string;
  job_title: string;
  salary: number;
  currency: string;
  start_date: string;
  contract_type: string;
  benefits: string[];
  status: string;
  sent_at?: string;
}

interface OfferCardProps {
  offer: Offer;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

const OfferCard = ({ offer, onAccept, onReject }: OfferCardProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getContractTypeLabel = (type: string) => {
    return type === 'permanent' ? 'Unbefristet' : 'Befristet';
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground">{offer.candidate_name}</h3>
            <OfferStatusBadge status={offer.status} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{offer.job_title}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Banknote className="h-3 w-3" />
            {formatCurrency(offer.salary, offer.currency)}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Start: {format(new Date(offer.start_date), 'dd.MM.yyyy', { locale: de })}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            Vertragsart: {getContractTypeLabel(offer.contract_type)}
          </div>
          {offer.sent_at && (
            <div className="text-muted-foreground">
              Versendet: {format(new Date(offer.sent_at), 'dd.MM.yyyy', { locale: de })}
            </div>
          )}
        </div>

        {offer.benefits && offer.benefits.length > 0 && (
          <p className="text-xs text-muted-foreground mb-3">
            Benefits: {offer.benefits.join(', ')}
          </p>
        )}

        {offer.status === 'sent' && onAccept && onReject && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onAccept(offer.id)}>
              Angenommen
            </Button>
            <Button size="sm" variant="outline" onClick={() => onReject(offer.id)}>
              Abgelehnt
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfferCard;
