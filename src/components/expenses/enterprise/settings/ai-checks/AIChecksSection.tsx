
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AICheckItem from './AICheckItem';

interface AICheck {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

const AIChecksSection = () => {
  const [aiChecks, setAiChecks] = useState<AICheck[]>([]);

  const handleToggle = (id: string, isActive: boolean) => {
    setAiChecks(prev => 
      prev.map(check => check.id === id ? { ...check, isActive } : check)
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">KI-gestützte Prüfungen</CardTitle>
        <p className="text-sm text-muted-foreground">
          Aktivieren Sie automatische KI-Prüfungen für Ausgaben
        </p>
      </CardHeader>
      <CardContent>
        {aiChecks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine KI-Prüfungen konfiguriert.
          </div>
        ) : (
          <div>
            {aiChecks.map((check) => (
              <AICheckItem
                key={check.id}
                {...check}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIChecksSection;
