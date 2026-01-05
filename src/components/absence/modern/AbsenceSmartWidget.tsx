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

export const AbsenceSmartWidget: React.FC = () => {
  const smartInsights: any[] = [];

  const upcomingEvents: any[] = [];

  return (
    <div className="space-y-4">
      {/* Smart Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {smartInsights.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">
              Keine Insights verfügbar
            </div>
          ) : (
            <div className="space-y-4">
              {smartInsights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg ${insight.bgColor} border border-slate-200`}>
                  <div className="flex items-start gap-3">
                    <insight.icon className={`h-5 w-5 ${insight.color} mt-0.5`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-slate-900">{insight.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{insight.message}</p>
                      <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                        {insight.action}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Kommende Ereignisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">
              Keine kommenden Ereignisse
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-slate-100 to-slate-200 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-slate-700">{event.date}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-slate-500">{event.type}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={event.status === 'approved' ? 'default' : 
                            event.status === 'active' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {event.status === 'approved' ? 'Genehmigt' :
                     event.status === 'active' ? 'Aktiv' : 'Geplant'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Heute
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="text-sm">Anwesend</span>
              </div>
              <span className="font-medium">-</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-sm">Abwesend</span>
              </div>
              <span className="font-medium">-</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Verfügbarkeit</span>
              </div>
              <span className="font-medium">-</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};