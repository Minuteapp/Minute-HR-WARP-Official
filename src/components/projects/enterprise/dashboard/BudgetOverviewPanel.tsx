import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Upload,
  Download,
  PieChart,
  BarChart3
} from 'lucide-react';
import { EnterpriseProject } from '@/types/project-enterprise';

interface BudgetOverviewPanelProps {
  project: EnterpriseProject;
  onUpdate?: (project: EnterpriseProject) => void;
}

export const BudgetOverviewPanel: React.FC<BudgetOverviewPanelProps> = ({
  project,
  onUpdate
}) => {
  const [showForecastUpload, setShowForecastUpload] = useState(false);

  // Berechne Budget Metriken
  const totalAllocated = project.budget_breakdown.reduce((acc, cat) => acc + cat.allocated_amount, 0);
  const totalSpent = project.actual_cost || 0;
  const remainingBudget = totalAllocated - totalSpent;
  const budgetUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  
  const getBudgetStatusColor = (utilization: number) => {
    if (utilization >= 90) return 'destructive';
    if (utilization >= 75) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gesamtbudget</p>
                <p className="text-2xl font-bold">{totalAllocated.toLocaleString()}€</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ausgegeben</p>
                <p className="text-2xl font-bold">{totalSpent.toLocaleString()}€</p>
                <Badge variant={getBudgetStatusColor(budgetUtilization)} className="mt-1">
                  {budgetUtilization.toFixed(1)}%
                </Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verbleibendes Budget</p>
                <p className="text-2xl font-bold">{remainingBudget.toLocaleString()}€</p>
              </div>
              {remainingBudget >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kostenverzug Risiko</p>
                <p className="text-2xl font-bold">{(project.cost_overrun_risk * 100).toFixed(1)}%</p>
                {project.cost_overrun_risk > 0.5 && (
                  <Badge variant="destructive" className="mt-1">
                    Hoch
                  </Badge>
                )}
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Budget Aufschlüsselung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.budget_breakdown.map((category, index) => {
                const utilization = category.allocated_amount > 0 ? 
                  (category.spent_amount / category.allocated_amount) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {category.spent_amount.toLocaleString()}€ / {category.allocated_amount.toLocaleString()}€
                        </p>
                        <Badge variant={getBudgetStatusColor(utilization)} className="text-xs">
                          {utilization.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={utilization} className="h-2" />
                    {category.reserved_amount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Reserviert: {category.reserved_amount.toLocaleString()}€
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Forecast & Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Forecast Files */}
              <div>
                <h4 className="font-medium mb-2">Hochgeladene Forecasts</h4>
                {project.forecast_files && project.forecast_files.length > 0 ? (
                  <div className="space-y-2">
                    {project.forecast_files.slice(0, 3).map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(file.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          file.processing_status === 'completed' ? 'default' :
                          file.processing_status === 'error' ? 'destructive' : 'secondary'
                        }>
                          {file.processing_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Keine Forecast-Dateien hochgeladen</p>
                )}
              </div>

              {/* Upload Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Excel Upload
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Forecast Accuracy */}
              {project.forecast_accuracy > 0 && (
                <div className="p-3 border rounded bg-muted/30">
                  <p className="text-sm font-medium">Forecast Genauigkeit</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={project.forecast_accuracy * 100} className="flex-1 h-2" />
                    <span className="text-sm font-medium">
                      {(project.forecast_accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};