import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2 } from 'lucide-react';
import IntegrationRow from './IntegrationRow';

interface Integration {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

const integrations: Integration[] = [
  {
    id: 'int-1',
    name: 'Roadmap Modul',
    description: 'Synchronisierung strategischer Initiativen',
    isActive: true
  },
  {
    id: 'int-2',
    name: 'Aufgaben Modul',
    description: 'Bidirektionale Task-Synchronisation',
    isActive: true
  },
  {
    id: 'int-3',
    name: 'Workforce Planning',
    description: 'Ressourcen- und Kapazitätsplanung',
    isActive: true
  },
  {
    id: 'int-4',
    name: 'Budget & Forecast',
    description: 'Finanzplanung und Controlling',
    isActive: true
  },
  {
    id: 'int-5',
    name: 'Zeiterfassung',
    description: 'Projekt-Zeiterfassung',
    isActive: false
  }
];

const IntegrationsSection = () => {
  const handleConfigure = (id: string) => {
    console.log('Configure integration:', id);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Integrationen
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Verbindungen zu anderen Minute HR-Modulen
        </p>
      </CardHeader>
      <CardContent>
        {integrations.map(integration => (
          <IntegrationRow
            key={integration.id}
            name={integration.name}
            description={integration.description}
            isActive={integration.isActive}
            onConfigure={() => handleConfigure(integration.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default IntegrationsSection;
