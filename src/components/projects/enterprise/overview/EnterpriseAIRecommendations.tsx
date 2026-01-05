import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';

interface AIRecommendation {
  id: string;
  type: 'warning' | 'info';
  title: string;
  description: string;
}

const EnterpriseAIRecommendations = () => {
  // Empty state - no mock data
  const recommendations: AIRecommendation[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">KI-Empfehlungen & Warnungen</CardTitle>
        <p className="text-sm text-muted-foreground">
          Automatisch erkannte Muster und Handlungsempfehlungen
        </p>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Keine Empfehlungen oder Warnungen vorhanden</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div 
                key={rec.id} 
                className={`flex items-start gap-3 p-4 rounded-lg ${
                  rec.type === 'warning' ? 'bg-red-50' : 'bg-gray-50'
                }`}
              >
                {rec.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${rec.type === 'warning' ? 'text-red-600' : 'text-gray-600'}`}>
                    {rec.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnterpriseAIRecommendations;
