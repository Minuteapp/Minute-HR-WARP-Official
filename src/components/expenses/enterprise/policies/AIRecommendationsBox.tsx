import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface AIRecommendation {
  id: string;
  type: 'warning' | 'success' | 'info';
  message: string;
}

interface AIRecommendationsBoxProps {
  recommendations: AIRecommendation[];
}

const AIRecommendationsBox = ({ recommendations }: AIRecommendationsBoxProps) => {
  const getIcon = (type: AIRecommendation['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="bg-purple-50 border-purple-100">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-purple-100">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <h4 className="font-medium text-foreground">KI-Empfehlungen</h4>
        </div>
        
        <div className="space-y-2">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-start gap-2">
              {getIcon(rec.type)}
              <p className="text-sm text-foreground">{rec.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendationsBox;
