import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { usePulseSurveyResults } from "@/hooks/usePulseSurveyResults";
import { SurveyResultsKPIs } from "../results/SurveyResultsKPIs";
import { EngagementRadarChart } from "../results/EngagementRadarChart";
import { SentimentPieChart } from "../results/SentimentPieChart";
import { DepartmentComparisonChart } from "../results/DepartmentComparisonChart";
import { NLPThemesList } from "../results/NLPThemesList";
import { AIInsightsSection } from "../results/AIInsightsSection";

export const ResultsTab = () => {
  const [selectedSurvey, setSelectedSurvey] = useState("q4-engagement");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const { results, isLoading } = usePulseSurveyResults(selectedSurvey);

  const handleExportPDF = () => {
    console.log('Exporting PDF...');
    // TODO: Implementiere PDF Export
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Lade Ergebnisse...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Umfrage auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q4-engagement">Q4 2024 Engagement Pulse</SelectItem>
                  <SelectItem value="q3-engagement">Q3 2024 Engagement Pulse</SelectItem>
                  <SelectItem value="wellbeing-oct">Oktober Wellbeing Check</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Abteilung filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Abteilungen</SelectItem>
                  <SelectItem value="it">IT & Digital</SelectItem>
                  <SelectItem value="sales">Vertrieb</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="production">Produktion</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExportPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <SurveyResultsKPIs kpis={results.kpis} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementRadarChart data={results.categories} />
        <SentimentPieChart sentiment={results.sentiment} />
      </div>

      {/* Department Comparison */}
      <DepartmentComparisonChart departments={results.departments} />

      {/* NLP Themes */}
      <NLPThemesList themes={results.themes} />

      {/* AI Insights */}
      <AIInsightsSection insights={results.aiInsights} />
    </div>
  );
};
