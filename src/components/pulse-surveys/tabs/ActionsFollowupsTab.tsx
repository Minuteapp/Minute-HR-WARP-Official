import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Bot, Target, Clock, Users, Calendar,
  TrendingUp, CheckCircle, ArrowRight
} from "lucide-react";

export const ActionsFollowupsTab = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const kpis = [
    { label: 'Gesamt', value: '6', icon: Target, color: 'bg-blue-50 text-blue-600' },
    { label: 'In Arbeit', value: '3', icon: Clock, color: 'bg-orange-50 text-orange-600' },
    { label: 'Abgeschlossen', value: '1', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Durchschn. Wirkung', value: '+0.6', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
  ];

  const aiSuggestions = [
    {
      title: 'Mentoring-Programm für IT',
      description: 'Erfahrene Mitarbeiter als Mentoren für Nachwuchskräfte einsetzen',
      expectedImpact: '+0.8 Punkte',
      effort: 'Mittel',
      timeline: '3 Monate'
    },
    {
      title: 'Flexible Arbeitszeit-Pilot',
      description: 'Test flexibler Kernarbeitszeiten in der IT-Abteilung',
      expectedImpact: '+0.5 Punkte',
      effort: 'Niedrig',
      timeline: '1 Monat'
    },
    {
      title: 'Quartalsweise Town Halls',
      description: 'Regelmäßige All-Hands Meetings für bessere Kommunikation',
      expectedImpact: '+0.6 Punkte',
      effort: 'Niedrig',
      timeline: 'Sofort'
    }
  ];

  const measures = [
    {
      id: 1,
      title: 'Führungskräfte-Workshop: Kommunikation',
      description: 'Schulung zur Verbesserung der Feedback-Kultur und transparenten Kommunikation im Team',
      priority: 'High',
      priorityColor: 'bg-red-100 text-red-700',
      status: 'In Arbeit',
      statusColor: 'border-orange-500 text-orange-600',
      source: 'Q2 Engagement Survey',
      responsible: 'HR Team',
      dueDate: '30.06.2025',
      affected: 45,
      progress: 45,
      currentScore: 6.9,
      targetScore: 7.5,
      linkedTo: ['Roadmap', 'Ziele']
    },
    {
      id: 2,
      title: 'Kapazitätsprüfung IT-Abteilung',
      description: 'Analyse der Workload-Verteilung und Identifikation von Engpässen im IT-Team',
      priority: 'Urgent',
      priorityColor: 'bg-red-100 text-red-700',
      status: 'In Arbeit',
      statusColor: 'border-orange-500 text-orange-600',
      source: 'Q2 Engagement Survey',
      responsible: 'IT Leitung',
      dueDate: '15.06.2025',
      affected: 23,
      progress: 70,
      currentScore: 6.8,
      targetScore: 7.5,
      linkedTo: ['Projekte']
    },
    {
      id: 3,
      title: 'Team-Building Event Q2',
      description: 'Abteilungsübergreifendes Event zur Stärkung des Teamzusammenhalts',
      priority: 'Medium',
      priorityColor: 'bg-orange-100 text-orange-700',
      status: 'Geplant',
      statusColor: 'border-blue-500 text-blue-600',
      source: 'Q1 Pulse Survey',
      responsible: 'Office Management',
      dueDate: '30.07.2025',
      affected: 120,
      progress: 20,
      currentScore: 8.1,
      targetScore: 8.5,
      linkedTo: ['Events']
    },
    {
      id: 4,
      title: 'Neue Tool-Evaluierung',
      description: 'Bewertung von Collaboration-Tools zur Verbesserung der Remote-Zusammenarbeit',
      priority: 'Medium',
      priorityColor: 'bg-orange-100 text-orange-700',
      status: 'In Arbeit',
      statusColor: 'border-orange-500 text-orange-600',
      source: 'Q2 Engagement Survey',
      responsible: 'IT Team',
      dueDate: '31.08.2025',
      affected: 85,
      progress: 35,
      currentScore: 7.4,
      targetScore: 8.0,
      linkedTo: ['IT', 'Infrastruktur']
    },
    {
      id: 5,
      title: 'Follow-up Pulse IT',
      description: 'Gezielte Nachbefragung der IT-Abteilung zu kritischen Themen',
      priority: 'High',
      priorityColor: 'bg-red-100 text-red-700',
      status: 'Geplant',
      statusColor: 'border-blue-500 text-blue-600',
      source: 'Q2 Engagement Survey',
      responsible: 'HR Team',
      dueDate: '15.07.2025',
      affected: 23,
      progress: 0,
      currentScore: 6.4,
      targetScore: 7.0,
      linkedTo: ['Umfragen']
    },
    {
      id: 6,
      title: 'Feedback-Kultur Workshop',
      description: 'Schulung zur konstruktiven Feedback-Kommunikation für alle Teams',
      priority: 'Medium',
      priorityColor: 'bg-orange-100 text-orange-700',
      status: 'Abgeschlossen',
      statusColor: 'border-green-500 text-green-600',
      source: 'Q4 Engagement Survey 2024',
      responsible: 'Learning & Development',
      dueDate: '15.03.2025',
      affected: 150,
      progress: 100,
      currentScore: 7.2,
      targetScore: 7.2,
      linkedTo: ['Training', 'Kultur']
    }
  ];

  const filterCounts = {
    all: measures.length,
    'in-progress': measures.filter(m => m.status === 'In Arbeit').length,
    planned: measures.filter(m => m.status === 'Geplant').length,
    completed: measures.filter(m => m.status === 'Abgeschlossen').length
  };

  const filteredMeasures = measures.filter(m => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'in-progress') return m.status === 'In Arbeit';
    if (activeFilter === 'planned') return m.status === 'Geplant';
    if (activeFilter === 'completed') return m.status === 'Abgeschlossen';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary/5 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-primary">Maßnahmen & Follow-ups</h2>
            <p className="text-sm text-muted-foreground">Verfolgen Sie abgeleitete Maßnahmen und deren Umsetzung</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Neue Maßnahme
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${kpi.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* KI-Maßnahmenvorschläge */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">KI-Maßnahmenvorschläge</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Basierend auf Ihren Umfrageergebnissen empfehlen wir folgende Maßnahmen:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiSuggestions.map((suggestion, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Erwartete Wirkung:</span>
                      <span className="font-medium text-green-600">{suggestion.expectedImpact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aufwand:</span>
                      <span className="font-medium">{suggestion.effort}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeline:</span>
                      <span className="font-medium">{suggestion.timeline}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-green-600 border-green-600 hover:bg-green-50">
                    Maßnahme erstellen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Alle' },
          { id: 'in-progress', label: 'In Arbeit' },
          { id: 'planned', label: 'Geplant' },
          { id: 'completed', label: 'Abgeschlossen' }
        ].map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter.id)}
            className={activeFilter === filter.id ? 'bg-primary' : ''}
          >
            {filter.label} ({filterCounts[filter.id as keyof typeof filterCounts]})
          </Button>
        ))}
      </div>

      {/* Maßnahmen-Liste */}
      <div className="space-y-4">
        {filteredMeasures.map((measure) => (
          <Card key={measure.id} className="bg-white">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{measure.title}</h3>
                  <Badge className={measure.priorityColor}>{measure.priority}</Badge>
                  <Badge variant="outline" className={measure.statusColor}>
                    {measure.status}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">{measure.description}</p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Quelle:</span>
                  <p className="font-medium">{measure.source}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Verantwortlich:</span>
                  <p className="font-medium">{measure.responsible}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fällig:</span>
                  <p className="font-medium">{measure.dueDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Betroffene:</span>
                  <p className="font-medium">{measure.affected}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Fortschritt</span>
                  <span className={`font-medium ${
                    measure.progress >= 70 ? 'text-green-600' : 
                    measure.progress >= 40 ? 'text-orange-600' : 'text-muted-foreground'
                  }`}>
                    {measure.progress}%
                  </span>
                </div>
                <Progress 
                  value={measure.progress} 
                  className={`h-2 ${
                    measure.progress >= 70 ? '[&>div]:bg-green-500' : 
                    measure.progress >= 40 ? '[&>div]:bg-orange-500' : ''
                  }`}
                />
              </div>

              {/* Wirkungsmessung */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-sm text-muted-foreground">Wirkungsmessung:</span>
                  <span className="font-medium">Aktuell {measure.currentScore}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-green-600">Ziel {measure.targetScore}</span>
                </div>

                {/* Verknüpft mit */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Verknüpft mit:</span>
                  {measure.linkedTo.map((link, idx) => (
                    <Badge key={idx} variant="secondary">{link}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
