
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, TrendingDown, Users, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useRiskAssessment } from '@/hooks/useWorkforcePlanning';

export const RiskAssessmentPanel = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { data: riskData, isLoading } = useRiskAssessment({
    category: selectedCategory !== 'all' ? selectedCategory : undefined
  });

  // Mock Risk Assessment Data
  const overallRiskScore = 42; // 0-100 scale
  
  const riskCategories = [
    {
      category: 'Operational',
      risk_score: 65,
      key_risks: [
        {
          title: 'Kritische Unterbesetzung Engineering',
          severity: 'high',
          probability: 85,
          impact: 'Produktentwicklung verzögert sich um 2-3 Monate',
          mitigation_status: 'in_progress'
        },
        {
          title: 'Skill Gap in Cloud Security',
          severity: 'critical',
          probability: 90,
          impact: 'Sicherheitsrisiken in der Infrastruktur',
          mitigation_status: 'planned'
        }
      ]
    },
    {
      category: 'Financial',
      risk_score: 38,
      key_risks: [
        {
          title: 'Budget-Überschreitung Personalkosten',
          severity: 'medium',
          probability: 60,
          impact: 'Zusätzliche €500k Kosten im Q2',
          mitigation_status: 'completed'
        },
        {
          title: 'Unerwartete Hiring-Kosten',
          severity: 'medium',
          probability: 45,
          impact: 'Budget-Anpassung um 15% nötig',
          mitigation_status: 'in_progress'
        }
      ]
    },
    {
      category: 'Strategic',
      risk_score: 28,
      key_risks: [
        {
          title: 'Verlust von Key Personnel',
          severity: 'high',
          probability: 30,
          impact: 'Wissensverlust und Projektrisiken',
          mitigation_status: 'planned'
        }
      ]
    },
    {
      category: 'Compliance',
      risk_score: 15,
      key_risks: [
        {
          title: 'Arbeitszeit-Compliance Risiko',
          severity: 'low',
          probability: 25,
          impact: 'Potentielle rechtliche Konsequenzen',
          mitigation_status: 'completed'
        }
      ]
    }
  ];

  const mitigationPlans = [
    {
      id: '1',
      risk_title: 'Kritische Unterbesetzung Engineering',
      strategy: 'Beschleunigtes Recruiting + externe Freelancer',
      actions: [
        {
          description: 'Recruiting-Pipeline für 15 Senior Entwickler aktivieren',
          due_date: '2024-03-15',
          responsible: 'Sarah Mueller (HR)',
          status: 'in_progress'
        },
        {
          description: '5 externe Freelancer für 6 Monate engagieren',
          due_date: '2024-02-28',
          responsible: 'Mark Weber (Engineering)',
          status: 'pending'
        },
        {
          description: 'Overtime-Budget um €100k erhöhen',
          due_date: '2024-02-20',
          responsible: 'Finance Team',
          status: 'completed'
        }
      ],
      timeline_weeks: 12,
      cost_estimate: 450000,
      success_probability: 75
    },
    {
      id: '2',
      risk_title: 'Skill Gap in Cloud Security',
      strategy: 'Kombination aus Training und strategischen Hires',
      actions: [
        {
          description: 'AWS/Azure Zertifizierungsprogramm für 10 Entwickler',
          due_date: '2024-04-30',
          responsible: 'Learning & Development',
          status: 'planned'
        },
        {
          description: '2 Senior Cloud Security Engineers einstellen',
          due_date: '2024-05-15',
          responsible: 'Recruiting Team',
          status: 'in_progress'
        }
      ],
      timeline_weeks: 16,
      cost_estimate: 280000,
      success_probability: 85
    }
  ];

  const riskTrends = [
    { month: 'Okt', overall: 35, operational: 60, financial: 25, strategic: 20, compliance: 10 },
    { month: 'Nov', overall: 38, operational: 62, financial: 30, strategic: 25, compliance: 12 },
    { month: 'Dez', overall: 42, operational: 65, financial: 38, strategic: 28, compliance: 15 },
    { month: 'Jan', overall: 40, operational: 63, financial: 35, strategic: 30, compliance: 15 },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    if (score >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Kritisch</Badge>;
      case 'high': return <Badge className="bg-orange-500 hover:bg-orange-600">Hoch</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case 'low': return <Badge className="bg-green-500 hover:bg-green-600">Niedrig</Badge>;
      default: return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'planned': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Gesamtrisiko-Bewertung
          </CardTitle>
          <CardDescription>
            Aktuelle Risikolage der Workforce Planning Strategie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className={`text-4xl font-bold ${getRiskColor(overallRiskScore).split(' ')[0]}`}>
                {overallRiskScore}/100
              </div>
              <p className="text-sm text-gray-500">Gesamt-Risiko-Score</p>
            </div>
            <div className="text-right">
              <Badge className={getRiskColor(overallRiskScore)}>
                {overallRiskScore >= 70 ? 'Hoch' : overallRiskScore >= 50 ? 'Medium' : 'Niedrig'}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">Letztes Update: vor 2 Stunden</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Risiko-Entwicklung</span>
                <span className="text-red-600">↑ +4 Punkte (30 Tage)</span>
              </div>
              <Progress value={overallRiskScore} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-red-600">3</div>
                <div className="text-xs text-gray-500">Kritische Risiken</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">7</div>
                <div className="text-xs text-gray-500">Hohe Risiken</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">12</div>
                <div className="text-xs text-gray-500">Aktive Mitigationen</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">85%</div>
                <div className="text-xs text-gray-500">Erfolgsrate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {riskCategories.map((category) => (
          <Card key={category.category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${getRiskColor(category.risk_score).split(' ')[0]}`} />
                <span className={`text-lg font-bold ${getRiskColor(category.risk_score).split(' ')[0]}`}>
                  {category.risk_score}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={category.risk_score} className="mb-3 h-2" />
              <div className="space-y-2">
                {category.key_risks.slice(0, 2).map((risk, index) => (
                  <div key={index} className="text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      {getSeverityBadge(risk.severity)}
                      <span className="text-gray-600">{risk.probability}%</span>
                    </div>
                    <p className="text-gray-700 line-clamp-2">{risk.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Risk Analysis */}
      <Tabs defaultValue="risks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risks">Identifizierte Risiken</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation Plans</TabsTrigger>
          <TabsTrigger value="trends">Risiko-Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detaillierte Risiko-Analyse</CardTitle>
              <CardDescription>
                Alle identifizierten Risiken mit Impact-Assessment und Wahrscheinlichkeiten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {riskCategories.map((category) => (
                  <div key={category.category}>
                    <h4 className="font-medium text-lg mb-3 flex items-center gap-2">
                      {category.category}
                      <Badge className={getRiskColor(category.risk_score)}>
                        Score: {category.risk_score}
                      </Badge>
                    </h4>
                    
                    <div className="space-y-3">
                      {category.key_risks.map((risk, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                              <div>
                                <h5 className="font-medium">{risk.title}</h5>
                                <p className="text-sm text-gray-600 mt-1">{risk.impact}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(risk.severity)}
                              {getStatusIcon(risk.mitigation_status)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-gray-500">Wahrscheinlichkeit:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={risk.probability} className="flex-1 h-2" />
                                <span className="font-medium">{risk.probability}%</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Mitigation Status:</span>
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusIcon(risk.mitigation_status)}
                                <span className="capitalize">
                                  {risk.mitigation_status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mitigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktive Mitigation Plans</CardTitle>
              <CardDescription>
                Detaillierte Pläne zur Risikominimierung mit Aktionen und Timelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mitigationPlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-lg">{plan.risk_title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{plan.strategy}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-blue-100 text-blue-800">
                          {plan.success_probability}% Erfolgsrate
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          €{plan.cost_estimate.toLocaleString()} • {plan.timeline_weeks} Wochen
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-medium">Aktionen:</h5>
                      {plan.actions.map((action, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                          {getStatusIcon(action.status)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{action.description}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>Fällig: {action.due_date}</span>
                              <span>Verantwortlich: {action.responsible}</span>
                            </div>
                          </div>
                          <Badge 
                            variant={action.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {action.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        Plan bearbeiten
                      </Button>
                      <Button size="sm" variant="outline">
                        Status aktualisieren
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risiko-Trend Analyse</CardTitle>
              <CardDescription>
                Entwicklung der Risiko-Scores über die letzten Monate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingDown className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Risiko-Trend Chart</p>
                  <p className="text-sm">Zeigt Entwicklung über Zeit</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-600">+12%</div>
                  <div className="text-xs text-red-600">Operational Risk</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="text-lg font-bold text-orange-600">+8%</div>
                  <div className="text-xs text-orange-600">Financial Risk</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <div className="text-lg font-bold text-yellow-600">+3%</div>
                  <div className="text-xs text-yellow-600">Strategic Risk</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">-2%</div>
                  <div className="text-xs text-green-600">Compliance Risk</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Sofortige Handlungsempfehlungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Kritisch: Engineering Recruiting beschleunigen</p>
                <p className="text-sm text-red-700">
                  Unterbesetzung erreicht kritisches Niveau. Sofortige Maßnahmen erforderlich.
                </p>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                Jetzt handeln
              </Button>
            </div>

            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <Users className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-orange-900">Security Training initiieren</p>
                <p className="text-sm text-orange-700">
                  Cloud Security Skills-Gap schließen durch gezieltes Training.
                </p>
              </div>
              <Button size="sm" variant="outline">
                Training planen
              </Button>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Retention-Gespräche im Marketing</p>
                <p className="text-sm text-blue-700">
                  Fluktuationsrisiko durch proaktive Mitarbeitergespräche reduzieren.
                </p>
              </div>
              <Button size="sm" variant="outline">
                Termine planen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
