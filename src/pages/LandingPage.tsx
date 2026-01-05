import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Code, 
  Database, 
  Github, 
  Play, 
  Settings, 
  Check, 
  Clock,
  AlertTriangle,
  Zap,
  Download,
  Cloud,
  Monitor,
  Users,
  Cpu,
  TestTube
} from 'lucide-react';

export default function LandingPage() {
  const [projectIdea, setProjectIdea] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAgents, setShowAgents] = useState(false);

  const agents = [
    { id: 1, name: 'Frontend Agent', type: 'React/TypeScript', status: 'working', progress: 75, icon: Code },
    { id: 2, name: 'Backend Agent', type: 'Node.js/Express', status: 'completed', progress: 100, icon: Database },
    { id: 3, name: 'API Agent', type: 'Integration', status: 'waiting', progress: 0, icon: Settings },
    { id: 4, name: 'Test Agent', type: 'Quality Assurance', status: 'working', progress: 45, icon: TestTube },
    { id: 5, name: 'Optimization Agent', type: 'Performance', status: 'waiting', progress: 0, icon: Zap }
  ];

  const tasks = [
    { id: 1, title: 'UI Design erstellen', status: 'completed', assignee: 'Frontend Agent' },
    { id: 2, title: 'Datenbank Schema', status: 'working', assignee: 'Backend Agent' },
    { id: 3, title: 'API Endpoints', status: 'waiting', assignee: 'API Agent' },
    { id: 4, title: 'Unit Tests', status: 'working', assignee: 'Test Agent' }
  ];

  const handleAnalyzeIdea = () => {
    if (!projectIdea.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAgents(true);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'working': return 'bg-blue-500';
      case 'waiting': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return Check;
      case 'working': return Clock;
      case 'waiting': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/109213da-2fd7-4b1e-b340-3e4b70a942a2.png" 
                alt="MINUTE Logo" 
                className="h-8"
              />
            </div>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Zur HR-Software
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            KI-gestützte Software-Entwicklung
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Verwandeln Sie Ihre Idee in wenigen Minuten in eine vollständige Software-Lösung. 
            Unsere KI-Agenten arbeiten rund um die Uhr für Sie.
          </p>
        </div>

        {/* Project Idea Input */}
        <Card className="mb-8 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Projektidee eingeben</CardTitle>
            <CardDescription>
              Beschreiben Sie Ihre Software-Idee und lassen Sie unsere KI-Agenten den Rest erledigen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Beispiel: Ich möchte ein Social Media-Netzwerk mit Chat-Funktion erstellen..."
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                className="min-h-[100px] border-blue-200 focus:border-blue-500"
              />
              <Button 
                onClick={handleAnalyzeIdea}
                disabled={isAnalyzing || !projectIdea.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Analysiere Idee...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Projekt starten
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showAgents && (
          <>
            {/* Agents Overview */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center">
                    <Bot className="mr-2 h-5 w-5" />
                    KI-Agenten Status
                  </CardTitle>
                  <CardDescription>
                    Überwachen Sie Ihre KI-Agenten in Echtzeit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {agents.map((agent) => {
                    const IconComponent = agent.icon;
                    const StatusIcon = getStatusIcon(agent.status);
                    
                    return (
                      <div key={agent.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{agent.name}</p>
                            <p className="text-sm text-gray-500">{agent.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(agent.status)}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {agent.status}
                          </Badge>
                          <div className="w-20">
                            <Progress value={agent.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Aufgaben & Status
                  </CardTitle>
                  <CardDescription>
                    Verfolgen Sie den Fortschritt Ihrer Aufgaben
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tasks.map((task) => {
                    const StatusIcon = getStatusIcon(task.status);
                    
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-500">Zugewiesen an: {task.assignee}</p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {task.status}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Live Preview & Feedback */}
            <Card className="mb-8 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center">
                  <Monitor className="mr-2 h-5 w-5" />
                  Live-Vorschau & Feedback
                </CardTitle>
                <CardDescription>
                  Sehen Sie Ihre Software in Echtzeit entstehen und geben Sie direktes Feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-6 mb-4 min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Live-Vorschau wird geladen...</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="border-blue-600 text-blue-600">
                    UI ändern
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-600 text-blue-600">
                    Backend anpassen
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-600 text-blue-600">
                    API hinzufügen
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-600 text-blue-600">
                    Feedback geben
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Integration Options */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center text-sm">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    GitHub verbinden
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center text-sm">
                    <Database className="mr-2 h-4 w-4" />
                    Datenbank
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Datenbank verbinden
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center text-sm">
                    <Settings className="mr-2 h-4 w-4" />
                    API Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    APIs integrieren
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Deployment Options */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center">
                  <Cloud className="mr-2 h-5 w-5" />
                  Software bereitstellen
                </CardTitle>
                <CardDescription>
                  Stellen Sie Ihre fertige Software in der gewünschten Umgebung bereit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="border-blue-600 text-blue-600 flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    ZIP Download
                  </Button>
                  <Button variant="outline" className="border-blue-600 text-blue-600 flex items-center">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub Export
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center">
                    <Cloud className="mr-2 h-4 w-4" />
                    Cloud Deploy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}