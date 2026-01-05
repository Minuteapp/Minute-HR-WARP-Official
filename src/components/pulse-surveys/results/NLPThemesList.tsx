import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface NLPThemesListProps {
  themes: Array<{
    name: string;
    sentiment: 'mixed' | 'positive' | 'negative';
    mentions: number;
    progress: number;
  }>;
}

const getSentimentBadge = (sentiment: 'mixed' | 'positive' | 'negative') => {
  const variants = {
    mixed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    positive: 'bg-green-100 text-green-800 border-green-200',
    negative: 'bg-red-100 text-red-800 border-red-200'
  };
  
  const labels = {
    mixed: 'Gemischt',
    positive: 'Positiv',
    negative: 'Negativ'
  };

  return (
    <Badge variant="outline" className={variants[sentiment]}>
      {labels[sentiment]}
    </Badge>
  );
};

export const NLPThemesList = ({ themes }: NLPThemesListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NLP-Themenanalyse (aus Freitexten)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {themes.map((theme, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{theme.name}</span>
                  {getSentimentBadge(theme.sentiment)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {theme.mentions} Erwähnungen
                </span>
              </div>
              <Progress value={theme.progress} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
