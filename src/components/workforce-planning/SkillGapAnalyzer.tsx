
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Target, TrendingUp, Users, BookOpen, UserPlus, AlertTriangle, Filter, Download } from "lucide-react";
import { useSkillGapAnalysis } from '@/hooks/useWorkforcePlanning';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export const SkillGapAnalyzer = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [skillCategory, setSkillCategory] = useState<string>('all');
  
  const { data: skillAnalysis, isLoading } = useSkillGapAnalysis({
    department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
    category: skillCategory !== 'all' ? skillCategory : undefined
  });

  // Mock data für Skill Gap Analysis
  const skillGapData = [
    {
      skill: 'Cloud Security',
      category: 'Technical',
      current: 45,
      required: 75,
      gap: 30,
      priority: 'critical',
      cost_to_close: 180000,
      time_months: 6,
      recommendation: 'hire'
    },
    {
      skill: 'Machine Learning',
      category: 'Technical',
      current: 30,
      required: 50,
      gap: 20,
      priority: 'high',
      cost_to_close: 120000,
      time_months: 8,
      recommendation: 'train'
    },
    {
      skill: 'Digital Marketing',
      category: 'Marketing',
      current: 60,
      required: 80,
      gap: 20,
      priority: 'medium',
      cost_to_close: 45000,
      time_months: 4,
      recommendation: 'train'
    },
    {
      skill: 'Project Management',
      category: 'Management',
      current: 80,
      required: 90,
      gap: 10,
      priority: 'low',
      cost_to_close: 25000,
      time_months: 3,
      recommendation: 'train'
    },
    {
      skill: 'Data Analysis',
      category: 'Technical',
      current: 55,
      required: 70,
      gap: 15,
      priority: 'medium',
      cost_to_close: 35000,
      time_months: 5,
      recommendation: 'train'
    }
  ];

  const departmentSkillMatrix = [
    {
      department: 'Engineering',
      skills: {
        'Cloud Security': 65,
        'Machine Learning': 40,
        'Frontend Dev': 85,
        'Backend Dev': 90,
        'DevOps': 70
      },
      overall_score: 70
    },
    {
      department: 'Marketing',
      skills: {
        'Digital Marketing': 75,
        'SEO/SEM': 60,
        'Content Creation': 80,
        'Analytics': 55,
        'Social Media': 85
      },
      overall_score: 71
    },
    {
      department: 'Sales',
      skills: {
        'CRM Usage': 90,
        'Lead Generation': 75,
        'Negotiation': 80,
        'Product Knowledge': 85,
        'Customer Success': 70
      },
      overall_score: 80
    }
  ];

  const skillCategoryData = [
    { name: 'Technical', gap_count: 45, color: '#ef4444' },
    { name: 'Management', gap_count: 12, color: '#f97316' },
    { name: 'Marketing', gap_count: 8, color: '#eab308' },
    { name: 'Sales', gap_count: 6, color: '#22c55e' },
    { name: 'HR', gap_count: 4, color: '#3b82f6' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge variant="destructive">Kritisch</Badge>;
      case 'high': return <Badge className="bg-orange-500 hover:bg-orange-600">Hoch</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case 'low': return <Badge className="bg-green-500 hover:bg-green-600">Niedrig</Badge>;
      default: return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Abteilung wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Abteilungen</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
            </SelectContent>
          </Select>

          <Select value={skillCategory} onValueChange={setSkillCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Skill-Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Erweiterte Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Skill Matrix aktualisieren
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kritische Skill Gaps</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 absolute top-4 right-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
            <div className="text-xs text-muted-foreground">
              Sofortiger Handlungsbedarf
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Skill Gaps</CardTitle>
            <Target className="h-4 w-4 text-orange-600 absolute top-4 right-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75</div>
            <div className="text-xs text-muted-foreground">
              Alle Prioritätsstufen
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Training-Empfehlungen</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600 absolute top-4 right-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <div className="text-xs text-muted-foreground">
              Interne Weiterbildung möglich
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hiring-Empfehlungen</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600 absolute top-4 right-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">33</div>
            <div className="text-xs text-muted-foreground">
              Externe Rekrutierung nötig
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Skill Gaps Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kritische Skill Gaps - Sofortiger Handlungsbedarf</CardTitle>
          <CardDescription>
            Skills mit höchster Priorität und direktem Business Impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillGapData.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-12 rounded ${getPriorityColor(skill.priority)}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{skill.skill}</h3>
                      {getPriorityBadge(skill.priority)}
                    </div>
                    <p className="text-sm text-gray-500">{skill.category}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-xs">
                        <span className="text-gray-500">Aktuell:</span> <span className="font-medium">{skill.current}%</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Benötigt:</span> <span className="font-medium">{skill.required}%</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Gap:</span> <span className="font-medium text-red-600">{skill.gap}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">€{skill.cost_to_close.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{skill.time_months} Monate</p>
                  </div>
                  <Badge variant={skill.recommendation === 'hire' ? 'default' : 'secondary'}>
                    {skill.recommendation === 'hire' ? 'Hiring' : 'Training'}
                  </Badge>
                  <Button size="sm" variant="outline">
                    {skill.recommendation === 'hire' ? 'Job erstellen' : 'Training planen'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Skill Gaps nach Kategorie</CardTitle>
            <CardDescription>
              Verteilung der identifizierten Skill Gaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="gap_count"
                  >
                    {skillCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Level nach Abteilung</CardTitle>
            <CardDescription>
              Aktueller Skill-Stand der Teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentSkillMatrix.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dept.department}</span>
                    <Badge variant={dept.overall_score >= 75 ? 'default' : 'secondary'}>
                      {dept.overall_score}% Gesamt
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(dept.skills).map(([skill, level]) => (
                      <div key={skill} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{skill}</span>
                        <div className="flex items-center gap-2 w-32">
                          <Progress value={level} className="flex-1" />
                          <span className="text-xs w-8">{level}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            KI-Empfehlungen für Skill Gap Schließung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-green-700">Training-Empfehlungen</h4>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cloud Security Bootcamp</p>
                      <p className="text-sm text-gray-600">12 Teilnehmer • 6 Wochen • €35,000</p>
                    </div>
                    <Button size="sm">Planen</Button>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">ML/AI Zertifizierung</p>
                      <p className="text-sm text-gray-600">8 Teilnehmer • 8 Wochen • €25,000</p>
                    </div>
                    <Button size="sm">Planen</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-blue-700">Hiring-Empfehlungen</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Senior Cloud Security Engineer</p>
                      <p className="text-sm text-gray-600">2 Positionen • €85-110k • 8 Wochen TTH</p>
                    </div>
                    <Button size="sm">Job erstellen</Button>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">ML Engineer</p>
                      <p className="text-sm text-gray-600">1 Position • €70-95k • 10 Wochen TTH</p>
                    </div>
                    <Button size="sm">Job erstellen</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
