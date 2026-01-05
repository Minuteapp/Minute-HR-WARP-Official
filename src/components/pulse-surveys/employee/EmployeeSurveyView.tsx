import { Clock, FileText, Calendar, CheckCircle, TrendingUp, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SurveyCard } from "./SurveyCard";
import { SurveyModal } from "./SurveyModal";
import { useState } from "react";
import { usePulseSurveyEmployee } from "@/hooks/usePulseSurveyEmployee";

export const EmployeeSurveyView = () => {
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { openSurveys, completedSurveys, statistics } = usePulseSurveyEmployee();

  const handleStartSurvey = (survey: any) => {
    setSelectedSurvey(survey);
    setIsModalOpen(true);
  };

  const handleCloseSurvey = () => {
    setIsModalOpen(false);
    setSelectedSurvey(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mitarbeiterumfragen</h1>
          <p className="text-muted-foreground mt-2">
            Teilen Sie Ihr Feedback und helfen Sie uns, besser zu werden
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Umfragen</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.openSurveys}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Warten auf Ihre Teilnahme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.completedSurveys}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Umfragen beantwortet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beteiligungsrate</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.participationRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ihre Teilnahmequote
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Open Surveys Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Offene Umfragen</h2>
          <p className="text-sm text-muted-foreground">
            Bitte nehmen Sie sich Zeit für die folgenden Umfragen
          </p>
        </div>
        
        {openSurveys.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Keine offenen Umfragen verfügbar
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {openSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                onStartSurvey={handleStartSurvey}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Surveys Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Abgeschlossene Umfragen</h2>
          <p className="text-sm text-muted-foreground">
            Ihre bereits beantworteten Umfragen
          </p>
        </div>
        
        {completedSurveys.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Noch keine Umfragen abgeschlossen
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {completedSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                isCompleted
              />
            ))}
          </div>
        )}
      </div>

      {/* Survey Modal */}
      {selectedSurvey && (
        <SurveyModal
          survey={selectedSurvey}
          isOpen={isModalOpen}
          onClose={handleCloseSurvey}
        />
      )}
    </div>
  );
};
