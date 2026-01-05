import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertOctagon, AlertTriangle, AlertCircle, Info, ArrowUp, ArrowDown, ArrowRight, Plus, Download, Search, TrendingUp } from "lucide-react";
import { KPICard } from "../common/KPICard";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const risksData = {
  kpis: {
    critical: 3,
    high: 7,
    medium: 12,
    low: 8
  },
  matrix: [
    [0, 0, 0, 1, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ],
  risks: [
    {
      id: 'R-001',
      title: 'Datenmigrierung Komplexität',
      status: 'Aktiv',
      project: 'ERP Migration',
      category: 'Technisch',
      probability: 80,
      impact: 90,
      score: 72,
      owner: 'AS Anna Schmidt',
      measures: ['Externer Berater', 'Zusätzliche Tests'],
      residualRisk: 35,
      trend: 'up'
    },
    {
      id: 'R-002',
      title: 'Skill-Lücke Cloud Migration',
      status: 'in Bearbeitung',
      project: 'Cloud Infrastructure',
      category: 'Ressourcen',
      probability: 70,
      impact: 60,
      score: 42,
      owner: 'SW Sarah Weber',
      measures: ['Training buchen', 'Externe Unterstützung'],
      residualRisk: 20,
      trend: 'down'
    },
    {
      id: 'R-003',
      title: 'Budget-Überschreitung',
      status: 'Aktiv',
      project: 'ERP Migration',
      category: 'Finanziell',
      probability: 60,
      impact: 70,
      score: 42,
      owner: 'AS Anna Schmidt',
      measures: ['Wöchentliches Monitoring', 'Scope-Review'],
      residualRisk: 25,
      trend: 'stable'
    },
    {
      id: 'R-004',
      title: 'Vendor Lock-in',
      status: 'Überwacht',
      project: 'Cloud Infrastructure',
      category: 'Strategisch',
      probability: 40,
      impact: 80,
      score: 32,
      owner: 'SW Sarah Weber',
      measures: ['Multi-Cloud Strategie', 'Exit-Plan'],
      residualRisk: 15,
      trend: 'down'
    }
  ],
  issues: [
    {
      id: 'I-012',
      title: 'API Performance Probleme',
      project: 'Mobile App Redesign',
      type: 'Blocker',
      severity: 'Hoch',
      reportedBy: 'Max Müller',
      reportedAt: '15.10.2025',
      assignedTo: 'TF Tom Fischer',
      sla: '2 Tage',
      status: 'In Bearbeitung'
    },
    {
      id: 'I-013',
      title: 'Lizenz-Konflikt Bibliothek',
      project: 'ERP Migration',
      type: 'Impediment',
      severity: 'Mittel',
      reportedBy: 'Anna Schmidt',
      reportedAt: '14.10.2025',
      assignedTo: 'LT Legal Team',
      sla: '5 Tage',
      status: 'Eskaliert'
    },
    {
      id: 'I-014',
      title: 'Test-Environment instabil',
      project: 'Cloud Infrastructure',
      type: 'Blocker',
      severity: 'Hoch',
      reportedBy: 'Sarah Weber',
      reportedAt: '14.10.2025',
      assignedTo: 'DO DevOps Team',
      sla: '1 Tag',
      status: 'Offen'
    }
  ]
};

const getRiskColor = (score: number) => {
  if (score >= 60) return 'bg-red-500';
  if (score >= 42) return 'bg-orange-500';
  if (score >= 24) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getMatrixCellColor = (row: number, col: number) => {
  const score = (5 - row) * (col + 1);
  if (score >= 20) return 'bg-red-200';
  if (score >= 12) return 'bg-orange-200';
  if (score >= 6) return 'bg-yellow-200';
  return 'bg-green-200';
};

const riskTrendData = [
  { month: 'Jan', kritisch: 2, hoch: 5, mittel: 10, niedrig: 6 },
  { month: 'Feb', kritisch: 3, hoch: 6, mittel: 11, niedrig: 7 },
  { month: 'Mär', kritisch: 2, hoch: 7, mittel: 12, niedrig: 8 },
  { month: 'Apr', kritisch: 3, hoch: 7, mittel: 12, niedrig: 8 },
  { month: 'Mai', kritisch: 3, hoch: 7, mittel: 12, niedrig: 8 },
  { month: 'Jun', kritisch: 3, hoch: 7, mittel: 12, niedrig: 8 }
];

export const RisksView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  return (
    <div className="space-y-6">
      {/* Filter & Actions Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Risiko oder Issue suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Projekt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Projekte</SelectItem>
            <SelectItem value="erp">ERP Migration</SelectItem>
            <SelectItem value="cloud">Cloud Infrastructure</SelectItem>
            <SelectItem value="mobile">Mobile App Redesign</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            <SelectItem value="technisch">Technisch</SelectItem>
            <SelectItem value="finanziell">Finanziell</SelectItem>
            <SelectItem value="ressourcen">Ressourcen</SelectItem>
            <SelectItem value="strategisch">Strategisch</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Schwere" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Schweregrade</SelectItem>
            <SelectItem value="kritisch">Kritisch</SelectItem>
            <SelectItem value="hoch">Hoch</SelectItem>
            <SelectItem value="mittel">Mittel</SelectItem>
            <SelectItem value="niedrig">Niedrig</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="matrix">Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Kritisch Risiken"
              value={risksData.kpis.critical}
              icon={<AlertOctagon className="h-5 w-5 text-red-600" />}
              iconColor="bg-red-100"
            />
            <KPICard
              title="Hoch Risiken"
              value={risksData.kpis.high}
              icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
              iconColor="bg-orange-100"
            />
            <KPICard
              title="Mittel Risiken"
              value={risksData.kpis.medium}
              icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
              iconColor="bg-yellow-100"
            />
            <KPICard
              title="Niedrig Risiken"
              value={risksData.kpis.low}
              icon={<Info className="h-5 w-5 text-green-600" />}
              iconColor="bg-green-100"
            />
          </div>

          {/* Risiko-Register */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Risiko-Register</CardTitle>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Risiko erfassen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">ID</th>
                      <th className="text-left py-3 px-4 font-medium">Risiko</th>
                      <th className="text-left py-3 px-4 font-medium">Projekt</th>
                      <th className="text-left py-3 px-4 font-medium">Kategorie</th>
                      <th className="text-left py-3 px-4 font-medium">P × I</th>
                      <th className="text-left py-3 px-4 font-medium">Score</th>
                      <th className="text-left py-3 px-4 font-medium">Owner</th>
                      <th className="text-left py-3 px-4 font-medium">Maßnahmen</th>
                      <th className="text-left py-3 px-4 font-medium">Residualrisiko</th>
                      <th className="text-left py-3 px-4 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risksData.risks.map((risk) => (
                      <tr key={risk.id} className="border-b">
                        <td className="py-3 px-4 font-medium">{risk.id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{risk.title}</p>
                            <p className="text-xs text-muted-foreground">{risk.status}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{risk.project}</td>
                        <td className="py-3 px-4 text-sm">{risk.category}</td>
                        <td className="py-3 px-4 text-sm">{risk.probability}% × {risk.impact}%</td>
                        <td className="py-3 px-4">
                          <Badge className={`${getRiskColor(risk.score)} text-white`}>
                            {risk.score}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{risk.owner}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {risk.measures.map((measure, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{measure}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{risk.residualRisk}%</td>
                        <td className="py-3 px-4">
                          {risk.trend === 'up' && <ArrowUp className="h-4 w-4 text-red-500" />}
                          {risk.trend === 'down' && <ArrowDown className="h-4 w-4 text-green-500" />}
                          {risk.trend === 'stable' && <ArrowRight className="h-4 w-4 text-gray-500" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Issues & Blockers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Issues & Blockers</CardTitle>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Issue melden
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">ID</th>
                      <th className="text-left py-3 px-4 font-medium">Titel</th>
                      <th className="text-left py-3 px-4 font-medium">Projekt</th>
                      <th className="text-left py-3 px-4 font-medium">Typ</th>
                      <th className="text-left py-3 px-4 font-medium">Schwere</th>
                      <th className="text-left py-3 px-4 font-medium">Gemeldet von</th>
                      <th className="text-left py-3 px-4 font-medium">Zugewiesen</th>
                      <th className="text-left py-3 px-4 font-medium">SLA</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risksData.issues.map((issue) => (
                      <tr key={issue.id} className="border-b">
                        <td className="py-3 px-4 font-medium">{issue.id}</td>
                        <td className="py-3 px-4 font-medium">{issue.title}</td>
                        <td className="py-3 px-4 text-sm">{issue.project}</td>
                        <td className="py-3 px-4">
                          <Badge variant={issue.type === 'Blocker' ? 'destructive' : 'default'} className={issue.type === 'Impediment' ? 'bg-orange-500' : ''}>
                            {issue.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{issue.severity}</td>
                        <td className="py-3 px-4 text-sm">
                          <div>
                            <p>{issue.reportedBy}</p>
                            <p className="text-xs text-muted-foreground">{issue.reportedAt}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{issue.assignedTo}</td>
                        <td className="py-3 px-4 text-sm">{issue.sla}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={issue.status === 'Eskaliert' ? 'destructive' : 'default'}
                            className={
                              issue.status === 'In Bearbeitung' ? 'bg-blue-500' : 
                              issue.status === 'Offen' ? 'bg-orange-500' : ''
                            }
                          >
                            {issue.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risiko-Trendanalyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={riskTrendData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="kritisch" stroke="#DC2626" strokeWidth={2} name="Kritisch" />
                  <Line type="monotone" dataKey="hoch" stroke="#F97316" strokeWidth={2} name="Hoch" />
                  <Line type="monotone" dataKey="mittel" stroke="#FBBF24" strokeWidth={2} name="Mittel" />
                  <Line type="monotone" dataKey="niedrig" stroke="#10B981" strokeWidth={2} name="Niedrig" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Risiken nach Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {risksData.risks.slice(0, 4).map((risk) => (
                    <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{risk.title}</p>
                        <p className="text-sm text-muted-foreground">{risk.project}</p>
                      </div>
                      <Badge className={`${getRiskColor(risk.score)} text-white`}>
                        {risk.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risiko-Verteilung nach Kategorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Technisch', 'Finanziell', 'Ressourcen', 'Strategisch'].map((category, idx) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-muted-foreground">{[8, 5, 7, 10][idx]} Risiken</span>
                      </div>
                      <Progress value={[80, 50, 70, 100][idx]} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risiko-Matrix (Wahrscheinlichkeit × Auswirkung)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="w-24 flex items-center justify-center">
                    <span className="text-sm font-medium transform -rotate-90">Wahrscheinlichkeit</span>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-5 gap-2">
                      {risksData.matrix.map((row, rowIdx) => (
                        row.map((count, colIdx) => (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            className={`aspect-square ${getMatrixCellColor(rowIdx, colIdx)} border rounded-lg flex items-center justify-center text-lg font-semibold`}
                          >
                            {count > 0 ? count : ''}
                          </div>
                        ))
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <div key={num} className="text-center text-sm font-medium">{num}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm font-medium">Auswirkung</div>
                <div className="flex items-center gap-6 text-xs text-muted-foreground justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-200 rounded"></div>
                    <span>Kritisch (20-25)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-200 rounded"></div>
                    <span>Hoch (12-19)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                    <span>Mittel (6-11)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 rounded"></div>
                    <span>Niedrig (1-5)</span>
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