
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KeyInsightItem from './KeyInsightItem';

interface KeyInsight {
  id: string;
  number: number;
  title: string;
  description: string;
}

interface KeyInsightsSectionProps {
  insights: KeyInsight[];
}

const KeyInsightsSection = ({ insights }: KeyInsightsSectionProps) => {
  const hasData = insights.length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Wichtige Erkenntnisse
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div>
            {insights.map((insight) => (
              <KeyInsightItem
                key={insight.id}
                number={insight.number}
                title={insight.title}
                description={insight.description}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Keine Erkenntnisse für den ausgewählten Zeitraum verfügbar
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeyInsightsSection;
