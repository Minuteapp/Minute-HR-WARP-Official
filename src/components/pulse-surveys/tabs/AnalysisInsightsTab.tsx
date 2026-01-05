import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Filter, Download, TrendingUp, TrendingDown, Minus,
  Bot, AlertTriangle, Users
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

export const AnalysisInsightsTab = () => {
  const [selectedSurvey, setSelectedSurvey] = useState('q2-2025');

  const kpis = [
    { label: 'Gesamt-Score', value: '7.4', change: '+0.3', trend: 'up', color: 'text-green-600' },
    { label: 'Teilnahmequote', value: '82%', subtitle: '426 Antworten', trend: 'neutral' },
    { label: 'Positive Stimmung', value: '68%', change: '+4%', trend: 'up', color: 'text-green-600' },
    { label: 'Kritische Bereiche', value: '2', subtitle: 'Aufmerksamkeit erforderlich', trend: 'down', color: 'text-red-600' },
  ];

  const dimensionsData = [
    { name: 'Engagement', score: 7.8, color: '#22c55e' },
    { name: 'Führung', score: 7.2, color: '#3b82f6' },
    { name: 'Entwicklung', score: 6.9, color: '#f59e0b' },
    { name: 'Work-Life-Balance', score: 7.5, color: '#8b5cf6' },
    { name: 'Kommunikation', score: 6.5, color: '#ec4899' },
  ];

  const trendData = [
    { period: 'Q1 2024', score: 6.8 },
    { period: 'Q2 2024', score: 7.0 },
    { period: 'Q3 2024', score: 7.1 },
    { period: 'Q4 2024', score: 7.2 },
    { period: 'Q1 2025', score: 7.1 },
    { period: 'Q2 2025', score: 7.4 },
  ];

  const distributionData = [
    { range: '9-10', count: 145, color: '#22c55e' },
    { range: '7-8', count: 168, color: '#84cc16' },
    { range: '5-6', count: 78, color: '#f59e0b' },
    { range: '3-4', count: 28, color: '#f97316' },
    { range: '1-2', count: 7, color: '#ef4444' },
  ];

  const departmentData = [
    { name: 'Sales', score: 7.9 },
    { name: 'Marketing', score: 7.6 },
    { name: 'HR', score: 7.5 },
    { name: 'Produkt', score: 7.2 },
    { name: 'IT', score: 6.4 },
    { name: 'Finance', score: 7.1 },
  ];

  const sentimentData = [
    { name: 'Positiv', value: 68, color: '#22c55e' },
    { name: 'Neutral', value: 24, color: '#f59e0b' },
    { name: 'Negativ', value: 8, color: '#ef4444' },
  ];

  const themes = [
    { emoji: '🤝', name: 'Teamzusammenhalt', score: 8.2, mentions: 156 },
    { emoji: '⚖️', name: 'Workload', score: 6.5, mentions: 134 },
    { emoji: '💬', name: 'Kommunikation', score: 6.8, mentions: 128 },
    { emoji: '📈', name: 'Karriereentwicklung', score: 6.4, mentions: 112 },
    { emoji: '🏠', name: 'Remote Work', score: 7.4, mentions: 98 },
    { emoji: '🎯', name: 'Zielklarheit', score: 7.1, mentions: 87 },
  ];

  const correlations = [
    { factor1: 'Führungsqualität', factor2: 'Engagement', correlation: 0.82, strength: 'Strong', color: 'bg-green-500' },
    { factor1: 'Work-Life-Balance', factor2: 'Zufriedenheit', correlation: 0.76, strength: 'Strong', color: 'bg-green-500' },
    { factor1: 'Entwicklungsmöglichkeiten', factor2: 'Bindung', correlation: 0.71, strength: 'Moderate', color: 'bg-yellow-500' },
  ];

  const risks = [
    { 
      title: 'Fluktuation', 
      priority: 'Mittel', 
      priorityColor: 'bg-yellow-100 text-yellow-700',
      affected: 12,
      indicator: 'Sinkende Engagement-Werte in IT',
      recommendation: 'Führungskräfte-Gespräche initiieren'
    },
    { 
      title: 'Burnout', 
      priority: 'Hoch', 
      priorityColor: 'bg-red-100 text-red-700',
      affected: 8,
      indicator: 'Hohe Workload-Beschwerden',
      recommendation: 'Kapazitätsprüfung durchführen'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Auswertung & Insights</h2>
          <p className="text-sm text-muted-foreground">Detaillierte Analyse Ihrer Umfrageergebnisse</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="q2-2025">Q2 Engagement Survey 2025</SelectItem>
              <SelectItem value="q1-2025">Q1 Pulse Survey 2025</SelectItem>
              <SelectItem value="q4-2024">Q4 Engagement Survey 2024</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="current">
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Aktuell</SelectItem>
              <SelectItem value="previous">Vorherige</SelectItem>
              <SelectItem value="all">Alle</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold">{kpi.value}</span>
                {kpi.change && (
                  <span className={`text-sm flex items-center gap-1 ${kpi.color || 'text-muted-foreground'}`}>
                    {kpi.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                    {kpi.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                    {kpi.change}
                  </span>
                )}
                {kpi.subtitle && (
                  <span className={`text-xs ${kpi.color || 'text-muted-foreground'}`}>
                    {kpi.subtitle}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KI-Analyse Zusammenfassung */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">KI-Analyse Zusammenfassung</h3>
          </div>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Positive Entwicklung:</span>{' '}
              Das Engagement ist um 0.3 Punkte gestiegen, getrieben durch verbesserte Teamzusammenarbeit (+0.5) und Führungsfeedback (+0.4).
            </p>
            <p>
              <span className="font-medium">Kritische Bereiche:</span>{' '}
              Die IT-Abteilung zeigt mit 6.4 Punkten den niedrigsten Score. Hauptthemen: Workload (6.1) und Karriereentwicklung (5.8).
            </p>
            <p>
              <span className="font-medium">Handlungsempfehlung:</span>{' '}
              Fokussierte Maßnahmen für IT-Team priorisieren. Führungskräfte-Workshop zur Kommunikation empfohlen.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dimensionen im Vergleich */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dimensionen im Vergleich</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dimensionsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 10]} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend über Zeit */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Trend über Zeit</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis domain={[6, 8]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bewertungsverteilung */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Bewertungsverteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Nach Abteilungen */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Nach Abteilungen</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 10]} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment & Themen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment-Analyse */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sentiment-Analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {sentimentData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name} {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Themen-Clustering */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Themen-Clustering</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {themes.map((theme, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-lg">{theme.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{theme.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{theme.score}</span>
                      <span className="text-xs text-muted-foreground">{theme.mentions}×</span>
                    </div>
                  </div>
                  <Progress value={theme.score * 10} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Treiberanalysen & Risiken */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treiberanalysen & Korrelationen */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Treiberanalysen & Korrelationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {correlations.map((corr, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{corr.factor1} ↔ {corr.factor2}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{corr.correlation}</span>
                    <Badge variant="secondary" className={`text-xs ${
                      corr.strength === 'Strong' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {corr.strength}
                    </Badge>
                  </div>
                </div>
                <Progress value={corr.correlation * 100} className={`h-2 ${corr.color}`} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Risikoerkennung & Frühindikatoren */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Risikoerkennung & Frühindikatoren
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {risks.map((risk, index) => (
              <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{risk.title}</span>
                    <Badge className={risk.priorityColor}>{risk.priority}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{risk.affected} Betroffene</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium">Indikator:</span> {risk.indicator}
                </p>
                <p className="text-sm text-red-600">
                  <span className="font-medium">Empfehlung:</span> {risk.recommendation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
