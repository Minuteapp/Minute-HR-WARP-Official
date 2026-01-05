import { Button } from '@/components/ui/button';

interface DecisionsHeaderProps {
  onCreateOffer: () => void;
}

const DecisionsHeader = ({ onCreateOffer }: DecisionsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Entscheidungen & Angebote</h2>
        <p className="text-sm text-muted-foreground">
          Angebotserstellung und finale Entscheidungen
        </p>
      </div>
      <Button onClick={onCreateOffer}>
        Angebot erstellen
      </Button>
    </div>
  );
};

export default DecisionsHeader;
