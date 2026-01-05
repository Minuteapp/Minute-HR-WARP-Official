
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Brain,
  Search,
  Filter,
  Plus,
  Star,
  Award,
  ChevronRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence: number;
  verified: boolean;
  lastUsed?: string;
  projectsUsed: number;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  skills: Skill[];
  availability: number; // Prozent
  currentProjects: number;
}

interface SkillsMatrixProps {
  projects: any[];
}

export const SkillsMatrix: React.FC<SkillsMatrixProps> = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Leeres Array für neue Firmen - später durch Supabase Query ersetzen
  const employees: Employee[] = [];

  const skillCategories = ['Frontend', 'Backend', 'Design', 'UX', 'Programming', 'Database', 'DevOps'];

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'beginner': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillLevelLabel = (level: string) => {
    switch (level) {
      case 'expert': return 'Experte';
      case 'advanced': return 'Fortgeschritten';
      case 'intermediate': return 'Mittelstufe';
      case 'beginner': return 'Anfänger';
      default: return level;
    }
  };

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 80) return 'text-green-600';
    if (availability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           employee.skills.some(skill => skill.category === selectedCategory);
    
    const matchesLevel = selectedLevel === 'all' || 
                        employee.skills.some(skill => skill.level === selectedLevel);
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Filter-Bereich */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Skills & Ressourcen-Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Nach Skills oder Mitarbeitern suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {skillCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Skill-Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Level</SelectItem>
                <SelectItem value="beginner">Anfänger</SelectItem>
                <SelectItem value="intermediate">Mittelstufe</SelectItem>
                <SelectItem value="advanced">Fortgeschritten</SelectItem>
                <SelectItem value="expert">Experte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Skills-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamte Skills</p>
                <p className="text-2xl font-bold">
                  {employees.reduce((acc, emp) => acc + emp.skills.length, 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Experten-Skills</p>
                <p className="text-2xl font-bold">
                  {employees.reduce((acc, emp) => 
                    acc + emp.skills.filter(skill => skill.level === 'expert').length, 0
                  )}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ø Verfügbarkeit</p>
                <p className="text-2xl font-bold">
                  {Math.round(employees.reduce((acc, emp) => acc + emp.availability, 0) / employees.length)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Mitarbeiter</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mitarbeiter-Skills Matrix */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Mitarbeiter & Skills</CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Skill hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.position} • {employee.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getAvailabilityColor(employee.availability)}`}>
                      {employee.availability}% verfügbar
                    </p>
                    <p className="text-xs text-gray-500">
                      {employee.currentProjects} aktive Projekte
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2 bg-white border rounded-lg p-2 hover:shadow-sm">
                        <Badge className={getSkillLevelColor(skill.level)}>
                          {getSkillLevelLabel(skill.level)}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{skill.name}</span>
                            {skill.verified && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={skill.confidence} className="h-1 flex-1" />
                            <span className="text-xs text-gray-500">{skill.confidence}%</span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>{skill.projectsUsed} Projekte</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
