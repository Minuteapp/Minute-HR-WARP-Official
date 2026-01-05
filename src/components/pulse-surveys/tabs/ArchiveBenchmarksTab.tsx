import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Archive, 
  TrendingUp, 
  BarChart3, 
  Target,
  Search,
  Download,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";

const archivedSurveys: Array<{
  title: string;
  type: string;
  description: string;
  participants: number;
  responseRate: number;
  avgScore: number;
  completedAt: string;
  department: string;
}> = [];

const historicalTrendData: Array<{
  quarter: string;
  engagement: number;
  zufriedenheit: number;
  enps: number;
}> = [];

const comparisonData: Array<{
  name: string;
  current: number;
  previous: number;
  target: number;
}> = [];

const departmentRanking: Array<{
  rank: number;
  name: string;
  score: number;
  color: string;
}> = [];

const locationData: Array<{
  name: string;
  score: number;
}> = [];

const externalBenchmarks: Array<{
  metric: string;
  company: number;
  industry: number;
  diff: string;
  status: string;
}> = [];

const targetValues: Array<{
  title: string;
  current: number;
  target: number;
  deadline: string;
  status: string;
  progress: number;
}> = [];

export const ArchiveBenchmarksTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("archiv");

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "Engagement": return "bg-blue-100 text-blue-700";
      case "Führung": return "bg-violet-100 text-violet-700";
      case "Onboarding": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Archiv & Benchmarks</h2>
        <p className="text-sm text-muted-foreground">Historische Daten und Vergleichswerte</p>
      </div>

      {/* Sub-Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger 
            value="archiv" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archiv
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger 
            value="benchmarks" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Benchmarks
          </TabsTrigger>
          <TabsTrigger 
            value="zielwerte" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2"
          >
            <Target className="h-4 w-4 mr-2" />
            Zielwerte
          </TabsTrigger>
        </TabsList>

        {/* Archiv Tab */}
        <TabsContent value="archiv" className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Archiv durchsuchen..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {archivedSurveys.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Keine archivierten Umfragen</h3>
                <p className="text-sm text-muted-foreground">
                  Abgeschlossene Umfragen werden hier angezeigt.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {archivedSurveys.map((survey, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{survey.title}</h4>
                          <Badge className={getBadgeColor(survey.type)}>{survey.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{survey.description}</p>
                        <div className="grid grid-cols-5 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Teilnehmer</p>
                            <p className="font-medium">{survey.participants}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rücklauf</p>
                            <p className="font-medium">{survey.responseRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Ø Score</p>
                            <p className="font-medium">{survey.avgScore}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Abgeschlossen</p>
                            <p className="font-medium">{survey.completedAt}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Bereich</p>
                            <p className="font-medium">{survey.department}</p>
                          </div>
                        </div>
                        <button className="text-red-600 hover:underline text-sm font-medium mt-3">
                          Ergebnisse ansehen →
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-6 space-y-6">
          {historicalTrendData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Keine Trenddaten verfügbar</h3>
                <p className="text-sm text-muted-foreground">
                  Sobald mehrere Umfragen abgeschlossen wurden, werden hier Trends angezeigt.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Historischer Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis yAxisId="left" domain={[6.5, 8]} />
                      <YAxis yAxisId="right" orientation="right" domain={[20, 50]} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="engagement" name="Engagement" stroke="#3B82F6" strokeWidth={2} />
                      <Line yAxisId="left" type="monotone" dataKey="zufriedenheit" name="Zufriedenheit" stroke="#22C55E" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="enps" name="eNPS" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vorher / Nachher Vergleich</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 10]} />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="current" name="Aktuell" fill="#8B5CF6" />
                      <Bar dataKey="previous" name="Vorherige" fill="#D1D5DB" />
                      <Bar dataKey="target" name="Zielwert" fill="#22C55E" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="mt-6 space-y-6">
          {departmentRanking.length === 0 && externalBenchmarks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Keine Benchmark-Daten verfügbar</h3>
                <p className="text-sm text-muted-foreground">
                  Benchmark-Vergleiche werden hier angezeigt, sobald Daten vorhanden sind.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Abteilungs-Ranking</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {departmentRanking.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Keine Daten</p>
                    ) : (
                      departmentRanking.map((dept) => (
                        <div key={dept.rank} className="flex items-center gap-3">
                          <span className="w-6 text-sm font-medium text-muted-foreground">#{dept.rank}</span>
                          <span className="w-24 text-sm font-medium">{dept.name}</span>
                          <div className="flex-1">
                            <Progress value={dept.score * 10} className={`h-2 ${dept.color}`} />
                          </div>
                          <span className="text-sm font-bold w-8">{dept.score}</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Standort-Vergleich</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {locationData.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Keine Daten</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={locationData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[6.5, 8]} />
                          <Tooltip />
                          <Bar dataKey="score" fill="#8B5CF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Externe Benchmarks</CardTitle>
                </CardHeader>
                <CardContent>
                  {externalBenchmarks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Keine externen Benchmark-Daten verfügbar</p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-sm font-medium text-muted-foreground">Metrik</th>
                          <th className="text-center py-2 text-sm font-medium text-muted-foreground">Unternehmen</th>
                          <th className="text-center py-2 text-sm font-medium text-muted-foreground">Branchenschnitt</th>
                          <th className="text-center py-2 text-sm font-medium text-muted-foreground">Differenz</th>
                          <th className="text-center py-2 text-sm font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {externalBenchmarks.map((benchmark, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 text-sm font-medium">{benchmark.metric}</td>
                            <td className="py-3 text-sm text-center">{benchmark.company}</td>
                            <td className="py-3 text-sm text-center">{benchmark.industry}</td>
                            <td className="py-3 text-sm text-center font-medium">
                              <span className={benchmark.status === "up" ? "text-green-600" : benchmark.status === "down" ? "text-red-600" : "text-gray-600"}>
                                {benchmark.diff}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              {benchmark.status === "up" && <ArrowUp className="h-4 w-4 text-green-600 mx-auto" />}
                              {benchmark.status === "down" && <ArrowDown className="h-4 w-4 text-red-600 mx-auto" />}
                              {benchmark.status === "same" && <Minus className="h-4 w-4 text-gray-600 mx-auto" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Zielwerte Tab */}
        <TabsContent value="zielwerte" className="mt-6 space-y-6">
          {targetValues.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Keine Zielwerte definiert</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Definieren Sie messbare Ziele für Ihre Engagement-Metriken.
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Neuen Zielwert erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                {targetValues.map((target, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-semibold">{target.title}</h4>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={target.status === "on-track" ? "text-green-600 border-green-600" : "text-orange-600 border-orange-600"}
                        >
                          {target.status === "on-track" ? "On Track" : "Attention"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Deadline: {target.deadline}</p>
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Aktuell</p>
                          <p className="text-xl font-bold">{target.current}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ziel</p>
                          <p className="text-xl font-bold text-green-600">{target.target}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Fortschritt</span>
                          <span>{target.progress}%</span>
                        </div>
                        <Progress 
                          value={target.progress} 
                          className={`h-2 ${target.status === "on-track" ? "bg-green-100" : "bg-orange-100"}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-l-4 border-l-violet-500">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Zielwerte festlegen</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Definieren Sie messbare Ziele für Ihre Engagement-Metriken und verfolgen Sie den Fortschritt über Zeit.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Neuen Zielwert erstellen
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
