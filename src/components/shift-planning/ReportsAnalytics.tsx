import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, Clock, Download } from 'lucide-react';

const reportStats = [
  { title: 'Gesamte Schichten', value: '152', subtitle: '-17% vs. letzter Monat', color: 'text-blue-600', icon: BarChart3 },
  { title: 'Planungsgenauigkeit', value: '94%', subtitle: 'Geplant vs. Tatsächlich', color: 'text-green-600', icon: TrendingUp },
  { title: 'Durchschn. Effizienz', value: '92%', subtitle: '+3% vs. letzter Monat', color: 'text-purple-600', icon: Users },
  { title: 'Kosteneinsparung', value: '€12,500', subtitle: 'Durch Optimierung', color: 'text-orange-600', icon: Clock }
];

const weeklyData = [
  { day: 'Mo', value: 22 },
  { day: 'Di', value: 24 },
  { day: 'Mi', value: 21 },
  { day: 'Do', value: 20 },
  { day: 'Fr', value: 23 },
  { day: 'Sa', value: 15 },
  { day: 'So', value: 13 }
];

const shiftDistribution = [
  { name: 'Frühschicht', value: 45, color: 'bg-blue-500' },
  { name: 'Spätschicht', value: 35, color: 'bg-green-500' },
  { name: 'Nachtschicht', value: 20, color: 'bg-orange-500' }
];

const efficiencyMetrics = [
  { metric: 'Schichtplanungsgenauigkeit', value: 94, color: 'bg-green-500' },
  { metric: 'Mitarbeiterzufriedenheit', value: 87, color: 'bg-blue-500' },
  { metric: 'Arbeitsplatzauslastung', value: 89, color: 'bg-purple-500' },
  { metric: 'Pünktlichkeit', value: 91, color: 'bg-orange-500' }
];

const skillUtilization = [
  { skill: 'Grundqualifikation', utilization: 95, trend: '+5%', color: 'text-green-600' },
  { skill: 'Turbine A Zertifikat', utilization: 90, trend: '+2%', color: 'text-green-600' },
  { skill: 'Wartung', utilization: 76, trend: '-1%', color: 'text-red-600' },
  { skill: 'Qualitätskontrolle', utilization: 64, trend: '+3%', color: 'text-green-600' },
  { skill: 'Nachtwache', utilization: 40, trend: '-5%', color: 'text-red-600' }
];

const departmentComparison = [
  { department: 'Produktion', employees: 23, efficiency: '92%', performance: 'text-green-600' },
  { department: 'Wartung', employees: 12, efficiency: '85%', performance: 'text-yellow-600' },
  { department: 'Qualität', employees: 8, efficiency: '78%', performance: 'text-orange-600' },
  { department: 'Administration', employees: 5, efficiency: '65%', performance: 'text-red-600' }
];

const productivityInsights = [
  { category: 'Stärken', items: ['Hohe Planungsgenauigkeit (94%)', 'Effiziente Schichtübergaben', 'Geringe Krankheitstage', 'Optimale Skill-Verteilung'] },
  { category: 'Optimierungspotential', items: ['Überstunden reduzieren', 'Wochenend-Abdeckung verbessern', 'Backup-Systeme ausbauen', 'Schulungszeiten optimieren'] }
];

const skillRecommendations = [
  { type: 'Trainingsbedarf', items: ['Zusätzliches Turbine A Zertifikat (4 Mitarbeiter)', 'Nachtwache Qualifikation (3 Mitarbeiter)', 'Wartungspezialisierung (2 Mitarbeiter)'] },
  { type: 'Gut abgedeckt', items: ['Grundqualifikation (100% Abdeckung)', 'Administration (ausreichend)', 'Qualitätskontrolle (gute Verteilung)'] }
];

export const ReportsAnalytics = () => {
  const [timeFilter, setTimeFilter] = useState('month');
  const [reportType, setReportType] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Berichte & Analysen</h2>
        </div>
        <div className="flex items-center gap-3">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Übersicht</SelectItem>
              <SelectItem value="efficiency">Effizienz</SelectItem>
              <SelectItem value="skills">Skills</SelectItem>
              <SelectItem value="departments">Abteilungen</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Alle Abteilungen</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        {reportStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className="w-4 h-4 text-gray-600" />
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.subtitle}</div>
            </Card>
          );
        })}
      </div>

      {reportType === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Weekly Coverage */}
          <Card className="p-6">
            <h3 className="text-base font-medium mb-4">Wöchentliche Schichtabdeckung</h3>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-8">{day.day}</span>
                  <div className="flex-1 mx-3">
                    <div className="h-6 bg-blue-500 rounded" style={{ width: `${(day.value / 24) * 100}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{day.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Shift Distribution */}
          <Card className="p-6">
            <h3 className="text-base font-medium mb-4">Schichttyp Verteilung</h3>
            <div className="space-y-4">
              {shiftDistribution.map((shift, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-4 h-4 ${shift.color} rounded mr-3`}></div>
                  <span className="text-sm flex-1">{shift.name}</span>
                  <span className="text-sm font-medium">{shift.value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 relative">
              <div className="flex h-4 rounded-lg overflow-hidden">
                {shiftDistribution.map((shift, index) => (
                  <div 
                    key={index}
                    className={shift.color.replace('bg-', 'bg-')}
                    style={{ width: `${shift.value}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {reportType === 'efficiency' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Efficiency Metrics */}
          <Card className="p-6">
            <h3 className="text-base font-medium mb-4">Effizienz Metriken</h3>
            <div className="space-y-4">
              {efficiencyMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{metric.metric}</span>
                    <span className="text-sm font-medium">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${metric.color}`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Productivity Insights */}
          <Card className="p-6">
            <h3 className="text-base font-medium mb-4">Produktivitäts-Insights</h3>
            <div className="space-y-4">
              {productivityInsights.map((insight, index) => (
                <div key={index}>
                  <h4 className={`text-sm font-medium mb-2 ${
                    insight.category === 'Stärken' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {insight.category}
                  </h4>
                  <div className="space-y-1">
                    {insight.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-xs text-gray-600">
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {reportType === 'skills' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Skill Utilization */}
          <Card className="p-6">
            <h3 className="text-base font-medium mb-4">Skill-Auslastung</h3>
            <div className="space-y-3">
              {skillUtilization.map((skill, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{skill.skill}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="h-2 bg-black rounded-full"
                        style={{ width: `${skill.utilization}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium">{skill.utilization}%</div>
                    <div className={`text-xs ${skill.color}`}>{skill.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Skill Recommendations */}
          <Card className="p-6">
            <h3 className="text-base font-medium mb-4">Skill-Empfehlungen</h3>
            <div className="space-y-4">
              {skillRecommendations.map((rec, index) => (
                <div key={index}>
                  <h4 className={`text-sm font-medium mb-2 ${
                    rec.type === 'Trainingsbedarf' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {rec.type}
                  </h4>
                  <div className="space-y-1">
                    {rec.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-xs text-gray-600">
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {reportType === 'departments' && (
        <Card className="p-6">
          <h3 className="text-base font-medium mb-4">Abteilungsvergleich</h3>
          <div className="space-y-3">
            {departmentComparison.map((dept, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="font-medium text-sm">{dept.department}</div>
                  <div className="text-xs text-gray-500">Auslastung</div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 bg-black rounded-full"
                      style={{ width: dept.efficiency }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${dept.performance}`}>{dept.efficiency}</div>
                  <div className="text-xs text-gray-500">{dept.employees} Mitarbeiter</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};