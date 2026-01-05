import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Clock,
  CheckCircle,
  Brain,
  Lightbulb
} from 'lucide-react';

export const CalendarSmartWidget: React.FC = () => {
  const smartInsights = [
    {
      type: 'trend',
      title: 'Meeting-Trend',
      message: 'Dienstag ist Ihr produktivster Meeting-Tag',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: 'Details anzeigen'
    },
    {
      type: 'warning',
      title: 'Überlastung',
      message: '7 Meetings heute - Pausen einplanen',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: 'Optimieren'
    },
    {
      type: 'suggestion',
      title: 'AI-Empfehlung',
      message: 'Fokuszeit zwischen 9-11 Uhr blocken',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: 'Anwenden'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {smartInsights.map((insight, index) => (
          <div key={index} className={`p-3 rounded-lg ${insight.bgColor} border border-opacity-20`}>
            <div className="flex items-start gap-3">
              <insight.icon className={`h-5 w-5 ${insight.color} mt-0.5`} />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{insight.message}</p>
                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-xs">
                  {insight.action}
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Heute verfügbar</span>
            <span className="font-medium text-green-600">3h 45min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};