import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Circle, Clock, User, Calendar, Award, Target, BookOpen, Settings } from "lucide-react";
import { useOnboardingProcess } from "@/hooks/useOnboardingProcess";
import { cn } from "@/lib/utils";

interface EnhancedOnboardingProcessProps {
  processId: string;
}

const EnhancedOnboardingProcess = ({ processId }: EnhancedOnboardingProcessProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    process, 
    checklistItems, 
    loading, 
    updateChecklistItem, 
    updateProcessStatus 
  } = useOnboardingProcess(processId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!process) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Onboarding-Prozess nicht gefunden.</p>
        </CardContent>
      </Card>
    );
  }

  const completedItems = checklistItems.filter(item => item.status === 'completed').length;
  const totalItems = checklistItems.length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preboarding': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Abgeschlossen';
      case 'in_progress': return 'In Bearbeitung';
      case 'preboarding': return 'Vorab-Onboarding';
      case 'not_started': return 'Noch nicht begonnen';
      default: return status;
    }
  };

  const handleChecklistItemToggle = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const updates = {
      status: newStatus as any,
      ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
    };
    
    await updateChecklistItem(itemId, updates);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Prozess</h1>
          <p className="text-lg text-gray-600">Mitarbeiter-ID: {process.employee_id}</p>
        </div>
        <Badge className={cn("px-3 py-1", getStatusColor(process.status))}>
          {getStatusText(process.status)}
        </Badge>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Fortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Abgeschlossen: {completedItems} von {totalItems} Aufgaben</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={() => updateProcessStatus('in_progress')}
                disabled={process.status === 'in_progress'}
                variant="outline"
                size="sm"
              >
                Als aktiv markieren
              </Button>
              <Button 
                onClick={() => updateProcessStatus('completed')}
                disabled={process.status === 'completed' || progressPercent < 100}
                variant="outline"
                size="sm"
              >
                Als abgeschlossen markieren
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="checklist">Checkliste</TabsTrigger>
          <TabsTrigger value="goals">Ziele</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="progress">Fortschritt</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Grundinformationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={cn("text-xs", getStatusColor(process.status))}>
                    {getStatusText(process.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Startdatum:</span>
                  <span className="text-sm">{process.start_date || 'Nicht festgelegt'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Abschlussdatum:</span>
                  <span className="text-sm">{process.completion_date || 'Nicht abgeschlossen'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Gamification Score:</span>
                  <span className="text-sm font-semibold">{process.gamification_score || 0} Punkte</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Nächste Schritte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklistItems
                    .filter(item => item.status === 'pending')
                    .slice(0, 3)
                    .map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Circle className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                  {checklistItems.filter(item => item.status === 'pending').length === 0 && (
                    <p className="text-sm text-gray-600">Alle Aufgaben abgeschlossen! 🎉</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Onboarding Checkliste
              </CardTitle>
              <CardDescription>
                Verfolgen Sie den Fortschritt aller Onboarding-Aufgaben
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <button
                      onClick={() => handleChecklistItemToggle(item.id, item.status)}
                      className="flex-shrink-0"
                    >
                      {item.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-medium",
                        item.status === 'completed' && "line-through text-gray-500"
                      )}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        {item.points && (
                          <span className="text-xs text-gray-500">
                            {item.points} Punkte
                          </span>
                        )}
                        {item.due_date && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Badge 
                      variant={item.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status === 'completed' ? 'Erledigt' : 
                       item.status === 'in_progress' ? 'In Bearbeitung' : 'Ausstehend'}
                    </Badge>
                  </div>
                ))}
                
                {checklistItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Checklisten-Elemente vorhanden.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Ziele</CardTitle>
              <CardDescription>Definierte Ziele für diesen Onboarding-Prozess</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Ziele-Feature wird bald verfügbar sein.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback & Bewertungen</CardTitle>
              <CardDescription>Feedback zum Onboarding-Prozess</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Feedback-Feature wird bald verfügbar sein.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Detaillierter Fortschritt</CardTitle>
              <CardDescription>Übersicht über den gesamten Onboarding-Fortschritt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{completedItems}</div>
                      <p className="text-sm text-gray-600">Abgeschlossen</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {checklistItems.filter(item => item.status === 'in_progress').length}
                      </div>
                      <p className="text-sm text-gray-600">In Bearbeitung</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-gray-600">
                        {checklistItems.filter(item => item.status === 'pending').length}
                      </div>
                      <p className="text-sm text-gray-600">Ausstehend</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Fortschritt nach Kategorien</h4>
                  <div className="space-y-3">
                    {Array.from(new Set(checklistItems.map(item => item.category))).map(category => {
                      const categoryItems = checklistItems.filter(item => item.category === category);
                      const completedCategoryItems = categoryItems.filter(item => item.status === 'completed');
                      const categoryProgress = categoryItems.length > 0 
                        ? Math.round((completedCategoryItems.length / categoryItems.length) * 100) 
                        : 0;
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{category}</span>
                            <span>{completedCategoryItems.length}/{categoryItems.length} ({categoryProgress}%)</span>
                          </div>
                          <Progress value={categoryProgress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedOnboardingProcess;