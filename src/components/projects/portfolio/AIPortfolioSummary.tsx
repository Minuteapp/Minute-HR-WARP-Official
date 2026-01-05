import { AlertTriangle, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Project {
  id: string;
  name: string;
  status: string;
  progress?: number;
  budget?: number;
  budget_spent?: number;
  delay_probability?: number;
  team_members?: string[];
}

interface AIPortfolioSummaryProps {
  projects: Project[];
}

export const AIPortfolioSummary = ({ projects }: AIPortfolioSummaryProps) => {
  const criticalProjects = projects.filter(p => 
    p.status === 'at-risk' || 
    p.status === 'delayed' || 
    (p.delay_probability && p.delay_probability > 0.7)
  );

  const resourceIssues = criticalProjects.filter(p => 
    (p.team_members?.length || 0) < 2 && (p.progress || 0) < 50
  );

  const budgetIssues = criticalProjects.filter(p => 
    p.budget_spent && p.budget && p.budget_spent > p.budget
  );

  if (criticalProjects.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800">
        <CardContent className="flex items-start gap-3 py-4">
          <Brain className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-green-800 dark:text-green-200">
              <span className="font-medium">KI-Portfolio-Analyse:</span>{' '}
              Alle Projekte laufen im grünen Bereich. Keine kritischen Probleme erkannt.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summaryParts: string[] = [];
  if (resourceIssues.length > 0) {
    summaryParts.push(`${resourceIssues.length} wegen Ressourcenengpass`);
  }
  if (budgetIssues.length > 0) {
    summaryParts.push(`${budgetIssues.length} wegen Budgetabweichung`);
  }
  if (summaryParts.length === 0) {
    summaryParts.push('erhöhtes Verzögerungsrisiko');
  }

  return (
    <Card className="bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800">
      <CardContent className="flex items-start gap-3 py-4">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-red-800 dark:text-red-200">
            <span className="font-medium">KI-Portfolio-Analyse:</span>{' '}
            {criticalProjects.length} Projekte sind kritisch: {summaryParts.join(', ')}.
            Empfehlung: Priorisieren Sie Ressourcenzuweisung für{' '}
            {criticalProjects.slice(0, 2).map(p => p.name).join(' und ')}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
