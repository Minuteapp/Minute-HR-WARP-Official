
import CorporateCard, { CorporateCardData } from './CorporateCard';
import { CreditCard } from 'lucide-react';

interface CorporateCardsListProps {
  cards: CorporateCardData[];
  onBlock?: (cardId: string) => void;
  onUnblock?: (cardId: string) => void;
  onViewDetails?: (cardId: string) => void;
}

const CorporateCardsList = ({ cards, onBlock, onUnblock, onViewDetails }: CorporateCardsListProps) => {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-lg">
        <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Keine Firmenkarten</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Es sind noch keine Firmenkarten vorhanden.
          Erstellen Sie eine neue Karte, um zu beginnen.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <CorporateCard
          key={card.id}
          card={card}
          onBlock={onBlock}
          onUnblock={onUnblock}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default CorporateCardsList;
