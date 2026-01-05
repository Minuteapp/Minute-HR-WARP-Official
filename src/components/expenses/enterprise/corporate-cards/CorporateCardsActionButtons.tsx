
import { Button } from '@/components/ui/button';
import { Plus, CreditCard } from 'lucide-react';

interface CorporateCardsActionButtonsProps {
  onNewCard: () => void;
  onVirtualCard: () => void;
}

const CorporateCardsActionButtons = ({ onNewCard, onVirtualCard }: CorporateCardsActionButtonsProps) => {
  return (
    <div className="flex gap-3">
      <Button 
        onClick={onNewCard}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Neue Karte erstellen
      </Button>
      <Button 
        variant="outline" 
        onClick={onVirtualCard}
        className="border-border"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Virtuelle Karte
      </Button>
    </div>
  );
};

export default CorporateCardsActionButtons;
