
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CardProviderItem from './CardProviderItem';

interface CardProvider {
  id: string;
  name: string;
  connectedCards: number;
  status: 'active' | 'inactive';
  iconColor: 'purple' | 'yellow';
}

const CardIntegrationSection = () => {
  const [providers, setProviders] = useState<CardProvider[]>([]);

  const handleConnect = (id: string) => {
    console.log('Connect provider:', id);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Firmenkarten-Integration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Verbinden Sie Ihre Firmenkarten-Provider für automatische Transaktionserfassung
        </p>
      </CardHeader>
      <CardContent>
        {providers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine Kartenanbieter konfiguriert. Verbinden Sie einen Provider.
          </div>
        ) : (
          <div>
            {providers.map((provider) => (
              <CardProviderItem
                key={provider.id}
                {...provider}
                onConnect={handleConnect}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardIntegrationSection;
