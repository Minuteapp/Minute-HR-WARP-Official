import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Target,
  Star,
  FileText,
  BarChart3,
  MessageSquare,
  Award,
  BookOpen,
  Calendar,
  Settings,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { usePerformanceMetrics, usePerformanceReviews, usePerformanceTemplates } from '@/hooks/usePerformance';
import { usePerformanceRealData } from '@/hooks/usePerformanceRealData';
import { useModuleGates } from '@/hooks/useModuleGates';
import { ModuleNotConfigured } from '@/components/ui/module-not-configured';

// Component imports
import { PerformanceCycles } from './cycles/PerformanceCycles';
import { PerformanceTemplatesView } from './templates/PerformanceTemplatesView';
import { PerformanceReviewsView } from './reviews/PerformanceReviewsView';
import { ContinuousFeedback } from './feedback/ContinuousFeedback';
import { CalibrationMatrix } from './calibration/CalibrationMatrix';
import { DevelopmentPlansView } from './development/DevelopmentPlansView';
import { SuccessionPlanning } from './succession/SuccessionPlanning';
import { PerformanceAnalytics } from './analytics/PerformanceAnalytics';

export const PerformanceDashboard = () => {
  // ZERO-DATA-START: Prüfe ob Modul konfiguriert ist
  const { isReady, isLoading: gatesLoading, missingRequirements, settingsPath, moduleName, moduleDescription } = useModuleGates('performance');

  const [activeTab, setActiveTab] = useState('overview');

  // ECHTE DATEN: Daten aus Supabase-Hooks
  const { data: reviewsData = [], isLoading: reviewsLoading } = usePerformanceReviews();
  const { data: templatesData = [] } = usePerformanceTemplates();
  
  // Echte Performance-Metriken aus der Datenbank
  const {
    feedbackCount,
    developmentPlansCount,
    averageRating,
    completionRate,
    goalAchievement,
    activeCyclesCount,
    isLoading: metricsLoading
  } = usePerformanceRealData();

  // Berechne Metriken aus echten Daten
  const pendingReviews = reviewsData.filter(r => r.status === 'draft' || r.status === 'pending_signature');

  if (gatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isReady) {
    return (
      <ModuleNotConfigured
        moduleName={moduleName}
        requiredSettings={missingRequirements}
        settingsPath={settingsPath}
        description={moduleDescription}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Performance Management</h1>
              <p className="text-sm text-muted-foreground">
                Umfassendes Performance-Management mit KI-Unterstützung
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Einstellungen
            </Button>
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4 mr-2" />
              Hilfe
            </Button>
          </div>
        </div>

        {/* Tabs mit Underline-Style */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6 flex-wrap">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              <BarChart3 className="h-4 w-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger 
              value="cycles" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              <Calendar className="h-4 w-4" />
              Zyklen
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              <FileText className="h-4 w-4" />
              Vorlagen
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger 
              value="feedback" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger 
              value="calibration" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              <Target className="h-4 w-4" />
              Kalibrierung
            </TabsTrigger>
            <TabsTrigger 
              value="development" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              <BookOpen className="h-4 w-4" />
              Entwicklung
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Content-Bereich */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Aktive Zyklen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{activeCyclesCount}</div>
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Q4 2024
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Reviews fällig</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-orange-600">{pendingReviews.length}</div>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Feedback erhalten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-blue-600">{feedbackCount}</div>
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Entwicklungspläne</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-green-600">{developmentPlansCount}</div>
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Schnellaktionen
                  </CardTitle>
                  <CardDescription>Häufig verwendete Funktionen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Neues Review starten
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Feedback geben
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Entwicklungsplan erstellen
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Kalibrierung durchführen
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Letzte Aktivitäten
                  </CardTitle>
                  <CardDescription>Aktuelle Ereignisse</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Review abgeschlossen</p>
                        <p className="text-sm text-blue-700">Max Mustermann - vor 2 Stunden</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Feedback erhalten</p>
                        <p className="text-sm text-green-700">Anna Schmidt - vor 1 Tag</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900">Kalibrierung geplant</p>
                        <p className="text-sm text-yellow-700">Q4 Review - morgen 14:00</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Übersicht
                </CardTitle>
                <CardDescription>Aktuelle Performance-Kennzahlen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{averageRating > 0 ? averageRating.toFixed(1) : '-'}</div>
                    <p className="text-sm text-muted-foreground">Durchschnittsbewertung</p>
                    <div className="flex justify-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-4 w-4 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{completionRate}%</div>
                    <p className="text-sm text-muted-foreground">Review-Abschlussrate</p>
                    <div className="w-full bg-secondary rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${completionRate}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{goalAchievement}%</div>
                    <p className="text-sm text-muted-foreground">Ziel-Erreichung</p>
                    <div className="w-full bg-secondary rounded-full h-2 mt-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${goalAchievement}%` }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cycles" className="m-0">
            <PerformanceCycles />
          </TabsContent>

          <TabsContent value="templates" className="m-0">
            <PerformanceTemplatesView />
          </TabsContent>

          <TabsContent value="reviews" className="m-0">
            <PerformanceReviewsView />
          </TabsContent>

          <TabsContent value="feedback" className="m-0">
            <ContinuousFeedback />
          </TabsContent>

          <TabsContent value="calibration" className="mt-6">
            <CalibrationMatrix />
          </TabsContent>

          <TabsContent value="development" className="mt-6">
            <DevelopmentPlansView />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <PerformanceAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
