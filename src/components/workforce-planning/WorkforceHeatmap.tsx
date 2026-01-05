
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, TrendingUp, Users, AlertTriangle } from "lucide-react";

interface WorkforceData {
  department: string;
  month: string;
  capacity: number;
  demand: number;
  utilization: number;
  headcount: number;
  skills: string[];
}

interface HeatmapCell {
  department: string;
  month: string;
  value: number;
  status: 'under' | 'optimal' | 'over' | 'critical';
  details: WorkforceData;
}

export const WorkforceHeatmap = () => {
  const [selectedMetric, setSelectedMetric] = useState<'utilization' | 'capacity' | 'demand'>('utilization');
  const [selectedPeriod, setSelectedPeriod] = useState<'6months' | '12months' | '24months'>('12months');
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  // Real data will come from API
  const workforceData: WorkforceData[] = [];

  const departments = Array.from(new Set(workforceData.map(d => d.department)));
  const months = Array.from(new Set(workforceData.map(d => d.month))).sort();

  const getStatusFromValue = (value: number, metric: string): 'under' | 'optimal' | 'over' | 'critical' => {
    if (metric === 'utilization') {
      if (value < 60) return 'under';
      if (value <= 85) return 'optimal';
      if (value <= 95) return 'over';
      return 'critical';
    }
    return 'optimal';
  };

  const getColorFromStatus = (status: 'under' | 'optimal' | 'over' | 'critical'): string => {
    switch (status) {
      case 'under':
        return 'bg-blue-200 hover:bg-blue-300';
      case 'optimal':
        return 'bg-green-200 hover:bg-green-300';
      case 'over':
        return 'bg-yellow-200 hover:bg-yellow-300';
      case 'critical':
        return 'bg-red-200 hover:bg-red-300';
      default:
        return 'bg-gray-200 hover:bg-gray-300';
    }
  };

  const heatmapData = useMemo(() => {
    const data: HeatmapCell[] = [];
    
    departments.forEach(department => {
      months.forEach(month => {
        const workData = workforceData.find(d => d.department === department && d.month === month);
        if (workData) {
          const value = selectedMetric === 'utilization' ? workData.utilization :
                       selectedMetric === 'capacity' ? workData.capacity :
                       workData.demand;
          
          data.push({
            department,
            month,
            value,
            status: getStatusFromValue(value, selectedMetric),
            details: workData
          });
        }
      });
    });
    
    return data;
  }, [workforceData, selectedMetric, departments, months]);

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'utilization':
        return 'Auslastung (%)';
      case 'capacity':
        return 'Kapazität';
      case 'demand':
        return 'Bedarf';
      default:
        return metric;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'under':
        return 'Unterausgelastet';
      case 'optimal':
        return 'Optimal';
      case 'over':
        return 'Überausgelastet';
      case 'critical':
        return 'Kritisch';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Workforce Heatmap</h2>
          <p className="text-sm text-gray-500">
            Visualisierung der Personalauslastung nach Abteilungen und Zeiträumen
          </p>
        </div>
      </div>

      {/* Steuerung */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Metrik:</label>
          <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utilization">Auslastung</SelectItem>
              <SelectItem value="capacity">Kapazität</SelectItem>
              <SelectItem value="demand">Bedarf</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Zeitraum:</label>
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">6 Monate</SelectItem>
              <SelectItem value="12months">12 Monate</SelectItem>
              <SelectItem value="24months">24 Monate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Heatmap */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    {getMetricLabel(selectedMetric)} Heatmap
                  </CardTitle>
                  <CardDescription>
                    Klicken Sie auf eine Zelle für Details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Header mit Monaten */}
                    <div className="grid grid-cols-1 gap-2">
                      <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${months.length}, 1fr)` }}>
                        <div></div>
                        {months.map(month => (
                          <div key={month} className="text-xs font-medium text-gray-600 text-center p-2">
                            {new Date(month).toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })}
                          </div>
                        ))}
                      </div>
                      
                      {/* Heatmap Daten */}
                      {departments.map(department => (
                        <div key={department} className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${months.length}, 1fr)` }}>
                          <div className="text-sm font-medium text-gray-800 p-2 flex items-center">
                            {department}
                          </div>
                          {months.map(month => {
                            const cell = heatmapData.find(d => d.department === department && d.month === month);
                            return (
                              <Button
                                key={`${department}-${month}`}
                                variant="ghost"
                                className={`h-12 p-2 ${cell ? getColorFromStatus(cell.status) : 'bg-gray-100'} border border-gray-200 cursor-pointer`}
                                onClick={() => cell && setSelectedCell(cell)}
                              >
                                <div className="text-center">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {cell ? cell.value : '-'}
                                    {selectedMetric === 'utilization' && cell ? '%' : ''}
                                  </div>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Legende */}
                    <div className="flex items-center justify-center gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                        <span className="text-xs text-gray-600">Unterausgelastet</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-200 rounded"></div>
                        <span className="text-xs text-gray-600">Optimal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                        <span className="text-xs text-gray-600">Überausgelastet</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-200 rounded"></div>
                        <span className="text-xs text-gray-600">Kritisch</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details Panel */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCell ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedCell.department}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedCell.month).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <Badge className={
                            selectedCell.status === 'under' ? 'bg-blue-100 text-blue-800' :
                            selectedCell.status === 'optimal' ? 'bg-green-100 text-green-800' :
                            selectedCell.status === 'over' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {getStatusLabel(selectedCell.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Auslastung:</span>
                          <span className="text-sm font-medium">{selectedCell.details.utilization}%</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Kapazität:</span>
                          <span className="text-sm font-medium">{selectedCell.details.capacity}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Bedarf:</span>
                          <span className="text-sm font-medium">{selectedCell.details.demand}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Mitarbeiter:</span>
                          <span className="text-sm font-medium">{selectedCell.details.headcount}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedCell.details.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Wählen Sie eine Zelle in der Heatmap aus, um Details anzuzeigen
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trends Analyse
              </CardTitle>
              <CardDescription>
                Entwicklung der Personalauslastung über Zeit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Trends Analyse wird geladen...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Hier werden zukünftig detaillierte Trend-Analysen angezeigt
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                KI Insights
              </CardTitle>
              <CardDescription>
                Automatisch generierte Erkenntnisse und Handlungsempfehlungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">KI Insights werden generiert...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Hier werden zukünftig KI-basierte Erkenntnisse und Empfehlungen angezeigt
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
