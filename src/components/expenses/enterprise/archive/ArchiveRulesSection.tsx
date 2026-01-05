
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Lock, FileText, Trash2 } from 'lucide-react';
import ArchiveRuleItem from './ArchiveRuleItem';

const archiveRules = [
  {
    icon: Calendar,
    title: 'Automatische Archivierung',
    description: 'Ausgaben werden 30 Tage nach Abschluss der Buchungsperiode automatisch archiviert'
  },
  {
    icon: Lock,
    title: 'Verschlüsselte Speicherung',
    description: 'Archivierte Daten werden verschlüsselt und können nicht mehr bearbeitet werden'
  },
  {
    icon: FileText,
    title: 'Revisionssicher',
    description: 'Alle Änderungen werden protokolliert und sind für Prüfungen nachvollziehbar'
  },
  {
    icon: Trash2,
    title: 'Automatische Löschung',
    description: 'Nach Ablauf der 10-jährigen Aufbewahrungsfrist werden Daten automatisch und unwiderruflich gelöscht'
  }
];

const ArchiveRulesSection = () => {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Archivierungsregeln
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {archiveRules.map((rule, index) => (
            <ArchiveRuleItem
              key={index}
              icon={rule.icon}
              title={rule.title}
              description={rule.description}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchiveRulesSection;
