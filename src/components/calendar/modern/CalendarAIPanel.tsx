import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Clock, 
  Users, 
  TrendingUp,
  Lightbulb,
  Zap
} from 'lucide-react';

export const CalendarAIPanel: React.FC = () => {
  const aiFeatures = [
    {
      title: 'Optimaler Meeting-Slot',
      description: 'Beste Zeit für Sales-Kickoff mit 5 Teilnehmern: Dienstag, 14:00 Uhr',
      confidence: 92,
      icon: Users,
      action: 'Termin erstellen'
    },
    {
      title: 'Fokuszeit-Schutz',
      description: 'Morgen 09:00-11:00 für konzentrierte Arbeit blocken',
      confidence: 88,
      icon: Clock,
      action: 'Zeit blocken'
    },
    {
      title: 'Meeting-Optimierung',
      description: '3 Meetings können zu einem 90-Min Block zusammengefasst werden',
      confidence: 85,
      icon: TrendingUp,
      action: 'Optimieren'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">AI-gestützte Kalenderoptimierung</h3>
      </div>
      
      {aiFeatures.map((feature, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <feature.icon className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{feature.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{feature.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {feature.confidence}% Genauigkeit
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-xs h-6">
                    <Zap className="h-3 w-3 mr-1" />
                    {feature.action}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="text-center pt-2">
        <Button variant="outline" size="sm">
          <Lightbulb className="h-4 w-4 mr-2" />
          Weitere AI-Vorschläge
        </Button>
      </div>
    </div>
  );
};