import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Calendar, Clock, Users, FileText, BarChart3, Briefcase, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModulesStepProps {
  onNext: () => void;
  onBack: () => void;
}

const CORE_MODULES = [
  {
    key: 'time-tracking',
    name: 'Zeiterfassung',
    description: 'Arbeitszeiten erfassen und auswerten',
    icon: Clock,
    settingsLink: '/settings/time',
  },
  {
    key: 'absence',
    name: 'Abwesenheit',
    description: 'Urlaub, Krankheit und andere Abwesenheiten',
    icon: Calendar,
    settingsLink: '/settings/absence',
  },
  {
    key: 'employees',
    name: 'Mitarbeiterverwaltung',
    description: 'Mitarbeiterdaten und Stammdaten',
    icon: Users,
    settingsLink: '/settings/company',
  },
  {
    key: 'documents',
    name: 'Dokumente',
    description: 'Verträge, Bescheinigungen und Dokumente',
    icon: FileText,
    settingsLink: '/settings/documents',
  },
  {
    key: 'reports',
    name: 'Berichte',
    description: 'Auswertungen und Statistiken',
    icon: BarChart3,
    settingsLink: '/reports',
  },
  {
    key: 'shift-planning',
    name: 'Schichtplanung',
    description: 'Schichten planen und verwalten',
    icon: Briefcase,
    settingsLink: '/settings/shift-planning',
  },
];

export const ModulesStep = ({ onNext, onBack }: ModulesStepProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Module konfigurieren</h2>
        <p className="text-muted-foreground mt-2">
          Passen Sie die Module an Ihre Bedürfnisse an.
        </p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CORE_MODULES.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card 
              key={module.key}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate(module.settingsLink)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{module.name}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <CardDescription className="text-center">
            <strong>Hinweis:</strong> Alle Module sind bereits aktiviert. Klicken Sie auf ein Modul, 
            um dessen Einstellungen anzupassen. Sie können die Einstellungen jederzeit über das 
            Einstellungsmenü ändern.
          </CardDescription>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Zurück
        </Button>
        <Button onClick={onNext}>
          Setup abschließen
        </Button>
      </div>
    </div>
  );
};
