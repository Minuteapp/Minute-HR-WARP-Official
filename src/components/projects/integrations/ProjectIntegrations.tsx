
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  enabled: boolean;
  icon: string;
}

interface ProjectIntegrationsProps {
  projectId: string;
}

export const ProjectIntegrations: React.FC<ProjectIntegrationsProps> = ({ projectId }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: 'Code-Repository und Issue-Tracking',
      status: 'connected',
      enabled: true,
      icon: '🐙'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team-Kommunikation und Benachrichtigungen',
      status: 'connected',
      enabled: true,
      icon: '💬'
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Aufgaben- und Sprint-Management',
      status: 'disconnected',
      enabled: false,
      icon: '📋'
    },
    {
      id: 'figma',
      name: 'Figma',
      description: 'Design-Dateien und Prototypen',
      status: 'error',
      enabled: false,
      icon: '🎨'
    }
  ]);

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Verbunden';
      case 'error':
        return 'Fehler';
      default:
        return 'Getrennt';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Projekt-Integrationen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{integration.name}</h4>
                    {getStatusIcon(integration.status)}
                  </div>
                  <p className="text-sm text-gray-600">{integration.description}</p>
                  <Badge className={getStatusColor(integration.status)}>
                    {getStatusLabel(integration.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Switch
                  checked={integration.enabled}
                  onCheckedChange={() => toggleIntegration(integration.id)}
                  disabled={integration.status === 'disconnected'}
                />
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button variant="outline" className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Neue Integration hinzufügen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
