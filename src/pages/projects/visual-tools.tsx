import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Map, GitBranch, Brain, Folder } from "lucide-react";
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { SiteMapTab } from '@/components/projects/details/visual-tools/SiteMapTab';
import { UserFlowTab } from '@/components/projects/details/visual-tools/UserFlowTab';
import { MindMapTab } from '@/components/projects/details/visual-tools/MindMapTab';


const VisualToolsPage = () => {
  const [activeTab, setActiveTab] = useState('sitemap');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Projekt-Daten werden aus der Datenbank geladen
  const demoProject = {
    id: '',
    name: '',
    description: ''
  };

  const tools = [
    {
      id: 'sitemap',
      title: 'Site Map',
      icon: Map,
      description: 'Erstellen Sie visuelle Seitenstrukturen und Hierarchien',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'userflow',
      title: 'User Flow',
      icon: GitBranch,
      description: 'Designen Sie Benutzerflüsse und Interaktionspfade',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'mindmap',
      title: 'Mind Map',
      icon: Brain,
      description: 'Organisieren Sie Ideen und Konzepte visuell',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'sitemap':
        return <SiteMapTab project={demoProject} />;
      case 'userflow':
        return <UserFlowTab project={demoProject} />;
      case 'mindmap':
        return <MindMapTab project={demoProject} />;
      default:
        return <SiteMapTab project={demoProject} />;
    }
  };

  return (
    <StandardPageLayout
      title="Visuelle Projekttools"
      subtitle="Erstellen Sie Site Maps, User Flows und Mind Maps für Ihre Projekte"
    >
      <div className="space-y-6">
        {/* Aktions-Header */}
        <div className="flex justify-between items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 mr-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={activeTab === tool.id ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center gap-2 ${
                    activeTab === tool.id ? '' : 'hover:bg-muted'
                  }`}
                  onClick={() => setActiveTab(tool.id)}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === tool.id ? 'bg-primary-foreground/20' : tool.bgColor
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      activeTab === tool.id ? 'text-primary-foreground' : tool.color
                    }`} />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{tool.title}</div>
                    <div className={`text-xs ${
                      activeTab === tool.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      {tool.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
          <Button onClick={() => window.location.href = '/projects/list'}>
            <Plus className="mr-2 h-4 w-4" />
            Alle Projekte
          </Button>
        </div>

        {/* Tool Content */}
        <div className="min-h-96">
          {renderActiveTab()}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-blue-600" />
                Site Map Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Drag & Drop Hierarchien</li>
                <li>• Export als PNG/SVG/PDF</li>
                <li>• Kollaboratives Bearbeiten</li>
                <li>• Kommentarfunktion</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-green-600" />
                User Flow Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Start-/Endpunkte</li>
                <li>• Entscheidungslogik</li>
                <li>• KI-gestützte UX-Analyse</li>
                <li>• Template-Bibliothek</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Mind Map Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Freie Ideenstrukturierung</li>
                <li>• KI-Vorschläge</li>
                <li>• Task-Verknüpfungen</li>
                <li>• Fokus-Modus</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default VisualToolsPage;