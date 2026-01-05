
import { Card, CardContent } from '@/components/ui/card';
import { Archive, Lock, FileText, Trash2 } from 'lucide-react';

const DigitalArchivingInfo = () => {
  const bulletPoints = [
    {
      icon: Lock,
      text: 'Verschlüsselte Speicherung nach Buchungsperioden-Abschluss'
    },
    {
      icon: FileText,
      text: 'Belege und Metadaten werden revisionssicher archiviert'
    },
    {
      icon: Trash2,
      text: 'Automatische Löschung nach Ablauf der Aufbewahrungsfrist'
    }
  ];

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
            <Archive className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">Digitale Archivierung</h3>
            <p className="text-muted-foreground mt-2">
              Alle Ausgaben werden automatisch digital archiviert und für die gesetzlich vorgeschriebene 
              Aufbewahrungsfrist von <strong className="text-foreground">10 Jahren</strong> gespeichert. 
              Die Archivierung erfolgt revisionssicher und entspricht den Anforderungen der GoBD.
            </p>
            <div className="mt-4 space-y-2">
              {bulletPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <point.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{point.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DigitalArchivingInfo;
