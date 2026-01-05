import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText,
  Clock,
  Users,
  Calendar,
  Target
} from 'lucide-react';

export const AbsenceCompliancePanel: React.FC = () => {
  const complianceMetrics: any[] = [];

  const upcomingDeadlines: any[] = [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'non-compliant':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'non-compliant':
        return 'text-red-600';
      default:
        return 'text-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Compliance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {complianceMetrics.map((metric, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{metric.category}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">{metric.score}%</span>
                    <Badge variant={metric.score >= 90 ? 'default' : metric.score >= 80 ? 'secondary' : 'destructive'}>
                      {metric.score >= 90 ? 'Exzellent' : metric.score >= 80 ? 'Gut' : 'Verbesserung nötig'}
                    </Badge>
                  </div>
                </div>
                <Progress value={metric.score} className="h-2" />
                
                <div className="space-y-2">
                  {metric.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs ${getStatusColor(item.status)}`}>
                          {item.details}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Anstehende Fristen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{deadline.title}</h4>
                    <p className="text-xs text-slate-600">Fällig: {deadline.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(deadline.priority)}>
                    {deadline.priority === 'high' ? 'Hoch' :
                     deadline.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </Badge>
                  <span className="text-sm text-slate-600">{deadline.daysLeft} Tage</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Empfohlene Maßnahmen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">Keine Maßnahmen vorhanden.</div>
        </CardContent>
      </Card>
    </div>
  );
};