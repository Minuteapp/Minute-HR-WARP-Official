import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Filter } from 'lucide-react';
import { TrainingKPICards, TrainingKPIData } from './TrainingKPICards';
import { TrainingAICard } from './TrainingAICard';
import { TrainingStatusChart } from './TrainingStatusChart';
import { DepartmentCompletionChart } from './DepartmentCompletionChart';
import { TrainingCard, Training } from './TrainingCard';
import { EmployeeGapCard, EmployeeTrainingGap } from './EmployeeGapCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TrainingTabProps {
  kpiData?: TrainingKPIData;
  aiAnalysisText?: string;
  aiRecommendations?: string[];
  statusData?: { completed: number; overdue: number; pending: number };
  departmentData?: { name: string; completion: number }[];
  trainings?: Training[];
  employeesWithGaps?: EmployeeTrainingGap[];
  onAssignTraining?: (employeeId: string) => void;
}

export const TrainingTab: React.FC<TrainingTabProps> = ({
  kpiData,
  aiAnalysisText,
  aiRecommendations,
  statusData,
  departmentData,
  trainings,
  employeesWithGaps,
  onAssignTraining
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTrainings = trainings?.filter(t => 
    categoryFilter === 'all' || t.category === categoryFilter
  );

  const categories = trainings 
    ? [...new Set(trainings.map(t => t.category))]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Schulungen & Pflichtunterweisungen</h2>
        <p className="text-sm text-muted-foreground">Verwaltung von Pflichtschulungen und Compliance-Trainings</p>
      </div>

      {/* KPI Cards */}
      <TrainingKPICards data={kpiData} />

      {/* AI Analysis Card */}
      <TrainingAICard 
        analysisText={aiAnalysisText}
        recommendations={aiRecommendations}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrainingStatusChart data={statusData} />
        <DepartmentCompletionChart data={departmentData} />
      </div>

      {/* Trainings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Schulungen</h3>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Alle Kategorien" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredTrainings && filteredTrainings.length > 0 ? (
          <div className="space-y-4">
            {filteredTrainings.map(training => (
              <TrainingCard key={training.id} training={training} />
            ))}
          </div>
        ) : (
          <Card className="bg-card">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">Keine Schulungen vorhanden</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Schulungen werden hier angezeigt, sobald entsprechende Daten vorliegen.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Employees with Training Gaps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Mitarbeitende mit Schulungslücken</h3>
        
        {employeesWithGaps && employeesWithGaps.length > 0 ? (
          <div className="space-y-4">
            {employeesWithGaps.map(employee => (
              <EmployeeGapCard 
                key={employee.id} 
                employee={employee}
                onAssignTraining={onAssignTraining}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-card">
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Keine Mitarbeitenden mit Schulungslücken gefunden.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
