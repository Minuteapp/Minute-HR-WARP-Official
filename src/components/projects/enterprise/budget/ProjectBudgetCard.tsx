import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProjectBudget {
  id: string;
  name: string;
  category: string;
  costCenter: string;
  owner: string;
  planned: number;
  actual: number;
  actualDeviation: number;
  forecast: number;
  forecastDeviation: number;
  consumedPercent: number;
}

interface ProjectBudgetCardProps {
  project: ProjectBudget;
}

const ProjectBudgetCard = ({ project }: ProjectBudgetCardProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}k`;
    }
    return `€${value}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'HR': 'bg-blue-100 text-blue-700 border-blue-200',
      'IT': 'bg-red-100 text-red-700 border-red-200',
      'ESG': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Compliance': 'bg-green-100 text-green-700 border-green-200',
      'Innovation': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">{project.name}</h4>
          <span className={`px-2 py-0.5 text-xs rounded-full border ${getCategoryColor(project.category)}`}>
            {project.category}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Kostenstelle: {project.costCenter} • Owner: {project.owner}
        </p>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="font-semibold">{formatCurrency(project.planned)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">IST</p>
            <p className="font-semibold">{formatCurrency(project.actual)}</p>
            <div className="flex items-center gap-1">
              {project.actualDeviation < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">{project.actualDeviation}%</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-500">+{project.actualDeviation}%</span>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Forecast</p>
            <p className="font-semibold">{formatCurrency(project.forecast)}</p>
            <div className="flex items-center gap-1">
              {project.forecastDeviation < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">{project.forecastDeviation}%</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-500">+{project.forecastDeviation}%</span>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Verbraucht</p>
            <p className="font-semibold">{project.consumedPercent}%</p>
            <p className="text-xs text-muted-foreground">von Plan</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Budget-Verbrauch</span>
            <span className="text-xs font-medium">{project.consumedPercent}%</span>
          </div>
          <Progress value={project.consumedPercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectBudgetCard;
