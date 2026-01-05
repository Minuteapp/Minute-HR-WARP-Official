import { AlertTriangle, Clock, Info, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Project {
  id: string;
  name: string;
  status: string;
  budget?: number;
  budget_spent?: number;
  delay_probability?: number;
  end_date?: string;
  team_members?: string[];
  ai_recommendations?: Array<{ type?: string; message?: string }>;
}

interface AIRecommendationsProps {
  projects: Project[];
}

interface Recommendation {
  type: 'warning' | 'info' | 'clock' | 'tip';
  title: string;
  message: string;
  projectName?: string;
}

export const AIRecommendations = ({ projects }: AIRecommendationsProps) => {
  const recommendations: Recommendation[] = [];

  // Kritische Projekte
  const criticalProjects = projects.filter(p => p.status === 'at-risk' || p.status === 'delayed');
  if (criticalProjects.length > 0) {
    recommendations.push({
      type: 'warning',
      title: `${criticalProjects.length} Projekte sind kritisch`,
      message: `Die Projekte ${criticalProjects.slice(0, 2).map(p => p.name).join(', ')} benötigen sofortige Aufmerksamkeit.`
    });
  }

  // Budgetüberschreitung
  const overBudgetProjects = projects.filter(p => p.budget_spent && p.budget && p.budget_spent > p.budget);
  if (overBudgetProjects.length > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Budgetüberschreitung erkannt',
      message: `${overBudgetProjects.length} Projekt(e) haben das Budget überschritten: ${overBudgetProjects.slice(0, 2).map(p => p.name).join(', ')}`
    });
  }

  // Ressourcenknappheit
  const underResourced = projects.filter(p => (p.team_members?.length || 0) < 2 && p.status === 'active');
  if (underResourced.length > 0) {
    recommendations.push({
      type: 'info',
      title: 'Ressourcenengpass erkannt',
      message: `${underResourced.length} aktive Projekt(e) haben weniger als 2 Teammitglieder.`
    });
  }

  // Fälligkeitsprognose
  const nearDeadline = projects.filter(p => {
    if (!p.end_date) return false;
    const daysUntil = Math.ceil((new Date(p.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 14;
  });
  if (nearDeadline.length > 0) {
    recommendations.push({
      type: 'clock',
      title: 'Fälligkeitsprognose',
      message: `${nearDeadline.length} Projekt(e) enden in den nächsten 14 Tagen.`
    });
  }

  // KI-Empfehlungen aus Projekten
  projects.forEach(p => {
    if (p.ai_recommendations && Array.isArray(p.ai_recommendations)) {
      p.ai_recommendations.forEach(rec => {
        if (rec.message) {
          recommendations.push({
            type: 'tip',
            title: p.name,
            message: rec.message,
            projectName: p.name
          });
        }
      });
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'info': return <Info className="h-4 w-4 text-orange-600" />;
      case 'clock': return <Clock className="h-4 w-4 text-gray-600" />;
      case 'tip': return <Lightbulb className="h-4 w-4 text-blue-600" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800';
      case 'info': return 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800';
      case 'clock': return 'bg-gray-50 border-gray-200 dark:bg-gray-950/30 dark:border-gray-800';
      case 'tip': return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800';
      default: return 'bg-muted';
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          KI-Empfehlungen & Warnungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.slice(0, 5).map((rec, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 p-3 rounded-lg border ${getBgColor(rec.type)}`}
          >
            <div className="mt-0.5">{getIcon(rec.type)}</div>
            <div>
              <p className="font-medium text-sm">{rec.title}</p>
              <p className="text-xs text-muted-foreground">{rec.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
