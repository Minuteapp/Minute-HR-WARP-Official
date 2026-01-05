import { Card, CardContent } from '@/components/ui/card';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIInsightsSectionProps {
  insights: {
    main: {
      title: string;
      description: string;
    };
    critical: {
      title: string;
      description: string;
      action: string;
    };
    positive: {
      title: string;
      description: string;
    };
  };
}

export const AIInsightsSection = ({ insights }: AIInsightsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">KI-Auswertung & Empfehlungen</h3>
      
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">{insights.main.title}</h4>
              <p className="text-sm text-blue-800">{insights.main.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-1">{insights.critical.title}</h4>
              <p className="text-sm text-yellow-800 mb-3">{insights.critical.description}</p>
              <Button variant="outline" size="sm" className="border-yellow-300 bg-white hover:bg-yellow-100">
                {insights.critical.action}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-1">{insights.positive.title}</h4>
              <p className="text-sm text-green-800">{insights.positive.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
