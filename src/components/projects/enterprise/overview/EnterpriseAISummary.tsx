import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

const EnterpriseAISummary = () => {
  return (
    <Card className="bg-purple-50 border-purple-100">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-purple-900">KI-Portfolio-Zusammenfassung</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-gray-200 text-gray-600">
                Vorschau
              </Badge>
            </div>
            <p className="text-sm text-purple-800">
              Keine Projektdaten vorhanden. Erstellen Sie Projekte, um KI-gestützte Portfolio-Analysen zu erhalten.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnterpriseAISummary;
